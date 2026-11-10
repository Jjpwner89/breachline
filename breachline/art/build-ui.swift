// Makes the game-sized interface images in web/ui/ from the paintings in ui/. Rerun after replacing any of them:
//   swift art/build-ui.swift [source folder] [output folder]
// Defaults to art/ui and art/web/ui next to this script. A painting that isn't there yet is skipped.
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let here = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
let args = CommandLine.arguments
let src = args.count > 1 ? URL(fileURLWithPath: args[1]) : here.appendingPathComponent("ui")
let dst = args.count > 2 ? URL(fileURLWithPath: args[2]) : here.appendingPathComponent("web/ui")
try? FileManager.default.createDirectory(at: dst, withIntermediateDirectories: true)

// An RGBA bitmap we can read and write pixel by pixel.
struct Bitmap {
  var w: Int, h: Int, px: [UInt8]
  init(w: Int, h: Int) { self.w = w; self.h = h; px = [UInt8](repeating: 0, count: w * h * 4) }
  init?(_ url: URL) {
    guard let s = CGImageSourceCreateWithURL(url as CFURL, nil), let img = CGImageSourceCreateImageAtIndex(s, 0, nil) else { return nil }
    self.init(w: img.width, h: img.height)
    draw(img, into: &self, x: 0, y: 0, w: w, h: h)
  }
  func cg() -> CGImage {
    let data = CFDataCreate(nil, px, px.count)!
    return CGImage(width: w, height: h, bitsPerComponent: 8, bitsPerPixel: 32, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
                   bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue), provider: CGDataProvider(data: data)!,
                   decode: nil, shouldInterpolate: true, intent: .defaultIntent)!
  }
  func alpha(_ x: Int, _ y: Int) -> UInt8 { px[(y * w + x) * 4 + 3] }
}

func draw(_ img: CGImage, into b: inout Bitmap, x: Int, y: Int, w: Int, h: Int) {
  let bw = b.w, bh = b.h
  b.px.withUnsafeMutableBytes { buf in
    let ctx = CGContext(data: buf.baseAddress, width: bw, height: bh, bitsPerComponent: 8, bytesPerRow: bw * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    ctx.interpolationQuality = .high
    ctx.draw(img, in: CGRect(x: x, y: bh - y - h, width: w, height: h))
  }
}

func crop(_ b: Bitmap, _ x: Int, _ y: Int, _ w: Int, _ h: Int) -> Bitmap {
  var o = Bitmap(w: w, h: h)
  for row in 0..<h { for i in 0..<(w * 4) { o.px[row * w * 4 + i] = b.px[((y + row) * b.w + x) * 4 + i] } }
  return o
}

func resize(_ b: Bitmap, width: Int) -> Bitmap {
  if width >= b.w { return b }
  let h = Int((Double(b.h) * Double(width) / Double(b.w)).rounded())
  var o = Bitmap(w: width, h: h); draw(b.cg(), into: &o, x: 0, y: 0, w: width, h: h); return o
}

// The smallest box holding everything visible, plus a little margin.
func trim(_ b: Bitmap, pad: Int = 4) -> Bitmap {
  var x0 = b.w, y0 = b.h, x1 = 0, y1 = 0
  for y in 0..<b.h { for x in 0..<b.w where b.alpha(x, y) > 16 { x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y) } }
  if x1 < x0 { return b }
  x0 = max(0, x0 - pad); y0 = max(0, y0 - pad); x1 = min(b.w - 1, x1 + pad); y1 = min(b.h - 1, y1 + pad)
  return crop(b, x0, y0, x1 - x0 + 1, y1 - y0 + 1)
}

// Cross-fades the right edge into the left so the image repeats sideways without a seam.
func tileSideways(_ b: Bitmap, band: Int) -> Bitmap {
  let w = b.w - band
  var o = crop(b, 0, 0, w, b.h)
  for y in 0..<b.h {
    for x in 0..<band {
      let t = Double(x) / Double(band)
      for c in 0..<4 {
        let a = Double(b.px[(y * b.w + x + w) * 4 + c]), z = Double(b.px[(y * b.w + x) * 4 + c])
        o.px[(y * w + x) * 4 + c] = UInt8((a * (1 - t) + z * t).rounded())
      }
    }
  }
  return o
}

func save(_ b: Bitmap, _ name: String, jpeg: Double? = nil) {
  let url = dst.appendingPathComponent(name)
  let type = (jpeg != nil ? UTType.jpeg : UTType.png).identifier as CFString
  let d = CGImageDestinationCreateWithURL(url as CFURL, type, 1, nil)!
  var opts: [CFString: Any] = [:]
  if let q = jpeg { opts[kCGImageDestinationLossyCompressionQuality] = q }
  CGImageDestinationAddImage(d, b.cg(), opts as CFDictionary)
  CGImageDestinationFinalize(d)
  let size = (try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? Int) ?? 0
  print("\(name)  \(b.w) x \(b.h)  \(size / 1024) KB")
}

func load(_ name: String) -> Bitmap? {
  let url = src.appendingPathComponent(name + ".png")
  guard let b = Bitmap(url) else { print("skipped \(name): not there yet"); return nil }
  return b
}

if let b = load("ui-table-oak") { save(resize(tileSideways(b, band: 200), width: 1400), "oak.jpg", jpeg: 0.8) }
// The linen's painted wood margin is cropped off, leaving the tacks at its edge.
if let b = load("ui-table-linen-map") { let m = Int(Double(b.w) * 0.016), n = Int(Double(b.h) * 0.016); save(resize(crop(b, m, n, b.w - 2 * m, b.h - 2 * n), width: 1600), "linen.jpg", jpeg: 0.8) }
if let b = load("ui-home-battlefield") { save(resize(b, width: 1920), "battlefield.jpg", jpeg: 0.82) }
if let b = load("ui-home-strand") { save(resize(b, width: 1536), "strand.jpg", jpeg: 0.86) }
if let b = load("ui-card-paper") { save(resize(b, width: 700), "paper.jpg", jpeg: 0.8) }
if let b = load("ui-titlebar-crimson") { save(resize(b, width: 900), "titlebar.jpg", jpeg: 0.8) }
if let b = load("ui-frame-iron") { save(resize(trim(b, pad: 0), width: 640), "frame.png") }
if let b = load("ui-cost-coin") { save(resize(trim(b), width: 160), "coin.png") }
if let b = load("ui-medallion-iron") { save(resize(trim(b), width: 160), "medallion.png") }
if let b = load("ui-panel-parchment") { save(resize(trim(b), width: 720), "panel.png") }
// One sheet holds both buttons: the brass-rimmed one above, the gilded one below.
if let b = load("ui-buttons-wood") {
  save(resize(trim(crop(b, 0, 0, b.w, b.h / 2)), width: 520), "button.png")
  save(resize(trim(crop(b, 0, b.h / 2, b.w, b.h / 2)), width: 520), "button-main.png")
}
// Arrived later in the batch; each is used as soon as it exists.
if let b = load("ui-mana-gems") { let cw = b.w / 6; for (i, c) in ["W", "U", "B", "R", "G", "N"].enumerated() { save(resize(trim(crop(b, i * cw, 0, cw, b.h)), width: 72), "gem-\(c).png") } }
if let b = load("ui-turn-banner") { save(resize(trim(b), width: 1200), "banner.png") }
if let b = load("ui-card-back") { save(resize(b, width: 520), "card-back.jpg", jpeg: 0.82) }
if let b = load("ui-stat-plaques") {
  save(resize(trim(crop(b, 0, 0, b.w / 2, b.h)), width: 120), "plaque-attack.png")
  save(resize(trim(crop(b, b.w / 2, 0, b.w / 2, b.h)), width: 120), "plaque-health.png")
}
// Four props in a 2 by 2 grid: ring weight, candle, inkwell, stone weight.
if let b = load("ui-table-props") { let cw = b.w / 2, ch = b.h / 2; for i in 0..<4 { save(resize(trim(crop(b, (i % 2) * cw, (i / 2) * ch, cw, ch)), width: 200), "prop-\(i + 1).png") } }
// Tile effects, briefed in TILE_ART_BRIEFS.md. Each painting fills an empty tile and frames a unit's tile, so it keeps its whole rectangle untrimmed.
let tileKinds = ["burn", "frost", "thorns", "blight", "holy", "snare", "charge"]
for k in tileKinds { if let b = load("ui-tile-\(k)") { save(resize(b, width: 480), "tile-\(k).png") } }
// Seven counter emblems in a row, in the same order as tileKinds.
if let b = load("ui-tile-emblems") { let cw = b.w / 7; for (i, k) in tileKinds.enumerated() { save(resize(trim(crop(b, i * cw, 0, cw, b.h)), width: 64), "emblem-\(k).png") } }

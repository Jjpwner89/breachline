---
name: rts-test-ports
description: RTS sessions each serve test copies on localhost ports; check a port is free (and yours) before loading it
metadata:
  node_type: memory
  type: feedback
  originSessionId: 3bdc2d65-ebf8-432b-b0df-f26d220c31be
  modified: 2026-11-21T06:24:14.395Z
---

Several RTS sessions run `python3 -m http.server` on nearby ports (8811, 8813 and others were taken by other sessions on 2026-11-21). A port that answers may be another session's copy: loading it runs their code and writes to their origin's localStorage (audio mute, the rts.campaign.test slot).

**Why:** a vassals session loaded another session's 8813 page twice and flipped its mute before noticing its own server had failed with "Address already in use".

**How to apply:** before serving, pick a port `lsof -nP -iTCP:<port> -sTCP:LISTEN` shows free; after starting, confirm the listener's cwd is your own clone; never kill a server you didn't start. Mute and save rules still apply: [[rts-project]], [[browser-checks-silent]].

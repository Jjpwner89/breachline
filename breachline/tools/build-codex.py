# Builds codex-entries.js, the lore codex book's text, from LORE_CODEX.md. Rerun whenever the entries change:
#   python3 tools/build-codex.py [path/to/LORE_CODEX.md]
# Each "###" heading is a chapter and each "#### L<n> · Title" an entry; L0 is the compiler's note at the front of the book.
# An entry's "*Art: ...*" line names a card (its painting is found by name in the game) or one of the paintings in PLATES.
# Everything from a heading starting "New details" on is notes for the creator, not book text.
import html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'LORE_CODEX.md')
OUT = os.path.join(HERE, '..', 'codex-entries.js')

# Art that isn't a card painting, by the name the entry gives it.
PLATES = {
    'saint maren of the long watch': 'art/web/saint-maren.jpg',
    'alderkin waterkeeper (concept)': 'art/web/alderkin-waterkeeper.jpg',
    'glimmerfolk final reference': 'art/web/ui/codex/plates/glimmerfolk-final.jpg',
    'moor folk final lineup': 'art/web/ui/codex/plates/moor-folk-final-lineup.jpg',
    'banded folk working reference': 'art/web/ui/codex/plates/banded-folk-final.jpg',
    'crest folk working reference': 'art/web/ui/codex/plates/crest-folk-final.jpg',
    'greyhides working reference': 'art/web/ui/codex/plates/greyhides-final.jpg',
    'mending the hood': 'art/web/ui/codex/plates/mending-the-hood.jpg',
    'the last boat up': 'art/web/ui/codex/plates/the-last-boat-up.jpg',
}

def inline(text):
    t = html.escape(text, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'\*(.+?)\*', r'<i>\1</i>', t)
    return t

def block(par):
    # A paragraph that is only a quote and its credit is set apart; anything else is running text.
    m = re.match(r'^\*(["“].+["”])\*\s*[—–-]\s*(.+)$', par)
    if m: return {'q': inline(m.group(1)), 'by': inline(m.group(2))}
    return {'p': inline(par)}

def parse(src):
    lines = open(src, encoding='utf-8').read().split('\n')
    book = {'note': None, 'chapters': []}
    chapter, entry, par, started = None, None, [], False
    def flush():
        if par and entry is not None: entry['blocks'].append(block(' '.join(par)))
        par.clear()
    for line in lines:
        if line.startswith('## Batch'): started = True; continue
        if not started: continue
        h3 = re.match(r'^### (.+)$', line)
        h4 = re.match(r'^#### (L\d+) · (.+)$', line)
        if h3:
            flush()
            if h3.group(1).startswith('New details'): break
            chapter = {'title': h3.group(1).strip(), 'entries': []}; book['chapters'].append(chapter); entry = None
        elif h4:
            flush()
            entry = {'id': h4.group(1), 'title': h4.group(2).strip(), 'art': None, 'blocks': []}
            if h4.group(1) == 'L0': book['note'] = entry
            elif chapter: chapter['entries'].append(entry)
        elif entry is not None and re.match(r'^\*Art: (.+)\*$', line):
            label = re.match(r'^\*Art: (.+)\*$', line).group(1).strip()
            if not label.lower().startswith(('to pick', 'none')):
                entry['art'] = {'plate': PLATES[label.lower()]} if label.lower() in PLATES else {'card': label}
        elif line.startswith('## '): flush(); break
        elif not line.strip(): flush()
        elif entry is not None: par.append(line.strip())
    flush()
    return book

book = parse(SRC)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write('// The lore codex book\'s text, built from LORE_CODEX.md by tools/build-codex.py. Edit the entries there, not here.\n')
    f.write('var CODEX_ENTRIES = ' + json.dumps(book, ensure_ascii=False, indent=1) + ';\n')
n = sum(len(c['entries']) for c in book['chapters'])
print('%d chapters, %d entries%s' % (len(book['chapters']), n, ', and the compiler\'s note' if book['note'] else ''))
for c in book['chapters']: print('  %s: %s' % (c['title'], ', '.join(e['title'] for e in c['entries'])))

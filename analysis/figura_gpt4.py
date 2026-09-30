# /// script
# requires-python = ">=3.12"
# dependencies = ["pymupdf>=1.24"]
# ///
"""pt-BR lyrics explainer, block 01.1: GPT-4's TikZ unicorns (Fig. 1.3 of "Sparks of Artificial General
Intelligence", Bubeck et al., 2023, arXiv:2303.12712).

The figure is not ours and stays out of the repository (see "Imagens de fora" in
docs/letra-explicada-pt-br/ROTEIRO.md). This script downloads the paper from arXiv and extracts the figure
from its PDF, where the three unicorns are vector paths (GPT-4's TikZ, as typeset), into
app/src/letra/external/sparks-fig-1-3.json (git-ignored). The explainer draws it when the file is there, and a
marked placeholder when it is not (the file is picked up when the app is built: restart the preview after
running this).

  uv run analysis/figura_gpt4.py
"""
import json
import pathlib
import urllib.request

import pymupdf

ROOT = pathlib.Path(__file__).resolve().parent.parent
PDF_URL = 'https://arxiv.org/pdf/2303.12712v5'
PDF = ROOT / 'analysis' / 'work' / 'sparks-of-agi-v5.pdf'
OUT = ROOT / 'app' / 'src' / 'letra' / 'external' / 'sparks-fig-1-3.json'
PAGE = 7  # (1-based) the page with Figure 1.3


def main():
    if not PDF.exists():
        PDF.parent.mkdir(parents=True, exist_ok=True)
        print(f'downloading {PDF_URL}')
        urllib.request.urlretrieve(PDF_URL, PDF)
    page = pymupdf.open(PDF)[PAGE - 1]
    caption = next(b for b in page.get_text('blocks') if b[4].startswith('Figure 1.3'))
    # the drawings above the caption are the figure
    drawings = [d for d in page.get_drawings() if d['rect'].y1 <= caption[1] + 1 and (d.get('fill') or d.get('color'))]
    if not drawings:
        raise SystemExit('Figure 1.3 not found: the PDF changed?')
    x0 = min(d['rect'].x0 for d in drawings); y0 = min(d['rect'].y0 for d in drawings)
    x1 = max(d['rect'].x1 for d in drawings); y1 = max(d['rect'].y1 for d in drawings)
    r = lambda v: round(v, 2)
    pt = lambda p: [r(p.x - x0), r(p.y - y0)]
    paths = []
    for d in drawings:
        cmds, cur = [], None
        for it in d['items']:
            op = it[0]
            if op == 're':
                q = it[1]
                cmds += [['M', *pt(q.tl)], ['L', *pt(q.tr)], ['L', *pt(q.br)], ['L', *pt(q.bl)], ['Z']]
                cur = None
                continue
            if op == 'qu':
                q = it[1]
                cmds += [['M', *pt(q.ul)], ['L', *pt(q.ur)], ['L', *pt(q.lr)], ['L', *pt(q.ll)], ['Z']]
                cur = None
                continue
            start = it[1]
            if cur is None or abs(cur.x - start.x) > 1e-3 or abs(cur.y - start.y) > 1e-3:
                cmds.append(['M', *pt(start)])
            if op == 'l':
                cmds.append(['L', *pt(it[2])]); cur = it[2]
            elif op == 'c':
                cmds.append(['C', *pt(it[2]), *pt(it[3]), *pt(it[4])]); cur = it[4]
        if d.get('closePath'):
            cmds.append(['Z'])
        rc = d['rect']
        paths.append({
            'fill': [r(v) for v in d['fill']] if d.get('fill') else None,
            'stroke': [r(v) for v in d['color']] if d.get('color') else None,
            'width': r(d.get('width') or 0),
            'evenOdd': bool(d.get('even_odd')),
            'box': [r(rc.x0 - x0), r(rc.y0 - y0), r(rc.x1 - x0), r(rc.y1 - y0)],
            'd': cmds,
        })
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        'source': 'Bubeck et al., "Sparks of Artificial General Intelligence: Early experiments with GPT-4", arXiv:2303.12712v5, Figure 1.3',
        'size': [r(x1 - x0), r(y1 - y0)],
        'paths': paths,
    }, ensure_ascii=False), encoding='utf-8')
    print(f'{len(paths)} paths, {r(x1 - x0)} x {r(y1 - y0)} pt -> {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()

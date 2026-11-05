#!/usr/bin/env python3
"""Contrôle du site en ligne par rapport au paquet v7.
Usage (depuis le dossier obm-system-v7/) : python3 serveur/verifier-en-ligne.py   [ou : python3 serveur/verifier-en-ligne.py chemin/vers/site]
Sortie : un tableau OK / !! par contrôle, puis la liste des pages qui diffèrent du paquet."""
import hashlib
import json
import pathlib
import re
import subprocess
import sys

PKG = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent / 'site'
BASE = 'https://obm-system.com'
# Pages réécrites par le back-office : on accepte des écarts de gabarit, on contrôle seulement l'essentiel
BACKOFFICE = re.compile(r'^(blog/|cas-clients/|index\.html$)')


def get(url, head=False):
    args = ['curl', '-s', '-L', '--max-time', '25', '-w', '\n%{http_code}']
    if head:
        args = ['curl', '-s', '-I', '--max-time', '25', url]
        return subprocess.run(args, capture_output=True, text=True).stdout
    out = subprocess.run(args + [url], capture_output=True).stdout.decode('utf-8', 'replace')
    body, _, code = out.rpartition('\n')
    return body, code.strip()


def norm(h):
    h = re.sub(r'\s+', ' ', h)
    return h.strip()


results = []


def check(label, ok, detail=''):
    results.append((ok, label, detail))


# 1. Pages HTML
diff_pages, same = [], 0
for f in sorted(PKG.rglob('index.html')):
    rel = f.relative_to(PKG).as_posix()
    url = BASE + '/' + rel[:-len('index.html')]
    body, code = get(url)
    if code != '200':
        check(f'HTTP {url}', False, code)
        continue
    expected = f.read_text(encoding='utf-8')
    if norm(body) == norm(expected):
        same += 1
        continue
    essentials = all(s in body for s in ['site.css?v=7', 'site.js?v=7', 'G-JGDV0VS9B9'])
    gtm = 'GTM-TTPCSLV9' in body
    diff_pages.append((rel, 'gabarit back-office' if BACKOFFICE.match(rel) else 'DIFFÉRENT DU PAQUET', essentials, gtm))
check('Pages identiques au paquet', same > 0, f'{same} pages identiques, {len(diff_pages)} différentes')
for rel, kind, essentials, gtm in diff_pages:
    check(f'  {rel} ({kind})', essentials and not gtm and kind != 'DIFFÉRENT DU PAQUET',
          ('v7 ok' if essentials else 'v7 absente') + (' · GTM vide encore présent' if gtm else ''))

# 2. Fichiers statiques
for path in ['assets/css/site.css', 'assets/js/site.js', 'blog/feed.xml', 'llms.txt', 'sitemap.xml',
             'e48c30133e89edf66822bbebc5640e7b.txt', '.well-known/security.txt', 'manifest.webmanifest']:
    body, code = get(f'{BASE}/{path}?v=7' if path.startswith('assets/') else f'{BASE}/{path}')
    local = (PKG / path).read_text(encoding='utf-8')
    check(f'Fichier {path}', code == '200' and norm(body) == norm(local), code)
js, _ = get(f'{BASE}/assets/js/site.js?v=7')
check('Aucune clé API dans site.js', 'apikey' not in js.lower() and '1b5bb9' not in js)

# 3. Images de partage
for img in ['assets/img/og/og-cerafas.jpg', 'assets/uploads/og-ga4-6-reglages-mvzabpln.jpg']:
    _, code = get(f'{BASE}/{img}')
    check(f'Image {img}', code == '200', code)

# 4. Serveur (nginx)
for old in ['cas-clients/cabinet-facettes-rabat/', 'cas-clients/cabinet-implants-casablanca/']:
    _, code = get(f'{BASE}/{old}')
    check(f'410 sur /{old}', code == '410', code)
hdr = get(f'{BASE}/llms.txt', head=True)
check('llms.txt en UTF-8 déclaré', 'charset=utf-8' in hdr.lower())
hdr = get(f'{BASE}/', head=True)
check('Un seul en-tête Cache-Control', len(re.findall(r'(?im)^cache-control:', hdr)) == 1)
check('CSP active (bloquante)', re.search(r'(?im)^content-security-policy:', hdr) is not None,
      'encore en Report-Only' if 'content-security-policy-report-only' in hdr.lower() else '')
red = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code} %{redirect_url}', '--max-time', '20',
                      f'{BASE}/services/index.html'], capture_output=True, text=True).stdout
check('/index.html redirigé en 301', red.startswith('301'), red)
api = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', '-X', 'GET',
                      f'{BASE}/api/lead'], capture_output=True, text=True).stdout
check('Proxy /api/lead en place (GET refusé)', api in ('403', '405'), api)

# 5. DNS e-mail
for name, needle in [('obm-system.com', 'v=spf1 include:_spf.google.com'), ('google._domainkey.obm-system.com', 'v=DKIM1'),
                     ('_dmarc.obm-system.com', 'v=DMARC1')]:
    body, _ = get(f'https://dns.google/resolve?name={name}&type=TXT')
    try:
        data = ' '.join(a['data'] for a in json.loads(body).get('Answer', []))
    except Exception:
        data = ''
    check(f'DNS {name}', needle in data)

ok = sum(1 for r in results if r[0])
for good, label, detail in results:
    print(('OK  ' if good else '!!  ') + label + (f'  [{detail}]' if detail else ''))
print(f'\n{ok}/{len(results)} contrôles OK')

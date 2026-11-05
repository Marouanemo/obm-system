#!/usr/bin/env python3
"""Contrôle du site en ligne par rapport au paquet v8.
Usage (depuis le dossier obm-system-v8/) : python3 serveur/verifier-en-ligne.py /root/obm-v8-reference/site
(copie datée écrite par deployer-v8.sh ; sans argument : le dossier site/ du paquet, dates non remplacées)
Sortie : un tableau OK / !! par contrôle, puis la liste des pages qui diffèrent du paquet."""
import hashlib
import json
import pathlib
import re
import subprocess
import sys

PKG = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent
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
SIGN_OK = 'Designed &amp; Engineered by Webotic'
SIGN_KO = 'Conçu et développé par OBM System'
diff_pages, same, signed, status = [], 0, 0, {}
for f in sorted(PKG.rglob('index.html')):
    rel = f.relative_to(PKG).as_posix()
    url = BASE + '/' + rel[:-len('index.html')]
    body, code = get(url)
    if code != '200':
        status[rel] = (False, f'HTTP {code}')
        continue
    if SIGN_OK in body and SIGN_KO not in body:
        signed += 1
    expected = f.read_text(encoding='utf-8')
    if norm(body) == norm(expected):
        same += 1
        status[rel] = (True, 'identique au paquet')
        continue
    essentials = bool(re.search(r'site(\.[0-9a-f]{6,})?\.css', body) and re.search(r'site(\.[0-9a-f]{6,})?\.js', body)) and 'G-JGDV0VS9B9' in body
    if '__DATE_' in body: essentials = False
    gtm = 'GTM-TTPCSLV9' in body
    kind = 'gabarit back-office' if BACKOFFICE.match(rel) else 'DIFFÉRENT DU PAQUET'
    diff_pages.append(rel)
    status[rel] = (essentials and not gtm and kind != 'DIFFÉRENT DU PAQUET',
                   kind + ' · ' + ('v8 ok' if essentials else 'v8 absente ou date non remplacée') + (' · GTM vide encore présent' if gtm else ''))
total = len(status)
# Un contrôle par page : le total reste fixe quel que soit l'état du site
for rel, (ok_, detail) in status.items():
    check(f'Page /{rel[:-len("index.html")]}', ok_, detail)
check('Crédit Webotic sur toutes les pages', signed == total, f'{signed}/{total}')
home, _ = get(BASE + '/')
want = re.search(r'<meta name="description" content="([^"]*)"', (PKG / 'index.html').read_text(encoding='utf-8')).group(1)
got = re.search(r'<meta name="description" content="([^"]*)"', home)
want_t = re.search(r'<title>([^<]*)</title>', (PKG / 'index.html').read_text(encoding='utf-8')).group(1)
got_t = re.search(r'<title>([^<]*)</title>', home)
check('Title de l’accueil v8', got_t is not None and got_t.group(1) == want_t, got_t.group(1) if got_t else '')
check('Description de l’accueil (153 caractères)', got is not None and got.group(1) == want,
      'ancienne description du back-office' if got and got.group(1) != want else '')

# 2. Fichiers statiques (copiés tels quels)
for path in ['assets/css/site.css', 'assets/js/site.js', 'llms.txt',
             'e48c30133e89edf66822bbebc5640e7b.txt', '.well-known/security.txt', 'manifest.webmanifest']:
    if path.startswith('assets/'):   # URL réelle lue sur l'accueil (?v=7, ou nom haché après l'étape 5)
        m = re.search(r'(?:href|src)="(/assets/(?:css|js)/site[^"]*\.' + path.rsplit('.', 1)[1] + r'[^"]*)"', home)
        url = BASE + (m.group(1) if m else '/' + path)
        body, code = get(url)
        hashed = m is not None and '?v=' not in m.group(1)
        local = (PKG / path).read_text(encoding='utf-8')
        check(f'Fichier {path}', code == '200' and (hashed or norm(body) == norm(local)), code + (' · nom haché (étape 5)' if hashed else ''))
        continue
    body, code = get(f'{BASE}/{path}')
    local = (PKG / path).read_text(encoding='utf-8')
    check(f'Fichier {path}', code == '200' and norm(body) == norm(local), code)

# 2 bis. Fichiers générés par le back-office : contenu attendu, pas l'identité au paquet
import xml.etree.ElementTree as ET
NS = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
body, code = get(f'{BASE}/sitemap.xml')
try:
    live_locs = [e.text.strip() for e in ET.fromstring(body.encode()).findall('.//s:loc', NS)]
    live_mods = [e.text.strip() for e in ET.fromstring(body.encode()).findall('.//s:lastmod', NS)]
except ET.ParseError:
    live_locs, live_mods = [], []
pkg_locs = [e.text.strip() for e in ET.parse(PKG / 'sitemap.xml').getroot().findall('.//s:loc', NS)]
# Le back-office ajoute les pages créées en phase 6 : toutes les URL du paquet doivent être en ligne, les nouvelles sont admises.
check('sitemap.xml : toutes les URL du paquet présentes', code == '200' and set(pkg_locs) <= set(live_locs),
      f'{len(live_locs)} URL en ligne dont {len(set(live_locs) - set(pkg_locs))} nouvelles, {len(set(pkg_locs) - set(live_locs))} manquantes')
import datetime
today = datetime.date.today().isoformat()
check('sitemap.xml : une date lastmod par URL, aucune dans le futur',
      len(live_mods) == len(live_locs) and all(m[:10] <= today for m in live_mods),
      f'{len(live_mods)} dates pour {len(live_locs)} URL')
body, code = get(f'{BASE}/blog/feed.xml')
try:
    items = ET.fromstring(body.encode()).findall('.//item')
    links = sorted(i.findtext('link', '').strip() for i in items)
except ET.ParseError:
    items, links = [], []
pkg_links = sorted(i.findtext('link', '').strip() for i in ET.parse(PKG / 'blog/feed.xml').getroot().findall('.//item'))
check('blog/feed.xml : XML valide et tous les articles du paquet', code == '200' and set(pkg_links) <= set(links), f'{len(items)} articles en ligne')
_m = re.search(r'src="(/assets/js/site[^"]*)"', home)
js, _ = get(BASE + (_m.group(1) if _m else '/assets/js/site.js'))
check('Aucune clé API dans site.js', 'apikey' not in js.lower() and '1b5bb9' not in js)

# 3. Images de partage
NEW_OG = sorted(p.relative_to(PKG).as_posix() for p in (PKG / 'assets/img/og').glob('og-*.jpg'))
for img in NEW_OG + ['assets/uploads/og-ga4-6-reglages-mvzabpln.jpg']:
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

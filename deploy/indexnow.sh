#!/bin/sh
# Notifie Bing, Yandex, Seznam et Naver de toutes les URL du sitemap (à lancer après chaque mise en ligne)
KEY=e48c30133e89edf66822bbebc5640e7b
curl -s https://obm-system.com/sitemap.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//' | grep -v '\.png$' \
 | python3 -c "import sys,json; u=[l.strip() for l in sys.stdin]; print(json.dumps({'host':'obm-system.com','key':'$KEY','keyLocation':'https://obm-system.com/$KEY.txt','urlList':u}))" \
 | curl -s -o /dev/null -w "IndexNow : %{http_code}\n" -X POST https://api.indexnow.org/indexnow -H 'Content-Type: application/json; charset=utf-8' -d @-

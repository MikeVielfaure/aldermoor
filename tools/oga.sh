#!/usr/bin/env bash
# Télécharge des pages OpenGameArt EN CC0 UNIQUEMENT dans assets/brut/oga-<page>/ (+ LICENCE.txt).
# Usage : bash tools/oga.sh page1 page2 …   (page = la fin de l'adresse opengameart.org/content/<page>)
# Recherche : bash tools/oga.sh --cherche "mots clés" son|musique
cd "$(dirname "$0")/../assets/brut" || exit 1
UA="Mozilla/5.0"
if [ "$1" = "--cherche" ]; then
  t=13; [ "$3" = "musique" ] && t=12
  curl -s -L --max-time 30 -A "$UA" "https://opengameart.org/art-search-advanced?keys=$(echo "$2" | tr ' ' '+')&field_art_type_tid%5B%5D=$t&field_art_licenses_tid%5B%5D=4&sort_by=count&sort_order=DESC" \
    | grep -o '<a href="/content/[^"]*">[^<]*</a>' | sort -u | sed 's/<a href="\/content\///;s/">/ = /;s/<\/a>//'
  exit 0
fi
for p in "$@"; do
  h=$(curl -s -L --max-time 30 -A "$UA" "https://opengameart.org/content/$p")
  # la licence de la page doit être CC0 (bloc « License(s) »)
  lic=$(echo "$h" | grep -o 'licenses/[a-z0-9-]*' | sort -u | tr '\n' ' ')
  if ! echo "$h" | grep -q 'license-name">CC0\|publicdomain/zero\|>CC0<'; then echo "$p : licence pas CC0 ($lic), ignoré"; continue; fi
  d="oga-$p"; mkdir -p "$d"
  au=$(echo "$h" | grep -o 'href="/users/[^"]*"' | head -1 | sed 's|href="/users/||;s|"||')
  printf 'Source : https://opengameart.org/content/%s\nAuteur : %s\nLicence : CC0 1.0 (domaine public) - https://creativecommons.org/publicdomain/zero/1.0/\nTéléchargé le %s.\n' "$p" "$au" "$(date +%F)" > "$d/LICENCE.txt"
  for u in $(echo "$h" | grep -oE 'https://opengameart.org/sites/default/files/[^"/'"'"' ]+\.(zip|ogg|wav|mp3|flac)' | sort -u); do
    f=$(basename "$u" | sed 's/%20/_/g'); curl -s -L --max-time 180 -A "$UA" -o "$d/$f" "$u"
    case "$f" in *.zip) (cd "$d" && unzip -q -o "$f" -d contenu 2>/dev/null);; esac
  done
  echo "$p ($au) : $(find "$d" -type f \( -name '*.ogg' -o -name '*.wav' -o -name '*.mp3' -o -name '*.flac' \) | wc -l) sons [$(du -sh "$d" | cut -f1)]"
done

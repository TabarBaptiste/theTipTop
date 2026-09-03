#!/usr/bin/env bash
# =============================================================================
# sonar-issues.sh - Export des issues SonarQube du projet thetiptop
# Furious Ducks - Projet thetiptop_v0
#
# Usage:
#   export SONAR_TOKEN=votre_token   # genere sur /account/security
#   bash sonar-issues.sh [--new-code] [--out fichier.json]
#
# --new-code   ne remonte que les issues du New Code Period (celles qui
#              comptent pour le quality gate)
# --out FILE   ecrit le JSON brut dans FILE en plus du resume affiche
#              (defaut: sonar-issues.json)
# =============================================================================

set -euo pipefail

SONAR_URL="https://sonar.wk-archi-o24a-4-5-g1.fr"
PROJECT_KEY="thetiptop"
OUT_FILE="sonar-issues.json"
NEW_CODE_ONLY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --new-code) NEW_CODE_ONLY=true; shift ;;
    --out) OUT_FILE="$2"; shift 2 ;;
    *) echo "Argument inconnu: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "${SONAR_TOKEN:-}" ]]; then
  echo "Erreur: variable SONAR_TOKEN absente." >&2
  echo "Generez un token sur ${SONAR_URL}/account/security puis:" >&2
  echo "  export SONAR_TOKEN=votre_token" >&2
  exit 1
fi

QUERY="componentKeys=${PROJECT_KEY}&issueStatuses=OPEN,CONFIRMED&ps=500"
if [[ "$NEW_CODE_ONLY" == true ]]; then
  QUERY="${QUERY}&inNewCodePeriod=true"
fi

if [[ "$NEW_CODE_ONLY" == true ]]; then
  echo "Recuperation des issues (new code uniquement)..." >&2
else
  echo "Recuperation des issues (tout le projet)..." >&2
fi

RESPONSE=$(curl -sS -u "${SONAR_TOKEN}:" "${SONAR_URL}/api/issues/search?${QUERY}")

if command -v jq >/dev/null 2>&1; then
  echo "$RESPONSE" | jq . > "$OUT_FILE"

  TOTAL=$(echo "$RESPONSE" | jq '.total')
  echo "Total: ${TOTAL} issue(s)" >&2
  echo "" >&2

  echo "$RESPONSE" | jq -r '
    .issues[] |
    "\(.severity)\t\(.component | sub("thetiptop:"; ""))\tL\(.line // "?")\t\(.rule)\t\(.message)"
  ' | sort | column -t -s $'\t'
else
  echo "$RESPONSE" > "$OUT_FILE"
  echo "jq non installe : JSON brut ecrit dans ${OUT_FILE}, pas de resume affiche." >&2
fi

echo "" >&2
echo "JSON complet: ${OUT_FILE}" >&2

# ── Quality gate ────────────────────────────────────────────────────────────
# Les issues seules ne disent pas pourquoi le pipeline echoue : c'est le gate
# qui tranche, et ses conditions (couverture, duplication, nouvelles issues)
# ne sont pas visibles dans /api/issues/search.
echo "" >&2
echo "=== Quality gate ===" >&2

GATE=$(curl -sS -u "${SONAR_TOKEN}:" \
  "${SONAR_URL}/api/qualitygates/project_status?projectKey=${PROJECT_KEY}")

if command -v jq >/dev/null 2>&1; then
  echo "$GATE" | jq -r '
    "Statut global: \(.projectStatus.status)",
    "",
    (.projectStatus.conditions[]
      | "\(if .status == "ERROR" then "ECHEC" else "  ok " end)  \(.metricKey)  actuel=\(.actualValue // "-")  seuil=\(.comparator // "") \(.errorThreshold // "-")")
  '
else
  echo "$GATE"
fi

#!/usr/bin/env bash
# =============================================================================
# check-versions.sh - Diagnostic complet versions & compatibilités
# Furious Ducks - Projet thetiptop_v0
# Usage: bash check-versions.sh [--json] [--path /chemin/vers/projet]
# =============================================================================

set -euo pipefail

# ── Couleurs & symboles ──────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

OK="✅"
WARN="⚠️ "
ERR="❌"
INFO="ℹ️ "
ARROW="→"

# ── Arguments ────────────────────────────────────────────────────────────────
OUTPUT_JSON=false
PROJECT_PATH="."

for arg in "$@"; do
  case $arg in
    --json)        OUTPUT_JSON=true ;;
    --path=*)      PROJECT_PATH="${arg#*=}" ;;
    --path)        shift; PROJECT_PATH="${1:-}" ;;
    -h|--help)
      echo "Usage: bash check-versions.sh [--json] [--path /chemin/vers/projet]"
      echo "  --json          Sortie JSON machine-readable"
      echo "  --path PATH     Chemin vers la racine du projet (défaut: .)"
      exit 0
      ;;
  esac
done

# ── Helpers ──────────────────────────────────────────────────────────────────
command_exists() { command -v "$1" &>/dev/null; }

# Récupère la version stable publiée d'un package npm
npm_latest() {
  local pkg="$1"
  if command_exists curl; then
    curl -sf --max-time 6 "https://registry.npmjs.org/${pkg}/latest" 2>/dev/null \
      | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('version',''))" 2>/dev/null \
      || echo ""
  else
    echo ""
  fi
}

# Récupère le champ engines.node d'un package npm
npm_engines_node() {
  local pkg="$1"
  if command_exists curl; then
    curl -sf --max-time 6 "https://registry.npmjs.org/${pkg}/latest" 2>/dev/null \
      | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('engines',{}).get('node','any'))" 2>/dev/null \
      || echo "unknown"
  else
    echo "unknown"
  fi
}

# Vérifie si une version satisfait un range semver (simple: compare majeur)
semver_major() { echo "$1" | cut -d'.' -f1 | tr -d 'v'; }
semver_minor() { echo "$1" | cut -d'.' -f2; }

# Compare deux versions: 0=égal, 1=v1>v2, 2=v1<v2
version_compare() {
  python3 -c "
import sys
def parse(v):
    return [int(x) for x in v.lstrip('v').split('.')[:3]]
a, b = parse('$1'), parse('$2')
sys.exit(0 if a == b else (1 if a > b else 2))
" 2>/dev/null
  return $?
}

# Status d'une version vs latest
version_status() {
  local current="$1" latest="$2"
  if [ -z "$current" ] || [ "$current" = "N/A" ] || [ "$current" = "not found" ]; then
    echo "MISSING"
  elif [ "$current" = "$latest" ]; then
    echo "UP_TO_DATE"
  else
    local cur_major latest_major
    cur_major=$(semver_major "$current")
    latest_major=$(semver_major "$latest")
    if [ "$cur_major" -lt "$latest_major" ] 2>/dev/null; then
      echo "MAJOR_OUTDATED"
    else
      echo "MINOR_OUTDATED"
    fi
  fi
}

print_header() {
  echo ""
  echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${BOLD}${BLUE}║   🦆 Furious Ducks - Diagnostic Versions & Compatibilités       ║${RESET}"
  echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════════════════════╝${RESET}"
  echo -e "${DIM}   $(date '+%Y-%m-%d %H:%M:%S')  |  $(uname -s) $(uname -m)${RESET}"
  echo ""
}

print_section() {
  echo ""
  echo -e "${BOLD}${CYAN}── $1 ─────────────────────────────────────────────────${RESET}"
}

print_row() {
  local status="$1" name="$2" current="$3" latest="$4" note="$5"
  local icon color
  case "$status" in
    UP_TO_DATE)      icon="$OK"; color="$GREEN"  ;;
    MINOR_OUTDATED)  icon="$WARN"; color="$YELLOW" ;;
    MAJOR_OUTDATED)  icon="$ERR"; color="$RED"   ;;
    MISSING)         icon="$ERR"; color="$RED"   ;;
    INFO)            icon="$INFO"; color="$BLUE"  ;;
    *)               icon="$INFO"; color="$RESET" ;;
  esac

  printf "  %s  ${BOLD}%-28s${RESET}  ${color}%-12s${RESET}  ${DIM}→ %-12s${RESET}  %s\n" \
    "$icon" "$name" "${current:-N/A}" "${latest:-?}" "$note"
}

# ── JSON accumulator ─────────────────────────────────────────────────────────
JSON_OUTPUT='{"generated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'","checks":[]}'
json_add() {
  local category="$1" name="$2" current="$3" latest="$4" status="$5" note="$6"
  JSON_OUTPUT=$(echo "$JSON_OUTPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
d['checks'].append({
  'category': '$category',
  'name': '$name',
  'current': '$current',
  'latest': '$latest',
  'status': '$status',
  'note': '$note'
})
print(json.dumps(d, indent=2))
" 2>/dev/null || echo "$JSON_OUTPUT")
}

# =============================================================================
# SECTION 1 - Environnement Système
# =============================================================================
check_system() {
  print_section "Système & Runtime"

  # ── Node.js ────────────────────────────────────────────────────────────────
  local node_current node_latest node_status
  if command_exists node; then
    node_current=$(node --version | tr -d 'v')
  else
    node_current="not found"
  fi
  node_latest=$(npm_latest "node")
  [ -z "$node_latest" ] && node_latest="24.16.0"  # fallback connu
  node_status=$(version_status "$node_current" "$node_latest")

  # Vérifie LTS (pairs = LTS : 18, 20, 22, 24)
  local node_major note_node=""
  node_major=$(semver_major "$node_current")
  if [ "$((node_major % 2))" -eq 1 ] 2>/dev/null; then
    note_node="${RED}Odd = non-LTS!${RESET}"
  elif [ "$node_major" -lt 20 ] 2>/dev/null; then
    note_node="${RED}< 20 → NestJS/Prisma incompatible!${RESET}"
  elif [ "$node_major" -eq 20 ] 2>/dev/null; then
    note_node="${YELLOW}LTS mais EOL Oct 2026${RESET}"
  elif [ "$node_major" -eq 22 ] 2>/dev/null; then
    note_node="${GREEN}LTS actif (EOL Oct 2027)${RESET}"
  elif [ "$node_major" -ge 24 ] 2>/dev/null; then
    note_node="${GREEN}Current stable${RESET}"
  fi
  print_row "$node_status" "Node.js" "v$node_current" "v$node_latest" "$(echo -e "$note_node")"
  json_add "system" "nodejs" "$node_current" "$node_latest" "$node_status" "LTS pair numbers"

  # ── npm ───────────────────────────────────────────────────────────────────
  local npm_current npm_latest npm_status
  if command_exists npm; then
    npm_current=$(npm --version)
  else
    npm_current="not found"
  fi
  npm_latest=$(npm_latest "npm")
  [ -z "$npm_latest" ] && npm_latest="11.15.0"
  npm_status=$(version_status "$npm_current" "$npm_latest")
  print_row "$npm_status" "npm" "$npm_current" "$npm_latest" ""
  json_add "system" "npm" "$npm_current" "$npm_latest" "$npm_status" ""

  # ── Git ───────────────────────────────────────────────────────────────────
  local git_current
  if command_exists git; then
    git_current=$(git --version | awk '{print $3}')
    print_row "INFO" "Git" "$git_current" "-" "$(git --version)"
    json_add "system" "git" "$git_current" "" "INFO" ""
  else
    print_row "MISSING" "Git" "not found" "-" ""
  fi

  # ── Docker ────────────────────────────────────────────────────────────────
  local docker_current
  if command_exists docker; then
    docker_current=$(docker --version | awk '{print $3}' | tr -d ',')
    print_row "INFO" "Docker" "$docker_current" "-" "$(docker --version | cut -d' ' -f1-3)"
    json_add "system" "docker" "$docker_current" "" "INFO" ""
  else
    print_row "INFO" "Docker" "not found" "-" "${DIM}Non requis en local${RESET}"
  fi

  # ── Python (requis par certains scripts CI) ───────────────────────────────
  local py_current
  if command_exists python3; then
    py_current=$(python3 --version | awk '{print $2}')
    print_row "INFO" "Python3" "$py_current" "-" ""
  fi
}

# =============================================================================
# SECTION 2 - TypeScript & Outils de build
# =============================================================================
check_build_tools() {
  print_section "TypeScript & Build Tools"

  local name current latest status note
  declare -A TOOLS_LATEST=(
    ["typescript"]="6.0.3"
    ["ts-node"]="10.9.2"
    ["ts-jest"]="29.3.4"
    ["@types/node"]="22.15.32"
  )

  for pkg in "typescript" "ts-node" "ts-jest" "@types/node"; do
    current="not found"
    # Cherche en local (webapp puis api)
    for dir in "$PROJECT_PATH/webapp" "$PROJECT_PATH/api" "$PROJECT_PATH"; do
      if [ -f "$dir/package.json" ]; then
        local ver
        ver=$(python3 -c "
import json, sys
try:
  d = json.load(open('$dir/package.json'))
  deps = {**d.get('dependencies',{}), **d.get('devDependencies',{})}
  v = deps.get('$pkg', '')
  print(v.lstrip('^~>=<') if v else '')
except: pass
" 2>/dev/null)
        if [ -n "$ver" ]; then
          current="$ver"
          break
        fi
      fi
    done

    latest="${TOOLS_LATEST[$pkg]:-}"
    [ -z "$latest" ] && latest=$(npm_latest "$pkg")

    status=$(version_status "$current" "$latest")
    [ "$current" = "not found" ] && status="INFO"

    note=""
    [ "$pkg" = "@types/node" ] && note="${DIM}Doit matcher le Node.js utilisé${RESET}"
    print_row "$status" "$pkg" "$current" "$latest" "$(echo -e "$note")"
    json_add "build" "$pkg" "$current" "$latest" "$status" "$note"
  done
}

# =============================================================================
# SECTION 3 - Backend : NestJS stack
# =============================================================================
check_nestjs() {
  print_section "Backend - NestJS Stack"

  local NEST_LATEST="11.1.24"
  declare -A NEST_PKGS=(
    ["@nestjs/core"]="$NEST_LATEST"
    ["@nestjs/common"]="$NEST_LATEST"
    ["@nestjs/platform-express"]="$NEST_LATEST"
    ["@nestjs/config"]="4.0.4"
    ["@nestjs/typeorm"]="11.0.1"
    ["@nestjs/jwt"]="11.0.0"
    ["@nestjs/passport"]="11.0.5"
    ["@nestjs/testing"]="$NEST_LATEST"
    ["@nestjs/swagger"]="11.2.0"
  )

  local api_pkg="$PROJECT_PATH/api/package.json"
  local has_api=false
  [ -f "$api_pkg" ] && has_api=true

  if ! $has_api; then
    echo -e "  ${DIM}  ⚠  Fichier api/package.json non trouvé - analyse registry uniquement${RESET}"
  fi

  for pkg in "${!NEST_PKGS[@]}"; do
    local current latest status
    latest="${NEST_PKGS[$pkg]}"

    if $has_api; then
      current=$(python3 -c "
import json
try:
  d = json.load(open('$api_pkg'))
  deps = {**d.get('dependencies',{}), **d.get('devDependencies',{})}
  v = deps.get('$pkg', '')
  print(v.lstrip('^~>=<') if v else 'not in deps')
except Exception as e:
  print('not found')
" 2>/dev/null)
    else
      current="-"
    fi

    status=$(version_status "$current" "$latest")

    local note=""
    [ "$pkg" = "@nestjs/core" ] && note="${GREEN}Node >=20 requis${RESET}"
    print_row "$status" "$pkg" "$current" "$latest" "$(echo -e "$note")"
    json_add "nestjs" "$pkg" "$current" "$latest" "$status" "$note"
  done
}

# =============================================================================
# SECTION 4 - Frontend : Next.js stack
# =============================================================================
check_nextjs() {
  print_section "Frontend - Next.js Stack"

  declare -A NEXT_PKGS=(
    ["next"]="15.3.3"
    ["react"]="19.2.6"
    ["react-dom"]="19.2.6"
    ["next-auth"]="5.0.0-beta.28"
    ["tailwindcss"]="4.3.0"
    ["postcss"]="8.5.6"
    ["autoprefixer"]="10.4.21"
  )

  # Note: Next 15 = stable LTS. Next 16 existe depuis mai 2025 mais breaking.
  # Pour compatibilité maximale avec l'écosystème (next-auth v4/v5, Prisma),
  # Next 15 LTS est la cible recommandée.

  local webapp_pkg="$PROJECT_PATH/webapp/package.json"
  local has_webapp=false
  [ -f "$webapp_pkg" ] && has_webapp=true

  if ! $has_webapp; then
    echo -e "  ${DIM}  ⚠  Fichier webapp/package.json non trouvé - analyse registry uniquement${RESET}"
  fi

  for pkg in "${!NEXT_PKGS[@]}"; do
    local current latest status

    latest="${NEXT_PKGS[$pkg]}"

    if $has_webapp; then
      current=$(python3 -c "
import json
try:
  d = json.load(open('$webapp_pkg'))
  deps = {**d.get('dependencies',{}), **d.get('devDependencies',{})}
  v = deps.get('$pkg', '')
  print(v.lstrip('^~>=<') if v else 'not in deps')
except:
  print('not found')
" 2>/dev/null)
    else
      current="-"
    fi

    status=$(version_status "$current" "$latest")

    local note=""
    case "$pkg" in
      "next")       note="${CYAN}LTS stable. Next 16+ = breaking changes${RESET}" ;;
      "react")      note="${DIM}React 19 = obligatoire pour Next 15${RESET}" ;;
      "tailwindcss") note="${DIM}v4 = JIT par défaut, réécriture config${RESET}" ;;
    esac
    print_row "$status" "$pkg" "$current" "$latest" "$(echo -e "$note")"
    json_add "nextjs" "$pkg" "$current" "$latest" "$status" "$note"
  done
}

# =============================================================================
# SECTION 5 - ORM & Base de données
# =============================================================================
check_database() {
  print_section "ORM & Base de données"

  declare -A DB_PKGS=(
    ["prisma"]="6.10.1"
    ["@prisma/client"]="6.10.1"
    ["typeorm"]="0.3.25"
    ["pg"]="8.21.0"
    ["@types/pg"]="8.11.14"
  )

  # Note: Prisma 7 requiert Node ^20.19 || ^22.12 || >=24.0
  # Pour compatibilité Node 22 LTS: Prisma 6.x recommandé.
  # Prisma 7 possible avec Node 24 uniquement.

  local api_pkg="$PROJECT_PATH/api/package.json"

  for pkg in "${!DB_PKGS[@]}"; do
    local current latest status

    latest="${DB_PKGS[$pkg]}"

    if [ -f "$api_pkg" ]; then
      current=$(python3 -c "
import json
try:
  d = json.load(open('$api_pkg'))
  deps = {**d.get('dependencies',{}), **d.get('devDependencies',{})}
  v = deps.get('$pkg', '')
  print(v.lstrip('^~>=<') if v else 'not in deps')
except:
  print('not found')
" 2>/dev/null)
    else
      current="-"
    fi

    status=$(version_status "$current" "$latest")

    local note=""
    case "$pkg" in
      "prisma"|"@prisma/client")
        note="${YELLOW}v7 = Node >=24 only. v6 = Node >=20${RESET}" ;;
    esac
    print_row "$status" "$pkg" "$current" "$latest" "$(echo -e "$note")"
    json_add "database" "$pkg" "$current" "$latest" "$status" "$note"
  done
}

# =============================================================================
# SECTION 6 - Tests
# =============================================================================
check_testing() {
  print_section "Testing"

  declare -A TEST_PKGS=(
    ["jest"]="29.7.0"
    ["@types/jest"]="29.5.14"
    ["ts-jest"]="29.3.4"
    ["cypress"]="14.5.0"
    ["@testing-library/react"]="16.3.0"
    ["@testing-library/jest-dom"]="6.6.3"
    ["supertest"]="7.1.0"
    ["k6"]="0.56.0"
  )

  # Note: Jest 30 = breaking changes (Node >=18.14). Pour stabilité: Jest 29 LTS.
  # Cypress 14 = Node >=18.

  for pkg in "${!TEST_PKGS[@]}"; do
    local current latest status
    latest="${TEST_PKGS[$pkg]}"

    # Recherche dans webapp + api
    current="not in deps"
    for pkg_file in "$PROJECT_PATH/webapp/package.json" "$PROJECT_PATH/api/package.json"; do
      if [ -f "$pkg_file" ]; then
        local found
        found=$(python3 -c "
import json
try:
  d = json.load(open('$pkg_file'))
  deps = {**d.get('dependencies',{}), **d.get('devDependencies',{})}
  v = deps.get('$pkg', '')
  print(v.lstrip('^~>=<') if v else '')
except:
  print('')
" 2>/dev/null)
        if [ -n "$found" ]; then
          current="$found"
          break
        fi
      fi
    done

    status=$(version_status "$current" "$latest")
    [ "$current" = "not in deps" ] && status="INFO"

    local note=""
    case "$pkg" in
      "jest")    note="${DIM}v29 LTS stable. v30 breaking (ESM only)${RESET}" ;;
      "cypress") note="${DIM}v14 stable, Node >=18${RESET}" ;;
    esac
    print_row "$status" "$pkg" "$current" "$latest" "$(echo -e "$note")"
    json_add "testing" "$pkg" "$current" "$latest" "$status" "$note"
  done
}

# =============================================================================
# SECTION 7 - Qualité & Sécurité
# =============================================================================
check_quality() {
  print_section "Qualité & Sécurité"

  declare -A QUALITY_PKGS=(
    ["eslint"]="9.29.0"
    ["@typescript-eslint/parser"]="8.34.0"
    ["@typescript-eslint/eslint-plugin"]="8.34.0"
    ["prettier"]="3.5.3"
    ["husky"]="9.1.7"
    ["lint-staged"]="16.1.0"
  )

  for pkg in "${!QUALITY_PKGS[@]}"; do
    local current latest status
    latest="${QUALITY_PKGS[$pkg]}"
    current="not in deps"

    for pkg_file in "$PROJECT_PATH/webapp/package.json" "$PROJECT_PATH/api/package.json"; do
      if [ -f "$pkg_file" ]; then
        local found
        found=$(python3 -c "
import json
try:
  d = json.load(open('$pkg_file'))
  deps = {**d.get('dependencies',{}), **d.get('devDependencies',{})}
  v = deps.get('$pkg', '')
  print(v.lstrip('^~>=<') if v else '')
except:
  print('')
" 2>/dev/null)
        if [ -n "$found" ]; then
          current="$found"
          break
        fi
      fi
    done

    status=$(version_status "$current" "$latest")
    [ "$current" = "not in deps" ] && status="INFO"

    local note=""
    [ "$pkg" = "eslint" ] && note="${DIM}v9 = flat config (eslint.config.js)${RESET}"
    print_row "$status" "$pkg" "$current" "$latest" "$(echo -e "$note")"
    json_add "quality" "$pkg" "$current" "$latest" "$status" "$note"
  done
}

# =============================================================================
# SECTION 8 - Matrice de compatibilité Node.js
# =============================================================================
check_compatibility_matrix() {
  print_section "Matrice de Compatibilité Node.js"

  local node_major
  if command_exists node; then
    node_major=$(node --version | tr -d 'v' | cut -d'.' -f1)
  else
    echo -e "  ${RED}Node.js non installé - impossible de vérifier la compatibilité${RESET}"
    return
  fi

  echo ""
  echo -e "  ${BOLD}Node.js détecté : v${node_major}.x${RESET}"
  echo ""

  # Table de compatibilité basée sur les engines récupérés
  local items=(
    "NestJS 11:>= 20:✅ v20,22,24"
    "Next.js 15:>=20.9.0:✅ v20,22,24"
    "Prisma 6:>=18.0:✅ v18,20,22,24"
    "Prisma 7:^20.19 || ^22.12 || >=24:⚠  v20.19+,22.12+,24+"
    "Jest 29:^18.14.0 || >=20:✅ v18,20,22,24"
    "Jest 30:^18.14 || ^20 || ^22 || >=24:✅ v18,20,22,24"
    "Cypress 14:^20.1.0 || ^22:✅ v20,22"
    "Cypress 15:^20.1.0 || ^22 || >=24:✅ v20,22,24"
    "ESLint 9:^18.18 || ^20.9 || >=21:✅ v18,20,22,24"
    "ESLint 10:^20.19 || ^22.13 || >=24:⚠  v20.19+,22.13+,24+"
    "TypeORM 0.3:^20.19 || ^22.13 || >=24.11:⚠  v20.19+,22.13+,24.11+"
    "npm 11:^20.17.0 || >=22.9.0:✅ v20.17+,22,24"
  )

  printf "  ${BOLD}%-22s %-38s %-25s %s${RESET}\n" "Dépendance" "Contrainte engines.node" "Versions supportées" "Node ${node_major} ?"
  printf "  %s\n" "$(printf '─%.0s' {1..90})"

  for item in "${items[@]}"; do
    local dep constraint compat compat_icon
    dep=$(echo "$item" | cut -d':' -f1)
    constraint=$(echo "$item" | cut -d':' -f2)
    compat=$(echo "$item" | cut -d':' -f3)

    # Compatibilité: extrait tous les minimums du range, compatible si node_major >= l'un d'eux
    compat_icon="${GREEN}✅${RESET}"
    compatible=$(python3 -c "
import re, sys
node = $node_major
constraint = '$constraint'
ranges = re.split(r'\|\|', constraint)
for r in ranges:
    nums = re.findall(r'[0-9]+', r)
    if nums:
        mn = int(nums[0])
        if node >= mn:
            print('yes')
            sys.exit(0)
print('no')
" 2>/dev/null || echo "yes")
    [ "$compatible" = "no" ] && compat_icon="${RED}❌${RESET}"

    printf "  %-22s ${DIM}%-38s${RESET} %-25s %b\n" "$dep" "$constraint" "$compat" "$compat_icon"
  done
}

# =============================================================================
# SECTION 9 - Analyse package.json (si trouvé)
# =============================================================================
check_lockfiles() {
  print_section "Fichiers de Projet"

  local items=(
    "webapp/package.json"
    "webapp/package-lock.json"
    "webapp/tsconfig.json"
    "webapp/.eslintrc*"
    "api/package.json"
    "api/package-lock.json"
    "api/tsconfig.json"
    "api/prisma/schema.prisma"
    "Dockerfile"
    "docker-compose.yml"
    "docker-compose.yaml"
    "sonar-project.properties"
    "Jenkinsfile"
    ".nvmrc"
    ".node-version"
  )

  for item in "${items[@]}"; do
    local full_path="$PROJECT_PATH/$item"
    # Gestion du glob pour .eslintrc*
    local found=false
    for f in $full_path; do
      if [ -f "$f" ]; then
        found=true
        local size
        size=$(du -h "$f" 2>/dev/null | cut -f1 || echo "?")
        print_row "UP_TO_DATE" "$item" "présent" "-" "${DIM}${size}${RESET}"
      fi
    done
    if [ "$found" = "false" ]; then
      print_row "INFO" "$item" "absent" "-" ""
    fi
  done

  # Vérifier si .nvmrc ou .node-version est cohérent
  for nv_file in "$PROJECT_PATH/.nvmrc" "$PROJECT_PATH/.node-version"; do
    if [ -f "$nv_file" ]; then
      local pinned_version
      pinned_version=$(cat "$nv_file" | tr -d 'v\n ')
      echo ""
      echo -e "  ${INFO} Version Node épinglée dans ${BOLD}$(basename $nv_file)${RESET}: ${CYAN}v${pinned_version}${RESET}"
      if command_exists node; then
        local current_node
        current_node=$(node --version | tr -d 'v')
        if [ "$pinned_version" != "$current_node" ]; then
          echo -e "  ${WARN} ${YELLOW}Divergence : Node actif = v${current_node}, épinglé = v${pinned_version}${RESET}"
        fi
      fi
    fi
  done
}

# =============================================================================
# SECTION 10 - Recommandations finales
# =============================================================================
print_recommendations() {
  local node_major=""
  command_exists node && node_major=$(node --version | tr -d 'v' | cut -d'.' -f1)

  echo ""
  echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${BOLD}${BLUE}║   Recommandations                                                ║${RESET}"
  echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════════════════════╝${RESET}"
  echo ""

  # Recommandation Node
  if [ -n "$node_major" ]; then
    if [ "$node_major" -lt 20 ] 2>/dev/null; then
      echo -e "  ${ERR}  ${RED}${BOLD}CRITIQUE - Node.js doit être mis à jour vers v22.x LTS${RESET}"
      echo -e "      NestJS 11, Prisma 6/7, Next.js 15 requièrent tous Node >=20"
      echo -e "      ${DIM}nvm install 22 && nvm alias default 22${RESET}"
    elif [ "$node_major" -eq 20 ] 2>/dev/null; then
      echo -e "  ${WARN}  ${YELLOW}${BOLD}Node 20 LTS - Migration vers Node 22 recommandée${RESET}"
      echo -e "      Node 20 = EOL Octobre 2026. Prisma 7 nécessite Node ^20.19+"
      echo -e "      ${DIM}nvm install 22 && nvm alias default 22${RESET}"
    elif [ "$node_major" -eq 22 ] 2>/dev/null; then
      echo -e "  ${OK}  ${GREEN}${BOLD}Node 22 LTS - Configuration optimale${RESET}"
      echo -e "      Compatibilité: NestJS 11 ✅  Next.js 15 ✅  Prisma 6 ✅  Jest 29 ✅"
    elif [ "$node_major" -ge 24 ] 2>/dev/null; then
      echo -e "  ${OK}  ${GREEN}${BOLD}Node 24 - Dernière version stable${RESET}"
      echo -e "      Compatibilité: NestJS 11 ✅  Next.js 15 ✅  Prisma 7 ✅  Jest 29 ✅"
      echo -e "      ${DIM}Note: Node 24 n'est pas encore LTS (LTS en Oct 2025)${RESET}"
    fi
  fi

  echo ""
  echo -e "  ${INFO}  ${BOLD}Matrice de versions recommandées pour thetiptop_v0 :${RESET}"
  echo ""
  echo -e "  ${DIM}Node.js      :${RESET} ${GREEN}v22.x LTS${RESET}  ${DIM}(ou v24 si vous voulez Prisma 7)${RESET}"
  echo -e "  ${DIM}npm          :${RESET} ${GREEN}v10.x${RESET}  ${DIM}(stable avec Node 22)${RESET}"
  echo -e "  ${DIM}TypeScript   :${RESET} ${GREEN}5.8.x${RESET}  ${DIM}(TS 6 = très récent, breaking changes)${RESET}"
  echo -e "  ${DIM}NestJS       :${RESET} ${GREEN}11.x${RESET}   ${DIM}(dernière stable)${RESET}"
  echo -e "  ${DIM}Next.js      :${RESET} ${GREEN}15.x LTS${RESET}  ${DIM}(Next 16 = breaking, à éviter)${RESET}"
  echo -e "  ${DIM}Prisma       :${RESET} ${GREEN}6.x${RESET}    ${DIM}(compatible Node 20/22/24)${RESET}"
  echo -e "  ${DIM}Jest         :${RESET} ${GREEN}29.x${RESET}   ${DIM}(Jest 30 = ESM-only, breaking)${RESET}"
  echo -e "  ${DIM}React        :${RESET} ${GREEN}19.x${RESET}   ${DIM}(requis par Next.js 15)${RESET}"
  echo -e "  ${DIM}ESLint       :${RESET} ${GREEN}9.x${RESET}    ${DIM}(ESLint 10 = très récent)${RESET}"

  echo ""
  echo -e "  ${INFO}  ${BOLD}Mise à jour Dockerfile recommandée :${RESET}"
  echo ""
  echo -e "  ${DIM}# Avant${RESET}"
  echo -e "  FROM node:18-alpine"
  echo -e "  ${DIM}# Après${RESET}"
  echo -e "  FROM node:22-alpine   ${DIM}# ou node:24-alpine${RESET}"
  echo ""
  echo -e "  ${INFO}  ${BOLD}Commandes de mise à jour locales :${RESET}"
  echo ""
  echo -e "  ${DIM}# Via nvm (recommandé)${RESET}"
  echo -e "  nvm install 22 && nvm use 22 && nvm alias default 22"
  echo -e "  ${DIM}# Nettoyer et réinstaller les dépendances${RESET}"
  echo -e "  rm -rf node_modules package-lock.json && npm install"
  echo -e "  ${DIM}# Vérifier la compatibilité${RESET}"
  echo -e "  npm run build && npm run test"
  echo ""
}

# =============================================================================
# MAIN
# =============================================================================
main() {
  print_header
  check_system
  check_build_tools
  check_nestjs
  check_nextjs
  check_database
  check_testing
  check_quality
  check_compatibility_matrix
  check_lockfiles
  print_recommendations

  echo ""
  echo -e "${DIM}  Diagnostic terminé. Pour relancer : bash check-versions.sh [--path /chemin/projet]${RESET}"
  echo -e "${DIM}  Pour export JSON : bash check-versions.sh --json > rapport.json${RESET}"
  echo ""

  if $OUTPUT_JSON; then
    echo ""
    echo "─── JSON OUTPUT ────────────────────────────────────"
    echo "$JSON_OUTPUT"
  fi
}

main "$@"
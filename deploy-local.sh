#!/bin/bash
set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'
DEPLOY_START=$(date +%s)
step_start() { STEP_START=$(date +%s); }
step_done() {
    local elapsed=$(( $(date +%s) - STEP_START ))
    echo -e " ${GREEN}✓${RESET} done ${YELLOW}(${elapsed}s)${RESET}"
}
section() { echo -e "\n${CYAN}${BOLD}▶ $1${RESET}"; }
fail() { echo -e "\n${RED}✗ Error: $1${RESET}"; exit 1; }

echo -e "${BOLD}╔══════════════════════════╗${RESET}"
echo -e "${BOLD}║   Evocave Docs — Deploy  ║${RESET}"
echo -e "${BOLD}╚══════════════════════════╝${RESET}"
echo -e "  ${YELLOW}$(date '+%Y-%m-%d %H:%M:%S')${RESET}"

section "1/3  Building locally"
step_start
[ -f .env.local ] && mv .env.local .env.local.bak
npm run build || { [ -f .env.local.bak ] && mv .env.local.bak .env.local; fail "Build failed"; }
[ -f .env.local.bak ] && mv .env.local.bak .env.local
step_done

section "2/3  Uploading .next to server (rsync)"
step_start
rsync -avz --delete -e "ssh -p 9393" .next/ evocavec@evocave.com:~/repositories/evocave-docs/.next/
step_done

section "3/3  Restarting server"
step_start
ssh -p 9393 evocavec@evocave.com "bash ~/repositories/evocave-docs/deploy-server.sh"
step_done

TOTAL=$(( $(date +%s) - DEPLOY_START ))
SUMMARY="  Deploy selesai dalam ${TOTAL}s  "
BAR=$(printf '═%.0s' $(seq 1 ${#SUMMARY}))
echo -e "\n${GREEN}${BOLD}╔${BAR}╝${RESET}"
echo -e "${GREEN}${BOLD}║${SUMMARY}║${RESET}"
echo -e "${GREEN}${BOLD}╚${BAR}╝${RESET}\n"
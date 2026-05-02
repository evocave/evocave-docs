#!/bin/bash
set -e
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'
step_start() { STEP_START=$(date +%s); }
step_done() {
    local elapsed=$(( $(date +%s) - STEP_START ))
    echo -e " ${GREEN}✓${RESET} done ${YELLOW}(${elapsed}s)${RESET}"
}
section() { echo -e "\n${CYAN}${BOLD}▶ $1${RESET}"; }
source ~/nodevenv/repositories/evocave-docs/20/bin/activate
cd ~/repositories/evocave-docs
section "1/2  Dependencies"
step_start
PREV_HASH=$(cat .pkg-hash 2>/dev/null || echo "none")
CURR_HASH=$(md5sum package.json | awk '{print $1}')
if [ "$PREV_HASH" != "$CURR_HASH" ]; then
    echo -e "  ${YELLOW}↳ package.json changed, installing...${RESET}"
    npm install --omit=dev --loglevel=error
    echo "$CURR_HASH" > .pkg-hash
else
    echo -e "  ${YELLOW}↳ No changes, skipping install${RESET}"
fi
step_done
section "2/2  Restarting app"
step_start
PID=$(ps aux | grep "lsnode.*evocave-docs" | grep -v grep | awk '{print $2}')
if [ -n "$PID" ]; then
    echo -e "  ${YELLOW}↳ Killing PID $PID${RESET}"
    kill "$PID"
    sleep 2
else
    echo -e "  ${YELLOW}↳ No running process found${RESET}"
fi
touch tmp/restart.txt
sleep 5
step_done

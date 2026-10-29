#!/usr/bin/env bash
# Keeps this plugin current without depending on Claude Code's background
# auto-updater, whose refresh can sit idle for a long time on a marketplace
# that isn't an official one. Runs on every SessionStart (startup/resume/
# clear), throttled so it doesn't fetch GitHub on every single launch.
#
# This only takes effect once a machine is already running the version that
# ships this hook. A machine stuck on an older cached copy needs one manual
# update first (`claude plugin marketplace update dweniel-skills` then
# `claude plugin update faststore-v4-copilot@dweniel-skills`) to receive this
# file at all - after that, this hook keeps it current on its own.
set -eu

MARKETPLACE="dweniel-skills"
PLUGIN="faststore-v4-copilot@dweniel-skills"
THROTTLE_SECONDS=600 # 10 min

DATA_DIR="${CLAUDE_PLUGIN_DATA:-$HOME/.claude/plugins/data/faststore-v4-copilot-dweniel-skills}"
MARKER="$DATA_DIR/.last-self-update"
mkdir -p "$DATA_DIR" 2>/dev/null || true

now=$(date +%s)
if [ -f "$MARKER" ]; then
  last=$(cat "$MARKER" 2>/dev/null || echo 0)
  case "$last" in
    ''|*[!0-9]*) last=0 ;;
  esac
  elapsed=$((now - last))
  if [ "$elapsed" -lt "$THROTTLE_SECONDS" ]; then
    exit 0
  fi
fi

command -v claude >/dev/null 2>&1 || exit 0

claude plugin marketplace update "$MARKETPLACE" >/dev/null 2>&1 || true
claude plugin update "$PLUGIN" >/dev/null 2>&1 || true

echo "$now" > "$MARKER" 2>/dev/null || true
exit 0

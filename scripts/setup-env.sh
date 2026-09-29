#!/usr/bin/env bash
# Bootstraps the env files from their committed examples and keeps the MySQL credentials of the
# compose stack (root .env) and the API (server/.development.env, or server/.production.env with
# --prod) in sync. Works with bash 3.2 (macOS), Git Bash on Windows and Linux.
#
#   scripts/setup-env.sh          # dev: .env, server/.development.env, server/.e2e.env
#                                 # exit 1 on a credentials mismatch or a missing *.example, 2 on a bad option
#   scripts/setup-env.sh --prod   # prod (VDS): .env, server/.production.env
#   scripts/setup-env.sh --fix    # additionally copy the root MySQL values into the server env file
#
# Existing files are never overwritten. Values are never printed — only key names — so the
# output is safe for logs and for an agent that is not allowed to read env files.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FIX=0
PROD=0
for arg in "$@"; do
  case "$arg" in
    --fix) FIX=1 ;;
    --prod) PROD=1 ;;
    *) echo "unknown option: $arg (expected --prod and/or --fix)" >&2; exit 2 ;;
  esac
done

created=()
kept=()
mismatched=()
warnings=()
errors=()

# ensure <target> <example>: copy the example when the target is missing.
ensure() {
  local target="$1" example="$2"
  if [[ -f "$target" ]]; then
    kept+=("${target#"$ROOT"/}")
  elif [[ -f "$example" ]]; then
    cp "$example" "$target"
    created+=("${target#"$ROOT"/}")
  else
    errors+=("example missing: ${example#"$ROOT"/} — the checkout is incomplete")
  fi
}

KEY_LINE='^[[:space:]]*(export[[:space:]]+)?'

# read_var <file> <key>: value of the last KEY=... line (dotenv keeps the last one). A quoted value
# runs up to its closing quote (whatever follows — an inline comment — is dropped); an unquoted
# value loses a trailing "# comment". Empty when absent.
read_var() {
  local file="$1" key="$2" line value
  line="$(grep -E "${KEY_LINE}${key}=" "$file" | tail -n 1 || true)"
  if [[ -z "$line" ]]; then
    return 0
  fi
  value="$(printf '%s' "${line#*=}" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
  case "$value" in
    \"*) value="${value#\"}"; value="${value%%\"*}" ;;
    \'*) value="${value#\'}"; value="${value%%\'*}" ;;
    *) value="$(printf '%s' "$value" | sed -E 's/[[:space:]]+#.*$//; s/[[:space:]]+$//')" ;;
  esac
  printf '%s' "$value"
}

# set_var <file> <key> <value>: replace every KEY=... line (so the last one — the one dotenv
# uses — is the new value too) or append one. The value travels through the environment: awk -v
# would expand backslashes. A value with whitespace, '#' or a quote is wrapped in quotes so that it
# survives a round trip; backslashes are written as they are, because dotenv, docker compose and
# server/database/config.js all keep them literal inside quotes.
set_var() {
  local file="$1" key="$2" value="$3"
  case "$value" in
    *[[:space:]]* | *'#'* | *'"'* | *"'"*)
      if [[ "$value" != *"'"* ]]; then
        value="'$value'"
      else
        if [[ "$value" == *'"'* ]]; then
          warnings+=("$key: the value mixes ' and \" — no env quoting represents it, check ${file#"$ROOT"/} by hand")
        fi
        value="\"$value\""
      fi
      ;;
  esac
  if grep -qE "${KEY_LINE}${key}=" "$file"; then
    SETUP_ENV_VALUE="$value" awk -v k="$key" '
      $0 ~ "^[[:space:]]*(export[[:space:]]+)?" k "=" { print k "=" ENVIRON["SETUP_ENV_VALUE"]; next }
      { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  else
    printf '\n%s=%s\n' "$key" "$value" >> "$file"
  fi
}

# sync_pair <root key> <server key> <default>: compare, and copy root → server with --fix.
sync_pair() {
  local root_key="$1" server_key="$2" default="${3:-}" root_value server_value
  root_value="$(read_var "$ROOT_ENV" "$root_key")"
  server_value="$(read_var "$SERVER_ENV" "$server_key")"
  root_value="${root_value:-$default}"
  server_value="${server_value:-$default}"
  if [[ -z "$root_value" ]]; then
    warnings+=("root .env: $root_key is not set — nothing to compare $server_key against")
    return 0
  fi
  if [[ "$root_value" == "$server_value" ]]; then
    return 0
  fi
  if [[ "$FIX" -eq 1 ]]; then
    set_var "$SERVER_ENV" "$server_key" "$root_value"
    mismatched+=("$root_key → $server_key (fixed)")
  else
    mismatched+=("$root_key ≠ $server_key")
  fi
}

ROOT_ENV="$ROOT/.env"
ensure "$ROOT_ENV" "$ROOT/.env.example"

if [[ "$PROD" -eq 1 ]]; then
  SERVER_ENV="$ROOT/server/.production.env"
  ensure "$SERVER_ENV" "$ROOT/server/.production.env.example"
else
  SERVER_ENV="$ROOT/server/.development.env"
  ensure "$SERVER_ENV" "$ROOT/server/.development.env.example"
  ensure "$ROOT/server/.e2e.env" "$ROOT/server/.e2e.env.example"
fi
SERVER_ENV_NAME="${SERVER_ENV#"$ROOT"/}"

if [[ -f "$ROOT_ENV" && -f "$SERVER_ENV" ]]; then
  # docker-compose.yml (mysql / mysql-dev) ↔ server/database/config.js + app.module.ts
  sync_pair MYSQL_USER MYSQL_USER
  sync_pair MYSQL_PASSWORD MYSQL_PASSWORD
  sync_pair MYSQL_DATABASE MYSQL_DB

  host="$(read_var "$SERVER_ENV" MYSQL_HOST)"
  if [[ "$PROD" -eq 1 ]]; then
    # server-prod reaches the database by its compose service name on the internal network,
    # always on the container port; MYSQL_PUBLIC_PORT applies to mysql-dev only.
    if [[ "${host:-}" != "mysql" ]]; then
      warnings+=("$SERVER_ENV_NAME: MYSQL_HOST should be 'mysql' (the compose service) for the prod stack")
    fi
    port="$(read_var "$SERVER_ENV" MYSQL_PORT)"
    if [[ "${port:-3306}" != "3306" ]]; then
      warnings+=("$SERVER_ENV_NAME: MYSQL_PORT should be 3306 — the API talks to the mysql container directly")
    fi
  else
    sync_pair MYSQL_PUBLIC_PORT MYSQL_PORT 3306
    case "${host:-localhost}" in
      localhost | 127.0.0.1) ;;
      *) warnings+=("$SERVER_ENV_NAME: MYSQL_HOST is not localhost — mysql-dev listens on 127.0.0.1 only") ;;
    esac
  fi
fi

echo "Env files"
for f in "${created[@]+"${created[@]}"}"; do echo "  created  $f"; done
for f in "${kept[@]+"${kept[@]}"}"; do echo "  kept     $f"; done

if [[ ${#mismatched[@]} -gt 0 ]]; then
  echo "MySQL credentials (root .env ↔ $SERVER_ENV_NAME)"
  for m in "${mismatched[@]}"; do echo "  $m"; done
else
  echo "MySQL credentials: root .env and $SERVER_ENV_NAME agree"
fi

for w in "${warnings[@]+"${warnings[@]}"}"; do echo "  warning  $w"; done
for e in "${errors[@]+"${errors[@]}"}"; do echo "  error    $e" >&2; done

if [[ "$FIX" -eq 0 && ${#mismatched[@]} -gt 0 ]]; then
  fix_cmd="scripts/setup-env.sh --fix"
  if [[ "$PROD" -eq 1 ]]; then
    fix_cmd="scripts/setup-env.sh --prod --fix"
  fi
  echo "Run '$fix_cmd' to copy the root values into $SERVER_ENV_NAME." >&2
  exit 1
fi
if [[ ${#errors[@]} -gt 0 ]]; then
  exit 1
fi

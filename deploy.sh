#!/usr/bin/env bash
#
# Xirman_Docs — production deploy (archive.xirman.az)
#
# İSTİFADƏ:
#   ./deploy.sh                 # tam deploy (api + client)
#   ./deploy.sh --api           # yalnız API
#   ./deploy.sh --client        # yalnız client
#   ./deploy.sh --check         # heç nə dəyişmir, sadəcə vəziyyəti göstərir
#   ./deploy.sh --yes           # təsdiq soruşmadan
#   ./deploy.sh --rollback <commit>
#
# ŞƏRTLƏR:
#   - WireGuard "xirman" tuneli qalxmış olmalıdır
#   - sshpass quraşdırılmalıdır (brew install sshpass) — ya da SSH açar autentifikasiyası
#   - Deploy ediləcək kod GitHub-da origin/main-də olmalıdır (lokal commit-lər YOX)
#
# TƏHLÜKƏSİZLİK — bu skript HEÇ NƏ SİLMİR:
#   - rsync --delete / git clean / git reset --hard işlədilmir
#   - api/uploads/ (istifadəçi sənədləri) toxunulmur — .gitignore-dadır
#   - .env faylları toxunulmur
#   - client dist köhnə asset faylları saxlanılır (yalnız üstünə yazılır)
#   - hər deploy-dan əvvəl baza dump-ı + dist nüsxələri alınır
#
set -euo pipefail

# ─── Konfiqurasiya (env ilə dəyişdirilə bilər) ────────────────────────────────
SSH_HOST="${XIRMAN_HOST:-10.10.20.254}"
SSH_USER="${XIRMAN_USER:-rootacad}"
API_DIR="${XIRMAN_API_DIR:-/root/Xirman_docs}"
WWW_DIR="${XIRMAN_WWW_DIR:-/var/www/Xirman_Docs/client/dist}"
BACKUP_DIR="${XIRMAN_BACKUP_DIR:-/root/backups}"
PM2_APP="${XIRMAN_PM2_APP:-xirman-api}"
DB_NAME="${XIRMAN_DB:-xirman-docs}"
BRANCH="${XIRMAN_BRANCH:-main}"
SITE_URL="${XIRMAN_SITE:-https://archive.xirman.az}"

DO_API=1
DO_CLIENT=1
ASSUME_YES=0
CHECK_ONLY=0
ROLLBACK_TO=""

# ─── Rənglər ──────────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  R=$'\033[31m'; G=$'\033[32m'; Y=$'\033[33m'; B=$'\033[34m'; D=$'\033[2m'; N=$'\033[0m'
else
  R=""; G=""; Y=""; B=""; D=""; N=""
fi
step() { printf '\n%s▸ %s%s\n' "$B" "$*" "$N"; }
ok()   { printf '%s  ✓ %s%s\n' "$G" "$*" "$N"; }
warn() { printf '%s  ! %s%s\n' "$Y" "$*" "$N"; }
die()  { printf '\n%s✗ %s%s\n' "$R" "$*" "$N" >&2; exit 1; }

# ─── Arqumentlər ──────────────────────────────────────────────────────────────
while [ $# -gt 0 ]; do
  case "$1" in
    --api)      DO_CLIENT=0 ;;
    --client)   DO_API=0 ;;
    --check)    CHECK_ONLY=1 ;;
    --yes|-y)   ASSUME_YES=1 ;;
    --rollback) ROLLBACK_TO="${2:-}"; [ -n "$ROLLBACK_TO" ] || die "--rollback üçün commit lazımdır"; shift ;;
    -h|--help)  sed -n '2,24p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *)          die "naməlum arqument: $1" ;;
  esac
  shift
done

cd "$(dirname "$0")"

# ─── SSH qurulumu ─────────────────────────────────────────────────────────────
CTL="/tmp/.xirman-deploy-$$.sock"
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=10
          -o ControlMaster=auto -o ControlPath="$CTL" -o ControlPersist=120)
cleanup() { ssh -O exit -o ControlPath="$CTL" "$SSH_USER@$SSH_HOST" 2>/dev/null || true; }
trap cleanup EXIT

# Parol: env-dən, yoxsa bir dəfə soruşulur. Heç yerə yazılmır.
SUDO_PASS="${XIRMAN_PASS:-}"
if [ -z "$SUDO_PASS" ]; then
  printf 'SSH/sudo parolu (%s@%s): ' "$SSH_USER" "$SSH_HOST" >&2
  read -rs SUDO_PASS; echo >&2
  [ -n "$SUDO_PASS" ] || die "parol boşdur"
fi

if command -v sshpass >/dev/null 2>&1; then
  export SSHPASS="$SUDO_PASS"
  SSH_CMD=(sshpass -e ssh "${SSH_OPTS[@]}" -o PreferredAuthentications=password -o PubkeyAuthentication=no)
else
  warn "sshpass yoxdur — SSH açarı ilə cəhd edilir (sudo üçün parol yenə işlədilir)"
  SSH_CMD=(ssh "${SSH_OPTS[@]}")
fi

# Uzaq skripti işlədir. Parol stdin-in ilk sətri ilə gedir:
# nə komanda sətrində, nə də diskdə görünmür.
remote() {
  local body="$1" enc
  enc=$(printf '%s' "$body" | base64 | tr -d '\n')
  printf '%s\n' "$SUDO_PASS" \
    | "${SSH_CMD[@]}" "$SSH_USER@$SSH_HOST" \
        "IFS= read -r SUDOPW; export SUDOPW; eval \"\$(printf %s '$enc' | base64 -d)\""
}

# Hər uzaq skriptin başına qoşulan köməkçilər
PRELUDE=$(cat <<PRE
set -euo pipefail
API_DIR='$API_DIR'; WWW_DIR='$WWW_DIR'; BACKUP_DIR='$BACKUP_DIR'
PM2_APP='$PM2_APP'; DB_NAME='$DB_NAME'; BRANCH='$BRANCH'
S() { printf '%s\n' "\$SUDOPW" | sudo -S -p '' "\$@"; }
PRE
)
rsh() { remote "$PRELUDE
$1"; }

# ─── 0. Lokal ön yoxlamalar ───────────────────────────────────────────────────
step "Lokal ön yoxlama"

git rev-parse --git-dir >/dev/null 2>&1 || die "git repo deyil"
git fetch origin --quiet || die "GitHub-a çıxış yoxdur"

LOCAL_HEAD=$(git rev-parse HEAD)
ORIGIN_HEAD=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL_HEAD" != "$ORIGIN_HEAD" ]; then
  if git merge-base --is-ancestor "$ORIGIN_HEAD" "$LOCAL_HEAD"; then
    warn "lokal commit-lərin var, GitHub-da deyil — deploy onları GÖTÜRMƏYƏCƏK"
    git --no-pager log --oneline "origin/$BRANCH..HEAD" | sed 's/^/    /'
  else
    warn "lokal branch origin/$BRANCH-dən fərqlidir"
  fi
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  warn "commit olunmamış dəyişikliklər var — bunlar deploy edilmir:"
  git --no-pager diff --name-only HEAD | sed 's/^/    /'
fi
ok "GitHub $BRANCH = $(git rev-parse --short "origin/$BRANCH")"

# ─── 1. Serverin vəziyyəti ────────────────────────────────────────────────────
step "Serverin vəziyyəti ($SSH_USER@$SSH_HOST)"

STATE=$(rsh '
echo "HEAD=$(S git -C "$API_DIR" rev-parse HEAD)"
echo "DIRTY=$(S git -C "$API_DIR" status --porcelain | wc -l)"
echo "UPLOADS_N=$(S bash -c "find $API_DIR/api/uploads -type f 2>/dev/null | wc -l")"
echo "UPLOADS_SZ=$(S bash -c "du -sh $API_DIR/api/uploads 2>/dev/null | cut -f1")"
echo "DOCS=$(S -u postgres psql -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM documents;" 2>/dev/null || echo "?")"
echo "USERS=$(S -u postgres psql -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "?")"
echo "PM2=$(S pm2 jlist 2>/dev/null | grep -o "\"status\":\"online\"" | head -1 | grep -o online || echo offline)"
') || die "serverə qoşulmaq alınmadı — WireGuard tuneli qalxıbmı? parol düzgündürmü?"

eval "$STATE"
SERVER_SHORT=$(git rev-parse --short "$HEAD" 2>/dev/null || echo "${HEAD:0:7}")

printf '    commit    : %s\n' "$SERVER_SHORT"
printf '    uploads   : %s fayl, %s\n' "$UPLOADS_N" "$UPLOADS_SZ"
printf '    baza      : %s sənəd, %s istifadəçi\n' "$DOCS" "$USERS"
printf '    pm2       : %s\n' "$PM2"
[ "$DIRTY" -gt 0 ] && warn "serverdə $DIRTY commit olunmamış fayl var (ff-only ilə qorunacaq)" || true

# ─── 2. Nə deploy olunacaq ────────────────────────────────────────────────────
if [ -n "$ROLLBACK_TO" ]; then
  TARGET=$(git rev-parse "$ROLLBACK_TO") || die "commit tapılmadı: $ROLLBACK_TO"
  step "ROLLBACK → $(git rev-parse --short "$TARGET")"
else
  TARGET="$ORIGIN_HEAD"
  step "Deploy ediləcək dəyişikliklər"

  if [ "$HEAD" = "$TARGET" ]; then
    ok "server artıq güncəldir — kod dəyişikliyi yoxdur"
    if [ "$CHECK_ONLY" -eq 1 ]; then exit 0; fi
    if [ "$ASSUME_YES" -eq 0 ]; then
      read -rp "  Yenidən build edilsin? [y/N] " a; [ "$a" = y ] || exit 0
    fi
  else
    git cat-file -e "$HEAD" 2>/dev/null || die "serverin commit-i ($SERVER_SHORT) lokalda yoxdur — 'git fetch' et"
    git merge-base --is-ancestor "$HEAD" "$TARGET" \
      || die "fast-forward mümkün deyil: serverin commit-i origin/$BRANCH-in əcdadı deyil"
    git --no-pager log --oneline "$HEAD..$TARGET" | sed 's/^/    /'

    # synchronize:true olduğuna görə entity dəyişiklikləri sxemi dəyişir
    ENTITIES=$(git diff --name-only "$HEAD..$TARGET" -- '*entity.ts')
    if [ -n "$ENTITIES" ]; then
      echo
      warn "ENTITY DƏYİŞİKLİYİ — TypeORM synchronize:true sxemi avtomatik dəyişəcək:"
      echo "$ENTITIES" | sed 's/^/      /'
      NEWONLY=$(git diff --diff-filter=A --name-only "$HEAD..$TARGET" -- '*entity.ts')
      if [ "$ENTITIES" = "$NEWONLY" ]; then
        ok "hamısı YENİ entity-dir → yalnız cədvəl yaradılacaq, heç nə silinməyəcək"
      else
        warn "MÖVCUD entity dəyişib → sütun silinmə/dəyişmə RİSKİ var. Diff-i yoxla:"
        printf '      git diff %s..%s -- "*entity.ts"\n' "$SERVER_SHORT" "$(git rev-parse --short "$TARGET")"
      fi
    fi
  fi
fi

if [ "$CHECK_ONLY" -eq 1 ]; then
  echo; ok "--check rejimi: heç nə dəyişdirilmədi"; exit 0
fi

if [ "$ASSUME_YES" -eq 0 ]; then
  echo
  printf '  %sDeploy edilsin? [y/N]%s ' "$Y" "$N"
  read -r a; [ "$a" = y ] || { echo "  ləğv edildi"; exit 0; }
fi

TS=$(date +%Y%m%d_%H%M%S)

# ─── 3. Ehtiyat nüsxələr ──────────────────────────────────────────────────────
step "Ehtiyat nüsxələr"
rsh "
S mkdir -p \"\$BACKUP_DIR\"
S -u postgres pg_dump -d \"\$DB_NAME\" -F c -f /tmp/db_$TS.dump
S cp /tmp/db_$TS.dump \"\$BACKUP_DIR/${DB_NAME}_$TS.dump\"
S rm -f /tmp/db_$TS.dump
S cp -a \"\$API_DIR/api/dist\" \"\$BACKUP_DIR/api_dist_$TS\" 2>/dev/null || true
S cp -a \"\$WWW_DIR\" \"\$BACKUP_DIR/wwwclient_dist_$TS\" 2>/dev/null || true
S ls -lh \"\$BACKUP_DIR/${DB_NAME}_$TS.dump\" | awk '{print \"    baza dump: \" \$5}'
"
ok "nüsxələr $BACKUP_DIR/*_$TS"
echo "    ROLLBACK COMMIT: $SERVER_SHORT"

# ─── 4. Kodu çək ──────────────────────────────────────────────────────────────
step "Kodu çək"
if [ -n "$ROLLBACK_TO" ]; then
  rsh "S git -C \"\$API_DIR\" fetch origin
S git -C \"\$API_DIR\" checkout --detach $TARGET"
else
  rsh "S git -C \"\$API_DIR\" fetch origin
S git -C \"\$API_DIR\" checkout \"\$BRANCH\"
S git -C \"\$API_DIR\" merge --ff-only origin/\"\$BRANCH\""
fi
ok "commit → $(git rev-parse --short "$TARGET")"

# ─── 5. API ───────────────────────────────────────────────────────────────────
if [ "$DO_API" -eq 1 ]; then
  step "API build və restart"
  rsh 'S bash -lc "cd $API_DIR/api && pnpm install 2>&1 | tail -3"'
  rsh 'S bash -lc "cd $API_DIR/api && pnpm run build"' || die "API build uğursuz — kod dəyişmədi, pm2 restart edilmədi"
  ok "build"

  rsh 'S pm2 restart "$PM2_APP" --update-env >/dev/null && echo "    restart OK"'
  sleep 8

  HEALTH=$(rsh '
    st=$(S pm2 jlist | tr "," "\n" | grep -c "\"status\":\"online\"" || true)
    echo "PM2_ONLINE=$st"
    S pm2 logs "$PM2_APP" --lines 60 --nostream 2>&1 \
      | grep -c "Nest application successfully started" || echo "STARTED=0"
  ')
  if echo "$HEALTH" | grep -q "PM2_ONLINE=0"; then
    die "API qalxmadı! Loglara bax:  ssh $SSH_USER@$SSH_HOST 'sudo pm2 logs $PM2_APP --lines 50'
    Rollback:  ./deploy.sh --rollback $SERVER_SHORT"
  fi
  ok "API online"
fi

# ─── 6. Client ────────────────────────────────────────────────────────────────
if [ "$DO_CLIENT" -eq 1 ]; then
  step "Client build və yayım"
  rsh 'S bash -lc "cd $API_DIR/client && pnpm install 2>&1 | tail -3"'
  rsh 'S bash -lc "cd $API_DIR/client && NODE_OPTIONS=--max-old-space-size=2048 pnpm run build 2>&1 | tail -6"' \
    || die "client build uğursuz — nginx hələ də köhnə versiyanı verir (sayt işləyir)"
  ok "build"

  # cp -a: SİLMİR, yalnız üstünə yazır. Köhnə hash-lı asset-lər qalır ki,
  # keşdə köhnə index.html tutan brauzerlər sınmasın.
  rsh 'S cp -a "$API_DIR/client/dist/." "$WWW_DIR/"
S chown -R www-data:www-data "$WWW_DIR"'
  ok "nginx qovluğuna yayımlandı (köhnə asset-lər silinmədi)"
fi

# ─── 7. Yekun yoxlama ─────────────────────────────────────────────────────────
step "Yekun yoxlama"
AFTER=$(rsh '
echo "A_UPLOADS_N=$(S bash -c "find $API_DIR/api/uploads -type f 2>/dev/null | wc -l")"
echo "A_UPLOADS_SZ=$(S bash -c "du -sh $API_DIR/api/uploads 2>/dev/null | cut -f1")"
echo "A_DOCS=$(S -u postgres psql -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM documents;" 2>/dev/null || echo "?")"
echo "A_USERS=$(S -u postgres psql -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "?")"
echo "A_BUNDLE=$(S grep -oE "assets/index-[A-Za-z0-9_-]+\.js" "$WWW_DIR/index.html" | head -1)"
')
eval "$AFTER"

FAIL=0
chk() { # ad, əvvəl, sonra
  if [ "$2" = "$3" ]; then printf '    %-10s %s → %s %s✓%s\n' "$1" "$2" "$3" "$G" "$N"
  else printf '    %-10s %s → %s %sDƏYİŞİB!%s\n' "$1" "$2" "$3" "$R" "$N"; FAIL=1; fi
}
chk "uploads"   "$UPLOADS_N" "$A_UPLOADS_N"
chk "həcm"      "$UPLOADS_SZ" "$A_UPLOADS_SZ"
chk "documents" "$DOCS" "$A_DOCS"
chk "users"     "$USERS" "$A_USERS"
printf '    %-10s %s\n' "bundle" "${A_BUNDLE:-?}"

CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$SITE_URL" || echo 000)
if [ "$CODE" = "200" ]; then ok "$SITE_URL → 200"
else warn "$SITE_URL → $CODE (VPN-dən yoxlayırsansa normal ola bilər)"; fi

echo
if [ "$FAIL" -eq 1 ]; then
  die "MƏLUMAT SAYĞACLARI DƏYİŞİB — yoxla!  Rollback: ./deploy.sh --rollback $SERVER_SHORT"
fi

printf '%s✓ Deploy tamamlandı%s  %s → %s\n' "$G" "$N" "$SERVER_SHORT" "$(git rev-parse --short "$TARGET")"
printf '%s  Rollback:  ./deploy.sh --rollback %s%s\n' "$D" "$SERVER_SHORT" "$N"
printf '%s  Brauzerdə görünmürsə: hard refresh (Cmd+Shift+R) — keş.%s\n' "$D" "$N"

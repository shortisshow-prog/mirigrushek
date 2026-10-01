#!/usr/bin/env bash
# =====================================================================
#  Этап 1: подготовка сервера колледжа под почту colm.spb.ru
#  Безопасно: диски и существующие данные НЕ трогаются.
#  Запуск:  sudo bash setup-stage1.sh
#  Результат: отчёт report-<дата>.txt рядом с этим файлом (на флешке).
# =====================================================================
set -u
export DEBIAN_FRONTEND=noninteractive

HERE="$(cd "$(dirname "$0")" && pwd)"
STAMP="$(date +%Y%m%d-%H%M)"
REPORT="${HERE}/report-${STAMP}.txt"
LOG="${HERE}/install-${STAMP}.log"
VDS_IP="46.23.98.137"

say()  { echo -e "\n\033[1;32m==> $*\033[0m"; echo "==> $*" >>"$LOG"; }
warn() { echo -e "\033[1;33m[!] $*\033[0m"; echo "[!] $*" >>"$LOG"; }

# --- 0. Проверки -------------------------------------------------------
if [ "$(id -u)" -ne 0 ]; then
    echo "Запустите через sudo:  sudo bash $0"; exit 1
fi
. /etc/os-release
case "${VERSION_ID:-}" in
    26.04*|24.04*) say "Система: ${PRETTY_NAME} — подходит" ;;
    *) warn "Система ${PRETTY_NAME:-неизвестна}. Нужна Ubuntu 26.04 или 24.04 LTS."
       read -rp "Продолжить всё равно? [y/N] " a; [ "${a:-n}" = "y" ] || exit 1 ;;
esac
touch "$REPORT" 2>/dev/null || { REPORT="/root/report-${STAMP}.txt"; LOG="/root/install-${STAMP}.log"
    warn "Флешка недоступна для записи, отчёт будет в ${REPORT}"; }

# --- 1. Обновление системы --------------------------------------------
say "1/6 Обновление системы (5–15 минут)"
APT_OPTS=(-y -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold)
apt-get update >>"$LOG" 2>&1
apt-get "${APT_OPTS[@]}" upgrade >>"$LOG" 2>&1 || warn "upgrade завершился с ошибкой, см. $LOG"

# --- 2. Базовые программы ---------------------------------------------
say "2/6 Установка инструментов"
apt-get "${APT_OPTS[@]}" install \
    openssh-server curl wget ca-certificates gnupg rsync tmux htop iotop \
    mdadm smartmontools lvm2 parted net-tools dnsutils iputils-ping mtr-tiny \
    wireguard wireguard-tools nut chrony unattended-upgrades >>"$LOG" 2>&1 \
    || warn "часть пакетов не установилась, см. $LOG"
systemctl enable --now ssh >>"$LOG" 2>&1
systemctl enable --now chrony >>"$LOG" 2>&1

# --- 3. Графическая оболочка XFCE (X11) -------------------------------
say "3/6 Графическая оболочка XFCE (минимальная)"
if ! dpkg -l xubuntu-core 2>/dev/null | grep -q '^ii'; then
    apt-get "${APT_OPTS[@]}" install xubuntu-core >>"$LOG" 2>&1 \
        || warn "XFCE не установилась, см. $LOG"
fi
# сессия по умолчанию — Xfce (X11, нужна для RustDesk/AnyDesk)
mkdir -p /etc/lightdm/lightdm.conf.d
cat >/etc/lightdm/lightdm.conf.d/50-xfce.conf <<'CONF'
[Seat:*]
user-session=xfce
CONF
systemctl set-default graphical.target >>"$LOG" 2>&1

# --- 4. RustDesk (удалённый доступ) -----------------------------------
say "4/6 RustDesk (удалённый рабочий стол)"
if ! command -v rustdesk >/dev/null 2>&1; then
    URL="$(curl -fsSL https://api.github.com/repos/rustdesk/rustdesk/releases/latest 2>>"$LOG" \
          | grep -oE 'https://[^"]+x86_64\.deb' | head -1)"
    if [ -n "$URL" ] && curl -fsSL "$URL" -o /tmp/rustdesk.deb 2>>"$LOG"; then
        apt-get "${APT_OPTS[@]}" install /tmp/rustdesk.deb >>"$LOG" 2>&1 \
            && systemctl enable --now rustdesk >>"$LOG" 2>&1 \
            || warn "RustDesk не установился, см. $LOG"
    else
        warn "Не удалось скачать RustDesk (поставим позже вручную)"
    fi
fi

# --- 5. Ключи WireGuard (туннель пока НЕ поднимается) -----------------
say "5/6 Ключи WireGuard для туннеля до VDS"
umask 077
mkdir -p /etc/wireguard
[ -f /etc/wireguard/server.key ] || wg genkey >/etc/wireguard/server.key
wg pubkey </etc/wireguard/server.key >/etc/wireguard/server.pub
umask 022

# --- 6. Проверка и отчёт ----------------------------------------------
say "6/6 Проверка сервера и запись отчёта"
{
echo "===== ОТЧЁТ СЕРВЕРА $(date '+%F %T') ====="
echo; echo "## Система";        hostnamectl 2>/dev/null | grep -E 'hostname|Operating|Kernel|Hardware|Virtualization'
echo; echo "## Процессор";      echo "ядер: $(nproc)"; grep -m1 'model name' /proc/cpuinfo
echo; echo "## Память";         free -h
echo; echo "## Диски";          lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT,MODEL | grep -v loop
echo; echo "## Разделы";        df -hT | grep -vE 'tmpfs|loop|udev|efivarfs'
echo; echo "## RAID";           cat /proc/mdstat 2>/dev/null
echo; echo "## Здоровье дисков (SMART)"
for d in $(lsblk -dno NAME,TYPE | awk '$2=="disk"{print $1}'); do
    printf "%-8s %s\n" "$d" "$(smartctl -H /dev/$d 2>/dev/null | grep -iE 'overall|result|SMART Health' | head -1)"
done
echo; echo "## Сеть";           ip -4 -br a | grep -v '^lo'
echo; echo "## Маршрут";        ip route | grep default
GW="$(ip route | awk '/default/{print $3; exit}')"
echo; echo "## Пинг шлюза ${GW}"; ping -c 2 -W 2 "$GW" 2>&1 | tail -2
echo; echo "## Пинг 10.1.1.1 (pfSense главного корпуса)"; ping -c 2 -W 2 10.1.1.1 2>&1 | tail -2
echo; echo "## Внешний IP";      curl -s --max-time 10 ifconfig.me; echo
echo; echo "## Доступ к VDS ${VDS_IP}"
for p in 22 25 443; do
    timeout 7 bash -c "echo > /dev/tcp/${VDS_IP}/${p}" 2>/dev/null && echo "TCP ${p}: ДОСТУПЕН" || echo "TCP ${p}: НЕДОСТУПЕН"
done
echo; echo "## DNS";            getent hosts mail.colm.spb.ru || echo "DNS не работает"
echo; echo "## Работающие службы"
systemctl list-units --type=service --state=running --no-pager --no-legend \
  | awk '{print $1}' | grep -vE 'systemd|getty|dbus|cron|polkit|udev|journal|rsyslog|networkd|resolved|timesyncd|multipathd|ModemManager|unattended|user@|snapd|irqbalance|packagekit|fwupd|thermald|upower|udisks|accounts|avahi|colord|cups|lightdm|NetworkManager|wpa|rtkit|switcheroo|power-profiles|chrony|ssh'
echo; echo "## Занятые порты";  ss -tlnp 2>/dev/null | awk 'NR>1{print $4, $6}' | sort -u
echo; echo "## ИБП (NUT)";      lsusb 2>/dev/null | grep -iE 'ups|apc|eaton|ippon|powercom|cyber' || echo "ИБП по USB не найден"
echo; echo "## RustDesk ID";    (rustdesk --get-id 2>/dev/null || echo "нет")
echo; echo "## WireGuard: публичный ключ сервера (не секрет)"; cat /etc/wireguard/server.pub
echo; echo "===== КОНЕЦ ОТЧЁТА ====="
} >"$REPORT" 2>&1

echo
echo "====================================================================="
echo " Готово. Отчёт: ${REPORT}"
echo " Пришлите его содержимое в чат (там нет паролей и секретных ключей)."
echo " Затем перезагрузите сервер:  sudo reboot"
echo " После перезагрузки на экране входа выбирайте сессию «Xfce Session»."
echo "====================================================================="

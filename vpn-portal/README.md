# VPN-портал

Страница выдачи подписок 3x-ui: человек вводит **имя + PIN** и получает ссылку подписки, QR-код и кнопку «Открыть в Happ».

- Имя есть в панели (`<имя>-hy2` / `<имя>-xhttp`) → выдаётся его subId. При первом входе введённый PIN запоминается.
- Имени нет → создаётся клиент в обоих inbound'ах с общим subId (если задан `INVITE_CODE` — только с кодом).
- Адрес подписки читается из настроек панели (`subURI`, или `subDomain`/`subPort`/`subPath`), так что после смены
  адреса/пути подписки в панели ничего править не надо. Можно жёстко задать `SUB_BASE`.
- 5 неверных PIN за 10 минут → блокировка по IP и по имени.

Зависимостей нет — только Python 3 (есть в Ubuntu 24.04).

## Установка на финский сервер

```bash
mkdir -p /opt/vpn-portal && cp -r server.py static /opt/vpn-portal/
cp vpn-portal.env.example /etc/vpn-portal.env && chmod 600 /etc/vpn-portal.env
nano /etc/vpn-portal.env          # логин/пароль панели, INVITE_CODE
cp vpn-portal.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now vpn-portal
ufw allow 8080/tcp
```

Открыть: `http://2.27.48.61:8080`. Логи: `journalctl -u vpn-portal -f`.

Для HTTPS поставьте перед ним nginx/caddy с сертификатом из `/etc/letsencrypt/live/2.27.48.61/` и `LISTEN=127.0.0.1:8080`.

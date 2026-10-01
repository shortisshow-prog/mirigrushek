# Почтовый сервер colm.spb.ru — состояние работ (для продолжения в новой сессии)

> Claude: прочитай этот файл целиком и продолжай с раздела «Следующий шаг».
> Общение с пользователем — на русском. Пользователь сам вставляет команды
> на сервер и присылает вывод (из облачной сессии исходящий SSH закрыт).

## Серверы

| Сервер | IP | Хостер | Роль |
|---|---|---|---|
| Старый `vdska` | 5.178.3.48 | VDSka | Сайт `reyting.colm.spb.ru`. **НЕ ТРОГАТЬ**, используется только как SSH-мост |
| Новый (почта) | 95.140.148.181 | VDSka (AS50053, Москва) | Будущий `mail.colm.spb.ru` |

Новый VDS: 2 ядра, 2 ГБ RAM, 20 ГБ SSD, Ubuntu 24.04, логин `root`.
Пароль root — в письме активации от VDSka (и в истории прошлой сессии). В репозиторий не записывать.
После настройки: поставить вход по SSH-ключу и сменить пароль root.

## Как попасть на новый сервер

Из сети колледжа напрямую на 95.140.148.181:22 не пускает (timeout). Проверка через check-host.net
показала: сервер жив, SSH открыт из части сетей, из других сетей timeout. Решение: заходить через старый сервер:

```
ssh root@5.178.3.48                                             # с ПК пользователя
ssh -o StrictHostKeyChecking=accept-new root@95.140.148.181     # уже со старого сервера
hostname -I                                                      # проверка: должно быть 95.140.148.181
```

Заметки про ПК пользователя (Windows, PowerShell):
- Внешний IP колледжа (без VPN): 5.183.29.53
- Работает VPN Happ (интерфейс `happ-xray`), ping через него фальшивый (<1 мс).
- Добавлен постоянный маршрут в обход VPN: `route -p add 95.140.148.181 mask 255.255.255.255 10.1.1.1`
  (Ethernet). Напрямую всё равно timeout. Удалить можно командой `route delete 95.140.148.181`.

## Решения, принятые с пользователем

- Домен: `colm.spb.ru`, DNS на **reg.ru**. Сайт `colm.spb.ru` → 185.215.4.50 (другой сервер, не трогать).
  `reyting.colm.spb.ru` → 5.178.3.48. MX/SPF/DMARC до начала работ отсутствовали.
- Почтовый хост: `mail.colm.spb.ru` → 95.140.148.181.
- Ставим **iRedMail** (выбор пользователя): Nginx + MariaDB + Roundcube + iRedAdmin + Fail2ban, **без SOGo**.
  После установки **отключить ClamAV** (не хватает RAM), добавить swap 2 ГБ.
- Веб-почта: `https://mail.colm.spb.ru/mail`, админка: `https://mail.colm.spb.ru/iredadmin` (postmaster@colm.spb.ru).
- **Формат адресов преподавателей:** фамилия + точка + первая буква имени, латиница по паспортной
  транслитерации: Иванов Пётр → `ivanov.p@colm.spb.ru`.
  При совпадении — две первые буквы имени: `ivanov.pe`, `ivanov.pa`.
  Полные тёзки: показать пользователю, решить вручную.
- Служебные ящики: обязательно `postmaster@`, `abuse@`.
- Выдать пользователю таблицу «ФИО — адрес — пароль» + памятку для преподавателей
  (веб-почта, телефон, Outlook/Thunderbird).
- Диск 20 ГБ → квота около 500 МБ на ящик (уточнить число преподавателей, пока неизвестно).

## Статус

- [x] Выбран стек, формат адресов
- [x] Найден способ входа на новый сервер (через старый)
- [ ] Пользователь вносит в reg.ru: `A  mail  95.140.148.181` (инструкция дана, подтверждения не было)
- [ ] Тикет в VDSka (текст дан пользователю, отправка не подтверждена): PTR 95.140.148.181 → mail.colm.spb.ru, открыть исходящий 25, проверить фильтр порта 22
      (отчёт check-host: https://check-host.net/check-report/4e421b47k18a)
- [ ] Подготовка сервера (Шаг 1): **ВЫ ОСТАНОВИЛИСЬ ЗДЕСЬ**, пользователь как раз заходил на новый сервер
- [ ] Установка iRedMail
- [ ] Отключение ClamAV, Let's Encrypt, DKIM
- [ ] DNS: MX, SPF, DKIM, DMARC в reg.ru
- [ ] Проверка доставки (mail-tester, Gmail/Яндекс/Mail.ru)
- [ ] Создание ящиков по списку ФИО, таблица паролей, памятка

## Следующий шаг

Убедиться, что пользователь на НОВОМ сервере (`hostname -I` → 95.140.148.181), затем дать выполнить:

```bash
hostnamectl set-hostname mail.colm.spb.ru
sed -i '/95.140.148.181/d' /etc/hosts
echo "95.140.148.181 mail.colm.spb.ru mail" >> /etc/hosts
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
apt update && apt -y upgrade && apt -y install wget tar gzip
hostname -f; free -h; df -h /
timeout 7 bash -c 'echo > /dev/tcp/gmail-smtp-in.l.google.com/25' && echo "PORT 25 OPEN" || echo "PORT 25 BLOCKED"
```

Затем iRedMail (проверить актуальную версию на github.com/iredmail/iRedMail/releases):

```bash
cd /root && wget https://github.com/iredmail/iRedMail/archive/refs/tags/1.7.4.tar.gz -O iredmail.tar.gz
tar xzf iredmail.tar.gz && cd iRedMail-1.7.4 && bash iRedMail.sh
```

Ответы мастера: /var/vmail; Nginx; MariaDB; пароль MySQL root (записать); домен `colm.spb.ru`;
пароль postmaster (записать); компоненты: Roundcube + iRedAdmin + Fail2ban, SOGo снять;
firewall — Y, restart firewall — Y. Потом `reboot`.

## Диагностика SSH (итог)

- Хостер VDSka: фильтров нет. PTR 95.140.148.181 → mail.colm.spb.ru прописан (проверено), исходящий 25 открыт (проверено с сервера).
- A-запись mail.colm.spb.ru → 95.140.148.181 в reg.ru внесена (проверено).
- Роутер колледжа: pfSense 2.7.0 (10.1.1.1, WAN 10.131.3.226, за NAT провайдера, внешний IP 5.183.29.53).
- pfSense Diagnostics → Test Port: 5.178.3.48:22 успешно, 95.140.148.181:22 failed.
  Трассировка обрывается после 10.178.253.162, то есть у **провайдера колледжа** работает белый список.
  Нужна заявка провайдеру: разрешить 95.140.148.181, TCP 22, 25, 80, 443, 465, 587, 993.
  Без этого преподаватели из колледжа не попадут в почту (из дома доступ будет).
- Swap: оставлен штатный /swap.img 1.9G, наш /swapfile удалён. Hostname: mail.colm.spb.ru.
- Проверка из pfSense: 5.178.3.20/.40/.50:22 — успешно. Белый список провайдера работает **по подсети 5.178.3.0/24**.
  Решение: попросить VDSka заменить IP 95.140.148.181 на адрес из 5.178.3.0/24.
  После замены: обновить A-запись mail в reg.ru, PTR у VDSka, /etc/hosts, и только потом ставить iRedMail.
- УТОЧНЕНИЕ: из pfSense проходят и 95.140.148.180, и другие подсети VDSka (193.56.3.x, 2.26.136.x и др.), и 5.178.2.x.
  Значит, провайдер блокирует **именно адрес 95.140.148.181** (вероятно, IP в реестре блокировок).
  В тикет №109045 отправлена просьба заменить IP (желательно из 5.178.3.0/24) + PTR на новый IP. Ждём ответа.
  Новый IP сначала проверить в pfSense → Diagnostics → Test Port (порт 22).

## НОВЫЙ СЕРВЕР ДЛЯ ПОЧТЫ: 46.23.98.137 (VDSka)
- Заказан третий VDS взамен 95.140.148.181 (тот удалить после запуска почты). Пароль root — в письме VDSka.
- SSH 22 доступен извне (check-host: RU, DE — ок). Проверить из колледжа через pfSense Test Port.
- Нужно: в reg.ru изменить A mail → 46.23.98.137; у VDSka PTR 46.23.98.137 → mail.colm.spb.ru.
- Дальше: Шаг 1 (подготовка, hostname/hosts с новым IP) и установка iRedMail. Все команды выше — заменить 95.140.148.181 на 46.23.98.137.

## Прогресс на 46.23.98.137
- [x] A mail → 46.23.98.137 (reg.ru), PTR 46.23.98.137 → mail.colm.spb.ru (VDSka) — проверено
- [x] iRedMail 1.8.8 установлен (Nginx, MariaDB, Roundcube, iRedAdmin, Fail2ban, без SOGo), firewall nftables
- [x] ClamAV отключён (systemctl disable clamav-daemon clamav-freshclam; amavis @bypass_virus_checks_maps = (1))
- [x] fail2ban: был failed (нет /var/log/mail.log) → touch mail.log + restart; 6 jails активны
- [x] DKIM: селектор `dkim`, ключ /var/lib/dkim/colm.spb.ru.pem (показать: amavisd showkeys)
- [x] (внесено, проверено) MX @ → mail.colm.spb.ru (10); TXT @ "v=spf1 mx -all";
      TXT dkim._domainkey (ключ); TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:postmaster@colm.spb.ru; adkim=s; aspf=s";
      CNAME autoconfig/autodiscover → mail.colm.spb.ru
- [x] Let's Encrypt: certbot --standalone с pre/post-hook stop/start nginx (webroot /var/www/html дал 404); симлинки в /etc/ssl/certs/iRedMail.crt и /etc/ssl/private/iRedMail.key; deploy-hook в cli.ini
- [ ] Тест отправки (mail-tester), служебные ящики, ящики преподавателей, памятка
- [ ] Удалить VDS 95.140.148.181; сменить пароль root, SSH-ключ
- [x] DNS на сервере был сломан (systemd-resolved не резолвил A) → установлен unbound, systemd-resolved отключён,
      /etc/unbound/unbound.conf.d/local.conf: interface 127.0.0.1, do-ip6 no (IPv6 на сервере нет);
      /etc/resolv.conf и /var/spool/postfix/etc/resolv.conf → nameserver 127.0.0.1. Письма на mail.ru и mail-tester ушли (status=sent).
- [x] mail-tester: 10/10. Отправка на mail.ru и приём с mail.ru работают.
      Входящие висели в amavis (процессы зависли, пока DNS был сломан) → systemctl restart amavis + postfix flush.
      Грейлистинг iRedAPD включён (первое письмо от нового сервера задерживается 5–15 мин; SPF-совпадение — без задержки).
- [ ] СЛЕДУЮЩЕЕ: список преподавателей → ящики, квота, таблица паролей, памятка; удалить VDS 95.140.148.181; passwd root.

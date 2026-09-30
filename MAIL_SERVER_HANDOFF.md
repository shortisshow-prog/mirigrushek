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
- [ ] Тикет в VDSka: PTR 95.140.148.181 → mail.colm.spb.ru, открыть исходящий 25, проверить фильтр порта 22
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

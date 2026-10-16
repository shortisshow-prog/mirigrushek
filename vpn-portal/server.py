#!/usr/bin/env python3
"""VPN-портал: выдача подписки 3x-ui по имени + PIN. Только стандартная библиотека."""
import hashlib, hmac, http.cookiejar, json, os, re, secrets, sqlite3, ssl, threading, time, uuid
import urllib.parse, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PANEL_URL = os.environ.get("PANEL_URL", "https://127.0.0.1:28461/nl7Kq2vX").rstrip("/")
PANEL_USER = os.environ["PANEL_USER"]
PANEL_PASS = os.environ["PANEL_PASS"]
# Если пусто — адрес подписки берётся из настроек панели (subURI / subDomain / subPort / subPath).
SUB_BASE = os.environ.get("SUB_BASE", "").rstrip("/")
PUBLIC_HOST = os.environ.get("PUBLIC_HOST", "2.27.48.61")
HY2_INBOUND = os.environ.get("HY2_REMARK", "Finland-Hysteria2")
XHTTP_INBOUND = os.environ.get("XHTTP_REMARK", "Finland-VLESS-H3")
INVITE_CODE = os.environ.get("INVITE_CODE", "")  # пусто = регистрация открыта
LISTEN = os.environ.get("LISTEN", "127.0.0.1:8080")
DB_PATH = os.environ.get("DB_PATH", str(Path(__file__).with_name("portal.db")))
STATIC = Path(__file__).with_name("static")
NAME_RE = re.compile(r"^[a-z0-9_]{2,24}$")

# Панель слушает с сертификатом на IP; к localhost ходим без проверки имени.
_ctx = ssl.create_default_context()
if urllib.parse.urlparse(PANEL_URL).hostname in ("127.0.0.1", "localhost"):
    _ctx.check_hostname = False
    _ctx.verify_mode = ssl.CERT_NONE


class Panel:
    def __init__(self):
        self.lock = threading.Lock()
        self._login()

    def _login(self):
        self.jar = http.cookiejar.CookieJar()
        self.op = urllib.request.build_opener(
            urllib.request.HTTPSHandler(context=_ctx), urllib.request.HTTPCookieProcessor(self.jar))
        r = self._raw("POST", "/login", {"username": PANEL_USER, "password": PANEL_PASS}, form=True)
        if not r.get("success"):
            raise RuntimeError("Не удалось войти в панель 3x-ui")

    def _raw(self, method, path, data=None, form=False):
        body, headers = None, {"Accept": "application/json"}
        if data is not None:
            if form:
                body = urllib.parse.urlencode(data).encode()
                headers["Content-Type"] = "application/x-www-form-urlencoded"
            else:
                body = json.dumps(data).encode()
                headers["Content-Type"] = "application/json"
        req = urllib.request.Request(PANEL_URL + path, data=body, method=method, headers=headers)
        with self.op.open(req, timeout=15) as resp:
            return json.loads(resp.read() or b"{}")

    def call(self, method, path, data=None, form=False):
        with self.lock:
            try:
                r = self._raw(method, path, data, form)
            except Exception:
                r = None
            if not r or (not r.get("success") and "login" in str(r.get("msg", "")).lower()):
                self._login()
                r = self._raw(method, path, data, form)
            return r

    def inbounds(self):
        return self.call("GET", "/panel/api/inbounds/list").get("obj") or []

    def sub_base(self):
        if SUB_BASE:
            return SUB_BASE
        s = self.call("POST", "/panel/setting/all").get("obj") or {}
        if s.get("subURI"):
            return s["subURI"].rstrip("/")
        host = s.get("subDomain") or PUBLIC_HOST
        port = s.get("subPort") or 2096
        path = (s.get("subPath") or "/sub/").strip("/")
        return f"https://{host}:{port}/{path}"

    def find_sub_id(self, name):
        for ib in self.inbounds():
            for c in json.loads(ib.get("settings") or "{}").get("clients", []):
                if c.get("email") in (f"{name}-hy2", f"{name}-xhttp") and c.get("subId"):
                    return c["subId"]
        return None

    def create(self, name):
        sub_id = secrets.token_hex(8)
        by_remark = {ib["remark"]: ib for ib in self.inbounds()}
        for remark, suffix in ((HY2_INBOUND, "hy2"), (XHTTP_INBOUND, "xhttp")):
            ib = by_remark.get(remark)
            if not ib:
                raise RuntimeError(f"Inbound «{remark}» не найден")
            client = {"email": f"{name}-{suffix}", "enable": True, "subId": sub_id, "limitIp": 0,
                      "totalGB": 0, "expiryTime": 0, "tgId": "", "reset": 0, "flow": ""}
            if ib["protocol"] == "hysteria2" or ib["protocol"] == "hysteria":
                client["auth"] = secrets.token_urlsafe(16)
            else:
                client["id"] = str(uuid.uuid4())
            r = self.call("POST", "/panel/api/inbounds/addClient",
                          {"id": ib["id"], "settings": json.dumps({"clients": [client]})})
            if not r.get("success"):
                raise RuntimeError(r.get("msg") or "Панель отказала в создании клиента")
        return sub_id


def db():
    con = sqlite3.connect(DB_PATH)
    con.execute("create table if not exists users(name text primary key, salt blob, hash blob, created real)")
    return con


def pin_hash(pin, salt):
    return hashlib.pbkdf2_hmac("sha256", pin.encode(), salt, 200_000)


_fails, _fails_lock = {}, threading.Lock()


def throttled(key):
    now = time.time()
    with _fails_lock:
        hits = [t for t in _fails.get(key, []) if now - t < 600]
        _fails[key] = hits
        return len(hits) >= 5


def fail(key):
    with _fails_lock:
        _fails.setdefault(key, []).append(time.time())


panel = None


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def send(self, code, obj=None, body=None, ctype="application/json; charset=utf-8"):
        data = body if body is not None else json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            return self.send(200, body=(STATIC / "index.html").read_bytes(), ctype="text/html; charset=utf-8")
        if self.path == "/api/config":
            return self.send(200, {"invite": bool(INVITE_CODE)})
        self.send(404, {"error": "Не найдено"})

    def do_POST(self):
        if self.path != "/api/access":
            return self.send(404, {"error": "Не найдено"})
        try:
            req = json.loads(self.rfile.read(min(int(self.headers.get("Content-Length", 0)), 4096)))
        except Exception:
            return self.send(400, {"error": "Плохой запрос"})
        name = str(req.get("name", "")).strip().lower()
        pin = str(req.get("pin", ""))
        ip = self.headers.get("X-Real-IP") or self.client_address[0]
        if not NAME_RE.match(name):
            return self.send(400, {"error": "Имя: 2–24 символа, латиница, цифры, _"})
        if not re.fullmatch(r"\d{4,8}", pin):
            return self.send(400, {"error": "PIN: от 4 до 8 цифр"})
        if throttled(ip) or throttled("n:" + name):
            return self.send(429, {"error": "Слишком много попыток. Подождите 10 минут"})
        try:
            with db() as con:
                row = con.execute("select salt, hash from users where name=?", (name,)).fetchone()
                sub_id = panel.find_sub_id(name)
                created = False
                if row:
                    if not hmac.compare_digest(pin_hash(pin, row[0]), row[1]):
                        fail(ip); fail("n:" + name)
                        return self.send(403, {"error": "Неверный PIN"})
                    if not sub_id:
                        sub_id, created = panel.create(name), True
                else:
                    if not sub_id:  # совсем новый человек
                        if INVITE_CODE and not hmac.compare_digest(str(req.get("invite", "")), INVITE_CODE):
                            fail(ip)
                            return self.send(403, {"error": "Нужен верный инвайт-код", "needInvite": True})
                        sub_id, created = panel.create(name), True
                    # клиент из панели без PIN — первый вход задаёт PIN
                    salt = secrets.token_bytes(16)
                    con.execute("insert into users values(?,?,?,?)", (name, salt, pin_hash(pin, salt), time.time()))
            return self.send(200, {"name": name, "created": created, "url": f"{panel.sub_base()}/{sub_id}"})
        except Exception as e:
            return self.send(502, {"error": f"Ошибка панели: {e}"})


if __name__ == "__main__":
    panel = Panel()
    host, port = LISTEN.rsplit(":", 1)
    print(f"VPN-портал на http://{LISTEN}")
    ThreadingHTTPServer((host, int(port)), Handler).serve_forever()

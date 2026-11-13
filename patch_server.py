#!/usr/bin/env python3
import re, shutil, subprocess, sys, time, os

BASE = os.path.dirname(os.path.abspath(__file__))
SERVER = os.path.join(BASE, 'server.js')
if not os.path.exists(SERVER):
    sys.exit('server.js pa jwenn.')
if not os.path.exists(os.path.join(BASE, 'api', 'update-registration.js')):
    sys.exit('api/update-registration.js manke.')

src = open(SERVER, encoding='utf-8').read()
orig = src

if "require('./api/update-registration')" not in src:
    m = re.search(r"^const registerSecureHandler = require\('\./api/register-secure'\);\s*$", src, re.M)
    if not m:
        sys.exit("Pa jwenn liy require('./api/register-secure'). Pa gen anyen ki chanje.")
    src = src[:m.end()] + "\nconst updateRegistrationHandler = require('./api/update-registration');" + src[m.end():]

if "'/api/registration'" not in src:
    m = re.search(r"^app\.use\('/api',\s*\(req,\s*res\)\s*=>\s*res\.status\(404\)", src, re.M)
    if not m:
        sys.exit("Pa jwenn catch-all 404 /api la. Pa gen anyen ki chanje.")
    route = (
        "// ---------- PUT /api/registration (modifye pwofil / 2yèm nimewo) ----------\n"
        "app.put('/api/registration', registerLimiter, requireDatabase, (req, res) => updateRegistrationHandler(req, res));\n\n"
    )
    src = src[:m.start()] + route + src[m.start():]

old = "'id, name, email, dial_code, country_name, phone, full_number'"
new = "'id, name, email, dial_code, country_name, phone, full_number, dial_code2, phone2'"
if old in src:
    src = src.replace(old, new)

if src == orig:
    print('Deja aplike.')
    sys.exit(0)

backup = SERVER + '.bak-' + time.strftime('%Y%m%d-%H%M%S')
shutil.copy2(SERVER, backup)
open(SERVER, 'w', encoding='utf-8').write(src)

check = subprocess.run(['node', '--check', SERVER], capture_output=True, text=True)
if check.returncode != 0:
    shutil.copy2(backup, SERVER)
    print(check.stderr)
    sys.exit('Erè sentaks. Mwen retabli server.js orijinal la.')

print('OK. Backup:', backup)

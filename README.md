# DOBERTO VCF — Production Build

DOBERTO VCF se yon rezo WhatsApp ak sistèm enskripsyon, kominote, lis manm, download VCF, VIP ak notifikasyon.

Fonksyon prensipal yo:

- Enskripsyon ak Google Sign-In + nimewo WhatsApp
- Google sèvi sèlman pou login/idantifikasyon pandan enskripsyon
- Apre enskripsyon, itilizatè a jwenn aksè rapid ak group WhatsApp + chanèl ofisyèl la
- Lis piblik manm san ekspoze nimewo telefòn yo
- Download VCF ak verifikasyon non/nimewo
- VIP ak plizyè plan ak metòd peman
- MonCash, NatCash ak Binance selon konfigurasyon admin
- PWA install ak logo PNG 192/512 + maskable
- Offline app shell ak paj offline
- Push notifications via OneSignal Web SDK
- Admin Push Center pou voye alèt bay abonnés
- Email unlock via Resend
- Security headers, rate limits, CORS restrenn ak JWT

## 1. Supabase

Kouri schema/migrations ki koresponn ak production database la nan Supabase SQL Editor. Pa efase done production ki deja egziste.

## 2. Vercel Environment Variables

Mete valè ki nan `.env.example` yo nan Vercel Project Settings > Environment Variables.

Obligatwa pou production:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (32+ karaktè random)
- `ADMIN_PASSWORD`
- `SITE_URL=https://dobertovcf.online`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI=https://dobertovcf.online/register.html`

Pou email:

- `RESEND_API_KEY`
- `RESEND_FROM`

Pou push notifications:

- `ONESIGNAL_APP_ID`
- `ONESIGNAL_REST_API_KEY`

Pa mete okenn secret reyèl nan GitHub.

## 3. Google Sign-In

DOBERTO VCF itilize Google sèlman pou koneksyon ak idantifikasyon pandan enskripsyon.

OAuth scopes yo dwe rete sèlman:

- `openid`
- `email`
- `profile`

Aplikasyon an pa mande Google Contacts, Gmail, Drive oswa Calendar.

Nan Google Cloud Console, OAuth Client la dwe kalite **Web application** epi Authorized redirect URI production lan se:

`https://dobertovcf.online/register.html`

Nan Google Auth Platform → Branding, itilize:

- Homepage: `https://dobertovcf.online`
- Privacy Policy: `https://dobertovcf.online/privacy.html`
- Terms of Service: `https://dobertovcf.online/terms.html`
- Authorized domain: `dobertovcf.online`

Pa ajoute scope `https://www.googleapis.com/auth/contacts` ankò.

## 4. WhatsApp Community

Apre yon nouvo enskripsyon, flow la mennen itilizatè a sou kominote DOBERTO VCF la.

Group WhatsApp:

`https://chat.whatsapp.com/GySPeuvDlI14BnWWvdm7U4?s=sh&p=a&mlu=4&ilr=4`

Chanèl WhatsApp:

`https://whatsapp.com/channel/0029VbCtwNpJkK7Cng8qex1A`

## 5. OneSignal Web Push

Frontend la itilize OneSignal Web Push ak worker:

`/push/onesignal/OneSignalSDKWorker.js`

Worker scope:

`/push/onesignal/`

PWA service worker prensipal la rete `/sw.js` pou evite conflict.

## 6. Deploy

```bash
npm install
npm start
```

Sou Vercel, push sou `main` oswa redeploy pwojè a apre environment variables yo fin mete.

## Security notes

- Admin JWT pa pase nan URL.
- API yo gen rate limiting.
- Static + API responses gen security headers.
- Supabase service-role key rete backend sèlman.
- Google OAuth pa mande sensitive Contacts scope ankò.


## VPS deployment

Repo a gen yon config PM2 ak yon template Nginx pou `dobertovcf.online`.

Default VPS port:

`127.0.0.1:3200`

Premye deploy:

```bash
cd /var/www
git clone https://github.com/Doberto555/DOBERTO-VCF.git
cd DOBERTO-VCF
cp .env.example .env
npm ci --omit=dev
pm2 start ecosystem.config.cjs
pm2 save
```

Apre ou fin mete secrets production yo nan `.env`, verifye:

```bash
curl -s http://127.0.0.1:3200/api/health
```

Pou Nginx:

```bash
cp deploy/nginx-dobertovcf.conf.example /etc/nginx/sites-available/dobertovcf
ln -s /etc/nginx/sites-available/dobertovcf /etc/nginx/sites-enabled/dobertovcf
nginx -t
systemctl reload nginx
certbot --nginx -d dobertovcf.online -d www.dobertovcf.online
```

Pou mizajou pita:

```bash
bash deploy/update-vps.sh
```

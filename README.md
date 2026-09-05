# DOBERTO VCF — Production Build

Version PRO ki gen:

- Enskripsyon + lis piblik + download VCF ak verifikasyon non/nimewo
- 248 peyi/teritwa nan selector a, Gabon `+241` ladan
- PWA install ak nouvo logo PNG 192/512 + maskable
- Offline app shell ak paj offline
- Push notifications reyèl via OneSignal Web SDK v16
- Admin Push Center pou voye alèt bay tout abonnés
- Email unlock via Resend
- Kanpay unlock ak eta/retry nan Supabase
- Security headers, rate limits, CORS restrenn, JWT admin sèlman nan Authorization header
- CSV export san token nan URL

## 1. Supabase

Louvri SQL Editor Supabase epi kouri tout `schema.sql` la. Li pa efase enskripsyon ki deja la; li ajoute kolòn/index/tab kanpay ki manke yo.

## 2. Vercel Environment Variables

Mete valè ki nan `.env.example` yo nan Vercel Project Settings > Environment Variables.

Obligatwa pou production:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (32+ karaktè random)
- `ADMIN_PASSWORD`
- `SITE_URL`

Pou email:

- `RESEND_API_KEY`
- `RESEND_FROM`

Pou push notifications:

- `ONESIGNAL_APP_ID`
- `ONESIGNAL_REST_API_KEY`

Pa mete okenn secret reyèl nan GitHub.

## 3. OneSignal Web Push

Nan OneSignal kreye/configure Web Push pou menm origin sit la. Frontend la itilize Custom Code Setup ak worker sa a:

`/push/onesignal/OneSignalSDKWorker.js`

Worker a gen scope:

`/push/onesignal/`

PWA service worker prensipal la rete `/sw.js`, konsa 2 workers yo pa fè conflict.

Lè env OneSignal yo configure:

- popup notifikasyon DOBERTO VCF la kreye yon vrè OneSignal subscription;
- admin ka voye push soti nan Admin > Push Center;
- lè objektif VCF la rive, sistèm nan voye push unlock + email (si yo configure).

## 4. Deploy

```bash
npm install
npm start
```

Sou Vercel, push sou `main` oswa redeploy pwojè a apre environment variables yo fin mete.

## Security notes

- Admin JWT pa pase nan URL ankò.
- `JWT_SECRET` pa gen fallback insecure.
- API yo limite request abuse.
- Static + API responses gen security headers.
- Supabase service-role key rete backend sèlman.

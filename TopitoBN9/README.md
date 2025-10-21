# 🤖 Topito BN9 – Telegram Bot + Mini App Control Center

โซลูชันครบวงจรสำหรับบริหาร Telegram Bot หลายตัวภายใต้บัญชีเดียว พร้อมแดชบอร์ด React + Tailwind ที่เชื่อม Supabase และ OpenAI เพื่อขยายฟีเจอร์ AI, Auto Command และ Mini App ได้ในคลิกเดียว

## 🌟 Highlights

- **Multi-Bot Ready** – เชื่อมหลายบอทด้วยไฟล์ `.env` หรือฐานข้อมูล Supabase และสลับจัดการได้จาก UI เดียว
- **Supabase Integration** – เก็บคำสั่ง, Quick Reply, Settings และสถานะ Webhook บน Supabase (รองรับ Service Role Key)
- **OpenAI Automation** – ทดลองสร้างคำตอบอัตโนมัติจาก GPT-5 / GPT-4o / GPT-4-mini / GPT-3.5-turbo พร้อมกำหนด Persona เฉพาะแบรนด์
- **Mini App Dashboard** – React + Tailwind UI ที่ออกแบบให้รองรับ Manifest, Deep Link และ Telegram Stars ในเฟสถัดไป
- **Instant Deployment** – Dockerfiles + docker-compose สำหรับ Backend + Frontend และตัวเลือก Netlify / Replit / Render / Firebase Hosting + Functions
- **Security by Design** – ไม่มี Token ในซอร์สโค้ด ทุก credentials รับจาก `.env` / Secret Manager เท่านั้น

## 📁 โครงสร้างโปรเจกต์

```
TopitoBN9/
├── backend/                 # Express API, Telegram Webhook, Supabase/OpenAI services
│   ├── routes/              # REST API สำหรับแดชบอร์ด (multi-bot)
│   ├── services/            # Telegram, Supabase, OpenAI, storage adapters
│   ├── data/bot-config.json # Local fallback store (เมื่อไม่ใช้ Supabase)
│   └── Dockerfile
├── frontend/                # React + Vite + Tailwind dashboard
│   ├── src/
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── Dockerfile
│   └── nginx.conf           # Production reverse proxy
├── functions/               # Firebase Cloud Functions wrapper (reuses Express app)
├── firebase.json            # Firebase Hosting + Functions configuration
├── .firebaserc              # Firebase project alias mapping
├── docker-compose.yml       # Stack ครบชุดพร้อม volume สำหรับข้อมูลบอท
├── .env.example             # ตัวอย่าง Environment Variables
└── README.md
```

## 🔐 Environment Variables

คัดลอก `.env.example` แล้วแก้ค่าที่จำเป็น

```bash
cp .env.example .env
```

### Telegram

| Key | Description |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | โทเคนบอทตัวหลัก (ทางลัดกรณีมีบอทเดียว) |
| `TELEGRAM_BOT_NAME` / `TELEGRAM_BOT_USERNAME` | ใช้แสดงชื่อบนแดชบอร์ดเมื่อใช้ค่าเริ่มต้น |
| `TELEGRAM_BOTS` | JSON array สำหรับ multi-bot เช่น `[{"id":"main","name":"Topito","token":"000:ABC"}]` |
| `TELEGRAM_DEFAULT_BOT_ID` | รหัสบอทค่าเริ่มต้นหากไม่ส่งใน webhook |

### Mini App & Webhook

| Key | Description |
| --- | --- |
| `DOMAIN` | โดเมนสำหรับสร้าง URL `https://DOMAIN/webhook/:botId` อัตโนมัติ |
| `MINIAPP_ID` | ใช้ fallback เมื่อสร้างลิงก์ Mini App อัตโนมัติ |
| `MINIAPP_URL` | ระบุ URL ของ Mini App โดยตรง (เช่น Deep Link หรือ Stars) |

### Supabase

| Key | Description |
| --- | --- |
| `SUPABASE_URL` | URL โครงการ |
| `SUPABASE_ANON_KEY` | ใช้กับฝั่ง Frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | ใช้กับ Backend สำหรับอ่าน/เขียนตารางคำสั่ง (ต้องให้สิทธิ์ Service Role) |

> Backend จะสลับไปใช้ไฟล์ `data/bot-config.json` อัตโนมัติถ้ายังไม่ตั้งค่า Supabase ทำให้ทดลองแบบ offline ได้ทันที

### OpenAI

| Key | Description |
| --- | --- |
| `OPENAI_API_KEY` | API key สำหรับ GPT |
| `OPENAI_DEFAULT_MODEL` | โมเดลเริ่มต้น (เช่น `gpt-4o-mini`) |
| `OPENAI_SUPPORTED_MODELS` | รายการโมเดลที่ให้ผู้ใช้เลือกในแดชบอร์ด |

### Frontend Runtime (Vite)

| Key | Description |
| --- | --- |
| `VITE_API_BASE` | URL ของ Backend เช่น `http://localhost:3000` หรือ `https://api.bn9.club` |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | ให้แดชบอร์ดทราบว่าสามารถเชื่อม Supabase ได้หรือไม่ |
| `VITE_OPENAI_MODEL` | โมเดลที่แสดงใน UI เช่น `gpt-4o-mini` |

## 🧠 Supabase Schema Suggestion

สร้างตารางต่อไปนี้ (หรือปรับตามระบบของคุณ):

```sql
create table bots (
  id text primary key,
  name text,
  username text,
  description text,
  token text,
  webhook_url text,
  ai_persona text,
  ai_enabled boolean default false,
  miniapp_url text,
  last_synced_at timestamp,
  updated_at timestamp default now()
);

create table bot_commands (
  id uuid primary key,
  bot_id text references bots(id) on delete cascade,
  command text,
  description text,
  response text,
  buttons jsonb default '[]',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table bot_quick_replies (
  id uuid primary key,
  bot_id text references bots(id) on delete cascade,
  title text,
  keyword text,
  response text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table bot_settings (
  bot_id text primary key references bots(id) on delete cascade,
  default_response text,
  ai_persona text,
  ai_enabled boolean default false,
  ai_model text,
  ai_temperature numeric,
  auto_keyboard boolean default false,
  auto_commands boolean default false,
  miniapp_url text,
  webhook_url text,
  updated_at timestamp default now()
);
```

> มอบสิทธิ์ Service Role ให้ Backend ใช้ `upsert`/`delete` ได้เต็มที่ ขณะที่ Frontend ใช้ Anon Key เพื่อบอกสถานะการเชื่อมต่อเท่านั้น

## 🚀 การใช้งาน (Local Dev)

> ต้องการเวอร์ชันละเอียดสำหรับการเตรียมโปรดักชัน? ดู [Deployment Playbook](./DEPLOYMENT_GUIDE.md) ที่สรุปทุกขั้นตอนแบบ Runbook

### Backend

```bash
cd TopitoBN9/backend
npm install
npm start
```

Endpoints สำคัญ:

- `POST /webhook/:botId` – รับข้อความจาก Telegram สำหรับแต่ละบอท
- `POST /webhook` – ใช้ค่า `TELEGRAM_DEFAULT_BOT_ID` เมื่อไม่ส่งพารามิเตอร์
- `GET /health` – รายงานสถานะระบบรวม (บอท, Supabase, OpenAI, Local store)
- `GET /api/bots` – รายชื่อบอท
- `GET /api/system/status` – ตรวจสอบสถานะรวม Supabase/OpenAI/Webhook/Telegram
- `GET /api/bots/:botId/config` – คำสั่ง + Quick Replies + Settings
- `POST /api/bots/:botId/commands` – เพิ่ม/แก้ไข/ลบคำสั่ง
- `POST /api/bots/:botId/quick-replies` – จัดการ Quick Replies
- `PUT /api/bots/:botId/settings` – บันทึก Default Response, AI, Mini App URL, Webhook
- `POST /api/bots/:botId/test-message` – ส่งข้อความทดสอบไปยัง chat id
- `POST /api/bots/:botId/ai/preview` – ขอคำตอบตัวอย่างจาก OpenAI ตาม Persona

### Frontend

```bash
cd TopitoBN9/frontend
npm install
npm run dev
```

แดชบอร์ดจะรันที่ `http://localhost:5173` พร้อม Tailwind UI และเรียก API ผ่าน `VITE_API_BASE`

- โค้ด Frontend เป็น React + **TypeScript** (Vite) พร้อม utility `src/api.ts` ที่ช่วยจัดการ fetch/typing
- UI ถูกออกแบบให้จัดการหลายบอท, คำสั่ง, Quick Reply และการตั้งค่า AI ได้ครบจบในหน้าเดียว

## 🐳 Deploy ด้วย Docker Compose

```bash
cd TopitoBN9
cp .env.example .env  # ปรับค่าให้ครบ โดยเฉพาะ TELEGRAM_BOTS / SUPABASE / OPENAI
VITE_API_BASE=http://backend:3000 docker compose up --build
```

- Backend: `http://localhost:3000`
- Frontend (ผ่าน nginx): `http://localhost:8080`
- Volume `bot-data` เก็บไฟล์ `bot-config.json` กรณีไม่ใช้ Supabase

### Deploy แยกบริการ

**Backend**
```bash
cd backend
docker build -t topito-backend .
docker run -p 3000:3000 --env-file ../.env topito-backend
```

**Frontend**
```bash
cd frontend
docker build -t topito-frontend --build-arg VITE_API_BASE=https://api.your-domain.com .
docker run -p 8080:80 topito-frontend
```

สำหรับ Netlify/Vercel ให้ตั้ง build command = `npm run build`, publish directory = `dist`

## ☁️ Firebase Hosting + Functions

ชุดโค้ดนี้เตรียมคอนฟิก Firebase ไว้ให้แล้วครบทุกไฟล์สำคัญ (คลิกชื่อไฟล์เพื่อเปิดดูรายละเอียด):

| ไฟล์ | จุดที่ต้องตรวจสอบ/แก้ไข |
| --- | --- |
| [`firebase.json`](./firebase.json) | `hosting.public` ต้องชี้ไปที่ `frontend/dist`, `rewrites` ต้องพา `/api/**` & `/webhook/**` ไปยังฟังก์ชัน `app`, และ `hosting.predeploy` จะรัน `npm --prefix frontend install && npm --prefix frontend run build` ให้อัตโนมัติก่อน deploy |
| [`.firebaserc`](./.firebaserc) | เปลี่ยนค่า `default` ให้ตรงกับ Firebase Project ของคุณ หรือใช้ `firebase use <project-id>` เพื่ออัปเดตอัตโนมัติ |
| [`functions/index.js`](./functions/index.js) | ปรับค่า `runtimeOptions` และลงทะเบียน secrets เพิ่มใน `runWith({ secrets: [...] })` ถ้าใช้ Firebase Secret Manager |
| [`functions/package.json`](./functions/package.json) | ตรวจสอบให้แน่ใจว่า dependency `topito-backend` ยังชี้ไปที่ `file:../backend` (หากย้ายตำแหน่งโฟลเดอร์ให้แก้ path ตรงนี้) |
| [`functions/.env`](./functions/.env.example) | คัดลอกจาก `.env` (หรือใช้ `.env.example`) เพื่อให้ CLI อัปโหลดค่า environment เข้า Cloud Functions ตอน deploy |

> อัปเดต `.firebaserc` ให้ใช้โปรเจกต์จริงก่อน deploy เสมอ หรือรัน `firebase use <project-id>` เพื่อเลือกผ่าน CLI

1. **ติดตั้ง CLI** – `npm install -g firebase-tools` แล้ว `firebase login`
2. **เลือกโปรเจกต์** – แก้ `.firebaserc` หรือรัน `firebase use <project-id>`
3. **ตั้งค่า Environment** –
   - คัดลอกไฟล์ตัวอย่าง: `cp functions/.env.example functions/.env`
   - เติมค่าเหมือนกับ `.env` (เช่น `TELEGRAM_BOTS`, `DOMAIN`, `SUPABASE_URL`, `OPENAI_API_KEY`)
   - หากต้องการใช้ Secret Manager ให้เพิ่มชื่อลงใน `functions/index.js` ภายใต้ `runWith({ secrets: [...] })`
4. **ติดตั้ง dependency** –

   ```bash
   npm install --prefix TopitoBN9/backend
   npm install --prefix TopitoBN9/functions
   ```

   > ไม่จำเป็นต้องรัน `npm install --prefix TopitoBN9/frontend` ล่วงหน้า หากต้องการให้ CLI จัดการให้อัตโนมัติ เพราะ `firebase.json` มี predeploy สำหรับ frontend อยู่แล้ว

5. **Deploy** –

   ```bash
   cd TopitoBN9
   firebase deploy
   ```

   - ระหว่าง deploy, CLI จะเรียก `npm --prefix frontend install` และ `npm --prefix frontend run build` ตาม `hosting.predeploy`
   - Hosting จะเสิร์ฟไฟล์จาก `frontend/dist`
   - Cloud Function ชื่อ `app` จะถูก rewrite ให้รองรับ `/api/**` และ `/webhook/**`

7. **ตรวจสอบ** – เข้า `https://<project-id>.web.app/api/system/status` หรือ `https://<region>-<project-id>.cloudfunctions.net/app/health`
8. **อัปเดตเฉพาะ Frontend** – ใช้ `firebase deploy --only hosting`

## 🧪 การทดสอบ Webhook

```bash
curl -X POST https://your-domain.com/webhook/primary \
  -H "Content-Type: application/json" \
  -d '{"message": {"chat": {"id": 12345}, "text": "/start"}}'
```

ระบบจะดึงคำสั่งจาก Supabase (หรือไฟล์ local) แล้วตอบกลับผ่าน Telegram API ทันที

## 🔮 Phase IV – Next Upgrades

- เชื่อม **AI Generator** แบบเต็มรูปกับ Supabase เพื่อเก็บประวัติคำตอบและสถิติ
- เพิ่ม **Mini App Manifest** + Deep Link + Telegram Stars Payment
- เปิดใช้งาน **Auto Keyboard / Auto Command Generation** ผ่าน OpenAI
- รองรับ **Supabase Auth** สำหรับการจัดการหลายบัญชีในอนาคต

## 📄 License

เผยแพร่ภายใต้ MIT License – สามารถนำไปปรับใช้หรือขยายความสามารถได้อย่างอิสระ

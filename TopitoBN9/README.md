# Topito BN9 - Telegram Bot Dashboard

แดชบอร์ดสำหรับจัดการ Telegram Bot, Quick Replies และ Mini App ลิงก์ต่าง ๆ ในที่เดียว พร้อม Backend สำหรับเชื่อมต่อกับ Telegram Webhook และ API ช่วยเหลือต่าง ๆ เพื่อให้นำไป Deploy ได้ทันที

## โครงสร้างโปรเจกต์

```
TopitoBN9/
├── backend/            # Node.js (Express) API และ Webhook Handler
│   ├── data/           # ไฟล์ตั้งค่าที่บันทึกคำสั่งและ quick replies
│   ├── routes/         # เส้นทาง API สำหรับแดชบอร์ด
│   ├── services/       # การทำงานหลัก (Telegram, data store)
│   └── Dockerfile      # Docker image สำหรับ backend
├── frontend/           # Vite + React Dashboard
│   ├── src/
│   ├── Dockerfile      # Docker image สำหรับ frontend + nginx
│   └── nginx.conf      # Reverse proxy เสิร์ฟไฟล์ static
├── docker-compose.yml  # Stack พร้อมใช้งาน (backend + frontend)
├── .env.example        # ตัวอย่างไฟล์ตั้งค่า environment
└── README.md
```

## การเตรียมค่า Environment

คัดลอกไฟล์ `.env.example` ไปเป็น `.env` และกำหนดค่าตามความต้องการ

```bash
cp .env.example .env
```

ตัวแปรที่สำคัญ

- `PORT` – พอร์ตที่ backend ใช้งาน (ค่าเริ่มต้น 3000)
- `TELEGRAM_BOT_TOKEN` – โทเคนบอทจาก BotFather
- `DOMAIN` – โดเมนหลักที่ใช้รับ Webhook (สามารถปล่อยว่างและกรอกตอนตั้งค่าในหน้าแดชบอร์ดได้)
- `MINIAPP_ID` / `MINIAPP_URL` – ใช้สร้างปุ่มเปิด Mini App ใน Telegram (กำหนด `MINIAPP_URL` หากมีลิงก์เฉพาะ)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPENAI_API_KEY` – เผื่อเชื่อมต่อบริการเสริม (ไม่บังคับ)
- `VITE_API_BASE` – (สำหรับ frontend) URL ของ backend เช่น `https://api.your-domain.com`

> **หมายเหตุ**: ไฟล์ `backend/data/bot-config.json` จะถูกสร้างอัตโนมัติเมื่อรันเซิร์ฟเวอร์ครั้งแรก สามารถแก้ไขได้ผ่านหน้าแดชบอร์ดโดยตรง

## การรันแบบ Local Development

### 1. Backend (Express)

```bash
cd backend
npm install
npm start
```

เซิร์ฟเวอร์จะรันที่ `http://localhost:3000` พร้อม endpoint:

- `POST /webhook` – รับข้อความจาก Telegram
- `GET /health` – เช็คสถานะระบบ
- `GET /api/bot/*` – API สำหรับแดชบอร์ด (commands, quick replies, webhook, test message)

### 2. Frontend (React Dashboard)

เปิดเทอร์มินัลใหม่แล้วรัน:

```bash
cd frontend
npm install
npm run dev
```

หน้าแดชบอร์ดอยู่ที่ `http://localhost:5173` และมี proxy เชื่อมกับ backend ที่ `/api`, `/health`, `/webhook` ให้อัตโนมัติระหว่างพัฒนา

## ฟีเจอร์หลักของแดชบอร์ด

- **ภาพรวมสถานะบอท**: ตรวจสอบการตั้งค่า Token, จำนวนคำสั่ง, Quick Replies และ Webhook ที่ใช้งานอยู่
- **จัดการคำสั่ง (Commands)**: เพิ่ม/แก้ไข/ลบคำสั่ง พร้อมตอบกลับข้อความและสร้างปุ่มลัดได้หลายรูปแบบ (command, URL, Web App)
- **Quick Replies**: ตอบอัตโนมัติเมื่อเจอคีย์เวิร์ดที่กำหนด
- **Default Response**: กำหนดข้อความ fallback เมื่อไม่พบคำสั่งหรือคีย์เวิร์ดที่ตรงกัน
- **Webhook Management**: ตั้งค่า/ยกเลิก Webhook ได้จากหน้า UI โดยตรง
- **Test Message**: ส่งข้อความทดสอบไปยัง chat id ที่ต้องการ เพื่อเช็คการตั้งค่าอย่างรวดเร็ว

## พร้อม Deploy 100%

### Stack สำเร็จรูปด้วย Docker Compose

หากต้องการยกระบบขึ้นทั้ง Frontend + Backend อย่างรวดเร็ว สามารถใช้ Docker Compose ที่เตรียมไว้ได้ทันที:

```bash
cd TopitoBN9
cp .env.example .env   # แก้ไขค่าตามต้องการ
# แก้ไขค่า VITE_API_BASE ใน .env หรือส่งเข้า docker compose ตอนรัน
VITE_API_BASE=http://localhost:3000 docker compose up --build
```

- Backend จะทำงานที่ `http://localhost:3000`
- Frontend (เสิร์ฟผ่าน nginx) จะอยู่ที่ `http://localhost:8080`
- สามารถปรับแก้ค่า environment ผ่าน `.env` หรือ override ด้วย `VITE_API_BASE=https://api.your-domain.com docker compose up -d`

### Deploy Backend ด้วย Docker Image

ภายในโฟลเดอร์ `backend` มี `Dockerfile` ที่ใช้สร้าง image พร้อมรันในโหมด Production:

```bash
cd backend
docker build -t topito-bn9-backend .
docker run -p 3000:3000 --env-file ../.env topito-bn9-backend
```

Image จะติดตั้ง dependencies (axios, express, cors ฯลฯ) และเปิดพอร์ต 3000 พร้อมใช้งาน

### Deploy Frontend Static ด้วย Docker Image

```bash
cd frontend
docker build -t topito-bn9-frontend --build-arg VITE_API_BASE=https://api.your-domain.com .
docker run -p 8080:80 topito-bn9-frontend
```

ไฟล์ static จะถูกเสิร์ฟผ่าน nginx (configuration อยู่ที่ `frontend/nginx.conf`)

### Deploy แบบ Manual (ไม่ใช้ Docker)

#### Backend

1. เตรียมเซิร์ฟเวอร์ Node.js (เช่น Render, Railway, Fly.io หรือ VPS ส่วนตัว)
2. อัปโหลดโค้ดในโฟลเดอร์ `backend` พร้อมไฟล์ `.env`
3. รันคำสั่ง `npm install` และ `npm start`
4. ตรวจสอบให้พอร์ตที่กำหนดเปิดใช้งาน และตั้งค่า reverse proxy/SSL ให้เรียบร้อย

#### Frontend

- **Netlify / Vercel**: ใช้โฟลเดอร์ `frontend/` กำหนดคำสั่ง build เป็น `npm run build` และ publish directory เป็น `dist`
- **Static Hosting อื่น ๆ**: รัน `npm run build` แล้วนำไฟล์ใน `frontend/dist` ไปวางที่โฮสต์ปลายทาง

> อย่าลืมตั้งค่า `VITE_API_BASE` ในระบบ Deploy ให้ชี้ไปยัง URL ของ Backend หาก Frontend และ Backend แยกโดเมนกัน

## การตั้งค่า Webhook บน Telegram

1. รัน backend ให้พร้อมรับคำขอจากอินเทอร์เน็ต (มี HTTPS)
2. เปิดหน้าแดชบอร์ดแล้วใส่ URL ในส่วน Webhook เช่น `https://your-domain.com/webhook`
3. กด “ตั้งค่า Webhook” ระบบจะเรียก `setWebhook` ที่ Telegram ให้โดยอัตโนมัติ
4. สามารถกด “โหลดข้อมูลใหม่” เพื่อตรวจสอบสถานะล่าสุด หรือ “ยกเลิก Webhook” เพื่อหยุดรับข้อความ

## การทดสอบด้วย CURL (ตัวอย่าง)

ส่งข้อความจำลองไปยัง webhook:

```bash
curl -X POST https://your-domain.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"message": {"chat": {"id": 12345}, "text": "/start"}}'
```

ระบบจะตอบกลับข้อความตามที่ตั้งค่าไว้ในแดชบอร์ด และสามารถตรวจสอบ log ได้จากฝั่งเซิร์ฟเวอร์

## License

โค้ดทั้งหมดอยู่ภายใต้ MIT License สามารถนำไปปรับปรุงเพิ่มเติมเพื่อใช้งานจริงได้ตามต้องการ

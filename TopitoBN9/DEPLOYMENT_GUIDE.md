# 🚀 Topito BN9 Deployment Playbook

เอกสารนี้สรุปขั้นตอนแบบทีละสเต็ปสำหรับการเตรียมระบบ Topito BN9 ให้พร้อมใช้งานในโปรดักชัน รวมถึงอธิบายโครงสร้างและโมดูลหลักที่ทำงานอยู่เบื้องหลัง

> **TIP:** เก็บไฟล์นี้ไว้คู่กับโปรเจกต์เพื่อใช้เป็น Runbook สำหรับทีม DevOps / Product ในการอ้างอิงภายหลัง

## 1. สถาปัตยกรรมโดยรวม

```
┌──────────────────────────────────────────────────────────┐
│                       Frontend (Vite)                    │
│ React + Tailwind Dashboard                               │
│ - เลือกบอท / ดูสถานะระบบ / จัดการคำสั่ง / Quick Replies     │
│ - เรียก REST API ผ่าน VITE_API_BASE                     │
└──────────────▲───────────────────────────────────────────┘
               │ REST (HTTPS)
┌──────────────┴───────────────────────────────────────────┐
│                       Backend (Express)                  │
│ - /webhook/:botId รับข้อความจาก Telegram                │
│ - /api/** จัดการคำสั่ง, Quick Replies, Settings, Webhook │
│ - Services: Supabase, OpenAI, Local JSON Store, Telegram │
└──────────────▲───────────────────────────────────────────┘
               │
         Telegram Platform
               │
        ผู้ใช้ส่งข้อความถึงบอท
```

## 2. Checklist ก่อน Deploy

1. **เตรียมค่า Environment Variables**
   - คัดลอก `.env.example` เป็น `.env`
   - กรอกค่าที่จำเป็น (Telegram, Supabase, OpenAI, Vite)
2. **สร้าง Supabase Project (ถ้าใช้ฐานข้อมูลจริง)**
   - กำหนดตารางตามตัวอย่างใน `README.md`
   - ออก Service Role Key และ Anon Key
3. **ออก API Key ของ OpenAI** (หรือปิดฟีเจอร์ AI โดยตั้ง `OPENAI_API_KEY` ว่าง)
4. **สร้าง/เลือก Telegram Bot**
   - ใช้ BotFather เพื่อสร้าง Token
   - ตั้งค่า Webhook URL ที่ HTTPS พร้อม TLS
5. **ทดสอบการ Build** (ควรทำในเครื่องนักพัฒนา)
   - Backend: `npm install && npm start`
   - Frontend: `npm install && npm run build`
6. **เตรียมโดเมนและ TLS Certificate** หากจะให้ Telegram เรียก webhook ผ่าน HTTPS โดยตรง

## 3. การตั้งค่า Environment Variables

| Variable | จำเป็น | คำอธิบาย |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | ✅* | ใช้กรณีมีบอทเดียว สลับกับ `TELEGRAM_BOTS` ได้ |
| `TELEGRAM_BOTS` | ✅* | JSON Array สำหรับ multi-bot (ต้องมี `id`, `token`) |
| `DOMAIN` | ✅ | ใช้สร้าง Webhook URL ค่าเริ่มต้นในแดชบอร์ด |
| `SUPABASE_URL` | ❌ | ไม่กรอกได้ หากใช้ Local JSON |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | จำเป็นเมื่อเปิดใช้งาน Supabase |
| `OPENAI_API_KEY` | ❌ | กรอกเมื่อเปิดใช้ AI Preview/Test |
| `VITE_API_BASE` | ✅ | ให้ Frontend รู้ URL ของ Backend |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | ❌ | ใช้แสดงสถานะ Supabase ใน UI |

> ⭐️  อย่างน้อยต้องมี **1 วิธี** สำหรับกำหนด Token ของบอท (`TELEGRAM_BOT_TOKEN` หรือ `TELEGRAM_BOTS`)

## 4. ขั้นตอนสำหรับการ Deploy ด้วย Docker Compose

1. คัดลอกไฟล์ทั้งหมดไปยังเซิร์ฟเวอร์
2. สร้างไฟล์ `.env`
3. (เลือก) แก้ไขค่า `VITE_API_BASE` ให้ชี้ไปยังโดเมนจริง เช่น `https://api.bn9.club`
4. รันคำสั่ง:

```bash
cd TopitoBN9
VITE_API_BASE=https://api.bn9.club docker compose up -d --build
```

5. ตรวจสอบบริการ:
   - Frontend: `http(s)://<host>:8080`
   - Backend: `http(s)://<host>:3000`
6. ตรวจสอบ logs หากต้องการ

```bash
docker compose logs backend -f
docker compose logs frontend -f
```

7. ตรวจสอบสถานะระบบ:

```bash
curl https://api.bn9.club/health
curl https://api.bn9.club/api/system/status
```

## 5. ตั้งค่า Telegram Webhook

1. เลือกบอทจากแดชบอร์ด หรือใช้ Postman/Terminal
2. เรียก API (ใส่ Token ให้ถูกต้อง):

```bash
curl -X POST https://api.bn9.club/api/bots/<botId>/webhook \
  -H "Content-Type: application/json" \
  -d '{"url":"https://api.bn9.club/webhook/<botId>"}'
```

3. ตรวจสอบผลลัพธ์จาก `GET /api/bots/<botId>/status`
4. ทดสอบโดยส่งข้อความจาก Telegram จริง แล้วดู log หรือแดชบอร์ด

> **หมายเหตุ:** ต้องใช้ HTTPS ที่ได้รับใบรับรองจาก CA ที่เชื่อถือได้เท่านั้น

## 6. Netlify + Render (ตัวอย่าง Deploy แบบแยก Frontend/Backend)

### Backend (Render)
1. สร้าง Web Service ใหม่จาก Git Repo นี้ (เลือกโฟลเดอร์ `backend`)
2. Build command: `npm install`
3. Start command: `node server.js`
4. ใส่ Environment Variables ทั้งหมดใน Dashboard ของ Render

### Frontend (Netlify)
1. เชื่อม Repo แล้วเลือกโฟลเดอร์ `frontend`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. ตั้ง Environment Variables: `VITE_API_BASE`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
5. หาก Backend ใช้ HTTPS จะสามารถเรียก API ข้ามโดเมนได้ทันที (CORS เปิดอยู่)

## 7. Replit (Full Stack)

1. สร้าง Repl แบบ Node.js แล้วอัปโหลดโปรเจกต์ทั้งชุด
2. ติดตั้ง dependencies ด้วย `npm install` ในทั้ง `backend/` และ `frontend/`
3. ใช้ Replit Secrets เก็บค่าตัวแปร `.env`
4. รัน Backend ในแท็บหนึ่ง (`node backend/server.js`)
5. รัน Frontend ในอีกแท็บ (`npm run dev -- --host 0.0.0.0 --port 5173`)
6. ใช้ Replit พอร์ตสาธารณะสำหรับ Webhook (แนะนำให้ตั้ง Proxy ผ่าน Cloudflare Tunnel เพื่อให้เป็น HTTPS)

## 8. การตรวจสอบและ Monitoring

| Endpoint | จุดประสงค์ |
| --- | --- |
| `GET /health` | ตรวจสอบ Supabase, Local Store, OpenAI, Telegram พร้อมกัน |
| `GET /api/system/status` | ใช้ในแดชบอร์ดเพื่อดูรายละเอียดเชิงลึก |
| `GET /api/bots` | รายชื่อบอททั้งหมด |
| `GET /api/bots/:botId/config` | ดึงคำสั่ง, Quick Replies, Settings |

แนะนำให้ตั้ง Cron หรือ Uptime Robot เรียก `GET /health` ทุก 1 นาทีเพื่อดู Availability

## 9. การอัปเดตฟีเจอร์ / Rollback

1. ใช้ Git tag หรือ Release note สำหรับแต่ละรอบ deploy
2. ก่อน deploy ให้รัน `npm run build` ใน Frontend เพื่อจับ error ของ TypeScript
3. สำหรับ Backend ให้รัน `npm start` และใช้ Postman / Newman ทดสอบ Endpoints หลัก
4. หากเกิดปัญหา ให้ rollback ไปยัง Tag ก่อนหน้า (Docker image หรือ Git commit)

## 10. คู่มือการใช้งานแดชบอร์ด (สั้น ๆ)

1. **เลือกบอท** จากแถบด้านซ้ายเพื่อโหลดคำสั่งและการตั้งค่า
2. **แท็บ Commands** – เพิ่ม/แก้ไข/ลบคำสั่งได้ทันที กด "บันทึกคำสั่ง" เพื่อ Sync
3. **แท็บ Quick Replies** – จัดการข้อความตอบกลับด่วนสำหรับ Keyword เฉพาะ
4. **AI Preview** – กรอก Prompt เพื่อดูข้อความตัวอย่างจาก OpenAI ก่อนใช้งานจริง
5. **Settings Panel** – ปรับ Default Response, Persona, Mini App URL, Toggle Auto Keyboard/Commands
6. **System Status Card** – แสดงผล Supabase, OpenAI, Webhook, Mini App แบบเรียลไทม์

---

เมื่อทำครบทุกขั้นตอน ระบบจะพร้อมใช้งาน 100% และสามารถต่อยอดไปยัง Phase IV (Mini App + Stars + Automation) ได้ทันที 🎉

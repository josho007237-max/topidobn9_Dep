# OK2Go – แพลตฟอร์มดีลออนไลน์แบบ Double-OK

## 🔭 วิสัยทัศน์ & พันธกิจ
- **Mission:** สร้างประสบการณ์ทำดีลดิจิทัลที่ปลอดภัย โปร่งใส "เห็นงานก่อน-เงินค้างกลาง" และปล่อยจ่ายอัตโนมัติเมื่อทั้งสองฝ่ายกดยืนยัน Double-OK
- **Positioning:** ห้องตรวจงานผ่านกลาง + กระเป๋าเงินชั่วคราว (escrow-like) ที่ออกแบบให้ถูกต้องตามบริบทกฎหมายไทย ผ่านพันธมิตรการชำระเงินที่รองรับการถือเงินและโอนต่อแบบมีเงื่อนไข

## 🧑‍🤝‍🧑 กลุ่มเป้าหมายหลัก (Persona)
- ฟรีแลนซ์สายดิจิทัล: ยิงแอด, ตัดต่อวิดีโอ, ทำคอนเทนต์, ออกแบบอาร์ตเวิร์ก
- เอเจนซี่/สตูดิโอ: ทำแคมเปญ, จัดการเพจ, แพ็กเกจโซเชียลมีเดีย
- ผู้ว่าจ้าง SME / Creator Economy: ต้องการความมั่นใจว่าจ่ายแล้วได้งานตามข้อตกลง

## 💎 คุณค่าที่ส่งมอบ
1. **เห็นของก่อนจ่ายจริง** – ผู้ซื้อเข้าห้อง Review Room เพื่อดูงานเวอร์ชันป้องกันการคัดลอกก่อนตัดสินใจ
2. **ถือเงินกลางแบบไร้กังวล** – เงินเข้าบัญชีพักของแพลตฟอร์มผ่านพาร์ทเนอร์เพย์เมนต์ (Stripe/Omise) พร้อมฟีเจอร์ Split/Payouts
3. **Double-OK Automation** – ปล่อยจ่ายอัตโนมัติเมื่อผู้ซื้อและผู้ขายยืนยันพร้อมกัน ลดภาระแอดมิน
4. **มีหลักฐานครบ** – เก็บบันทึกแชท, ไฟล์, เวลา, IP, hash และสถานะปุ่มเพื่อเป็นหลักฐานข้อพิพาท
5. **โปรไฟล์ความน่าเชื่อถือ** – รีวิวและเรตติ้งหลังปิดดีลเพื่อสร้างความเชื่อมั่นระยะยาว

## 🧱 หัวใจระบบ (Core Components)
- **Review Room:** แชท, ไทม์ไลน์ส่งงาน, เวอร์ชันไฟล์, ปุ่ม Double-OK, ระบบคอมเมนต์
- **Smart Proofing:** ลายน้ำรายดีล, low-res/blur preview, สตรีมวิดีโอ, signed URL มีอายุ, audit log hash
- **Payment & Payout:** รับบัตร/ผ่อน/วอลเล็ต/PromptPay ผ่าน Stripe Thailand หรือ Omise → เงินเข้าบัญชีพัก → Double-OK → โอนให้ผู้ขายพร้อมหัก platform fee
- **Dispute Mode:** SLA แจ้งเตือนเมื่อฝ่ายใดไม่ตอบภายใน X ชั่วโมง, เปิดเคส, แนบหลักฐาน, แอดมินไกล่เกลี่ย
- **Compliance Layer:** PDPA consent center, ToS/Acceptable Use, KYC/ภาษีตามเงื่อนไขพาร์ทเนอร์, log retention 180-365 วัน

## 🔐 กรอบกฎหมาย & นโยบาย
- ให้บริการในรูปแบบ "แพลตฟอร์มรับเงิน-ถือรอเงื่อนไข-โอนต่ออัตโนมัติ" ไม่อ้างตนเป็น "เอสโครว์ภายใต้กฎหมาย" ตามประกาศ ธปท.
- ใช้พาร์ทเนอร์การเงินที่ได้รับอนุญาต (Stripe TH, Omise) ซึ่งรองรับ Thai QR/PromptPay และต้องทำ KYC กับผู้ขายก่อนโอนเงินออก
- กำหนดการใช้งานเฉพาะงาน/สินค้า/บริการที่ไม่ผิดกฎหมายและไม่ละเมิดนโยบายของแพลตฟอร์มอื่น
- ปฏิบัติตาม PDPA: บันทึกคำยินยอม, ช่องทางขอเข้าถึง/ลบข้อมูล, ระบุวัตถุประสงค์การใช้ข้อมูลอย่างโปร่งใส

## 🔁 User Flow หลัก
1. **Onboarding** – ผู้ขายยืนยันตัวตน & เชื่อมบัญชี Stripe/Omise Connect, ผู้ซื้อยืนยันเบอร์/อีเมล + 2FA
2. **Create Deal** – กำหนดขอบเขตงาน, ราคา, กติกาหลักฐาน, ออกบิลชำระ (PromptPay/บัตร)
3. **Fund Deal** – เมื่อชำระสำเร็จ สถานะเป็น `funded` เงินพักใน balance ของแพลตฟอร์ม
4. **Submit & Review** – ผู้ขายอัปโหลด/สตรีมงานแบบมีลายน้ำ, ผู้ซื้อรีวิว, ขอแก้ไขได้ภายในรอบที่กำหนด
5. **Double-OK** – ทั้งคู่กดยืนยัน → คิวงาน payout → โอนเงินให้ผู้ขาย (หัก fee) และออกใบเสร็จอัตโนมัติ
6. **Dispute (ถ้ามี)** – ตั้งเวลา timeout, เปิดเคส, แนบหลักฐาน, แอดมินตัดสินว่าจะปล่อย/คืน/แบ่งเงิน

## 🗄️ แบบจำลองข้อมูล (Prisma Schema แนะนำ)
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  role          Role     @default(BUYER)
  stripeAccount String?
  rating        Float    @default(0)
  createdAt     DateTime @default(now())
  dealsBuyer    Deal[]   @relation("BuyerDeals")
  dealsSeller   Deal[]   @relation("SellerDeals")
}

enum Role {
  BUYER
  SELLER
  ADMIN
}

model Deal {
  id          String     @id @default(cuid())
  title       String
  scope       String
  price       Int
  currency    String     @default("thb")
  buyer       User       @relation("BuyerDeals", fields: [buyerId], references: [id])
  buyerId     String
  seller      User       @relation("SellerDeals", fields: [sellerId], references: [id])
  sellerId    String
  status      DealStatus @default(DRAFT)
  transferGrp String?
  timeoutAt   DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  payments    Payment[]
  payouts     Payout[]
  approvals   Approval[]
  disputes    Dispute[]
}

enum DealStatus {
  DRAFT
  PENDING_PAYMENT
  FUNDED
  IN_REVIEW
  DOUBLE_OK
  PAID_OUT
  DISPUTED
  CANCELLED
}

model Payment {
  id        String   @id @default(cuid())
  deal      Deal     @relation(fields: [dealId], references: [id])
  dealId    String
  provider  String
  intentId  String?
  sessionId String?
  amount    Int
  currency  String
  status    String
  createdAt DateTime @default(now())
}

model Payout {
  id         String   @id @default(cuid())
  deal       Deal     @relation(fields: [dealId], references: [id])
  dealId     String
  transferId String?
  amount     Int
  feeAmount  Int
  status     String
  createdAt  DateTime @default(now())
}

model Approval {
  id        String       @id @default(cuid())
  deal      Deal         @relation(fields: [dealId], references: [id])
  dealId    String
  actorId   String
  side      ApprovalSide
  createdAt DateTime     @default(now())
}

enum ApprovalSide {
  BUYER
  SELLER
}

model Dispute {
  id         String   @id @default(cuid())
  deal       Deal     @relation(fields: [dealId], references: [id])
  dealId     String
  openedBy   String
  reason     String
  status     String
  resolution String?
  createdAt  DateTime @default(now())
  closedAt   DateTime?
}
```

## 🔌 API Sketch (REST + Webhook + Realtime)
- `POST /auth/signup`, `POST /auth/login` – ลงทะเบียน/เข้าสู่ระบบ
- `POST /deals` – สร้างดีล กำหนด scope, ราคา, buyer, seller
- `POST /deals/:id/pay` – คืน `payment_url` หรือ `qr_string`
- `WS /deals/:id/events` – แชท, log, typing indicator แบบ realtime (Supabase Realtime / Socket.io)
- `POST /deals/:id/submit` – ผู้ขายส่งงานพร้อมเมทาดาทาไฟล์
- `POST /deals/:id/approve` (buyer) + `POST /deals/:id/accept` (seller) – เมื่อครบสองฝั่ง → Trigger payout queue
- `POST /deals/:id/payout` – จ่ายให้ผู้ขาย (หลัง Double-OK)
- `POST /deals/:id/dispute` / `POST /deals/:id/resolve` – จัดการข้อพิพาท
- `POST /webhooks/payments` / `POST /webhooks/payouts` – รับสัญญาณจาก Stripe/Omise

## 🛠️ สแต็กเทคนิคแนะนำ
- **Frontend:** Next.js (App Router) + Tailwind + shadcn/ui → ทำ Landing, Deal Form, Review Room, Billing Dashboard ได้เร็ว
- **Backend:** Node.js (NestJS หรือ Express) + PostgreSQL (Prisma) → จัดการดีล, การเงิน, Audit log
- **Realtime:** Supabase Realtime หรือ Socket.io สำหรับอีเวนต์ห้อง/แชท/Double-OK
- **Storage:** S3/GCS + Signed URL + Object ACL + expiring token สำหรับไฟล์งาน
- **Queue/Jobs:** BullMQ/Cloud Tasks สำหรับ delay payout, timeout, reminder
- **Observability:** OpenTelemetry + Log retention ตรงตามข้อกำหนดกฎหมาย
- **Deploy:** Frontend → Vercel, Backend → Railway/Render/Cloud Run, DB → Neon/Supabase

## 💳 พาร์ทเนอร์การชำระเงิน (ไทย)
- **Stripe Thailand** – เปิดตัวทางการแล้ว รองรับบัตร, PromptPay, Marketplace/Connect, Webhook สากล
- **Omise (Opn Payments)** – เจาะตลาดไทย, รองรับ Thai QR, installment, ฟีเจอร์ split payout และทำ KYC ให้ผู้ขาย
- **Thai QR / PromptPay** – ใช้มาตรฐานธปท. (Thai QR) เป็นช่องทางยอดนิยม พร้อม webhook ยืนยันยอด

## 🧭 Roadmap 6+ สัปดาห์ (MVP → Scale)
| สัปดาห์ | เป้าหมาย | รายละเอียด |
| --- | --- | --- |
| 1-2 | MVP Double-OK | Auth, สร้างดีล, Stripe/Omise Sandbox, Review Room (upload + watermark), Double-OK → Payout sandbox |
| 3-4 | Dispute & Finance | Dispute Center, timeout queue, ใบเสร็จ/รายงาน, โปรไฟล์+รีวิว |
| 5-6 | Hardening | WAF/Rate limit, ลายน้ำเฉพาะผู้ซื้อ, ฟิงเกอร์ปรินต์, แจ้งเตือนอีเมล/LINE |
| 7+ | Monetize & Scale | แพ็กเกจค่าธรรมเนียม, คูปอง/แนะนำเพื่อน, รายงานภาษี, Multi-currency |

## 📊 KPI เริ่มต้น
- % ดีลที่ Double-OK ภายใน SLA
- ระยะเวลาจากชำระ → Double-OK → โอนเงิน (end-to-end)
- NPS / คะแนนความพึงพอใจของผู้ซื้อ-ผู้ขาย
- จำนวนข้อพิพาทที่ปิดได้ภายใน SLA และอัตรา repeat deal

## ✅ Checklist ก่อนเปิดจริง
- ทดสอบ Stripe/Omise ใน Test mode ครบทุกกรณี (success, fail, dispute)
- ตั้ง Stripe Radar / Omise 3DS เพื่อลดความเสี่ยง fraud
- มี ToS / Privacy Policy / PDPA consent + ช่องทางติดต่อ DPO
- จัดทำ Incident Response & Log retention อย่างน้อย 180 วัน
- สร้าง playbook ฝั่งแอดมินสำหรับไกล่เกลี่ยข้อพิพาท

---
พร้อมใช้งานเป็น One-pager สำหรับ align ทีมผลิตภัณฑ์, dev, และฝ่ายคอมพลายแอนซ์ วางพื้นฐาน "เห็นของก่อน-เงินค้างกลาง-Double-OK" แบบปฏิบัติได้จริงในตลาดไทย

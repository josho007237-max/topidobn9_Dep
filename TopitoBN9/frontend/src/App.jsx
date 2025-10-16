import {
  ArrowRight,
  BadgeCheck,
  Brain,
  CalendarClock,
  CheckCheck,
  CircleDashed,
  ClipboardCheck,
  Database,
  FileCheck2,
  FileText,
  GitBranch,
  HandCoins,
  Layers3,
  Lock,
  MessageSquare,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Wallet,
  Workflow,
} from 'lucide-react';
import { useMemo } from 'react';

const sections = [
  { id: 'mission', label: 'Mission' },
  { id: 'features', label: 'ฟีเจอร์หลัก' },
  { id: 'flow', label: 'User Flow' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'contact', label: 'เริ่มต้น' },
];

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-wide text-primary-600">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-3 text-lg leading-relaxed text-slate-600">{description}</p>
      )}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, tag }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <p className="text-base font-semibold text-slate-900">{title}</p>
          {tag && <span className="text-xs font-medium text-primary-600">{tag}</span>}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function FlowStep({ step, title, description, icon: Icon }) {
  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm">
      <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-primary-600">
        {step}
      </div>
      <div className="flex items-center gap-3 pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-lg font-semibold text-slate-900">{title}</p>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function RoadmapColumn({ title, weeks, items }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{weeks}</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{title}</p>
        </div>
        <GitBranch className="h-5 w-5 text-primary-500" />
      </div>
      <ul className="space-y-3 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckCheck className="mt-1 h-4 w-4 shrink-0 text-primary-500" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComplianceList({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.title}
          className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/70 p-5 shadow-sm"
        >
          <ShieldCheck className="mt-1 h-5 w-5 text-primary-500" />
          <div>
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const featureGroups = useMemo(
    () => [
      {
        icon: MessageSquare,
        title: 'Review Room ผ่านกลาง',
        description:
          'แชท ไทม์ไลน์ และการส่งมอบเวอร์ชันงานทั้งหมดอยู่ในที่เดียว เก็บ log ทุกคลิกเพื่อใช้เป็นหลักฐานได้ทันที.',
      },
      {
        icon: Lock,
        title: 'หลักฐานอัจฉริยะ',
        description:
          'ลายน้ำเฉพาะดีล, URL หมดอายุ, สตรีมไฟล์แบบป้องกันดาวน์โหลด พร้อมบันทึก hash และ timestamp ครบถ้วน.',
      },
      {
        icon: Wallet,
        title: 'กระเป๋าเงินพัก (Escrow-like)',
        description:
          'รับเงินผ่านบัตร ผ่อน วอลเล็ต หรือ Thai QR แล้วพักไว้ใน balance แพลตฟอร์ม รอ Double-OK ก่อนจ่ายจริง.',
      },
      {
        icon: HandCoins,
        title: 'Double-OK Automation',
        description:
          'ทั้งผู้ซื้อและผู้ขายกดยืนยันพร้อมกัน → ระบบสร้างคิวโอนอัตโนมัติ หัก platform fee แล้วจ่ายเข้าบัญชีผู้ขาย.',
      },
      {
        icon: TimerReset,
        title: 'SLA & Dispute Mode',
        description:
          'ตั้ง timeout ถ้าเลยกำหนดจะเข้าโหมดไกล่เกลี่ยทันที พร้อมบันทึกหลักฐานและ workflow การตัดสินที่โปร่งใส.',
      },
      {
        icon: Layers3,
        title: 'ต่อยอดได้เร็ว',
        description:
          'ฐานข้อมูล Prisma, Queue งานดีเลย์, Analytics และ OpenTelemetry พร้อม scale เป็น Marketplace เต็มรูปแบบ.',
      },
    ],
    []
  );

  const flowSteps = useMemo(
    () => [
      {
        title: 'Onboarding & KYC',
        description:
          'ฟรีแลนซ์เชื่อมบัญชีรับเงินผ่าน Stripe/Omise Connect ผู้ว่าจ้างยืนยันอีเมลและตั้ง 2FA เพื่อเริ่มใช้งาน.',
        icon: BadgeCheck,
      },
      {
        title: 'สร้างดีล & วงเงิน',
        description:
          'กำหนดขอบเขตงาน ราคา และหลักฐานที่ต้องส่ง พร้อมออกบิล Thai QR/Checkout ให้ผู้ว่าจ้างชำระก่อน.',
        icon: FileText,
      },
      {
        title: 'ส่งงานใน Review Room',
        description:
          'ผู้ขายอัปโหลดไฟล์ลายน้ำ/low-res และคุยผ่านแชทในระบบ จำกัดรอบแก้ไข และเก็บ log ทุกเหตุการณ์.',
        icon: MessageSquare,
      },
      {
        title: 'Double-OK & โอนอัตโนมัติ',
        description:
          'เมื่อทั้งสองฝั่งกดยืนยัน ระบบปล่อยคิวโอนเข้าบัญชีผู้ขาย พร้อมออกใบเสร็จและหักค่าบริการอัตโนมัติ.',
        icon: Wallet,
      },
      {
        title: 'Dispute & Review',
        description:
          'กรณีพิพาทเปิดเคสได้ทันที แนบหลักฐาน รอแอดมินตัดสิน และสรุปรายงาน + คะแนนความน่าเชื่อถือทุกดีล.',
        icon: ClipboardCheck,
      },
    ],
    []
  );

  const complianceItems = useMemo(
    () => [
      {
        title: 'PDPA & Privacy',
        description:
          'แบบฟอร์มความยินยอม สิทธิ์ขอแก้ไข/ลบข้อมูล เก็บ Purpose & Consent Log ตามข้อกำหนด PDPA ไทย.',
      },
      {
        title: 'Terms & Acceptable Use',
        description:
          'ชัดเจนว่าเน้นงานดิจิทัลที่ถูกกฎหมาย ห้ามสินค้าละเมิดลิขสิทธิ์หรือขัดนโยบายแพลตฟอร์มโซเชียล.',
      },
      {
        title: 'KYC & ภาษี',
        description:
          'ผูก Stripe/Omise Connect เพื่อทำ KYC ตามมาตรฐาน พร้อมรองรับการออกเอกสารภาษีและรายงานรายได้.',
      },
      {
        title: 'Log & Evidence Retention',
        description:
          'เก็บข้อความ ไฟล์ เวลาการกดปุ่ม และ IP อย่างน้อย 180-365 วัน พร้อม time-sync และ checksum.',
      },
      {
        title: 'Dispute SLA',
        description:
          'กำหนดขั้นตอนอุทธรณ์ การเปิดโหมดไกล่เกลี่ย และบทบาทผู้ตัดสินอย่างโปร่งใส ตรวจสอบย้อนหลังได้.',
      },
      {
        title: 'Payment Compliance',
        description:
          'ใช้ผู้ให้บริการที่ได้รับอนุญาต (Stripe TH / Omise) เพื่อรองรับ Thai QR, PromptPay, และ Split/Payout อย่างถูกต้อง.',
      },
    ],
    []
  );

  const dataModel = [
    {
      title: 'users',
      fields: 'role, kyc_status, rating, stripe_account, created_at',
      description: 'แยกบทบาท Buyer/Seller/Admin พร้อมสถานะ KYC และคะแนนความน่าเชื่อถือ.',
    },
    {
      title: 'deals',
      fields: 'buyer_id, seller_id, title, scope, price, status, timeout_at, transfer_group',
      description:
        'เก็บสถานะตั้งแต่ Draft → Funded → Double-OK → Paid_out พร้อม SLA timeout และกลุ่มสำหรับการโอน.',
    },
    {
      title: 'deal_events',
      fields: 'type, payload, actor_id, created_at',
      description: 'บันทึกแชท การอัปโหลดไฟล์ การกดยืนยัน/เปิดข้อพิพาท ใช้เป็นหลักฐานย้อนหลัง.',
    },
    {
      title: 'payments',
      fields: 'provider, payment_intent_id, amount, status',
      description: 'เชื่อม Stripe/Omise เพื่อดูสถานะการรับเงินและ reconcile กับ webhook.',
    },
    {
      title: 'payouts',
      fields: 'transfer_id, amount, fee_amount, status',
      description: 'ติดตามการโอนออกไปยังฟรีแลนซ์ รองรับการหักค่าธรรมเนียมและ retry ในกรณีล้มเหลว.',
    },
    {
      title: 'artifacts',
      fields: 'storage_key, checksum, visibility, expires_at',
      description: 'เก็บไฟล์ต้นฉบับและ preview แยก bucket พร้อม signed URL และกำหนดวันหมดอายุ.',
    },
  ];

  const stackHighlights = [
    {
      icon: Workflow,
      title: 'Frontend — Next.js / Tailwind',
      description:
        'App Router + SSR เพื่อ SEO และความเร็ว พร้อม shadcn/ui สำหรับแบบฟอร์มและแดชบอร์ดที่คุ้นมือ dev.',
    },
    {
      icon: Database,
      title: 'Backend — Node.js + Prisma',
      description:
        'เลือกใช้ NestJS หรือ Express กับ PostgreSQL บน Neon/Supabase พร้อม Prisma Client ให้ทีม iterate ได้ไว.',
    },
    {
      icon: CircleDashed,
      title: 'Realtime & Queue',
      description:
        'Supabase Realtime หรือ Socket.io สำหรับ event ห้องสนทนา และ BullMQ จัดการงานดีเลย์อย่าง Double-OK timeout.',
    },
    {
      icon: PlayCircle,
      title: 'Storage & Evidence',
      description:
        'S3/GCS พร้อม Signed URL, Object-level ACL และระบบสร้าง preview + ลายน้ำสำหรับไฟล์ทุกประเภท.',
    },
    {
      icon: CalendarClock,
      title: 'Observability',
      description:
        'OpenTelemetry + Log retention เพื่อตรวจสอบเหตุการณ์ย้อนหลังและตอบโจทย์ข้อกำหนดด้านกฎหมาย.',
    },
    {
      icon: HandCoins,
      title: 'Payments & Payouts',
      description:
        'Stripe Thailand หรือ Omise (กลับมาใช้ชื่อเดิมปี 2025) รองรับ PromptPay, Thai QR และ Split/Payout API.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:px-10">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <a href="#top" className="flex items-center gap-3 text-slate-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">OK2Go</p>
              <p className="text-sm text-slate-500">Double-OK Marketplace Layer</p>
            </div>
          </a>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            {sections.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="rounded-full px-3 py-2 hover:bg-primary-50 hover:text-primary-600">
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200/80 hover:bg-primary-500"
          >
            จองเดโม
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </header>

        <main className="mt-16 space-y-24">
          <section id="mission" className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,110,255,0.07),_transparent_55%)]" />
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                  เห็นงานก่อน เงินค้างกลาง
                </span>
                <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
                  แพลตฟอร์ม Double-OK สำหรับงานดิจิทัลในไทย
                </h1>
                <p className="text-lg leading-relaxed text-slate-600">
                  รับเงินก่อน ส่งงานในห้องที่ตรวจสอบได้ และปล่อยจ่ายอัตโนมัติเมื่อทั้งสองฝ่ายยืนยัน ลดความเสี่ยง โฟกัสคุณภาพงาน พร้อมฐานหลักฐานครบถ้วนสำหรับข้อพิพาท.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                    <ShieldCheck className="h-4 w-4 text-primary-500" />
                    PDPA-first
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                    <Wallet className="h-4 w-4 text-primary-500" />
                    รองรับ Stripe TH & Omise
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                    <MessageSquare className="h-4 w-4 text-primary-500" />
                    Review Room + Logs
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#features"
                    className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-500"
                  >
                    ดูฟีเจอร์หลัก
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#flow"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-600"
                  >
                    เรียนรู้โฟลว์
                  </a>
                </div>
              </div>
              <div className="relative flex h-full flex-col justify-between gap-6 rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <BadgeCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Mission</p>
                    <p className="text-sm text-slate-500">ทำดีลออนไลน์ให้แฟร์ทั้งสองฝ่าย</p>
                  </div>
                </div>
                <p className="text-base leading-relaxed text-slate-600">
                  OK2Go ทำหน้าที่เป็นตัวกลางรับเงิน ถือรอตรวจงาน แล้วโอนต่ออัตโนมัติเมื่อทั้งสองฝ่ายกดยืนยัน (Double-OK) โดยไม่อ้างตัวเป็น Escrow ตามกฎหมาย แต่ใช้โครงสร้าง Marketplace + Split/Payout ผ่านพาร์ทเนอร์การชำระเงินที่ได้รับอนุญาต.
                </p>
                <div className="grid gap-4 text-sm text-slate-600">
                  <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
                    <span>Persona หลัก</span>
                    <span className="font-semibold text-slate-900">ฟรีแลนซ์ / เอเจนซี่ / ผู้ว่าจ้างงานดิจิทัล</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
                    <span>ค่าสมัคร</span>
                    <span className="font-semibold text-slate-900">เริ่มต้นฟรี หัก Platform Fee เมื่อจ่ายจริง</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="space-y-12">
            <SectionTitle
              eyebrow="Core Value"
              title="ห้องผ่านกลาง + กระเป๋าเงินพัก + หลักฐานครบ"
              description="ทุกจุดของดีลถูกออกแบบให้โปร่งใส ปลอดภัย และใช้งานง่ายสำหรับงานดิจิทัล ตั้งแต่รับเงินจนถึงรีวิวหลังปิดดีล."
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featureGroups.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </section>

          <section className="space-y-10">
            <SectionTitle
              eyebrow="Double-OK Flow"
              title="เห็นงานก่อน เงินค้างกลาง จากนั้นจึงกดยืนยันพร้อมกัน"
              description="Workflow ตั้งแต่สมัครจนเงินเข้าบัญชีผู้ขาย พร้อมระบบหลักฐานและ SLA ชัดเจนครบทุกจุด."
            />
            <div className="grid gap-6 lg:grid-cols-5">
              {flowSteps.map((step, index) => (
                <FlowStep key={step.title} step={index + 1} {...step} />
              ))}
            </div>
          </section>

          <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-6 rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-lg">
              <SectionTitle
                eyebrow="Data Model"
                title="โครงสร้างข้อมูลที่บันทึกหลักฐานทุกคลิก"
                description="ใช้ Prisma + PostgreSQL แยกตารางหลักเพื่อรองรับ Room, Payment และ Dispute พร้อม trace ย้อนหลังได้ทุกเหตุการณ์."
              />
              <div className="grid gap-4">
                {dataModel.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-slate-900">{item.title}</p>
                      <Database className="h-4 w-4 text-primary-500" />
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">{item.fields}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6 rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-lg">
              <SectionTitle
                eyebrow="Stack"
                title="Tech Stack ที่พร้อมสเกลและเชื่อมต่อ"
                description="คัดชุดเทคโนโลยีที่คุ้นมือทีม dev ในไทยและรองรับการเติบโตเป็น Marketplace เต็มรูปแบบ."
              />
              <div className="grid gap-4">
                {stackHighlights.map((item) => (
                  <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="flow" className="grid gap-10 rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-lg lg:grid-cols-2">
            <div className="space-y-6">
              <SectionTitle
                eyebrow="Review Room Experience"
                title="ล็อกหลักฐานและลดความเสี่ยงการขโมยงาน"
                description="ชุดฟีเจอร์ที่ทำให้ทั้งสองฝ่ายมั่นใจ ส่งงานแบบเห็นก่อน พร้อมรอยเท้าอ้างอิงครบ."
              />
              <ul className="space-y-4 text-sm text-slate-600">
                {[{
                  icon: Sparkles,
                  text: 'Preview ลายน้ำเฉพาะรายชื่อผู้ซื้อ + หมายเลขดีล ลดแรงจูงใจนำผลงานไปใช้ก่อนชำระเงิน.',
                },
                {
                  icon: Lock,
                  text: 'Signed URL อายุสั้น, ปิดดาวน์โหลดตรง ๆ และตรวจจับการเข้าถึงผิดปกติด้วย audit log.',
                },
                {
                  icon: MessageSquare,
                  text: 'แชท + Comment thread ต่อเวอร์ชันงาน เก็บ IP, เวลา, Device เป็นหลักฐานพร้อมใช้.',
                },
                {
                  icon: Brain,
                  text: 'รองรับการต่อยอด AI Assist เช่นสรุปฟีดแบ็ก, ตรวจรอบแก้ไขอัตโนมัติ และ Insight สำหรับทีมบัญชี.',
                }].map((item) => (
                  <li key={item.text} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <item.icon className="mt-1 h-4 w-4 text-primary-500" />
                    <span className="leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 p-6 text-sm leading-relaxed text-primary-900">
              <p className="text-lg font-semibold">ภาพรวมโครงสร้างการเงิน</p>
              <div className="space-y-4">
                <div className="rounded-xl bg-white/90 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">Option A — Stripe/Omise + Conditional Payout</p>
                  <p className="mt-2 text-sm text-slate-600">
                    รับเงินผ่าน Checkout → เงินเข้าบัญชีแพลตฟอร์ม → Double-OK → สร้าง Transfer/Payout ไปยังบัญชีผู้ขาย พร้อมหัก Platform fee.
                  </p>
                </div>
                <div className="rounded-xl bg-white/90 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">Option B — Thai QR + Reconcile</p>
                  <p className="mt-2 text-sm text-slate-600">
                    ออกบิลพร้อม QR → รับ webhook ยืนยันยอด → Double-OK → โอนออกผ่าน API ของเกตเวย์/ธนาคารตาม SLA.
                  </p>
                </div>
                <div className="rounded-xl bg-white/90 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">หลักฐาน & การไกล่เกลี่ย</p>
                  <p className="mt-2 text-sm text-slate-600">
                    บันทึกทุก event: chat, file, approve, dispute และเชื่อม OpenTelemetry เพื่อตรวจสอบย้อนหลังและสร้างรายงานข้อพิพาท.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="compliance" className="space-y-10">
            <SectionTitle
              eyebrow="Compliance Checklist"
              title="เช็กลิสต์ก่อนเปิดใช้งานจริง"
              description="จัดทำเอกสารและกระบวนการตามข้อกำหนดของธปท., PDPA, และนโยบายพาร์ทเนอร์การชำระเงิน."
            />
            <ComplianceList items={complianceItems} />
          </section>

          <section id="roadmap" className="space-y-10">
            <SectionTitle
              eyebrow="Execution Plan"
              title="Roadmap 6 สัปดาห์ — ปั้น MVP ที่ว้าวทุกสัปดาห์"
              description="เริ่มจากแก่น Double-OK แล้วไล่ต่อยอด Dispute, Analytics และ Growth Features ตามลำดับ."
            />
            <div className="grid gap-6 lg:grid-cols-3">
              <RoadmapColumn
                title="MVP Core"
                weeks="สัปดาห์ 1-2"
                items={[
                  'Scaffold Next.js + API + Prisma พร้อม Auth เบื้องต้น',
                  'รับเงินผ่าน Stripe/Omise (Sandbox) + Review Room เวอร์ชันแรก',
                  'Double-OK Trigger → Queue จ่ายเงินแบบอัตโนมัติ',
                ]}
              />
              <RoadmapColumn
                title="Trust & Dispute"
                weeks="สัปดาห์ 3-4"
                items={[
                  'ระบบ Dispute Center + SLA ไทม์เอาท์',
                  'ใบเสร็จ, Billing Dashboard, Seller Profile & Review',
                  'รายงานรายวัน/รายเดือน + Export สำหรับบัญชี',
                ]}
              />
              <RoadmapColumn
                title="Scale & Growth"
                weeks="สัปดาห์ 5-6"
                items={[
                  'เสริม WAF/Rate limit, ลายน้ำชื่อผู้ซื้อ, ฟิงเกอร์ปรินต์',
                  'แจ้งเตือนผ่าน Email/LINE Notify, ระบบคูปอง/Affiliate',
                  'รองรับ Multi-currency & ภาษีหัก ณ ที่จ่าย',
                ]}
              />
            </div>
          </section>

          <section className="space-y-8 rounded-3xl border border-slate-100 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 p-8 text-white shadow-xl" id="contact">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-4">
                <h3 className="text-3xl font-semibold">พร้อมพา OK2Go ไปสู่ผู้ใช้จริง</h3>
                <p className="text-base leading-relaxed text-primary-50">
                  เราช่วยตั้งค่าระบบรับ-ถือ-โอนเงิน, สร้าง Review Room, จัดทำเอกสาร Compliance และเทรนนิ่งทีมให้พร้อมใช้งานใน 6 สัปดาห์.
                </p>
                <ul className="space-y-3 text-sm text-primary-50">
                  <li className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4" /> ทีม dev & product ที่เข้าใจตลาดไทย
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> มี Blueprint สำหรับ Stripe/Omise พร้อมทดสอบทันที
                  </li>
                  <li className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4" /> เอกสาร PDPA / ToS Template ภาษาไทย
                  </li>
                </ul>
              </div>
              <a
                href="mailto:team@ok2go.th"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-600 shadow-lg shadow-primary-900/20 hover:bg-primary-50"
              >
                นัดคุยกับทีม OK2Go
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-primary-100">
              <span className="rounded-full border border-primary-300/40 px-3 py-1">
                ขอบเขต: งานดิจิทัลถูกกฎหมาย / ไม่ละเมิดแพลตฟอร์ม
              </span>
              <span className="rounded-full border border-primary-300/40 px-3 py-1">
                ข้อมูลถูกเก็บอย่างปลอดภัย + Audit Log ครบ
              </span>
              <span className="rounded-full border border-primary-300/40 px-3 py-1">
                พร้อมต่อยอด AI Automation และ Supabase Integration
              </span>
            </div>
          </section>
        </main>

        <footer className="mt-20 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} OK2Go. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span>PDPA Ready</span>
            <span>Stripe / Omise Partner Friendly</span>
            <span>Thai Team</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

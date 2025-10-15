import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { createClient } from '@supabase/supabase-js';
import {
  Activity,
  AlertTriangle,
  Bot,
  Brain,
  Layers3,
  MessageCircle,
  RefreshCcw,
  Rocket,
  Settings,
  Sparkles,
  Webhook,
} from 'lucide-react';
import clsx from 'clsx';

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const DEFAULT_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

const fetcher = async (path) => {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
  }
  return response.json();
};

const emptyCommand = {
  command: '',
  description: '',
  response: '',
  buttons: [],
};

const emptyQuickReply = {
  title: '',
  keyword: '',
  response: '',
};

const notificationVariants = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-rose-500 text-white',
  info: 'bg-slate-900 text-white',
};

function Notification({ notification, onDismiss }) {
  if (!notification) return null;
  return (
    <div
      className={clsx(
        'fixed bottom-6 right-6 flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl transition-all duration-300',
        notificationVariants[notification.type || 'info']
      )}
    >
      <span className="font-semibold">{notification.message}</span>
      <button
        type="button"
        className="rounded-md bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30"
        onClick={onDismiss}
      >
        ปิด
      </button>
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, actions, children }) {
  return (
    <section className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500">
            {Icon ? <Icon className="h-5 w-5 text-primary-500" /> : null}
            <span className="text-sm font-semibold uppercase tracking-wide text-primary-500">
              {title}
            </span>
          </div>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ online }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
        online ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      )}
    >
      <span
        className={clsx('h-2.5 w-2.5 rounded-full', online ? 'bg-emerald-500' : 'bg-amber-500')}
      />
      {online ? 'Connected' : 'Pending'}
    </span>
  );
}

function DataTable({ columns, rows, emptyText }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/80">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white/60">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-slate-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-primary-50/40">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-slate-700">
                    {typeof column.render === 'function' ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function CommandManager({ botId, commands, onSaved, onDeleted }) {
  const [form, setForm] = useState(emptyCommand);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!editingId) return;
    const command = commands.find((item) => item.id === editingId);
    if (command) {
      setForm({
        command: command.command,
        description: command.description || '',
        response: command.response || '',
        buttons: command.buttons || [],
      });
    }
  }, [commands, editingId]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyCommand);
  };

  const handleButtonChange = (index, field, value) => {
    setForm((prev) => {
      const buttons = [...(prev.buttons || [])];
      buttons[index] = {
        ...buttons[index],
        [field]: value,
      };
      return { ...prev, buttons };
    });
  };

  const handleAddButton = () => {
    setForm((prev) => ({
      ...prev,
      buttons: [
        ...(prev.buttons || []),
        { label: '', type: 'command', value: '' },
      ].slice(0, 6),
    }));
  };

  const handleRemoveButton = (index) => {
    setForm((prev) => ({
      ...prev,
      buttons: (prev.buttons || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!botId) return;
    setIsSaving(true);
    try {
      await onSaved({ ...form, id: editingId || undefined });
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">คำสั่งทั้งหมด</h3>
          <span className="text-sm text-slate-500">{commands.length} รายการ</span>
        </div>
        <DataTable
          columns={[
            { key: 'command', label: 'Command' },
            {
              key: 'description',
              label: 'คำอธิบาย',
              render: (row) => <span className="text-slate-500">{row.description}</span>,
            },
            {
              key: 'actions',
              label: 'การจัดการ',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                    onClick={() => setEditingId(row.id)}
                  >
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                    onClick={() => onDeleted(row.id).then(() => editingId === row.id && resetForm())}
                  >
                    ลบ
                  </button>
                </div>
              ),
            },
          ]}
          rows={commands}
          emptyText="ยังไม่มีคำสั่ง เพิ่มคำสั่งแรกของคุณได้เลย"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-slate-50/80 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600">
              {editingId ? 'แก้ไขคำสั่ง' : 'สร้างคำสั่งใหม่'}
            </p>
            <p className="text-xs text-slate-500">กำหนดข้อความและปุ่มลัดที่จะตอบกลับอัตโนมัติ</p>
          </div>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              เริ่มใหม่
            </button>
          ) : null}
        </div>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Command</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="เช่น /start"
            value={form.command}
            onChange={(event) => setForm((prev) => ({ ...prev, command: event.target.value }))}
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">คำอธิบาย</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="ช่วยให้ทีมงานเข้าใจบริบทของคำสั่ง"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">ข้อความตอบกลับ</span>
          <textarea
            className="min-h-[140px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="พิมพ์ข้อความที่ต้องการตอบกลับ"
            value={form.response}
            onChange={(event) => setForm((prev) => ({ ...prev, response: event.target.value }))}
            required
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              ปุ่มลัด (ไม่บังคับ)
            </span>
            <button
              type="button"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
              onClick={handleAddButton}
            >
              + เพิ่มปุ่ม
            </button>
          </div>
          <div className="space-y-2">
            {(form.buttons || []).map((button, index) => (
              <div
                key={`button-${index}`}
                className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm md:grid-cols-3"
              >
                <input
                  className="rounded-md border border-slate-200 px-3 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="ชื่อปุ่ม"
                  value={button.label}
                  onChange={(event) => handleButtonChange(index, 'label', event.target.value)}
                  required
                />
                <select
                  className="rounded-md border border-slate-200 px-3 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  value={button.type}
                  onChange={(event) => handleButtonChange(index, 'type', event.target.value)}
                >
                  <option value="command">Command</option>
                  <option value="url">URL</option>
                  <option value="web_app">Web App</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder={button.type === 'command' ? 'ค่าที่ส่งกลับ' : 'ลิงก์ / URL'}
                    value={button.value || ''}
                    onChange={(event) => handleButtonChange(index, 'value', event.target.value)}
                  />
                  <button
                    type="button"
                    className="rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-100"
                    onClick={() => handleRemoveButton(index)}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
        >
          {isSaving ? 'กำลังบันทึก...' : editingId ? 'อัปเดตคำสั่ง' : 'บันทึกคำสั่งใหม่'}
        </button>
      </form>
    </div>
  );
}

function QuickReplyManager({ botId, quickReplies, onSaved, onDeleted }) {
  const [form, setForm] = useState(emptyQuickReply);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!editingId) return;
    const quickReply = quickReplies.find((item) => item.id === editingId);
    if (quickReply) {
      setForm({
        title: quickReply.title || '',
        keyword: quickReply.keyword || '',
        response: quickReply.response || '',
      });
    }
  }, [quickReplies, editingId]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyQuickReply);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!botId) return;
    setIsSaving(true);
    try {
      await onSaved({ ...form, id: editingId || undefined });
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">ข้อความด่วน (Quick Reply)</h3>
          <span className="text-sm text-slate-500">{quickReplies.length} รายการ</span>
        </div>
        <DataTable
          columns={[
            { key: 'title', label: 'ชื่อ' },
            { key: 'keyword', label: 'คำค้นหา' },
            {
              key: 'actions',
              label: 'การจัดการ',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                    onClick={() => setEditingId(row.id)}
                  >
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                    onClick={() => onDeleted(row.id).then(() => editingId === row.id && resetForm())}
                  >
                    ลบ
                  </button>
                </div>
              ),
            },
          ]}
          rows={quickReplies}
          emptyText="ยังไม่มี Quick Reply สร้างใหม่เพื่อช่วยตอบคำถามซ้ำ ๆ"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-slate-50/80 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600">
              {editingId ? 'แก้ไข Quick Reply' : 'เพิ่ม Quick Reply'}
            </p>
            <p className="text-xs text-slate-500">จับคู่ข้อความคำถามที่พบบ่อยและตอบกลับอัตโนมัติ</p>
          </div>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              เริ่มใหม่
            </button>
          ) : null}
        </div>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">ชื่อ</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="เช่น เวลาทำการ"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">คำค้นหา</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="ตัวอย่างคำที่ลูกค้าจะพิมพ์"
            value={form.keyword}
            onChange={(event) => setForm((prev) => ({ ...prev, keyword: event.target.value }))}
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">ข้อความตอบกลับ</span>
          <textarea
            className="min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="ตอบกลับเมื่อพบคำค้นหานี้"
            value={form.response}
            onChange={(event) => setForm((prev) => ({ ...prev, response: event.target.value }))}
            required
          />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
        >
          {isSaving ? 'กำลังบันทึก...' : editingId ? 'อัปเดตข้อความ' : 'บันทึกข้อความใหม่'}
        </button>
      </form>
    </div>
  );
}

function SettingsManager({ botId, settings, onUpdated, onTestWebhook, onSendTest }) {
  const [form, setForm] = useState(settings);
  const [testMessage, setTestMessage] = useState({ chatId: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isUpdatingWebhook, setIsUpdatingWebhook] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!botId) return;
    setIsSaving(true);
    try {
      await onUpdated(form);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWebhook = async () => {
    if (!botId) return;
    setIsUpdatingWebhook(true);
    try {
      await onTestWebhook(form.webhookUrl);
    } finally {
      setIsUpdatingWebhook(false);
    }
  };

  const handleSendTest = async (event) => {
    event.preventDefault();
    if (!botId) return;
    setIsSendingTest(true);
    try {
      await onSendTest(testMessage);
      setTestMessage({ chatId: '', message: '' });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-slate-50/80 p-5">
        <div>
          <p className="text-sm font-semibold text-slate-600">Automation & AI</p>
          <p className="text-xs text-slate-500">ตั้งค่าการตอบกลับอัตโนมัติและโมเดล GPT</p>
        </div>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">ข้อความ Default</span>
          <textarea
            className="min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="ตอบกลับเมื่อไม่พบคำสั่งที่ตรง"
            value={form.defaultResponse}
            onChange={(event) => setForm((prev) => ({ ...prev, defaultResponse: event.target.value }))}
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Persona ของบอท</span>
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="อธิบายบุคลิกและบทบาทของ AI"
            value={form.aiPersona}
            onChange={(event) => setForm((prev) => ({ ...prev, aiPersona: event.target.value }))}
          />
        </label>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={form.aiEnabled}
              onChange={(event) => setForm((prev) => ({ ...prev, aiEnabled: event.target.checked }))}
            />
            <span>เปิด AI</span>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={form.autoKeyboard}
              onChange={(event) => setForm((prev) => ({ ...prev, autoKeyboard: event.target.checked }))}
            />
            <span>Auto Keyboard</span>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={form.autoCommands}
              onChange={(event) => setForm((prev) => ({ ...prev, autoCommands: event.target.checked }))}
            />
            <span>Auto Command</span>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">โมเดล GPT</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              value={form.aiModel}
              onChange={(event) => setForm((prev) => ({ ...prev, aiModel: event.target.value }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Temperature</span>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              value={form.aiTemperature}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, aiTemperature: Number(event.target.value) }))
              }
            />
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mini App URL</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="https://bn9.club/miniapp"
            value={form.miniAppUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, miniAppUrl: event.target.value }))}
          />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
        >
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </form>

      <div className="space-y-6 rounded-xl bg-slate-50/80 p-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-600">Webhook</p>
          <p className="text-xs text-slate-500">
            ตั้งค่า URL สำหรับรับข้อความจาก Telegram สามารถใช้โดเมนของคุณหรือ Replit ได้
          </p>
          <div className="space-y-3">
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              placeholder="https://your-domain.com/webhook/primary"
              value={form.webhookUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, webhookUrl: event.target.value }))}
            />
            <button
              type="button"
              onClick={handleWebhook}
              disabled={isUpdatingWebhook}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isUpdatingWebhook ? 'กำลังอัปเดต...' : 'บันทึก Webhook'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSendTest} className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-600">ทดสอบส่งข้อความ</p>
            <p className="text-xs text-slate-500">ส่งข้อความหา Chat ID ที่คุณต้องการเพื่อตรวจสอบการตอบกลับ</p>
          </div>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chat ID</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              value={testMessage.chatId}
              onChange={(event) =>
                setTestMessage((prev) => ({ ...prev, chatId: event.target.value }))
              }
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">ข้อความ</span>
            <textarea
              className="min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              value={testMessage.message}
              onChange={(event) =>
                setTestMessage((prev) => ({ ...prev, message: event.target.value }))
              }
              required
            />
          </label>
          <button
            type="submit"
            disabled={isSendingTest}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isSendingTest ? 'กำลังส่ง...' : 'ส่งข้อความทดสอบ'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AiPreview({ botId, aiPersona, onPreview }) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePreview = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const text = await onPreview(prompt);
      setResponse(text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl bg-slate-900 p-6 text-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Brain className="h-4 w-4 text-primary-300" />
            ตัวอย่างคำตอบจาก AI
          </p>
          <p className="mt-1 text-xs text-slate-300">
            โมเดลจะตอบตาม Persona: <span className="font-semibold text-white">{aiPersona || 'ยังไม่กำหนด'}</span>
          </p>
        </div>
        <StatusBadge online={!!botId} />
      </div>

      <textarea
        className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-300 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="พิมพ์คำถามที่ลูกค้าจะสอบถาม"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePreview}
          disabled={isLoading || !prompt.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-primary-300"
        >
          {isLoading ? 'กำลังสร้าง...' : 'สร้างคำตอบอัตโนมัติ'}
        </button>
        <button
          type="button"
          onClick={() => {
            setPrompt('');
            setResponse('');
          }}
          className="text-xs font-semibold text-slate-200 hover:text-white"
        >
          ล้างข้อความ
        </button>
      </div>

      {response ? (
        <div className="rounded-xl bg-white/5 p-4 text-sm text-slate-100">
          <p className="text-xs uppercase tracking-wide text-primary-200">คำตอบที่สร้างโดย AI</p>
          <p className="mt-2 whitespace-pre-line leading-relaxed">{response}</p>
        </div>
      ) : null}
    </div>
  );
}

function useSupabasePreview() {
  return useMemo(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return { configured: false };
    }
    try {
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });
      return { configured: true, client };
    } catch (error) {
      return { configured: false, error };
    }
  }, []);
}

export default function App() {
  const [selectedBot, setSelectedBot] = useState(null);
  const [notification, setNotification] = useState(null);

  const { data: botsData, mutate: refreshBots } = useSWR('/api/bots', fetcher);
  const { data: aiModels } = useSWR('/api/ai/models', fetcher);
  const { configured: supabaseConfigured } = useSupabasePreview();

  const bots = botsData?.bots || [];

  useEffect(() => {
    if (!selectedBot && bots.length) {
      setSelectedBot(bots[0]);
    }
  }, [bots, selectedBot]);

  const botId = selectedBot?.id;

  const {
    data: config,
    mutate: refreshConfig,
    isLoading: configLoading,
  } = useSWR(botId ? `/api/bots/${botId}/config` : null, fetcher);

  const { data: status, mutate: refreshStatus } = useSWR(
    botId ? `/api/bots/${botId}/status` : '/api/status',
    fetcher
  );

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const apiFetch = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'ไม่สามารถบันทึกข้อมูลได้');
    }
    if (response.status === 204) return null;
    return response.json();
  };

  const handleSelectBot = (id) => {
    const next = bots.find((bot) => bot.id === id) || null;
    setSelectedBot(next);
  };

  const handleSaveCommand = async (payload) => {
    if (!botId) return;
    const method = payload.id ? 'PUT' : 'POST';
    const url = payload.id
      ? `/api/bots/${botId}/commands/${payload.id}`
      : `/api/bots/${botId}/commands`;
    await apiFetch(url, { method, body: payload });
    await refreshConfig();
    showNotification('success', payload.id ? 'อัปเดตคำสั่งเรียบร้อย' : 'เพิ่มคำสั่งใหม่แล้ว');
  };

  const handleDeleteCommand = async (id) => {
    if (!botId) return;
    await apiFetch(`/api/bots/${botId}/commands/${id}`, { method: 'DELETE' });
    await refreshConfig();
    showNotification('success', 'ลบคำสั่งเรียบร้อย');
  };

  const handleSaveQuickReply = async (payload) => {
    if (!botId) return;
    const method = payload.id ? 'PUT' : 'POST';
    const url = payload.id
      ? `/api/bots/${botId}/quick-replies/${payload.id}`
      : `/api/bots/${botId}/quick-replies`;
    await apiFetch(url, { method, body: payload });
    await refreshConfig();
    showNotification('success', payload.id ? 'อัปเดต Quick Reply แล้ว' : 'เพิ่ม Quick Reply สำเร็จ');
  };

  const handleDeleteQuickReply = async (id) => {
    if (!botId) return;
    await apiFetch(`/api/bots/${botId}/quick-replies/${id}`, { method: 'DELETE' });
    await refreshConfig();
    showNotification('success', 'ลบ Quick Reply แล้ว');
  };

  const handleUpdateSettings = async (payload) => {
    if (!botId) return;
    await apiFetch(`/api/bots/${botId}/settings`, { method: 'PUT', body: payload });
    await refreshConfig();
    showNotification('success', 'บันทึกการตั้งค่าเรียบร้อย');
  };

  const handleWebhook = async (url) => {
    if (!botId) return;
    const response = await apiFetch(`/api/bots/${botId}/webhook`, {
      method: 'POST',
      body: { url },
    });
    await refreshConfig();
    await refreshStatus();
    showNotification('success', `อัปเดต Webhook เป็น ${response.webhookUrl}`);
  };

  const handleTestMessage = async ({ chatId, message }) => {
    if (!botId) return;
    await apiFetch(`/api/bots/${botId}/test-message`, {
      method: 'POST',
      body: { chatId, message },
    });
    showNotification('success', 'ส่งข้อความทดสอบเรียบร้อย');
  };

  const handleAiPreview = async (prompt) => {
    if (!botId) return '';
    const response = await apiFetch(`/api/bots/${botId}/ai/preview`, {
      method: 'POST',
      body: { prompt },
    });
    return response.text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                <Bot className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Telegram Control Center</h1>
                <p className="text-sm text-slate-500">
                  จัดการบอท Telegram, Mini App และการตอบกลับอัตโนมัติพร้อม AI
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <StatusBadge online={supabaseConfigured} />
            <span>Supabase</span>
            <span className="rounded-full bg-primary-100 px-3 py-1 font-semibold text-primary-600">
              {DEFAULT_MODEL}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <SectionCard
          title="Bot Overview"
          subtitle="เลือกบอทที่ต้องการจัดการและตรวจสอบสถานะการเชื่อมต่อ"
          icon={Rocket}
          actions={
            <button
              type="button"
              onClick={() => {
                refreshBots();
                refreshConfig();
                refreshStatus();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-300 hover:text-primary-600"
            >
              <RefreshCcw className="h-4 w-4" /> รีเฟรช
            </button>
          }
        >
          <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                เลือกบอท
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                value={botId || ''}
                onChange={(event) => handleSelectBot(event.target.value)}
              >
                {bots.map((bot) => (
                  <option key={bot.id} value={bot.id}>
                    {bot.name || bot.id}
                  </option>
                ))}
              </select>
              <div className="rounded-xl border border-dashed border-primary-200 bg-primary-50/50 p-4 text-xs text-primary-700">
                <p className="font-semibold">Mini App Dashboard พร้อมเชื่อมต่อ Supabase</p>
                <p className="mt-1 text-primary-600">
                  ระบบรองรับการขยายต่อ: Manifest, Deep Link, Telegram Stars และ Auto Generation
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Webhook className="h-4 w-4 text-primary-500" /> Webhook
                </p>
                <p className="mt-3 text-lg font-bold text-slate-900">
                  {status?.webhookUrl || status?.bots?.[0]?.webhookUrl || 'ยังไม่ตั้งค่า'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Activity className="h-4 w-4 text-primary-500" /> Pending Update
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {status?.pendingUpdateCount ?? status?.bots?.[0]?.pendingUpdateCount ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Sparkles className="h-4 w-4 text-primary-500" /> AI Model
                </p>
                <p className="mt-3 text-lg font-bold text-slate-900">
                  {config?.settings?.aiModel || aiModels?.models?.[0] || DEFAULT_MODEL}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {configLoading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <RefreshCcw className="h-4 w-4 animate-spin" /> กำลังโหลดข้อมูลบอท...
            </div>
          </div>
        ) : config ? (
          <div className="space-y-6">
            <SectionCard
              title="Commands"
              subtitle="จัดการคำสั่งหลัก ปุ่มลัด และข้อความตอบกลับ"
              icon={Layers3}
            >
              <CommandManager
                botId={botId}
                commands={config.commands || []}
                onSaved={handleSaveCommand}
                onDeleted={handleDeleteCommand}
              />
            </SectionCard>

            <SectionCard
              title="Quick Replies"
              subtitle="ตอบกลับคำถามซ้ำ ๆ ด้วยข้อความสั้น"
              icon={MessageCircle}
            >
              <QuickReplyManager
                botId={botId}
                quickReplies={config.quickReplies || []}
                onSaved={handleSaveQuickReply}
                onDeleted={handleDeleteQuickReply}
              />
            </SectionCard>

            <SectionCard
              title="Automation"
              subtitle="ตั้งค่าการตอบกลับอัตโนมัติ Webhook และข้อความทดสอบ"
              icon={Settings}
            >
              <SettingsManager
                botId={botId}
                settings={config.settings}
                onUpdated={handleUpdateSettings}
                onTestWebhook={handleWebhook}
                onSendTest={handleTestMessage}
              />
            </SectionCard>

            <SectionCard
              title="AI Generator"
              subtitle="ทดลองสร้างคำตอบอัตโนมัติจากโมเดล GPT"
              icon={Brain}
            >
              <AiPreview botId={botId} aiPersona={config.settings.aiPersona} onPreview={handleAiPreview} />
            </SectionCard>

            <SectionCard
              title="Phase IV Ready"
              subtitle="ระบบพร้อมต่อยอด Mini App + Supabase + AI + Webhook + Stars"
              icon={Rocket}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[{
                  title: 'AI Generator',
                  description: 'เชื่อมต่อ OpenAI เพื่อสร้างคำตอบอัตโนมัติพร้อม Persona เฉพาะแบรนด์',
                  icon: Brain,
                },
                {
                  title: 'Mini App Manifest',
                  description: 'รองรับการต่อยอดเพิ่ม Deep Link และ Telegram Stars สำหรับ WebApp',
                  icon: Rocket,
                },
                {
                  title: 'Supabase Automation',
                  description: 'พร้อมเชื่อมข้อมูลผู้ใช้ คำสั่งซื้อ และระบบสมาชิกผ่าน Supabase Auth',
                  icon: Activity,
                }].map((item) => (
                  <div
                    key={item.title}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <item.icon className="h-5 w-5 text-primary-500" />
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/70 p-8 text-rose-600">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-semibold">ยังไม่ได้เลือกบอท หรือบอทยังไม่มีการตั้งค่า</p>
            </div>
            <p className="mt-2 text-sm">
              เพิ่มบอทใหม่ผ่านตัวแปรแวดล้อม TELEGRAM_BOTS หรือเชื่อม Supabase เพื่อจัดการหลายบอทพร้อมกัน
            </p>
          </div>
        )}
      </main>

      <Notification notification={notification} onDismiss={() => setNotification(null)} />
    </div>
  );
}

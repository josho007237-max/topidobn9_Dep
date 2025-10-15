import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

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

const buttonTypes = [
  { value: 'command', label: 'Command' },
  { value: 'url', label: 'URL' },
  { value: 'web_app', label: 'Web App' },
];

function Notification({ type = 'success', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`notification ${type === 'error' ? 'error' : ''}`}>
      <span>{message}</span>
      <button type="button" className="secondary" onClick={onClose}>
        ปิด
      </button>
    </div>
  );
}

function StatusCard({ title, value, description }) {
  return (
    <div className="status-card">
      <h3>{title}</h3>
      <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</p>
      {description && <p style={{ color: '#334155', fontSize: '0.9rem' }}>{description}</p>}
    </div>
  );
}

export default function App() {
  const [config, setConfig] = useState({ commands: [], quickReplies: [], defaultResponse: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  const [commandForm, setCommandForm] = useState(emptyCommand);
  const [editingCommandId, setEditingCommandId] = useState(null);

  const [quickForm, setQuickForm] = useState(emptyQuickReply);
  const [editingQuickId, setEditingQuickId] = useState(null);

  const [webhookUrl, setWebhookUrl] = useState('');
  const [testMessage, setTestMessage] = useState({ chatId: '', message: '' });

  const apiFetch = async (path, options = {}) => {
    const url = `${API_BASE}${path}`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!response.ok) {
      let detail = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      try {
        const data = await response.json();
        detail = data.error || detail;
      } catch (err) {
        // ignore
      }
      const error = new Error(detail);
      error.status = response.status;
      throw error;
    }
    if (response.status === 204) return null;
    return response.json();
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [configData, statusData] = await Promise.all([
        apiFetch('/api/bot/config'),
        apiFetch('/api/bot/status'),
      ]);
      setConfig(configData);
      setStatus(statusData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDefaultResponseChange = (event) => {
    const value = event.target.value;
    setConfig((prev) => ({ ...prev, defaultResponse: value }));
  };

  const handleSaveDefaultResponse = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/bot/default-response', {
        method: 'PUT',
        body: { text: config.defaultResponse },
      });
      showNotification('success', 'บันทึกข้อความตอบกลับเริ่มต้นเรียบร้อยแล้ว');
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCommandInput = (field, value) => {
    setCommandForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleButtonChange = (index, field, value) => {
    setCommandForm((prev) => {
      const buttons = [...prev.buttons];
      buttons[index] = { ...buttons[index], [field]: value };
      return { ...prev, buttons };
    });
  };

  const handleAddButton = () => {
    setCommandForm((prev) => ({
      ...prev,
      buttons: [...prev.buttons, { label: '', type: 'command', value: '' }],
    }));
  };

  const handleRemoveButton = (index) => {
    setCommandForm((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index),
    }));
  };

  const resetCommandForm = () => {
    setCommandForm(emptyCommand);
    setEditingCommandId(null);
  };

  const handleSubmitCommand = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...commandForm,
        buttons: commandForm.buttons.map((button) => ({
          ...button,
          value: button.value || undefined,
        })),
      };
      if (editingCommandId) {
        const updated = await apiFetch(`/api/bot/commands/${editingCommandId}`, {
          method: 'PUT',
          body: payload,
        });
        setConfig((prev) => ({
          ...prev,
          commands: prev.commands.map((command) =>
            command.id === editingCommandId ? updated : command
          ),
        }));
        showNotification('success', 'แก้ไขคำสั่งเรียบร้อยแล้ว');
      } else {
        const created = await apiFetch('/api/bot/commands', {
          method: 'POST',
          body: payload,
        });
        setConfig((prev) => ({ ...prev, commands: [...prev.commands, created] }));
        showNotification('success', 'เพิ่มคำสั่งใหม่เรียบร้อยแล้ว');
      }
      resetCommandForm();
      loadData();
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCommand = (command) => {
    setEditingCommandId(command.id);
    setCommandForm({
      command: command.command,
      description: command.description,
      response: command.response,
      buttons: command.buttons?.map((button) => ({
        id: button.id,
        label: button.label,
        type: button.type,
        value: button.value || '',
      })) || [],
    });
  };

  const handleDeleteCommand = async (id) => {
    if (!window.confirm('ยืนยันการลบคำสั่งนี้หรือไม่?')) return;
    setSaving(true);
    try {
      await apiFetch(`/api/bot/commands/${id}`, { method: 'DELETE' });
      setConfig((prev) => ({
        ...prev,
        commands: prev.commands.filter((command) => command.id !== id),
      }));
      showNotification('success', 'ลบคำสั่งเรียบร้อยแล้ว');
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetQuickForm = () => {
    setQuickForm(emptyQuickReply);
    setEditingQuickId(null);
  };

  const handleSubmitQuickReply = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingQuickId) {
        const updated = await apiFetch(`/api/bot/quick-replies/${editingQuickId}`, {
          method: 'PUT',
          body: quickForm,
        });
        setConfig((prev) => ({
          ...prev,
          quickReplies: prev.quickReplies.map((reply) =>
            reply.id === editingQuickId ? updated : reply
          ),
        }));
        showNotification('success', 'แก้ไข Quick Reply เรียบร้อยแล้ว');
      } else {
        const created = await apiFetch('/api/bot/quick-replies', {
          method: 'POST',
          body: quickForm,
        });
        setConfig((prev) => ({
          ...prev,
          quickReplies: [...prev.quickReplies, created],
        }));
        showNotification('success', 'เพิ่ม Quick Reply เรียบร้อยแล้ว');
      }
      resetQuickForm();
      loadData();
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditQuickReply = (reply) => {
    setEditingQuickId(reply.id);
    setQuickForm({
      title: reply.title,
      keyword: reply.keyword,
      response: reply.response,
    });
  };

  const handleDeleteQuickReply = async (id) => {
    if (!window.confirm('ยืนยันการลบ Quick Reply นี้หรือไม่?')) return;
    setSaving(true);
    try {
      await apiFetch(`/api/bot/quick-replies/${id}`, { method: 'DELETE' });
      setConfig((prev) => ({
        ...prev,
        quickReplies: prev.quickReplies.filter((reply) => reply.id !== id),
      }));
      showNotification('success', 'ลบ Quick Reply เรียบร้อยแล้ว');
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSetWebhook = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await apiFetch('/api/bot/webhook', {
        method: 'POST',
        body: { url: webhookUrl || undefined },
      });
      setWebhookUrl(result.webhookUrl);
      loadData();
      showNotification('success', 'ตั้งค่า Webhook สำเร็จ');
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!window.confirm('ยืนยันการยกเลิก Webhook หรือไม่?')) return;
    setSaving(true);
    try {
      await apiFetch('/api/bot/webhook', { method: 'DELETE' });
      setWebhookUrl('');
      loadData();
      showNotification('success', 'ยกเลิก Webhook สำเร็จ');
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMessage = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/bot/test-message', {
        method: 'POST',
        body: {
          chatId: testMessage.chatId,
          message: testMessage.message,
        },
      });
      showNotification('success', 'ส่งข้อความทดสอบเรียบร้อยแล้ว');
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const webhookInfo = useMemo(() => status?.webhook || null, [status]);

  return (
    <div className="app">
      <header>
        <h1>Topito BN9 Bot Dashboard</h1>
        <p>
          จัดการคำสั่ง ตอบกลับอัตโนมัติ และ Webhook ของ Telegram Bot รวมถึงลิงก์ไปยัง Mini App ได้จากหน้าจอนี้ในที่เดียว
        </p>
      </header>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {error && (
        <Notification type="error" message={error} onClose={() => setError(null)} />
      )}

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <>
          <section className="section">
            <h2>สถานะบอท</h2>
            <p className="description">
              ภาพรวมการตั้งค่า Telegram Bot ปัจจุบัน หากมีการเปลี่ยนค่าโปรดกดโหลดข้อมูลใหม่เพื่ออัปเดต
            </p>
            <div className="status-grid">
              <StatusCard
                title="Token"
                value={status?.tokenConfigured ? 'พร้อมใช้งาน' : 'ยังไม่ได้ตั้งค่า'}
                description="กำหนดค่า TELEGRAM_BOT_TOKEN ในไฟล์ .env ของเซิร์ฟเวอร์"
              />
              <StatusCard
                title="จำนวนคำสั่ง"
                value={config.commands.length}
                description="จำนวนคำสั่งที่ระบบรู้จัก"
              />
              <StatusCard
                title="Quick Replies"
                value={config.quickReplies.length}
                description="ข้อความตอบอัตโนมัติจากคีย์เวิร์ด"
              />
              <StatusCard
                title="Webhook"
                value={webhookInfo?.url ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้ตั้งค่า'}
                description={webhookInfo?.url || 'ตั้งค่า URL เพื่อรับข้อความจาก Telegram'}
              />
            </div>
          </section>

          <section className="section">
            <h2>ข้อความตอบกลับเริ่มต้น</h2>
            <p className="description">
              ข้อความที่ระบบจะตอบกลับเมื่อไม่พบคำสั่งหรือคีย์เวิร์ดที่ตรงกัน
            </p>
            <form className="form-grid" onSubmit={handleSaveDefaultResponse}>
              <label>
                ข้อความตอบกลับเริ่มต้น
                <textarea
                  value={config.defaultResponse}
                  onChange={handleDefaultResponseChange}
                  placeholder="เช่น ขอบคุณที่ติดต่อทีมงาน กรุณาพิมพ์ /help เพื่อดูรายการคำสั่ง"
                />
              </label>
              <button type="submit" disabled={saving}>
                บันทึกข้อความ
              </button>
            </form>
          </section>

          <section className="section">
            <h2>จัดการคำสั่ง (Commands)</h2>
            <p className="description">
              เพิ่มคำสั่งใหม่หรือแก้ไขคำสั่งเดิม พร้อมกำหนดปุ่มลัดให้ผู้ใช้เลือกใช้งานได้อย่างรวดเร็ว
            </p>
            <form className="form-grid" onSubmit={handleSubmitCommand}>
              <label>
                คำสั่ง (ขึ้นต้นด้วย / )
                <input
                  value={commandForm.command}
                  onChange={(event) => handleCommandInput('command', event.target.value)}
                  placeholder="/start"
                  required
                />
              </label>
              <label>
                คำอธิบาย
                <input
                  value={commandForm.description}
                  onChange={(event) => handleCommandInput('description', event.target.value)}
                  placeholder="คำอธิบายย่อเพื่อบอกหน้าที่ของคำสั่ง"
                />
              </label>
              <label>
                ข้อความตอบกลับ
                <textarea
                  value={commandForm.response}
                  onChange={(event) => handleCommandInput('response', event.target.value)}
                  placeholder="ข้อความที่บอทจะส่งกลับเมื่อคำสั่งนี้ถูกเรียก"
                  required
                />
              </label>

              <div className="buttons-list">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>ปุ่มลัด (ไม่บังคับ)</strong>
                  <button type="button" className="secondary" onClick={handleAddButton}>
                    + เพิ่มปุ่ม
                  </button>
                </div>
                {commandForm.buttons.map((button, index) => (
                  <div key={index} className="button-card">
                    <label>
                      ป้ายบนปุ่ม
                      <input
                        value={button.label}
                        onChange={(event) => handleButtonChange(index, 'label', event.target.value)}
                        placeholder="เช่น ดูโปรโมชั่น"
                        required
                      />
                    </label>
                    <label>
                      ประเภทปุ่ม
                      <select
                        value={button.type}
                        onChange={(event) => handleButtonChange(index, 'type', event.target.value)}
                      >
                        {buttonTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      ค่าเมื่อกดปุ่ม
                      <input
                        value={button.value || ''}
                        onChange={(event) => handleButtonChange(index, 'value', event.target.value)}
                        placeholder="เช่น /help หรือ https://bn9.club"
                      />
                    </label>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => handleRemoveButton(index)}
                    >
                      ลบปุ่มนี้
                    </button>
                  </div>
                ))}
              </div>

              <div className="card-actions">
                <button type="submit" disabled={saving}>
                  {editingCommandId ? 'บันทึกคำสั่ง' : 'เพิ่มคำสั่ง'}
                </button>
                {editingCommandId && (
                  <button type="button" className="secondary" onClick={resetCommandForm}>
                    ยกเลิกการแก้ไข
                  </button>
                )}
              </div>
            </form>

            <div className="commands-list">
              {config.commands.map((command) => (
                <div key={command.id} className="command-card">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <strong>{command.command}</strong>
                    {command.description && <span style={{ color: '#475569' }}>{command.description}</span>}
                  </div>
                  <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{command.response}</p>
                  {command.buttons?.length > 0 && (
                    <div className="inline-buttons">
                      {command.buttons.map((button) => (
                        <span key={button.id}>
                          {button.label} · {button.type}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="card-actions">
                    <button type="button" className="secondary" onClick={() => handleEditCommand(command)}>
                      แก้ไข
                    </button>
                    <button type="button" className="danger" onClick={() => handleDeleteCommand(command.id)}>
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2>Quick Replies</h2>
            <p className="description">
              ตั้งค่าข้อความตอบอัตโนมัติจากคีย์เวิร์ดที่ผู้ใช้พิมพ์ เพื่อให้การสนทนาไหลลื่นมากยิ่งขึ้น
            </p>
            <form className="form-grid" onSubmit={handleSubmitQuickReply}>
              <label>
                ชื่อหัวข้อ (ไม่บังคับ)
                <input
                  value={quickForm.title}
                  onChange={(event) => setQuickForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="เวลาทำการ"
                />
              </label>
              <label>
                คีย์เวิร์ดที่ใช้ตรวจจับ
                <input
                  value={quickForm.keyword}
                  onChange={(event) => setQuickForm((prev) => ({ ...prev, keyword: event.target.value }))}
                  placeholder="เช่น เวลา, ส่งของ"
                  required
                />
              </label>
              <label>
                ข้อความตอบกลับ
                <textarea
                  value={quickForm.response}
                  onChange={(event) => setQuickForm((prev) => ({ ...prev, response: event.target.value }))}
                  placeholder="ระบุข้อความที่ต้องการให้ระบบตอบกลับ"
                  required
                />
              </label>
              <div className="card-actions">
                <button type="submit" disabled={saving}>
                  {editingQuickId ? 'บันทึก Quick Reply' : 'เพิ่ม Quick Reply'}
                </button>
                {editingQuickId && (
                  <button type="button" className="secondary" onClick={resetQuickForm}>
                    ยกเลิกการแก้ไข
                  </button>
                )}
              </div>
            </form>

            <div className="quick-replies-list">
              {config.quickReplies.map((reply) => (
                <div key={reply.id} className="quick-reply-card">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <strong>{reply.title || reply.keyword}</strong>
                    <span className="badge">คีย์เวิร์ด: {reply.keyword}</span>
                  </div>
                  <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{reply.response}</p>
                  <div className="card-actions">
                    <button type="button" className="secondary" onClick={() => handleEditQuickReply(reply)}>
                      แก้ไข
                    </button>
                    <button type="button" className="danger" onClick={() => handleDeleteQuickReply(reply.id)}>
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2>Webhook & การทดสอบ</h2>
            <p className="description">
              ตั้งค่า URL สำหรับรับ Webhook จาก Telegram และส่งข้อความทดสอบไปยังไอดีที่ต้องการ
            </p>
            <form className="form-grid" onSubmit={handleSetWebhook}>
              <label>
                Webhook URL
                <input
                  value={webhookUrl}
                  onChange={(event) => setWebhookUrl(event.target.value)}
                  placeholder="เช่น https://bn9.club/webhook"
                />
              </label>
              <div className="card-actions">
                <button type="submit" disabled={saving}>
                  ตั้งค่า Webhook
                </button>
                <button type="button" className="secondary" onClick={loadData}>
                  โหลดข้อมูลใหม่
                </button>
                <button type="button" className="danger" onClick={handleDeleteWebhook}>
                  ยกเลิก Webhook
                </button>
              </div>
            </form>

            <form className="form-grid" onSubmit={handleSendTestMessage}>
              <label>
                Chat ID ที่ต้องการส่งทดสอบ
                <input
                  value={testMessage.chatId}
                  onChange={(event) => setTestMessage((prev) => ({ ...prev, chatId: event.target.value }))}
                  placeholder="เช่น 123456789"
                  required
                />
              </label>
              <label>
                ข้อความทดสอบ
                <textarea
                  value={testMessage.message}
                  onChange={(event) => setTestMessage((prev) => ({ ...prev, message: event.target.value }))}
                  placeholder="ข้อความที่จะส่งทดสอบไปยัง Telegram"
                  required
                />
              </label>
              <button type="submit" disabled={saving}>
                ส่งข้อความทดสอบ
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}

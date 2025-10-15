const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'bot-config.json');

const createDefaultData = () => ({
  defaultResponse: 'ขอบคุณที่ติดต่อ Topito BN9! ทีมงานจะรีบตอบกลับให้เร็วที่สุด ✨',
  commands: [
    {
      id: randomUUID(),
      command: '/start',
      description: 'คำแนะนำการใช้งานเบื้องต้น',
      response:
        'สวัสดีค่ะ!\n\nนี่คือ Topito BN9 Assistant พร้อมช่วยตอบคำถามและพาคุณไปยัง Mini App ต่าง ๆ ได้ทันที 🙂',
      buttons: [
        {
          id: randomUUID(),
          label: 'ถามคำถาม',
          type: 'command',
          value: '/help',
        },
        {
          id: randomUUID(),
          label: 'เปิด Mini App',
          type: 'web_app',
        },
      ],
    },
    {
      id: randomUUID(),
      command: '/help',
      description: 'รายการหัวข้อที่สามารถสอบถามได้',
      response:
        'คุณสามารถถามคำถามเกี่ยวกับการสั่งซื้อ การจัดส่ง หรือพูดคุยกับเจ้าหน้าที่ได้เลยค่ะ 🛎️',
      buttons: [
        {
          id: randomUUID(),
          label: 'เช็คคำสั่งซื้อ',
          type: 'command',
          value: '/track',
        },
        {
          id: randomUUID(),
          label: 'ติดต่อทีมงาน',
          type: 'command',
          value: '/support',
        },
      ],
    },
  ],
  quickReplies: [
    {
      id: randomUUID(),
      title: 'เวลาทำการ',
      keyword: 'เวลา',
      response: 'ทีมงานพร้อมให้บริการทุกวัน 09:00 - 18:00 น. ค่ะ',
    },
    {
      id: randomUUID(),
      title: 'สถานะจัดส่ง',
      keyword: 'ส่งของ',
      response: 'อยากตรวจสอบสถานะจัดส่งพิมพ์ /track และกรอกหมายเลขคำสั่งซื้อได้เลยนะคะ',
    },
  ],
});

async function ensureStoreReady() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    const defaults = createDefaultData();
    await fs.writeFile(DATA_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
  }
}

async function readData() {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const normaliseCommand = (command = '') => {
  const trimmed = command.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const sanitiseButtons = (buttons = []) =>
  buttons
    .filter((button) => button && button.label)
    .map((button) => ({
      id: button.id || randomUUID(),
      label: button.label.trim(),
      type: button.type || 'command',
      value: button.value ? button.value.trim() : undefined,
    }));

async function getConfig() {
  await ensureStoreReady();
  return readData();
}

async function addCommand(payload) {
  const data = await getConfig();
  const commandText = normaliseCommand(payload.command || '');
  if (!commandText) {
    const error = new Error('จำเป็นต้องระบุชื่อคำสั่ง (command)');
    error.status = 400;
    throw error;
  }
  if (data.commands.some((item) => item.command.toLowerCase() === commandText.toLowerCase())) {
    const error = new Error('มีคำสั่งนี้อยู่แล้ว');
    error.status = 409;
    throw error;
  }
  const command = {
    id: randomUUID(),
    command: commandText,
    description: payload.description?.trim() || '',
    response: payload.response?.trim() || '',
    buttons: sanitiseButtons(payload.buttons),
  };
  data.commands.push(command);
  await writeData(data);
  return command;
}

async function updateCommand(id, payload) {
  const data = await getConfig();
  const index = data.commands.findIndex((item) => item.id === id);
  if (index === -1) {
    const error = new Error('ไม่พบคำสั่งที่ต้องการแก้ไข');
    error.status = 404;
    throw error;
  }
  const commandText = payload.command ? normaliseCommand(payload.command) : data.commands[index].command;
  if (
    commandText &&
    data.commands.some((item, i) => i !== index && item.command.toLowerCase() === commandText.toLowerCase())
  ) {
    const error = new Error('มีคำสั่งนี้อยู่แล้ว');
    error.status = 409;
    throw error;
  }
  const current = data.commands[index];
  data.commands[index] = {
    ...current,
    command: commandText || current.command,
    description: payload.description !== undefined ? payload.description.trim() : current.description,
    response: payload.response !== undefined ? payload.response.trim() : current.response,
    buttons: payload.buttons ? sanitiseButtons(payload.buttons) : current.buttons,
  };
  await writeData(data);
  return data.commands[index];
}

async function removeCommand(id) {
  const data = await getConfig();
  const index = data.commands.findIndex((item) => item.id === id);
  if (index === -1) {
    const error = new Error('ไม่พบคำสั่งที่ต้องการลบ');
    error.status = 404;
    throw error;
  }
  data.commands.splice(index, 1);
  await writeData(data);
}

async function addQuickReply(payload) {
  const data = await getConfig();
  const keyword = payload.keyword?.trim();
  if (!keyword) {
    const error = new Error('จำเป็นต้องระบุคีย์เวิร์ดสำหรับ Quick Reply');
    error.status = 400;
    throw error;
  }
  const quickReply = {
    id: randomUUID(),
    title: payload.title?.trim() || keyword,
    keyword,
    response: payload.response?.trim() || '',
  };
  data.quickReplies.push(quickReply);
  await writeData(data);
  return quickReply;
}

async function updateQuickReply(id, payload) {
  const data = await getConfig();
  const index = data.quickReplies.findIndex((item) => item.id === id);
  if (index === -1) {
    const error = new Error('ไม่พบ Quick Reply ที่ต้องการแก้ไข');
    error.status = 404;
    throw error;
  }
  const current = data.quickReplies[index];
  const keyword = payload.keyword ? payload.keyword.trim() : current.keyword;
  data.quickReplies[index] = {
    ...current,
    title: payload.title !== undefined ? payload.title.trim() : current.title,
    keyword,
    response: payload.response !== undefined ? payload.response.trim() : current.response,
  };
  await writeData(data);
  return data.quickReplies[index];
}

async function removeQuickReply(id) {
  const data = await getConfig();
  const index = data.quickReplies.findIndex((item) => item.id === id);
  if (index === -1) {
    const error = new Error('ไม่พบ Quick Reply ที่ต้องการลบ');
    error.status = 404;
    throw error;
  }
  data.quickReplies.splice(index, 1);
  await writeData(data);
}

async function setDefaultResponse(text) {
  const data = await getConfig();
  data.defaultResponse = text?.trim() || '';
  await writeData(data);
}

module.exports = {
  ensureStoreReady,
  getConfig,
  addCommand,
  updateCommand,
  removeCommand,
  addQuickReply,
  updateQuickReply,
  removeQuickReply,
  setDefaultResponse,
};

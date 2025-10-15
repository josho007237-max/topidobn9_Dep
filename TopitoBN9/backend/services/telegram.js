const axios = require('axios');
const { URL } = require('url');

const store = require('./commandStore');

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

function getToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    const error = new Error('ยังไม่ได้ตั้งค่า TELEGRAM_BOT_TOKEN');
    error.status = 400;
    throw error;
  }
  return token;
}

function getTelegramApiUrl(method) {
  return `${TELEGRAM_API_BASE}${getToken()}/${method}`;
}

async function sendTelegramRequest(method, payload, options = {}) {
  const url = getTelegramApiUrl(method);
  try {
    const response = await axios({
      method: options.method || 'post',
      url,
      data: payload,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Telegram API error on ${method}`, error.response.data);
    } else {
      console.error(`Telegram API error on ${method}`, error.message);
    }
    throw error;
  }
}

const buildWebAppUrl = () => {
  if (process.env.MINIAPP_URL) {
    return process.env.MINIAPP_URL;
  }
  if (process.env.DOMAIN && process.env.MINIAPP_ID) {
    return `https://${process.env.DOMAIN}/miniapp/${process.env.MINIAPP_ID}`;
  }
  return undefined;
};

function buildReplyMarkup(buttons = []) {
  const filtered = buttons.filter((button) => button && button.label && button.type);
  if (!filtered.length) return undefined;

  const hasInlineButton = filtered.some((button) => button.type !== 'command');
  if (hasInlineButton) {
    const inlineKeyboard = filtered.map((button) => {
      if (button.type === 'url') {
        return [
          {
            text: button.label,
            url: button.value,
          },
        ];
      }
      if (button.type === 'web_app') {
        const url = button.value || buildWebAppUrl();
        if (!url) {
          return [{ text: button.label, callback_data: button.value || button.label }];
        }
        return [
          {
            text: button.label,
            web_app: {
              url,
            },
          },
        ];
      }
      const callbackData = button.value || button.label;
      return [
        {
          text: button.label,
          callback_data: callbackData,
        },
      ];
    });
    return { inline_keyboard: inlineKeyboard };
  }

  const keyboard = filtered.map((button) => [
    {
      text: button.value || button.label,
    },
  ]);
  return {
    keyboard,
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

async function sendMessage({ chatId, text, buttons, parseMode = 'Markdown' }) {
  if (!chatId || !text) {
    const error = new Error('chatId และข้อความเป็นข้อมูลที่จำเป็น');
    error.status = 400;
    throw error;
  }
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
  };
  const replyMarkup = buildReplyMarkup(buttons);
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }
  await sendTelegramRequest('sendMessage', payload);
}

async function answerCallbackQuery(callbackQueryId) {
  if (!callbackQueryId) return;
  try {
    await sendTelegramRequest('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
    });
  } catch (error) {
    console.error('answerCallbackQuery failed', error.message);
  }
}

async function handleTelegramUpdate(update) {
  if (!update) return;

  if (update.callback_query) {
    const callback = update.callback_query;
    const chatId = callback.message?.chat?.id;
    const data = callback.data;
    if (!chatId) {
      await answerCallbackQuery(callback.id);
      return;
    }
    const config = await store.getConfig();
    const commands = config.commands || [];
    const matched = commands.find((command) => {
      if (!command) return false;
      if (command.command && command.command.toLowerCase() === (data || '').toLowerCase()) return true;
      return command.buttons?.some((button) => (button.value || button.label).toLowerCase() === (data || '').toLowerCase());
    });
    if (matched) {
      await sendMessage({ chatId, text: matched.response, buttons: matched.buttons });
    }
    await answerCallbackQuery(callback.id);
    return;
  }

  const message = update.message;
  if (!message || !message.chat) return;

  const chatId = message.chat.id;
  const text = (message.text || '').trim();
  if (!text) return;

  const config = await store.getConfig();
  const commands = config.commands || [];
  const quickReplies = config.quickReplies || [];

  const normalised = text.startsWith('/') ? text.toLowerCase() : text.toLowerCase();
  const commandMatch = commands.find((command) => command.command.toLowerCase() === normalised);

  if (commandMatch) {
    await sendMessage({ chatId, text: commandMatch.response, buttons: commandMatch.buttons });
    return;
  }

  const buttonMatch = commands.find((command) =>
    command.buttons?.some((button) => (button.value || button.label).toLowerCase() === normalised)
  );
  if (buttonMatch) {
    await sendMessage({ chatId, text: buttonMatch.response, buttons: buttonMatch.buttons });
    return;
  }

  const quickReplyMatch = quickReplies.find((reply) => text.toLowerCase().includes(reply.keyword.toLowerCase()));
  if (quickReplyMatch) {
    await sendMessage({ chatId, text: quickReplyMatch.response });
    return;
  }

  if (config.defaultResponse) {
    await sendMessage({ chatId, text: config.defaultResponse });
  }
}

async function setWebhook(urlFromRequest) {
  getToken();
  let webhookUrl = urlFromRequest;
  if (!webhookUrl) {
    const domain = process.env.DOMAIN;
    if (!domain) {
      const error = new Error('กรุณาระบุ URL สำหรับ Webhook หรือกำหนดค่า DOMAIN ในไฟล์ .env');
      error.status = 400;
      throw error;
    }
    webhookUrl = `https://${domain}/webhook`;
  }
  try {
    new URL(webhookUrl);
  } catch (error) {
    const invalid = new Error('Webhook URL ไม่ถูกต้อง');
    invalid.status = 400;
    throw invalid;
  }
  await sendTelegramRequest('setWebhook', {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: false,
  });
  return webhookUrl;
}

async function deleteWebhook() {
  await sendTelegramRequest('deleteWebhook', {}, { method: 'post' });
}

async function getWebhookInfo() {
  try {
    const url = getTelegramApiUrl('getWebhookInfo');
    const { data } = await axios.get(url);
    return data.result || null;
  } catch (error) {
    console.error('getWebhookInfo failed', error.message);
    return null;
  }
}

async function getStatus() {
  const config = await store.getConfig();
  const status = {
    tokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    commandsCount: config.commands.length,
    quickRepliesCount: config.quickReplies.length,
    defaultResponse: config.defaultResponse,
  };
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    status.webhook = null;
    return status;
  }
  const webhookInfo = await getWebhookInfo();
  status.webhook = webhookInfo
    ? {
        url: webhookInfo.url,
        pendingUpdateCount: webhookInfo.pending_update_count,
        lastErrorDate: webhookInfo.last_error_date,
        lastErrorMessage: webhookInfo.last_error_message,
      }
    : null;
  return status;
}

module.exports = {
  handleTelegramUpdate,
  sendMessage,
  setWebhook,
  deleteWebhook,
  getStatus,
};

const express = require('express');
const router = express.Router();

const store = require('../services/commandStore');
const telegram = require('../services/telegram');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get(
  '/bot/config',
  asyncHandler(async (req, res) => {
    const config = await store.getConfig();
    res.json(config);
  })
);

router.put(
  '/bot/default-response',
  asyncHandler(async (req, res) => {
    const { text } = req.body;
    await store.setDefaultResponse(text || '');
    const config = await store.getConfig();
    res.json({ defaultResponse: config.defaultResponse });
  })
);

router.post(
  '/bot/commands',
  asyncHandler(async (req, res) => {
    const command = await store.addCommand(req.body || {});
    res.status(201).json(command);
  })
);

router.put(
  '/bot/commands/:id',
  asyncHandler(async (req, res) => {
    const command = await store.updateCommand(req.params.id, req.body || {});
    res.json(command);
  })
);

router.delete(
  '/bot/commands/:id',
  asyncHandler(async (req, res) => {
    await store.removeCommand(req.params.id);
    res.sendStatus(204);
  })
);

router.post(
  '/bot/quick-replies',
  asyncHandler(async (req, res) => {
    const quickReply = await store.addQuickReply(req.body || {});
    res.status(201).json(quickReply);
  })
);

router.put(
  '/bot/quick-replies/:id',
  asyncHandler(async (req, res) => {
    const quickReply = await store.updateQuickReply(req.params.id, req.body || {});
    res.json(quickReply);
  })
);

router.delete(
  '/bot/quick-replies/:id',
  asyncHandler(async (req, res) => {
    await store.removeQuickReply(req.params.id);
    res.sendStatus(204);
  })
);

router.post(
  '/bot/test-message',
  asyncHandler(async (req, res) => {
    const { chatId, message, buttons } = req.body || {};
    if (!chatId || !message) {
      return res.status(400).json({ error: 'chatId and message are required' });
    }
    await telegram.sendMessage({ chatId, text: message, buttons });
    res.json({ success: true });
  })
);

router.post(
  '/bot/webhook',
  asyncHandler(async (req, res) => {
    const { url } = req.body || {};
    const webhookUrl = await telegram.setWebhook(url);
    res.json({ webhookUrl });
  })
);

router.delete(
  '/bot/webhook',
  asyncHandler(async (req, res) => {
    await telegram.deleteWebhook();
    res.sendStatus(204);
  })
);

router.get(
  '/bot/status',
  asyncHandler(async (req, res) => {
    const status = await telegram.getStatus();
    res.json(status);
  })
);

module.exports = router;

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { handleTelegramUpdate, getStatus } = require('./services/telegram');
const { ensureStoreReady } = require('./services/commandStore');
const botRouter = require('./routes/bot');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', async (req, res, next) => {
  try {
    const status = await getStatus();
    res.json({ status: 'ok', ...status });
  } catch (error) {
    next(error);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    await handleTelegramUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Failed to handle Telegram update', error);
    res.sendStatus(200);
  }
});

app.use('/api', botRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Unexpected server error',
  });
});

const port = process.env.PORT || 3000;

ensureStoreReady()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to start server', error);
    process.exit(1);
  });

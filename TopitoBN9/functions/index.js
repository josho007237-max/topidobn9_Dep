const functions = require('firebase-functions');

const { createApp, bootstrapStore } = require('topito-backend');

let appPromise;

function getApp() {
  if (!appPromise) {
    appPromise = bootstrapStore()
      .then(() => createApp())
      .catch((error) => {
        appPromise = undefined;
        functions.logger.error('Failed to bootstrap application', error);
        throw error;
      });
  }

  return appPromise;
}

const runtimeOptions = {
  timeoutSeconds: 60,
  memory: '512MB',
  // เพิ่มชื่อ secret ที่ตั้งใน Firebase Secret Manager ได้ เช่น secrets: ['OPENAI_API_KEY']
};

exports.app = functions
  .runWith(runtimeOptions)
  .https.onRequest(async (req, res) => {
    try {
      const app = await getApp();
      return app(req, res);
    } catch (error) {
      res.status(500).json({ error: 'Failed to initialize application' });
    }
  });

const { createApp, bootstrapStore } = require('./app');

const port = process.env.PORT || 3000;

bootstrapStore()
  .then(() => {
    const app = createApp();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to start server', error);
    process.exit(1);
  });

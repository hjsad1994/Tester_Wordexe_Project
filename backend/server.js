const app = require('./src/app');
const config = require('./src/config');
const connectDB = require('./src/config/db');

const startServer = async () => {
  await connectDB();
  
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

startServer();

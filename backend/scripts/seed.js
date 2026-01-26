require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const config = require('../src/config');

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Test User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared users collection');

    await User.create(users);
    console.log('Seeded users:', users.map(u => u.email).join(', '));

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();

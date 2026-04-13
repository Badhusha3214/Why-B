require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./src/models/user.model');

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  const existing = await User.findOne({ email: 'admin@Fris-b.com' });
  if (existing) {
    console.log('Admin already exists. Skipping.');
    await mongoose.disconnect();
    return process.exit(0);
  }

  await User.create({
    name:     'Super Admin',
    email:    'admin@Fris-b.com',
    password: 'Admin@1234',
    role:     'admin',
    status:   'active',
  });

  console.log('Admin user created:');
  console.log('  Email   : admin@Fris-b.com');
  console.log('  Password: Admin@1234');
  console.log('  Role    : admin');
  console.log('\nChange the password after first login!');

  await mongoose.disconnect();
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('Admin seed failed:', err.message);
  process.exit(1);
});

require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

const [, , name, email, password] = process.argv;
if (!name || !email || !password) {
  console.error('Usage: node scripts/createOwner.js "Owner Name" owner@example.com "strong-password"');
  process.exit(1);
}

(async () => {
  await connectDB();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    existing.name = name;
    existing.role = 'owner';
    existing.isActive = true;
    existing.password = password;
    await existing.save();
    console.log(`Owner updated: ${existing.email}`);
  } else {
    const user = await User.create({ name, email, password, role: 'owner', isActive: true });
    console.log(`Owner created: ${user.email}`);
  }
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });

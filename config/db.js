const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pibery';
    await mongoose.connect(uri);
    console.log(`✅ MongoDB সংযুক্ত হয়েছে: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB কানেকশন ব্যর্থ:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

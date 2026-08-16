require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectDB = require('./config/db');

// রাউটস
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const productRoutes = require('./routes/productRoutes');
const businessRoutes = require('./routes/businessRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ownerRoutes = require('./routes/ownerRoutes');

const app = express();

// ডাটাবেজ কানেক্ট করুন
connectDB();

// ভিউ ইঞ্জিন
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// মিডলওয়্যার
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'pibery_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);
app.use(express.static(path.join(__dirname, 'public')));

// API রাউটস
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/owner', ownerRoutes);

// ভিউ রাউটস
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { title: 'Pibery — বিল্ডার ড্যাশবোর্ড' });
});

app.get('/owner/dashboard', (req, res) => {
  res.render('owner-dashboard', { title: 'Pibery Platform — Super Admin Dashboard' });
});

app.get('/shop/:subdomain', async (req, res) => {
  res.render('shop-template', { subdomain: req.params.subdomain });
});

// 404 হ্যান্ডলার
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'রিসোর্স খুঁজে পাওয়া যায়নি' });
  }
  res.status(404).send('পেজটি খুঁজে পাওয়া যায়নি (404)');
});

// গ্লোবাল এরর হ্যান্ডলার
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'সার্ভারে একটি সমস্যা হয়েছে',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Pibery সার্ভার চলছে: http://localhost:${PORT}`);
});

module.exports = app;

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const productRoutes = require('./routes/productRoutes');
const businessRoutes = require('./routes/businessRoutes');
const storeRoutes = require('./routes/storeRoutes'); // নতুন স্টোর ফিচার রুট

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/product', productRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/store-features', storeRoutes); // নতুন স্টোর ফিচার রুট যুক্ত করা হলো

app.get('/', (req, res) => {
    res.render('dashboard');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Pibery server is running smoothly on port ${PORT}`);
});

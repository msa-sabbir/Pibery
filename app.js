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

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/product', productRoutes);

app.get('/', (req, res) => {
    res.render('dashboard'); // অথবা সরাসরি রেন্ডার করতে পারেন
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Pibery server is running smoothly on port ${PORT}`);
});

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// রিকোয়েস্টে valid JWT আছে কিনা যাচাই করে ও req.user সেট করে
exports.protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'অনুগ্রহ করে লগইন করুন' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'অবৈধ টোকেন বা নিষ্ক্রিয় অ্যাকাউন্ট' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'অথেন্টিকেশন ব্যর্থ হয়েছে' });
  }
};

// নির্দিষ্ট রোল ছাড়া অ্যাক্সেস আটকায় (যেমন: শুধু owner)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'এই কাজের জন্য আপনার অনুমতি নেই' });
    }
    next();
  };
};
 
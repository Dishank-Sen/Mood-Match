// middleware/auth.js
const jwt = require('jsonwebtoken');
const path = require('path');

const isLoggedIn = (req, res, next) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.sendFile(path.join(__dirname,'../public/html','signup.html'));
  }

  const token = req.cookies[`token_${userId}`];
  if (!token) {
    return res.sendFile(path.join(__dirname,'../public/html','signup.html'));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
              if (err) {
                  if (err.name === 'TokenExpiredError') {
                    return res.sendFile(path.join(__dirname,'../public/html','signup.html'));
                  }
                    return res.sendFile(path.join(__dirname,'../public/html','signup.html'));
              }
              next();
          });
  } catch (err) {
    return res.sendFile(path.join(__dirname,'../public/html','signup.html'));
  }
};

module.exports = isLoggedIn;

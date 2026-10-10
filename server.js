const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.post('/login', (req, res) => {
  const { email = '', password = '' } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      message: 'Email and password are required.'
    });
  }

  console.log('Login request received:', { email, password });

  return res.status(200).json({
    ok: true,
    message: 'Login successful',
    email,
    password
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;
module.exports.app = app;

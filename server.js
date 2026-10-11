const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const port = process.env.PORT || 3000;
const supabaseUrl = process.env.SUPABASE_URL || 'https://ietshavvsbgpefkzrwgc.supabase.co';
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })
  : null;

function createApp(authClient = supabase) {
  const app = express();

  app.use(express.json());
  app.use(express.static(__dirname));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
  });

  app.post('/login', async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email and password are required.' });
    }

    if (!authClient) {
      return res.status(503).json({ ok: false, message: 'Supabase login is not configured on the server.' });
    }

    try {
      const { data, error } = await authClient.auth.signInWithPassword({ email, password });

      if (error) {
        return res.status(401).json({ ok: false, message: error.message });
      }

      return res.json({
        ok: true,
        user: { id: data.user.id, email: data.user.email }
      });
    } catch {
      return res.status(502).json({ ok: false, message: 'Unable to reach Supabase. Please try again.' });
    }
  });

  return app;
}

const app = createApp();

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;
module.exports.app = app;
module.exports.createApp = createApp;

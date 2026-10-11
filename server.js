require('dotenv').config();

const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const port = process.env.PORT || 3000;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })
  : null;

function createApp(db = supabase) {
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
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email and password are required.' });
    }

    if (!db) {
      return res.status(503).json({ ok: false, message: 'Database is not configured on the server.' });
    }

    try {
      // 1. Look up the user by email
      const { data: existing, error: selectError } = await db
        .from('users')
        .select('id, email, password_hash')
        .eq('email', email)
        .maybeSingle();

      if (selectError) {
        return res.status(502).json({ ok: false, message: 'Database error. Please try again.' });
      }

      // 2. If the user exists, verify the password
      if (existing) {
        const match = await bcrypt.compare(password, existing.password_hash);
        if (!match) {
          return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
        }
        return res.json({
          ok: true,
          user: { id: existing.id, email: existing.email }
        });
      }

      // 3. User doesn't exist — create the account
      const passwordHash = await bcrypt.hash(password, 10);

      const { data: created, error: insertError } = await db
        .from('users')
        .insert({ email, password_hash: passwordHash })
        .select('id, email')
        .single();

      if (insertError) {
        // Unique constraint race: someone else inserted the same email
        if (/duplicate|unique/i.test(insertError.message)) {
          return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
        }
        return res.status(502).json({ ok: false, message: 'Could not create account. Please try again.' });
      }

      return res.json({
        ok: true,
        user: { id: created.id, email: created.email }
      });
    } catch {
      return res.status(502).json({ ok: false, message: 'Unable to reach the database. Please try again.' });
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
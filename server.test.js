const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, createApp } = require('./server');

test('POST /login verifies credentials with Supabase Auth', async () => {
  let suppliedCredentials;
  const authClient = {
    auth: {
      signInWithPassword: async (credentials) => {
        suppliedCredentials = credentials;
        return {
          data: { user: { id: 'user-id', email: 'student@example.com' } },
          error: null
        };
      }
    }
  };

  const response = await request(createApp(authClient))
    .post('/login')
    .send({ email: 'student@example.com', password: 'secret123' })
    .set('Content-Type', 'application/json');

  assert.equal(response.status, 200);
  assert.deepEqual(suppliedCredentials, { email: 'student@example.com', password: 'secret123' });
  assert.deepEqual(response.body, {
    ok: true,
    user: { id: 'user-id', email: 'student@example.com' }
  });
  assert.doesNotMatch(response.text, /secret123/);
});

test('POST /login returns Supabase authentication errors without credentials', async () => {
  const authClient = {
    auth: {
      signInWithPassword: async () => ({
        data: { user: null },
        error: { message: 'Invalid login credentials' }
      })
    }
  };

  const response = await request(createApp(authClient))
    .post('/login')
    .send({ email: 'student@example.com', password: 'secret123' });

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Invalid login credentials');
  assert.doesNotMatch(response.text, /secret123/);
});

test('POST /login reports missing Supabase server configuration', async () => {
  const response = await request(createApp(null))
    .post('/login')
    .send({ email: 'student@example.com', password: 'secret123' });

  assert.equal(response.status, 503);
  assert.match(response.body.message, /not configured/i);
});

test('GET /dashboard serves a blank white page', async () => {
  const response = await request(app).get('/dashboard');
  assert.equal(response.status, 200);
  assert.match(response.text, /background:\s*#ffffff/i);
  assert.doesNotMatch(response.text, /<h1|<p|Logout|successfully logged in/i);
});

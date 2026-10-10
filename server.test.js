const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('./server');

test('POST /login accepts credentials and returns a success payload', async () => {
  const response = await request(app)
    .post('/login')
    .send({ email: 'student@example.com', password: 'secret123' })
    .set('Content-Type', 'application/json');

  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.email, 'student@example.com');
  assert.equal(response.body.password, 'secret123');
});

test('GET /dashboard serves the dashboard page', async () => {
  const response = await request(app).get('/dashboard');
  assert.equal(response.status, 200);
  assert.match(response.text, /white/i);
});

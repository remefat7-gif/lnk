const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('./server');

test('POST /login is not handled by the local server', async () => {
  const response = await request(app)
    .post('/login')
    .send({ email: 'student@example.com', password: 'secret123' })
    .set('Content-Type', 'application/json');

  assert.equal(response.status, 404);
  assert.doesNotMatch(response.text, /secret123/);
});

test('GET /dashboard serves a blank white page', async () => {
  const response = await request(app).get('/dashboard');
  assert.equal(response.status, 200);
  assert.match(response.text, /background:\s*#ffffff/i);
  assert.doesNotMatch(response.text, /<h1|<p|Logout|successfully logged in/i);
});

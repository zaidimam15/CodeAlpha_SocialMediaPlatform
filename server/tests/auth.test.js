import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import './setup.js';

describe('Auth API Endpoints', () => {
  it('should successfully register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@connectify.dev',
        displayName: 'Test User',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('testuser');
  });

  it('should reject registration with duplicate email or username', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@connectify.dev',
        displayName: 'Test User',
        password: 'Password123!',
      });

    const duplicateRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'different@connectify.dev',
        displayName: 'Different User',
        password: 'Password123!',
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });

  it('should successfully log in an existing user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'loginuser',
        email: 'login@connectify.dev',
        displayName: 'Login User',
        password: 'Password123!',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'loginuser',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'wrongpassuser',
        email: 'wrongpass@connectify.dev',
        displayName: 'Wrong Pass User',
        password: 'Password123!',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'wrongpassuser',
        password: 'IncorrectPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should protect /api/auth/me from unauthenticated requests', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return current user when valid token provided', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'meuser',
        email: 'me@connectify.dev',
        displayName: 'Me User',
        password: 'Password123!',
      });

    const token = regRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('meuser');
  });
});

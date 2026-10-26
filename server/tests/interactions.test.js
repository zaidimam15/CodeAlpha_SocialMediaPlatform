import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import './setup.js';

describe('Follows, Notifications, Search & Health Endpoints', () => {
  let token1;
  let token2;
  let user1Id;
  let user2Id;

  beforeEach(async () => {
    const res1 = await request(app).post('/api/auth/register').send({
      username: 'user_alpha',
      email: 'alpha@connectify.dev',
      displayName: 'Alpha Tester',
      password: 'Password123!',
    });
    token1 = res1.body.token;
    user1Id = res1.body.user._id;

    const res2 = await request(app).post('/api/auth/register').send({
      username: 'user_beta',
      email: 'beta@connectify.dev',
      displayName: 'Beta Tester',
      password: 'Password123!',
    });
    token2 = res2.body.token;
    user2Id = res2.body.user._id;
  });

  it('should prevent self-following', async () => {
    const res = await request(app)
      .post(`/api/follows/${user1Id}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should toggle follow relationship and create notification', async () => {
    // User1 follows User2
    const followRes = await request(app)
      .post(`/api/follows/${user2Id}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(followRes.status).toBe(200);
    expect(followRes.body.isFollowing).toBe(true);

    // Check notifications for User2
    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token2}`);

    expect(notifRes.status).toBe(200);
    expect(notifRes.body.notifications.length).toBe(1);
    expect(notifRes.body.notifications[0].type).toBe('follow');
    expect(notifRes.body.unreadCount).toBe(1);

    // Mark as read
    const markRes = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token2}`);

    expect(markRes.status).toBe(200);
    expect(markRes.body.unreadCount).toBe(0);

    // Unfollow
    const unfollowRes = await request(app)
      .post(`/api/follows/${user2Id}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(unfollowRes.status).toBe(200);
    expect(unfollowRes.body.isFollowing).toBe(false);
  });

  it('should search for users and posts safely', async () => {
    // Create a post
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Exploring quantum computing #quantum' });

    const searchUsersRes = await request(app).get('/api/search?q=beta&type=users');
    expect(searchUsersRes.status).toBe(200);
    expect(searchUsersRes.body.users.length).toBe(1);
    expect(searchUsersRes.body.users[0].username).toBe('user_beta');

    const searchPostsRes = await request(app).get('/api/search?q=quantum&type=posts');
    expect(searchPostsRes.status).toBe(200);
    expect(searchPostsRes.body.posts.length).toBe(1);
    expect(searchPostsRes.body.posts[0].content).toContain('quantum');
  });

  it('should respond with 200 OK from /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.app).toBe('Connectify API');
  });
});

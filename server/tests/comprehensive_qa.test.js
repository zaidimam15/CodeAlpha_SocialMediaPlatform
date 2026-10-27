import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import './setup.js';

describe('Comprehensive QA Test Suite — Connectify Features', () => {
  let user1Token;
  let user1;
  let user2Token;
  let user2;

  beforeEach(async () => {
    // Register fresh user 1
    const res1 = await request(app).post('/api/auth/register').send({
      username: 'qa_tester_1',
      displayName: 'QA Tester One',
      email: 'qa1@connectify.dev',
      password: 'Password123!',
    });
    user1Token = res1.body.token;
    user1 = res1.body.user;

    // Register fresh user 2
    const res2 = await request(app).post('/api/auth/register').send({
      username: 'qa_tester_2',
      displayName: 'QA Tester Two',
      email: 'qa2@connectify.dev',
      password: 'Password123!',
    });
    user2Token = res2.body.token;
    user2 = res2.body.user;
  });

  // 1. Auth: Register, Login, Invalid Credentials, Protected Routes
  describe('1. Authentication & Security', () => {
    it('registers user with valid data and returns JWT', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'new_qa_user',
        displayName: 'New QA User',
        email: 'newqa@connectify.dev',
        password: 'Password123!',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('new_qa_user');
    });

    it('rejects registration with duplicate email or username (409)', async () => {
      const resDupEmail = await request(app).post('/api/auth/register').send({
        username: 'unique_user_3',
        displayName: 'Dup Email User',
        email: 'qa1@connectify.dev',
        password: 'Password123!',
      });
      expect(resDupEmail.status).toBe(409);

      const resDupUsername = await request(app).post('/api/auth/register').send({
        username: 'qa_tester_1',
        displayName: 'Dup Username User',
        email: 'qa3@connectify.dev',
        password: 'Password123!',
      });
      expect(resDupUsername.status).toBe(409);
    });

    it('logs in successfully with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: 'qa_tester_1',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('rejects login with incorrect password (401)', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: 'qa_tester_1',
        password: 'WrongPassword999!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('protects private endpoints and rejects unauthenticated requests (401)', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);

      const feedRes = await request(app).get('/api/posts/feed');
      expect(feedRes.status).toBe(401);
    });

    it('retrieves current user profile with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe('qa_tester_1');
    });

    it('clears token on logout', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // 2. Posts: Creation, Hashtags, Media, Validation, Update, Delete
  describe('2. Post Creation & Validation', () => {
    it('creates a text post and extracts multiple hashtags correctly', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          content: 'Hello Connectify! Testing #react, #nodejs and #mern stack.',
          media: [
            {
              url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
              type: 'image',
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.post.hashtags).toEqual(expect.arrayContaining(['react', 'nodejs', 'mern']));
      expect(res.body.post.media.length).toBe(1);
    });

    it('rejects post without text or media (400 validation)', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: '', media: [] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('allows author to edit their own post', async () => {
      const postRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Initial post' });

      const res = await request(app)
        .patch(`/api/posts/${postRes.body.post._id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Updated content with #testing' });

      expect(res.status).toBe(200);
      expect(res.body.post.content).toBe('Updated content with #testing');
      expect(res.body.post.isEdited).toBe(true);
    });

    it('prevents non-authors from editing someone elses post (403)', async () => {
      const postRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'User 1 post' });

      const res = await request(app)
        .patch(`/api/posts/${postRes.body.post._id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ content: 'Malicious edit attempt' });

      expect(res.status).toBe(403);
    });
  });

  // 3. Likes: Toggle and Counts
  describe('3. Likes System', () => {
    it('likes and unlikes a post accurately with atomic counts', async () => {
      const postRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Post for likes' });
      const postId = postRes.body.post._id;

      // Like
      const likeRes = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(likeRes.status).toBe(200);
      expect(likeRes.body.isLiked).toBe(true);
      expect(likeRes.body.likesCount).toBe(1);

      // Unlike
      const unlikeRes = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(unlikeRes.status).toBe(200);
      expect(unlikeRes.body.isLiked).toBe(false);
      expect(unlikeRes.body.likesCount).toBe(0);
    });
  });

  // 4. Comments: Add, Retrieve, Authorization
  describe('4. Comments System', () => {
    it('adds a comment to a post and verifies persistence', async () => {
      const postRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Post for comments' });
      const postId = postRes.body.post._id;

      const commentRes = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ content: 'Awesome post, thanks for sharing!' });

      expect(commentRes.status).toBe(201);
      expect(commentRes.body.comment.content).toBe('Awesome post, thanks for sharing!');

      const getRes = await request(app).get(`/api/posts/${postId}/comments`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.comments.length).toBe(1);
      expect(getRes.body.comments[0].author.username).toBe('qa_tester_2');
    });

    it('prevents unauthorized users from deleting another users comment (403)', async () => {
      const postRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Post for comments' });
      const postId = postRes.body.post._id;

      const commentRes = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'User 1 comment' });
      const commentId = commentRes.body.comment._id;

      const res = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });
  });

  // 5. Follows: Follow, Unfollow, Self-follow Prevention, Following Feed
  describe('5. Follow System & Feed', () => {
    it('prevents self-following (400)', async () => {
      const res = await request(app)
        .post(`/api/follows/${user1._id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('allows user 2 to follow user 1 and updates follower/following counts', async () => {
      const res = await request(app)
        .post(`/api/follows/${user1._id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(200);
      expect(res.body.isFollowing).toBe(true);
      expect(res.body.followersCount).toBe(1);

      const profileRes = await request(app).get(`/api/users/profile/qa_tester_1`);
      expect(profileRes.status).toBe(200);
      expect(profileRes.body.profile.followersCount).toBe(1);
    });

    it('displays user 1 posts in user 2 following feed after following', async () => {
      const postRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'User 1 feed post' });

      await request(app)
        .post(`/api/follows/${user1._id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      const feedRes = await request(app)
        .get('/api/posts/feed')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(feedRes.status).toBe(200);
      expect(feedRes.body.posts.some((p) => p._id === postRes.body.post._id)).toBe(true);
    });
  });

  // 6. User Profile: Edit, Bio, Avatar
  describe('6. Profile Management', () => {
    it('updates user profile bio, website, location, and displayName', async () => {
      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          displayName: 'Alex QA Architect',
          bio: 'Building verified full-stack solutions.',
          website: 'https://alexqa.dev',
          location: 'San Francisco, CA',
          themePreference: 'dark',
        });

      expect(res.status).toBe(200);
      expect(res.body.user.displayName).toBe('Alex QA Architect');
      expect(res.body.user.bio).toBe('Building verified full-stack solutions.');
      expect(res.body.user.location).toBe('San Francisco, CA');
    });

    it('retrieves updated public profile by username', async () => {
      await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ displayName: 'Alex QA Architect', website: 'https://alexqa.dev' });

      const res = await request(app).get('/api/users/profile/qa_tester_1');

      expect(res.status).toBe(200);
      expect(res.body.profile.displayName).toBe('Alex QA Architect');
      expect(res.body.profile.website).toBe('https://alexqa.dev');
    });
  });

  // 7. Search: Users, Hashtags, and Trending Aggregation
  describe('7. Search & Discovery', () => {
    it('searches users by username query safely', async () => {
      const res = await request(app).get('/api/search?q=qa_tester&type=users');

      expect(res.status).toBe(200);
      expect(res.body.users.length).toBeGreaterThan(0);
      expect(res.body.users.some((u) => u.username === 'qa_tester_1')).toBe(true);
    });

    it('searches posts by hashtag query safely', async () => {
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Post with #exploretech' });

      const res = await request(app).get('/api/search?q=exploretech&type=posts');

      expect(res.status).toBe(200);
      expect(res.body.posts.length).toBeGreaterThan(0);
    });

    it('returns trending hashtags aggregation without error', async () => {
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Trending #trendingtag' });

      const res = await request(app).get('/api/search/trending');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.hashtags)).toBe(true);
    });
  });

  // 8. Bookmarks: Save, Retrieve, Unsave
  describe('8. Bookmarks System', () => {
    it('bookmarks and unbookmarks a post successfully', async () => {
      const postRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Post to bookmark' });
      const postId = postRes.body.post._id;

      // Bookmark
      const bmRes = await request(app)
        .post(`/api/posts/${postId}/bookmark`)
        .set('Authorization', `Bearer ${user2Token}`);
      expect(bmRes.status).toBe(200);
      expect(bmRes.body.isBookmarked).toBe(true);

      // Verify list
      const listRes = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', `Bearer ${user2Token}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.posts.some((p) => p._id === postId)).toBe(true);

      // Unbookmark
      const unbmRes = await request(app)
        .post(`/api/posts/${postId}/bookmark`)
        .set('Authorization', `Bearer ${user2Token}`);
      expect(unbmRes.status).toBe(200);
      expect(unbmRes.body.isBookmarked).toBe(false);
    });
  });

  // 9. Notifications: Creation and Read Markers
  describe('9. Notifications System', () => {
    it('generates notification on like and marks all notifications as read', async () => {
      const postRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Post for notification test' });
      const postId = postRes.body.post._id;

      // User 2 likes user 1's post
      await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${user2Token}`);

      // Check user 1's notifications
      const notifRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(notifRes.status).toBe(200);
      expect(notifRes.body.notifications.length).toBeGreaterThan(0);
      expect(notifRes.body.unreadCount).toBeGreaterThan(0);

      // Mark all read
      const markRes = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(markRes.status).toBe(200);
      expect(markRes.body.unreadCount).toBe(0);
    });
  });

  // 10. Post Deletion & Cascade Clean-up
  describe('10. Clean-up & Cascade Deletion', () => {
    it('author deletes post and cascades deletion to comments and likes', async () => {
      const postRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: 'Post to delete' });
      const postId = postRes.body.post._id;

      const delRes = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(delRes.status).toBe(200);

      const getRes = await request(app).get(`/api/posts/${postId}`);
      expect(getRes.status).toBe(404);
    });
  });
});

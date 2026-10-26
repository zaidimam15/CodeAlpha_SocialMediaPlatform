import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import './setup.js';

describe('Posts & Interactions API Endpoints', () => {
  let token1;
  let token2;
  let user1Id;
  let user2Id;

  beforeEach(async () => {
    // Register two users
    const res1 = await request(app).post('/api/auth/register').send({
      username: 'author1',
      email: 'author1@connectify.dev',
      displayName: 'Author One',
      password: 'Password123!',
    });
    token1 = res1.body.token;
    user1Id = res1.body.user._id;

    const res2 = await request(app).post('/api/auth/register').send({
      username: 'author2',
      email: 'author2@connectify.dev',
      displayName: 'Author Two',
      password: 'Password123!',
    });
    token2 = res2.body.token;
    user2Id = res2.body.user._id;
  });

  it('should create a new post with hashtags extracted', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        content: 'Hello Connectify! Testing #react and #vite today.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.post.content).toContain('Hello Connectify!');
    expect(res.body.post.hashtags).toContain('react');
    expect(res.body.post.hashtags).toContain('vite');
  });

  it('should reject post without content or media', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        content: '',
        media: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should toggle like on a post correctly', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Like me!' });
    const postId = postRes.body.post._id;

    // Like
    const likeRes = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);

    expect(likeRes.status).toBe(200);
    expect(likeRes.body.isLiked).toBe(true);
    expect(likeRes.body.likesCount).toBe(1);

    // Unlike
    const unlikeRes = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);

    expect(unlikeRes.status).toBe(200);
    expect(unlikeRes.body.isLiked).toBe(false);
    expect(unlikeRes.body.likesCount).toBe(0);
  });

  it('should add a comment and retrieve comments', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Comment on this!' });
    const postId = postRes.body.post._id;

    const commentRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ content: 'Awesome post!' });

    expect(commentRes.status).toBe(201);
    expect(commentRes.body.comment.content).toBe('Awesome post!');

    const getRes = await request(app).get(`/api/posts/${postId}/comments`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.comments.length).toBe(1);
    expect(getRes.body.comments[0].content).toBe('Awesome post!');
  });

  it('should toggle bookmark on a post', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Save me!' });
    const postId = postRes.body.post._id;

    const bmRes = await request(app)
      .post(`/api/posts/${postId}/bookmark`)
      .set('Authorization', `Bearer ${token2}`);

    expect(bmRes.status).toBe(200);
    expect(bmRes.body.isBookmarked).toBe(true);

    const getBmRes = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${token2}`);

    expect(getBmRes.status).toBe(200);
    expect(getBmRes.body.posts.length).toBe(1);
    expect(getBmRes.body.posts[0]._id.toString()).toBe(postId);
  });

  it('should allow author to update post but reject unauthorized user', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Original text' });
    const postId = postRes.body.post._id;

    // Unauthorized attempt
    const failRes = await request(app)
      .patch(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ content: 'Hacked content' });
    expect(failRes.status).toBe(403);

    // Authorized update
    const updateRes = await request(app)
      .patch(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Updated by author #edited' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.post.content).toBe('Updated by author #edited');
    expect(updateRes.body.post.isEdited).toBe(true);
  });

  it('should allow author to delete post and clean up records', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'To be deleted' });
    const postId = postRes.body.post._id;

    const delRes = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(delRes.status).toBe(200);

    const getRes = await request(app).get(`/api/posts/${postId}`);
    expect(getRes.status).toBe(404);
  });
});

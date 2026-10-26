# Connectify REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Log in with username/email and password | No |
| `POST` | `/api/auth/logout` | Clear session cookie | No |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile | **Yes** |
| `POST` | `/api/auth/forgot-password` | Request password reset token | No |
| `POST` | `/api/auth/reset-password` | Reset password using verified token | No |

### Register Request Example
```json
POST /api/auth/register
Content-Type: application/json

{
  "username": "alex_rivers",
  "displayName": "Alex Rivers",
  "email": "alex@connectify.dev",
  "password": "Password123!"
}
```

---

## 2. Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users/profile/:username` | Fetch user profile by handle | Optional |
| `PATCH` | `/api/users/profile` | Update profile info (bio, name, links) | **Yes** |
| `PATCH` | `/api/users/password` | Change user password | **Yes** |
| `GET` | `/api/users/suggested` | Get recommended creators to follow | Optional |
| `GET` | `/api/users/:id/followers` | List users following this account | Optional |
| `GET` | `/api/users/:id/following` | List users followed by this account | Optional |
| `DELETE` | `/api/users/account` | Permanently purge account & data | **Yes** |

---

## 3. Posts & Social Feed (`/api/posts`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/posts/feed?page=1&limit=10` | Authenticated feed (following + self) | **Yes** |
| `GET` | `/api/posts/explore?page=1&limit=12` | Public algorithmic/popular explore feed | Optional |
| `GET` | `/api/posts/user/:username` | Posts created by a specific user | Optional |
| `GET` | `/api/posts/hashtag/:tag` | Posts containing specific hashtag | Optional |
| `GET` | `/api/posts/:id` | Single post conversation view | Optional |
| `POST` | `/api/posts` | Create new text and/or media post | **Yes** |
| `PATCH` | `/api/posts/:id` | Edit author's own post content | **Yes (Author)** |
| `DELETE` | `/api/posts/:id` | Delete author's post and attachments | **Yes (Author)** |

---

## 4. Likes, Comments & Bookmarks

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/posts/:id/like` | Toggle like/unlike on post | **Yes** |
| `GET` | `/api/posts/:id/likes` | List users who liked the post | Optional |
| `GET` | `/api/posts/:id/comments` | List paginated comments on post | Optional |
| `POST` | `/api/posts/:id/comments` | Submit new comment | **Yes** |
| `DELETE` | `/api/comments/:id` | Delete comment | **Yes (Author/Post Owner)** |
| `POST` | `/api/posts/:id/bookmark` | Toggle post bookmark | **Yes** |
| `GET` | `/api/bookmarks` | List user's saved posts | **Yes** |

---

## 5. Follows (`/api/follows`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/follows/:id` | Toggle follow/unfollow target user | **Yes** |

---

## 6. Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/notifications` | List user notifications & unread count | **Yes** |
| `PATCH` | `/api/notifications/:id/read` | Mark specific notification as read | **Yes** |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications as read | **Yes** |

---

## 7. Search & Discovery (`/api/search`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/search?q=:query&type=all\|users\|posts` | Search creators and posts | Optional |
| `GET` | `/api/search/trending` | List trending hashtags & frequency | Optional |

---

## 8. Uploads (`/api/uploads`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/uploads` | Upload media files (multipart/form-data) | **Yes** |

---

## 9. Health Check (`/api/health`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service uptime and status probe |

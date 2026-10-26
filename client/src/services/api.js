const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('connectify_token');

  const headers = {
    ...options.headers,
  };

  // Only set Content-Type to JSON if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong', response.status, data);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    register: (userData) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    login: (credentials) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    getMe: () => request('/auth/me'),
    forgotPassword: (email) =>
      request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (token, newPassword) =>
      request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      }),
  },

  // Users
  users: {
    getProfile: (username) => request(`/users/profile/${username}`),
    updateProfile: (profileData) =>
      request('/users/profile', { method: 'PATCH', body: JSON.stringify(profileData) }),
    changePassword: (passwords) =>
      request('/users/password', { method: 'PATCH', body: JSON.stringify(passwords) }),
    getSuggested: () => request('/users/suggested'),
    getFollowers: (userId, page = 1) => request(`/users/${userId}/followers?page=${page}`),
    getFollowing: (userId, page = 1) => request(`/users/${userId}/following?page=${page}`),
    toggleFollow: (userId) => request(`/follows/${userId}`, { method: 'POST' }),
    deleteAccount: () => request('/users/account', { method: 'DELETE' }),
  },

  // Posts
  posts: {
    getFeed: (page = 1, limit = 10) => request(`/posts/feed?page=${page}&limit=${limit}`),
    getExplore: (page = 1, limit = 12) => request(`/posts/explore?page=${page}&limit=${limit}`),
    getUserPosts: (username, page = 1) => request(`/posts/user/${username}?page=${page}`),
    getHashtag: (tag, page = 1) => request(`/posts/hashtag/${tag}?page=${page}`),
    getById: (id) => request(`/posts/${id}`),
    create: (postData) =>
      request('/posts', { method: 'POST', body: JSON.stringify(postData) }),
    update: (id, content) =>
      request(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify({ content }) }),
    delete: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
    toggleLike: (id) => request(`/posts/${id}/like`, { method: 'POST' }),
    getLikes: (id, page = 1) => request(`/posts/${id}/likes?page=${page}`),
    getComments: (id, page = 1) => request(`/posts/${id}/comments?page=${page}`),
    addComment: (id, content) =>
      request(`/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
    deleteComment: (commentId) => request(`/comments/${commentId}`, { method: 'DELETE' }),
    toggleBookmark: (id) => request(`/posts/${id}/bookmark`, { method: 'POST' }),
  },

  // Bookmarks
  bookmarks: {
    getAll: (page = 1) => request(`/bookmarks?page=${page}`),
  },

  // Notifications
  notifications: {
    getAll: (page = 1) => request(`/notifications?page=${page}`),
    markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  },

  // Search
  search: {
    query: (q, type = 'all') => request(`/search?q=${encodeURIComponent(q)}&type=${type}`),
    trending: () => request('/search/trending'),
  },

  // Uploads
  uploads: {
    uploadMedia: (formData) =>
      request('/uploads', {
        method: 'POST',
        body: formData,
      }),
  },
};

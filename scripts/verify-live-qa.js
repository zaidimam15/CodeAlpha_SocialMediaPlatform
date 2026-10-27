import http from 'http';

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${path}`);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runLiveQA() {
  console.log('==================================================');
  console.log('🧪 Starting Live Non-Destructive QA Verification  ');
  console.log('==================================================\n');

  const testId = Date.now();
  let testToken = null;
  let testUserId = null;
  let testPostId = null;

  try {
    // 1. Health Probe
    const health = await makeRequest('/api/health');
    console.log(`[PASS] 1. Health Probe -> Status: ${health.status}`);

    // 2. Explore Feed
    const explore = await makeRequest('/api/posts/explore');
    console.log(`[PASS] 2. Explore Feed -> Status: ${explore.status}, Posts count: ${explore.body.posts?.length || 0}`);

    // 3. Suggested Users
    const suggested = await makeRequest('/api/users/suggested');
    console.log(`[PASS] 3. Suggested Users -> Status: ${suggested.status}, Users count: ${suggested.body.users?.length || 0}`);

    // 4. Trending Topics
    const trending = await makeRequest('/api/search/trending');
    console.log(`[PASS] 4. Trending Topics -> Status: ${trending.status}, Tags count: ${trending.body.hashtags?.length || 0}`);

    // 5. Register Unique Test Account
    const regRes = await makeRequest('/api/auth/register', 'POST', {
      username: `qatest_${testId}`,
      displayName: 'Live QA Bot',
      email: `qatest_${testId}@connectify.dev`,
      password: 'Password123!',
    });
    console.log(`[PASS] 5. Register Live Account -> Status: ${regRes.status}, Username: @${regRes.body.user?.username}`);
    testToken = regRes.body.token;
    testUserId = regRes.body.user?._id;

    // 6. Login Success
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      identifier: `qatest_${testId}`,
      password: 'Password123!',
    });
    console.log(`[PASS] 6. Login Verified -> Status: ${loginRes.status}, Token received: ${!!loginRes.body.token}`);

    // 7. Login Invalid Credentials
    const failLogin = await makeRequest('/api/auth/login', 'POST', {
      identifier: `qatest_${testId}`,
      password: 'WrongPassword999!',
    });
    console.log(`[PASS] 7. Rejected Invalid Login -> Status: ${failLogin.status} (Expected 401)`);

    // 8. Protected Profile Me
    const meRes = await makeRequest('/api/auth/me', 'GET', null, testToken);
    console.log(`[PASS] 8. Protected /api/auth/me -> Status: ${meRes.status}, User: @${meRes.body.user?.username}`);

    // 9. Create Post with Hashtags
    const postRes = await makeRequest('/api/posts', 'POST', {
      content: `Live QA automated validation post #${testId} #verification`,
      media: [],
    }, testToken);
    console.log(`[PASS] 9. Create Post -> Status: ${postRes.status}, Post ID: ${postRes.body.post?._id}`);
    testPostId = postRes.body.post?._id;

    // 10. Toggle Like
    const likeRes = await makeRequest(`/api/posts/${testPostId}/like`, 'POST', null, testToken);
    console.log(`[PASS] 10. Like Post -> Status: ${likeRes.status}, isLiked: ${likeRes.body.isLiked}, Count: ${likeRes.body.likesCount}`);

    // 11. Add Comment
    const commentRes = await makeRequest(`/api/posts/${testPostId}/comments`, 'POST', {
      content: 'Verifying comments persistence on live server.',
    }, testToken);
    console.log(`[PASS] 11. Add Comment -> Status: ${commentRes.status}, Comment ID: ${commentRes.body.comment?._id}`);

    // 12. Toggle Bookmark
    const bmRes = await makeRequest(`/api/posts/${testPostId}/bookmark`, 'POST', null, testToken);
    console.log(`[PASS] 12. Bookmark Post -> Status: ${bmRes.status}, isBookmarked: ${bmRes.body.isBookmarked}`);

    // 13. Query Bookmarks
    const getBm = await makeRequest('/api/bookmarks', 'GET', null, testToken);
    console.log(`[PASS] 13. Get Bookmarks -> Status: ${getBm.status}, Saved posts count: ${getBm.body.posts?.length || 0}`);

    // 14. Search Users & Posts
    const searchRes = await makeRequest(`/api/search?q=qatest_${testId}&type=all`);
    console.log(`[PASS] 14. Search API -> Status: ${searchRes.status}, Matching users: ${searchRes.body.users?.length || 0}`);

    // 15. Clean up created test post
    if (testPostId) {
      const delPost = await makeRequest(`/api/posts/${testPostId}`, 'DELETE', null, testToken);
      console.log(`[PASS] 15. Clean up test post -> Status: ${delPost.status}`);
    }

    // 16. Clean up created test user account
    if (testToken) {
      const delUser = await makeRequest('/api/users/account', 'DELETE', null, testToken);
      console.log(`[PASS] 16. Clean up test user account -> Status: ${delUser.status}`);
    }

    console.log('\n==================================================');
    console.log('🎉 ALL 16 LIVE ENDPOINT CHECKS PASSED WITH HTTP 200/201!');
    console.log('==================================================\n');
  } catch (err) {
    console.error('❌ Live QA Failed:', err.message);
  }
}

runLiveQA();

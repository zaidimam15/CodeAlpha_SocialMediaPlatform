import http from 'http';

function checkUrl(url, label) {
  return new Promise((resolve) => {
    http
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          console.log(`✅ [${label}] Response ${res.statusCode}:`);
          try {
            console.log(JSON.parse(body));
          } catch {
            console.log(body.slice(0, 150) + '...');
          }
          resolve(true);
        });
      })
      .on('error', (err) => {
        console.error(`❌ [${label}] Failed:`, err.message);
        resolve(false);
      });
  });
}

async function run() {
  console.log('Testing live servers...');
  await checkUrl('http://localhost:5000/api/health', 'Backend Health API');
  await checkUrl('http://localhost:5000/api/search/trending', 'Backend Trending API');
  await checkUrl('http://localhost:5173/', 'Frontend Vite Server');
}

run();

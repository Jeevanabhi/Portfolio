const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { name, email, message, subject } = req.body;
    const access_key = process.env.ACCESS_KEY;

    if (!access_key) {
      return res.status(500).json({ success: false, message: 'ACCESS_KEY environment variable is not configured on Vercel.' });
    }

    const payload = JSON.stringify({
      access_key,
      name,
      email,
      message,
      subject
    });

    const options = {
      hostname: 'api.web3forms.com',
      port: 443,
      path: '/submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Accept': 'application/json'
      }
    };

    const response = await new Promise((resolve, reject) => {
      const postReq = https.request(options, (postRes) => {
        let body = '';
        postRes.on('data', (chunk) => {
          body += chunk;
        });
        postRes.on('end', () => {
          try {
            resolve({
              statusCode: postRes.statusCode,
              body: JSON.parse(body)
            });
          } catch (e) {
            resolve({
              statusCode: postRes.statusCode,
              body: { success: false, message: 'Invalid response from email service' }
            });
          }
        });
      });

      postReq.on('error', (err) => {
        reject(err);
      });

      postReq.write(payload);
      postReq.end();
    });

    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

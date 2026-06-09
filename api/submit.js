export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { name, email, message, subject } = req.body;
    const access_key = process.env.ACCESS_KEY;

    if (!access_key) {
      return res.status(500).json({ success: false, message: 'ACCESS_KEY environment variable is not configured on Vercel.' });
    }

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key,
        name,
        email,
        message,
        subject
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

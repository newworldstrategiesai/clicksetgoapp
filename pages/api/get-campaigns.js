// This is a mock API handler. Replace it with your actual implementation.
export default async function handler(req, res) {
    if (req.method === 'GET') {
      // Replace with your actual logic to fetch campaigns
      const campaigns = [
        { id: '1', name: 'Campaign 1' },
        { id: '2', name: 'Campaign 2' },
        { id: '3', name: 'Campaign 3' },
      ];
      res.status(200).json(campaigns);
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }
  
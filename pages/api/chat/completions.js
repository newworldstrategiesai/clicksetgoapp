import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { messages, model, stream } = req.body;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages: messages,
      stream: stream || false,
    });

    res.status(200).json(chatCompletion);
  } catch (error) {
    console.error('Error processing OpenAI request:', error);
    res.status(500).json({ error: 'Failed to process request', details: error.message });
  }
}
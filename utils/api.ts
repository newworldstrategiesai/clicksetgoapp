import axios from 'axios';

export async function getSMSDataFromTwilio() {
  const TWILIO_ENDPOINT = 'https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json';
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const queryParams = new URLSearchParams({
    DateSentAfter: startDate.toISOString().split('T')[0],
    DateSentBefore: endDate.toISOString().split('T')[0],
  });

  const response = await axios.get(`${TWILIO_ENDPOINT}?${queryParams.toString()}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.data || !Array.isArray(response.data.messages)) {
    throw new Error('Unexpected data format: Expected an array of messages');
  }

  const formattedData = response.data.messages.map((message: any) => ({
    date: message.date_sent,
    status: message.status,
    direction: message.direction,
  }));

  return formattedData;
}

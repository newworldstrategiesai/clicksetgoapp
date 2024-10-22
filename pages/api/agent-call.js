import axios from 'axios';

const agentCall = async (callData) => {
  try {
    const response = await axios.post(
      process.env.VAPI_CALL,
      callData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Call initiated successfully:', response.data);
  } catch (error) {
    console.error('Error initiating call:', error);
    throw new Error('Failed to initiate call');
  }
};

export default agentCall;

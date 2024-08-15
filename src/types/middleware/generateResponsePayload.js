// middleware/generateResponsePayload.js

const generateResponsePayload = (req, res, next) => {
    // Extract relevant data from req or process as needed
    const { firstName } = req.body;
  
    // Construct response payload
    res.locals.responsePayload = {
      assistant: {
        name: 'Benny 65',
        voice: {
          voiceId: 'eY8IecDwkQrpggbzjg5E',
          provider: '11labs',
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.7,
        },
        model: {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a voice assistant for M Ten DJ Company...`,
            }
          ],
          provider: 'openai',
          functions: [
            {
              name: 'SendSMS',
              async: false,
              serverUrl: 'https://clicksetgo.app/send-sms',
              parameters: {
                type: 'object',
                required: ['callerNumber', 'callerName'],
                properties: {
                  callerName: {
                    type: 'string',
                    description: 'The end user\'s first name...',
                  },
                  smsMessage: {
                    type: 'string',
                    description: 'The SMS message content...',
                  },
                  callerNumber: {
                    type: 'string',
                    description: 'The end user\'s phone number...',
                  }
                }
              },
              description: 'Sends requested info to the caller\'s phone number',
              serverUrlSecret: '777333777'
            },
            // Other functions here...
          ],
          maxTokens: 250,
          temperature: 0.7
        },
        recordingEnabled: true,
        firstMessage: firstName ? `Hello ${firstName}, this Ben's AI assistant. How can I help?` : `Hello, this Ben's AI assistant. How can I help?`,
        voicemailMessage: 'You\'ve reached our voicemail. Please leave a message after the beep, and we\'ll get back to you as soon as possible.',
        endCallMessage: 'Thank you for contacting us. Have a great day!',
        transcriber: {
          model: 'general',
          language: 'en',
          provider: 'deepgram'
        },
        clientMessages: [
          'transcript',
          'hang',
          'function-call',
          'speech-update',
          'metadata',
          'conversation-update'
        ],
        serverMessages: [
          'end-of-call-report'
        ],
        serverUrl: 'https://hook.us1.make.com/q7iyohghqrtholk87uzlfxpjsn12c13m',
        endCallPhrases: ['goodbye'],
        analysisPlan: {
          summaryPrompt: 'You are an expert note-taker...',
          structuredDataPrompt: '## Key Performance Indicators (KPIs) for Support Call Success Evaluation...',
          structuredDataSchema: {
            type: 'object',
            properties: {
              RT: {
                description: 'Tracks the total time taken to resolve an issue...',
                type: 'string'
              },
              AHT: {
                description: 'Represents the average duration of a call...',
                type: 'string'
              },
              FCR: {
                description: 'Indicates the percentage of customer issues resolved...',
                type: 'string'
              },
              NPS: {
                description: 'Gauges customer loyalty...',
                type: 'string'
              },
              CSAT: {
                description: 'Directly measures how satisfied customers are...',
                type: 'string'
              }
            }
          },
          successEvaluationPrompt: 'You are an expert call evaluator...',
          successEvaluationRubric: 'PassFail'
        },
        hipaaEnabled: false,
        maxDurationSeconds: 793,
        voicemailDetectionEnabled: false,
        backgroundSound: 'office'
      }
    };
  
    next();
  };
  
  module.exports = generateResponsePayload;
  
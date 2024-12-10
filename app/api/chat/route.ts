// app/api/chat/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { message, context = [] } = await req.json();

    // Prepare messages array with system prompt and context
    const messages = [
      {
        role: "system",
        content: `You are a helpful AI assistant focused on providing clear, concise, and accurate responses. 
        Keep responses brief and to the point. You're knowledgeable about business operations, customer service, 
        and technical topics. Current time: ${new Date().toLocaleString()}`
      },
      ...context, // Include previous conversation context
      {
        role: "user",
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
      stream: false
    });

    // Extract the response
    const response = completion.choices[0].message.content;

    // Return the AI response
    return NextResponse.json({ response });

  } catch (error: any) {
    console.error('OpenAI API error:', error);

    // Handle different types of errors
    if (error.code === 'context_length_exceeded') {
      return NextResponse.json(
        { error: 'The conversation is too long. Please start a new chat.' },
        { status: 400 }
      );
    }

    if (error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}

// Optional: Add types for better type safety
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  context?: ChatMessage[];
}

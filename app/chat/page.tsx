'use client'

import { useState } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: Message;
        finish_reason: string | null;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

const ChatComponent: React.FC = () => {
    const [message, setMessage] = useState<string>('');
    const [response, setResponse] = useState<ChatCompletionResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleChatSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: message }],
                    model: 'gpt-3.5-turbo',
                    stream: false,
                }),
            });

            if (res.ok) {
                const data: ChatCompletionResponse = await res.json();
                setResponse(data);
            } else {
                console.error('Failed to get response from API:', await res.text());
                setResponse(null);
            }
        } catch (error) {
            console.error('Error:', error);
            setResponse(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleChatSubmit}
                    disabled={loading}
                    className={`w-full mt-3 py-2 rounded-md text-white font-semibold ${
                        loading
                            ? 'bg-blue-700 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {loading ? 'Loading...' : 'Send'}
                </button>
                {response && (
                    <pre className="mt-4 p-3 bg-gray-800 rounded-md text-white whitespace-pre-wrap">
                        {JSON.stringify(response, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
};

export default ChatComponent;

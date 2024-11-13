"use client";
import { useState } from 'react';
import dayjs from 'dayjs';
import {
  IconArrowLeft,
  IconDotsVertical,
  IconEdit,
  IconMessages,
  IconPaperclip,
  IconPhotoPlus,
  IconPlus,
  IconSearch,
  IconSend,
  IconVideo,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Layout } from '@/components/custom/layout';
import { Button } from '@/components/custom/button';

// Fake Data
import { conversations } from '@/data/conversations.json';

type ChatUser = (typeof conversations)[number];
type Convo = ChatUser['messages'][number];

export default function Chats() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<ChatUser>(conversations[0]);
  const [mobileSelectedUser, setMobileSelectedUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChatSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    // Logic for submitting the chat message
    console.log("Chat submitted");

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Filtered data based on the search query
  const filteredChatList = conversations.filter(({ fullName }) =>
    fullName.toLowerCase().includes(search.trim().toLowerCase())
  );

  const currentMessage = selectedUser.messages.reduce((acc: Record<string, Convo[]>, obj) => {
    const key = dayjs(obj.timestamp).format('D MMM, YYYY');
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});

  return (
    <Layout>
      <Layout.Header>
        <h1>Chats</h1>
      </Layout.Header>
      <Layout.Body>
        <div className="flex">
          {/* Left Panel */}
          <div>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* Chat List */}
            {filteredChatList.map((chatUsr) => (
              <div key={chatUsr.id} onClick={() => setSelectedUser(chatUsr)}>
                {chatUsr.fullName}
              </div>
            ))}
          </div>

          {/* Chat Panel */}
          <div>
            <div>
              {currentMessage &&
                Object.keys(currentMessage).map((key) => (
                  <div key={key}>
                    {currentMessage[key].map((msg, index) => (
                      <div key={index}>
                        {msg.sender}: {msg.message}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
            <form onSubmit={handleChatSubmit}>
              <input type="text" placeholder="Type your message..." />
              <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </Layout.Body>
    </Layout>
  );
}

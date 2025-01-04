"use client";

import { useState, useCallback, useEffect } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import {
  IconArrowLeft,
  IconDotsVertical,
  IconEdit,
  IconMessages,
  IconPaperclip,
  IconPhone,
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
import { Search } from '@/components/search';
import ThemeSwitch from '@/components/theme-switch';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/custom/button';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';

// Import initial conversations
import { conversations as initialConversations } from '@/data/conversations.json';

// Types
interface Message {
  sender: string;
  message: string;
  timestamp: string;
}

// Base interface for all chat users
interface ChatUserBase {
  id: string;
  profile: string;
  username: string;
  fullName: string;
  title: string;
  messages: Message[];
}

// Regular user interface with isAI set to false
interface RegularUser extends ChatUserBase {
  isAI: false;
}

// AI agent interface with isAI set to true
interface AIAgent extends ChatUserBase {
  isAI: true;
}

type ChatUser = RegularUser | AIAgent;
type Convo = ChatUser['messages'][number];

// Type guard to check if ChatUser is AIAgent
const isAIAgent = (user: ChatUser): user is AIAgent => user.isAI;

export default function Chats() {
  const [search, setSearch] = useState('');
  const [threads, setThreads] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [mobileSelectedUser, setMobileSelectedUser] = useState<ChatUser | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationContext, setConversationContext] = useState<Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>>([]); // Load threads from localStorage if they exist

  // Initialize threads with isAI: false for regular users
  useEffect(() => {
    const storedThreads = localStorage.getItem('threads');
    if (storedThreads) {
      const parsedThreads: ChatUser[] = JSON.parse(storedThreads);
      setThreads(parsedThreads);
      setSelectedUser(parsedThreads[0] || null);
    } else {
      const initialRegularUsers: RegularUser[] = initialConversations.map(user => ({
        ...user,
        isAI: false,
      }));
      setThreads(initialRegularUsers);
      setSelectedUser(initialRegularUsers[0] || null);
    }
  }, []);

  // Save threads to localStorage whenever they are updated
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem('threads', JSON.stringify(threads));
    }
  }, [threads]);

  // Function to create a new regular chat thread
  const createNewThread = useCallback(() => {
    const newThread: RegularUser = {
      id: uuidv4(),
      profile: "/default-avatar.png",
      username: `user_${uuidv4().slice(0, 8)}`, // Generate a unique username
      fullName: "New User",
      title: "New Chat",
      messages: [],
      isAI: false,
    };

    setThreads(prev => {
      const updatedThreads = [newThread, ...prev];
      localStorage.setItem('threads', JSON.stringify(updatedThreads));
      return updatedThreads;
    });
    setSelectedUser(newThread);
    setMobileSelectedUser(newThread);
  }, []);

  // Create new phone thread with phone number input
  const createNewPhoneThread = useCallback(() => {
    if (!isValidPhoneNumber(phoneNumber)) {
      alert('Please enter a valid phone number.');
      return;
    }

    const newThread: RegularUser = {
      id: uuidv4(),
      profile: "/default-avatar.png",
      username: phoneNumber,
      fullName: `Phone: ${phoneNumber}`,
      title: "New Message",
      messages: [],
      isAI: false,
    };

    setThreads(prev => {
      const updatedThreads = [newThread, ...prev];
      localStorage.setItem('threads', JSON.stringify(updatedThreads));
      return updatedThreads;
    });
    setSelectedUser(newThread);
    setMobileSelectedUser(newThread);
  }, [phoneNumber]);

  // Handle sending messages
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;
    setIsLoading(true);
    setError(null);

    const newMessage = {
      sender: 'You',
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    // Update thread with user message
    setThreads(prev => {
      const updatedThreads = prev.map(thread => {
        if (thread.id === selectedUser?.id) {
          return {
            ...thread,
            messages: [newMessage, ...thread.messages]
          };
        }
        return thread;
      });
      localStorage.setItem('threads', JSON.stringify(updatedThreads));
      return updatedThreads;
    });

    setInputMessage('');

    if (selectedUser) {
      if (isAIAgent(selectedUser)) {
        // Handle AI response
        const loadingMessage = {
          sender: 'AI',
          message: '...',
          timestamp: new Date().toISOString()
        };

        setThreads(prev => {
          const updatedThreads = prev.map(thread => {
            if (thread.id === selectedUser.id) {
              return {
                ...thread,
                messages: [loadingMessage, ...thread.messages]
              };
            }
            return thread;
          });
          localStorage.setItem('threads', JSON.stringify(updatedThreads));
          return updatedThreads;
        });

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: inputMessage,
              context: conversationContext
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get AI response');
          }

          const data = await response.json();

          // Update conversation context
          setConversationContext(prev => [
            ...prev,
            { role: 'user', content: inputMessage },
            { role: 'assistant', content: data.response }
          ]);

          // Update thread with AI response
          setThreads(prev => {
            const updatedThreads = prev.map(thread => {
              if (thread.id === selectedUser.id) {
                return {
                  ...thread,
                  messages: [{
                    sender: 'AI',
                    message: data.response,
                    timestamp: new Date().toISOString()
                  }, ...thread.messages.slice(1)]
                };
              }
              return thread;
            });
            localStorage.setItem('threads', JSON.stringify(updatedThreads));
            return updatedThreads;
          });
        } catch (error: any) {
          console.error('Error getting AI response:', error);
          setError(error.message || 'Failed to get AI response');

          setThreads(prev => {
            const updatedThreads = prev.map(thread => {
              if (thread.id === selectedUser.id) {
                return {
                  ...thread,
                  messages: [{
                    sender: 'AI',
                    message: 'Sorry, I encountered an error. Please try again.',
                    timestamp: new Date().toISOString()
                  }, ...thread.messages.slice(1)]
                };
              }
              return thread;
            });
            localStorage.setItem('threads', JSON.stringify(updatedThreads));
            return updatedThreads;
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        // Handle sending message via Twilio for regular users
        try {
          const response = await fetch('/api/sendMessage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: inputMessage,
              to: selectedUser.username // This will be the phone number
            })
          });

          const data = await response.json();
          if (response.ok) {
            console.log('Message sent successfully:', data.message);
          } else {
            throw new Error(data.error || 'Failed to send message');
          }
        } catch (error: any) {
          console.error('Error sending message:', error);
          setError(error.message || 'Failed to send message');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  // Filter threads based on search
  const filteredChatList = threads.filter(({ fullName }) =>
    fullName.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Group messages by date
  const currentMessage = selectedUser?.messages.reduce(
    (acc: Record<string, Convo[]>, obj) => {
      const key = dayjs(obj.timestamp).format('D MMM, YYYY');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    },
    {}
  );

  return (
    <Layout fixed>
      <Layout.Header>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <UserNav />
        </div>
      </Layout.Header>

      <Layout.Body className='sm:overflow-hidden'>
        <section className='flex h-full gap-6'>
          {/* Left Side - Chat List (Hidden on mobile) */}
          <div className={cn('flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80', mobileSelectedUser && 'hidden sm:block')}>
            <div className='sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2'>
                  <h1 className='text-2xl font-bold'>Inbox</h1>
                  <IconMessages size={20} />
                </div>

                <div className='flex gap-2'>
                  <Button 
                    onClick={createNewThread} // Correct function
                    variant='default'
                    className='flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90'
                  >
                    <IconPlus className='h-5 w-5' />
                    <span>New Chat</span>
                  </Button>
                  {/* Add Button for New Phone Message */}
                  <Button 
                    onClick={createNewPhoneThread} // Existing phone thread function
                    variant='default'
                    className='flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90'
                  >
                    <IconPhone className='h-5 w-5' />
                    <span>New Message (Phone)</span>
                  </Button>
                </div>
              </div>

              <label className='flex h-12 w-full items-center space-x-0 rounded-md border border-input pl-2 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring'>
                <IconSearch size={15} className='mr-2 stroke-slate-500' />
                <input
                  type='text'
                  className='w-full flex-1 bg-inherit text-sm focus-visible:outline-none'
                  placeholder='Search chat...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            {/* Chat List */}
            <div className='-mx-3 h-full overflow-auto p-3'>
              {filteredChatList.map((chatUsr) => (
                <Fragment key={chatUsr.id}>
                  <button
                    type='button'
                    className={cn(
                      `-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75`,
                      selectedUser?.id === chatUsr.id && 'sm:bg-muted'
                    )}
                    onClick={() => {
                      setSelectedUser(chatUsr);
                      setMobileSelectedUser(chatUsr);
                    }}
                  >
                    <div className='flex gap-2'>
                      <Avatar>
                        <AvatarImage src={chatUsr.profile} alt={chatUsr.username} />
                        <AvatarFallback>{chatUsr.username}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className='col-start-2 row-span-2 font-medium'>
                          {chatUsr.fullName}
                        </span>
                        <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                          {chatUsr.messages[0]?.message}
                        </span>
                      </div>
                    </div>
                  </button>
                  <Separator className='my-1' />
                </Fragment>
              ))}
            </div>
          </div>

          {/* Right Side - Chat Window (Full screen on mobile) */}
          <div className={cn('flex flex-1 flex-col gap-2 rounded-md px-4 pb-4 pt-0', mobileSelectedUser && 'w-full sm:w-auto')}>
            <div className='flex size-full flex-1'>
              <div className='chat-text-container relative -mr-4 flex flex-1 flex-col overflow-y-hidden'>
                <div className='chat-flex flex h-40 w-full flex-grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pb-4 pr-4'>
                  {currentMessage &&
                    Object.keys(currentMessage).map((key) => (
                      <Fragment key={key}>
                        {currentMessage[key].map((msg, index) => (
                          <div
                            key={`${msg.sender}-${msg.timestamp}-${index}`}
                            className={cn(
                              'chat-box max-w-72 break-words px-3 py-2 shadow-lg',
                              msg.sender === 'You'
                                ? 'self-end rounded-[16px_16px_0_16px] bg-primary/85 text-primary-foreground/75'
                                : 'self-start rounded-[16px_16px_16px_0] bg-secondary'
                            )}
                          >
                            {msg.message}
                            <span
                              className={cn(
                                'mt-1 block text-xs font-light italic text-muted-foreground',
                                msg.sender === 'You' && 'text-right'
                              )}
                            >
                              {dayjs(msg.timestamp).format('h:mm a')}
                            </span>
                          </div>
                        ))}
                        <div className='text-center text-xs'>{key}</div>
                      </Fragment>
                    ))}
                </div>
              </div>
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className='flex w-full flex-none gap-2'>
              <div className='flex flex-1 items-center gap-2 rounded-md border border-input px-2 py-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring lg:gap-4'>
                <div className='space-x-1'>
                  <Button
                    size='icon'
                    type='button'
                    variant='ghost'
                    className='h-8 rounded-md'
                  >
                    <IconPlus size={20} className='stroke-muted-foreground' />
                  </Button>
                  <Button
                    size='icon'
                    type='button'
                    variant='ghost'
                    className='hidden h-8 rounded-md lg:inline-flex'
                  >
                    <IconPhotoPlus size={20} className='stroke-muted-foreground' />
                  </Button>
                  <Button
                    size='icon'
                    type='button'
                    variant='ghost'
                    className='hidden h-8 rounded-md lg:inline-flex'
                  >
                    <IconPaperclip size={20} className='stroke-muted-foreground' />
                  </Button>
                </div>
                <label className='flex-1'>
                  <span className='sr-only'>Chat Text Box</span>

                  <input
                    type='text'
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={isLoading ? 'AI is thinking...' : 'Type your messages...'}
                    disabled={isLoading}
                    className='h-8 w-full bg-inherit focus-visible:outline-none disabled:opacity-50'
                  />
                </label>
                <Button
                  type="submit"
                  variant='ghost'
                  size='icon'
                  className='hidden sm:inline-flex'
                >
                  <IconSend size={20} />
                </Button>
              </div>
              <Button
                type="submit"
                className='h-full sm:hidden'
                rightSection={<IconSend size={18} />}
              >
                Send
              </Button>
            </form>
          </div>
        </section>
      </Layout.Body>
    </Layout>
  );
}

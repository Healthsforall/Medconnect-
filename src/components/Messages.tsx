import React, { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, Phone, Video, Info, Image as ImageIcon, Paperclip, Smile, Send, Check, CheckCheck, Lock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Dr. Sarah Jenkins',
    avatar: 'https://picsum.photos/seed/sarah/150/150',
    lastMessage: 'I am interested! Sending you a DM now.',
    timestamp: '10:42 AM',
    unread: 2,
    online: true,
    messages: [
      { id: 'm1', senderId: '1', text: 'Hi! I saw your post about the ultrasound machines.', timestamp: '10:40 AM', status: 'read' },
      { id: 'm2', senderId: 'me', text: 'Hello Dr. Jenkins! Yes, we just got a new shipment.', timestamp: '10:41 AM', status: 'read' },
      { id: 'm3', senderId: '1', text: 'I am interested! Sending you a DM now.', timestamp: '10:42 AM', status: 'read' },
    ]
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    avatar: 'https://picsum.photos/seed/michael/150/150',
    lastMessage: 'Thanks for the referral.',
    timestamp: 'Yesterday',
    unread: 0,
    online: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'I sent the patient details over to your clinic.', timestamp: 'Yesterday 2:00 PM', status: 'read' },
      { id: 'm2', senderId: '2', text: 'Thanks for the referral.', timestamp: 'Yesterday 2:30 PM', status: 'read' },
    ]
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    avatar: 'https://picsum.photos/seed/emily/150/150',
    lastMessage: 'Are we still on for the conference next week?',
    timestamp: 'Tuesday',
    unread: 0,
    online: true,
    messages: [
      { id: 'm1', senderId: '3', text: 'Are we still on for the conference next week?', timestamp: 'Tuesday 9:00 AM', status: 'read' },
    ]
  }
];

interface MessagesProps {
  initialSelectedUser?: string | null;
}

export default function Messages({ initialSelectedUser }: MessagesProps) {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSelectedUser) {
      // Find if chat exists
      const existingChat = chats.find(c => c.name === initialSelectedUser);
      if (existingChat) {
        setActiveChatId(existingChat.id);
      } else {
        // Create a new chat for this user
        const newChat: Chat = {
          id: Date.now().toString(),
          name: initialSelectedUser,
          avatar: `https://picsum.photos/seed/${initialSelectedUser.replace(/\s+/g, '').toLowerCase()}/150/150`,
          lastMessage: '',
          timestamp: 'Just now',
          unread: 0,
          online: true,
          messages: []
        };
        setChats([newChat, ...chats]);
        setActiveChatId(newChat.id);
      }
    } else if (chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0].id);
    }
  }, [initialSelectedUser]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatId]);

  const activeChat = chats.find(c => c.id === activeChatId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setChats(chats.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          lastMessage: message.text,
          timestamp: message.timestamp,
          messages: [...chat.messages, message]
        };
      }
      return chat;
    }));

    setNewMessage('');
    
    // Simulate reply after 2 seconds
    setTimeout(() => {
      setChats(currentChats => currentChats.map(chat => {
        if (chat.id === activeChatId) {
          const reply: Message = {
            id: Date.now().toString(),
            senderId: chat.id,
            text: 'Thanks for your message. I will get back to you shortly.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read'
          };
          return {
            ...chat,
            lastMessage: reply.text,
            timestamp: reply.timestamp,
            messages: [...chat.messages, reply]
          };
        }
        return chat;
      }));
    }, 2000);
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex h-[calc(100vh-8rem)]">
      {/* Sidebar - Chat List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-white">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${
                activeChatId === chat.id ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-slate-900 truncate pr-2">{chat.name}</h3>
                  <span className="text-xs text-slate-500 flex-shrink-0">{chat.timestamp}</span>
                </div>
                <p className={`text-sm truncate ${chat.unread > 0 ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[10px] font-bold text-white">{chat.unread}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
        <div className="hidden md:flex flex-1 flex-col bg-slate-50/50">
          {/* Chat Header */}
          <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover" />
                {activeChat.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{activeChat.name}</h3>
                <p className="text-xs text-slate-500">{activeChat.online ? 'Active now' : 'Offline'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button className="hover:text-blue-600 transition-colors"><Phone className="h-5 w-5" /></button>
              <button className="hover:text-blue-600 transition-colors"><Video className="h-5 w-5" /></button>
              <button className="hover:text-blue-600 transition-colors"><Info className="h-5 w-5" /></button>
            </div>
          </div>

          {/* E2E Encryption Notice */}
          <div className="flex justify-center py-3 bg-slate-50/80 border-b border-slate-100">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-xs font-medium border border-yellow-200/50">
              <Lock className="h-3 w-3" />
              Messages are end-to-end encrypted. No one outside of this chat can read them.
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeChat.messages.map((message, index) => {
              const isMe = message.senderId === 'me';
              const showAvatar = !isMe && (index === 0 || activeChat.messages[index - 1].senderId !== message.senderId);
              
              return (
                <div key={message.id} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="w-8 flex-shrink-0">
                      {showAvatar && (
                        <img src={activeChat.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      )}
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div 
                      className={`px-4 py-2 rounded-2xl ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-br-sm' 
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[11px] text-slate-400">{message.timestamp}</span>
                      {isMe && (
                        message.status === 'read' ? (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        ) : (
                          <Check className="h-3 w-3 text-slate-400" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="flex gap-1 pb-2">
                <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <ImageIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 bg-slate-100 rounded-2xl border border-transparent focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all flex items-end">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-[15px] outline-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button type="button" className="p-3 text-slate-400 hover:text-slate-600 transition-colors">
                  <Smile className="h-5 w-5" />
                </button>
              </div>

              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm mb-0.5"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50/50 text-slate-400">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
            <MessageSquare className="h-10 w-10 text-blue-200" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Your Messages</h3>
          <p className="text-slate-500">Select a chat or start a new conversation</p>
        </div>
      )}
    </div>
  );
}

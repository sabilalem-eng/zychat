import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  ChatConversation,
  ChatMessage,
  StoryItem,
  ChannelItem,
  CallRecord,
  ActiveCallState,
} from './types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_STORIES,
  INITIAL_CHANNELS,
  INITIAL_CALLS,
} from './data/mockData';
import { soundEffects } from './services/soundEffects';
import { realtimeChatService } from './services/realtimeChatService';

import { ChatListView } from './components/ChatListView';
import { ChatRoomView } from './components/ChatRoomView';
import { StoryView } from './components/StoryView';
import { ChannelView } from './components/ChannelView';
import { CallsView } from './components/CallsView';
import { ProfileView } from './components/ProfileView';
import { CallActiveScreen } from './components/CallActiveScreen';
import { LoginVerificationModal } from './components/LoginVerificationModal';
import { AvatarWithRing } from './components/AvatarWithRing';

import {
  MessageSquare,
  History,
  Megaphone,
  Phone,
  User,
  Camera,
  Search,
} from 'lucide-react';

export default function App() {
  // 5 Tabs dari video: Chat, Story, Saluran, Panggilan, Profil
  const [currentTab, setCurrentTab] = useState<'chat' | 'story' | 'channel' | 'calls' | 'profile'>('chat');
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);

  // App Data States (with local persistence)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('zychat_profile');
      if (saved) {
        return JSON.parse(saved);
      }
      return INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem('zychat_conversations');
      return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('zychat_messages');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [stories, setStories] = useState<StoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('zychat_stories');
      return saved ? JSON.parse(saved) : INITIAL_STORIES;
    } catch {
      return INITIAL_STORIES;
    }
  });

  const [channels, setChannels] = useState<ChannelItem[]>(() => {
    try {
      const saved = localStorage.getItem('zychat_channels');
      return saved ? JSON.parse(saved) : INITIAL_CHANNELS;
    } catch {
      return INITIAL_CHANNELS;
    }
  });

  const [calls, setCalls] = useState<CallRecord[]>(() => {
    try {
      const saved = localStorage.getItem('zychat_calls');
      return saved ? JSON.parse(saved) : INITIAL_CALLS;
    } catch {
      return INITIAL_CALLS;
    }
  });

  // Call engine state
  const [callState, setCallState] = useState<ActiveCallState>({
    isOpen: false,
    contact: {
      name: 'admin miwa chan',
      number: '+6285771761119',
      avatarUrl: INITIAL_CONVERSATIONS[0].avatarUrl,
    },
    type: 'voice',
    status: 'ringing',
    durationSeconds: 0,
    isMuted: false,
    isSpeaker: true,
    isCameraOff: false,
  });

  // Modal Login
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zychat_profile', JSON.stringify(userProfile));
      localStorage.setItem('zychat_conversations', JSON.stringify(conversations));
      localStorage.setItem('zychat_messages', JSON.stringify(messages));
      localStorage.setItem('zychat_stories', JSON.stringify(stories));
      localStorage.setItem('zychat_channels', JSON.stringify(channels));
      localStorage.setItem('zychat_calls', JSON.stringify(calls));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [userProfile, conversations, messages, stories, channels, calls]);

  // Support direct URL query parameter for remote chat link: ?chatWith=+628...&name=...
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const chatWith = params.get('chatWith');
      const contactName = params.get('name') || chatWith;
      if (chatWith) {
        const cleanPhone = chatWith.startsWith('+') ? chatWith : `+${chatWith}`;
        const existing = conversations.find(
          (c) => c.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, '')
        );
        if (existing) {
          setSelectedChat(existing);
        } else {
          const newC: ChatConversation = {
            id: `chat-${Date.now()}`,
            name: contactName || cleanPhone,
            phone: cleanPhone,
            avatarUrl: INITIAL_CONVERSATIONS[1]?.avatarUrl || INITIAL_CONVERSATIONS[0].avatarUrl,
            avatarRing: 'comic',
            isVerified: false,
            isOnline: true,
            unreadCount: 0,
            lastMessage: 'Mulai obrolan baru',
            lastTimestamp: Date.now(),
            isPinned: true,
            isArchived: false,
            folder: 'pribadi',
          };
          setConversations((prev) => [newC, ...prev]);
          setSelectedChat(newC);
        }
      }
    }
  }, []);

  // REALTIME REMOTE MESSAGING LISTENER (KOMUNIKASI JARAK JAUH DENGAN PENGGUNA LAIN)
  useEffect(() => {
    realtimeChatService.setCurrentPhone(userProfile.phone);

    // Listen for incoming remote messages
    const unsubscribeMessage = realtimeChatService.subscribeMessages((remoteMsg) => {
      soundEffects.playReceivedSound();

      let targetChatId = '';
      setConversations((prev) => {
        const found = prev.find(
          (c) => c.phone.replace(/\D/g, '') === remoteMsg.fromPhone.replace(/\D/g, '')
        );
        if (found) {
          targetChatId = found.id;
          return prev.map((c) =>
            c.id === found.id
              ? {
                  ...c,
                  lastMessage: remoteMsg.text || '📷 Media diterima',
                  lastTimestamp: remoteMsg.timestamp,
                  unreadCount:
                    selectedChat?.id === found.id ? c.unreadCount : (c.unreadCount || 0) + 1,
                  isOnline: true,
                }
              : c
          );
        } else {
          targetChatId = `chat-${Date.now()}`;
          const newConv: ChatConversation = {
            id: targetChatId,
            name: remoteMsg.fromName || remoteMsg.fromPhone,
            phone: remoteMsg.fromPhone,
            avatarUrl: remoteMsg.fromAvatar || INITIAL_CONVERSATIONS[0].avatarUrl,
            avatarRing: 'comic',
            isVerified: false,
            isOnline: true,
            unreadCount: 1,
            lastMessage: remoteMsg.text || 'Pesan baru diterima',
            lastTimestamp: remoteMsg.timestamp,
            isPinned: false,
            isArchived: false,
            folder: 'pribadi',
          };
          return [newConv, ...prev];
        }
      });

      // Append message to store
      setMessages((prev) => {
        const cId = targetChatId || `chat-${Date.now()}`;
        const newMsg: ChatMessage = {
          id: remoteMsg.id,
          chatId: cId,
          senderId: remoteMsg.fromPhone,
          senderName: remoteMsg.fromName,
          text: remoteMsg.text,
          type: remoteMsg.type,
          mediaUrl: remoteMsg.mediaUrl,
          duration: remoteMsg.duration,
          timestamp: remoteMsg.timestamp,
          isOutgoing: false,
          status: 'delivered',
        };
        return {
          ...prev,
          [cId]: [...(prev[cId] || []), newMsg],
        };
      });
    });

    // Listen for remote typing
    const unsubscribeTyping = realtimeChatService.subscribeTyping((data) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.phone.replace(/\D/g, '') === data.fromPhone.replace(/\D/g, '')
            ? {
                ...c,
                isTyping: data.isTyping,
                customStatus: data.isTyping ? 'sedang mengetik...' : 'online',
              }
            : c
        )
      );
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [userProfile.phone, selectedChat]);

  // Handle Send Message in a Chat Room
  const handleSendMessage = (newMsgData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTimestamp = Date.now();

    const newMsg: ChatMessage = {
      ...newMsgData,
      id: newMsgId,
      timestamp: newTimestamp,
    };

    setMessages((prev) => ({
      ...prev,
      [newMsg.chatId]: [...(prev[newMsg.chatId] || []), newMsg],
    }));

    // Update conversation last message snippet
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === newMsg.chatId) {
          return {
            ...c,
            lastMessage:
              newMsg.type === 'text'
                ? newMsg.text || ''
                : newMsg.type === 'image' || newMsg.type === 'view_once_image'
                ? '📷 Foto'
                : newMsg.type === 'video' || newMsg.type === 'view_once_video'
                ? '🎥 Video'
                : newMsg.type === 'document'
                ? '📄 Dokumen'
                : '🎵 Pesan Suara',
            lastTimestamp: newTimestamp,
          };
        }
        return c;
      })
    );

    // Kirim pesan jarak jauh ke pengguna lain lewat realtime network
    if (selectedChat) {
      realtimeChatService.sendRemoteMessage({
        id: newMsgId,
        fromPhone: userProfile.phone,
        fromName: userProfile.name,
        fromAvatar: userProfile.avatarUrl,
        toPhone: selectedChat.phone,
        text: newMsg.text,
        type: newMsg.type,
        mediaUrl: newMsg.mediaUrl,
        duration: newMsg.duration,
        timestamp: newTimestamp,
        status: 'sent',
      });
    }
  };

  // Start Call (Voice or Video)
  const handleStartCall = (
    contact: { name: string; number: string; avatarUrl: string },
    type: 'voice' | 'video'
  ) => {
    setCallState({
      isOpen: true,
      contact,
      type,
      status: 'ringing',
      durationSeconds: 0,
      isMuted: false,
      isSpeaker: true,
      isCameraOff: false,
    });
  };

  const handleAcceptCall = () => {
    setCallState((prev) => ({ ...prev, status: 'connected' }));
  };

  const handleEndCall = () => {
    if (callState.isOpen) {
      const newRecord: CallRecord = {
        id: `call-${Date.now()}`,
        contactName: callState.contact.name,
        contactNumber: callState.contact.number,
        contactAvatar: callState.contact.avatarUrl,
        type: callState.type,
        direction: callState.status === 'connected' ? 'incoming' : 'missed',
        durationSeconds: callState.durationSeconds,
        timestamp: Date.now(),
      };
      setCalls((prev) => [newRecord, ...prev]);
    }
    setCallState((prev) => ({ ...prev, isOpen: false, status: 'ended' }));
  };

  // Total unread count for bottom tab badge
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // Background style based on selected theme
  const getThemeBackground = () => {
    switch (userProfile.theme) {
      case 'dark':
        return 'bg-[#120E1E] text-white';
      case 'purple':
        return 'bg-[#F5F3FF] text-[#1E1B4B]';
      case 'cyber':
        return 'bg-[#0F172A] text-white';
      case 'whatsapp_dark':
        return 'bg-[#111B21] text-[#E9EDEF]';
      case 'whatsapp_light':
        return 'bg-[#FFFFFF] text-[#111111]';
      case 'comic':
      default:
        return 'bg-[#FFFDF5] text-[#111111]';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-0 sm:p-4 select-none font-sans">
      {/* Smartphone Container Viewport */}
      <div
        className={`w-full sm:max-w-md h-screen sm:h-[840px] border-0 sm:border-[3.5px] border-[#111111] sm:rounded-[36px] shadow-[8px_8px_0px_#111111] flex flex-col overflow-hidden relative ${getThemeBackground()}`}
      >
        {/* ======================================================== */}
        {/* 1. TOP HEADER APP (PERSIS SEPERTI DI KEDUA VIDEO) */}
        {!selectedChat && (
          <header className="bg-[#008069] text-white border-b-[2.5px] border-[#111111] px-4 py-3 flex items-center justify-between shadow-xs z-20">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">
                zyChat
              </span>
              <span className="px-2 py-0.5 bg-[#25D366] text-white text-[10px] font-black rounded-full border border-emerald-700 shadow-2xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Online
              </span>
            </div>

            {/* Top Right Action Icons */}
            <div className="flex items-center gap-2.5">
              {/* Quick Search */}
              <button
                onClick={() => {
                  soundEffects.playTapSound();
                  setCurrentTab('chat');
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer transition-colors"
                title="Cari Chat"
              >
                <Search className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Quick Camera story */}
              <button
                onClick={() => {
                  soundEffects.playTapSound();
                  setCurrentTab('story');
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer transition-colors"
                title="Buka Kamera / Story"
              >
                <Camera className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* User Avatar */}
              <button
                onClick={() => setCurrentTab('profile')}
                className="cursor-pointer"
                title="Buka Profil"
              >
                <AvatarWithRing
                  src={userProfile.avatarUrl}
                  size="xs"
                  ring={userProfile.avatarRing}
                  showVerified={userProfile.isVerified}
                />
              </button>
            </div>
          </header>
        )}

        {/* ======================================================== */}
        {/* 2. MAIN ACTIVE VIEW ROUTER */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          {selectedChat ? (
            /* A. INDIVIDUAL CHAT ROOM VIEW */
            <ChatRoomView
              conversation={selectedChat}
              messages={messages[selectedChat.id] || []}
              userProfile={userProfile}
              theme={userProfile.theme}
              onBack={() => setSelectedChat(null)}
              onSendMessage={handleSendMessage}
              onStartCall={(type) =>
                handleStartCall(
                  {
                    name: selectedChat.name,
                    number: selectedChat.phone,
                    avatarUrl: selectedChat.avatarUrl,
                  },
                  type
                )
              }
              onUpdateConversation={(updated) => {
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === selectedChat.id ? { ...c, ...updated } : c
                  )
                );
                setSelectedChat((prev) => (prev ? { ...prev, ...updated } : null));
              }}
              onClearChat={() => {
                setMessages((prev) => ({ ...prev, [selectedChat.id]: [] }));
              }}
            />
          ) : (
            /* B. 5 TABS ROUTER DARI VIDEO */
            <>
              {currentTab === 'chat' && (
                <ChatListView
                  conversations={conversations}
                  stories={stories}
                  userProfile={userProfile}
                  theme={userProfile.theme}
                  onSelectChat={(c) => {
                    soundEffects.playTapSound();
                    setSelectedChat(c);
                  }}
                  onNewChat={(newC) => {
                    const created: ChatConversation = {
                      ...newC,
                      id: `chat-${Date.now()}`,
                      unreadCount: 0,
                      lastTimestamp: Date.now(),
                    };
                    setConversations((prev) => [created, ...prev]);
                    setSelectedChat(created);
                  }}
                  onTogglePin={(id) =>
                    setConversations((prev) =>
                      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
                    )
                  }
                  onToggleArchive={(id) =>
                    setConversations((prev) =>
                      prev.map((c) => (c.id === id ? { ...c, isArchived: !c.isArchived } : c))
                    )
                  }
                  onDeleteChat={(id) =>
                    setConversations((prev) => prev.filter((c) => c.id !== id))
                  }
                  onOpenStory={() => setCurrentTab('story')}
                />
              )}

              {currentTab === 'story' && (
                <StoryView
                  stories={stories}
                  userProfile={userProfile}
                  onAddStory={(st) => {
                    const newSt: StoryItem = {
                      ...st,
                      id: `story-${Date.now()}`,
                      timestamp: Date.now(),
                      viewCount: 1,
                    };
                    setStories((prev) => [newSt, ...prev]);
                  }}
                  onDeleteStory={(id) =>
                    setStories((prev) => prev.filter((s) => s.id !== id))
                  }
                />
              )}

              {currentTab === 'channel' && (
                <ChannelView
                  channels={channels}
                  userProfile={userProfile}
                  onFollowToggle={(id) =>
                    setChannels((prev) =>
                      prev.map((ch) =>
                        ch.id === id
                          ? {
                              ...ch,
                              isFollowing: !ch.isFollowing,
                              followersCount: ch.isFollowing
                                ? ch.followersCount - 1
                                : ch.followersCount + 1,
                            }
                          : ch
                      )
                    )
                  }
                  onAddPost={(channelId, text, mediaUrl) => {
                    setChannels((prev) =>
                      prev.map((ch) => {
                        if (ch.id === channelId) {
                          const newPost = {
                            id: `cp-${Date.now()}`,
                            authorName: userProfile.name,
                            authorAvatar: userProfile.avatarUrl,
                            text,
                            mediaUrl,
                            timestamp: Date.now(),
                            likesCount: 1,
                          };
                          return {
                            ...ch,
                            posts: [newPost, ...ch.posts],
                            postsCount: ch.postsCount + 1,
                          };
                        }
                        return ch;
                      })
                    );
                  }}
                />
              )}

              {currentTab === 'calls' && (
                <CallsView
                  calls={calls}
                  userProfile={userProfile}
                  onTriggerCall={(contact, type) => handleStartCall(contact, type)}
                  onClearHistory={() => setCalls([])}
                />
              )}

              {currentTab === 'profile' && (
                <ProfileView
                  userProfile={userProfile}
                  onUpdateProfile={(updated) =>
                    setUserProfile((prev) => ({ ...prev, ...updated }))
                  }
                  onLogout={() => {
                    setUserProfile((prev) => ({ ...prev, isLoggedIn: false }));
                    setIsLoginModalOpen(true);
                  }}
                />
              )}
            </>
          )}
        </main>

        {/* ======================================================== */}
        {/* 3. BOTTOM NAVIGATION BAR (5 TABS DARI VIDEO: Chat, Story, Saluran, Panggilan, Profil) */}
        {!selectedChat && (
          <nav className="bg-white border-t-[2.5px] border-[#111111] px-2 py-1.5 flex items-center justify-around z-20 shadow-md">
            {/* Tab 1: Chat */}
            <button
              onClick={() => {
                soundEffects.playTapSound();
                setCurrentTab('chat');
              }}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer relative ${
                currentTab === 'chat'
                  ? 'text-[#008069] font-black scale-105'
                  : 'text-neutral-500 font-bold hover:text-neutral-800'
              }`}
            >
              <div className="relative">
                <MessageSquare
                  className={`w-5 h-5 ${
                    currentTab === 'chat' ? 'stroke-[2.5]' : ''
                  }`}
                />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#25D366] text-white rounded-full border border-emerald-700 flex items-center justify-center text-[9px] font-black">
                    {totalUnread}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">Chat</span>
            </button>

            {/* Tab 2: Story */}
            <button
              onClick={() => {
                soundEffects.playTapSound();
                setCurrentTab('story');
              }}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                currentTab === 'story'
                  ? 'text-[#008069] font-black scale-105'
                  : 'text-neutral-500 font-bold hover:text-neutral-800'
              }`}
            >
              <History
                className={`w-5 h-5 ${
                  currentTab === 'story' ? 'stroke-[2.5]' : ''
                }`}
              />
              <span className="text-[10px] mt-0.5">Story</span>
            </button>

            {/* Tab 3: Saluran */}
            <button
              onClick={() => {
                soundEffects.playTapSound();
                setCurrentTab('channel');
              }}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                currentTab === 'channel'
                  ? 'text-[#008069] font-black scale-105'
                  : 'text-neutral-500 font-bold hover:text-neutral-800'
              }`}
            >
              <Megaphone
                className={`w-5 h-5 ${
                  currentTab === 'channel' ? 'stroke-[2.5]' : ''
                }`}
              />
              <span className="text-[10px] mt-0.5">Saluran</span>
            </button>

            {/* Tab 4: Panggilan */}
            <button
              onClick={() => {
                soundEffects.playTapSound();
                setCurrentTab('calls');
              }}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                currentTab === 'calls'
                  ? 'text-[#008069] font-black scale-105'
                  : 'text-neutral-500 font-bold hover:text-neutral-800'
              }`}
            >
              <Phone
                className={`w-5 h-5 ${
                  currentTab === 'calls' ? 'stroke-[2.5]' : ''
                }`}
              />
              <span className="text-[10px] mt-0.5">Panggilan</span>
            </button>

            {/* Tab 5: Profil */}
            <button
              onClick={() => {
                soundEffects.playTapSound();
                setCurrentTab('profile');
              }}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                currentTab === 'profile'
                  ? 'text-[#008069] font-black scale-105'
                  : 'text-neutral-500 font-bold hover:text-neutral-800'
              }`}
            >
              <User
                className={`w-5 h-5 ${
                  currentTab === 'profile' ? 'stroke-[2.5]' : ''
                }`}
              />
              <span className="text-[10px] mt-0.5">Profil</span>
            </button>
          </nav>
        )}

        {/* ======================================================== */}
        {/* 4. MODALS & CALL OVERLAYS */}
        {/* Voice & Video Call Active Screen */}
        <CallActiveScreen
          callState={callState}
          onAccept={handleAcceptCall}
          onEndCall={handleEndCall}
          onToggleMute={() =>
            setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }))
          }
          onToggleSpeaker={() =>
            setCallState((prev) => ({ ...prev, isSpeaker: !prev.isSpeaker }))
          }
          onToggleCamera={() =>
            setCallState((prev) => ({ ...prev, isCameraOff: !prev.isCameraOff }))
          }
        />

        {/* Phone Verification Onboarding Modal (Wajib Login Nomor HP + Kode OTP SMS) */}
        <LoginVerificationModal
          isOpen={userProfile.isLoggedIn === false || isLoginModalOpen}
          initialPhone={userProfile.phone.replace('+62', '')}
          initialName={userProfile.name}
          initialAvatar={userProfile.avatarUrl}
          onFinish={(profileData) => {
            setUserProfile((prev) => ({
              ...prev,
              phone: profileData.phone,
              name: profileData.name,
              avatarUrl: profileData.avatarUrl,
              isLoggedIn: true,
            }));
            setIsLoginModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}

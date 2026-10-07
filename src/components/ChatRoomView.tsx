import React, { useState, useRef, useEffect } from 'react';
import {
  ChatConversation,
  ChatMessage,
  ChatTheme,
  MessageType,
  UserProfile,
} from '../types';
import { soundEffects } from '../services/soundEffects';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Plus,
  Send,
  Mic,
  Image,
  Film,
  Eye,
  Play,
  Pause,
  CheckCheck,
  Check,
  X,
  Volume2,
  FileText,
  Smile,
  Paperclip,
  Camera,
  Trash2,
  Edit2,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { AvatarWithRing } from './AvatarWithRing';

interface ChatRoomViewProps {
  conversation: ChatConversation;
  messages: ChatMessage[];
  userProfile: UserProfile;
  theme: ChatTheme;
  onBack: () => void;
  onSendMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onStartCall: (type: 'voice' | 'video') => void;
  onUpdateConversation?: (updated: Partial<ChatConversation>) => void;
  onClearChat?: () => void;
}

export const ChatRoomView: React.FC<ChatRoomViewProps> = ({
  conversation,
  messages,
  userProfile,
  theme,
  onBack,
  onSendMessage,
  onStartCall,
  onUpdateConversation,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [sendAsMe, setSendAsMe] = useState(true); // Toggle: Saya vs Lawan Bicara
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [selectedStatusPreset, setSelectedStatusPreset] = useState<string>(
    conversation.customStatus || (conversation.isOnline ? 'online' : 'terakhir dilihat hari ini pukul 14:20')
  );
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactNameInput, setContactNameInput] = useState(conversation.name);
  const [contactPhoneInput, setContactPhoneInput] = useState(conversation.phone);

  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activeMediaPreview, setActiveMediaPreview] = useState<{
    url: string;
    type: 'image' | 'video';
    caption?: string;
  } | null>(null);

  // View once modal
  const [viewOnceModal, setViewOnceModal] = useState<{
    isOpen: boolean;
    url: string;
    msgId: string;
  }>({ isOpen: false, url: '', msgId: '' });

  // Voice player state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState<number>(1);
  const [audioProgress, setAudioProgress] = useState<number>(0);

  // Reaction Popup
  const [reactionMsgId, setReactionMsgId] = useState<string | null>(null);
  const [isCleanMode, setIsCleanMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isComic = theme === 'comic' || !theme;
  const isDark = theme === 'dark' || theme === 'whatsapp_dark' || theme === 'cyber';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Audio Playback simulation
  useEffect(() => {
    let timer: any;
    if (playingAudioId) {
      setAudioProgress(0);
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setPlayingAudioId(null);
            return 0;
          }
          return prev + 5 * audioPlaybackRate;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [playingAudioId, audioPlaybackRate]);

  // Handle Send Text Message
  const handleSendText = () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    soundEffects.playSentSound();

    onSendMessage({
      chatId: conversation.id,
      senderId: sendAsMe ? 'me' : conversation.id,
      senderName: sendAsMe ? userProfile.name : conversation.name,
      text: textToSend,
      type: 'text',
      isOutgoing: sendAsMe,
      status: 'read',
    });

    setInputText('');

    // Auto-Reply simulation if sent as ME
    if (sendAsMe && autoReplyEnabled) {
      if (onUpdateConversation) {
        onUpdateConversation({ isTyping: true, customStatus: 'mengetik...' });
      }

      setTimeout(() => {
        if (onUpdateConversation) {
          onUpdateConversation({ isTyping: false, customStatus: 'online' });
        }
        soundEffects.playReceivedSound();

        const smartReplies = [
          'vg',
          'Halo bro!',
          'Iya bener bro, besok ketemuan ya!',
          'Wkwkwk mantap lur 👍',
          'Oke siap, nanti dikabari lagi ya.',
          'Bentar ya lagi otw nih.',
          'Haha siap, pesanmu sudah masuk di zyChat!',
        ];
        const randomReply =
          smartReplies[Math.floor(Math.random() * smartReplies.length)];

        onSendMessage({
          chatId: conversation.id,
          senderId: conversation.id,
          senderName: conversation.name,
          text: randomReply,
          type: 'text',
          isOutgoing: false,
          status: 'read',
        });
      }, 1500);
    }
  };

  // Handle Send Attachment
  const handleSendAttachment = (type: MessageType) => {
    soundEffects.playSentSound();
    setShowAttachMenu(false);

    let mediaUrl: string | undefined = undefined;
    let duration: number | undefined = undefined;
    let docName: string | undefined = undefined;
    let docSize: string | undefined = undefined;

    if (type === 'image' || type === 'view_once_image') {
      mediaUrl =
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
    } else if (type === 'video' || type === 'view_once_video') {
      mediaUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
      duration = 15;
    } else if (type === 'audio') {
      duration = Math.floor(Math.random() * 20) + 5;
    } else if (type === 'document') {
      docName = 'Berkas_zyChat_Dokumen.pdf';
      docSize = '1.8 MB';
    }

    onSendMessage({
      chatId: conversation.id,
      senderId: sendAsMe ? 'me' : conversation.id,
      senderName: sendAsMe ? userProfile.name : conversation.name,
      type,
      mediaUrl,
      duration,
      documentName: docName,
      documentSize: docSize,
      isOutgoing: sendAsMe,
      status: 'read',
    });
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    soundEffects.playTapSound();
    setReactionMsgId(null);
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFDF5] select-none relative overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* 1. TOP HEADER (PERSIS SEPERTI DI KEDUA VIDEO) */}
      <header className="bg-[#F6C825] border-b-[2.5px] border-[#111111] px-3 py-2 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-black/10 active:scale-95 cursor-pointer text-[#111111]"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Contact Avatar with Ring */}
          <div
            onClick={() => setIsEditingContact(true)}
            className="cursor-pointer relative shrink-0"
            title="Klik untuk ubah profil kontak"
          >
            <AvatarWithRing
              src={conversation.avatarUrl}
              size="sm"
              ring={conversation.avatarRing}
              showVerified={conversation.isVerified}
            />
          </div>

          {/* Contact Name & Subtitle */}
          <div
            onClick={() => setIsEditingContact(true)}
            className="flex flex-col cursor-pointer min-w-0"
          >
            <div className="flex items-center gap-1">
              <span className="font-black text-xs text-[#111111] truncate max-w-[140px] sm:max-w-[180px]">
                {conversation.name}
              </span>
              {conversation.isVerified && (
                <span className="text-[10px] bg-[#008DA6] text-white px-1 rounded-full font-black">
                  ✓
                </span>
              )}
            </div>

            <span className="text-[10px] text-neutral-800 font-bold truncate">
              {conversation.isTyping ? (
                <span className="text-green-700 font-black animate-pulse">
                  mengetik...
                </span>
              ) : (
                selectedStatusPreset
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons: Video Call, Voice Call, More */}
        <div className="flex items-center gap-1 shrink-0 text-[#111111]">
          <button
            onClick={() => onStartCall('video')}
            className="p-1.5 rounded-full hover:bg-black/10 active:scale-90 cursor-pointer"
            title="Panggilan Video"
          >
            <Video className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            onClick={() => onStartCall('voice')}
            className="p-1.5 rounded-full hover:bg-black/10 active:scale-90 cursor-pointer"
            title="Panggilan Suara"
          >
            <Phone className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded-full hover:bg-black/10 active:scale-90 cursor-pointer"
              title="Menu Lainnya"
            >
              <MoreVertical className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* 3-DOTS DROPDOWN MENU */}
            {showMoreMenu && (
              <div className="absolute right-0 top-10 w-52 rounded-2xl shadow-[4px_4px_0px_#111111] py-2 z-50 border-2 border-[#111111] bg-white text-[#111111] text-xs font-black">
                <button
                  onClick={() => {
                    setIsEditingContact(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#F6C825]/30 flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 text-[#111111]" />
                  <span>Ubah Status & Kontak</span>
                </button>

                <button
                  onClick={() => {
                    setAutoReplyEnabled(!autoReplyEnabled);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#F6C825]/30 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#111111]" />
                    <span>Balas Otomatis</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-black border border-[#111111] ${
                      autoReplyEnabled
                        ? 'bg-[#18C96E] text-[#111111]'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {autoReplyEnabled ? 'AKTIF' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsCleanMode(!isCleanMode);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#F6C825]/30 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#111111]" />
                    <span>Mode Screenshot</span>
                  </div>
                  <span className="text-[10px] text-neutral-800">
                    {isCleanMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                {onClearChat && (
                  <button
                    onClick={() => {
                      onClearChat();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Bersihkan Obrolan</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. CHAT MESSAGES CONTAINER (DENGAN WALLPAPER GOJO / ANIME) */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2 relative"
        style={{
          backgroundImage: conversation.wallpaperUrl
            ? `url(${conversation.wallpaperUrl})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* End-to-End Encryption Notice Badge */}
        <div className="flex justify-center my-2">
          <div className="bg-[#FFFDF5] text-[#111111] border-2 border-[#111111] px-3 py-1.5 rounded-xl text-[10px] font-bold text-center max-w-[85%] shadow-[2px_2px_0px_#111111]">
            🔒 Pesan dan panggilan dienkripsi secara end-to-end zyChat.
          </div>
        </div>

        {/* Message List */}
        {messages.map((msg) => {
          const isOut = msg.isOutgoing;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isOut ? 'items-end' : 'items-start'
              } group relative`}
            >
              {/* Message Bubble (PERSIS SEPERTI DI VIDEO) */}
              <div
                onClick={() => setReactionMsgId(msg.id)}
                className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-3 py-2 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] relative text-xs leading-relaxed cursor-pointer transition-transform hover:scale-[1.01] ${
                  isOut
                    ? 'bg-[#F6C825] text-[#111111] rounded-tr-none font-bold'
                    : 'bg-white text-[#111111] rounded-tl-none font-bold'
                }`}
              >
                {/* 1. TEXT MESSAGE */}
                {msg.type === 'text' && (
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                )}

                {/* 2. VOICE NOTE MESSAGE (PERSIS SEPERTI DI VIDEO 0:25) */}
                {msg.type === 'audio' && (
                  <div className="flex items-center gap-3 py-1 min-w-[190px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playingAudioId === msg.id) {
                          setPlayingAudioId(null);
                        } else {
                          soundEffects.playVoiceNoteBeep();
                          setPlayingAudioId(msg.id);
                        }
                      }}
                      className="w-10 h-10 rounded-full bg-white border-2 border-[#111111] text-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 flex flex-col gap-1">
                      {/* Audio waveform simulated bars */}
                      <div className="flex items-center gap-0.5 h-6">
                        {[40, 60, 20, 80, 50, 100, 70, 30, 90, 60, 40, 75, 45, 95].map(
                          (val, idx) => {
                            const isPlayed =
                              playingAudioId === msg.id &&
                              idx / 14 <= audioProgress / 100;
                            return (
                              <div
                                key={idx}
                                style={{ height: `${val}%` }}
                                className={`w-1 rounded-full transition-colors ${
                                  isPlayed ? 'bg-black' : 'bg-black/30'
                                }`}
                              />
                            );
                          }
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-neutral-800 font-black">
                        <span>0:{String(msg.duration || 14).padStart(2, '0')}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAudioPlaybackRate((prev) =>
                              prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1
                            );
                          }}
                          className="px-1.5 py-0.2 rounded-full bg-white border border-[#111111] shadow-2xs font-black text-[9px]"
                        >
                          {audioPlaybackRate}x
                        </button>
                      </div>
                    </div>

                    <Mic className="w-4 h-4 text-[#111111] shrink-0" />
                  </div>
                )}

                {/* 3. PHOTO MESSAGE */}
                {msg.type === 'image' && msg.mediaUrl && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMediaPreview({
                        url: msg.mediaUrl!,
                        type: 'image',
                        caption: msg.text,
                      });
                    }}
                    className="rounded-xl overflow-hidden mb-1 border-2 border-[#111111] shadow-2xs cursor-pointer"
                  >
                    <img
                      src={msg.mediaUrl}
                      alt="Gambar chat"
                      className="w-full max-h-60 object-cover"
                    />
                    {msg.text && (
                      <p className="p-2 whitespace-pre-wrap bg-white text-[#111111] border-t border-[#111111]">
                        {msg.text}
                      </p>
                    )}
                  </div>
                )}

                {/* 4. VIEW ONCE PHOTO MESSAGE */}
                {msg.type === 'view_once_image' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewOnceModal({
                        isOpen: true,
                        url: msg.mediaUrl || '',
                        msgId: msg.id,
                      });
                    }}
                    className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-white border-2 border-[#111111] shadow-2xs cursor-pointer text-[#111111]"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-[#111111] bg-[#F6C825] text-[#111111] flex items-center justify-center font-black text-xs">
                      1
                    </div>
                    <span className="font-black text-xs">Foto (1x Lihat)</span>
                  </button>
                )}

                {/* 5. DOCUMENT MESSAGE */}
                {msg.type === 'document' && (
                  <div className="flex items-center gap-3 py-1.5 px-2.5 rounded-xl bg-white border-2 border-[#111111] shadow-2xs min-w-[200px] text-[#111111]">
                    <FileText className="w-7 h-7 text-[#8B5CF6] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs truncate">
                        {msg.documentName || 'Dokumen.pdf'}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-bold">
                        {msg.documentSize || '1.8 MB'} • PDF
                      </p>
                    </div>
                  </div>
                )}

                {/* Message Timestamp & Double Ticks */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-neutral-600 font-bold">
                  <span>{formatTimestamp(msg.timestamp)}</span>
                  {isOut && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-[#008DA6] stroke-[2.5]" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-neutral-600" />
                      )}
                    </span>
                  )}
                </div>

                {/* Reactions Badge */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="absolute -bottom-2.5 left-2 bg-white border border-[#111111] rounded-full px-1.5 py-0.5 text-[10px] shadow-2xs flex items-center gap-0.5 font-bold">
                    {msg.reactions.map((r, i) => (
                      <span key={i}>
                        {r.emoji} {r.count > 1 ? r.count : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Reaction Popup overlay */}
              {reactionMsgId === msg.id && (
                <div className="absolute -top-10 z-40 bg-white border-2 border-[#111111] rounded-full px-2 py-1 shadow-[3px_3px_0px_#111111] flex items-center gap-2">
                  {['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(msg.id, emoji)}
                      className="hover:scale-125 transition-transform text-base cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => setReactionMsgId(null)}
                    className="text-neutral-400 hover:text-neutral-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ======================================================== */}
      {/* 3. SENDER SWITCHER BAR (PERSIS SEPERTI DI VIDEO) */}
      {!isCleanMode && (
        <div className="px-3 py-1.5 bg-[#FFFDF5] border-t-2 border-[#111111] flex items-center justify-between text-[11px] font-black text-[#111111]">
          {/* Toggle Sender: Saya vs Lawan Bicara */}
          <div className="flex items-center gap-1.5">
            <span>Kirim Sebagai:</span>
            <button
              onClick={() => {
                soundEffects.playTapSound();
                setSendAsMe(true);
              }}
              className={`px-2 py-0.5 rounded-lg border border-[#111111] transition-all cursor-pointer ${
                sendAsMe
                  ? 'bg-[#F6C825] text-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'bg-white text-neutral-600'
              }`}
            >
              Saya 👤
            </button>
            <button
              onClick={() => {
                soundEffects.playTapSound();
                setSendAsMe(false);
              }}
              className={`px-2 py-0.5 rounded-lg border border-[#111111] transition-all cursor-pointer ${
                !sendAsMe
                  ? 'bg-[#F6C825] text-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'bg-white text-neutral-600'
              }`}
            >
              {conversation.name.slice(0, 10)} 👥
            </button>
          </div>

          <button
            onClick={() => setIsEditingContact(true)}
            className="text-[10px] text-[#111111] bg-white border border-[#111111] px-2 py-0.5 rounded-lg shadow-2xs hover:bg-neutral-100 cursor-pointer"
          >
            Ubah Status
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. BOTTOM INPUT BAR (PERSIS SEPERTI DI VIDEO) */}
      <footer className="p-2 bg-[#FFFDF5] border-t-2 border-[#111111] flex items-center gap-2 z-20">
        {/* Emoji Button */}
        <button
          onClick={() => setInputText((prev) => prev + '🐱')}
          className="p-1.5 rounded-full hover:bg-black/10 cursor-pointer text-[#111111]"
          title="Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Attachment Paperclip Button */}
        <div className="relative">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-1.5 rounded-full hover:bg-black/10 cursor-pointer text-[#111111]"
            title="Lampiran"
          >
            <Paperclip className="w-5 h-5 rotate-45" />
          </button>

          {/* Attachment Menu Popup */}
          {showAttachMenu && (
            <div className="absolute bottom-12 left-0 w-48 rounded-2xl shadow-[4px_4px_0px_#111111] p-3 z-50 border-2 border-[#111111] bg-white grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSendAttachment('document')}
                className="flex flex-col items-center gap-1 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6] border border-[#111111] text-white flex items-center justify-center shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black">Dokumen</span>
              </button>

              <button
                onClick={() => handleSendAttachment('image')}
                className="flex flex-col items-center gap-1 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#008DA6] border border-[#111111] text-white flex items-center justify-center shadow-2xs">
                  <Image className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black">Galeri</span>
              </button>

              <button
                onClick={() => handleSendAttachment('audio')}
                className="flex flex-col items-center gap-1 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#EF4444] border border-[#111111] text-white flex items-center justify-center shadow-2xs">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black">Audio</span>
              </button>

              <button
                onClick={() => handleSendAttachment('view_once_image')}
                className="flex flex-col items-center gap-1 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#F6C825] border border-[#111111] text-[#111111] flex items-center justify-center font-black text-xs shadow-2xs">
                  1
                </div>
                <span className="text-[10px] font-black">1x Lihat</span>
              </button>
            </div>
          )}
        </div>

        {/* Text Input Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendText();
            }}
            placeholder="Ketik pesan..."
            className="w-full bg-white border-2 border-[#111111] rounded-2xl px-4 py-2 text-xs font-bold text-[#111111] shadow-[2px_2px_0px_#111111] outline-hidden placeholder-neutral-400"
          />
        </div>

        {/* Camera Icon */}
        {!inputText.trim() && (
          <button
            onClick={() => handleSendAttachment('image')}
            className="p-1.5 rounded-full hover:bg-black/10 cursor-pointer text-[#111111]"
            title="Kamera"
          >
            <Camera className="w-5 h-5" />
          </button>
        )}

        {/* Send Button or Mic Button (PERSIS SEPERTI DI VIDEO) */}
        {inputText.trim() ? (
          <button
            onClick={handleSendText}
            className="w-10 h-10 rounded-full bg-[#F6C825] hover:bg-[#E5B81C] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center font-black active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
            title="Kirim Pesan"
          >
            <Send className="w-4.5 h-4.5 fill-[#111111] ml-0.5" />
          </button>
        ) : (
          <button
            onClick={() => handleSendAttachment('audio')}
            className="w-10 h-10 rounded-full bg-[#F6C825] hover:bg-[#E5B81C] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center font-black active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
            title="Rekam Voice Note"
          >
            <Mic className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </footer>

      {/* ======================================================== */}
      {/* 5. MODAL: EDIT KONTAK & STATUS ONLINE */}
      {isEditingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2">
              <h3 className="font-black text-sm uppercase flex items-center gap-2 text-[#111111]">
                <Edit2 className="w-4 h-4" />
                <span>Pengaturan Kontak zyChat</span>
              </h3>
              <button
                onClick={() => setIsEditingContact(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-neutral-500 block mb-1">
                  Nama Kontak
                </label>
                <input
                  type="text"
                  value={contactNameInput}
                  onChange={(e) => setContactNameInput(e.target.value)}
                  className="w-full border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-bold outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-neutral-500 block mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={contactPhoneInput}
                  onChange={(e) => setContactPhoneInput(e.target.value)}
                  className="w-full border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-bold outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-neutral-500 block mb-1">
                  Pilih Status Header
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'online',
                    'mengetik...',
                    'merekam audio...',
                    'terakhir dilihat hari ini pukul 14:15',
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSelectedStatusPreset(preset)}
                      className={`p-2 rounded-xl text-xs font-black text-left border-2 border-[#111111] cursor-pointer ${
                        selectedStatusPreset === preset
                          ? 'bg-[#F6C825] text-[#111111] shadow-[2px_2px_0px_#111111]'
                          : 'bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditingContact(false)}
                className="flex-1 py-2 bg-neutral-100 border-2 border-[#111111] rounded-xl font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onUpdateConversation) {
                    onUpdateConversation({
                      name: contactNameInput.trim() || conversation.name,
                      phone: contactPhoneInput.trim() || conversation.phone,
                      customStatus: selectedStatusPreset,
                      isOnline: selectedStatusPreset === 'online',
                      isTyping: selectedStatusPreset === 'mengetik...',
                    });
                  }
                  setIsEditingContact(false);
                }}
                className="flex-1 py-2 bg-[#F6C825] hover:bg-[#E5B81C] text-[#111111] border-2 border-[#111111] rounded-xl font-black text-xs shadow-[2px_2px_0px_#111111] cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: VIEW ONCE PHOTO FULLSCREEN */}
      {viewOnceModal.isOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-between p-4">
          <div className="w-full flex items-center justify-between text-white">
            <span className="font-bold text-sm">Foto Sekali Lihat</span>
            <button
              onClick={() => setViewOnceModal({ isOpen: false, url: '', msgId: '' })}
              className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-md max-h-[70vh] rounded-2xl overflow-hidden border-2 border-white/20">
            <img
              src={viewOnceModal.url}
              alt="Foto sekali lihat"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-center text-xs text-neutral-400 pb-4">
            Foto ini akan hilang setelah jendela ditutup.
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  ChatConversation,
  StoryItem,
  UserProfile,
  ChatTheme,
  AvatarRing,
} from '../types';
import { DEFAULT_AVATARS } from '../data/mockData';
import { soundEffects } from '../services/soundEffects';
import {
  Search,
  Plus,
  Pin,
  Archive,
  Trash2,
  FolderPlus,
  Folder,
  Check,
  CheckCheck,
  X,
  MessageSquare,
} from 'lucide-react';
import { AvatarWithRing } from './AvatarWithRing';

interface ChatListViewProps {
  conversations: ChatConversation[];
  stories: StoryItem[];
  userProfile: UserProfile;
  theme: ChatTheme;
  onSelectChat: (chat: ChatConversation) => void;
  onNewChat: (newChat: Omit<ChatConversation, 'id' | 'lastTimestamp' | 'unreadCount'>) => void;
  onTogglePin: (chatId: string) => void;
  onToggleArchive: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onOpenStory: (storyIndex: number) => void;
}

export const ChatListView: React.FC<ChatListViewProps> = ({
  conversations,
  stories,
  userProfile,
  theme,
  onSelectChat,
  onNewChat,
  onTogglePin,
  onToggleArchive,
  onDeleteChat,
  onOpenStory,
}) => {
  const [activeFolder, setActiveFolder] = useState<'semua' | 'pribadi' | 'grup' | 'channel'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedChatAction, setSelectedChatAction] = useState<ChatConversation | null>(null);

  // New Chat Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+628');
  const [lastMsg, setLastMsg] = useState('Halo!');
  const [isVerified, setIsVerified] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [folder, setFolder] = useState<'pribadi' | 'grup' | 'channel'>('pribadi');
  const [selectedAvatarKey, setSelectedAvatarKey] = useState<keyof typeof DEFAULT_AVATARS>('gojo');
  const [avatarRing, setAvatarRing] = useState<AvatarRing>('comic');

  const filteredConversations = conversations.filter((c) => {
    if (c.isArchived) return false;
    if (activeFolder !== 'semua' && c.folder !== activeFolder) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateChat = () => {
    if (!name.trim()) return;
    soundEffects.playSentSound();
    onNewChat({
      name: name.trim(),
      phone: phone.trim() || '+628123456789',
      avatarUrl: DEFAULT_AVATARS[selectedAvatarKey],
      avatarRing,
      isVerified,
      isOnline,
      customStatus: isOnline ? 'online' : 'terakhir dilihat hari ini pukul 14:00',
      lastMessage: lastMsg.trim() || 'Pesan baru',
      isPinned: false,
      isArchived: false,
      folder,
    });
    setName('');
    setShowNewChatModal(false);
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    setCustomFolders((prev) => [...prev, newFolderName.trim()]);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFDF5] select-none relative overflow-hidden">
      {/* 1. TOP SEARCH BAR (PERSIS SEPERTI DI VIDEO 0:13) */}
      <div className="p-3 bg-[#FFFDF5] border-b-2 border-[#111111] space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari chat, kontak, atau nomor..."
            className="w-full bg-white border-2 border-[#111111] rounded-2xl pl-9 pr-3 py-2 text-xs font-bold text-[#111111] shadow-[2px_2px_0px_#111111] outline-hidden placeholder-neutral-400"
          />
        </div>

        {/* 2. HORIZONTAL STORY CIRCLES BAR (PERSIS SEPERTI DI VIDEO 0:14) */}
        <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
          {/* Story Saya */}
          <div
            onClick={() => onOpenStory(0)}
            className="flex flex-col items-center shrink-0 cursor-pointer space-y-1"
          >
            <div className="relative">
              <AvatarWithRing
                src={userProfile.avatarUrl}
                size="sm"
                ring="comic"
                showVerified={userProfile.isVerified}
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#F6C825] text-[#111111] rounded-full border border-[#111111] flex items-center justify-center font-black text-[10px]">
                +
              </span>
            </div>
            <span className="text-[10px] font-bold text-neutral-700 max-w-[56px] truncate">
              Story saya
            </span>
          </div>

          {/* Stories from contacts */}
          {stories.map((st, i) => (
            <div
              key={st.id}
              onClick={() => onOpenStory(i)}
              className="flex flex-col items-center shrink-0 cursor-pointer space-y-1"
            >
              <AvatarWithRing
                src={st.authorAvatar}
                size="sm"
                ring={i % 2 === 0 ? 'pow' : 'halftone'}
                showVerified
              />
              <span className="text-[10px] font-bold text-neutral-700 max-w-[56px] truncate">
                {st.authorName}
              </span>
            </div>
          ))}
        </div>

        {/* 3. FOLDER FILTER PILLS (Semua, Pribadi, Grup, Channel, + Tambah Folder seperti di Video 3:18) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {[
            { key: 'semua', label: 'Semua' },
            { key: 'pribadi', label: 'Pribadi' },
            { key: 'grup', label: 'Grup' },
            { key: 'channel', label: 'Channel' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFolder(tab.key as any)}
              className={`px-3 py-1 rounded-xl text-xs font-black border-2 border-[#111111] transition-all cursor-pointer whitespace-nowrap ${
                activeFolder === tab.key
                  ? 'bg-[#F6C825] text-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {customFolders.map((fName) => (
            <button
              key={fName}
              onClick={() => setActiveFolder('pribadi')}
              className="px-3 py-1 rounded-xl text-xs font-black border-2 border-[#111111] bg-white text-neutral-700 shadow-[1px_1px_0px_#111111] whitespace-nowrap"
            >
              {fName}
            </button>
          ))}

          <button
            onClick={() => setShowNewFolderModal(true)}
            className="px-2.5 py-1 rounded-xl text-xs font-black border-2 border-dashed border-[#111111] text-neutral-600 hover:bg-neutral-100 flex items-center gap-1 cursor-pointer whitespace-nowrap"
            title="Tambah Folder Baru"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Folder</span>
          </button>
        </div>
      </div>

      {/* 4. CONVERSATIONS LIST (PERSIS SEPERTI DI VIDEO) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-neutral-500 font-bold text-xs">
            <p>Belum ada chat di folder ini.</p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-4 py-2 bg-[#00A884] text-white border-2 border-[#111111] rounded-xl font-black shadow-[2px_2px_0px_#111111] cursor-pointer"
            >
              + Mulai Chat Baru
            </button>
          </div>
        ) : (
          filteredConversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSelectedChatAction(chat);
              }}
              className="bg-white border-2 border-[#111111] rounded-2xl p-3 shadow-[3px_3px_0px_#111111] flex items-center justify-between cursor-pointer hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <AvatarWithRing
                  src={chat.avatarUrl}
                  size="md"
                  ring={chat.avatarRing}
                  showVerified={chat.isVerified}
                  isOnline={chat.isOnline}
                />

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-[#111111] truncate">
                      {chat.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-bold shrink-0">
                      {formatTime(chat.lastTimestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[11px] text-neutral-500 font-bold truncate pr-2">
                      {chat.lastMessage}
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {chat.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-neutral-400 rotate-45" />
                      )}
                      {chat.unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-[#00A884] text-white border border-[#111111] rounded-full text-[9px] font-black shadow-2xs">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. FLOATING ACTION BUTTON (+ MULAI CHAT BARU SEPERTI DI WHATSAPP) */}
      <button
        onClick={() => setShowNewChatModal(true)}
        className="absolute bottom-4 right-4 w-13 h-13 rounded-2xl bg-[#00A884] hover:bg-[#008f6f] text-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex items-center justify-center font-black active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer z-30"
        title="Mulai Chat Baru"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* MODAL 1: MULAI CHAT BARU */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2">
              <h4 className="font-black text-sm uppercase text-[#111111]">
                Mulai Chat Baru
              </h4>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#111111]" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-neutral-500">
                  Nama Kontak
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: admin miwa chan"
                  className="w-full border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-bold outline-hidden mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-neutral-500">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+6285771761119"
                  className="w-full border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-bold outline-hidden mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-neutral-500">
                  Pesan Terakhir
                </label>
                <input
                  type="text"
                  value={lastMsg}
                  onChange={(e) => setLastMsg(e.target.value)}
                  placeholder="Pesan..."
                  className="w-full border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-bold outline-hidden mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-neutral-500">
                  Pilih Avatar Anime / Karakter
                </label>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {Object.entries(DEFAULT_AVATARS).map(([key, url]) => (
                    <img
                      key={key}
                      src={url}
                      alt={key}
                      onClick={() => setSelectedAvatarKey(key as any)}
                      className={`w-11 h-11 rounded-full object-cover cursor-pointer border-2 ${
                        selectedAvatarKey === key
                          ? 'border-[#F6C825] ring-2 ring-[#111111] scale-105'
                          : 'border-transparent opacity-60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-neutral-500">
                  Ring Avatar Efek
                </label>
                <select
                  value={avatarRing}
                  onChange={(e) => setAvatarRing(e.target.value as any)}
                  className="w-full border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-bold outline-hidden mt-1 bg-white"
                >
                  <option value="comic">Comic 2D Border</option>
                  <option value="pow">POW Glow Kuning (Gojo)</option>
                  <option value="duo_merah">Duo Merah-Kuning</option>
                  <option value="halftone">Halftone Ungu</option>
                  <option value="speed_line">Speed Line Cyan</option>
                  <option value="polos">Polos Minimalis</option>
                </select>
              </div>

              <div className="flex items-center gap-4 text-xs font-black">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOnline}
                    onChange={(e) => setIsOnline(e.target.checked)}
                    className="accent-[#18C96E]"
                  />
                  <span>Online</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="accent-[#008DA6]"
                  />
                  <span>Centang Biru ✓</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="flex-1 py-2.5 bg-neutral-100 border-2 border-[#111111] rounded-xl font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCreateChat}
                className="flex-1 py-2.5 bg-[#F6C825] hover:bg-[#E5B81C] text-[#111111] border-2 border-[#111111] rounded-xl font-black text-xs shadow-[2px_2px_0px_#111111] cursor-pointer"
              >
                Buat Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH FOLDER BARU (SEPERTI DI VIDEO 3:18) */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
          <div className="w-full max-w-xs bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4">
            <h4 className="font-black text-xs uppercase text-[#111111]">
              Tambah Folder Chat Baru
            </h4>

            <div>
              <label className="text-[10px] font-black uppercase text-neutral-500">
                Nama Folder
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Contoh: Kerja, Kuliah, Bisnis"
                className="w-full border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-bold outline-hidden mt-1"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="flex-1 py-2 bg-neutral-100 border-2 border-[#111111] rounded-xl font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleAddFolder}
                className="flex-1 py-2 bg-[#F6C825] hover:bg-[#E5B81C] text-[#111111] border-2 border-[#111111] rounded-xl font-black text-xs shadow-[2px_2px_0px_#111111] cursor-pointer"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AKSI PIN/ARCHIVE/DELETE */}
      {selectedChatAction && (
        <div
          onClick={() => setSelectedChatAction(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-4 space-y-2"
          >
            <h4 className="font-black text-xs text-[#111111] pb-2 border-b-2 border-neutral-200">
              {selectedChatAction.name}
            </h4>

            <button
              onClick={() => {
                onTogglePin(selectedChatAction.id);
                setSelectedChatAction(null);
              }}
              className="w-full text-left p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer"
            >
              <Pin className="w-4 h-4 text-neutral-500" />
              <span>
                {selectedChatAction.isPinned ? 'Lepas Sematan' : 'Sematkan Chat'}
              </span>
            </button>

            <button
              onClick={() => {
                onToggleArchive(selectedChatAction.id);
                setSelectedChatAction(null);
              }}
              className="w-full text-left p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer"
            >
              <Archive className="w-4 h-4 text-neutral-500" />
              <span>
                {selectedChatAction.isArchived ? 'Buka Arsip' : 'Arsipkan Chat'}
              </span>
            </button>

            <button
              onClick={() => {
                onDeleteChat(selectedChatAction.id);
                setSelectedChatAction(null);
              }}
              className="w-full text-left p-2.5 rounded-xl border border-red-200 hover:bg-red-50 flex items-center gap-2 text-xs font-bold text-red-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Hapus Chat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

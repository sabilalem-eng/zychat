import React, { useState, useEffect } from 'react';
import { StoryItem, UserProfile } from '../types';
import { soundEffects } from '../services/soundEffects';
import {
  Plus,
  Camera,
  Type,
  Mic,
  Eye,
  Play,
  Pause,
  X,
  Volume2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { AvatarWithRing } from './AvatarWithRing';

interface StoryViewProps {
  stories: StoryItem[];
  userProfile: UserProfile;
  onAddStory: (story: Omit<StoryItem, 'id' | 'timestamp' | 'viewCount'>) => void;
  onDeleteStory: (id: string) => void;
}

export const StoryView: React.FC<StoryViewProps> = ({
  stories,
  userProfile,
  onAddStory,
  onDeleteStory,
}) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState<'text' | 'audio' | null>(null);

  // New text story state
  const [newText, setNewText] = useState('');
  const [bgColor, setBgColor] = useState('#7C3AED');

  // New audio story state
  const [audioLabel, setAudioLabel] = useState('Status Audio Rekaman');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const colors = ['#7C3AED', '#0284C7', '#18C96E', '#F6C825', '#EF4444', '#111111'];

  // Story playback timer
  useEffect(() => {
    let timer: any;
    if (activeStoryIndex !== null) {
      setStoryProgress(0);
      timer = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            // Next story or close
            if (activeStoryIndex + 1 < stories.length) {
              setActiveStoryIndex(activeStoryIndex + 1);
              return 0;
            } else {
              setActiveStoryIndex(null);
              return 0;
            }
          }
          return prev + 2.5;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [activeStoryIndex, stories.length]);

  const handleCreateTextStory = () => {
    if (!newText.trim()) return;
    soundEffects.playSentSound();
    onAddStory({
      authorName: userProfile.name,
      authorPhone: userProfile.phone,
      authorAvatar: userProfile.avatarUrl,
      type: 'text',
      content: newText.trim(),
      backgroundColor: bgColor,
    });
    setNewText('');
    setShowCreateModal(null);
  };

  const handleCreateAudioStory = () => {
    soundEffects.playSentSound();
    onAddStory({
      authorName: userProfile.name,
      authorPhone: userProfile.phone,
      authorAvatar: userProfile.avatarUrl,
      type: 'audio',
      content: audioLabel || 'Pesan Audio',
      backgroundColor: '#0284C7',
      duration: recordingSeconds || 10,
    });
    setRecordingSeconds(0);
    setIsRecording(false);
    setShowCreateModal(null);
  };

  const myStories = stories.filter((s) => s.authorPhone === userProfile.phone || s.authorName === 'Story saya');
  const otherStories = stories.filter((s) => s.authorPhone !== userProfile.phone && s.authorName !== 'Story saya');
  const isDark = userProfile.theme === 'whatsapp_dark' || userProfile.theme === 'dark' || userProfile.theme === 'cyber';

  return (
    <div
      className={`flex flex-col h-full select-none p-4 space-y-4 overflow-y-auto ${
        isDark ? 'bg-[#111B21] text-[#E9EDEF]' : 'bg-[#FFFDF5] text-[#111111]'
      }`}
    >
      {/* 1. STORY SAYA HEADER */}
      <div
        className={`border-2 rounded-2xl p-3.5 shadow-[3px_3px_0px_#111111] flex items-center justify-between ${
          isDark
            ? 'bg-[#202C33] border-[#2A3942] text-[#E9EDEF]'
            : 'bg-white border-[#111111] text-[#111111]'
        }`}
      >
        <div
          onClick={() => {
            if (myStories.length > 0) setActiveStoryIndex(0);
            else setShowCreateModal('text');
          }}
          className="flex items-center gap-3 cursor-pointer flex-1"
        >
          <div className="relative">
            <AvatarWithRing
              src={userProfile.avatarUrl}
              size="md"
              ring="pow"
              showVerified={userProfile.isVerified}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00A884] text-white rounded-full border-2 border-white dark:border-[#111B21] flex items-center justify-center font-black text-xs">
              +
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-black text-xs">Status Saya</span>
            <span className="text-[10px] text-[#8696A0] font-bold">
              {myStories.length > 0
                ? `${myStories.length} pembaruan • Ketuk untuk lihat`
                : 'Ketuk untuk menambahkan status'}
            </span>
          </div>
        </div>

        {/* Quick action buttons: Text, Audio */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowCreateModal('text')}
            className={`p-2 rounded-xl cursor-pointer shadow-xs ${
              isDark
                ? 'bg-[#111B21] text-[#E9EDEF] border border-[#2A3942]'
                : 'bg-neutral-100 hover:bg-neutral-200 border-1.5 border-[#111111] text-neutral-800'
            }`}
            title="Buat Status Teks"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal('audio')}
            className="p-2 bg-[#00A884] hover:bg-[#008F6F] text-white rounded-xl cursor-pointer shadow-xs"
            title="Buat Status Audio"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. RIWAYAT STORY SAYA */}
      {myStories.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase text-neutral-500">
            Riwayat Story Saya:
          </span>
          <div className="space-y-2">
            {myStories.map((st) => (
              <div
                key={st.id}
                className="bg-white border-2 border-[#111111] rounded-xl p-3 flex items-center justify-between shadow-[2px_2px_0px_#111111]"
              >
                <div
                  onClick={() => {
                    const idx = stories.findIndex((x) => x.id === st.id);
                    if (idx !== -1) setActiveStoryIndex(idx);
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className="w-10 h-10 rounded-xl border border-[#111111] bg-neutral-100 flex items-center justify-center font-bold text-xs overflow-hidden">
                    {st.type === 'image' ? (
                      <img src={st.content} alt="Story" className="w-full h-full object-cover" />
                    ) : st.type === 'audio' ? (
                      <Volume2 className="w-5 h-5 text-[#0284C7]" />
                    ) : (
                      <span className="font-mono text-[9px] p-1 text-center line-clamp-2">
                        {st.content}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#111111]">
                      {st.type === 'audio' ? 'Status Audio' : st.type === 'image' ? 'Foto' : st.content}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-semibold">
                      <span>16 menit lalu</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3 text-[#18C96E]" /> {st.viewCount} dilihat
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteStory(st.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 cursor-pointer"
                  title="Hapus Story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PEMBARUAN TERBARU (OTHER STORIES) */}
      <div className="space-y-2 pt-2">
        <span className="text-[11px] font-black uppercase text-neutral-500">
          Pembaruan Terbaru:
        </span>
        <div className="space-y-2">
          {otherStories.map((st) => (
            <div
              key={st.id}
              onClick={() => {
                const idx = stories.findIndex((x) => x.id === st.id);
                if (idx !== -1) setActiveStoryIndex(idx);
              }}
              className="bg-white border-2 border-[#111111] rounded-2xl p-3 flex items-center justify-between shadow-[2px_2px_0px_#111111] cursor-pointer hover:bg-neutral-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <AvatarWithRing
                  src={st.authorAvatar}
                  size="md"
                  ring="comic"
                  showVerified
                />
                <div className="flex flex-col">
                  <span className="font-black text-xs text-[#111111]">
                    {st.authorName}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500">
                    {st.type === 'audio' ? '🎵 Status Audio (VN)' : 'Pembaruan terkini'} • 23 menit lalu
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#F6C825] border border-[#111111] flex items-center justify-center shadow-xs">
                <Play className="w-3.5 h-3.5 fill-[#111111] ml-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MODAL BUAT STATUS TEKS */}
      {showCreateModal === 'text' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="font-black text-xs uppercase text-[#111111]">
                Buat Status Teks Baru
              </span>
              <button
                onClick={() => setShowCreateModal(null)}
                className="text-neutral-500 hover:text-black font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Preview Box */}
            <div
              className="w-full h-40 rounded-2xl border-2 border-[#111111] p-4 flex items-center justify-center text-center shadow-[3px_3px_0px_#111111] transition-colors"
              style={{ backgroundColor: bgColor }}
            >
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Ketik status teks di sini..."
                className="w-full bg-transparent text-white placeholder-white/70 font-black text-base text-center outline-hidden resize-none"
                rows={3}
              />
            </div>

            {/* Color Palette */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  className={`w-7 h-7 rounded-full border-2 border-[#111111] cursor-pointer transition-transform ${
                    bgColor === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <button
              onClick={handleCreateTextStory}
              className="w-full py-3 bg-[#18C96E] hover:bg-[#15B362] text-[#111111] border-2 border-[#111111] rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#111111] cursor-pointer"
            >
              Bagikan ke Status
            </button>
          </div>
        </div>
      )}

      {/* 5. MODAL BUAT STATUS AUDIO (PERSIS SEPERTI DI VIDEO 1:11) */}
      {showCreateModal === 'audio' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="font-black text-xs uppercase text-[#111111]">
                Status Audio (Voice Note)
              </span>
              <button
                onClick={() => setShowCreateModal(null)}
                className="text-neutral-500 hover:text-black font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Big Mic Button & Timer */}
            <div className="py-4 space-y-3">
              <div
                onClick={() => {
                  soundEffects.playTapSound();
                  setIsRecording(!isRecording);
                }}
                className={`w-24 h-24 mx-auto rounded-full border-[3px] border-[#111111] flex items-center justify-center shadow-[4px_4px_0px_#111111] cursor-pointer transition-all ${
                  isRecording ? 'bg-[#EF4444] animate-pulse text-white' : 'bg-[#F6C825] text-[#111111]'
                }`}
              >
                <Mic className="w-10 h-10" />
              </div>

              <div className="font-mono font-black text-xl text-[#111111]">
                00:{String(recordingSeconds).padStart(2, '0')}
              </div>
              <p className="text-[11px] text-neutral-500 font-semibold">
                Ketuk mic untuk rekam status audio (maksimal 60 detik)
              </p>
            </div>

            <input
              type="text"
              value={audioLabel}
              onChange={(e) => setAudioLabel(e.target.value)}
              placeholder="Tambahkan keterangan audio..."
              className="w-full border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-bold text-center outline-hidden"
            />

            <button
              onClick={handleCreateAudioStory}
              className="w-full py-3 bg-[#18C96E] hover:bg-[#15B362] text-[#111111] border-2 border-[#111111] rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#111111] cursor-pointer"
            >
              Kirim ke Status Saya
            </button>
          </div>
        </div>
      )}

      {/* 6. FULL-SCREEN STORY VIEWER (SEPERTI VIDEO 0:30) */}
      {activeStoryIndex !== null && stories[activeStoryIndex] && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 animate-in fade-in duration-150">
          {/* Top Progress Bar */}
          <div className="flex gap-1.5 w-full pt-1">
            {stories.map((st, i) => (
              <div
                key={st.id}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width:
                      i < activeStoryIndex
                        ? '100%'
                        : i === activeStoryIndex
                        ? `${storyProgress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Story Author Bar */}
          <div className="flex items-center justify-between text-white pt-2">
            <div className="flex items-center gap-2.5">
              <AvatarWithRing
                src={stories[activeStoryIndex].authorAvatar}
                size="sm"
                ring="comic"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-black text-xs">
                  {stories[activeStoryIndex].authorName}
                </span>
                <span className="text-[10px] text-white/70">
                  {stories[activeStoryIndex].type === 'audio'
                    ? 'Status Audio'
                    : 'Pembaruan terkini'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveStoryIndex(null)}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Story Center Content */}
          <div className="flex-1 flex items-center justify-center my-4 relative">
            {/* Click Left to Prev, Right to Next */}
            <div
              onClick={() =>
                setActiveStoryIndex((prev) => (prev && prev > 0 ? prev - 1 : null))
              }
              className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
            />
            <div
              onClick={() =>
                setActiveStoryIndex((prev) =>
                  prev !== null && prev + 1 < stories.length ? prev + 1 : null
                )
              }
              className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
            />

            {/* AUDIO STORY: PERSIS SEPERTI DI VIDEO 0:30 (LINGKARAN KUNING STATUS AUDIO) */}
            {stories[activeStoryIndex].type === 'audio' ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-36 h-36 rounded-full bg-[#F6C825] border-[4px] border-[#111111] shadow-[6px_6px_0px_#111111] flex items-center justify-center animate-pulse">
                  <Volume2 className="w-16 h-16 text-[#111111]" />
                </div>
                <div className="bg-black/60 px-4 py-2 rounded-2xl border border-white/20">
                  <h4 className="font-mono font-black text-base text-[#F6C825]">
                    STATUS AUDIO
                  </h4>
                  <span className="text-xs text-white/90">
                    {stories[activeStoryIndex].content}
                  </span>
                </div>
              </div>
            ) : stories[activeStoryIndex].type === 'image' ? (
              <img
                src={stories[activeStoryIndex].content}
                alt="Story"
                className="max-h-[75vh] max-w-full rounded-2xl border border-white/20 object-contain shadow-2xl"
              />
            ) : (
              /* Text Story */
              <div
                className="w-full max-w-sm h-80 rounded-3xl p-6 flex items-center justify-center text-center border-2 border-white/30 shadow-2xl"
                style={{
                  backgroundColor:
                    stories[activeStoryIndex].backgroundColor || '#7C3AED',
                }}
              >
                <p className="font-mono font-black text-xl text-white leading-relaxed">
                  {stories[activeStoryIndex].content}
                </p>
              </div>
            )}
          </div>

          {/* Bottom views indicator */}
          <div className="flex justify-center text-white/80 pb-2 text-xs font-bold gap-1.5">
            <Eye className="w-4 h-4 text-[#18C96E]" />
            <span>{stories[activeStoryIndex].viewCount} Dilihat</span>
          </div>
        </div>
      )}
    </div>
  );
};

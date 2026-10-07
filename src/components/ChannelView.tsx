import React, { useState } from 'react';
import { ChannelItem, ChannelPost, UserProfile } from '../types';
import { soundEffects } from '../services/soundEffects';
import {
  Megaphone,
  Share2,
  Check,
  Plus,
  Send,
  Heart,
  ArrowLeft,
  Users,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { AvatarWithRing } from './AvatarWithRing';

interface ChannelViewProps {
  channels: ChannelItem[];
  userProfile: UserProfile;
  onFollowToggle: (channelId: string) => void;
  onAddPost: (channelId: string, text: string, mediaUrl?: string) => void;
}

export const ChannelView: React.FC<ChannelViewProps> = ({
  channels,
  userProfile,
  onFollowToggle,
  onAddPost,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [newPostText, setNewPostText] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  const activeChannel = channels.find((c) => c.id === selectedChannelId);

  const handlePublishPost = () => {
    if (!selectedChannelId || !newPostText.trim()) return;
    soundEffects.playSentSound();
    onAddPost(
      selectedChannelId,
      newPostText.trim(),
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
    );
    setNewPostText('');
    setShowNewPostModal(false);
  };

  // If inside a specific channel
  if (activeChannel) {
    return (
      <div className="flex flex-col h-full bg-[#FFFDF5] select-none">
        {/* Top Channel Header */}
        <div className="bg-[#7C3AED] text-white p-4 border-b-[2.5px] border-[#111111] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedChannelId(null)}
              className="p-1 rounded-full hover:bg-white/20 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#F6C825]" />
              <h3 className="font-mono font-black text-base uppercase">
                {activeChannel.name}
              </h3>
            </div>
          </div>

          <button
            onClick={() => onFollowToggle(activeChannel.id)}
            className={`px-3 py-1 rounded-xl font-black text-xs border border-[#111111] shadow-xs cursor-pointer ${
              activeChannel.isFollowing
                ? 'bg-white text-[#111111]'
                : 'bg-[#18C96E] text-[#111111]'
            }`}
          >
            {activeChannel.isFollowing ? '✓ Diikuti' : '+ Ikuti'}
          </button>
        </div>

        {/* Channel Info Card */}
        <div className="p-4 bg-white border-b-2 border-[#111111] space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-600 font-bold">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#7C3AED]" />
              <span>{activeChannel.followersCount} Pengikut</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#F6C825]" />
              <span>{activeChannel.posts.length} Postingan</span>
            </div>
            <div className="flex items-center gap-1 text-[#18C96E]">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Status</span>
            </div>
          </div>

          <p className="text-xs text-neutral-700 font-medium leading-relaxed">
            {activeChannel.description}
          </p>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowNewPostModal(true)}
              className="flex-1 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-2 border-[#111111] rounded-xl font-black text-xs shadow-[2px_2px_0px_#111111] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Posting Baru</span>
            </button>
            <button
              onClick={() => alert('Tautan saluran disalin!')}
              className="p-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-[#111111] rounded-xl text-neutral-800 shadow-[2px_2px_0px_#111111] cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Channel Posts Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <span className="text-[11px] font-black uppercase text-neutral-500">
            Postingan Terbaru:
          </span>

          {activeChannel.posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border-2 border-[#111111] rounded-2xl p-3.5 shadow-[3px_3px_0px_#111111] space-y-2.5"
            >
              <div className="flex items-center gap-2.5">
                <AvatarWithRing src={post.authorAvatar} size="xs" ring="comic" />
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-[#111111]">
                    {post.authorName}
                  </span>
                  <span className="text-[10px] text-neutral-400">1 jam lalu</span>
                </div>
              </div>

              <p className="text-xs text-neutral-800 leading-relaxed font-semibold">
                {post.text}
              </p>

              {post.mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-[#111111]">
                  <img
                    src={post.mediaUrl}
                    alt="Post media"
                    className="w-full max-h-52 object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-xs text-neutral-500 font-bold">
                <button className="flex items-center gap-1 text-[#EF4444] cursor-pointer">
                  <Heart className="w-4 h-4 fill-[#EF4444]" />
                  <span>{post.likesCount} Suka</span>
                </button>
                <span className="text-[10px] text-neutral-400">Dilihat oleh 45 orang</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Buat Postingan Baru */}
        {showNewPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4">
              <span className="font-black text-xs uppercase text-[#111111] block">
                Publikasikan Postingan di {activeChannel.name}
              </span>
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Tulis pesan pengumuman saluran di sini..."
                className="w-full h-28 border-2 border-[#111111] rounded-xl p-3 text-xs font-semibold outline-hidden resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewPostModal(false)}
                  className="flex-1 py-2.5 bg-neutral-100 border-2 border-[#111111] rounded-xl font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handlePublishPost}
                  className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-2 border-[#111111] rounded-xl font-black text-xs shadow-[2px_2px_0px_#111111] cursor-pointer"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Channel List View
  return (
    <div className="flex flex-col h-full bg-[#FFFDF5] select-none p-4 space-y-3 overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-200">
        <div>
          <h3 className="font-black text-sm text-[#111111]">Saluran &amp; Channel</h3>
          <span className="text-[10px] text-neutral-500 font-bold">
            Tetap terhubung dengan topik dan komunitas favorit
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {channels.map((ch) => (
          <div
            key={ch.id}
            onClick={() => setSelectedChannelId(ch.id)}
            className="bg-white border-2 border-[#111111] rounded-2xl p-3.5 shadow-[3px_3px_0px_#111111] flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <AvatarWithRing src={ch.avatarUrl} size="md" ring="comic" showVerified />
              <div className="flex flex-col">
                <span className="font-black text-xs text-[#111111]">{ch.name}</span>
                <span className="text-[10px] text-neutral-500 font-bold">
                  {ch.followersCount} pengikut • {ch.posts.length} postingan
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onFollowToggle(ch.id);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black border border-[#111111] shadow-xs cursor-pointer ${
                ch.isFollowing
                  ? 'bg-neutral-100 text-neutral-800'
                  : 'bg-[#18C96E] text-[#111111]'
              }`}
            >
              {ch.isFollowing ? 'Diikuti' : '+ Ikuti'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

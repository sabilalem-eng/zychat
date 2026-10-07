import React, { useState } from 'react';
import { CommunityItem, UserProfile } from '../types';
import { Users, Megaphone, Plus, ChevronRight, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { AvatarWithRing } from './AvatarWithRing';

interface CommunityViewProps {
  communities: CommunityItem[];
  userProfile: UserProfile;
  onSelectGroupChat: (groupName: string) => void;
  onNewCommunity: (name: string, description: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  communities,
  userProfile,
  onSelectGroupChat,
  onNewCommunity,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const isDark = userProfile.theme === 'whatsapp_dark' || userProfile.theme === 'dark' || userProfile.theme === 'cyber';

  const handleCreate = () => {
    if (!name.trim()) return;
    onNewCommunity(name.trim(), desc.trim() || 'Komunitas baru zyChat');
    setName('');
    setDesc('');
    setShowCreateModal(false);
  };

  return (
    <div
      className={`flex flex-col h-full select-none overflow-y-auto ${
        isDark ? 'bg-[#111B21] text-[#E9EDEF]' : 'bg-[#F0F2F5] text-[#111B21]'
      }`}
    >
      {/* 1. TOP BANNER: KOMUNITAS BARU */}
      <div
        onClick={() => setShowCreateModal(true)}
        className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
          isDark
            ? 'bg-[#202C33] hover:bg-[#2A3942] border-b border-[#222E35]'
            : 'bg-white hover:bg-[#F5F6F6] border-b border-neutral-200'
        }`}
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-[#00A884]/20 flex items-center justify-center border border-[#00A884]">
            <Users className="w-6 h-6 text-[#00A884]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00A884] rounded-full flex items-center justify-center border-2 border-white dark:border-[#111B21]">
            <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-sm">Komunitas Baru</h4>
          <p className="text-xs text-[#8696A0] line-clamp-1">
            Kumpulkan grup terkait dan kirim pengumuman
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-[#8696A0]" />
      </div>

      {/* 2. DAFTAR KOMUNITAS */}
      <div className="p-3 space-y-4">
        {communities.map((comm) => (
          <div
            key={comm.id}
            className={`rounded-2xl overflow-hidden border shadow-xs ${
              isDark ? 'bg-[#202C33] border-[#2A3942]' : 'bg-white border-neutral-200'
            }`}
          >
            {/* Community Header */}
            <div
              className={`p-3.5 flex items-center gap-3 border-b ${
                isDark ? 'border-[#2A3942]' : 'border-neutral-100'
              }`}
            >
              <img
                src={comm.avatarUrl}
                alt={comm.name}
                className="w-11 h-11 rounded-xl object-cover border border-[#00A884]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm">{comm.name}</h4>
                  <ShieldCheck className="w-4 h-4 text-[#00A884]" />
                </div>
                <p className="text-[11px] text-[#8696A0] line-clamp-1">
                  {comm.description}
                </p>
              </div>
            </div>

            {/* Sub-groups inside Community */}
            <div className="divide-y divide-neutral-100 dark:divide-[#2A3942]/50">
              {comm.groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onSelectGroupChat(group.name)}
                  className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                    isDark ? 'hover:bg-[#2A3942]' : 'hover:bg-[#F5F6F6]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#00A884]/20 flex items-center justify-center shrink-0">
                    {group.name.includes('Pengumuman') ? (
                      <Megaphone className="w-4 h-4 text-[#00A884]" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-[#00A884]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">
                        {group.name}
                      </span>
                      <span className="text-[10px] text-[#8696A0]">
                        {group.memberCount} anggota
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8696A0] truncate">
                      {group.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE COMMUNITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-5 border shadow-2xl space-y-4 ${
              isDark ? 'bg-[#202C33] border-[#2A3942] text-white' : 'bg-white border-neutral-300 text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00A884]" />
              <h3 className="font-black text-base">Buat Komunitas Baru</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#8696A0] block mb-1">
                  Nama Komunitas
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Komunitas Kelas 12 IPA 1"
                  className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                    isDark
                      ? 'bg-[#111B21] border-[#2A3942] text-white'
                      : 'bg-[#F0F2F5] border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8696A0] block mb-1">
                  Deskripsi Komunitas
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Deskripsi singkat seputar tujuan komunitas..."
                  rows={3}
                  className={`w-full px-3 py-2 rounded-xl text-sm border outline-none resize-none ${
                    isDark
                      ? 'bg-[#111B21] border-[#2A3942] text-white'
                      : 'bg-[#F0F2F5] border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#8696A0] hover:bg-black/10 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="px-4 py-2 bg-[#00A884] hover:bg-[#008F6F] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Buat Komunitas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

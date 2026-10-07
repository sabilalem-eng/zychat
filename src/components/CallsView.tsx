import React, { useState } from 'react';
import { CallRecord, UserProfile } from '../types';
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Link2,
  Trash2,
  Plus,
  Share2,
} from 'lucide-react';
import { AvatarWithRing } from './AvatarWithRing';

interface CallsViewProps {
  calls: CallRecord[];
  userProfile?: UserProfile;
  onTriggerCall: (
    contact: { name: string; number: string; avatarUrl: string },
    type: 'voice' | 'video'
  ) => void;
  onClearHistory: () => void;
}

export const CallsView: React.FC<CallsViewProps> = ({
  calls,
  userProfile,
  onTriggerCall,
  onClearHistory,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const isDark =
    userProfile?.theme === 'whatsapp_dark' ||
    userProfile?.theme === 'dark' ||
    userProfile?.theme === 'cyber';

  const handleShareLink = () => {
    navigator.clipboard.writeText('https://call.zychat.app/join/room-9883');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatCallTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex flex-col h-full select-none p-3 space-y-4 overflow-y-auto ${
        isDark ? 'bg-[#111B21] text-[#E9EDEF]' : 'bg-[#FFFFFF] text-[#111B21]'
      }`}
    >
      {/* 1. BUAT TAUTAN PANGGILAN (PERSIS WHATSAPP ASLI) */}
      <div
        onClick={handleShareLink}
        className={`p-3 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-colors ${
          isDark
            ? 'bg-[#202C33] hover:bg-[#2A3942]'
            : 'bg-[#F0F2F5] hover:bg-[#E4E6EB]'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-[#00A884] text-white flex items-center justify-center shrink-0">
          <Link2 className="w-6 h-6 -rotate-45" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm">Buat tautan panggilan</h4>
          <p className="text-xs text-[#8696A0] truncate">
            {copiedLink
              ? '✓ Tautan berhasil disalin ke clipboard!'
              : 'Bagikan tautan untuk panggilan zyChat'}
          </p>
        </div>

        <Share2 className="w-4 h-4 text-[#8696A0]" />
      </div>

      {/* 2. RECENT CALLS LIST */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#8696A0] uppercase">
            Terbaru
          </span>

          {calls.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs font-bold text-red-500 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Riwayat</span>
            </button>
          )}
        </div>

        {calls.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-[#8696A0] font-semibold text-xs">
            <Phone className="w-12 h-12 mx-auto text-[#00A884] opacity-40" />
            <p>Belum ada riwayat panggilan.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-[#202C33]/60">
            {calls.map((call) => {
              const isMissed = call.direction === 'missed';
              const isOutgoing = call.direction === 'outgoing';

              return (
                <div
                  key={call.id}
                  className={`p-3 flex items-center justify-between transition-colors ${
                    isDark ? 'hover:bg-[#202C33]/50' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={call.contactAvatar}
                      alt={call.contactName}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />

                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className={`font-bold text-sm truncate ${
                          isMissed ? 'text-red-500' : ''
                        }`}
                      >
                        {call.contactName}
                      </span>

                      <div className="flex items-center gap-1.5 text-xs text-[#8696A0]">
                        {isMissed ? (
                          <PhoneMissed className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        ) : isOutgoing ? (
                          <PhoneOutgoing className="w-3.5 h-3.5 text-[#00A884] shrink-0" />
                        ) : (
                          <PhoneIncoming className="w-3.5 h-3.5 text-[#00A884] shrink-0" />
                        )}

                        <span>
                          {formatCallTime(call.timestamp)} •{' '}
                          {isMissed
                            ? 'Tidak terjawab'
                            : call.durationSeconds
                            ? `${call.durationSeconds} detik`
                            : 'Panggilan masuk'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Call Redial Button */}
                  <button
                    onClick={() =>
                      onTriggerCall(
                        {
                          name: call.contactName,
                          number: call.contactNumber,
                          avatarUrl: call.contactAvatar,
                        },
                        call.type
                      )
                    }
                    className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#00A884] cursor-pointer"
                    title={call.type === 'video' ? 'Panggilan Video' : 'Panggilan Suara'}
                  >
                    {call.type === 'video' ? (
                      <Video className="w-5 h-5" />
                    ) : (
                      <Phone className="w-5 h-5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

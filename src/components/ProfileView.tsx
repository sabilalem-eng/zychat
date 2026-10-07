import React, { useState } from 'react';
import {
  UserProfile,
  ChatTheme,
  AvatarRing,
} from '../types';
import { DEFAULT_WALLPAPERS } from '../data/mockData';
import { soundEffects } from '../services/soundEffects';
import {
  User,
  Phone,
  MessageSquare,
  Calendar,
  Palette,
  Image,
  CircleDot,
  Volume2,
  HardDrive,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Check,
  Download,
  Smartphone,
  Play,
  RotateCcw,
} from 'lucide-react';
import { AvatarWithRing } from './AvatarWithRing';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
  onLogout,
}) => {
  const [activeModal, setActiveModal] = useState<
    'edit_profile' | 'auto_reply' | 'birthday' | 'themes' | 'wallpapers' | 'ring_avatar' | 'audio' | 'storage' | null
  >(null);

  // Edit profile form state
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [bioInput, setBioInput] = useState(userProfile.bio);

  // Auto reply form state
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(userProfile.autoReplyEnabled);
  const [autoReplyText, setAutoReplyText] = useState(userProfile.autoReplyText);

  // Birthday state
  const [birthdayInput, setBirthdayInput] = useState(userProfile.birthday);

  // Media storage simulated state
  const [mediaStats, setMediaStats] = useState({
    totalMb: 43.4,
    photoKb: 901,
    videoMb: 42.4,
    audioKb: 10,
    stickerB: 0,
    cacheMb: 23.2,
  });

  const handleSaveProfile = () => {
    soundEffects.playTapSound();
    onUpdateProfile({ name: nameInput, bio: bioInput });
    setActiveModal(null);
  };

  const handleSaveAutoReply = () => {
    soundEffects.playTapSound();
    onUpdateProfile({ autoReplyEnabled, autoReplyText });
    setActiveModal(null);
  };

  const handleSaveBirthday = () => {
    soundEffects.playTapSound();
    onUpdateProfile({ birthday: birthdayInput });
    setActiveModal(null);
  };

  const handleClearMedia = () => {
    soundEffects.playTapSound();
    setMediaStats({
      totalMb: 0,
      photoKb: 0,
      videoMb: 0,
      audioKb: 0,
      stickerB: 0,
      cacheMb: 0,
    });
    alert('Semua file media dan cache berhasil dibersihkan!');
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFDF5] select-none p-4 space-y-4 overflow-y-auto">
      {/* 1. TOP USER CARD (SEPERTI DI VIDEO 0:33) */}
      <div className="bg-white border-2 border-[#111111] rounded-[24px] p-5 shadow-[4px_4px_0px_#111111] flex flex-col items-center text-center space-y-3">
        <AvatarWithRing
          src={userProfile.avatarUrl}
          size="lg"
          ring={userProfile.avatarRing}
          showVerified={userProfile.isVerified}
        />

        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="font-black text-lg text-[#111111]">{userProfile.name}</h3>
            {userProfile.isVerified && (
              <span className="text-xs text-[#008DA6] font-black">✓</span>
            )}
          </div>
          <span className="font-mono text-xs font-bold text-neutral-500">
            {userProfile.phone}
          </span>
          <p className="text-[11px] text-neutral-600 font-medium pt-1">
            {userProfile.bio}
          </p>
        </div>

        <button
          onClick={() => {
            setNameInput(userProfile.name);
            setBioInput(userProfile.bio);
            setActiveModal('edit_profile');
          }}
          className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          Edit Profil
        </button>
      </div>

      {/* 2. SECTION SOSIAL */}
      <div className="space-y-2">
        <span className="text-[11px] font-black uppercase text-neutral-500 pl-1">
          Sosial
        </span>

        <div className="space-y-2">
          {/* Balasan Otomatis */}
          <div
            onClick={() => {
              setAutoReplyEnabled(userProfile.autoReplyEnabled);
              setAutoReplyText(userProfile.autoReplyText);
              setActiveModal('auto_reply');
            }}
            className="bg-white border-2 border-[#111111] rounded-2xl p-3.5 shadow-[2px_2px_0px_#111111] flex items-center justify-between cursor-pointer hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F6C825]/20 border border-[#111111] rounded-xl text-[#111111]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs text-[#111111]">Balasan Otomatis</span>
                <span className="text-[10px] text-neutral-500 font-semibold">
                  {userProfile.autoReplyEnabled ? 'Auto-reply aktif saat sibuk' : 'Nonaktif'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>

          {/* Tanggal Lahir */}
          <div
            onClick={() => {
              setBirthdayInput(userProfile.birthday);
              setActiveModal('birthday');
            }}
            className="bg-white border-2 border-[#111111] rounded-2xl p-3.5 shadow-[2px_2px_0px_#111111] flex items-center justify-between cursor-pointer hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#8B5CF6]/20 border border-[#111111] rounded-xl text-[#8B5CF6]">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs text-[#111111]">Tanggal Lahir</span>
                <span className="text-[10px] text-neutral-500 font-semibold">
                  {userProfile.birthday || 'Atur ulang tahunmu'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>
        </div>
      </div>

      {/* 3. SECTION TAMPILAN (PERSIS SEPERTI DI VIDEO 0:41 - 0:54) */}
      <div className="space-y-2">
        <span className="text-[11px] font-black uppercase text-neutral-500 pl-1">
          Tampilan &amp; Kostumisasi
        </span>

        <div className="space-y-2">
          {/* Pilih Tema */}
          <div
            onClick={() => setActiveModal('themes')}
            className="bg-white border-2 border-[#111111] rounded-2xl p-3.5 shadow-[2px_2px_0px_#111111] flex items-center justify-between cursor-pointer hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#18C96E]/20 border border-[#111111] rounded-xl text-[#18C96E]">
                <Palette className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs text-[#111111]">Tema Aplikasi</span>
                <span className="text-[10px] text-neutral-500 font-semibold uppercase">
                  {userProfile.theme} (Liquid / Comic / 3D)
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>

          {/* Wallpaper Chat */}
          <div
            onClick={() => setActiveModal('wallpapers')}
            className="bg-white border-2 border-[#111111] rounded-2xl p-3.5 shadow-[2px_2px_0px_#111111] flex items-center justify-between cursor-pointer hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00B8D9]/20 border border-[#111111] rounded-xl text-[#00B8D9]">
                <Image className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs text-[#111111]">Wallpaper Chat</span>
                <span className="text-[10px] text-neutral-500 font-semibold">
                  Ganti background chat anime
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>

          {/* Ring Avatar */}
          <div
            onClick={() => setActiveModal('ring_avatar')}
            className="bg-white border-2 border-[#111111] rounded-2xl p-3.5 shadow-[2px_2px_0px_#111111] flex items-center justify-between cursor-pointer hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F6C825]/20 border border-[#111111] rounded-xl text-[#111111]">
                <CircleDot className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs text-[#111111]">Ring Avatar</span>
                <span className="text-[10px] text-neutral-500 font-semibold uppercase">
                  Border {userProfile.avatarRing} ala Comic
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>

          {/* Audio & Notifikasi */}
          <div
            onClick={() => setActiveModal('audio')}
            className="bg-white border-2 border-[#111111] rounded-2xl p-3.5 shadow-[2px_2px_0px_#111111] flex items-center justify-between cursor-pointer hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 border border-[#111111] rounded-xl text-[#111111]">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs text-[#111111]">Audio &amp; Notifikasi</span>
                <span className="text-[10px] text-neutral-500 font-semibold">
                  Suara chat, nada dering, volume
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>
        </div>
      </div>

      {/* 4. SECTION PENYIMPANAN MEDIA (SEPERTI DI VIDEO 1:05 & 1:32) */}
      <div className="space-y-2">
        <span className="text-[11px] font-black uppercase text-neutral-500 pl-1">
          Penyimpanan
        </span>

        <div
          onClick={() => setActiveModal('storage')}
          className="bg-white border-2 border-[#111111] rounded-2xl p-3.5 shadow-[2px_2px_0px_#111111] flex items-center justify-between cursor-pointer hover:bg-neutral-50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 border border-[#111111] rounded-xl text-red-600">
              <HardDrive className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xs text-[#111111]">Penyimpanan Media</span>
              <span className="text-[10px] text-neutral-500 font-semibold">
                Lihat &amp; bersihkan foto, video, audio ({mediaStats.totalMb} MB)
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </div>
      </div>

      {/* 5. TAUTAN CHAT JARAK JAUH & STATUS JARINGAN */}
      <div className="pt-2 bg-emerald-50 border-2 border-[#00A884] rounded-[20px] p-3.5 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A884] animate-pulse"></span>
            <span className="text-xs font-black text-[#008069]">Jaringan zyChat Aktif</span>
          </div>
          <span className="text-[10px] font-bold text-neutral-500 font-mono">End-to-End</span>
        </div>
        <p className="text-[11px] text-neutral-600 font-medium">
          Nomor Anda: <span className="font-bold text-[#111111]">{userProfile.phone}</span>. Pengguna lain dapat mengirim pesan langsung ke nomor ini dari mana saja.
        </p>
        <button
          onClick={() => {
            soundEffects.playTapSound();
            const shareText = `Yuk chat aku di zyChat! Nomor: ${userProfile.phone}`;
            if (navigator.clipboard) {
              navigator.clipboard.writeText(shareText);
              alert('Info nomor telepon berhasil disalin ke clipboard!');
            }
          }}
          className="w-full py-2.5 bg-[#00A884] hover:bg-[#008f6f] text-white border-2 border-[#111111] rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Salin Info Nomor Untuk Obrolan</span>
        </button>
      </div>

      {/* 6. TOMBOL KELUAR */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
      >
        <LogOut className="w-4 h-4" />
        <span>Keluar dari Akun</span>
      </button>

      {/* ======================================================== */}
      {/* MODAL 1: EDIT PROFIL */}
      {activeModal === 'edit_profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4">
            <h4 className="font-black text-xs uppercase text-[#111111]">Edit Profil</h4>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-neutral-500">Nama</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-bold outline-hidden mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-neutral-500">Bio</label>
                <input
                  type="text"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-bold outline-hidden mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-neutral-100 border-2 border-[#111111] rounded-xl font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2.5 bg-[#18C96E] hover:bg-[#15B362] text-[#111111] border-2 border-[#111111] rounded-xl font-black text-xs shadow-[2px_2px_0px_#111111] cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BALASAN OTOMATIS */}
      {activeModal === 'auto_reply' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4">
            <h4 className="font-black text-xs uppercase text-[#111111]">Balasan Otomatis</h4>

            <div className="flex items-center justify-between p-3 bg-neutral-50 border-2 border-[#111111] rounded-xl">
              <span className="text-xs font-bold text-[#111111]">Aktifkan Auto-Reply</span>
              <button
                onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                className={`w-12 h-6 rounded-full border border-[#111111] relative transition-colors cursor-pointer ${
                  autoReplyEnabled ? 'bg-[#18C96E]' : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white border border-[#111111] absolute top-0.5 transition-all ${
                    autoReplyEnabled ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-neutral-500">Pesan Balasan</label>
              <textarea
                value={autoReplyText}
                onChange={(e) => setAutoReplyText(e.target.value)}
                placeholder="Tulis pesan otomatis saat sibuk..."
                className="w-full h-24 border-2 border-[#111111] rounded-xl p-2.5 text-xs font-semibold outline-hidden mt-1 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-neutral-100 border-2 border-[#111111] rounded-xl font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAutoReply}
                className="flex-1 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-2 border-[#111111] rounded-xl font-black text-xs shadow-[2px_2px_0px_#111111] cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PILIH TEMA (PERSIS SEPERTI DI VIDEO 0:41) */}
      {activeModal === 'themes' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4">
            <h4 className="font-black text-xs uppercase text-[#111111]">Pilih Tema zyChat</h4>

            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
              {/* Theme 0: WhatsApp Gelap */}
              <div
                onClick={() => {
                  onUpdateProfile({ theme: 'whatsapp_dark' });
                  setActiveModal(null);
                }}
                className={`p-3.5 rounded-2xl border-2 border-[#111111] cursor-pointer bg-[#111B21] text-white shadow-[2px_2px_0px_#111111] space-y-1 ${
                  userProfile.theme === 'whatsapp_dark' ? 'ring-3 ring-[#00A884]' : ''
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#00A884]" />
                <span className="font-black text-xs block text-white">WhatsApp Gelap</span>
                <span className="text-[9px] text-[#8696A0] font-bold">Resmi • Mode Malam</span>
              </div>

              {/* Theme 0b: WhatsApp Terang */}
              <div
                onClick={() => {
                  onUpdateProfile({ theme: 'whatsapp_light' });
                  setActiveModal(null);
                }}
                className={`p-3.5 rounded-2xl border-2 border-[#111111] cursor-pointer bg-white text-neutral-900 shadow-[2px_2px_0px_#111111] space-y-1 ${
                  userProfile.theme === 'whatsapp_light' ? 'ring-3 ring-[#008069]' : ''
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#008069]" />
                <span className="font-black text-xs block text-[#111111]">WhatsApp Terang</span>
                <span className="text-[9px] text-neutral-500 font-bold">Resmi • Mode Siang</span>
              </div>

              {/* Theme 1: Liquid Ungu */}
              <div
                onClick={() => {
                  onUpdateProfile({ theme: 'purple' });
                  setActiveModal(null);
                }}
                className={`p-3.5 rounded-2xl border-2 border-[#111111] cursor-pointer bg-[#F5F3FF] shadow-[2px_2px_0px_#111111] space-y-1 ${
                  userProfile.theme === 'purple' ? 'ring-3 ring-[#7C3AED]' : ''
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#7C3AED]" />
                <span className="font-black text-xs block text-[#1E1B4B]">Liquid Ungu</span>
                <span className="text-[9px] text-neutral-500 font-bold">Terang • Orbitron</span>
              </div>

              {/* Theme 2: Liquid Gelap */}
              <div
                onClick={() => {
                  onUpdateProfile({ theme: 'dark' });
                  setActiveModal(null);
                }}
                className={`p-3.5 rounded-2xl border-2 border-[#111111] cursor-pointer bg-[#120E1E] text-white shadow-[2px_2px_0px_#111111] space-y-1 ${
                  userProfile.theme === 'dark' ? 'ring-3 ring-[#8B5CF6]' : ''
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#8B5CF6]" />
                <span className="font-black text-xs block text-white">Liquid Gelap</span>
                <span className="text-[9px] text-neutral-400 font-bold">Dark • Orbitron</span>
              </div>

              {/* Theme 3: Comic 2D (Default video) */}
              <div
                onClick={() => {
                  onUpdateProfile({ theme: 'comic' });
                  setActiveModal(null);
                }}
                className={`p-3.5 rounded-2xl border-2 border-[#111111] cursor-pointer bg-[#F6C825] shadow-[2px_2px_0px_#111111] space-y-1 ${
                  userProfile.theme === 'comic' ? 'ring-3 ring-black' : ''
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white border border-black" />
                <span className="font-black text-xs block text-[#111111]">Comic 2D</span>
                <span className="text-[9px] text-neutral-800 font-bold">Kartun • Neo-Brutalist</span>
              </div>

              {/* Theme 4: 3D Realistic */}
              <div
                onClick={() => {
                  onUpdateProfile({ theme: 'cyber' });
                  setActiveModal(null);
                }}
                className={`p-3.5 rounded-2xl border-2 border-[#111111] cursor-pointer bg-[#0F172A] text-white shadow-[2px_2px_0px_#111111] space-y-1 ${
                  userProfile.theme === 'cyber' ? 'ring-3 ring-[#06B6D4]' : ''
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#06B6D4]" />
                <span className="font-black text-xs block text-white">3D Realistic</span>
                <span className="text-[9px] text-neutral-400 font-bold">Futuristik • Astral</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-neutral-100 border-2 border-[#111111] rounded-xl font-bold text-xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: RING AVATAR (PERSIS SEPERTI DI VIDEO 1:25) */}
      {activeModal === 'ring_avatar' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4">
            <h4 className="font-black text-xs uppercase text-[#111111]">Ring Avatar Ala Comic</h4>

            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  { key: 'comic', label: 'Comic' },
                  { key: 'polos', label: 'Polos' },
                  { key: 'duo_merah', label: 'Duo Merah' },
                  { key: 'halftone', label: 'Halftone' },
                  { key: 'speed_line', label: 'Speed Line' },
                  { key: 'pow', label: 'POW! Matahari' },
                ] as const
              ).map((ringItem) => (
                <div
                  key={ringItem.key}
                  onClick={() => {
                    onUpdateProfile({ avatarRing: ringItem.key });
                    setActiveModal(null);
                  }}
                  className={`p-3 rounded-xl border-2 border-[#111111] cursor-pointer flex flex-col items-center space-y-2 hover:bg-neutral-50 shadow-xs ${
                    userProfile.avatarRing === ringItem.key ? 'bg-amber-100 ring-2 ring-[#F6C825]' : 'bg-white'
                  }`}
                >
                  <AvatarWithRing
                    src={userProfile.avatarUrl}
                    size="sm"
                    ring={ringItem.key}
                  />
                  <span className="font-black text-[11px] text-[#111111]">
                    {ringItem.label}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-neutral-100 border-2 border-[#111111] rounded-xl font-bold text-xs cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: WALLPAPER CHAT (PERSIS SEPERTI DI VIDEO 0:52) */}
      {activeModal === 'wallpapers' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4">
            <h4 className="font-black text-xs uppercase text-[#111111]">Wallpaper Chat</h4>

            <div className="grid grid-cols-2 gap-2.5">
              {DEFAULT_WALLPAPERS.map((wp) => (
                <div
                  key={wp.id}
                  onClick={() => {
                    onUpdateProfile({ chatWallpaper: wp.url });
                    setActiveModal(null);
                  }}
                  className={`h-28 rounded-xl border-2 border-[#111111] cursor-pointer overflow-hidden relative shadow-xs ${
                    userProfile.chatWallpaper === wp.url ? 'ring-3 ring-[#18C96E]' : ''
                  }`}
                  style={{
                    backgroundColor: wp.url ? 'transparent' : '#FFFDF5',
                    backgroundImage: wp.url ? `url(${wp.url})` : undefined,
                    backgroundSize: 'cover',
                  }}
                >
                  <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1 py-0.5 rounded text-center">
                    {wp.name}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-neutral-100 border-2 border-[#111111] rounded-xl font-bold text-xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: AUDIO & NOTIFIKASI (PERSIS SEPERTI DI VIDEO 0:55) */}
      {activeModal === 'audio' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4">
            <h4 className="font-black text-xs uppercase text-[#111111]">Audio &amp; Notifikasi</h4>

            {/* Volume slider */}
            <div className="p-3 bg-neutral-50 border-2 border-[#111111] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                <span>Volume</span>
                <span>{userProfile.soundVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={userProfile.soundVolume}
                onChange={(e) => onUpdateProfile({ soundVolume: Number(e.target.value) })}
                className="w-full accent-[#7C3AED] cursor-pointer"
              />
            </div>

            {/* Test Audio Buttons */}
            <div className="space-y-2 text-xs">
              <button
                onClick={() => soundEffects.playReceivedSound(userProfile.soundVolume / 100)}
                className="w-full p-2.5 bg-white hover:bg-neutral-50 border-2 border-[#111111] rounded-xl font-bold flex items-center justify-between cursor-pointer"
              >
                <span>Suara Notifikasi (Ting!)</span>
                <Play className="w-4 h-4 text-[#18C96E]" />
              </button>

              <button
                onClick={() => soundEffects.startIncomingRingtone(userProfile.soundVolume / 100)}
                className="w-full p-2.5 bg-white hover:bg-neutral-50 border-2 border-[#111111] rounded-xl font-bold flex items-center justify-between cursor-pointer"
              >
                <span>Ringtone Panggilan Masuk</span>
                <Play className="w-4 h-4 text-[#F6C825]" />
              </button>

              <button
                onClick={() => soundEffects.stopRingtone()}
                className="w-full p-2 bg-neutral-100 hover:bg-neutral-200 border border-[#111111] rounded-xl font-bold text-[11px] text-neutral-700 cursor-pointer text-center"
              >
                Hentikan Tes Ringtone
              </button>
            </div>

            <button
              onClick={() => {
                soundEffects.stopRingtone();
                setActiveModal(null);
              }}
              className="w-full py-2.5 bg-[#18C96E] border-2 border-[#111111] rounded-xl font-black text-xs cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* MODAL 7: PENYIMPANAN MEDIA (PERSIS SEPERTI DI VIDEO 1:05 & 1:32) */}
      {activeModal === 'storage' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[24px] shadow-[6px_6px_0px_#111111] p-5 space-y-4">
            <h4 className="font-black text-xs uppercase text-[#111111]">Penyimpanan Media</h4>

            <div className="p-4 bg-neutral-50 border-2 border-[#111111] rounded-2xl text-center space-y-1">
              <span className="font-mono font-black text-2xl text-[#111111]">
                {mediaStats.totalMb} MB
              </span>
              <p className="text-[10px] text-neutral-500 font-bold">
                Total media chat tersimpan di aplikasi
              </p>
            </div>

            <div className="space-y-2 text-xs font-bold text-neutral-700">
              <div className="flex justify-between p-2 bg-white border border-neutral-300 rounded-lg">
                <span>Foto</span>
                <span className="font-mono text-neutral-500">{mediaStats.photoKb} KB</span>
              </div>
              <div className="flex justify-between p-2 bg-white border border-neutral-300 rounded-lg">
                <span>Video</span>
                <span className="font-mono text-neutral-500">{mediaStats.videoMb} MB</span>
              </div>
              <div className="flex justify-between p-2 bg-white border border-neutral-300 rounded-lg">
                <span>Pesan Suara</span>
                <span className="font-mono text-neutral-500">{mediaStats.audioKb} KB</span>
              </div>
              <div className="flex justify-between p-2 bg-white border border-neutral-300 rounded-lg">
                <span>Cache Sementara</span>
                <span className="font-mono text-neutral-500">{mediaStats.cacheMb} MB</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-neutral-100 border-2 border-[#111111] rounded-xl font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={handleClearMedia}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white border-2 border-[#111111] rounded-xl font-black text-xs shadow-[2px_2px_0px_#111111] cursor-pointer"
              >
                Hapus Media
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

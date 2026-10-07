import React from 'react';
import {
  Bot,
  Globe,
  Zap,
  BookOpen,
  History,
  Smartphone,
  Settings,
  ShieldAlert,
  X,
  ChevronRight,
} from 'lucide-react';
import { RobotAvatar } from './RobotAvatar';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  robotStatus: 'OFF' | 'ON';
  autoPilotActive: boolean;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  robotStatus,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'exam', label: 'Auto-Pilot Soal (CBT)', subtitle: 'Pilihan Ganda & Benar-Salah Mandiri', icon: Zap, color: '#18C96E' },
    { id: 'home', label: 'Dashboard & Kontrol Robot', subtitle: 'Status & Sakelar Robot Melayang', icon: Bot, color: '#FFC800' },
    { id: 'exambrowser', label: 'Buka Browser Ujian (Chrome)', subtitle: 'Hubungkan Tab & Overlay Melayang', icon: Globe, color: '#3B82F6' },
    { id: 'study', label: 'Study Mode', subtitle: 'Penjelasan Alasan & Konsep', icon: BookOpen, color: '#00B8D9' },
    { id: 'history', label: 'Riwayat Jawaban AI', subtitle: 'Hasil Analisis & Log Jawaban', icon: History, color: '#F59E0B' },
    { id: 'android', label: 'Base APK Android & ZIP', subtitle: 'Source Code Kotlin & Gradle 8.10.2', icon: Smartphone, color: '#8B5CF6' },
    { id: 'settings', label: 'Pengaturan & Izin', subtitle: 'Kecepatan, Model AI & Aksesibilitas', icon: Settings, color: '#64748B' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-white h-full border-r-[3px] border-[#111111] shadow-[8px_0px_0px_#111111] flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="p-4 bg-[#FFC800] border-b-[2.5px] border-[#111111] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RobotAvatar size="sm" status={robotStatus === 'ON' ? 'on' : 'off'} />
              <div>
                <h2 className="font-black text-lg text-[#111111] leading-none">
                  Zyl-assistent AI
                </h2>
                <span className="text-[10px] font-extrabold text-[#111111]/80 uppercase tracking-wider">
                  Auto-Pilot Solver v2.0
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-white border-2 border-[#111111] rounded-lg shadow-[2px_2px_0px_#111111] hover:bg-neutral-100 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <X className="w-5 h-5 text-[#111111] stroke-[2.5]" />
            </button>
          </div>

          {/* Status Badges */}
          <div className="p-3 bg-neutral-100 border-b-2 border-[#111111] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#18C96E] animate-pulse" />
              <span className="text-xs font-bold text-neutral-800">
                Mode Auto-Pilot
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#18C96E] text-[#111111] border border-[#111111]">
              AKTIF MANDIRI
            </span>
          </div>

          {/* Nav Items */}
          <nav className="p-2.5 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[#FFC800] border-[#111111] shadow-[2px_2px_0px_#111111] font-bold'
                      : 'bg-white border-transparent hover:border-[#111111] hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2 rounded-lg border-2 border-[#111111] shadow-[1px_1px_0px_#111111]"
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon className="w-4 h-4 text-[#111111] stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="font-black text-xs text-[#111111]">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-medium">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Warning */}
        <div className="p-3 border-t-[2.5px] border-[#111111] bg-red-50">
          <div className="flex items-center gap-1.5 text-xs font-black text-red-700">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>Aturan Penting:</span>
          </div>
          <p className="text-[10px] text-red-900 mt-0.5 leading-tight font-semibold">
            Dilarang keluar dari website soal saat robot sedang bekerja agar proses tidak terputus.
          </p>
        </div>
      </div>
    </div>
  );
};

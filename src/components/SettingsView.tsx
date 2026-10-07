import React from 'react';
import { AppSettings } from '../types';
import {
  Settings,
  Zap,
  Smartphone,
  Key,
  Trash2,
  RotateCcw,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearHistory: () => void;
  onResetSettings: () => void;
  onOpenPermissionModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory,
  onResetSettings,
  onOpenPermissionModal,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white border-[2.5px] border-[#111111] rounded-[22px] p-4 shadow-[4px_4px_0px_#111111] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FFC800] border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111]">
            <Settings className="w-5 h-5 text-[#111111]" />
          </div>
          <div>
            <h2 className="font-black text-base text-[#111111]">
              PENGATURAN SISTEM
            </h2>
            <p className="text-[11px] font-bold text-neutral-600">
              Konfigurasi Auto-Pilot, Robot Melayang, dan Keamanan
            </p>
          </div>
        </div>
      </div>

      {/* Auto-Pilot & Robot Settings */}
      <div className="bg-white border-[2.5px] border-[#111111] rounded-[24px] p-5 shadow-[4px_4px_0px_#111111] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-neutral-100">
          <Zap className="w-4 h-4 text-[#18C96E]" />
          <h3 className="font-black text-xs uppercase tracking-wider text-[#111111]">
            KONTROL AUTO-PILOT &amp; ROBOT
          </h3>
        </div>

        {/* Kecepatan Auto-Pilot */}
        <div>
          <label className="text-xs font-bold text-[#111111] block mb-1.5">
            Kecepatan Pengerjaan Soal Robot:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', label: 'Normal (1.4 Detik)' },
              { id: 'fast', label: 'Cepat (0.7 Detik)' },
              { id: 'instant', label: 'Kilat (0.3 Detik)' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => onUpdateSettings({ autoPilotSpeed: m.id as any })}
                className={`py-2 px-1 text-center rounded-xl border-2 text-[11px] font-black transition-all cursor-pointer ${
                  settings.autoPilotSpeed === m.id
                    ? 'bg-[#FFC800] border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-600 hover:border-[#111111]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cross-Tab Floating Scan Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div>
            <div className="text-xs font-bold text-[#111111]">
              Mode Melayang Lintas Website (Always On Top)
            </div>
            <div className="text-[11px] text-neutral-500">
              Izinkan robot tetap melayang di luar tab untuk memindai soal di tab/aplikasi lain
            </div>
          </div>
          <button
            onClick={() => onUpdateSettings({ crossTabFloatingEnabled: settings.crossTabFloatingEnabled === false })}
            className={`w-12 h-7 rounded-full border-2 border-[#111111] transition-colors relative cursor-pointer ${
              settings.crossTabFloatingEnabled !== false ? 'bg-[#18C96E]' : 'bg-neutral-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white border border-[#111111] absolute top-0.5 transition-transform ${
                settings.crossTabFloatingEnabled !== false ? 'left-5.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Anti-Exit Warning Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div>
            <div className="text-xs font-bold text-[#111111]">
              Proteksi Dilarang Keluar dari Website
            </div>
            <div className="text-[11px] text-neutral-500">
              Peringatan suara &amp; modal jika tab diminimalkan saat simulasi internal aktif
            </div>
          </div>
          <button
            onClick={() => onUpdateSettings({ antiExitWarningEnabled: !settings.antiExitWarningEnabled })}
            className={`w-12 h-7 rounded-full border-2 border-[#111111] transition-colors relative cursor-pointer ${
              settings.antiExitWarningEnabled ? 'bg-[#18C96E]' : 'bg-neutral-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white border border-[#111111] absolute top-0.5 transition-transform ${
                settings.antiExitWarningEnabled ? 'left-5.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Robot Size */}
        <div>
          <div className="text-xs font-bold text-[#111111] mb-1.5">
            Ukuran Robot Melayang:
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => onUpdateSettings({ robotSize: size })}
                className={`py-2 px-2 rounded-xl border-2 text-xs font-black uppercase transition-all cursor-pointer ${
                  settings.robotSize === size
                    ? 'bg-[#00B8D9] border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-600 hover:border-[#111111]'
                }`}
              >
                {size === 'small' ? 'Kecil' : size === 'medium' ? 'Standar' : 'Besar'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions Manager */}
      <div className="bg-white border-[2.5px] border-[#111111] rounded-[24px] p-5 shadow-[4px_4px_0px_#111111] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-neutral-100">
          <Smartphone className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="font-black text-xs uppercase tracking-wider text-[#111111]">
            STATUS PERIZINAN APK ANDROID
          </h3>
        </div>
        <p className="text-xs text-neutral-700 font-medium leading-relaxed">
          Izin ini mengatur agar kepala robot melayang di atas Chrome dan mengklik jawaban ujian secara otomatis.
        </p>
        <button
          onClick={onOpenPermissionModal}
          className="w-full py-3 px-4 bg-[#FFC800] hover:bg-[#F5BE00] border-2 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Kelola Izin Overlay &amp; Aksesibilitas</span>
        </button>
      </div>

      {/* AI Key & Reset Actions */}
      <div className="bg-white border-[2.5px] border-[#111111] rounded-[24px] p-5 shadow-[4px_4px_0px_#111111] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-neutral-100">
          <Key className="w-4 h-4 text-neutral-700" />
          <h3 className="font-black text-xs uppercase tracking-wider text-[#111111]">
            ENGINE &amp; DATA LOKAL
          </h3>
        </div>
        <div>
          <label className="text-xs font-bold text-[#111111] block mb-1">
            Gemini API Key (Opsional - Masukkan jika ingin menggunakan API Gemini sendiri)
          </label>
          <input
            type="password"
            placeholder="Kunci otomatis aktif / masukkan AI key Anda..."
            value={settings.geminiApiKey}
            onChange={(e) => onUpdateSettings({ geminiApiKey: e.target.value })}
            className="w-full px-3 py-2 bg-neutral-50 border-2 border-neutral-300 rounded-xl text-xs font-mono focus:border-[#111111] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => {
              if (confirm('Hapus seluruh riwayat soal yang tersimpan?')) {
                onClearHistory();
              }
            }}
            className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 border-2 border-[#111111] rounded-xl text-xs font-bold text-neutral-800 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>Hapus Riwayat</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Reset seluruh pengaturan ke bawaan?')) {
                onResetSettings();
              }
            }}
            className="py-2.5 px-3 bg-red-50 hover:bg-red-100 border-2 border-red-500 rounded-xl text-xs font-bold text-red-600 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Bawaan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

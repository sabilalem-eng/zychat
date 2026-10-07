import React from 'react';
import { ShieldCheck, Layers, Smartphone, Sparkles } from 'lucide-react';

interface PermissionModalProps {
  isOpen: boolean;
  onGrantAll: () => void;
  onClose: () => void;
  overlayGranted: boolean;
  accessibilityGranted: boolean;
  onToggleOverlay: () => void;
  onToggleAccessibility: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onGrantAll,
  onClose,
  overlayGranted,
  accessibilityGranted,
  onToggleOverlay,
  onToggleAccessibility,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border-[3px] border-[#111111] rounded-[26px] shadow-[8px_8px_0px_#111111] overflow-hidden p-5 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-100">
          <div className="p-2.5 bg-[#FFC800] border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111]">
            <ShieldCheck className="w-6 h-6 text-[#111111]" />
          </div>
          <div>
            <h3 className="font-black text-base text-[#111111]">
              Perizinan Robot Mandiri
            </h3>
            <span className="text-[11px] font-bold text-neutral-500">
              Izin Diperlukan Agar Robot Bisa Mengerjakan Soal Sendiri
            </span>
          </div>
        </div>

        {/* Explain info */}
        <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
          Agar Anda bisa <strong>tinggal diam santai</strong> dan membiarkan Robot AI mendeteksi soal lalu mengklik jawaban secara otomatis di layar, aktifkan izin berikut:
        </p>

        {/* Permission 1: Overlay Window */}
        <div className="bg-neutral-50 border-2 border-neutral-200 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00B8D9]" />
              <span className="text-xs font-black text-[#111111]">
                1. Izin Tampil di Atas Aplikasi Lain (Overlay)
              </span>
            </div>
            <button
              onClick={onToggleOverlay}
              className={`px-3 py-1 rounded-full text-xs font-black border border-[#111111] transition-all cursor-pointer ${
                overlayGranted
                  ? 'bg-[#18C96E] text-[#111111]'
                  : 'bg-[#FFC800] text-[#111111]'
              }`}
            >
              {overlayGranted ? '✓ SUDAH AKTIF' : 'IZINKAN'}
            </button>
          </div>
          <p className="text-[11px] text-neutral-600 font-medium">
            Membuat kepala robot AI tetap melayang di atas browser Chrome atau website ujian Anda.
          </p>
        </div>

        {/* Permission 2: Accessibility Auto-Click */}
        <div className="bg-neutral-50 border-2 border-neutral-200 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-xs font-black text-[#111111]">
                2. Izin Aksesibilitas (Auto-Click Mandiri)
              </span>
            </div>
            <button
              onClick={onToggleAccessibility}
              className={`px-3 py-1 rounded-full text-xs font-black border border-[#111111] transition-all cursor-pointer ${
                accessibilityGranted
                  ? 'bg-[#18C96E] text-[#111111]'
                  : 'bg-[#FFC800] text-[#111111]'
              }`}
            >
              {accessibilityGranted ? '✓ SUDAH AKTIF' : 'IZINKAN'}
            </button>
          </div>
          <p className="text-[11px] text-neutral-600 font-medium">
            Memberikan kemampuan pada robot untuk mengklik radio button pilihan ganda &amp; benar-salah secara otomatis.
          </p>
        </div>

        {/* Quick Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] font-semibold text-amber-900 flex items-start gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Jika menggunakan versi Web Browser saat ini, kedua perizinan otomatis terpasang dan siap langsung dipakai!
          </span>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-3 bg-neutral-100 hover:bg-neutral-200 border-2 border-[#111111] rounded-xl text-xs font-black text-neutral-700 shadow-[2px_2px_0px_#111111] cursor-pointer"
          >
            TUTUP
          </button>
          <button
            onClick={onGrantAll}
            className="flex-1 py-3 px-3 bg-[#18C96E] hover:bg-[#15B362] border-2 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            AKTIFKAN SEMUA
          </button>
        </div>
      </div>
    </div>
  );
};

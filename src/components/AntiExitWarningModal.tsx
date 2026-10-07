import React from 'react';
import { AlertTriangle, CheckCircle2, Lock, ShieldAlert, Maximize2, Globe } from 'lucide-react';
import { RobotAvatar } from './RobotAvatar';

interface AntiExitWarningModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onOpenPip?: () => void;
}

export const AntiExitWarningModal: React.FC<AntiExitWarningModalProps> = ({
  isOpen,
  onDismiss,
  onOpenPip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border-[3.5px] border-[#111111] rounded-[24px] shadow-[8px_8px_0px_#111111] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Danger / Info Bar */}
        <div className="bg-[#FFC800] text-[#111111] p-4 flex items-center gap-3 border-b-[2.5px] border-[#111111]">
          <div className="p-2 bg-white rounded-xl border border-[#111111] shadow-[2px_2px_0px_#111111]">
            <Globe className="w-6 h-6 text-[#111111]" />
          </div>
          <div>
            <h3 className="font-black text-base uppercase tracking-tight">
              INGIN MEMBUKA WEBSITE LAIN?
            </h3>
            <span className="text-[11px] font-bold text-neutral-800">
              Gunakan Mode Robot Melayang (Always-On-Top)
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-center py-1">
            <RobotAvatar size="md" status="on" />
          </div>

          <div className="bg-sky-50 border-2 border-[#00B8D9] rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#008DA6]">
              <Maximize2 className="w-4 h-4 stroke-[2.5]" />
              <span className="text-xs font-black uppercase">
                Solusi Memindai Soal di Website Lain
              </span>
            </div>
            <p className="text-xs font-semibold text-neutral-800 leading-relaxed">
              Jika Anda ingin membuka tab ujian lain seperti <strong>Google Forms, CBT sekolah, Quizizz, atau Edmodo</strong>, aktifkan <strong>Jendela Robot Melayang</strong>.
              Robot akan tetap mengapung di layar komputer Anda dan siap scan soal kapan saja tanpa terputus!
            </p>
          </div>

          <div className="space-y-1.5 text-xs text-neutral-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#18C96E] shrink-0 mt-0.5" />
              <span>Robot tetap berada di pojok layar Anda di atas website ujian.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#18C96E] shrink-0 mt-0.5" />
              <span>Tekan tombol <strong>Scan</strong> atau Spacebar di jendela melayang untuk mendeteksi kunci jawaban.</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            {onOpenPip && (
              <button
                onClick={() => {
                  onDismiss();
                  onOpenPip();
                }}
                className="w-full py-3.5 px-4 bg-[#18C96E] hover:bg-[#15B362] border-2 border-[#111111] rounded-2xl font-black text-xs uppercase tracking-wider text-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>🚀 AKTIFKAN ROBOT MELAYANG DI LUAR WEB</span>
              </button>
            )}

            <button
              onClick={onDismiss}
              className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 border-2 border-[#111111] rounded-2xl font-bold text-xs text-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Tetap di Halaman Ini Saja</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

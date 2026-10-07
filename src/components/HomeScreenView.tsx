import React from 'react';
import { RobotAvatar } from './RobotAvatar';
import { AppSettings, AutoPilotProgress } from '../types';
import {
  Zap,
  Globe,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Archive,
  Maximize2,
  Camera,
  CheckCircle2,
} from 'lucide-react';

interface HomeScreenViewProps {
  settings: AppSettings;
  robotStatus: 'OFF' | 'ON';
  autoPilotProgress: AutoPilotProgress;
  onToggleRobot: (targetOn: boolean) => void;
  onNavigateTab: (tab: string) => void;
  onStartAutoPilot: () => void;
  onOpenPermissionModal: () => void;
  onTriggerAntiExitWarning: () => void;
  onOpenPip?: () => void;
  isPipActive?: boolean;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  settings,
  robotStatus,
  autoPilotProgress,
  onToggleRobot,
  onNavigateTab,
  onStartAutoPilot,
  onOpenPermissionModal,
  onTriggerAntiExitWarning,
  onOpenPip,
  isPipActive = false,
}) => {
  const isRobotOn = robotStatus === 'ON';
  const isSolving = autoPilotProgress.status === 'solving' || autoPilotProgress.status === 'counting';

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. HERO CARD: ROBOT AUTO-PILOT & SAKELAR */}
      <div className="bg-white border-[2.5px] border-[#111111] rounded-[24px] p-5 sm:p-6 shadow-[5px_5px_0px_#111111] space-y-4">
        {/* Header pill */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-[#FFC800] border-2 border-[#111111] rounded-full text-xs font-black uppercase text-[#111111] shadow-[2px_2px_0px_#111111] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-[#111111]" />
            <span>ROBOT AUTO-PILOT EXAM SOLVER</span>
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-600">
            <span
              className={`w-2.5 h-2.5 rounded-full border border-[#111111] ${
                isSolving
                  ? 'bg-[#18C96E] animate-ping'
                  : isRobotOn
                  ? 'bg-[#18C96E]'
                  : 'bg-[#FF3B4E]'
              }`}
            />
            <span>{isSolving ? 'Sedang Menjawab' : isRobotOn ? 'Melayang Aktif' : 'Mati (OFF)'}</span>
          </div>
        </div>

        {/* Hero Body */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 py-1">
          <RobotAvatar
            size="lg"
            status={isSolving ? 'solving' : isRobotOn ? 'on' : 'off'}
            className="shrink-0"
          />
          <div className="space-y-2 text-center sm:text-left flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#111111] leading-tight">
              Robot Mengerjakan Tugas &amp; Soal Sendiri
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 leading-relaxed">
              Pengguna tinggal <strong>diam saja menunggu</strong> robot selesai. Robot otomatis menganalisis berapa banyak soalnya, lalu menjawab soal pilihan ganda dan benar/salah satu per satu!
            </p>
          </div>
        </div>

        {/* Large Robot Switch Row */}
        <div className="bg-neutral-50 border-2 border-[#111111] rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase text-neutral-500">
              STATUS ROBOT MELAYANG DI LAYAR
            </div>
            <div
              className={`text-lg font-black ${
                isRobotOn ? 'text-[#18C96E]' : 'text-[#FF3B4E]'
              }`}
            >
              {isRobotOn ? 'MENYALA (ON) - MELAYANG DI LAYAR' : 'MATI (OFF) - DISEMBUNYIKAN'}
            </div>
          </div>
          <button
            onClick={() => onToggleRobot(!isRobotOn)}
            className={`w-18 h-10 rounded-full border-[2.5px] border-[#111111] relative transition-colors duration-200 cursor-pointer ${
              isRobotOn ? 'bg-[#18C96E]' : 'bg-[#FF3B4E]'
            }`}
            aria-label="Toggle Status Robot"
          >
            <div
              className={`w-7 h-7 rounded-full bg-white border-2 border-[#111111] shadow absolute top-0.5 transition-all duration-200 flex items-center justify-center ${
                isRobotOn ? 'left-[36px]' : 'left-1'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isRobotOn ? 'bg-[#18C96E]' : 'bg-[#FF3B4E]'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* 2. SPECIAL FEATURE: ROBOT MELAYANG DI LUAR WEB (CROSS-TAB ALWAYS-ON-TOP) */}
      <div className="bg-[#00B8D9] border-[2.5px] border-[#111111] rounded-[24px] p-5 shadow-[5px_5px_0px_#111111] text-[#111111] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-xl border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <Maximize2 className="w-5 h-5 text-[#111111]" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base uppercase tracking-tight">
                ROBOT MELAYANG DI LUAR WEBSITE (ALWAYS-ON-TOP)
              </h2>
              <span className="text-[11px] font-bold text-neutral-900">
                Tetap melayang saat Anda membuka tab CBT, Google Forms, atau Quizizz
              </span>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border border-[#111111] ${
              isPipActive ? 'bg-[#18C96E] animate-pulse text-[#111111]' : 'bg-white text-[#111111]'
            }`}
          >
            {isPipActive ? '● AKTIF MELAYANG' : 'SIAP BUKA'}
          </span>
        </div>

        <p className="text-xs font-semibold leading-relaxed bg-white/90 border-2 border-[#111111] rounded-2xl p-3 shadow-[2px_2px_0px_#111111]">
          ✨ <strong>Ingin robot tetap melayang di layar saat membuka web lain?</strong> Aktifkan jendela Always-On-Top! Robot akan menempel di pojok layar Anda dan bisa langsung memindai serta menjawab soal di website CBT atau Google Forms tanpa takut terputus.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={onOpenPip}
            className={`py-3.5 px-4 border-[2.5px] border-[#111111] rounded-2xl text-xs sm:text-sm font-black shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isPipActive
                ? 'bg-[#FF3B4E] text-white hover:bg-[#E02438]'
                : 'bg-[#18C96E] text-[#111111] hover:bg-[#15B362]'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>
              {isPipActive
                ? 'TUTUP JENDELA MELAYANG'
                : '🚀 BUKA ROBOT MELAYANG DI LUAR WEB'}
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('exambrowser')}
            className="py-3.5 px-4 bg-white hover:bg-neutral-50 border-[2.5px] border-[#111111] rounded-2xl text-xs sm:text-sm font-black text-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#008DA6]" />
            <span>PANDUAN &amp; SCANNER LENGKAP →</span>
          </button>
        </div>

        {/* 3 Keunggulan Melayang */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="bg-white/80 border border-[#111111] rounded-xl p-2 text-[10px] font-black">
            📌 Always-on-Top Layar
          </div>
          <div className="bg-white/80 border border-[#111111] rounded-xl p-2 text-[10px] font-black">
            📸 Sambung Layar CBT
          </div>
          <div className="bg-white/80 border border-[#111111] rounded-xl p-2 text-[10px] font-black">
            ⚡ Spacebar Instant Scan
          </div>
        </div>
      </div>

      {/* 3. THREE KEY METRIC CARDS */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border-2 border-[#111111] rounded-2xl p-3 shadow-[3px_3px_0px_#111111] text-center">
          <span className="text-[10px] font-black uppercase text-neutral-500 block">
            Akurasi AI
          </span>
          <div className="text-lg sm:text-xl font-black text-[#18C96E] mt-0.5">
            98.9%
          </div>
          <span className="text-[10px] font-bold text-neutral-600">
            Logika &amp; Aljabar
          </span>
        </div>
        <div className="bg-white border-2 border-[#111111] rounded-2xl p-3 shadow-[3px_3px_0px_#111111] text-center">
          <span className="text-[10px] font-black uppercase text-neutral-500 block">
            Mode Eksekusi
          </span>
          <div className="text-sm sm:text-base font-black text-[#008DA6] mt-1">
            Mandiri 100%
          </div>
          <span className="text-[10px] font-bold text-neutral-600">
            Tinggal Diam
          </span>
        </div>
        <div className="bg-white border-2 border-[#111111] rounded-2xl p-3 shadow-[3px_3px_0px_#111111] text-center">
          <span className="text-[10px] font-black uppercase text-neutral-500 block">
            Target Soal
          </span>
          <div className="text-lg sm:text-xl font-black text-[#111111] mt-0.5">
            PG &amp; B/S
          </div>
          <span className="text-[10px] font-bold text-neutral-600">
            A-E + Benar/Salah
          </span>
        </div>
      </div>

      {/* 4. PRIMARY ACTION BUTTONS */}
      <div className="space-y-2.5">
        {/* Button 1: Run Auto-Pilot Now */}
        <button
          onClick={() => {
            onNavigateTab('exam');
            setTimeout(() => onStartAutoPilot(), 200);
          }}
          className="w-full py-4 px-4 bg-[#18C96E] hover:bg-[#15B362] border-[2.5px] border-[#111111] rounded-[20px] text-xs sm:text-sm font-black text-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-[#111111]" />
          <span>⚡ MULAI AUTO-PILOT (ROBOT KERJAKAN SENDIRI)</span>
        </button>

        {/* Button 2: Paste Real Exam Questions */}
        <button
          onClick={() => onNavigateTab('exam')}
          className="w-full py-3.5 px-4 bg-[#FFC800] hover:bg-[#F5BE00] border-[2.5px] border-[#111111] rounded-[20px] text-xs sm:text-sm font-black text-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <span>📋 TEMPEL &amp; KERJAKAN SOAL ULANGAN ASLI</span>
        </button>

        {/* Button 3: Open External Exam Browser */}
        <button
          onClick={() => onNavigateTab('exambrowser')}
          className="w-full py-3.5 px-4 bg-[#111111] hover:bg-neutral-900 border-[2.5px] border-[#111111] rounded-[20px] text-xs sm:text-sm font-black text-white shadow-[4px_4px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Globe className="w-4 h-4 text-[#FFC800]" />
          <span>BUKA BROWSER UJIAN (CHROME &amp; CBT EKSTERNAL)</span>
        </button>

        {/* Button 4: APK Permissions */}
        <button
          onClick={onOpenPermissionModal}
          className="w-full py-3 px-4 bg-white hover:bg-neutral-50 border-2 border-[#111111] rounded-[18px] text-xs font-black text-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#18C96E]" />
            <span>IZIN MELAYANG &amp; AKSESIBILITAS ROBOT</span>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#18C96E]/20 text-[#159A53] rounded-full border border-[#18C96E]">
            {settings.overlayPermissionGranted && settings.accessibilityPermissionGranted ? '✓ SUDAH AKTIF' : 'CEK IZIN'}
          </span>
        </button>

        {/* Button 5: Download Base APK */}
        <button
          onClick={() => onNavigateTab('android')}
          className="w-full py-3.5 px-4 bg-[#8B5CF6] hover:bg-[#7C3AED] border-[2.5px] border-[#111111] rounded-[20px] text-xs sm:text-sm font-black text-white shadow-[4px_4px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-white" />
            <span>UNDUH ZIP BASE APK (UPGRADE V3.0)</span>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white text-[#8B5CF6] rounded-full border border-[#111111]">
            ANTI-ERROR (5)
          </span>
        </button>
      </div>

      {/* 5. CARA SCAN SOAL DI WEBSITE LAIN */}
      <div className="bg-white border-[2.5px] border-[#111111] rounded-[22px] p-5 shadow-[4px_4px_0px_#111111] space-y-3">
        <div className="flex items-center gap-2 text-[#111111]">
          <Sparkles className="w-4 h-4 text-[#FFC800] fill-[#FFC800]" />
          <h3 className="font-black text-xs uppercase tracking-wider">
            CARA MEMINDAI SOAL DI WEBSITE LAIN:
          </h3>
        </div>
        <ol className="space-y-2 text-xs font-semibold text-neutral-700 list-decimal list-inside leading-relaxed">
          <li>
            Klik tombol <strong>&ldquo;🚀 Buka Robot Melayang di Luar Web&rdquo;</strong> di atas atau di pojok atas header.
          </li>
          <li>
            Jendela robot kecil Always-On-Top akan muncul mengapung di layar komputer/laptop Anda.
          </li>
          <li>
            Klik <strong>&ldquo;📸 Sambungkan Layar&rdquo;</strong> dan pilih tab ujian Anda (misalnya Google Forms atau CBT).
          </li>
          <li>
            Beralih ke tab website ujian Anda. Tekan tombol <strong>SCAN</strong> (atau tombol Spacebar) di jendela robot melayang setiap ada soal baru.
          </li>
          <li>
            Kunci jawaban (A, B, C, D, E atau Benar/Salah) langsung muncul dan otomatis disalin ke clipboard!
          </li>
        </ol>
      </div>
    </div>
  );
};

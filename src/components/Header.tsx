import React from 'react';
import { Menu, Settings, Play, Maximize2 } from 'lucide-react';
import { RobotAvatar } from './RobotAvatar';
import { AutoPilotProgress } from '../types';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenSettings: () => void;
  robotStatus: 'OFF' | 'ON';
  autoPilotProgress: AutoPilotProgress;
  onStartAutoPilot: () => void;
  onPauseAutoPilot: () => void;
  onOpenPip?: () => void;
  isPipActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  onOpenSettings,
  robotStatus,
  autoPilotProgress,
  onStartAutoPilot,
  onPauseAutoPilot,
  onOpenPip,
  isPipActive = false,
}) => {
  const isSolving = autoPilotProgress.status === 'solving' || autoPilotProgress.status === 'counting';

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFC800] border-b-[2.5px] border-[#111111] px-4 py-2.5 select-none shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left Menu Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMenu}
            className="p-2 bg-white border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111] hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center cursor-pointer"
            aria-label="Menu Navigasi"
          >
            <Menu className="w-5 h-5 text-[#111111] stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-2">
            <RobotAvatar
              size="xs"
              status={isSolving ? 'solving' : robotStatus === 'ON' ? 'on' : 'off'}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-[#111111]">
                  Zyl-assistent AI
                </span>
                <span
                  className={`px-2 py-0.2 rounded-full text-[10px] font-black border border-[#111111] uppercase ${
                    isSolving
                      ? 'bg-[#18C96E] text-[#111111] animate-pulse'
                      : robotStatus === 'ON'
                      ? 'bg-[#00B8D9] text-[#111111]'
                      : 'bg-neutral-300 text-neutral-700'
                  }`}
                >
                  {isSolving
                    ? `Auto-Pilot (${autoPilotProgress.solvedCount}/${autoPilotProgress.totalQuestions})`
                    : robotStatus === 'ON'
                    ? 'Standby'
                    : 'OFF'}
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-[#111111]/75 hidden sm:inline">
                Robot Auto-Pilot Pilihan Ganda &amp; Benar-Salah
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Floating Outside Tab (PiP) Button */}
          {onOpenPip && (
            <button
              onClick={onOpenPip}
              className={`py-1.5 px-2.5 sm:px-3 border-2 border-[#111111] rounded-xl text-xs font-black shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer transition-all ${
                isPipActive
                  ? 'bg-[#18C96E] text-[#111111] animate-pulse'
                  : 'bg-[#00B8D9] hover:bg-[#00A2C0] text-[#111111]'
              }`}
              title="Buka Jendela Robot Melayang di Atas Website Lain (Always-On-Top)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">
                {isPipActive ? 'Melayang: ON' : 'Melayang Luar Web'}
              </span>
              <span className="xs:hidden">PiP</span>
            </button>
          )}

          {/* Quick Auto-Pilot Trigger */}
          {autoPilotProgress.status === 'idle' || autoPilotProgress.status === 'paused' ? (
            <button
              onClick={onStartAutoPilot}
              className="py-1.5 px-2.5 sm:px-3 bg-[#18C96E] hover:bg-[#15B362] border-2 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-[#111111]" />
              <span className="hidden md:inline">Jalankan</span>
              <span>Auto-Pilot</span>
            </button>
          ) : (
            <button
              onClick={onPauseAutoPilot}
              className="py-1.5 px-2.5 sm:px-3 bg-[#FFC800] hover:bg-[#F5BE00] border-2 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1 cursor-pointer"
            >
              <span className="w-2.5 h-2.5 bg-[#FF3B4E] rounded-full animate-ping" />
              <span>Jeda</span>
            </button>
          )}

          {/* Settings Icon */}
          <button
            onClick={onOpenSettings}
            className="p-2 bg-white border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111] hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center cursor-pointer"
            aria-label="Pengaturan"
          >
            <Settings className="w-5 h-5 text-[#111111] stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
};

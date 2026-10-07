import React from 'react';

interface RobotAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isProcessing?: boolean;
  status?: 'off' | 'on' | 'counting' | 'solving' | 'warning' | 'error';
  showGlow?: boolean;
  className?: string;
  onClick?: () => void;
}

export const RobotAvatar: React.FC<RobotAvatarProps> = ({
  size = 'md',
  isProcessing = false,
  status = 'on',
  className = '',
  onClick,
}) => {
  const sizeMap = {
    xs: { w: 32, h: 36, headW: 28, headH: 22, eyeW: 5, eyeH: 7, antenna: 6 },
    sm: { w: 48, h: 54, headW: 42, headH: 32, eyeW: 7, eyeH: 10, antenna: 8 },
    md: { w: 72, h: 82, headW: 64, headH: 48, eyeW: 10, eyeH: 14, antenna: 12 },
    lg: { w: 108, h: 122, headW: 96, headH: 72, eyeW: 15, eyeH: 22, antenna: 16 },
    xl: { w: 140, h: 160, headW: 124, headH: 92, eyeW: 18, eyeH: 28, antenna: 20 },
  };

  const current = sizeMap[size];
  const isOff = status === 'off';
  const isBusy = isProcessing || status === 'counting' || status === 'solving';
  const isWarning = status === 'warning';

  const eyeColor = isOff
    ? '#6B7280'
    : isWarning
    ? '#FF3B4E'
    : isBusy
    ? '#FFC800'
    : '#00F0FF';

  const eyeGlowClass = isOff
    ? ''
    : isBusy
    ? 'animate-pulse'
    : 'animate-eye-glow';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center select-none cursor-pointer group ${
        status === 'on' ? 'animate-robot-float' : ''
      } ${className}`}
      style={{ width: current.w, height: current.h }}
      title="Zyl-assistent Auto-Pilot Robot"
    >
      {/* Sensor Antenna with Laser Tip */}
      <div className="relative flex flex-col items-center -mb-1">
        <div
          className={`rounded-full border-2 border-[#111111] transition-all duration-300 ${
            isOff
              ? 'bg-neutral-400'
              : isWarning
              ? 'bg-[#FF3B4E] animate-ping'
              : isBusy
              ? 'bg-[#FFC800] animate-bounce shadow-[0_0_10px_#FFC800]'
              : 'bg-[#00B8D9] shadow-[0_0_8px_#00F0FF]'
          }`}
          style={{ width: current.antenna, height: current.antenna }}
        />
        <div
          className="w-[2.5px] bg-[#111111] -mt-[1px]"
          style={{ height: current.antenna * 0.7 }}
        />
      </div>

      {/* Robot Head Frame */}
      <div
        className="relative bg-white rounded-2xl border-[2.5px] border-[#111111] shadow-[3px_3px_0px_#111111] flex flex-col items-center justify-center transition-all duration-200"
        style={{ width: current.headW, height: current.headH }}
      >
        {/* Cute Ear sensors */}
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-[#111111] rounded-l-md" />
        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-[#111111] rounded-r-md" />

        {/* Visor Screen */}
        <div
          className="bg-[#111111] rounded-xl border border-neutral-700 flex items-center justify-center gap-2 sm:gap-2.5 px-2 relative overflow-hidden"
          style={{
            width: current.headW * 0.76,
            height: current.headH * 0.62,
          }}
        >
          {/* Scanline reflection */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          {/* Left Eye */}
          <div
            className={`rounded-full transition-all duration-200 ${eyeGlowClass} ${
              isOff ? '' : 'animate-eye-blink'
            }`}
            style={{
              width: current.eyeW,
              height: current.eyeH,
              backgroundColor: eyeColor,
            }}
          />

          {/* Right Eye */}
          <div
            className={`rounded-full transition-all duration-200 ${eyeGlowClass} ${
              isOff ? '' : 'animate-eye-blink'
            }`}
            style={{
              width: current.eyeW,
              height: current.eyeH,
              backgroundColor: eyeColor,
            }}
          />

          {/* Scanning radar line if busy */}
          {isBusy && (
            <div className="absolute inset-x-0 h-0.5 bg-[#00F0FF] animate-scan-radar opacity-80" />
          )}
        </div>
      </div>

      {/* Robot Mini Body with Pulse Core */}
      <div
        className="relative bg-white border-2 border-[#111111] rounded-b-xl -mt-1 shadow-[2px_2px_0px_#111111] flex items-center justify-center"
        style={{
          width: current.headW * 0.52,
          height: current.headH * 0.28,
        }}
      >
        <div
          className={`w-2 h-2 rounded-full border border-[#111111] ${
            isOff
              ? 'bg-neutral-400'
              : isWarning
              ? 'bg-[#FF3B4E]'
              : isBusy
              ? 'bg-[#FFC800] animate-ping'
              : 'bg-[#18C96E]'
          }`}
        />
      </div>
    </div>
  );
};

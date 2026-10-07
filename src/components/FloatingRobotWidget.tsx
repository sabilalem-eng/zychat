import React, { useState, useEffect, useRef } from 'react';
import { RobotAvatar } from './RobotAvatar';
import { AutoPilotProgress, RobotBubbleState } from '../types';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Zap,
  ChevronRight,
  Maximize2,
  Camera,
} from 'lucide-react';

interface FloatingRobotWidgetProps {
  isVisible: boolean;
  bubbleState: RobotBubbleState;
  customBubbleText?: string;
  autoPilotProgress: AutoPilotProgress;
  onTapRobot: () => void;
  onStartAutoPilot: () => void;
  onPauseAutoPilot: () => void;
  onResetAutoPilot: () => void;
  onOpenPip?: () => void;
  isPipActive?: boolean;
  onScanScreen?: () => void;
  savedPosition?: { x: number; y: number };
  onUpdatePosition?: (pos: { x: number; y: number }) => void;
  robotSize?: 'small' | 'medium' | 'large';
  robotOpacity?: number;
  bubbleEnabled?: boolean;
}

export const FloatingRobotWidget: React.FC<FloatingRobotWidgetProps> = ({
  isVisible,
  customBubbleText,
  autoPilotProgress,
  onTapRobot,
  onStartAutoPilot,
  onPauseAutoPilot,
  onResetAutoPilot,
  onOpenPip,
  isPipActive = false,
  onScanScreen,
  savedPosition = { x: 24, y: 150 },
  onUpdatePosition,
  robotSize = 'medium',
  robotOpacity = 1.0,
  bubbleEnabled = true,
}) => {
  const [position, setPosition] = useState(savedPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const currentPositionRef = useRef(savedPosition);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: position.x,
    posY: position.y,
  });
  const didMoveRef = useRef(false);

  useEffect(() => {
    if (savedPosition && !isDragging) {
      setPosition(savedPosition);
      currentPositionRef.current = savedPosition;
    }
  }, [savedPosition.x, savedPosition.y, isDragging]);

  if (!isVisible) return null;

  // Determine current bubble text based on Auto-Pilot progress
  let displayBubbleText = customBubbleText;
  if (!displayBubbleText) {
    if (autoPilotProgress.status === 'counting') {
      displayBubbleText = 'Menganalisis & Menghitung Soal...';
    } else if (autoPilotProgress.status === 'solving') {
      const qNum = autoPilotProgress.currentQuestionIndex + 1;
      const total = autoPilotProgress.totalQuestions;
      const ans = autoPilotProgress.lastAnswerGiven ? `[${autoPilotProgress.lastAnswerGiven}]` : '...';
      displayBubbleText = `Mengerjakan Soal ${qNum}/${total}   ${ans}`;
    } else if (autoPilotProgress.status === 'completed') {
      displayBubbleText = `Selesai! ${autoPilotProgress.solvedCount}/${autoPilotProgress.totalQuestions} Terjawab`;
    } else if (autoPilotProgress.status === 'paused') {
      displayBubbleText = 'Auto-Pilot Dijeda';
    } else if (isPipActive) {
      displayBubbleText = '🚀 Jendela Melayang Aktif di Tab Lain!';
    } else {
      displayBubbleText = 'Ketuk untuk Auto-Pilot Soal';
    }
  }

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    didMoveRef.current = false;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    setIsDragging(true);

    const onPointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - dragStartRef.current.mouseX;
      const dy = ev.clientY - dragStartRef.current.mouseY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        didMoveRef.current = true;
      }
      const newX = Math.max(8, Math.min(window.innerWidth - 120, dragStartRef.current.posX + dx));
      const newY = Math.max(8, Math.min(window.innerHeight - 150, dragStartRef.current.posY + dy));
      const newPos = { x: newX, y: newY };
      currentPositionRef.current = newPos;
      setPosition(newPos);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      setIsDragging(false);

      if (didMoveRef.current && onUpdatePosition) {
        onUpdatePosition(currentPositionRef.current);
      }

      if (!didMoveRef.current) {
        if (autoPilotProgress.status === 'idle' || autoPilotProgress.status === 'completed') {
          onStartAutoPilot();
        } else if (autoPilotProgress.status === 'paused') {
          onStartAutoPilot();
        } else if (autoPilotProgress.status === 'solving') {
          onPauseAutoPilot();
        } else {
          setShowQuickMenu(prev => !prev);
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const isSolving = autoPilotProgress.status === 'solving' || autoPilotProgress.status === 'counting';

  return (
    <div
      className="fixed z-40 select-none touch-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: robotOpacity,
      }}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Speech Bubble */}
        {bubbleEnabled && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (autoPilotProgress.status === 'idle' || autoPilotProgress.status === 'completed' || autoPilotProgress.status === 'paused') {
                onStartAutoPilot();
              } else if (autoPilotProgress.status === 'solving') {
                onPauseAutoPilot();
              } else {
                setShowQuickMenu(prev => !prev);
              }
            }}
            className={`mb-2 px-3.5 py-1.5 border-[2.5px] border-[#111111] rounded-full shadow-[3px_3px_0px_#111111] flex items-center gap-1.5 text-xs font-black text-[#111111] whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95 transition-all ${
              autoPilotProgress.status === 'solving'
                ? 'bg-[#18C96E] animate-pulse'
                : autoPilotProgress.status === 'counting'
                ? 'bg-[#FFC800]'
                : autoPilotProgress.status === 'completed'
                ? 'bg-[#00B8D9]'
                : isPipActive
                ? 'bg-[#00B8D9]'
                : 'bg-white'
            }`}
          >
            {autoPilotProgress.status === 'solving' ? (
              <Zap className="w-3.5 h-3.5 fill-[#111111]" />
            ) : autoPilotProgress.status === 'completed' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />
            ) : isPipActive ? (
              <Maximize2 className="w-3.5 h-3.5 text-[#111111]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
            )}
            <span>{displayBubbleText}</span>
          </div>
        )}

        {/* Floating Mini Action Bar */}
        <div className="mb-1.5 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
          {isSolving ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPauseAutoPilot();
              }}
              className="p-1 rounded-full bg-[#FFC800] hover:bg-[#F5BE00] border border-[#111111] text-[#111111] cursor-pointer"
              title="Jeda Auto-Pilot"
            >
              <Pause className="w-3 h-3 fill-[#111111]" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartAutoPilot();
              }}
              className="p-1 rounded-full bg-[#18C96E] hover:bg-[#15B362] border border-[#111111] text-[#111111] cursor-pointer"
              title="Mulai Auto-Pilot"
            >
              <Play className="w-3 h-3 fill-[#111111]" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onResetAutoPilot();
            }}
            className="p-1 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-[#111111] text-neutral-800 cursor-pointer"
            title="Reset Jawaban Soal"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Quick PiP Pop-Out Button */}
          {onOpenPip && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPip();
              }}
              className={`p-1 rounded-full border border-[#111111] text-[#111111] cursor-pointer transition-all ${
                isPipActive
                  ? 'bg-[#18C96E] animate-pulse'
                  : 'bg-[#00B8D9] hover:bg-[#00A2C0]'
              }`}
              title="Munculkan Melayang di Luar Tab (Always On Top)"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          )}

          <span className="text-[10px] font-black text-neutral-700 font-mono px-1">
            {autoPilotProgress.solvedCount}/{autoPilotProgress.totalQuestions}
          </span>
        </div>

        {/* Draggable Robot Head */}
        <div
          onPointerDown={handlePointerDown}
          className={`cursor-grab active:cursor-grabbing transition-transform ${
            isDragging ? 'scale-110 opacity-90' : 'hover:scale-105'
          }`}
        >
          <RobotAvatar
            size={robotSize === 'small' ? 'sm' : robotSize === 'large' ? 'lg' : 'md'}
            status={
              isSolving
                ? 'solving'
                : autoPilotProgress.warningAntiExitActive
                ? 'warning'
                : isPipActive
                ? 'on'
                : 'on'
            }
            isProcessing={isSolving}
          />
        </div>

        {/* Quick Menu Popup */}
        {showQuickMenu && (
          <div className="absolute top-full mt-2 w-72 bg-white border-[2.5px] border-[#111111] rounded-2xl shadow-[5px_5px_0px_#111111] p-3.5 space-y-2 z-50 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200">
              <span className="text-xs font-black uppercase text-[#111111]">
                Robot Auto-Pilot Menu
              </span>
              <button
                onClick={() => setShowQuickMenu(false)}
                className="text-neutral-500 hover:text-black font-black text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-neutral-600 font-medium leading-relaxed">
              Robot otomatis menganalisis soal dan memilih jawaban. Bisa juga melayang di luar tab untuk memindai website lain!
            </p>

            {/* Tombol 1: Munculkan Melayang di Luar Tab (Always on top) */}
            {onOpenPip && (
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  onOpenPip();
                }}
                className={`w-full py-2.5 px-3 border-2 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center gap-1.5 cursor-pointer ${
                  isPipActive
                    ? 'bg-[#18C96E] hover:bg-[#15B362]'
                    : 'bg-[#00B8D9] hover:bg-[#00A2C0]'
                }`}
              >
                <Maximize2 className="w-4 h-4" />
                <span>
                  {isPipActive
                    ? '✓ Jendela Melayang Aktif'
                    : '🚀 Melayang di Luar Tab (Scan Web Lain)'}
                </span>
              </button>
            )}

            {/* Tombol 2: Scan Soal Layar Langsung */}
            {onScanScreen && (
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  onScanScreen();
                }}
                className="w-full py-2.5 px-3 bg-[#FFC800] hover:bg-[#F5BE00] border-2 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>📸 Scan Soal di Tab Ujian Lain</span>
              </button>
            )}

            {/* Tombol 3: Auto-Pilot Tab Ini */}
            <button
              onClick={() => {
                setShowQuickMenu(false);
                onStartAutoPilot();
              }}
              className="w-full py-2.5 px-3 bg-[#18C96E] hover:bg-[#15B362] border-2 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Jalankan Auto-Pilot Soal di Tab Ini</span>
            </button>

            <button
              onClick={() => {
                setShowQuickMenu(false);
                onTapRobot();
              }}
              className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 border-2 border-[#111111] rounded-xl text-xs font-bold text-neutral-800 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Buka Halaman Soal Penuh</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

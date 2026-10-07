import React, { useState, useEffect, useRef } from 'react';
import { ActiveCallState } from '../types';
import { soundEffects } from '../services/soundEffects';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  SwitchCamera,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AvatarWithRing } from './AvatarWithRing';

interface CallActiveScreenProps {
  callState: ActiveCallState;
  onAccept: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onToggleCamera: () => void;
}

export const CallActiveScreen: React.FC<CallActiveScreenProps> = ({
  callState,
  onAccept,
  onEndCall,
  onToggleMute,
  onToggleSpeaker,
  onToggleCamera,
}) => {
  const [seconds, setSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  // Timer for duration when connected
  useEffect(() => {
    let interval: any;
    if (callState.status === 'connected') {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [callState.status]);

  // Ringtone management
  useEffect(() => {
    if (callState.isOpen) {
      if (callState.status === 'ringing') {
        soundEffects.startIncomingRingtone();
      } else if (callState.status === 'connected') {
        soundEffects.playCallConnectedSound();
      }
    } else {
      soundEffects.stopRingtone();
    }
    return () => {
      soundEffects.stopRingtone();
    };
  }, [callState.isOpen, callState.status]);

  // Camera stream for video call
  useEffect(() => {
    let localStream: MediaStream | null = null;
    if (callState.isOpen && callState.type === 'video' && !callState.isCameraOff) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: isFrontCamera ? 'user' : 'environment' }, audio: false })
          .then((stream) => {
            localStream = stream;
            setHasCameraStream(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.warn('Camera access denied or unavailable:', err);
            setHasCameraStream(false);
          });
      }
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [callState.isOpen, callState.type, callState.isCameraOff, isFrontCamera]);

  if (!callState.isOpen) return null;

  const formatTime = (secs: number) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md select-none">
      {/* Smartphone Container */}
      <div className="relative w-full max-w-sm h-[640px] bg-[#120E1E] text-white border-[3px] border-[#111111] rounded-[32px] shadow-[8px_8px_0px_#111111] overflow-hidden flex flex-col justify-between p-6">
        {/* Anime background overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80")',
          }}
        />

        {/* Top Info Bar */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-2 pt-4">
          <AvatarWithRing
            src={callState.contact.avatarUrl}
            size="xl"
            ring="pow"
            showVerified
            className="mb-2"
          />

          <h3 className="font-mono font-black text-lg tracking-wider text-white">
            {callState.contact.number}
          </h3>

          <div className="bg-[#F6C825] text-[#111111] px-4 py-1 rounded-full font-black text-xs border border-[#111111] shadow-[2px_2px_0px_#111111]">
            {callState.contact.name}
          </div>

          <p className="text-xs font-semibold text-neutral-300">
            {callState.status === 'ringing'
              ? `${callState.type === 'video' ? 'Panggilan video' : 'Panggilan suara'} masuk...`
              : callState.status === 'connected'
              ? formatTime(seconds)
              : 'Panggilan berakhir'}
          </p>
        </div>

        {/* Center Video Preview (Jika Video Call) */}
        {callState.type === 'video' && callState.status === 'connected' && (
          <div className="relative z-10 w-full flex-1 my-3 flex items-center justify-center">
            {/* Draggable/Floating Self View Camera */}
            <div className="relative w-full h-56 bg-neutral-900 border-2 border-[#111111] rounded-2xl overflow-hidden shadow-[3px_3px_0px_#111111] flex items-center justify-center">
              {hasCameraStream && !callState.isCameraOff ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isFrontCamera ? 'scale-x-[-1]' : ''}`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-neutral-400 space-y-2 p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                    <VideoOff className="w-8 h-8 text-neutral-500" />
                  </div>
                  <span className="text-[11px] font-bold">Kamera Anda Mati / Tersembunyi</span>
                </div>
              )}

              {/* Floating Contact View in corner */}
              <div className="absolute top-2 right-2 w-20 h-24 bg-neutral-800 border-2 border-[#F6C825] rounded-xl overflow-hidden shadow-md flex items-center justify-center">
                <img
                  src={callState.contact.avatarUrl}
                  alt={callState.contact.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 text-[8px] font-black bg-black/60 px-1 rounded text-white">
                  {callState.contact.name}
                </span>
              </div>

              {/* Flip camera button */}
              <button
                onClick={() => setIsFrontCamera(!isFrontCamera)}
                className="absolute bottom-2 left-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full border border-white/30 text-white cursor-pointer"
                title="Putar Kamera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Call Controls */}
        <div className="relative z-10 pb-4">
          {callState.status === 'ringing' ? (
            /* Incoming Ringing Controls: Tolak (Merah) & Terima (Hijau) */
            <div className="flex items-center justify-around px-4">
              <div className="flex flex-col items-center space-y-1.5">
                <button
                  onClick={() => {
                    soundEffects.playCallEndedSound();
                    onEndCall();
                  }}
                  className="w-16 h-16 rounded-full bg-[#EF4444] hover:bg-[#DC2626] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  title="Tolak Panggilan"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
                <span className="text-xs font-black text-neutral-300">Tolak</span>
              </div>

              <div className="flex flex-col items-center space-y-1.5">
                <button
                  onClick={() => {
                    soundEffects.stopRingtone();
                    onAccept();
                  }}
                  className="w-16 h-16 rounded-full bg-[#18C96E] hover:bg-[#15B362] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center animate-bounce active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  title="Terima Panggilan"
                >
                  <Phone className="w-7 h-7 text-[#111111]" />
                </button>
                <span className="text-xs font-black text-[#18C96E]">Terima</span>
              </div>
            </div>
          ) : (
            /* Connected Call Controls: Mute, Speaker, Camera, End */
            <div className="space-y-4">
              <div className="flex items-center justify-around px-2">
                {/* Mikrofon */}
                <div className="flex flex-col items-center space-y-1">
                  <button
                    onClick={onToggleMute}
                    className={`w-12 h-12 rounded-full border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center transition-all cursor-pointer ${
                      callState.isMuted
                        ? 'bg-neutral-800 text-[#EF4444]'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <span className="text-[10px] font-bold text-neutral-400">
                    {callState.isMuted ? 'Bisu' : 'Mikrofon'}
                  </span>
                </div>

                {/* Speaker */}
                <div className="flex flex-col items-center space-y-1">
                  <button
                    onClick={onToggleSpeaker}
                    className={`w-12 h-12 rounded-full border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center transition-all cursor-pointer ${
                      callState.isSpeaker
                        ? 'bg-[#F6C825] text-[#111111]'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {callState.isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                  <span className="text-[10px] font-bold text-neutral-400">Speaker</span>
                </div>

                {/* Kamera (jika video) */}
                {callState.type === 'video' && (
                  <div className="flex flex-col items-center space-y-1">
                    <button
                      onClick={onToggleCamera}
                      className={`w-12 h-12 rounded-full border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center transition-all cursor-pointer ${
                        callState.isCameraOff
                          ? 'bg-neutral-800 text-[#EF4444]'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {callState.isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </button>
                    <span className="text-[10px] font-bold text-neutral-400">Kamera</span>
                  </div>
                )}
              </div>

              {/* End Call Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    soundEffects.playCallEndedSound();
                    onEndCall();
                  }}
                  className="w-16 h-14 rounded-3xl bg-[#EF4444] hover:bg-[#DC2626] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  title="Akhiri Panggilan"
                >
                  <PhoneOff className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

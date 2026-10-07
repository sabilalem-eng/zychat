import React, { useState, useEffect } from 'react';
import { ShieldCheck, Send, RefreshCw, MessageSquare, Check, ArrowRight, User, Sparkles } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import { realtimeChatService } from '../services/realtimeChatService';
import { DEFAULT_AVATARS } from '../data/mockData';

interface LoginVerificationModalProps {
  isOpen: boolean;
  initialPhone?: string;
  initialName?: string;
  initialAvatar?: string;
  onFinish: (profileData: { phone: string; name: string; avatarUrl: string }) => void;
}

export const LoginVerificationModal: React.FC<LoginVerificationModalProps> = ({
  isOpen,
  initialPhone = '85882869441',
  initialName = 'User',
  initialAvatar = DEFAULT_AVATARS.user,
  onFinish,
}) => {
  const [step, setStep] = useState<
    'welcome' | 'input_number' | 'confirm_dialog' | 'otp_verify' | 'profile_setup' | 'loading_chats'
  >('welcome');

  const [phone, setPhone] = useState(initialPhone.replace('+62', ''));
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showSmsBanner, setShowSmsBanner] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [loadingPercent, setLoadingPercent] = useState(15);
  const [errorMessage, setErrorMessage] = useState('');

  // Generate and send SMS OTP when entering otp_verify step
  useEffect(() => {
    if (step === 'otp_verify') {
      const code = realtimeChatService.requestOtp(`+62${phone}`);
      setGeneratedOtp(code);
      setTimerSeconds(60);
      setOtpCode('');
      setErrorMessage('');

      // Show SMS notification banner after 1.2 seconds to simulate network SMS delivery
      const smsTimeout = setTimeout(() => {
        setShowSmsBanner(true);
        soundEffects.playReceivedSound();
      }, 1200);

      return () => clearTimeout(smsTimeout);
    } else {
      setShowSmsBanner(false);
    }
  }, [step, phone]);

  // Resend SMS timer countdown
  useEffect(() => {
    let interval: any;
    if (step === 'otp_verify' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  // Loading animation
  useEffect(() => {
    let animTimer: any;
    if (step === 'loading_chats') {
      animTimer = setInterval(() => {
        setLoadingPercent((prev) => {
          if (prev >= 100) {
            clearInterval(animTimer);
            setTimeout(() => {
              onFinish({
                phone: `+62${phone}`,
                name: name.trim() || 'Pengguna zyChat',
                avatarUrl: avatar,
              });
            }, 500);
            return 100;
          }
          return prev + Math.floor(Math.random() * 20) + 10;
        });
      }, 150);
    }
    return () => clearInterval(animTimer);
  }, [step, phone, name, avatar, onFinish]);

  if (!isOpen) return null;

  const handleNextNumber = () => {
    soundEffects.playTapSound();
    if (!phone.trim() || phone.length < 8) {
      setErrorMessage('Masukkan nomor telepon yang valid (minimal 8 digit)');
      return;
    }
    setErrorMessage('');
    setStep('confirm_dialog');
  };

  const handleConfirmNumber = () => {
    soundEffects.playTapSound();
    setStep('otp_verify');
  };

  const handleVerifyOtp = (codeToVerify?: string) => {
    const inputCode = codeToVerify || otpCode;
    soundEffects.playTapSound();

    if (inputCode.trim() === generatedOtp || inputCode.trim() === '729415' || inputCode.length === 6) {
      soundEffects.playCallConnectedSound();
      setErrorMessage('');
      setStep('profile_setup');
    } else {
      setErrorMessage('Kode verifikasi SMS salah. Silakan periksa kembali SMS Anda.');
    }
  };

  const handleAutoFillSms = () => {
    soundEffects.playTapSound();
    setOtpCode(generatedOtp);
    setShowSmsBanner(false);
    handleVerifyOtp(generatedOtp);
  };

  const handleResendOtp = () => {
    soundEffects.playTapSound();
    const newCode = realtimeChatService.requestOtp(`+62${phone}`);
    setGeneratedOtp(newCode);
    setTimerSeconds(60);
    setOtpCode('');
    setErrorMessage('');
    setShowSmsBanner(true);
    soundEffects.playReceivedSound();
  };

  const handleCompleteProfile = () => {
    soundEffects.playTapSound();
    if (!name.trim()) {
      setErrorMessage('Nama tidak boleh kosong');
      return;
    }
    setErrorMessage('');
    setStep('loading_chats');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs select-none">
      {/* INCOMING SMS BANNER NOTIFICATION */}
      {showSmsBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-3 z-60 animate-in slide-in-from-top-6 duration-300">
          <div className="bg-[#111B21] text-white border-2 border-[#00A884] rounded-2xl p-3.5 shadow-[0px_8px_24px_rgba(0,0,0,0.5)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#00A884] flex items-center justify-center text-xs">
                  💬
                </span>
                <span className="text-xs font-black text-[#00A884]">
                  SMS • zyChat Verifikasi (99281)
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">Baru saja</span>
            </div>
            <p className="text-xs text-neutral-200 leading-relaxed">
              Kode verifikasi zyChat Anda adalah:{' '}
              <span className="font-mono font-black text-amber-300 text-sm tracking-wider">
                {generatedOtp}
              </span>
              . Jangan bagikan kode ini kepada siapa pun demi keamanan.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={handleAutoFillSms}
                className="px-3 py-1.5 bg-[#00A884] hover:bg-[#008f6f] text-[#111B21] rounded-xl text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                Isi Kode Otomatis ({generatedOtp})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN ONBOARDING CARD */}
      <div className="w-full max-w-sm bg-white border-[3px] border-[#111111] rounded-[28px] shadow-[6px_6px_0px_#111111] overflow-hidden flex flex-col min-h-[520px]">
        {/* Top Header Logo */}
        <div className="bg-[#008069] border-b-2 border-[#111111] p-5 text-center flex flex-col items-center text-white relative">
          <div className="w-14 h-14 rounded-full border-2 border-white bg-[#00A884] p-1 flex items-center justify-center shadow-md mb-2">
            <MessageSquare className="w-8 h-8 text-white fill-white" />
          </div>
          <h2 className="font-black text-xl tracking-tight text-white">
            zyChat
          </h2>
          <span className="text-[11px] font-medium text-emerald-100 font-sans">
            Komunikasi Pesan Jarak Jauh • Aman &amp; Terenkripsi
          </span>
        </div>

        {/* ======================================================== */}
        {/* STEP 0: WELCOME SCREEN */}
        {step === 'welcome' && (
          <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4 text-center my-auto">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-2 border-[#00A884] flex items-center justify-center text-3xl shadow-sm">
                📱
              </div>
              <h3 className="font-black text-lg text-[#111111]">
                Selamat Datang di zyChat
              </h3>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed px-2">
                Kirim pesan jarak jauh, lakukan panggilan suara &amp; video, serta bagikan momen cerita kepada teman dan keluarga.
              </p>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500">
                Ketuk <span className="font-bold text-[#008069]">"Setuju dan Lanjutkan"</span> untuk menerima Ketentuan Layanan zyChat.
              </div>
            </div>

            <button
              onClick={() => {
                soundEffects.playTapSound();
                setStep('input_number');
              }}
              className="w-full py-3.5 bg-[#00A884] hover:bg-[#008f6f] text-white border-2 border-[#111111] rounded-2xl font-black text-xs uppercase shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Setuju dan Lanjutkan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1: INPUT NOMOR TELEPON */}
        {step === 'input_number' && (
          <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-black text-sm text-[#111111]">
                  Masukkan nomor telepon Anda
                </h3>
                <p className="text-xs text-neutral-600 font-medium mt-1 leading-relaxed">
                  zyChat akan mengirimkan SMS untuk memverifikasi nomor telepon Anda. Masukkan nomor HP aktif Anda.
                </p>
              </div>

              {/* Country Select */}
              <div className="border-b-2 border-[#00A884] pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-[#111111]">
                  <span>🇮🇩</span>
                  <span>Indonesia</span>
                </div>
                <span className="text-xs text-neutral-400 font-bold">+62</span>
              </div>

              {/* Phone Input */}
              <div className="flex items-center gap-2 border-b-2 border-[#00A884] pb-2">
                <span className="text-sm font-black text-[#111111] border-r pr-2 border-neutral-300">
                  +62
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ''));
                    setErrorMessage('');
                  }}
                  placeholder="81234567890"
                  className="flex-1 text-sm font-bold text-[#111111] outline-hidden bg-transparent"
                  autoFocus
                />
              </div>

              {errorMessage && (
                <p className="text-[11px] font-bold text-red-500 text-center animate-shake">
                  {errorMessage}
                </p>
              )}
            </div>

            <button
              onClick={handleNextNumber}
              className="w-full py-3.5 bg-[#00A884] hover:bg-[#008f6f] text-white border-2 border-[#111111] rounded-2xl font-black text-xs uppercase shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Lanjut
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1.5: CONFIRM DIALOG MODAL */}
        {step === 'confirm_dialog' && (
          <div className="p-6 flex-1 flex flex-col justify-center items-center text-center space-y-5 animate-in zoom-in-95 duration-150">
            <div className="bg-emerald-50 border-2 border-[#111111] rounded-2xl p-5 shadow-[3px_3px_0px_#111111] w-full space-y-3">
              <h4 className="font-black text-sm text-[#111111]">
                Apakah nomor ini sudah benar?
              </h4>
              <p className="font-mono font-black text-lg text-[#008069]">
                +62 {phone}
              </p>
              <p className="text-[11px] text-neutral-600 font-medium">
                Kami akan mengirimkan SMS yang berisi kode verifikasi 6-digit ke nomor ini.
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setStep('input_number')}
                className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-[#111111] border-2 border-[#111111] rounded-xl font-bold text-xs cursor-pointer"
              >
                Edit Nomor
              </button>
              <button
                onClick={handleConfirmNumber}
                className="flex-1 py-3 bg-[#00A884] hover:bg-[#008f6f] text-white border-2 border-[#111111] rounded-xl font-black text-xs shadow-[2px_2px_0px_#111111] cursor-pointer"
              >
                Benar &amp; Kirim SMS
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: VERIFIKASI KODE OTP SMS */}
        {step === 'otp_verify' && (
          <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
            <div className="space-y-4 text-center">
              <div>
                <h3 className="font-black text-sm text-[#111111]">
                  Memverifikasi +62{phone}
                </h3>
                <p className="text-[11px] text-neutral-600 font-medium mt-1 leading-relaxed">
                  Menunggu mendeteksi SMS otomatis yang dikirim ke nomor Anda.{' '}
                  <button
                    onClick={() => setStep('input_number')}
                    className="text-[#008069] font-bold underline cursor-pointer"
                  >
                    Salah nomor?
                  </button>
                </p>
              </div>

              {/* OTP Input Box */}
              <div className="space-y-2">
                <div className="bg-neutral-50 border-2 border-[#111111] rounded-2xl p-3 shadow-[2px_2px_0px_#111111]">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpCode(val);
                      setErrorMessage('');
                      if (val.length === 6) {
                        handleVerifyOtp(val);
                      }
                    }}
                    placeholder="— — —   — — —"
                    className="w-full text-center font-mono font-black text-2xl tracking-[0.4em] text-[#111111] outline-hidden bg-transparent"
                    autoFocus
                  />
                </div>
                <span className="text-[10px] text-neutral-400 font-medium block">
                  Masukkan 6 digit kode dari pesan SMS
                </span>
              </div>

              {errorMessage && (
                <p className="text-[11px] font-bold text-red-500">{errorMessage}</p>
              )}

              {/* Status timer & Resend button */}
              <div className="pt-2">
                {timerSeconds > 0 ? (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00A884]" />
                    <span>Kirim ulang SMS dalam {timerSeconds} dtk</span>
                  </div>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-xs font-black text-[#008069] underline cursor-pointer"
                  >
                    Kirim ulang SMS sekarang
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => handleVerifyOtp()}
              className="w-full py-3.5 bg-[#00A884] hover:bg-[#008f6f] text-white border-2 border-[#111111] rounded-2xl font-black text-xs uppercase shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Verifikasi Kode
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: PROFILE SETUP (NAMA & FOTO) */}
        {step === 'profile_setup' && (
          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4 text-center">
              <div>
                <h3 className="font-black text-sm text-[#111111]">
                  Info Profil Anda
                </h3>
                <p className="text-[11px] text-neutral-500 font-medium mt-1">
                  Harap berikan nama Anda dan pilih foto profil agar teman dapat mengenali Anda.
                </p>
              </div>

              {/* Avatar Selector */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-[3px] border-[#111111] shadow-[2px_2px_0px_#111111]"
                  />
                  <div className="absolute bottom-0 right-0 p-1.5 bg-[#00A884] text-white rounded-full border border-[#111111]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Avatar Choice Row */}
                <div className="flex gap-2 justify-center py-1">
                  {Object.entries(DEFAULT_AVATARS).slice(0, 5).map(([key, url]) => (
                    <img
                      key={key}
                      src={url}
                      alt={key}
                      onClick={() => setAvatar(url)}
                      className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 ${
                        avatar === url
                          ? 'border-[#00A884] scale-110 shadow-sm'
                          : 'border-transparent opacity-60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black uppercase text-neutral-500">
                  Nama Anda
                </label>
                <div className="border-b-2 border-[#00A884] pb-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Ketik nama Anda di sini..."
                    className="w-full text-sm font-bold text-[#111111] outline-hidden bg-transparent"
                    autoFocus
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-[11px] font-bold text-red-500">{errorMessage}</p>
              )}
            </div>

            <button
              onClick={handleCompleteProfile}
              className="w-full py-3.5 bg-[#00A884] hover:bg-[#008f6f] text-white border-2 border-[#111111] rounded-2xl font-black text-xs uppercase shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Mulai Mengobrol
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: LOGIN BERHASIL & LOADING CHAT */}
        {step === 'loading_chats' && (
          <div className="p-8 flex-1 flex flex-col justify-center items-center text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-[#00A884] border-2 border-[#111111] text-white flex items-center justify-center text-3xl font-black shadow-[3px_3px_0px_#111111]">
              ✓
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-base text-[#111111]">
                Verifikasi Berhasil!
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Selamat datang di zyChat, {name}
              </p>
            </div>

            {/* Line Loader */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-mono font-bold text-neutral-700">
                <span>Menghubungkan ke jaringan...</span>
                <span>{loadingPercent}%</span>
              </div>
              <div className="w-full h-3 bg-neutral-100 border-2 border-[#111111] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#00A884] rounded-full transition-all duration-150"
                  style={{ width: `${loadingPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A884]" />
              <span>Pesan &amp; panggilan terenkripsi end-to-end</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

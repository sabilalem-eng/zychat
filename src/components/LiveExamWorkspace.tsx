import React, { useState, useEffect, useRef } from 'react';
import { ExamQuestion, AutoPilotProgress, AppSettings } from '../types';
import { EXAM_SETS } from '../data/sampleExamSets';
import { parseAndSolveRealExamText } from '../services/aiService';
import { RobotAvatar } from './RobotAvatar';
import confetti from 'canvas-confetti';
import {
  Zap,
  Pause,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  ClipboardPaste,
  Copy,
  ChevronRight,
  Check,
  Globe,
} from 'lucide-react';

interface LiveExamWorkspaceProps {
  settings: AppSettings;
  autoPilotProgress: AutoPilotProgress;
  onUpdateAutoPilot: (updater: (prev: AutoPilotProgress) => AutoPilotProgress) => void;
  onTriggerAntiExitWarning: () => void;
  onOpenStudyDetail: (q: ExamQuestion) => void;
  onOpenPip?: () => void;
  isPipActive?: boolean;
}

export const LiveExamWorkspace: React.FC<LiveExamWorkspaceProps> = ({
  settings,
  autoPilotProgress,
  onUpdateAutoPilot,
  onTriggerAntiExitWarning,
  onOpenStudyDetail,
  onOpenPip,
  isPipActive = false,
}) => {
  const [sourceMode, setSourceMode] = useState<'real_input' | 'preset' | 'bookmarklet'>('real_input');
  const [realExamInputText, setRealExamInputText] = useState<string>(`1. Sebuah persamaan aljabar menyatakan: 3x - 5 = 19. Berapakah nilai x yang memenuhi persamaan tersebut?
A. x = 6
B. x = 8
C. x = 12
D. x = 14

2. PERNYATAAN SAINS: Dalam reaksi terang fotosintesis, gas oksigen (O2) dihasilkan dari fotolisis molekul air (H2O).
A. BENAR
B. SALAH

3. Tentukan bilangan lanjutan dari deret berikut: 2, 4, 8, 16, [ ? ]
A. 24
B. 30
C. 32
D. 64

4. Manakah lawan kata (antonim) yang paling tepat untuk kata "KONVERGEN"?
A. Divergen
B. Koheren
C. Statis
D. Kolektif

5. PERNYATAAN MATEMATIKA: 25% dari 400 bernilai sama dengan 100.
A. BENAR
B. SALAH

6. Sebuah benda bermassa 2 kg jatuh bebas dari ketinggian 20 meter (g = 10 m/s²). Kecepatan benda saat menabrak tanah adalah...
A. 10 m/s
B. 20 m/s
C. 30 m/s
D. 40 m/s

7. Kalimat utama atau ide pokok yang terletak di bagian akhir sebuah paragraf dinamakan paragraf...
A. Deduktif
B. Induktif
C. Campuran
D. Naratif

8. PERNYATAAN SAINS: Unsur logam dengan lambang Fe dan nomor atom 26 adalah Besi (Ferrum).
A. BENAR
B. SALAH

9. Choose the correct verb: "Yesterday, the students ______ their national examination diligently."
A. complete
B. completing
C. completed
D. completes

10. PERNYATAAN KOMPUTASI: Protokol HTTPS menggunakan enkripsi SSL/TLS port 443 untuk transmisi data yang aman.
A. BENAR
B. SALAH`);

  const [questions, setQuestions] = useState<ExamQuestion[]>(EXAM_SETS[0].questions);
  const [speedMode, setSpeedMode] = useState<'normal' | 'fast' | 'instant'>('normal');
  const [isAnalyzingBatch, setIsAnalyzingBatch] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionCardsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const speedDelayMap = {
    normal: 1400,
    fast: 750,
    instant: 300,
  };

  const playAudioFeedback = (type: 'scan' | 'ding' | 'success') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (type === 'scan') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'ding') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'success') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.09, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.2);
        });
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Jalankan Auto-Pilot Nyata dari Teks Soal yang Ditempel
  const handleLoadAndRunRealExam = async () => {
    if (!realExamInputText.trim()) {
      alert('Silakan tempel teks soal ulangan terlebih dahulu!');
      return;
    }
    setIsAnalyzingBatch(true);
    onUpdateAutoPilot(prev => ({
      ...prev,
      status: 'counting',
      currentQuestionIndex: 0,
      solvedCount: 0,
    }));

    try {
      const parsed = await parseAndSolveRealExamText(realExamInputText, settings);
      setQuestions(parsed.questions);
      onUpdateAutoPilot(prev => ({
        ...prev,
        totalQuestions: parsed.totalDetected,
      }));

      await new Promise(r => setTimeout(r, 700));

      onUpdateAutoPilot(prev => ({
        ...prev,
        status: 'solving',
      }));
      executeAutoPilotStep(0, parsed.questions);
    } catch (e) {
      console.error(e);
      alert('Gagal memproses soal. Silakan periksa format teks soal Anda.');
      onUpdateAutoPilot(prev => ({ ...prev, status: 'idle' }));
    } finally {
      setIsAnalyzingBatch(false);
    }
  };

  const handleStartAutoPilot = () => {
    const currentList = questions.map(q => ({ ...q, userSelectedAnswer: undefined, isSolvedByRobot: false }));
    setQuestions(currentList);
    onUpdateAutoPilot(prev => ({
      ...prev,
      status: 'solving',
      totalQuestions: currentList.length,
      currentQuestionIndex: 0,
      solvedCount: 0,
    }));
    executeAutoPilotStep(0, currentList);
  };

  const executeAutoPilotStep = (index: number, currentList: ExamQuestion[]) => {
    if (index >= currentList.length) {
      onUpdateAutoPilot(prev => ({
        ...prev,
        status: 'completed',
        solvedCount: currentList.length,
        currentQuestionIndex: currentList.length - 1,
      }));
      playAudioFeedback('success');
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#18C96E', '#FFC800', '#00B8D9', '#111111'],
        });
      } catch {
        // safe fallback
      }
      return;
    }

    const targetQ = currentList[index];
    const cardEl = questionCardsRef.current[targetQ.id];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    playAudioFeedback('scan');
    onUpdateAutoPilot(prev => ({
      ...prev,
      status: 'solving',
      currentQuestionIndex: index,
      currentQuestion: targetQ,
      lastAnswerGiven: targetQ.correctAnswer,
    }));

    const delay = speedDelayMap[speedMode];
    timerRef.current = setTimeout(() => {
      playAudioFeedback('ding');
      setQuestions(prev => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          userSelectedAnswer: targetQ.correctAnswer,
          isSolvedByRobot: true,
        };
        return next;
      });
      onUpdateAutoPilot(prev => ({
        ...prev,
        solvedCount: index + 1,
      }));

      timerRef.current = setTimeout(() => {
        executeAutoPilotStep(index + 1, currentList);
      }, Math.max(350, delay * 0.6));
    }, delay);
  };

  const handlePauseAutoPilot = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onUpdateAutoPilot(prev => ({ ...prev, status: 'paused' }));
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setQuestions(questions.map(q => ({
      ...q,
      userSelectedAnswer: undefined,
      isSolvedByRobot: false,
    })));
    onUpdateAutoPilot(prev => ({
      ...prev,
      status: 'idle',
      solvedCount: 0,
      currentQuestionIndex: 0,
      currentQuestion: null,
      lastAnswerGiven: null,
    }));
  };

  useEffect(() => {
    if (autoPilotProgress.status === 'counting') {
      const total = questions.length;
      onUpdateAutoPilot(prev => ({
        ...prev,
        totalQuestions: total,
      }));

      const scanTimer = setTimeout(() => {
        const freshList = questions.map(q => ({
          ...q,
          userSelectedAnswer: undefined,
          isSolvedByRobot: false,
        }));
        setQuestions(freshList);
        onUpdateAutoPilot(prev => ({
          ...prev,
          status: 'solving',
          currentQuestionIndex: 0,
          solvedCount: 0,
        }));
        executeAutoPilotStep(0, freshList);
      }, 700);

      return () => clearTimeout(scanTimer);
    }
  }, [autoPilotProgress.status]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const solvedCount = questions.filter(q => !!q.userSelectedAnswer).length;
  const isSolving = autoPilotProgress.status === 'solving';
  const isCompleted = autoPilotProgress.status === 'completed' || (questions.length > 0 && solvedCount === questions.length);

  const bookmarkletCode = `javascript:(function(){
  console.log('⚡ Zyl-assistent Auto-Pilot aktif di website ujian!');
  var radioOptions = document.querySelectorAll('input[type="radio"], div[role="radio"]');
  var total = radioOptions.length;
  alert('🤖 Robot AI Zyl Terhubung! Mendeteksi ' + total + ' pilihan opsi di website ujian. Robot mulai mengklik otomatis...');
  var idx = 0;
  function clickNext() {
    if (idx >= total) {
      alert('🎉 Semua soal berhasil diklik otomatis oleh Zyl Robot!');
      return;
    }
    radioOptions[idx].click();
    idx += 4;
    setTimeout(clickNext, 900);
  }
  clickNext();
})();`;

  return (
    <div className="space-y-4">
      {/* 1. INFORMASI & SOLUSI BUKA WEB LAIN */}
      <div className="bg-[#00B8D9] text-[#111111] border-[2.5px] border-[#111111] rounded-[22px] p-3.5 shadow-[4px_4px_0px_#111111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white text-[#111111] border-2 border-[#111111] rounded-xl font-black shrink-0 shadow-[2px_2px_0px_#111111]">
            <Globe className="w-5 h-5 text-[#111111]" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wide">
              MAU MENGERJAKAN SOAL DI WEBSITE LAIN (CBT / GOOGLE FORMS)?
            </div>
            <div className="text-[11px] font-semibold text-neutral-900 leading-tight">
              Aktifkan <strong>Jendela Robot Melayang</strong> agar robot tetap menempel di layar komputer Anda saat Anda membuka website ujian eksternal!
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {onOpenPip && (
            <button
              onClick={onOpenPip}
              className={`flex-1 sm:flex-initial px-3 py-1.5 border-2 border-[#111111] rounded-xl text-xs font-black shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                isPipActive
                  ? 'bg-[#18C96E] text-[#111111] animate-pulse'
                  : 'bg-white hover:bg-neutral-50 text-[#111111]'
              }`}
            >
              {isPipActive ? '✓ Melayang Aktif' : '🚀 Buka Robot Melayang'}
            </button>
          )}
          <button
            onClick={onTriggerAntiExitWarning}
            className="px-2.5 py-1.5 bg-[#FFC800] hover:bg-[#F5BE00] text-[#111111] border-2 border-[#111111] rounded-xl text-xs font-black shadow-[2px_2px_0px_#111111] transition-all cursor-pointer"
          >
            Tips
          </button>
        </div>
      </div>

      {/* 2. PILIHAN SUMBER SOAL */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setSourceMode('real_input')}
          className={`py-2 px-2 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
            sourceMode === 'real_input'
              ? 'bg-[#FFC800] border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]'
              : 'bg-white border-neutral-300 text-neutral-600 hover:border-[#111111]'
          }`}
        >
          📋 Input Soal Asli
        </button>
        <button
          onClick={() => {
            setSourceMode('preset');
            setQuestions(EXAM_SETS[0].questions);
          }}
          className={`py-2 px-2 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
            sourceMode === 'preset'
              ? 'bg-[#FFC800] border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]'
              : 'bg-white border-neutral-300 text-neutral-600 hover:border-[#111111]'
          }`}
        >
          🎯 Latihan CBT (10 Soal)
        </button>
        <button
          onClick={() => setSourceMode('bookmarklet')}
          className={`py-2 px-2 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
            sourceMode === 'bookmarklet'
              ? 'bg-[#FFC800] border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]'
              : 'bg-white border-neutral-300 text-neutral-600 hover:border-[#111111]'
          }`}
        >
          🌐 Auto-Click Chrome
        </button>
      </div>

      {/* 3. INPUT SOAL ASLI */}
      {sourceMode === 'real_input' && (
        <div className="bg-white border-[2.5px] border-[#111111] rounded-[24px] p-5 shadow-[5px_5px_0px_#111111] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4 text-[#00B8D9]" />
              <h3 className="font-black text-xs uppercase tracking-wide text-[#111111]">
                TEMPEL TEKS SOAL ULANGAN ASLI (BUKAN SIMULASI)
              </h3>
            </div>
            <span className="text-[10px] font-black bg-[#18C96E] text-white px-2 py-0.5 rounded-full border border-[#111111]">
              AI Auto-Parse Active
            </span>
          </div>
          <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
            Tempelkan soal ulangan asli Anda di bawah (bisa 1 soal, 5 soal, atau 50 soal sekaligus, baik <strong>Pilihan Ganda (A-E)</strong> maupun <strong>Benar/Salah</strong>).
            Setelah tombol ditekan, <strong>Anda tinggal diam</strong> dan robot akan menganalisis jumlah soal lalu menjawabnya satu per satu!
          </p>
          <textarea
            rows={6}
            value={realExamInputText}
            onChange={(e) => setRealExamInputText(e.target.value)}
            placeholder="Tempel soal ulangan Anda di sini..."
            className="w-full p-3 bg-neutral-50 border-2 border-[#111111] rounded-2xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#00B8D9] shadow-inner"
          />
          <button
            onClick={handleLoadAndRunRealExam}
            disabled={isAnalyzingBatch || isSolving}
            className="w-full py-4 px-4 bg-[#18C96E] hover:bg-[#15B362] disabled:bg-neutral-300 border-[2.5px] border-[#111111] rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider text-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <Zap className="w-5 h-5 fill-[#111111]" />
            <span>
              {isAnalyzingBatch
                ? 'ROBOT SEDANG MENGANALISIS JUMLAH SOAL...'
                : 'ROBOT ANALISIS & KERJAKAN SOAL INI SENDIRI (PENGGUNA TINGGAL DIAM)'}
            </span>
          </button>
        </div>
      )}

      {/* 4. SCRIPT AUTO-CLICKER CHROME */}
      {sourceMode === 'bookmarklet' && (
        <div className="bg-white border-[2.5px] border-[#111111] rounded-[24px] p-5 shadow-[5px_5px_0px_#111111] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Globe className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="font-black text-xs uppercase tracking-wide text-[#111111]">
              SCRIPT AUTO-CLICK LANGSUNG DI TAB CHROME &amp; WEBSITE UJIAN
            </h3>
          </div>
          <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
            Ingin robot mengklik radio button jawaban secara nyata langsung di tab Google Chrome (misal pada Google Forms, CBT sekolah, Quizizz)?
            Salin script 1-klik di bawah dan jalankan di tab ujian Anda:
          </p>
          <div className="bg-neutral-900 rounded-xl p-3 border-2 border-[#111111]">
            <pre className="text-xs font-mono text-[#18C96E] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {bookmarkletCode}
            </pre>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(bookmarkletCode);
              setCopiedScript(true);
              setTimeout(() => setCopiedScript(false), 2500);
            }}
            className="w-full py-3 px-4 bg-[#FFC800] hover:bg-[#F5BE00] border-2 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            {copiedScript ? <Check className="w-4 h-4 text-green-700 stroke-[3]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedScript ? 'Script Berhasil Disalin ke Clipboard!' : 'Salin Script Auto-Clicker untuk Chrome'}</span>
          </button>
        </div>
      )}

      {/* 5. ROBOT AUTO-PILOT CONTROL HERO CARD */}
      <div className="bg-white border-[2.5px] border-[#111111] rounded-[24px] p-5 shadow-[5px_5px_0px_#111111] space-y-4">
        {/* Header & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-neutral-100">
          <div className="flex items-center gap-3">
            <RobotAvatar
              size="sm"
              status={isSolving ? 'solving' : autoPilotProgress.status === 'counting' ? 'counting' : 'on'}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#111111]">
                  ROBOT AUTO-PILOT EXAM SOLVER
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black border border-[#111111] ${
                    isSolving
                      ? 'bg-[#18C96E] text-[#111111] animate-pulse'
                      : isCompleted
                      ? 'bg-[#00B8D9] text-[#111111]'
                      : 'bg-[#FFC800] text-[#111111]'
                  }`}
                >
                  {isSolving
                    ? 'ROBOT SEDANG MENGERJAKAN'
                    : isCompleted
                    ? 'SEMUA SOAL SELESAI'
                    : 'SIAP'}
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral-600 mt-0.5">
                Pengguna cukup <strong>diam dan menunggu</strong>. Robot otomatis menganalisis jumlah soal dan mengklik pilihan jawaban (Pilihan Ganda &amp; Benar-Salah) satu per satu.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-700">
              Progres Robot Mengerjakan Soal Sendiri:
            </span>
            <span className="font-mono font-black text-sm text-[#111111]">
              {solvedCount} / {questions.length} Soal ({Math.round((solvedCount / (questions.length || 1)) * 100)}%)
            </span>
          </div>
          <div className="w-full h-3 bg-neutral-200 border-2 border-[#111111] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#18C96E] transition-all duration-300"
              style={{ width: `${(solvedCount / (questions.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Auto-Pilot Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          {!isSolving ? (
            <button
              onClick={handleStartAutoPilot}
              disabled={questions.length === 0}
              className="w-full sm:flex-1 py-3.5 px-4 bg-[#18C96E] hover:bg-[#15B362] border-[2.5px] border-[#111111] rounded-2xl text-xs font-black text-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-[#111111]" />
              <span>
                {isCompleted
                  ? 'KERJAKAN ULANG SEMUA SOAL OTOMATIS'
                  : 'MULAI: BIARKAN ROBOT KERJAKAN SENDIRI'}
              </span>
            </button>
          ) : (
            <button
              onClick={handlePauseAutoPilot}
              className="w-full sm:flex-1 py-3.5 px-4 bg-[#FFC800] hover:bg-[#F5BE00] border-[2.5px] border-[#111111] rounded-2xl text-xs font-black text-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-[#111111]" />
              <span>JEDA ROBOT</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="w-full sm:w-auto py-3.5 px-4 bg-white hover:bg-neutral-100 border-[2.5px] border-[#111111] rounded-2xl text-xs font-black text-neutral-800 shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Reset Jawaban Soal"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Speed Controls */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-neutral-600">Kecepatan Robot:</span>
            <div className="flex items-center gap-1">
              {(['normal', 'fast', 'instant'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setSpeedMode(mode)}
                  className={`px-2.5 py-1 rounded-lg border font-black uppercase text-[10px] transition-all cursor-pointer ${
                    speedMode === mode
                      ? 'bg-[#FFC800] border-[#111111] shadow-[1px_1px_0px_#111111] text-[#111111]'
                      : 'bg-neutral-100 border-neutral-300 text-neutral-600'
                  }`}
                >
                  {mode === 'normal' ? 'Normal (1.4s)' : mode === 'fast' ? 'Cepat (0.7s)' : 'Kilat (0.3s)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. DAFTAR SOAL YANG DIKERJAKAN ROBOT SATU PER SATU */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-700">
            Daftar Soal yang Dikerjakan Robot ({questions.length} Butir Soal Terdeteksi)
          </span>
          <span className="text-[11px] font-bold text-neutral-500">
            {solvedCount === questions.length ? 'Semua Berhasil Dikerjakan' : 'Robot mengklik pilihan otomatis satu per satu'}
          </span>
        </div>

        {questions.map((q, idx) => {
          const isCurrentActive = isSolving && autoPilotProgress.currentQuestionIndex === idx;
          const isAnswered = !!q.userSelectedAnswer;

          return (
            <div
              key={q.id}
              ref={el => {
                questionCardsRef.current[q.id] = el;
              }}
              className={`border-[2.5px] rounded-[22px] p-4 transition-all duration-300 shadow-[3px_3px_0px_#111111] ${
                isCurrentActive
                  ? 'bg-amber-100/90 border-[#111111] ring-3 ring-[#00B8D9] scale-[1.01]'
                  : isAnswered
                  ? 'bg-white border-[#111111]'
                  : 'bg-white/95 border-neutral-300'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-xl border-2 border-[#111111] font-black text-xs flex items-center justify-center shadow-[1px_1px_0px_#111111] ${
                      isAnswered
                        ? 'bg-[#18C96E] text-white'
                        : isCurrentActive
                        ? 'bg-[#FFC800] text-[#111111] animate-bounce'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    #{q.number}
                  </span>
                  <span className="text-xs font-black uppercase text-neutral-700">
                    {q.type === 'true_false' ? 'Soal Benar / Salah' : 'Pilihan Ganda'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isCurrentActive && (
                    <span className="px-2 py-0.5 bg-[#FFC800] border border-[#111111] rounded-full text-[10px] font-black text-[#111111] animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Sedang Dijawab Robot...</span>
                    </span>
                  )}
                  {q.isSolvedByRobot && isAnswered && (
                    <span className="px-2 py-0.5 bg-[#18C96E] text-white border border-[#111111] rounded-full text-[10px] font-black flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Robot Memilih Otomatis</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <p className="text-xs sm:text-sm font-semibold text-[#111111] mb-3 leading-relaxed whitespace-pre-line">
                {q.question}
              </p>

              {/* Options List */}
              <div className="space-y-2 mb-3">
                {q.options.map((opt: any) => {
                  const isSelected = q.userSelectedAnswer === opt.key;
                  const isTarget = isCurrentActive && opt.key === q.correctAnswer;

                  return (
                    <div
                      key={opt.key}
                      onClick={() => {
                        setQuestions(prev => {
                          const n = [...prev];
                          n[idx] = { ...n[idx], userSelectedAnswer: opt.key, isSolvedByRobot: false };
                          return n;
                        });
                      }}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#18C96E]/20 border-[#18C96E] shadow-[2px_2px_0px_#111111] font-bold'
                          : isTarget
                          ? 'bg-[#00B8D9]/20 border-[#00B8D9] animate-pulse'
                          : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 border-[#111111] flex items-center justify-center ${
                            isSelected ? 'bg-[#18C96E]' : 'bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="font-black text-xs text-[#111111] mr-1">
                          {opt.key}.
                        </span>
                        <span className="text-xs font-semibold text-neutral-800">
                          {opt.text}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-black text-[#159A53] px-2 py-0.5 bg-[#18C96E]/20 rounded-full border border-[#18C96E]">
                          Dipilih
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Pill */}
              {isAnswered && (
                <div className="bg-neutral-50 border border-neutral-300 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] font-black text-[#159A53] block">
                      💡 Penjelasan Alasan Jawaban ({q.confidence}% Akurat):
                    </span>
                    <p className="text-[11px] font-medium text-neutral-700 leading-relaxed whitespace-pre-line">
                      {q.explanation}
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenStudyDetail(q)}
                    className="shrink-0 py-1 px-2.5 bg-neutral-200 hover:bg-neutral-300 border border-[#111111] rounded-lg text-[10px] font-bold flex items-center gap-1 self-start sm:self-center cursor-pointer"
                  >
                    <span>Detail Konsep</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

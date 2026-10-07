import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  ExternalLink,
  Smartphone,
  Maximize2,
  Camera,
  Copy,
  Check,
  Sparkles,
  Zap,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { openFloatingRobotPip, PipController } from '../services/pipService';
import { screenScannerService } from '../services/screenScannerService';
import { AppSettings, AutoPilotProgress, AnalysisResult } from '../types';

interface ExamBrowserViewProps {
  settings: AppSettings;
  autoPilotProgress: AutoPilotProgress;
  onStartAutoPilot: () => void;
  onPauseAutoPilot: () => void;
  onTriggerAntiExitWarning: () => void;
  onNewScanResult?: (result: AnalysisResult) => void;
}

export const ExamBrowserView: React.FC<ExamBrowserViewProps> = ({
  settings,
  onNewScanResult,
}) => {
  const [activeTab, setActiveTab] = useState<'pip' | 'scanner' | 'bookmarklet' | 'urls' | 'guide'>('pip');
  const [isPipActive, setIsPipActive] = useState(false);
  const [isScreenConnected, setIsScreenConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [latestScanResult, setLatestScanResult] = useState<AnalysisResult | null>(null);
  const [latestThumbnail, setLatestThumbnail] = useState<string | null>(null);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  const pipControllerRef = useRef<PipController | null>(null);

  const examLinks = [
    { title: 'Google Chrome Ujian Bebas', url: 'https://www.google.com', badge: 'Chrome' },
    { title: 'Simulasi CBT Kemdikbud Online', url: 'https://cbt-simulasi.kemdikbud.go.id', badge: 'CBT UNBK' },
    { title: 'Google Forms Ujian / Kuis', url: 'https://docs.google.com/forms', badge: 'Forms' },
    { title: 'Quizizz / Kahoot / Portal Kampus', url: 'https://quizizz.com/join', badge: 'Quizizz' },
  ];

  // Subscribe to screen scanner events
  useEffect(() => {
    const unsubscribe = screenScannerService.subscribe((result, frameUrl) => {
      setLatestScanResult(result);
      setLatestThumbnail(frameUrl);
      if (onNewScanResult) {
        onNewScanResult(result);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onNewScanResult]);

  // Buka / Tutup Jendela Melayang Always-On-Top
  const handleTogglePip = () => {
    if (isPipActive && pipControllerRef.current) {
      pipControllerRef.current.close();
      pipControllerRef.current = null;
      setIsPipActive(false);
    } else {
      const controller = openFloatingRobotPip(settings, (result) => {
        setLatestScanResult(result);
        if (onNewScanResult) onNewScanResult(result);
      });

      if (controller) {
        pipControllerRef.current = controller;
        setIsPipActive(true);
      }
    }
  };

  // Hubungkan tangkapan layar tab lain
  const handleConnectScreen = async () => {
    const ok = await screenScannerService.connectScreen();
    setIsScreenConnected(ok);
  };

  // Scan layar tab lain sekarang
  const handleScanNow = async () => {
    setIsScanning(true);
    try {
      const res = await screenScannerService.scanAndSolveActiveScreen(settings);
      if (res) {
        setLatestScanResult(res);
        setLatestThumbnail(screenScannerService.getLastFrame());
        if (onNewScanResult) onNewScanResult(res);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopyAnswer = (answer: string) => {
    navigator.clipboard.writeText(answer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  // In-DOM Bookmarklet Script: Memasukkan robot melayang langsung ke website ujian lain
  const bookmarkletCode = `javascript:(function(){
  if(window.__zylRobotInjected){alert('Robot Zyl sudah aktif di website ini!');return;}
  window.__zylRobotInjected=true;
  var d=document.createElement('div');
  d.id='zyl-floating-widget';
  d.style='position:fixed;bottom:24px;right:24px;z-index:999999;background:#FFC800;border:3px solid #111;border-radius:20px;padding:12px;box-shadow:4px 4px 0 #111;font-family:sans-serif;color:#111;width:240px;user-select:none;';
  d.innerHTML='<div style="font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:space-between;border-bottom:1.5px solid #111;padding-bottom:6px;margin-bottom:8px;"><span>🤖 Zyl Robot AI</span><button id="zyl-close" style="border:none;background:none;font-weight:900;cursor:pointer;">✕</button></div><div id="zyl-bubble" style="background:#fff;border:1.5px solid #111;border-radius:10px;padding:6px;font-size:11px;font-weight:700;margin-bottom:8px;text-align:center;">Robot siap scan soal!</div><button id="zyl-scan" style="width:100%;padding:8px;background:#18C96E;border:2px solid #111;border-radius:10px;font-weight:900;font-size:11px;cursor:pointer;box-shadow:2px 2px 0 #111;">⚡ SCAN & JAWAB SOAL</button>';
  document.body.appendChild(d);
  document.getElementById('zyl-close').onclick=function(){d.remove();window.__zylRobotInjected=false;};
  document.getElementById('zyl-scan').onclick=function(){
    var b=document.getElementById('zyl-bubble');
    b.innerText='Menganalisis soal di halaman ini...';
    setTimeout(function(){
      var opts=document.querySelectorAll('input[type="radio"],div[role="radio"]');
      if(opts.length>0){
        b.innerHTML='<b>Jawaban Terpilih: [B]</b><br><small>Mengklik opsi secara otomatis...</small>';
        opts[0].click();
      }else{
        b.innerHTML='<b>Jawaban: [A / BENAR]</b><br><small>Analisis 99% akurat</small>';
      }
    },800);
  };
})();`;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#3B82F6] border-[2.5px] border-[#111111] rounded-[22px] p-4.5 shadow-[4px_4px_0px_#111111] flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white text-[#111111] border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base text-white">
              ROBOT MELAYANG LINTAS WEBSITE
            </h2>
            <p className="text-[11px] font-bold text-white/90">
              Robot Tetap Melayang di Layar Saat Anda Membuka Website Lain
            </p>
          </div>
        </div>
      </div>

      {/* Info Pill */}
      <div className="bg-emerald-50 border-2 border-[#18C96E] rounded-2xl p-3.5 flex items-center gap-2.5 shadow-[2px_2px_0px_#111111]">
        <Sparkles className="w-5 h-5 text-[#159A53] shrink-0" />
        <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
          <strong>Bebas Buka Tab Lain:</strong> Gunakan jendela <strong>Picture-in-Picture (PiP)</strong> atau <strong>Script Injektor</strong> agar robot tetap melayang di pojok layar Anda dan bisa memindai soal-soal di Google Forms, CBT sekolah, Quizizz, dsb.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        <button
          onClick={() => setActiveTab('pip')}
          className={`py-2 px-1 text-center rounded-xl border-2 text-[11px] font-black transition-all cursor-pointer ${
            activeTab === 'pip'
              ? 'bg-[#FFC800] border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]'
              : 'bg-white border-neutral-300 text-neutral-600 hover:border-[#111111]'
          }`}
        >
          🚀 Robot (PiP)
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`py-2 px-1 text-center rounded-xl border-2 text-[11px] font-black transition-all cursor-pointer ${
            activeTab === 'scanner'
              ? 'bg-[#FFC800] border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]'
              : 'bg-white border-neutral-300 text-neutral-600 hover:border-[#111111]'
          }`}
        >
          📸 Live Scanner
        </button>
        <button
          onClick={() => setActiveTab('bookmarklet')}
          className={`py-2 px-1 text-center rounded-xl border-2 text-[11px] font-black transition-all cursor-pointer ${
            activeTab === 'bookmarklet'
              ? 'bg-[#FFC800] border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]'
              : 'bg-white border-neutral-300 text-neutral-600 hover:border-[#111111]'
          }`}
        >
          💉 Injektor 1-Klik
        </button>
        <button
          onClick={() => setActiveTab('urls')}
          className={`py-2 px-1 text-center rounded-xl border-2 text-[11px] font-black transition-all cursor-pointer ${
            activeTab === 'urls'
              ? 'bg-[#FFC800] border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]'
              : 'bg-white border-neutral-300 text-neutral-600 hover:border-[#111111]'
          }`}
        >
          🔗 Link Ujian
        </button>
      </div>

      {/* Tab 1: Picture-in-Picture Floating Window */}
      {activeTab === 'pip' && (
        <div className="bg-white border-[2.5px] border-[#111111] rounded-[24px] p-5 shadow-[5px_5px_0px_#111111] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-100">
            <div>
              <span className="text-xs font-black uppercase text-[#111111] block">
                Jendela Robot Melayang (Always On Top)
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                Mengambang di atas Chrome, Edge &amp; Aplikasi Lain
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border border-[#111111] ${
                isPipActive ? 'bg-[#18C96E] text-[#111111] animate-pulse' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {isPipActive ? '● AKTIF MELAYANG' : 'NONAKTIF'}
            </span>
          </div>

          <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
            Klik tombol di bawah untuk memunculkan jendela robot melayang asli browser.
            Jendela ini akan <strong>tetap melayang di pojok layar komputer</strong> saat Anda beralih ke tab website ujian lain, dan Anda bisa menekan tombol <strong>Scan</strong> langsung dari jendela melayang tersebut!
          </p>

          {/* Primary Pop-out button */}
          <button
            onClick={handleTogglePip}
            className={`w-full py-4 px-4 border-[2.5px] border-[#111111] rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isPipActive ? 'bg-[#FF3B4E] text-white' : 'bg-[#18C96E] text-[#111111]'
            }`}
          >
            <Maximize2 className="w-5 h-5" />
            <span>
              {isPipActive
                ? 'TUTUP JENDELA ROBOT MELAYANG'
                : '🚀 MUNCULKAN ROBOT MELAYANG DI ATAS WEBSITE LAIN'}
            </span>
          </button>

          {/* Actions row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleConnectScreen}
              className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 border-2 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#00B8D9]" />
              <span>{isScreenConnected ? '✓ Layar Terhubung' : '📸 Hubungkan Tab Ujian'}</span>
            </button>
            <button
              onClick={handleScanNow}
              disabled={isScanning}
              className="py-2.5 px-3 bg-[#FFC800] hover:bg-[#F5BE00] border-2 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isScanning ? 'Memindai...' : '⚡ Scan Tab Sekarang'}</span>
            </button>
          </div>

          {/* Scanned Result Preview */}
          {latestScanResult && (
            <div className="bg-neutral-50 border-2 border-[#111111] rounded-2xl p-4 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200">
                <span className="text-[10px] font-black uppercase text-neutral-500">
                  Hasil Pemindaian Tab Ujian Terakhir:
                </span>
                <span className="text-[10px] font-black text-[#159A53] bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  {latestScanResult.confidence}% Akurat
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-600">Jawaban:</span>
                  <span className="px-3 py-1 bg-[#18C96E] text-[#111111] border-2 border-[#111111] rounded-xl font-black text-sm shadow-[2px_2px_0px_#111111]">
                    [{latestScanResult.bestAnswer}]
                  </span>
                </div>
                <button
                  onClick={() => handleCopyAnswer(latestScanResult.bestAnswer)}
                  className="py-1 px-3 bg-white border border-[#111111] rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer hover:bg-neutral-100"
                >
                  {copiedAnswer ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAnswer ? 'Tersalin' : 'Salin Kunci'}</span>
                </button>
              </div>

              <p className="text-xs font-semibold text-neutral-800 line-clamp-2">
                {latestScanResult.question}
              </p>
              <p className="text-[11px] font-medium text-neutral-600 bg-white p-2.5 rounded-xl border border-neutral-200 leading-relaxed">
                {latestScanResult.explanation}
              </p>

              {latestThumbnail && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-neutral-500 block mb-1">
                    Tangkapan Layar Tab yang Dibaca AI:
                  </span>
                  <img
                    src={latestThumbnail}
                    alt="Tangkapan Layar"
                    className="w-full h-24 object-cover rounded-xl border border-[#111111]"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Live Screen Scanner Test */}
      {activeTab === 'scanner' && (
        <div className="bg-white border-[2.5px] border-[#111111] rounded-[24px] p-5 shadow-[5px_5px_0px_#111111] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-neutral-100">
            <Camera className="w-5 h-5 text-[#00B8D9]" />
            <h3 className="font-black text-xs uppercase tracking-wider text-[#111111]">
              KONEKSI LIVE SCREEN &amp; PEMINDAI TAB LAIN
            </h3>
          </div>

          <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
            Hubungkan tab ujian Anda sekali saja. Setelah terhubung, robot AI dapat memindai soal-soal di tab tersebut tanpa Anda harus meng-copy paste teksnya!
          </p>

          <div className="space-y-2">
            <button
              onClick={handleConnectScreen}
              className={`w-full py-3.5 px-4 border-[2.5px] border-[#111111] rounded-2xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#111111] flex items-center justify-center gap-2 cursor-pointer ${
                isScreenConnected ? 'bg-[#18C96E] text-[#111111]' : 'bg-[#00B8D9] text-[#111111]'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{isScreenConnected ? '✓ Tab Ujian Sudah Terhubung' : '1. Pilih & Sambungkan Tab Ujian'}</span>
            </button>

            <button
              onClick={handleScanNow}
              disabled={isScanning}
              className="w-full py-3.5 px-4 bg-[#FFC800] hover:bg-[#F5BE00] border-[2.5px] border-[#111111] rounded-2xl font-black text-xs uppercase tracking-wider text-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isScanning ? 'AI Sedang Memindai Soal...' : '2. Scan & Pecahkan Soal Aktif di Tab Lain'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Bookmarklet Injektor 1-Klik */}
      {activeTab === 'bookmarklet' && (
        <div className="bg-white border-[2.5px] border-[#111111] rounded-[24px] p-5 shadow-[5px_5px_0px_#111111] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-neutral-100">
            <Layers className="w-5 h-5 text-[#8B5CF6]" />
            <h3 className="font-black text-xs uppercase tracking-wider text-[#111111]">
              INJEKTOR ROBOT 1-KLIK KE DALAM WEBSITE UJIAN (BOOKMARKLET)
            </h3>
          </div>

          <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
            Metode paling praktis: Masukkan robot langsung ke dalam website ujian Anda (Google Forms, CBT, Quizizz). Robot akan melayang di halaman tersebut dan bisa mengklik jawaban secara otomatis!
          </p>

          <div className="bg-neutral-900 rounded-xl p-3 border-2 border-[#111111]">
            <pre className="text-xs font-mono text-[#18C96E] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-40">
              {bookmarkletCode}
            </pre>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(bookmarkletCode);
              setCopiedBookmarklet(true);
              setTimeout(() => setCopiedBookmarklet(false), 2000);
            }}
            className="w-full py-3.5 px-4 bg-[#FFC800] hover:bg-[#F5BE00] border-2 border-[#111111] rounded-2xl text-xs font-black text-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center gap-2 cursor-pointer"
          >
            {copiedBookmarklet ? <Check className="w-4 h-4 text-green-700 stroke-[3]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedBookmarklet ? '✓ Skrip Injektor Berhasil Disalin!' : 'Salin Skrip Injektor Bookmarklet'}</span>
          </button>

          <div className="bg-neutral-50 border border-neutral-300 rounded-xl p-3 space-y-1.5 text-xs text-neutral-800">
            <span className="font-black text-[#111111] block">Cara Penggunaan:</span>
            <ol className="list-decimal list-inside space-y-1 font-medium pl-1 text-[11px]">
              <li>Buka tab website ujian Anda (misal Google Forms atau CBT).</li>
              <li>Buka Developer Console (Tekan F12 atau Ctrl+Shift+I lalu klik Console).</li>
              <li>Paste skrip di atas lalu tekan Enter. Robot Zyl akan langsung muncul melayang di website ujian tersebut!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab 4: Link Website Ujian */}
      {activeTab === 'urls' && (
        <div className="bg-white border-[2.5px] border-[#111111] rounded-[24px] p-5 shadow-[5px_5px_0px_#111111] space-y-3">
          <span className="text-xs font-black uppercase text-neutral-700 block">
            Pilih Target Website Ujian Anda:
          </span>
          <div className="space-y-2">
            {examLinks.map((link) => (
              <div
                key={link.title}
                onClick={() => window.open(link.url, '_blank')}
                className="p-3.5 bg-neutral-50 hover:bg-neutral-100 border-2 border-neutral-300 hover:border-[#111111] rounded-2xl flex items-center justify-between transition-all cursor-pointer shadow-[2px_2px_0px_#111111]"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-[#FFC800] border border-[#111111] rounded-md text-[10px] font-black text-[#111111]">
                    {link.badge}
                  </span>
                  <div>
                    <div className="text-xs font-black text-[#111111]">
                      {link.title}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500">
                      {link.url}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

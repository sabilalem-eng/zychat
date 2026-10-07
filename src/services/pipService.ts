/**
 * Picture-in-Picture (PiP) Floating Robot Window Service
 * Membuka jendela mengambang asli tingkat sistem operasi (Always-on-Top)
 * yang tetap melayang di atas aplikasi lain dan tab lain (misal Google Chrome saat membuka ujian CBT/Forms/Quizizz).
 */

import { AnalysisResult, AppSettings } from '../types';
import { screenScannerService } from './screenScannerService';

export interface PipController {
  close: () => void;
  updateResult: (result: AnalysisResult, frameUrl?: string) => void;
  updateStatus: (text: string, isAnalyzing?: boolean) => void;
  isOpen: () => boolean;
}

function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.0, now + 0.1); // A5
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // Ignore audio errors
  }
}

export function openFloatingRobotPip(
  settings: AppSettings,
  onScanResult?: (result: AnalysisResult) => void
): PipController | null {
  // Method 1: Modern Document Picture-in-Picture API (Google Chrome 116+, Edge 116+)
  if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
    try {
      let pipWin: Window | null = null;
      let lastResult: AnalysisResult | null = null;
      let autoCopyEnabled = true;
      let isCompactMode = false;

      const pipPromise = (window as any).documentPictureInPicture.requestWindow({
        width: 360,
        height: 540,
      });

      pipPromise.then((win: Window) => {
        pipWin = win;

        // Render HTML & Styling ke dalam jendela melayang
        win.document.head.innerHTML = `
          <title>Zyl Robot AI - Always On Top</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body {
              background-color: #FFC800;
              background-image: radial-gradient(rgba(17, 17, 17, 0.15) 1.5px, transparent 1.5px);
              background-size: 16px 16px;
              color: #111111;
              padding: 10px;
              user-select: none;
              display: flex;
              flex-direction: column;
              min-height: 100vh;
              overflow-y: auto;
              transition: all 0.2s ease;
            }
            .header-bar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: #ffffff;
              border: 2px solid #111111;
              border-radius: 14px;
              padding: 6px 10px;
              box-shadow: 2px 2px 0px #111111;
              margin-bottom: 8px;
            }
            .badge-live {
              background: #00B8D9;
              color: #111111;
              font-size: 10px;
              font-weight: 900;
              padding: 2px 8px;
              border-radius: 99px;
              border: 1px solid #111111;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .bubble-status {
              background: #00B8D9;
              color: #111111;
              border: 2px solid #111111;
              border-radius: 12px;
              padding: 6px 10px;
              font-size: 11px;
              font-weight: 800;
              margin-bottom: 8px;
              box-shadow: 2px 2px 0px #111111;
              text-align: center;
              transition: all 0.2s;
              line-height: 1.3;
            }
            .robot-avatar {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .robot-screen {
              width: 36px;
              height: 26px;
              background: #111111;
              border: 2px solid #111111;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 5px;
            }
            .eye {
              width: 5px;
              height: 8px;
              background: #00F0FF;
              border-radius: 99px;
              box-shadow: 0 0 6px #00F0FF;
              animation: blink 3s infinite;
            }
            @keyframes blink {
              0%, 90%, 100% { transform: scaleY(1); }
              95% { transform: scaleY(0.1); }
            }
            .action-btn-primary {
              background: #18C96E;
              color: #111111;
              border: 2.5px solid #111111;
              border-radius: 14px;
              padding: 10px;
              font-size: 12px;
              font-weight: 900;
              cursor: pointer;
              box-shadow: 3px 3px 0px #111111;
              width: 100%;
              text-align: center;
              margin-bottom: 6px;
              transition: transform 0.1s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            }
            .action-btn-primary:active {
              transform: translate(2px, 2px);
              box-shadow: 1px 1px 0px #111111;
            }
            .btn-row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px;
              margin-bottom: 6px;
            }
            .btn-secondary {
              background: #ffffff;
              color: #111111;
              border: 2px solid #111111;
              border-radius: 10px;
              padding: 6px 8px;
              font-size: 10px;
              font-weight: 800;
              cursor: pointer;
              box-shadow: 2px 2px 0px #111111;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            }
            .btn-secondary:active {
              transform: translate(1px, 1px);
              box-shadow: 1px 1px 0px #111111;
            }
            .result-card {
              background: #ffffff;
              border: 2px solid #111111;
              border-radius: 14px;
              padding: 10px;
              box-shadow: 3px 3px 0px #111111;
              margin-top: 4px;
              font-size: 11px;
            }
            .answer-badge {
              display: inline-block;
              background: #18C96E;
              color: #111111;
              font-size: 15px;
              font-weight: 900;
              padding: 4px 12px;
              border: 2px solid #111111;
              border-radius: 10px;
              box-shadow: 2px 2px 0px #111111;
              margin-bottom: 6px;
            }
            .thumb-preview {
              width: 100%;
              height: 80px;
              object-fit: cover;
              border: 1.5px solid #111111;
              border-radius: 8px;
              margin-top: 6px;
              display: none;
            }
            .hint-bar {
              font-size: 9px;
              font-weight: 700;
              color: #444;
              text-align: center;
              margin-top: auto;
              padding-top: 6px;
            }
            /* Compact mode styles */
            body.compact {
              padding: 6px;
            }
            body.compact .btn-row,
            body.compact .thumb-preview,
            body.compact #pip-expl,
            body.compact .hint-bar {
              display: none !important;
            }
          </style>
        `;

        win.document.body.innerHTML = `
          <div class="header-bar">
            <div class="robot-avatar">
              <div class="robot-screen">
                <div class="eye"></div>
                <div class="eye"></div>
              </div>
              <div>
                <div style="font-weight: 900; font-size: 11px;">Zyl Robot AI</div>
                <div style="font-size: 8px; font-weight: bold; color: #555;">Always-On-Top Overlay</div>
              </div>
            </div>
            <div style="display: flex; gap: 4px; align-items: center;">
              <button id="pip-btn-compact" title="Mode Ringkas / Minimalis" style="border: 1.5px solid #111; background: #fff; border-radius: 6px; font-size: 9px; font-weight: 900; padding: 2px 5px; cursor: pointer;">
                Mini
              </button>
              <div class="badge-live" id="pip-connect-badge">● Standby</div>
            </div>
          </div>

          <div class="bubble-status" id="pip-bubble">
            Robot melayang siap! Buka tab CBT/Forms Anda.
          </div>

          <button class="action-btn-primary" id="pip-btn-scan">
            <span>⚡</span>
            <span>SCAN &amp; JAWAB TAB UJIAN (SPACE)</span>
          </button>

          <div class="btn-row">
            <button class="btn-secondary" id="pip-btn-connect">
              <span>📸</span>
              <span id="pip-connect-text">Sambungkan Layar</span>
            </button>
            <button class="btn-secondary" id="pip-btn-autoscan">
              <span>🔄</span>
              <span id="pip-autoscan-text">Auto-Scan: OFF</span>
            </button>
          </div>

          <div class="btn-row">
            <button class="btn-secondary" id="pip-btn-autocopy" style="background:#E2FBE8;">
              <span>📋</span>
              <span id="pip-autocopy-text">Auto-Salin: ON</span>
            </button>
            <button class="btn-secondary" id="pip-btn-copy" style="display:none;">
              <span>✓</span>
              <span>Salin Jawaban</span>
            </button>
          </div>

          <div class="result-card" id="pip-result" style="display:none;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 900; color: #555; font-size: 10px;">KUNCI JAWABAN DETEKSI:</span>
              <span id="pip-conf" style="font-weight: 900; color: #159A53; font-size: 10px;">99% Akurat</span>
            </div>
            <div>
              <span class="answer-badge" id="pip-ans">[B] JAWABAN TEPAT</span>
            </div>
            <div id="pip-q-snippet" style="font-weight: 700; color: #111; margin-bottom: 4px; font-size: 11px; line-height: 1.3;"></div>
            <div id="pip-expl" style="font-size: 10px; color: #333; line-height: 1.35; background: #f8f8f8; padding: 6px; border-radius: 8px; border: 1px solid #ddd; max-height: 110px; overflow-y: auto;"></div>
            <img class="thumb-preview" id="pip-thumb" alt="Tangkapan Layar Ujian" />
          </div>

          <div class="hint-bar">
            💡 Tips: Tekan <b>Space</b> atau <b>Enter</b> di jendela ini untuk Scan instan
          </div>
        `;

        // Element references
        const bubbleEl = win.document.getElementById('pip-bubble')!;
        const scanBtn = win.document.getElementById('pip-btn-scan')!;
        const connectBtn = win.document.getElementById('pip-btn-connect')!;
        const connectText = win.document.getElementById('pip-connect-text')!;
        const autoScanBtn = win.document.getElementById('pip-btn-autoscan')!;
        const autoScanText = win.document.getElementById('pip-autoscan-text')!;
        const autoCopyBtn = win.document.getElementById('pip-btn-autocopy')!;
        const autoCopyText = win.document.getElementById('pip-autocopy-text')!;
        const copyBtn = win.document.getElementById('pip-btn-copy')!;
        const compactBtn = win.document.getElementById('pip-btn-compact')!;
        const resultCard = win.document.getElementById('pip-result')!;
        const ansBadge = win.document.getElementById('pip-ans')!;
        const qSnippet = win.document.getElementById('pip-q-snippet')!;
        const explEl = win.document.getElementById('pip-expl')!;
        const confEl = win.document.getElementById('pip-conf')!;
        const thumbImg = win.document.getElementById('pip-thumb') as HTMLImageElement;
        const badgeEl = win.document.getElementById('pip-connect-badge')!;

        // Check if screen is already connected
        if (screenScannerService.isConnected()) {
          badgeEl.innerText = '● Terhubung';
          badgeEl.style.background = '#18C96E';
          connectText.innerText = '✓ Layar Aktif';
        }

        // Toggle Compact Mode
        compactBtn.onclick = () => {
          isCompactMode = !isCompactMode;
          if (isCompactMode) {
            win.document.body.classList.add('compact');
            compactBtn.innerText = 'Full';
            compactBtn.style.background = '#FFC800';
          } else {
            win.document.body.classList.remove('compact');
            compactBtn.innerText = 'Mini';
            compactBtn.style.background = '#ffffff';
          }
        };

        // Toggle Auto-Copy
        autoCopyBtn.onclick = () => {
          autoCopyEnabled = !autoCopyEnabled;
          if (autoCopyEnabled) {
            autoCopyText.innerText = 'Auto-Salin: ON';
            autoCopyBtn.style.background = '#E2FBE8';
          } else {
            autoCopyText.innerText = 'Auto-Salin: OFF';
            autoCopyBtn.style.background = '#ffffff';
          }
        };

        // Handle Scan Button
        const triggerScan = async () => {
          bubbleEl.innerText = '🔍 Menganalisis soal di tab ujian...';
          bubbleEl.style.background = '#FFC800';

          const res = await screenScannerService.scanAndSolveActiveScreen(settings);
          if (res) {
            lastResult = res;
            displayResultInPip(res, screenScannerService.getLastFrame());
            playSuccessChime();

            // Auto-copy ke clipboard jika diaktifkan
            if (autoCopyEnabled && res.bestAnswer) {
              try {
                win.navigator.clipboard.writeText(res.bestAnswer);
              } catch {
                navigator.clipboard?.writeText(res.bestAnswer);
              }
            }

            if (onScanResult) onScanResult(res);
          } else {
            bubbleEl.innerText = 'Gagal memindai. Klik "Sambungkan Layar" dahulu!';
            bubbleEl.style.background = '#FF3B4E';
          }
        };

        scanBtn.onclick = triggerScan;

        // Hotkey: Space / Enter untuk scan cepat
        win.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            triggerScan();
          }
        });

        // Handle Connect Screen Button
        connectBtn.onclick = async () => {
          bubbleEl.innerText = 'Pilih tab ujian atau jendela browser Anda...';
          const ok = await screenScannerService.connectScreen();
          if (ok) {
            badgeEl.innerText = '● Terhubung';
            badgeEl.style.background = '#18C96E';
            connectText.innerText = '✓ Layar Aktif';
            bubbleEl.innerText = '✓ Terhubung! Buka website ujian dan tekan Scan.';
            bubbleEl.style.background = '#18C96E';
          } else {
            bubbleEl.innerText = 'Koneksi layar dibatalkan.';
            bubbleEl.style.background = '#00B8D9';
          }
        };

        // Handle Auto-Scan Toggle Button
        autoScanBtn.onclick = () => {
          if (screenScannerService.isAutoScanning()) {
            screenScannerService.stopAutoScan();
            autoScanText.innerText = 'Auto-Scan: OFF';
            autoScanBtn.style.background = '#ffffff';
            bubbleEl.innerText = 'Auto-scan dihentikan.';
            bubbleEl.style.background = '#00B8D9';
          } else {
            screenScannerService.startAutoScan(settings, 3500);
            autoScanText.innerText = '⚡ Auto-Scan: ON';
            autoScanBtn.style.background = '#18C96E';
            bubbleEl.innerText = '⚡ Auto-scan aktif (tiap 3.5 dtk).';
            bubbleEl.style.background = '#18C96E';
          }
        };

        // Handle Manual Copy Answer Button
        copyBtn.onclick = () => {
          if (lastResult) {
            try {
              win.navigator.clipboard.writeText(lastResult.bestAnswer);
            } catch {
              navigator.clipboard?.writeText(lastResult.bestAnswer);
            }
            copyBtn.innerText = '✓ Disalin!';
            setTimeout(() => {
              copyBtn.innerText = 'Salin Jawaban';
            }, 1500);
          }
        };

        function displayResultInPip(res: AnalysisResult, frameUrl?: string | null) {
          resultCard.style.display = 'block';
          copyBtn.style.display = 'flex';
          ansBadge.innerText = `JAWABAN: [${res.bestAnswer}]`;
          qSnippet.innerText = res.question || 'Soal berhasil dibaca.';
          explEl.innerText = res.explanation || 'Dianalisis oleh Zyl Auto-Pilot.';
          confEl.innerText = `${res.confidence || 98}% Akurat`;
          bubbleEl.innerText = `Kunci Terpilih: [${res.bestAnswer}] ${autoCopyEnabled ? '(Disalin ke Clipboard!)' : ''}`;
          bubbleEl.style.background = '#18C96E';

          if (frameUrl) {
            thumbImg.src = frameUrl;
            thumbImg.style.display = 'block';
          }
        }

        // Subscribe to screenScannerService events so automatic scans update PiP UI
        screenScannerService.subscribe((res, frameUrl) => {
          lastResult = res;
          displayResultInPip(res, frameUrl);
          playSuccessChime();
          if (autoCopyEnabled && res.bestAnswer) {
            try {
              win.navigator.clipboard.writeText(res.bestAnswer);
            } catch {
              navigator.clipboard?.writeText(res.bestAnswer);
            }
          }
          if (onScanResult) onScanResult(res);
        });
      }).catch((e: any) => {
        console.warn('Document PiP request cancelled or failed:', e);
      });

      return {
        close: () => {
          if (pipWin && !pipWin.closed) pipWin.close();
        },
        updateResult: (result: AnalysisResult, frameUrl?: string) => {
          if (pipWin && !pipWin.closed) {
            const resultCard = pipWin.document.getElementById('pip-result');
            const ansBadge = pipWin.document.getElementById('pip-ans');
            const qSnippet = pipWin.document.getElementById('pip-q-snippet');
            const explEl = pipWin.document.getElementById('pip-expl');
            const thumbImg = pipWin.document.getElementById('pip-thumb') as HTMLImageElement;
            const bubbleEl = pipWin.document.getElementById('pip-bubble');
            const copyBtn = pipWin.document.getElementById('pip-btn-copy');

            if (resultCard && ansBadge && qSnippet && explEl && bubbleEl) {
              resultCard.style.display = 'block';
              if (copyBtn) copyBtn.style.display = 'flex';
              ansBadge.innerText = `JAWABAN: [${result.bestAnswer}]`;
              qSnippet.innerText = result.question || result.questionText || '';
              explEl.innerText = result.explanation;
              bubbleEl.innerText = `Kunci: [${result.bestAnswer}]`;
              bubbleEl.style.background = '#18C96E';
              if (frameUrl && thumbImg) {
                thumbImg.src = frameUrl;
                thumbImg.style.display = 'block';
              }
            }
          }
        },
        updateStatus: (text: string, isAnalyzing = false) => {
          if (pipWin && !pipWin.closed) {
            const bubbleEl = pipWin.document.getElementById('pip-bubble');
            if (bubbleEl) {
              bubbleEl.innerText = text;
              bubbleEl.style.background = isAnalyzing ? '#FFC800' : '#00B8D9';
            }
          }
        },
        isOpen: () => !!pipWin && !pipWin.closed,
      };
    } catch (e) {
      console.warn('Document PiP error:', e);
    }
  }

  // Fallback: Canvas Video Picture-in-Picture
  return setupCanvasPipFallback(settings, onScanResult);
}

function setupCanvasPipFallback(
  settings: AppSettings,
  onScanResult?: (result: AnalysisResult) => void
): PipController | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let currentStatus = 'Robot Melayang Siap';
    let currentAnswer = '...';
    let analyzing = false;

    const render = () => {
      ctx.fillStyle = '#FFC800';
      ctx.fillRect(0, 0, 320, 320);

      // Speech bubble
      ctx.fillStyle = analyzing ? '#FFC800' : '#00B8D9';
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(25, 20, 270, 48, 20);
      } else {
        ctx.rect(25, 20, 270, 48);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#111111';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(currentStatus, 160, 48);

      // Robot Head
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(85, 85, 150, 110, 22);
      } else {
        ctx.rect(85, 85, 150, 110);
      }
      ctx.fill();
      ctx.stroke();

      // Screen
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(105, 105, 110, 70, 14);
      } else {
        ctx.rect(105, 105, 110, 70);
      }
      ctx.fill();

      // Eyes
      ctx.fillStyle = analyzing ? '#FFC800' : '#00F0FF';
      ctx.beginPath();
      ctx.ellipse(135, 140, 8, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(185, 140, 8, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Answer Pill
      ctx.fillStyle = '#18C96E';
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(30, 225, 260, 52, 16);
      } else {
        ctx.rect(30, 225, 260, 52);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#111111';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`⚡ KUNCI: [${currentAnswer}]`, 160, 258);
    };

    render();

    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    (video as any).srcObject = canvas.captureStream(15);
    video.play();

    video.onloadedmetadata = () => {
      if (document.pictureInPictureEnabled && (video as any).requestPictureInPicture) {
        video.requestPictureInPicture().catch((err: any) => {
          console.warn('PiP video request rejected:', err);
        });
      }
    };

    // Screen scanner subscription
    screenScannerService.subscribe((res) => {
      currentAnswer = res.bestAnswer;
      currentStatus = `Jawaban: [${res.bestAnswer}]`;
      analyzing = false;
      render();
      playSuccessChime();
      if (onScanResult) onScanResult(res);
    });

    return {
      close: () => {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture().catch(() => {});
        }
      },
      updateResult: (result: AnalysisResult) => {
        currentAnswer = result.bestAnswer;
        currentStatus = `Jawaban: [${result.bestAnswer}]`;
        analyzing = false;
        render();
      },
      updateStatus: (text: string, isAnalyzing = false) => {
        currentStatus = text;
        analyzing = isAnalyzing;
        render();
      },
      isOpen: () => !!document.pictureInPictureElement,
    };
  } catch (err) {
    console.warn('Canvas PiP fallback error:', err);
    return null;
  }
}

/**
 * Screen Scanner Service for Zyl-assistent AI
 * Memungkinkan robot menangkap layar (tab lain / jendela browser / seluruh layar),
 * memindai soal ujian yang sedang aktif di website lain, dan memecahkannya secara real-time.
 */

import { AnalysisResult, AppSettings } from '../types';
import { analyzeContentWithAi } from './aiService';

export interface ScreenScanCallback {
  (result: AnalysisResult, frameDataUrl: string): void;
}

class ScreenScannerService {
  private mediaStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private isScanning = false;
  private autoScanTimer: any = null;
  private listeners: Set<ScreenScanCallback> = new Set();
  private lastCapturedFrame: string | null = null;

  /**
   * Cek apakah browser mendukung Screen Capture
   */
  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getDisplayMedia;
  }

  /**
   * Status apakah layar sedang terhubung
   */
  public isConnected(): boolean {
    return !!this.mediaStream && this.mediaStream.active && this.mediaStream.getVideoTracks().length > 0;
  }

  /**
   * Meminta izin pengguna untuk memilih tab ujian / jendela browser lain
   */
  public async connectScreen(): Promise<boolean> {
    if (!this.isSupported()) {
      alert('Browser Anda tidak mendukung Web Screen Capture API. Silakan gunakan Google Chrome atau Microsoft Edge terbaru.');
      return false;
    }

    try {
      if (this.isConnected()) {
        return true;
      }

      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: { ideal: 15, max: 30 },
        } as any,
        audio: false,
      });

      // Buat video element tersembunyi untuk membaca stream
      if (!this.videoElement) {
        this.videoElement = document.createElement('video');
        this.videoElement.autoplay = true;
        this.videoElement.muted = true;
        this.videoElement.playsInline = true;
      }
      this.videoElement.srcObject = this.mediaStream;
      await this.videoElement.play();

      if (!this.canvasElement) {
        this.canvasElement = document.createElement('canvas');
      }

      // Listener saat pengguna menekan "Stop sharing" dari browser UI
      const track = this.mediaStream.getVideoTracks()[0];
      if (track) {
        track.onended = () => {
          this.disconnectScreen();
        };
      }

      return true;
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        console.error('Failed to capture screen:', err);
      }
      return false;
    }
  }

  /**
   * Putuskan koneksi tangkapan layar
   */
  public disconnectScreen(): void {
    this.stopAutoScan();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  /**
   * Mengambil satu frame gambar tangkapan layar dari tab yang terhubung (JPEG base64)
   */
  public captureCurrentFrame(): string | null {
    if (!this.videoElement || !this.canvasElement || !this.isConnected()) {
      return null;
    }

    try {
      const video = this.videoElement;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      this.canvasElement.width = width;
      this.canvasElement.height = height;
      const ctx = this.canvasElement.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, width, height);
      // Kompresi kualitas 0.85 untuk kecepatan kirim & ketajaman teks optimal
      const dataUrl = this.canvasElement.toDataURL('image/jpeg', 0.85);
      this.lastCapturedFrame = dataUrl;
      return dataUrl;
    } catch (e) {
      console.warn('Error capturing video frame:', e);
      return null;
    }
  }

  /**
   * Ambil frame terakhir yang tersimpan
   */
  public getLastFrame(): string | null {
    return this.lastCapturedFrame;
  }

  /**
   * Scan layar aktif dan pecahkan soalnya dengan AI
   */
  public async scanAndSolveActiveScreen(settings: AppSettings): Promise<AnalysisResult | null> {
    if (this.isScanning) return null;

    // Jika belum terhubung, hubungkan terlebih dahulu
    if (!this.isConnected()) {
      const connected = await this.connectScreen();
      if (!connected) return null;
      // Beri sedikit jeda agar video stream mengalir
      await new Promise(r => setTimeout(r, 600));
    }

    const frameDataUrl = this.captureCurrentFrame();
    if (!frameDataUrl) {
      return null;
    }

    this.isScanning = true;
    try {
      // Analisis gambar menggunakan AI (Gemini Vision / local fallback)
      const result = await analyzeContentWithAi({
        rawText: 'Menganalisis soal dari tangkapan layar tab ujian eksternal...',
        imageDataUrl: frameDataUrl,
        type: 'multiple_choice',
        options: [],
        settings,
      });

      // Broadcast ke listener (termasuk Picture-in-Picture window)
      this.listeners.forEach(cb => {
        try {
          cb(result, frameDataUrl);
        } catch (err) {
          console.warn('Error in scan listener:', err);
        }
      });

      return result;
    } catch (err) {
      console.error('Scan error:', err);
      return null;
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Mengaktifkan auto-scan secara berkala (misal tiap intervalMs)
   */
  public startAutoScan(settings: AppSettings, intervalMs = 4000): void {
    this.stopAutoScan();
    this.autoScanTimer = setInterval(async () => {
      if (this.isConnected() && !this.isScanning) {
        await this.scanAndSolveActiveScreen(settings);
      }
    }, intervalMs);
  }

  /**
   * Hentikan auto-scan berkala
   */
  public stopAutoScan(): void {
    if (this.autoScanTimer) {
      clearInterval(this.autoScanTimer);
      this.autoScanTimer = null;
    }
  }

  public isAutoScanning(): boolean {
    return !!this.autoScanTimer;
  }

  /**
   * Tambah listener event saat scan berhasil
   */
  public subscribe(callback: ScreenScanCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const screenScannerService = new ScreenScannerService();

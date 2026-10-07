import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../data/androidProjectFiles';
import { GRADLE_WRAPPER_JAR_BASE64 } from '../data/wrapperJarBase64';
import JSZip from 'jszip';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Smartphone,
  AlertTriangle,
  Archive,
  GitBranch,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const AndroidSourceView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [customFilename, setCustomFilename] = useState('autosolve_bot.zip');

  const sanitizeName = (name: string) => {
    return name.trim().replace(/[\s()[\]]/g, '_').replace(/_+/g, '_');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name.split('/').pop() || selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCompleteZip = async (
    rawFilename: string = 'autosolve_bot.zip',
    mode: 'bot_project_raw' | 'pure_flutter' | 'pure_android' = 'bot_project_raw'
  ) => {
    setIsZipping(true);
    try {
      const cleanZipFilename = sanitizeName(rawFilename || 'autosolve_bot.zip');
      const zip = new JSZip();

      // Convert wrapper jar base64 to binary Uint8Array
      const binaryString = atob(GRADLE_WRAPPER_JAR_BASE64);
      const jarBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        jarBytes[i] = binaryString.charCodeAt(i);
      }

      if (mode === 'pure_flutter') {
        // Format Murni Flutter
        for (const file of ANDROID_PROJECT_FILES) {
          const cleanContent = file.content.replace(/\r\n/g, '\n');
          const isExec = file.path === 'gradlew' || file.path.endsWith('/gradlew') || file.path.endsWith('.sh');
          
          if (file.path === 'pubspec.yaml' || file.path.startsWith('lib/') || file.path.startsWith('assets/')) {
            zip.file(file.path, cleanContent);
          } else {
            zip.file(`android/${file.path}`, cleanContent, {
              unixPermissions: isExec ? 0o755 : 0o644,
            });
            if (isExec) {
              zip.file('gradlew', cleanContent, { unixPermissions: 0o755 });
            }
          }
        }
        zip.file('android/gradle/wrapper/gradle-wrapper.jar', jarBytes);
        zip.file('gradle/wrapper/gradle-wrapper.jar', jarBytes);
      } else if (mode === 'pure_android') {
        // Format Murni Android Studio Native
        for (const file of ANDROID_PROJECT_FILES) {
          if (file.path === 'pubspec.yaml' || file.path.startsWith('lib/') || file.path.startsWith('assets/')) continue;
          const cleanContent = file.content.replace(/\r\n/g, '\n');
          const isExec = file.path === 'gradlew' || file.path.endsWith('/gradlew') || file.path.endsWith('.sh');
          zip.file(file.path, cleanContent, {
            unixPermissions: isExec ? 0o755 : 0o644,
          });
        }
        zip.file('gradle/wrapper/gradle-wrapper.jar', jarBytes);
      } else {
        // Format Khusus Bot Telegram & Online Runner CI (project_raw Hybrid):
        // Memastikan gradlew (0755) & pubspec.yaml & lib/main.dart ada di:
        // 1. Root zip
        // 2. android/
        // 3. project_raw/
        // 4. project_raw/android/
        for (const file of ANDROID_PROJECT_FILES) {
          const cleanContent = file.content.replace(/\r\n/g, '\n');
          const isExec = file.path === 'gradlew' || file.path.endsWith('/gradlew') || file.path.endsWith('.sh');

          // 1. Root level
          zip.file(file.path, cleanContent, {
            unixPermissions: isExec ? 0o755 : 0o644,
          });

          // 2. android/ level (jika bukan flutter pubspec/lib)
          if (!file.path.startsWith('lib/') && file.path !== 'pubspec.yaml') {
            zip.file(`android/${file.path}`, cleanContent, {
              unixPermissions: isExec ? 0o755 : 0o644,
            });
          }

          // 3. project_raw/ level
          zip.file(`project_raw/${file.path}`, cleanContent, {
            unixPermissions: isExec ? 0o755 : 0o644,
          });

          // 4. project_raw/android/ level
          if (!file.path.startsWith('lib/') && file.path !== 'pubspec.yaml') {
            zip.file(`project_raw/android/${file.path}`, cleanContent, {
              unixPermissions: isExec ? 0o755 : 0o644,
            });
          }
        }

        // Duplikasi binary gradle-wrapper.jar di semua lokasi wrapper
        zip.file('gradle/wrapper/gradle-wrapper.jar', jarBytes);
        zip.file('android/gradle/wrapper/gradle-wrapper.jar', jarBytes);
        zip.file('project_raw/gradle/wrapper/gradle-wrapper.jar', jarBytes);
        zip.file('project_raw/android/gradle/wrapper/gradle-wrapper.jar', jarBytes);
      }

      const content = await zip.generateAsync({
        type: 'blob',
        platform: 'UNIX', // Memastikan unix permissions 0755 tersimpan ke ZIP header
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6,
        },
      });

      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = cleanZipFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP generation error:', err);
      alert('Gagal mengompres proyek. Silakan coba lagi.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Banner Header */}
      <div className="bg-[#8B5CF6] border-[2.5px] border-[#111111] rounded-[22px] p-4 shadow-[4px_4px_0px_#111111] flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white text-[#111111] border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base text-white">
              BASE APK &amp; BOT TELEGRAM / GITHUB BUILD FIX
            </h2>
            <p className="text-[11px] font-bold text-white/90">
              Solusi Tuntas: chmod cannot access 'gradlew' &amp; Flutter Project Injection
            </p>
          </div>
        </div>
      </div>

      {/* ERROR SOLVED BANNER */}
      <div className="bg-white border-[2.5px] border-[#111111] rounded-[22px] p-5 shadow-[5px_5px_0px_#111111] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5] shrink-0 text-[#18C96E]" />
            <h3 className="font-black text-xs uppercase text-[#111111]">
              FIX: BOT RUNNER CI (PROJECT_DIR: project_raw)
            </h3>
          </div>
          <span className="px-2.5 py-0.5 bg-[#18C96E] text-[#111111] text-[10px] font-black rounded-full border border-[#111111]">
            100% SIAP BUILD
          </span>
        </div>

        {/* Modules Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 bg-neutral-50 border-2 border-[#111111] rounded-xl text-center shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] font-black uppercase text-neutral-500 block">Total Berkas</span>
            <span className="text-base font-black text-[#111111]">{ANDROID_PROJECT_FILES.length} Files</span>
          </div>
          <div className="p-2.5 bg-neutral-50 border-2 border-[#111111] rounded-xl text-center shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] font-black uppercase text-neutral-500 block">Flutter Support</span>
            <span className="text-base font-black text-[#18C96E]">lib/main.dart ✓</span>
          </div>
          <div className="p-2.5 bg-neutral-50 border-2 border-[#111111] rounded-xl text-center shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] font-black uppercase text-neutral-500 block">Izin Gradlew</span>
            <span className="text-base font-black text-[#00B8D9]">chmod 755 (LF)</span>
          </div>
          <div className="p-2.5 bg-neutral-50 border-2 border-[#111111] rounded-xl text-center shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] font-black uppercase text-neutral-500 block">Path Injeksi</span>
            <span className="text-base font-black text-[#8B5CF6]">project_raw/</span>
          </div>
        </div>

        {/* Explanation of Error */}
        <div className="bg-neutral-50 border-2 border-neutral-300 rounded-2xl p-4 text-xs space-y-2.5 text-neutral-800 font-semibold leading-relaxed">
          <div className="text-[#FF3B4E] font-black flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#FF3B4E]" />
            <span>Penyebab Error "chmod: cannot access 'gradlew'":</span>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-900 font-mono text-[11px] space-y-1">
            <div className="font-bold text-red-800">chmod: cannot access 'gradlew': No such file or directory</div>
            <div className="text-neutral-700 font-sans leading-relaxed">
              Bot Telegram atau runner GitHub Actions mengekstrak file ke folder <strong><code>project_raw</code></strong> dan mencari <code>pubspec.yaml</code>, <code>lib/main.dart</code>, serta <code>gradlew</code> di folder tersebut. Jika salah satu file tidak ada di folder itu, runner langsung gagal menjalankan perintah <code>chmod +x gradlew</code>.
            </div>
          </div>

          {/* Error 2: Download ZIP dari Release & Version 3.11 */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-amber-950 font-mono text-[11px] space-y-1.5 mt-2">
            <div className="font-bold text-red-700">
              Step Failed : Download ZIP dari Release / Gagal download asset '$ASSET' / Version 3.11 not found
            </div>
            <div className="text-neutral-800 font-sans leading-relaxed text-[11px]">
              <strong>Penyebab:</strong> Bot builder mencoba mendownload rilis GitHub yang belum memiliki file rilis, atau menggunakan runner Flutter 3.11 yang tidak ada di cache.
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-amber-300 font-sans text-[11px] text-neutral-800 space-y-1">
              <div className="font-bold text-[#159A53]">💡 2 Solusi Pasti Berhasil:</div>
              <div>
                <strong>1. Lewat Bot Telegram (Cara Paling Mudah):</strong> Jangan kirim link/teks ke bot! Langsung <strong>KIRIM BERKAS ZIP</strong> (klik ikon klip 📎 &gt; Dokumen &gt; Pilih <code>autosolve_bot.zip</code>). Bot akan langsung meng-compile tanpa perlu download release.
              </div>
              <div>
                <strong>2. Lewat GitHub Actions (100% Gratis &amp; Resmi):</strong> Upload file ke akun GitHub Anda, buka tab <strong>Actions</strong>, klik <strong>Run workflow</strong>. File <code>.github/workflows/build-apk.yml</code> sudah kami perbarui ke <code>channel: 'stable'</code> dan Java 17 Temurin sehingga APK otomatis terbit di tab Artifacts!
              </div>
            </div>
          </div>

          <div className="text-[#159A53] font-black pt-1">
            ✓ Solusi yang Telah Diterapkan:
          </div>
          <ol className="list-decimal list-inside font-medium text-neutral-700 space-y-1.5 pl-1 text-[11px]">
            <li>
              Menambahkan <strong><code>lib/main.dart</code></strong> lengkap (UI Auto-Pilot Flutter 3.x) sehingga bot langsung mengenali proyek sebagai Flutter dan tidak skip dependencies!
            </li>
            <li>
              Menyuntikkan <strong><code>gradlew</code> (chmod 0755, format Linux LF)</strong> dan binary <strong><code>gradle-wrapper.jar</code></strong> ke SEMUA folder sekaligus (baik di root, di <code>android/</code>, maupun di <code>project_raw/</code> dan <code>project_raw/android/</code>).
            </li>
            <li>
              Menggunakan nama file bersih <strong><code>autosolve_bot.zip</code></strong> (tanpa spasi dan tanda kurung angka seperti <code>(3)</code> atau <code>(5)</code>).
            </li>
          </ol>
        </div>

        {/* Clean Name Field */}
        <div className="p-3 bg-neutral-100 border-2 border-[#111111] rounded-xl space-y-1.5">
          <label className="text-[11px] font-black text-neutral-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Nama File ZIP Bersih (Anti-Error Runner):</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(sanitizeName(e.target.value))}
              placeholder="autosolve_bot.zip"
              className="flex-1 bg-white border-2 border-[#111111] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
            />
            <button
              onClick={() => handleDownloadCompleteZip(customFilename, 'bot_project_raw')}
              disabled={isZipping}
              className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-2 border-[#111111] rounded-lg text-xs font-black shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
            >
              Unduh
            </button>
          </div>
        </div>

        {/* Primary Download Buttons */}
        <div className="space-y-2 pt-1">
          {/* Button 1: Dedicated for Telegram Bot / Online Runner */}
          <button
            onClick={() => handleDownloadCompleteZip('autosolve_bot.zip', 'bot_project_raw')}
            disabled={isZipping}
            className="w-full py-4 px-4 bg-[#18C96E] hover:bg-[#15B362] border-[2.5px] border-[#111111] rounded-2xl text-xs sm:text-sm font-black text-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Archive className="w-5 h-5" />
            <span>{isZipping ? 'Sedang Mengompres...' : '⚡ UNDUH "autosolve_bot.zip" (KHUSUS BOT TELEGRAM & RUNNER CI)'}</span>
          </button>

          {/* Button 2: Pure Flutter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleDownloadCompleteZip('flutter_project.zip', 'pure_flutter')}
              disabled={isZipping}
              className="py-3 px-3 bg-[#FFC800] hover:bg-[#F5BE00] border-2 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Format Flutter Murni (flutter_project.zip)</span>
            </button>
            <button
              onClick={() => handleDownloadCompleteZip('android_project.zip', 'pure_android')}
              disabled={isZipping}
              className="py-3 px-3 bg-[#00B8D9] hover:bg-[#00A2C0] border-2 border-[#111111] rounded-xl text-xs font-black text-white shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Format Android Native (android_project.zip)</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl p-2.5 text-center">
          ⚠️ <strong>PENTING:</strong> Saat mengunggah ke Bot Telegram, pastikan nama berkas adalah <strong><code>autosolve_bot.zip</code></strong>. Jangan mengunggah berkas yang berakhiran <code>(3).zip</code> atau <code>(5).zip</code> karena Linux runner akan gagal membaca tanda kurung angka!
        </p>
      </div>

      {/* GitHub Workflow Info */}
      <div className="bg-white border-[2.5px] border-[#111111] rounded-[22px] p-4 shadow-[4px_4px_0px_#111111] space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-[#111111]">
          <GitBranch className="w-4 h-4 text-[#8B5CF6]" />
          <span>Cara Build APK Otomatis di GitHub:</span>
        </div>
        <div className="bg-neutral-900 text-[#18C96E] font-mono text-xs p-3.5 rounded-xl border-2 border-[#111111] space-y-1">
          <div><span className="text-neutral-500"># 1. Ekstrak zip ke repository GitHub Anda</span></div>
          <div><span className="text-neutral-500"># 2. File .github/workflows/build-apk.yml sudah terpasang otomatis</span></div>
          <div><span className="text-neutral-500"># 3. Masuk ke tab "Actions" di GitHub dan klik "Run workflow"</span></div>
          <div className="text-white pt-1">
            =&gt; APK rilis akan otomatis di-build dan siap diunduh di tab Artifacts!
          </div>
        </div>
      </div>

      {/* Source Files Explorer */}
      <div className="bg-white border-[2.5px] border-[#111111] rounded-[22px] p-4 shadow-[4px_4px_0px_#111111] space-y-3">
        <span className="text-xs font-black uppercase text-neutral-700 block">
          Daftar Berkas Proyek di Dalam ZIP ({ANDROID_PROJECT_FILES.length} Files):
        </span>
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-neutral-200 max-h-48 overflow-y-auto">
          {ANDROID_PROJECT_FILES.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={`py-1.5 px-2.5 rounded-lg border-2 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedFile.path === file.path
                  ? 'bg-[#FFC800] border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-[#111111]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.name}</span>
            </button>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-mono font-bold text-neutral-600">
            {selectedFile.path}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="py-1 px-2.5 bg-neutral-100 hover:bg-neutral-200 border border-[#111111] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#18C96E]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="py-1 px-2.5 bg-[#8B5CF6] text-white border border-[#111111] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="bg-neutral-900 rounded-xl border-2 border-[#111111] p-3.5 max-h-[360px] overflow-y-auto">
          <pre className="text-xs font-mono text-neutral-200 whitespace-pre leading-relaxed">
            {selectedFile.content}
          </pre>
        </div>
      </div>
    </div>
  );
};

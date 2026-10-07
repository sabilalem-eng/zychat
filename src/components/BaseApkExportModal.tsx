import React, { useState } from 'react';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';
import { GRADLE_WRAPPER_JAR_BASE64 } from '../data/wrapperJarBase64';
import {
  Download,
  Smartphone,
  GitBranch,
  Globe,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCode,
  Archive,
  Sparkles,
  Copy,
  Check,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface BaseApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BaseApkExportModal: React.FC<BaseApkExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'vercel' | 'netlify' | 'download'>('github');
  const [isZipping, setIsZipping] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadBaseApkZip = async () => {
    setIsZipping(true);
    setDownloadProgress('Menyiapkan berkas proyek zyChat...');
    try {
      const zip = new JSZip();

      // Convert wrapper jar base64 to binary Uint8Array
      const binaryString = atob(GRADLE_WRAPPER_JAR_BASE64);
      const jarBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        jarBytes[i] = binaryString.charCodeAt(i);
      }

      setDownloadProgress('Menyusun struktur Android Studio Native & Gradle...');

      for (const file of ANDROID_PROJECT_FILES) {
        const content = file.content.replace(/\r\n/g, '\n');
        const isExec =
          file.path === 'gradlew' ||
          file.path.endsWith('/gradlew') ||
          file.path.endsWith('.sh');

        // 1. Root level
        zip.file(file.path, content, {
          unixPermissions: isExec ? 0o755 : 0o644,
        });

        // 2. android/ level (mirror)
        if (!file.path.startsWith('.github')) {
          zip.file(`android/${file.path}`, content, {
            unixPermissions: isExec ? 0o755 : 0o644,
          });
        }

        // 3. project_raw/ level (runner compatibility)
        zip.file(`project_raw/${file.path}`, content, {
          unixPermissions: isExec ? 0o755 : 0o644,
        });
      }

      // Inject binary gradle-wrapper.jar
      zip.file('gradle/wrapper/gradle-wrapper.jar', jarBytes);
      zip.file('android/gradle/wrapper/gradle-wrapper.jar', jarBytes);
      zip.file('project_raw/gradle/wrapper/gradle-wrapper.jar', jarBytes);

      setDownloadProgress('Mengompres arsip ZIP zyChat...');

      const blob = await zip.generateAsync({
        type: 'blob',
        platform: 'UNIX',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zyChat_base_apk.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadProgress('Selesai!');
      setTimeout(() => {
        setIsZipping(false);
        setDownloadProgress('');
      }, 1500);
    } catch (err) {
      console.error('Error generating zip:', err);
      setIsZipping(false);
      setDownloadProgress('Gagal mengompres ZIP.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#111B21] text-[#E9EDEF] border-2 border-[#202C33] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#202C33] border-b border-[#2A3942] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00A884] text-white flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                zyChat Base APK & Deploy Center
              </h3>
              <p className="text-[11px] text-[#8696A0]">
                Build APK via GitHub Actions, Deploy Netlify & Vercel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#8696A0] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#202C33] bg-[#182229] px-2 pt-2 gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'github', label: 'Build APK GitHub', icon: GitBranch },
            { id: 'vercel', label: 'Deploy Vercel', icon: Globe },
            { id: 'netlify', label: 'Deploy Netlify', icon: Globe },
            { id: 'download', label: 'Unduh .ZIP', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#202C33] text-[#00A884] border-t-2 border-[#00A884]'
                    : 'text-[#8696A0] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
          {/* TAB 1: GITHUB ACTIONS BUILD APK */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#182229] border border-[#202C33] rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00A884] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#00A884]">
                    Solusi Error "chmod: cannot access gradlew" & "Version 3.11 not found"
                  </h4>
                  <p className="text-[11px] text-[#8696A0] mt-1">
                    Repository ini sekarang telah dilengkapi dengan berkas wrapper{' '}
                    <code className="text-white bg-black/40 px-1 py-0.5 rounded">gradlew</code>{' '}
                    (0755 executable) dan workflow otomatis di{' '}
                    <code className="text-white bg-black/40 px-1 py-0.5 rounded">
                      .github/workflows/build-apk.yml
                    </code>
                    . Tidak perlu instalasi Android Studio lokal!
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs">
                  📋 3 Langkah Mudah Build APK di GitHub:
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-[#202C33] rounded-xl border border-[#2A3942] space-y-1">
                    <span className="font-bold text-[#00A884]">1. Push ke GitHub</span>
                    <p className="text-[11px] text-[#8696A0]">
                      Commit dan push seluruh kode repo ini ke GitHub Anda:
                    </p>
                    <div className="flex items-center justify-between bg-[#111B21] p-2 rounded-lg font-mono text-[11px] text-[#E9EDEF]">
                      <span>git add . && git commit -m "feat: zyChat Base APK" && git push</span>
                      <button
                        onClick={() =>
                          handleCopyText(
                            'git add . && git commit -m "feat: zyChat Base APK" && git push',
                            'git_push'
                          )
                        }
                        className="p-1 hover:text-[#00A884] cursor-pointer"
                      >
                        {copiedKey === 'git_push' ? (
                          <Check className="w-3.5 h-3.5 text-[#00A884]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-[#202C33] rounded-xl border border-[#2A3942] space-y-1">
                    <span className="font-bold text-[#00A884]">2. GitHub Actions Berjalan Otomatis</span>
                    <p className="text-[11px] text-[#8696A0]">
                      Buka tab <strong>Actions</strong> di GitHub repo Anda. Workflow{' '}
                      <strong>"Build zyChat Android APK"</strong> akan otomatis mengkompilasi APK dalam 1–2 menit.
                    </p>
                  </div>

                  <div className="p-3 bg-[#202C33] rounded-xl border border-[#2A3942] space-y-1">
                    <span className="font-bold text-[#00A884]">3. Unduh File .APK</span>
                    <p className="text-[11px] text-[#8696A0]">
                      Klik hasil run yang berhasil, gulir ke bagian <strong>Artifacts</strong>, lalu unduh{' '}
                      <strong>zyChat-Android-APK</strong>. Anda langsung mendapatkan file{' '}
                      <code className="text-white bg-black/40 px-1 py-0.5 rounded">zyChat-debug.apk</code> siap install di smartphone!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERCEL DEPLOY */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#182229] border border-[#202C33] rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00A884] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#00A884]">
                    vercel.json Sudah Terkonfigurasi 100%
                  </h4>
                  <p className="text-[11px] text-[#8696A0] mt-1">
                    zyChat siap dideploy langsung ke Vercel tanpa konfigurasi tambahan. File{' '}
                    <code className="text-white bg-black/40 px-1 py-0.5 rounded">vercel.json</code>{' '}
                    sudah mengatur rewrite Single Page App (SPA) dan output directory{' '}
                    <code className="text-white bg-black/40 px-1 py-0.5 rounded">dist</code>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#202C33] rounded-xl border border-[#2A3942] space-y-2">
                <span className="font-bold text-white">Perintah Deploy via Vercel CLI:</span>
                <div className="flex items-center justify-between bg-[#111B21] p-2 rounded-lg font-mono text-[11px]">
                  <span>npm run build && npx vercel --prod</span>
                  <button
                    onClick={() =>
                      handleCopyText('npm run build && npx vercel --prod', 'vercel_cmd')
                    }
                    className="p-1 hover:text-[#00A884] cursor-pointer"
                  >
                    {copiedKey === 'vercel_cmd' ? (
                      <Check className="w-3.5 h-3.5 text-[#00A884]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-[#8696A0]">
                  Atau impor langsung repository GitHub Anda di{' '}
                  <a
                    href="https://vercel.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00A884] hover:underline inline-flex items-center gap-1"
                  >
                    vercel.com/new <ExternalLink className="w-3 h-3" />
                  </a>
                  . Framework preset: <strong>Vite</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: NETLIFY DEPLOY */}
          {activeTab === 'netlify' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#182229] border border-[#202C33] rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00A884] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#00A884]">
                    netlify.toml Sudah Terkonfigurasi 100%
                  </h4>
                  <p className="text-[11px] text-[#8696A0] mt-1">
                    File <code className="text-white bg-black/40 px-1 py-0.5 rounded">netlify.toml</code>{' '}
                    telah disiapkan dengan perintah build{' '}
                    <code className="text-white bg-black/40 px-1 py-0.5 rounded">npm run build</code>,{' '}
                    publish folder <code className="text-white bg-black/40 px-1 py-0.5 rounded">dist</code>,{' '}
                    dan redirect 200 untuk navigasi halaman web chat.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#202C33] rounded-xl border border-[#2A3942] space-y-2">
                <span className="font-bold text-white">Perintah Deploy via Netlify CLI:</span>
                <div className="flex items-center justify-between bg-[#111B21] p-2 rounded-lg font-mono text-[11px]">
                  <span>npm run build && npx netlify deploy --prod --dir=dist</span>
                  <button
                    onClick={() =>
                      handleCopyText(
                        'npm run build && npx netlify deploy --prod --dir=dist',
                        'netlify_cmd'
                      )
                    }
                    className="p-1 hover:text-[#00A884] cursor-pointer"
                  >
                    {copiedKey === 'netlify_cmd' ? (
                      <Check className="w-3.5 h-3.5 text-[#00A884]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-[#8696A0]">
                  Atau impor langsung repository GitHub Anda di{' '}
                  <a
                    href="https://app.netlify.com/start"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00A884] hover:underline inline-flex items-center gap-1"
                  >
                    app.netlify.com/start <ExternalLink className="w-3 h-3" />
                  </a>
                  . Build command: <code>npm run build</code>, Publish dir: <code>dist</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: DOWNLOAD SOURCE ZIP */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#182229] border border-[#202C33] rounded-2xl flex items-start gap-3">
                <Archive className="w-5 h-5 text-[#00A884] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#00A884]">
                    Paket Lengkap Android Studio & Base APK
                  </h4>
                  <p className="text-[11px] text-[#8696A0] mt-1">
                    Arsip ZIP berisi seluruh kode Android Native (Gradle Wrapper, gradlew,
                    AndroidManifest.xml, MainActivity.kt, Gradle Wrapper JAR binary) dan
                    GitHub Actions workflow sehingga dapat langsung Anda ekstrak dan build!
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#202C33] rounded-2xl border border-[#2A3942] space-y-3 text-center">
                <button
                  onClick={handleDownloadBaseApkZip}
                  disabled={isZipping}
                  className="w-full py-3 bg-[#00A884] hover:bg-[#008F6F] active:scale-98 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isZipping
                      ? downloadProgress || 'Sedang mengompres...'
                      : 'Unduh zyChat_base_apk.zip Sekarang'}
                  </span>
                </button>
                <p className="text-[10px] text-[#8696A0]">
                  Ukuran paket: ~1.2 MB • Termasuk Gradle Wrapper Binary + Konfigurasi GitHub Actions
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#182229] border-t border-[#202C33] flex items-center justify-between text-[11px] text-[#8696A0]">
          <span>zyChat v1.0.0 • WhatsApp Fake Simulator</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#202C33] hover:bg-[#2A3942] text-white rounded-lg font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { History, Trash2, Search } from 'lucide-react';

interface HistoryViewProps {
  historyList: AnalysisResult[];
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
  onOpenStudyMode: (result: AnalysisResult) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyList,
  onClearAllHistory,
  onOpenStudyMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = historyList.filter(
    (item) =>
      (item.question || item.questionText || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bestAnswer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#FFC800] border-[2.5px] border-[#111111] rounded-[22px] p-4 shadow-[4px_4px_0px_#111111] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111]">
            <History className="w-5 h-5 text-[#111111]" />
          </div>
          <div>
            <h2 className="font-black text-base text-[#111111]">
              RIWAYAT SOAL TERJAWAB
            </h2>
            <p className="text-[11px] font-bold text-[#111111]/80">
              Daftar Soal yang Telah Diselesaikan oleh Robot AI
            </p>
          </div>
        </div>
        {historyList.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Hapus seluruh riwayat jawaban?')) {
                onClearAllHistory();
              }
            }}
            className="p-2 bg-[#FF3B4E] border-2 border-[#111111] rounded-xl text-white shadow-[2px_2px_0px_#111111] hover:bg-[#E62A3D] cursor-pointer"
            title="Bersihkan Semua History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Bar */}
      {historyList.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Cari soal atau jawaban..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[#111111] rounded-xl text-xs font-semibold text-[#111111] shadow-[2px_2px_0px_#111111] placeholder:text-neutral-400 focus:outline-none"
          />
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border-[2.5px] border-[#111111] rounded-[22px] p-8 shadow-[4px_4px_0px_#111111] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 border-2 border-[#111111] mx-auto flex items-center justify-center">
            <History className="w-6 h-6 text-neutral-400" />
          </div>
          <h3 className="font-black text-sm text-[#111111]">
            Belum Ada Riwayat
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Jalankan Auto-Pilot pada tab ujian untuk melihat robot menyelesaikan soal-soal secara mandiri.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border-[2.5px] border-[#111111] rounded-[20px] p-4 shadow-[3px_3px_0px_#111111] space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="px-2 py-0.5 bg-[#FFC800] border border-[#111111] rounded-md text-[10px] font-black">
                  Soal #{item.questionNumber}
                </span>
                <span className="text-[11px] font-semibold text-neutral-500">
                  {item.date}
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral-800 line-clamp-2">
                {item.question}
              </p>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-600">Jawaban:</span>
                  <span className="px-2.5 py-0.5 bg-[#18C96E] text-white border border-[#111111] rounded-lg font-black text-xs">
                    {item.bestAnswer}
                  </span>
                  <span className="text-xs font-black text-[#008DA6]">
                    {item.confidence}%
                  </span>
                </div>
                <button
                  onClick={() => onOpenStudyMode(item)}
                  className="py-1 px-3 bg-[#00B8D9] border border-[#111111] rounded-lg text-xs font-black text-[#111111] hover:bg-[#00A2C0] cursor-pointer"
                >
                  Lihat Pembahasan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

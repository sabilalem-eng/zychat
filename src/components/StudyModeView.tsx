import React from 'react';
import { ExamQuestion } from '../types';
import { BookOpen, Brain } from 'lucide-react';

interface StudyModeViewProps {
  currentQuestion: ExamQuestion | null;
}

export const StudyModeView: React.FC<StudyModeViewProps> = ({ currentQuestion }) => {
  const displayQ = currentQuestion || {
    id: 'demo',
    number: 1,
    type: 'multiple_choice' as const,
    question: 'Sebuah persamaan aljabar menyatakan: 3x - 5 = 19. Berapakah nilai x yang memenuhi persamaan tersebut?',
    options: [
      { key: 'A', text: 'x = 6' },
      { key: 'B', text: 'x = 8' },
      { key: 'C', text: 'x = 12' },
      { key: 'D', text: 'x = 14' },
    ],
    correctAnswer: 'B',
    confidence: 99,
    explanation: 'Langkah aljabar:\n1. 3x - 5 = 19\n2. 3x = 19 + 5 = 24\n3. x = 24 / 3 = 8.\nJawaban yang tepat adalah Pilihan B (x = 8).',
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-[#00B8D9] border-[2.5px] border-[#111111] rounded-[22px] p-4 shadow-[4px_4px_0px_#111111] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111]">
            <BookOpen className="w-5 h-5 text-[#111111]" />
          </div>
          <div>
            <h2 className="font-black text-base text-[#111111]">
              STUDY MODE &amp; PENJELASAN
            </h2>
            <p className="text-[11px] font-bold text-[#111111]/80">
              Pelajari Alasan, Rumus, dan Pembahasan Lengkap Setiap Soal
            </p>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border-[2.5px] border-[#111111] rounded-[24px] p-5 shadow-[5px_5px_0px_#111111] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <span className="px-2.5 py-1 bg-[#FFC800] border border-[#111111] rounded-full text-xs font-black">
            Soal #{displayQ.number}   {displayQ.type === 'true_false' ? 'Benar / Salah' : 'Pilihan Ganda'}
          </span>
          <span className="text-xs font-black text-[#159A53] bg-[#18C96E]/20 px-2.5 py-0.5 rounded-full border border-[#18C96E]">
            Akurasi AI: {displayQ.confidence}%
          </span>
        </div>

        <p className="text-sm font-semibold text-[#111111] leading-relaxed whitespace-pre-line">
          {displayQ.question}
        </p>

        {/* Options */}
        <div className="space-y-2">
          {displayQ.options.map((opt: any) => {
            const isCorrect = opt.key === displayQ.correctAnswer;
            return (
              <div
                key={opt.key}
                className={`p-3 rounded-xl border-2 flex items-center justify-between ${
                  isCorrect
                    ? 'bg-[#18C96E]/20 border-[#18C96E] font-bold shadow-[2px_2px_0px_#111111]'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-lg border border-[#111111] text-xs font-black flex items-center justify-center ${
                      isCorrect ? 'bg-[#18C96E] text-white' : 'bg-white text-neutral-700'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="text-xs font-semibold text-neutral-800">
                    {opt.text}
                  </span>
                </div>
                {isCorrect && (
                  <span className="text-[10px] font-black text-[#159A53]">
                    ✓ Kunci Jawaban
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Step-by-step logic breakdown */}
        <div className="bg-neutral-50 border-2 border-[#111111] rounded-2xl p-4 space-y-2 shadow-[2px_2px_0px_#111111]">
          <div className="flex items-center gap-2 text-[#111111]">
            <Brain className="w-4 h-4 text-[#00B8D9]" />
            <span className="text-xs font-black uppercase">
              Penjelasan Runtut &amp; Langkah Logika:
            </span>
          </div>
          <p className="text-xs font-medium text-neutral-800 leading-relaxed whitespace-pre-line">
            {displayQ.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};

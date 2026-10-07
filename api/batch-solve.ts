import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const apiKey = data.customKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(200).json({ useLocal: true, message: 'No API key, falling back to local engine' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Anda adalah Zyl-assistent, sistem AI Auto-Pilot yang membaca soal ulangan/ujian dan memecahkannya secara mandiri.
Tugas Anda:
1. Analisis teks ulangan berikut secara teliti.
2. Identifikasi berapa banyak soal yang ada.
3. Pisahkan tiap butir soal ke dalam array JSON.
4. Tentukan tipenya: "multiple_choice" (jika pilihan A, B, C, D, dsb) atau "true_false" (jika pernyataan Benar / Salah).
5. Tentukan jawaban terbaik yang benar dan berikan penjelasan singkat padat.

--- TEKS ULANGAN / SOAL ---
${data.rawText || ''}
--- AKHIR TEKS ---

Keluarkan HANYA JSON valid dalam format:
{
  "totalDetected": 3,
  "questions": [
    {
      "number": 1,
      "type": "multiple_choice",
      "question": "teks pertanyaan...",
      "options": [
        {"key": "A", "text": "teks pilihan A"},
        {"key": "B", "text": "teks pilihan B"},
        {"key": "C", "text": "teks pilihan C"},
        {"key": "D", "text": "teks pilihan D"}
      ],
      "correctAnswer": "A",
      "confidence": 99,
      "explanation": "Penjelasan mengapa opsi ini benar..."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: data.model || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const responseText = response.text || '{}';
    let parsed = {};
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { totalDetected: 0, questions: [] };
    }

    res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Batch solve error:', err);
    res.status(200).json({ error: err.message, useLocal: true });
  }
}

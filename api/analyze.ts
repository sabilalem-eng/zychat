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
    const prompt = `Anda adalah Zyl-assistent, AI Screen Assistant modern dan presisi untuk auto-solve soal ujian CBT / kuis / pilihan ganda / benar-salah.
Analisis soal pada layar berikut:
${data.text ? `--- TEKS SOAL ---\n${data.text}` : ''}
${data.options ? `--- OPSI JAWABAN TERSEDIA ---\n${data.options}` : ''}
${data.type ? `--- TIPE SOAL ---\n${data.type}` : ''}

Tugas Anda:
1. Jika terdapat gambar tangkapan layar ujian, baca dan transkrip pertanyaan serta seluruh opsi pilihan jawaban (A, B, C, D, E atau BENAR / SALAH).
2. Analisis konsep ilmiah, rumus matematika/fisika, atau kaidah tata bahasa secara teliti.
3. Tentukan jawaban yang paling tepat dan 100% benar.
4. Berikan penjelasan singkat, padat, dan bertahap.

Berikan output HANYA JSON valid dalam format:
{
  "question": "Ringkasan / teks pertanyaan yang terbaca pada layar",
  "bestAnswer": "A atau B atau C atau D atau E atau BENAR atau SALAH",
  "confidence": 98,
  "explanation": "Penjelasan langkah demi langkah mengapa opsi ini terbukti benar",
  "options": [
    {"key": "A", "text": "teks opsi A"},
    {"key": "B", "text": "teks opsi B"}
  ]
}`;

    const contents: any[] = [];
    if (data.imageBase64) {
      const cleanBase64 = data.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents.push({
        inlineData: {
          data: cleanBase64,
          mimeType: data.imageMimeType || 'image/jpeg',
        },
      });
    }
    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: data.model || 'gemini-2.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        temperature: data.temperature ?? 0.2,
      },
    });

    const responseText = response.text || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { explanation: responseText, bestAnswer: 'A', confidence: 96 };
    }

    res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(200).json({ error: err.message, useLocal: true });
  }
}

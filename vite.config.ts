import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      // 1. Single question solve (support text & image vision)
      server.middlewares.use('/api/analyze', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const apiKey = data.customKey || process.env.GEMINI_API_KEY;

            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ useLocal: true, message: 'No API key, falling back to local engine' }));
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
            let parsed = {};
            try {
              parsed = JSON.parse(responseText);
            } catch {
              parsed = { explanation: responseText, bestAnswer: 'A', confidence: 96 };
            }

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(parsed));
          } catch (err: any) {
            console.error('Gemini API Error:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ error: err.message, useLocal: true }));
          }
        });
      });

      // 2. Batch parser & solver for real exam text
      server.middlewares.use('/api/batch-solve', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const apiKey = data.customKey || process.env.GEMINI_API_KEY;

            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ useLocal: true, message: 'No API key, falling back to local engine' }));
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

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(parsed));
          } catch (err: any) {
            console.error('Batch solve error:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ error: err.message, useLocal: true }));
          }
        });
      });

      // 3. zyChat Realtime Multi-User Remote Chat Endpoints
      const inMemoryChatMessages: any[] = [];
      server.middlewares.use('/api/chat/messages', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const msg = JSON.parse(body || '{}');
              if (msg && msg.id) {
                inMemoryChatMessages.push(msg);
                if (inMemoryChatMessages.length > 500) inMemoryChatMessages.shift();
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        } else if (req.method === 'GET') {
          try {
            const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
            const phone = (url.searchParams.get('phone') || '').replace(/\D/g, '');
            const since = parseInt(url.searchParams.get('since') || '0', 10);
            const filtered = inMemoryChatMessages.filter(m => {
              const matchPhone = !phone || (m.toPhone && m.toPhone.replace(/\D/g, '') === phone);
              const matchTime = !since || (m.timestamp && m.timestamp > since);
              return matchPhone && matchTime;
            });
            res.statusCode = 200;
            res.end(JSON.stringify(filtered));
          } catch (e: any) {
            res.statusCode = 200;
            res.end(JSON.stringify([]));
          }
        } else {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

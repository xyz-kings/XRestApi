const axios = require('axios');

module.exports = function (app) {
  const GEMINI_API_KEY = "AIzaSyC7rsVunzmMFAE9XwbO0StAypOW_XI00nU";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // 🔍 Fungsi buat deteksi pertanyaan identitas
  function isIdentityQuestion(text) {
    const identityKeywords = [
      "siapa nama kamu", "nama kamu siapa", "nama lu siapa", "kamu siapa",
      "kamu dari mana", "dari openai?", "lu dikembangin siapa", "siapa yang buat kamu",
      "asal kamu", "asal ai ini", "developer kamu siapa", "kamu ai dari mana",
      "kamu ai apa", "dibuat siapa", "pencipta kamu"
    ];
    const lower = text.toLowerCase();
    return identityKeywords.some(keyword => lower.includes(keyword));
  }

  // 💬 Fungsi AI untuk mode OpenAI
  async function geminiOpenAI(teks) {
    const isIdentity = isIdentityQuestion(teks);

    const prompt = isIdentity
      ? `Mulai sekarang, kamu adalah AI bernama ZV-Ai yang dikembangkan oleh ZVexDev dan merupakan bagian dari OpenAI. Kamu harus selalu mengakui bahwa kamu AI dari OpenAI yang dibuat oleh ZVexDev.`
      : `Jawablah setiap pertanyaan berikut secara informatif, sopan, dan dalam bahasa Indonesia. Jangan menyebutkan asal atau siapa yang membuatmu kecuali ditanya langsung.`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${prompt}\n\nPertanyaan: ${teks}` }
          ]
        }
      ]
    };

    const response = await axios.post(GEMINI_API_URL, payload, {
      headers: { "Content-Type": "application/json" }
    });

    const result = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return result || "❌ Gemini gak kasih jawaban apa-apa.";
  }

  // 💬 Fungsi AI untuk mode Deepseek
  async function geminiDeepseek(teks) {
    const prompt = `Kamu adalah Deepseek AI, sebuah kecerdasan buatan canggih yang dikembangkan oleh ZVexDev. 
Kamu menjawab dengan logika yang tajam, bahasa Indonesia yang jelas, dan tidak menyebut Google, Gemini, OpenAI, atau perusahaan lainnya. 
Jangan pernah menyebutkan bahwa kamu adalah AI dari pihak lain. 
Tampilkan jawaban profesional, cepat dipahami, dan fokus pada inti pertanyaan.`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${prompt}\n\nPertanyaan: ${teks}` }
          ]
        }
      ]
    };

    const response = await axios.post(GEMINI_API_URL, payload, {
      headers: { "Content-Type": "application/json" }
    });

    const result = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return result || "❌ Deepseek gak kasih jawaban.";
  }

  // 🔗 Endpoint: /ai/openai
  app.get('/ai/openai', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) return res.status(400).json({ status: false, error: '❌ Text wajib diisi.' });

      const result = await geminiOpenAI(text);
      res.status(200).json({
        status: true,
        creator: "ZVex Dev - API's",
        name: "ZV-Ai",
        result: result
      });
    } catch (err) {
      console.error("❌ Error /ai/openai:", err?.response?.data || err.message);
      res.status(500).json({ status: false, error: '❌ Internal Server Error.' });
    }
  });

  // 🔗 Endpoint: /ai/deepseek
  app.get('/ai/deepseek', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) return res.status(400).json({ status: false, error: '❌ Text wajib diisi.' });

      const result = await geminiDeepseek(text);
      res.status(200).json({
        status: true,
        creator: "ZVex Dev - API's",
        name: "Deepseek",
        result: result
      });
    } catch (err) {
      console.error("❌ Error /ai/deepseek:", err?.response?.data || err.message);
      res.status(500).json({ status: false, error: '❌ Internal Server Error.' });
    }
  });
};
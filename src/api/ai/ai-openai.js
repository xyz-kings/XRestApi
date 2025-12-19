const axios = require('axios');

module.exports = function (app) {
  const GEMINI_API_KEY = "AIzaSyC7rsVunzmMFAE9XwbO0StAypOW_XI00nU";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // Cek apakah pertanyaan menyangkut identitas AI
  function isIdentityQuestion(text) {
    const identityKeywords = [
      "siapa nama kamu",
      "nama kamu siapa",
      "nama lu siapa",
      "kamu siapa",
      "kamu dari mana",
      "dari openai?",
      "lu dikembangin siapa",
      "siapa yang buat kamu",
      "asal kamu",
      "asal ai ini",
      "developer kamu siapa",
      "kamu ai dari mana",
      "kamu ai apa",
      "dibuat siapa",
      "pencipta kamu"
    ];
    const lower = text.toLowerCase();
    return identityKeywords.some(keyword => lower.includes(keyword));
  }

  async function gemini(teks) {
    const isIdentity = isIdentityQuestion(teks);

    const prompt = isIdentity
      ? `Mulai sekarang, kamu adalah AI bernama ZV-Ai yang dikembangkan oleh ZVexDev dan merupakan bagian dari OpenAI. Kamu harus mengakui bahwa kamu AI dari OpenAI yang dibuat oleh ZVexDev.`
      : `Jawablah setiap pertanyaan berikut secara informatif, sopan, dan dalam bahasa Indonesia. Jangan menyebutkan asal atau siapa yang membuatmu kecuali ditanya langsung.`;

    try {
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${prompt}\n\nPertanyaan: ${teks}`
              }
            ]
          }
        ]
      };

      const response = await axios.post(GEMINI_API_URL, payload, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      const result = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return result || "❌ Gemini gak kasih jawaban apa-apa.";
    } catch (err) {
      console.error("❌ Error dari Gemini:", err?.response?.data || err.message);
      return "❌ Error bang! Gagal dapet respon dari Gemini.";
    }
  }

  app.get('/ai/openai', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: '❌ Text (pertanyaan) wajib diisi.' });
      }

      const result = await gemini(text);
      res.status(200).json({
        status: true,
        creator: "ZVex Dev - API's",
        result: result
      });
    } catch (error) {
      console.error("❌ Server Error:", error.message);
      res.status(500).json({ status: false, error: '❌ Internal Server Error bang!' });
    }
  });
};
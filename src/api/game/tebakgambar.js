const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  const dbPath = path.resolve(__dirname, '../../database/tebakgambar.json');

  // === Load Data Function ===
  const loadDatabase = () => {
    if (!fs.existsSync(dbPath)) throw new Error('❌ File tebakgambar.json tidak ditemukan!');
    const raw = fs.readFileSync(dbPath, 'utf8');
    if (!raw.trim()) throw new Error('❌ File tebakgambar.json kosong!');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('❌ Format file salah, harus array!');
    return data;
  };

  // === Get semua soal ===
  app.get('/game/tebakgambar/questions', (req, res) => {
    try {
      const data = loadDatabase();
      const result = data.map((item, index) => ({
        id: index + 1,
        img: item.img,
        jawaban: item.jawaban,
        deskripsi: item.deskripsi
      }));
      res.json({ status: true, data: result });
    } catch (err) {
      res.status(500).json({ status: false, error: `Gagal load soal: ${err.message}` });
    }
  });

  // === Get soal by ID ===
  app.get('/game/tebakgambar/questions/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id < 1) return res.status(400).json({ status: false, error: 'ID tidak valid' });
      const data = loadDatabase();
      const soal = data[id - 1];
      if (!soal) return res.status(404).json({ status: false, error: 'Soal tidak ditemukan' });
      res.json({
        status: true,
        data: {
          id,
          img: soal.img,
          jawaban: soal.jawaban,
          deskripsi: soal.deskripsi
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: `Gagal load soal: ${err.message}` });
    }
  });

  // === Cek jawaban ===
  app.post('/game/tebakgambar/answer', (req, res) => {
    const { questionId, answer } = req.body;
    if (!questionId || !answer || typeof answer !== 'string') {
      return res.status(400).json({ status: false, error: 'questionId dan answer harus diisi dengan benar' });
    }

    try {
      const id = parseInt(questionId);
      if (isNaN(id) || id < 1) return res.status(400).json({ status: false, error: 'ID tidak valid' });

      const data = loadDatabase();
      const soal = data[id - 1];
      if (!soal) return res.status(404).json({ status: false, error: 'Soal tidak ditemukan' });

      const userAnswer = answer.trim().toLowerCase();
      const correctAnswer = soal.jawaban.trim().toLowerCase();
      const isCorrect = userAnswer === correctAnswer;

      res.json({
        status: true,
        data: {
          correct: isCorrect,
          answer: isCorrect ? soal.jawaban : null,
          deskripsi: isCorrect ? soal.deskripsi : null,
          message: isCorrect ? 'Jawaban benar!' : 'Jawaban salah.'
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: `Gagal cek jawaban: ${err.message}` });
    }
  });
};
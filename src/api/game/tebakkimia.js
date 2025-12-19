const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  const dbPath = path.resolve(__dirname, '../../database/tebakkimia.json');

  const loadDatabase = () => {
    if (!fs.existsSync(dbPath)) throw new Error('File tebakkimia.json tidak ditemukan!');
    const raw = fs.readFileSync(dbPath, 'utf8');
    if (!raw.trim()) throw new Error('File tebakkimia.json kosong!');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('Format file salah (harus array)');
    return data;
  };

  // === GET semua soal ===
  app.get('/game/tebakkimia/questions', (req, res) => {
    try {
      const data = loadDatabase();
      const result = data.map((item, index) => ({
        id: index + 1,
        nama: item.nama,
        lambang: item.lambang
      }));
      res.json({ status: true, data: result });
    } catch (err) {
      res.status(500).json({ status: false, error: `Gagal ambil data: ${err.message}` });
    }
  });

  // === GET by ID ===
  app.get('/game/tebakkimia/questions/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id < 1) return res.status(400).json({ status: false, error: 'ID tidak valid' });

      const data = loadDatabase();
      const item = data[id - 1];
      if (!item) return res.status(404).json({ status: false, error: 'Data tidak ditemukan' });

      res.json({
        status: true,
        data: {
          id,
          nama: item.nama,
          lambang: item.lambang
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: `Gagal ambil data: ${err.message}` });
    }
  });

  // === POST Cek Jawaban ===
  app.post('/game/tebakkimia/answer', (req, res) => {
    const { questionId, answer } = req.body;
    if (!questionId || !answer || typeof answer !== 'string') {
      return res.status(400).json({ status: false, error: 'questionId dan answer harus diisi' });
    }

    try {
      const id = parseInt(questionId);
      if (isNaN(id) || id < 1) return res.status(400).json({ status: false, error: 'ID tidak valid' });

      const data = loadDatabase();
      const item = data[id - 1];
      if (!item) return res.status(404).json({ status: false, error: 'Data tidak ditemukan' });

      const isCorrect = item.lambang.toLowerCase() === answer.trim().toLowerCase();
      res.json({
        status: true,
        data: {
          correct: isCorrect,
          answer: isCorrect ? item.lambang : null,
          nama: item.nama,
          message: isCorrect ? 'Jawaban benar!' : 'Jawaban salah.'
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: `Gagal cek jawaban: ${err.message}` });
    }
  });
};
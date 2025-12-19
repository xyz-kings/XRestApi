const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  const dbPath = path.resolve(__dirname, '../../database/kuisislami.json');

  const loadDatabase = () => {
    try {
      if (!fs.existsSync(dbPath)) {
        throw new Error(`Database file not found at: ${dbPath}`);
      }

      const raw = fs.readFileSync(dbPath, 'utf8');
      if (!raw.trim()) {
        throw new Error('Database file is empty');
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error('Database format invalid: Expected an array');
      }

      return parsed;
    } catch (err) {
      console.error(`[KuisIslam] Failed to load DB: ${err.message}`);
      throw err;
    }
  };

  app.get('/game/kuisislam/questions', (req, res) => {
    try {
      const data = loadDatabase();
      const questions = data.map((item, i) => ({
        id: i + 1,
        soal: item.soal,
        pilihan: item.pilihan,
        jawaban: item.jawaban,
        deskripsi: item.deskripsi
      }));
      res.json({ status: true, data: questions });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });

  app.get('/game/kuisislam/questions/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id < 1) {
        return res.status(400).json({ status: false, error: 'ID tidak valid' });
      }

      const data = loadDatabase();
      const q = data[id - 1];
      if (!q) {
        return res.status(404).json({ status: false, error: 'Pertanyaan tidak ditemukan' });
      }

      res.json({
        status: true,
        data: {
          id,
          soal: q.soal,
          pilihan: q.pilihan,
          jawaban: q.jawaban,
          deskripsi: q.deskripsi
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });

  app.post('/game/kuisislam/answer', (req, res) => {
    const { questionId, answer } = req.body;
    if (!questionId || !answer || typeof answer !== 'string') {
      return res.status(400).json({ status: false, error: 'questionId dan answer harus valid' });
    }

    try {
      const id = parseInt(questionId);
      const data = loadDatabase();
      const q = data[id - 1];

      if (!q) return res.status(404).json({ status: false, error: 'Pertanyaan tidak ditemukan' });

      const isCorrect = answer.toLowerCase().trim() === q.jawaban.toLowerCase().trim();
      res.json({
        status: true,
        data: {
          correct: isCorrect,
          answer: isCorrect ? q.jawaban : null,
          deskripsi: isCorrect ? q.deskripsi : null,
          message: isCorrect ? 'Jawaban benar' : 'Jawaban salah'
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });
};
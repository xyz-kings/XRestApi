const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  const dbPath = path.resolve(__dirname, '../../database/siapakahaku.json');
  console.log(`[SiapakahAku] Path: ${dbPath}`);
  console.log(`[SiapakahAku] File exists?`, fs.existsSync(dbPath));

  const loadDatabase = () => {
    try {
      if (!fs.existsSync(dbPath)) {
        throw new Error(`File not found: ${dbPath}`);
      }
      const raw = fs.readFileSync(dbPath, 'utf8');
      if (!raw.trim()) throw new Error('File kosong');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Format file salah (bukan array)');
      return parsed;
    } catch (err) {
      console.error(`[SiapakahAku] Load DB error: ${err.message}`);
      throw err;
    }
  };

  // === GET SEMUA PERTANYAAN ===
  app.get('/game/siapakahaku/questions', (req, res) => {
    try {
      const data = loadDatabase();
      const fullData = data.map((item, index) => ({
        id: index + 1,
        soal: item.soal,
        jawaban: item.jawaban
      }));
      res.json({ status: true, data: fullData });
    } catch (err) {
      res.status(500).json({ status: false, error: `Gagal memuat soal: ${err.message}` });
    }
  });

  // === GET PER ID ===
  app.get('/game/siapakahaku/questions/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id < 1) {
        return res.status(400).json({ status: false, error: 'ID tidak valid' });
      }
      const data = loadDatabase();
      const soal = data[id - 1];
      if (!soal) {
        return res.status(404).json({ status: false, error: 'Soal tidak ditemukan' });
      }
      res.json({
        status: true,
        data: {
          id,
          soal: soal.soal,
          jawaban: soal.jawaban
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: `Error: ${err.message}` });
    }
  });

  // === CEK JAWABAN ===
  app.post('/game/siapakahaku/answer', (req, res) => {
    const { questionId, answer } = req.body;
    if (!questionId || !answer || typeof answer !== 'string') {
      return res.status(400).json({ status: false, error: 'questionId dan answer harus valid' });
    }
    try {
      const id = parseInt(questionId);
      if (isNaN(id) || id < 1) {
        return res.status(400).json({ status: false, error: 'ID tidak valid' });
      }
      const data = loadDatabase();
      const soal = data[id - 1];
      if (!soal) {
        return res.status(404).json({ status: false, error: 'Soal tidak ditemukan' });
      }
      const correct = answer.trim().toLowerCase() === soal.jawaban.trim().toLowerCase();
      res.json({
        status: true,
        data: {
          correct,
          answer: correct ? soal.jawaban : null,
          message: correct ? 'Jawaban benar' : 'Jawaban salah'
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: `Gagal cek jawaban: ${err.message}` });
    }
  });
};
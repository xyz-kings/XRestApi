const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  const dbPath = path.resolve(__dirname, '../../database/susunkata.json');
  console.log(`[SusunKata] Database path: ${dbPath}`);
  console.log(`[SusunKata] File exists?`, fs.existsSync(dbPath));

  const loadDatabase = () => {
    try {
      if (!fs.existsSync(dbPath)) {
        throw new Error(`File tidak ditemukan di: ${dbPath}`);
      }
      const data = fs.readFileSync(dbPath, 'utf8');
      if (!data.trim()) throw new Error('File kosong');
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) throw new Error('Format file salah, harus array');
      return parsed;
    } catch (err) {
      console.error(`[SusunKata] Error load DB: ${err.message}`);
      throw err;
    }
  };

  // === GET SEMUA SOAL ===
  app.get('/game/susunkata/questions', (req, res) => {
    try {
      const data = loadDatabase();
      const fullData = data.map((item, index) => ({
        id: index + 1,
        soal: item.soal,
        tipe: item.tipe,
        jawaban: item.jawaban
      }));
      res.json({ status: true, data: fullData });
    } catch (err) {
      res.status(500).json({ status: false, error: `Gagal ambil soal: ${err.message}` });
    }
  });

  // === GET BY ID ===
  app.get('/game/susunkata/questions/:id', (req, res) => {
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
          soal: soal.soal,
          tipe: soal.tipe,
          jawaban: soal.jawaban
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: `Gagal ambil soal: ${err.message}` });
    }
  });

  // === CEK JAWABAN ===
  app.post('/game/susunkata/answer', (req, res) => {
    const { questionId, answer } = req.body;
    if (!questionId || !answer || typeof answer !== 'string') {
      return res.status(400).json({ status: false, error: 'questionId dan answer harus valid' });
    }
    try {
      const id = parseInt(questionId);
      if (isNaN(id) || id < 1) return res.status(400).json({ status: false, error: 'ID tidak valid' });
      const data = loadDatabase();
      const soal = data[id - 1];
      if (!soal) return res.status(404).json({ status: false, error: 'Soal tidak ditemukan' });
      const correct = soal.jawaban.trim().toLowerCase() === answer.trim().toLowerCase();
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
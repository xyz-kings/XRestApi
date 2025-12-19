const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  const dbPath = path.resolve(__dirname, '../../database/tebaklagu.json');

  const loadDatabase = () => {
    try {
      if (!fs.existsSync(dbPath)) throw new Error('File JSON tidak ditemukan');
      const data = fs.readFileSync(dbPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) throw new Error('Format JSON harus array');
      return parsed;
    } catch (err) {
      throw new Error(`Gagal load database: ${err.message}`);
    }
  };

  // Endpoint: Get semua lagu
  app.get('/game/tebaklagu/questions', (req, res) => {
    try {
      const data = loadDatabase();
      const result = data.map((item, index) => ({
        id: index + 1,
        lagu: item.lagu,
        judul: item.judul,
        artis: item.artis
      }));
      res.json({
        status: true,
        creator: "ZVex Dev - API's",
        data: result
      });
    } catch (e) {
      res.status(500).json({ status: false, error: e.message });
    }
  });

  // Endpoint: Get satu lagu berdasarkan ID
  app.get('/game/tebaklagu/questions/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = loadDatabase();
      const item = data[id - 1];
      if (!item) return res.status(404).json({ status: false, error: 'Lagu tidak ditemukan' });

      res.json({
        status: true,
        data: {
          id,
          lagu: item.lagu,
          judul: item.judul,
          artis: item.artis
        }
      });
    } catch (e) {
      res.status(500).json({ status: false, error: e.message });
    }
  });

  // Endpoint: Cek jawaban lagu
  app.post('/game/tebaklagu/answer', (req, res) => {
    try {
      const { questionId, answer } = req.body;
      if (!questionId || !answer) {
        return res.status(400).json({ status: false, error: 'questionId dan answer wajib diisi' });
      }

      const id = parseInt(questionId);
      const data = loadDatabase();
      const item = data[id - 1];
      if (!item) return res.status(404).json({ status: false, error: 'Lagu tidak ditemukan' });

      const normalizedAnswer = answer.trim().toLowerCase();
      const correct = item.judul.toLowerCase() === normalizedAnswer || item.artis.toLowerCase() === normalizedAnswer;

      res.json({
        status: true,
        data: {
          correct,
          jawaban: correct ? { judul: item.judul, artis: item.artis } : null,
          message: correct ? "Jawaban benar!" : "Jawaban salah!"
        }
      });
    } catch (e) {
      res.status(500).json({ status: false, error: e.message });
    }
  });
};
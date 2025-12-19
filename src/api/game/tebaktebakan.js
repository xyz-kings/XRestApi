const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  const dbPath = path.resolve(__dirname, '../../database/tebaktebakan.json');

  const loadDatabase = () => {
    try {
      if (!fs.existsSync(dbPath)) throw new Error('File JSON tidak ditemukan');
      const fileContent = fs.readFileSync(dbPath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      if (!Array.isArray(jsonData)) throw new Error('Format JSON harus berupa array');
      return jsonData;
    } catch (err) {
      console.error('[TebakTebakan] Gagal load database:', err.message);
      throw err;
    }
  };

  // GET semua soal
  app.get('/game/tebaktebakan/questions', (req, res) => {
    try {
      const data = loadDatabase();
      const result = data.map((item, index) => ({
        id: index + 1,
        soal: item.soal,
        jawaban: item.jawaban
      }));
      res.json({
        status: true,
        creator: 'ZVex Dev - API\'s',
        data: result
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        error: err.message
      });
    }
  });

  // GET soal by ID
  app.get('/game/tebaktebakan/questions/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = loadDatabase();
      const item = data[id - 1];
      if (!item) {
        return res.status(404).json({
          status: false,
          error: 'Soal tidak ditemukan'
        });
      }

      res.json({
        status: true,
        data: {
          id,
          soal: item.soal,
          jawaban: item.jawaban
        }
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        error: err.message
      });
    }
  });

  // POST check jawaban
  app.post('/game/tebaktebakan/answer', (req, res) => {
    try {
      const { questionId, answer } = req.body;
      if (!questionId || !answer) {
        return res.status(400).json({
          status: false,
          error: 'Parameter questionId dan answer wajib diisi'
        });
      }

      const id = parseInt(questionId);
      const data = loadDatabase();
      const item = data[id - 1];
      if (!item) {
        return res.status(404).json({
          status: false,
          error: 'Soal tidak ditemukan'
        });
      }

      const jawabanBenar = item.jawaban.toLowerCase().trim();
      const jawabanUser = answer.toLowerCase().trim();
      const isCorrect = jawabanBenar === jawabanUser;

      res.json({
        status: true,
        data: {
          correct: isCorrect,
          jawaban: isCorrect ? item.jawaban : null,
          message: isCorrect ? 'Jawaban benar' : 'Jawaban salah'
        }
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        error: err.message
      });
    }
  });
};
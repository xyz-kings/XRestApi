const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  const dbPath = path.resolve(__dirname, '../../database/tebaklirik.json');

  function loadData() {
    try {
      if (!fs.existsSync(dbPath)) throw new Error('File tidak ditemukan');
      const raw = fs.readFileSync(dbPath, 'utf-8');
      const json = JSON.parse(raw);
      if (!Array.isArray(json)) throw new Error('Data harus berupa array');
      return json;
    } catch (e) {
      console.error('[tebaklirik] Error:', e.message);
      throw e;
    }
  }

  app.get('/game/tebaklirik/questions', (req, res) => {
    try {
      const data = loadData();
      const result = data.map((x, i) => ({
        id: i + 1,
        question: x.question,
        answer: x.answer
      }));
      res.json({ status: true, creator: 'ZVex Dev - API\'s', data: result });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });

  app.get('/game/tebaklirik/questions/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = loadData();
      if (isNaN(id) || id < 1 || id > data.length) {
        return res.status(404).json({ status: false, error: 'Soal tidak ditemukan' });
      }
      const soal = data[id - 1];
      res.json({ status: true, data: { id, question: soal.question, answer: soal.answer } });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });

  app.post('/game/tebaklirik/answer', (req, res) => {
    try {
      const { questionId, answer } = req.body;
      if (!questionId || !answer) {
        return res.status(400).json({ status: false, error: 'Parameter questionId dan answer wajib' });
      }

      const id = parseInt(questionId);
      const data = loadData();
      const soal = data[id - 1];
      if (!soal) {
        return res.status(404).json({ status: false, error: 'Soal tidak ditemukan' });
      }

      const isCorrect = soal.answer.toLowerCase().trim() === answer.toLowerCase().trim();
      res.json({
        status: true,
        data: {
          correct: isCorrect,
          answer: isCorrect ? soal.answer : null,
          message: isCorrect ? 'Jawaban benar!' : 'Jawaban salah.'
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });
};
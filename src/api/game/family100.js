const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  const dbPath = path.resolve(__dirname, '../../database/family100.json');
  console.log(`[Family100] Initializing with database path: ${dbPath}`);
  console.log(`[Family100] File exists: ${fs.existsSync(dbPath)}`);

  const loadDatabase = () => {
    try {
      if (!fs.existsSync(dbPath)) {
        throw new Error(`Database file not found at: ${dbPath}`);
      }
      const data = fs.readFileSync(dbPath, 'utf8');
      if (!data.trim()) {
        throw new Error('Database file is empty');
      }
      console.log(`[Family100] Raw file content (first 100 chars): ${data.substring(0, 100)}...`);
      const parsedData = JSON.parse(data);
      if (!Array.isArray(parsedData)) {
        throw new Error('Database format invalid: Expected an array');
      }
      console.log(`[Family100] Database loaded successfully, ${parsedData.length} questions found`);
      return parsedData;
    } catch (error) {
      console.error(`[Family100] Error loading database: ${error.message}`);
      throw error;
    }
  };

  app.get('/game/famili100/questions', (req, res) => {
    console.log(`[Family100] GET /game/famili100/questions accessed from ${req.ip} at ${new Date().toISOString()}`);
    try {
      const data = loadDatabase();
      const questions = data.map((item, index) => ({
        id: index + 1,
        soal: item.soal,
        jawaban: item.jawaban.split('\n').map(answer => answer.trim()).filter(Boolean)
      }));
      res.json({ status: true, data: questions });
    } catch (error) {
      console.error(`[Family100] Error in GET /game/famili100/questions: ${error.message}`);
      res.status(500).json({ status: false, error: `Gagal memuat pertanyaan: ${error.message}` });
    }
  });

  app.get('/game/famili100/questions/:id', (req, res) => {
    console.log(`[Family100] GET /game/famili100/questions/${req.params.id} accessed from ${req.ip} at ${new Date().toISOString()}`);
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id < 1) {
        return res.status(400).json({ status: false, error: 'ID pertanyaan tidak valid' });
      }
      const data = loadDatabase();
      const question = data[id - 1];
      if (!question) {
        return res.status(404).json({ status: false, error: 'Pertanyaan tidak ditemukan' });
      }
      res.json({
        status: true,
        data: {
          id,
          soal: question.soal,
          jawaban: question.jawaban.split('\n').map(answer => answer.trim()).filter(Boolean)
        }
      });
    } catch (error) {
      console.error(`[Family100] Error in GET /game/famili100/questions/${req.params.id}: ${error.message}`);
      res.status(500).json({ status: false, error: `Gagal memuat pertanyaan: ${error.message}` });
    }
  });

  app.post('/game/famili100/answer', (req, res) => {
    const { questionId, answer } = req.body;
    console.log(`[Family100] POST /game/famili100/answer accessed from ${req.ip} at ${new Date().toISOString()} with body: ${JSON.stringify(req.body)}`);
    if (!questionId || !answer || typeof answer !== 'string') {
      return res.status(400).json({ status: false, error: 'questionId dan answer harus diisi dengan benar' });
    }
    try {
      const id = parseInt(questionId);
      if (isNaN(id) || id < 1) {
        return res.status(400).json({ status: false, error: 'ID pertanyaan tidak valid' });
      }
      const data = loadDatabase();
      const question = data[id - 1];
      if (!question) {
        return res.status(404).json({ status: false, error: 'Pertanyaan tidak ditemukan' });
      }
      const answers = question.jawaban.split('\n').map(a => a.trim()).filter(Boolean);
      const normalizedAnswers = answers.map(a => a.toLowerCase());
      const normalizedInput = answer.toLowerCase().trim();
      const isCorrect = normalizedAnswers.includes(normalizedInput);
      const matchedAnswer = answers[normalizedAnswers.indexOf(normalizedInput)] || null;
      res.json({
        status: true,
        data: {
          correct: isCorrect,
          answer: isCorrect ? matchedAnswer : null,
          message: isCorrect ? 'Jawaban benar' : 'Jawaban salah'
        }
      });
    } catch (error) {
      console.error(`[Family100] Error in POST /game/famili100/answer: ${error.message}`);
      res.status(500).json({ status: false, error: `Gagal memproses jawaban: ${error.message}` });
    }
  });
};
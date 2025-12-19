const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  const dbPath = path.resolve(__dirname, '../../database/tebakbendera.json');

  const loadDatabase = () => {
    const exists = fs.existsSync(dbPath);
    if (!exists) throw new Error('Database tidak ditemukan!');
    const raw = fs.readFileSync(dbPath, 'utf8');
    if (!raw.trim()) throw new Error('File kosong!');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('Format data salah!');
    return data;
  };

  app.get('/game/tebakbendera/questions', (req, res) => {
    try {
      const data = loadDatabase();
      const result = data.map((item, i) => ({
        id: i + 1,
        bendera: item.bendera,
        nama: item.nama
      }));
      res.json({ status: true, data: result });
    } catch (e) {
      console.error(`[TebakBendera]`, e.message);
      res.status(500).json({ status: false, error: e.message });
    }
  });
};
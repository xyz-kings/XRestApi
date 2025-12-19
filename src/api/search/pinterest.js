const axios = require("axios");

module.exports = (app) => {
  app.get("/search/pinterest", async (req, res) => {
    try {
      const q = req.query.q;
      if (!q) return res.json({ status: false, message: "Masukkan parameter ?q=" });

      const { data: html } = await axios.get(
        `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
              "(KHTML, like Gecko) Chrome/120 Safari/537.36",
          },
        }
      );

      // Ambil blob JSON
      const match = html.match(/<script id="__PWS_DATA__" type="application\/json">(.*?)<\/script>/);
      if (!match) return res.json({ status: false, message: "Gagal parsing data Pinterest" });

      const json = JSON.parse(match[1]);

      // Cari semua object yang punya images
      let pins = [];
      function deepSearch(obj) {
        if (!obj || typeof obj !== "object") return;
        if (obj.images && obj.id) {
          pins.push({
            id: obj.id,
            title: obj.title || obj.grid_title || null,
            image: obj.images?.orig?.url || null,
            link: `https://www.pinterest.com/pin/${obj.id}/`,
          });
        }
        for (let k in obj) {
          deepSearch(obj[k]);
        }
      }
      deepSearch(json);

      // Hapus duplikat
      const seen = new Set();
      const results = pins.filter((p) => {
        if (!p.image) return false;
        if (seen.has(p.image)) return false;
        seen.add(p.image);
        return true;
      }).slice(0, 10);

      res.json({ status: true, query: q, results });
    } catch (e) {
      console.error("Pinterest error:", e.message);
      res.json({ status: false, message: "Gagal fetch dari Pinterest" });
    }
  });
};
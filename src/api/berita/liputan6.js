const axios = require("axios");

const config = {
  name: "Liputan6",
  desc: "Berita Dari Liputan6",
  path: "/berita/liputan6"
};

const apiUrl = "https://scraping-berita.vercel.app/liputan6/news";

async function fetchLiputan6News() {
  try {
    const res = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        Authorization: "XyzKings123" // Menambahkan API key dari config.json
      }
    });
    const newsData = res.data;

    if (Array.isArray(newsData)) {
      if (newsData.length === 0) {
        return {
          status: false,
          message: "Tidak ada berita tersedia dari Liputan6 saat ini"
        };
      }

      const formattedData = newsData.map(item => ({
        title: item.title || "Judul tidak tersedia",
        image_thumbnail: item.image_thumbnail || "",
        image_full: item.image_full || "",
        time: item.time || new Date().toISOString(),
        link: item.link || "",
        slug: item.slug || "",
        content: item.content ? item.content.substring(0, 200) + "..." : "Konten tidak tersedia"
      }));

      return {
        status: true,
        data: formattedData
      };
    } else {
      return {
        status: false,
        message: "Data berita tidak tersedia atau format tidak valid"
      };
    }
  } catch (error) {
    console.error("Error fetching Liputan6 news:", error.message);
    return {
      status: false,
      message: `Gagal mengambil data berita: ${error.message}`
    };
  }
}

module.exports = function (app) {
  app.get(config.path, async (req, res) => {
    try {
      const results = await fetchLiputan6News();
      if (results.status) {
        res.status(200).json({
          status: true,
          creator: "Xyz-King's",
          result: results.data
        });
      } else {
        res.status(404).json({
          status: false,
          creator: "Xyz-King's",
          message: results.message
        });
      }
    } catch (error) {
      console.error("Server error at /berita/liputan6:", error.message);
      res.status(400).json({
        status: false,
        creator: "Xyz-King's",
        message: `Error server: ${error.message}`
      });
    }
  });
};
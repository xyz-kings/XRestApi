const axios = require("axios");

const config = {
  name: "CNBC",
  desc: "Berita Dari CNBC Indonesia",
  path: "/berita/cnbc"
};

const apiUrl = "https://api.siputzx.my.id/api/berita/cnbcindonesia";

async function fetchCncbNews() {
  try {
    const res = await axios.get(apiUrl, {
      timeout: 10000
    });
    const newsData = res.data;

    if (newsData.status && Array.isArray(newsData.data)) {
      const formattedData = newsData.data.map(item => ({
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
    console.error("Error fetching CNBC news:", error.message);
    return {
      status: false,
      message: `Gagal mengambil data berita: ${error.message}`
    };
  }
}

module.exports = function (app) {
  app.get(config.path, async (req, res) => {
    try {
      const results = await fetchCncbNews();
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
      console.error("Server error at /berita/cnbc:", error.message);
      res.status(500).json({
        status: false,
        creator: "Xyz-King's",
        message: `Error server: ${error.message}`
      });
    }
  });
};
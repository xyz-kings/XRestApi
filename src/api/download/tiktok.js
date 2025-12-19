const cheerio = require("cheerio");
const axios = require("axios");

async function tiktok(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const encodedParams = new URLSearchParams();
      encodedParams.set("url", query);
      encodedParams.set("hd", "1");

      const response = await axios({
        method: "POST",
        url: "https://tikwm.com/api/",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Cookie: "current_language=en",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        },
        data: encodedParams,
      });

      const videoData = response.data.data; // Ambil data dari respons API
      if (!videoData) {
        return reject(new Error("No video data found"));
      }

      // Strukturkan respons sesuai format yang diinginkan
      const result = {
        code: 0,
        msg: "success",
        processed_time: response.data.processed_time || 0.3311, // Jika API tidak memberikan waktu, gunakan default
        data: {
          id: videoData.id || "",
          region: videoData.region || "",
          title: videoData.title || "",
          cover: videoData.cover || "",
          ai_dynamic_cover: videoData.ai_dynamic_cover || "",
          origin_cover: videoData.origin_cover || "",
          duration: videoData.duration || 0,
          play: videoData.play || videoData.play_addr || "", // URL video tanpa watermark
          wmplay: videoData.wmplay || videoData.wm_addr || "", // URL video dengan watermark
          size: videoData.size || 0,
          wm_size: videoData.wm_size || 0,
          music: videoData.music || "",
          music_info: {
            id: videoData.music_info?.id || "",
            title: videoData.music_info?.title || "",
            play: videoData.music_info?.play || "",
            cover: videoData.music_info?.cover || "",
            author: videoData.music_info?.author || "",
            original: videoData.music_info?.original || false,
            duration: videoData.music_info?.duration || 0,
            album: videoData.music_info?.album || "",
          },
          play_count: videoData.play_count || 0,
          digg_count: videoData.digg_count || 0,
          comment_count: videoData.comment_count || 0,
          share_count: videoData.share_count || 0,
          download_count: videoData.download_count || 0,
          collect_count: videoData.collect_count || 0,
          create_time: videoData.create_time || 0,
          anchors: videoData.anchors || null,
          anchors_extras: videoData.anchors_extras || "",
          is_ad: videoData.is_ad || false,
          commerce_info: {
            adv_promotable: videoData.commerce_info?.adv_promotable || false,
            auction_ad_invited: videoData.commerce_info?.auction_ad_invited || false,
            branded_content_type: videoData.commerce_info?.branded_content_type || 0,
            organic_log_extra: videoData.commerce_info?.organic_log_extra || "",
            with_comment_filter_words: videoData.commerce_info?.with_comment_filter_words || false,
          },
          commercial_video_info: videoData.commercial_video_info || "",
          item_comment_settings: videoData.item_comment_settings || 0,
          mentioned_users: videoData.mentioned_users || "",
          author: {
            id: videoData.author?.id || "",
            unique_id: videoData.author?.unique_id || "",
            nickname: videoData.author?.nickname || "",
            avatar: videoData.author?.avatar || "",
          },
        },
      };

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

const headers = {
  authority: "ttsave.app",
  accept: "application/json, text/plain, */*",
  origin: "https://ttsave.app",
  referer: "https://ttsave.app/en",
  "user-agent": "Postify/1.0.0",
};

const tiktokdl = {
  submit: async function (url, referer) {
    const headerx = { ...headers, referer };
    const data = { query: url, language_id: "1" };
    return axios.post("https://ttsave.app/download", data, { headers: headerx });
  },

  parse: function ($) {
    const description = $("p.text-gray-600").text().trim();
    const dlink = {
      nowm: $("a.w-full.text-white.font-bold").first().attr("href"),
      audio: $('a[type="audio"]').attr("href"),
    };

    const slides = $('a[type="slide"]')
      .map((i, el) => ({
        number: i + 1,
        url: $(el).attr("href"),
      }))
      .get();

    return { description, dlink, slides };
  },

  fetchData: async function (link) {
    try {
      const response = await this.submit(link, "https://ttsave.app/en");
      const $ = cheerio.load(response.data);
      const result = this.parse($);
      return {
        code: 0,
        msg: "success",
        processed_time: 0.3311, // Default, karena ttsave tidak memberikan waktu
        data: {
          video_nowm: result.dlink.nowm || "",
          audio_url: result.dlink.audio || "",
          slides: result.slides || [],
          description: result.description || "",
        },
      };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = function (app) {
  app.get("/download/tiktok", async (req, res) => {
    const { url } = req.query;
    try {
      const results = await tiktokdl.fetchData(url);
      res.status(200).json({
        status: true,
        creator: "ZVex Dev - API's",
        result: results.data,
      });
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
    }
  });

  app.get("/download/tiktok-v2", async (req, res) => {
    const { url } = req.query;
    try {
      const results = await tiktok(url);
      res.status(200).json({
        status: true,
        creator: "ZVex Dev - API's",
        result: results.data,
      });
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
    }
  });
};
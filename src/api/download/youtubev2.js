const fetch = require('node-fetch');

module.exports = function (app) {
  // Route: Ambil info & link download MP3/MP4 dari YouTube
  app.get('/download/ytdlv2', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, message: 'URL tidak ditemukan.' });

    try {
      const apiURL = `https://yt-dl-red.vercel.app/api/youtube?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiURL);
      const data = await response.json();

      if (!data.status) {
        return res.status(500).json({ status: false, message: 'Gagal mengambil data dari API.', detail: data });
      }

      // Format response kita sendiri
      res.status(200).json({
        status: true,
        video: {
          id: data.id,
          title: data.title,
          description: data.description,
          thumbnail: data.thumbnail,
          channelTitle: data.channelTitle,
          publishedAt: data.publishedAt,
          duration: data.duration,
          viewCount: data.viewCount,
          likeCount: data.likeCount,
          commentCount: data.commentCount
        },
        downloads: {
          mp3: data.downloads?.mp3?.[0]?.url || null,
          mp4: data.downloads?.mp4?.[0]?.url || null
        }
      });

    } catch (error) {
      console.error('🔥 [YouTubeV2 Error]', error.message);
      res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
    }
  });
};
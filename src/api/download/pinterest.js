const axios = require("axios");

async function pindlVideo(urls) {
    const payload = {
        "endpoint": "/v1/scraper/pinterest/video-downloader",
        "url": urls
    };

    const config = {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    };

    try {
        const { data } = await axios.post("https://www.famety.com/v2/fallout-api", payload, config);

        return {
            username: data?.data?.user?.username || null,
            uploader_name: data?.data?.user?.fullName || null,
            upload_date: data?.data?.created_at || null,
            download_url: data?.data?.download_url || null
        };
    } catch (error) {
        console.error("Error during the request:", error);
        throw error;
    }
}

module.exports = function (app) {
    app.get('/download/pinterest', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, message: "Missing 'url' parameter" });
        }

        try {
            const results = await pindlVideo(url);
            res.status(200).json({
                status: true,
                creator: "Xyz-King's",
                result: results
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};
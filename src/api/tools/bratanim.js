const express = require('express');
const router = express.Router();
const axios = require('axios');
const chalk = require('chalk');

// Route for /tools/bratanim
module.exports = (app) => {
    app.use('/tools', router);

    router.get('/bratanim', async (req, res) => {
        try {
            let { text } = req.query;

            // Validasi parameter text
            if (!text) {
                console.log(chalk.red('Parameter text tidak ada'));
                return res.status(400).json({
                    status: false,
                    message: 'Parameter text wajib diisi'
                });
            }

            // Konversi teks ke huruf kecil (anti kapital)
            const originalText = text;
            text = text.toLowerCase();
            console.log(chalk.yellow(`Teks asli: ${originalText} -> Dikonversi: ${text}`));

            // Panggil Brat Anim API
            const apiUrl = `https://brat-anim.vercel.app/api/bratanim?text=${encodeURIComponent(text)}`;
            let apiResponse;
            try {
                apiResponse = await axios.get(apiUrl, {
                    timeout: 30000, // Timeout 30 detik (animasi bisa lebih lama)
                    responseType: 'stream', // Asumsi response-nya animasi gambar (GIF/MP4)
                    headers: {
                        // Tambahin header kalau butuh autentikasi khusus
                        // Contoh: 'Authorization': 'Bearer YOUR_BRAT_ANIM_KEY'
                    }
                });
                console.log(chalk.green(`Berhasil panggil Brat Anim API: ${apiUrl}`));
            } catch (error) {
                console.error(chalk.red('Gagal panggil Brat Anim API:'), error.message);

                // Cek error spesifik
                if (error.response && error.response.status === 401) {
                    console.log(chalk.red('Brat Anim API balikin 401 Unauthorized. Cek autentikasi!'));
                    return res.status(401).json({
                        status: false,
                        message: 'Gagal autentikasi ke Brat Anim API. Cek dokumentasi.'
                    });
                }

                if (error.code === 'ECONNABORTED') {
                    console.log(chalk.red('Request ke Brat Anim API timeout'));
                    return res.status(408).json({
                        status: false,
                        message: 'Request timeout - generasi animasi terlalu lama'
                    });
                }

                console.log(chalk.red('Error lain dari Brat Anim API:', error.response?.data || error.message));
                return res.status(502).json({
                    status: false,
                    message: 'Gagal ambil animasi dari Brat Anim API'
                });
            }

            // Cek kalau response bukan gambar/animasi
            const contentType = apiResponse.headers['content-type'] || 'image/gif'; // Default GIF buat animasi
            if (!contentType.includes('image/') && !contentType.includes('video/')) {
                console.error(chalk.red('Response dari Brat Anim API bukan animasi/gambar:', contentType));
                if (contentType.includes('application/json')) {
                    console.log(chalk.red('Response JSON dari Brat Anim API:', await apiResponse.data.toString()));
                }
                return res.status(502).json({
                    status: false,
                    message: 'Response dari Brat Anim API bukan animasi valid'
                });
            }

            // Set header buat response animasi
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', 'inline; filename="brat-anim.gif"'); // Default GIF, bisa ganti ke MP4 kalau video

            // Stream animasi langsung ke client
            apiResponse.data.pipe(res);

        } catch (error) {
            console.error(chalk.red('Error di /tools/bratanim:'), error.stack);
            res.status(500).json({
                status: false,
                message: 'Error server internal'
            });
        }
    });
};
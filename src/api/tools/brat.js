const express = require('express');
const router = express.Router();
const axios = require('axios');
const chalk = require('chalk');

// Route for /tools/brat
module.exports = (app) => {
    app.use('/tools', router);

    router.get('/brat', async (req, res) => {
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

            // Konversi teks ke huruf kecil
            const originalText = text;
            text = text.toLowerCase();
            console.log(chalk.yellow(`Teks asli: ${originalText} -> Dikonversi: ${text}`));

            // Panggil Brat API dengan teks lowercase
            const apiUrl = `https://brat-gamma.vercel.app/api/brat?text=${encodeURIComponent(text)}&type=true`;
            let apiResponse;
            try {
                apiResponse = await axios.get(apiUrl, {
                    timeout: 30000, // Timeout 30 detik
                    responseType: 'stream', // Asumsi response-nya gambar
                    headers: {
                        // Tambahin header kalau Brat API butuh autentikasi
                        // Contoh: 'Authorization': 'Bearer YOUR_BRAT_KEY'
                    }
                });
                console.log(chalk.green(`Berhasil panggil Brat API: ${apiUrl}`));
            } catch (error) {
                console.error(chalk.red('Gagal panggil Brat API:'), error.message);

                // Cek error spesifik
                if (error.response && error.response.status === 401) {
                    console.log(chalk.red('Brat API balikin 401 Unauthorized. Cek autentikasi Brat API!'));
                    return res.status(401).json({
                        status: false,
                        message: 'Gagal autentikasi ke Brat API. Cek dokumentasi Brat.'
                    });
                }

                if (error.code === 'ECONNABORTED') {
                    console.log(chalk.red('Request ke Brat API timeout'));
                    return res.status(408).json({
                        status: false,
                        message: 'Request timeout - generasi gambar terlalu lama'
                    });
                }

                console.log(chalk.red('Error lain dari Brat API:', error.response?.data || error.message));
                return res.status(502).json({
                    status: false,
                    message: 'Gagal ambil gambar dari Brat API'
                });
            }

            // Cek kalau response bukan gambar
            const contentType = apiResponse.headers['content-type'] || 'image/png';
            if (!contentType.includes('image/')) {
                console.error(chalk.red('Response dari Brat API bukan gambar:', contentType));
                if (contentType.includes('application/json')) {
                    console.log(chalk.red('Response JSON dari Brat API:', await apiResponse.data.toString()));
                }
                return res.status(502).json({
                    status: false,
                    message: 'Response dari Brat API bukan gambar valid'
                });
            }

            // Set header buat response gambar
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', 'inline; filename="brat-image.png"');

            // Stream gambar langsung ke client
            apiResponse.data.pipe(res);

        } catch (error) {
            console.error(chalk.red('Error di /tools/brat:'), error.stack);
            res.status(500).json({
                status: false,
                message: 'Error server internal'
            });
        }
    });
};
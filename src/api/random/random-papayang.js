const axios = require('axios');

async function getBuffer(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
}

const images = [
'https://files.catbox.moe/heaucq.jpg',
    'https://files.catbox.moe/bxk1d8.jpg',
    'https://files.catbox.moe/bkgylm.jpg',
    'https://files.catbox.moe/bopu5i.jpg',
    'https://files.catbox.moe/chj09x.jpg',
    'https://files.catbox.moe/39aan0.jpg',
    'https://files.catbox.moe/6e3tcz.jpg',
    'https://files.catbox.moe/ue68u1.jpg',
    'https://files.catbox.moe/kyjl1y.jpg',
    'https://files.catbox.moe/sdivku.jpg',
    'https://files.catbox.moe/d56rdn.jpg',
    'https://files.catbox.moe/u7ngt5.jpg',
    'https://files.catbox.moe/j2mps3.jpg',
    'https://files.catbox.moe/0xsgpq.jpg',
    'https://files.catbox.moe/sq2pmf.jpg',
    'https://files.catbox.moe/kvov8x.jpg',
    'https://files.catbox.moe/x4jvy5.jpg',
    'https://files.catbox.moe/w1c4gb.jpg',
    'https://files.catbox.moe/0ni90f.jpg',
    'https://files.catbox.moe/x0dqpe.jpg',
    'https://files.catbox.moe/lg7gi3.jpg',
    'https://files.catbox.moe/x91ffa.jpg',
    'https://files.catbox.moe/sv2q8y.jpg',
    'https://files.catbox.moe/u98cqz.jpg',
    'https://files.catbox.moe/r1a7ip.jpg',
    'https://files.catbox.moe/d56rdn.jpg',
    'https://files.catbox.moe/lkvl8k.jpg',
    'https://files.catbox.moe/c930nu.jpg',
    'https://files.catbox.moe/bp3s6m.jpg',
    'https://files.catbox.moe/x4jvy5.jpg',
    'https://files.catbox.moe/heaucq.jpg',
    'https://files.catbox.moe/e37uvb.jpg',
    'https://files.catbox.moe/q7irad.jpg',
    'https://files.catbox.moe/56rqfi.jpg',
    'https://files.catbox.moe/91tnqv.jpg',
    'https://files.catbox.moe/u98cqz.jpg',
    'https://files.catbox.moe/t4dkly.jpg',
    'https://files.catbox.moe/e4e8as.jpg',
    'https://files.catbox.moe/62moxl.jpg',
    'https://files.catbox.moe/0wxx0o.jpg',
    'https://files.catbox.moe/9y5oiw.jpg',
    'https://files.catbox.moe/chj09x.jpg',
    'https://files.catbox.moe/c930nu.jpg',
    'https://files.catbox.moe/ir2gdq.jpg',
    'https://files.catbox.moe/pnfjjj.jpg',
    'https://files.catbox.moe/c8apeh.jpg',
    'https://files.catbox.moe/srtfvi.jpg',
    'https://files.catbox.moe/toktkw.jpg',
    'https://files.catbox.moe/5gp0g2.jpg',
    'https://files.catbox.moe/egswwp.jpg',
    'https://files.catbox.moe/hmywex.jpg',
    'https://files.catbox.moe/ncy0qq.jpg',
    'https://files.catbox.moe/cqcjbs.jpg',
    'https://files.catbox.moe/naoe9n.jpg',
    'https://files.catbox.moe/cmwgj7.jpg',
    'https://files.catbox.moe/ojrl5z.jpg',
    'https://files.catbox.moe/cqcjbs.jpg',
    'https://files.catbox.moe/llovqq.jpg',
    'https://files.catbox.moe/0ijyny.jpg',
    'https://files.catbox.moe/0xsgpq.jpg',
    'https://files.catbox.moe/fcps54.jpg',
    'https://files.catbox.moe/z5h4bt.jpg',
    'https://files.catbox.moe/t56tlj.jpg',
    'https://files.catbox.moe/x0dqpe.jpg',
    'https://files.catbox.moe/lkvl8k.jpg',
    'https://files.catbox.moe/k165gq.jpg',
    'https://files.catbox.moe/ff6bl0.jpg',
    'https://files.catbox.moe/3o87fr.jpg',
    'https://files.catbox.moe/3s1foy.jpg',
    'https://files.catbox.moe/22ifsj.jpg'
];

module.exports = function app(app) {
    app.get('/random/papayang', async (req, res) => {
        try {
            // Pilih gambar random
            const randomImage = images[Math.floor(Math.random() * images.length)];
            const buffer = await getBuffer(randomImage);

            res.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Content-Length': buffer.length,
            });
            res.end(buffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};

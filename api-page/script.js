// Inisialisasi saat dokumen dimuat
document.addEventListener('DOMContentLoaded', async () => {
    // Deklarasi elemen DOM
    const loadingScreen = document.getElementById('loadingScreen');
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebarClose = document.querySelector('.sidebar-close');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const profilePage = document.getElementById('profilePage');
    const dashboardPage = document.getElementById('dashboardPage');
    const shopPage = document.getElementById('shopPage');
    const apiContentPage = document.getElementById('apiContentPage');
    const claimFreeKey = document.getElementById('claimFreeKey');
    const purchaseButtons = document.querySelectorAll('.purchase-btn');
    const profileLink = document.getElementById('profileLink');
    const shopLink = document.getElementById('shopLink');
    const logoutLink = document.getElementById('logoutLink');
    const profileName = document.getElementById('profileName');
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const profileApiKey = document.getElementById('profileApiKey');
    const profilePassword = document.getElementById('profilePassword');
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainApp');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');

    // Nonaktifkan scroll saat loading
    body.classList.add('no-scroll');

    // Cek sesi pengguna
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        loginPage.classList.add('d-none');
        mainApp.classList.remove('d-none');
        showPage(dashboardPage);
    }

    // Fungsi untuk menampilkan halaman
    const showPage = (page) => {
        profilePage.classList.remove('active');
        dashboardPage.classList.remove('active');
        shopPage.classList.remove('active');
        apiContentPage.classList.remove('active');
        page.classList.add('active');
    };

    // Fungsi untuk menghasilkan API key
    function generateApiKey(isFree = true) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let random = '';
        for (let i = 0; i < 10; i++) {
            random += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return isFree ? `ZKey_free${random}` : `ZKey_${random}`;
    }

    // Fungsi registrasi
    function register(e) {
        e.preventDefault();
        const nama = document.getElementById('regNama').value.trim();
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();

        if (!nama || !username || !email || !password) {
            alert('Semua data harus diisi!');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Email tidak valid!');
            return;
        }

        if (password.length < 6) {
            alert('Kata sandi harus minimal 6 karakter!');
            return;
        }

        if (localStorage.getItem(email)) {
            alert('Email sudah terdaftar!');
            return;
        }

        const userData = {
            nama,
            username,
            email,
            password,
            apiKey: generateApiKey(true),
            limitType: 'free',
            limit: 100,
            lastReset: new Date().toISOString()
        };

        localStorage.setItem(email, JSON.stringify(userData));
        localStorage.setItem('currentUser', JSON.stringify(userData));
        alert('Registrasi berhasil! API Key: ' + userData.apiKey);
        loginPage.classList.add('d-none');
        mainApp.classList.remove('d-none');
        showPage(dashboardPage);
    }

    // Fungsi login
    function login(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!email || !password) {
            alert('Email dan kata sandi harus diisi!');
            return;
        }

        const data = localStorage.getItem(email);
        if (!data) {
            alert('Email tidak ditemukan!');
            return;
        }

        const user = JSON.parse(data);
        if (user.password !== password) {
            alert('Kata sandi salah!');
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('Login berhasil!');
        loginPage.classList.add('d-none');
        mainApp.classList.remove('d-none');
        showPage(dashboardPage);
    }

    // Toggle visibilitas kata sandi
    function togglePassword(inputId, icon) {
        const input = document.getElementById(inputId);
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.classList.toggle('ri-eye-off-fill');
        icon.classList.toggle('ri-eye-fill');
    }

    // Event listener untuk form
    loginForm.addEventListener('submit', login);
    registerForm.addEventListener('submit', register);
    showRegister.addEventListener('click', () => {
        loginPage.classList.add('active');
        document.querySelector('.login__register').classList.remove('d-none');
        document.querySelector('.login__access').classList.add('d-none');
    });
    showLogin.addEventListener('click', () => {
        loginPage.classList.remove('active');
        document.querySelector('.login__access').classList.remove('d-none');
        document.querySelector('.login__register').classList.add('d-none');
    });

    // Toggle kata sandi untuk login
    document.getElementById('loginPasswordIcon').addEventListener('click', () => {
        togglePassword('loginPassword', document.getElementById('loginPasswordIcon'));
    });

    // Toggle kata sandi untuk registrasi
    document.getElementById('regPasswordIcon').addEventListener('click', () => {
        togglePassword('regPassword', document.getElementById('regPasswordIcon'));
    });

    // Toggle kata sandi untuk profil
    document.querySelector('.toggle-password-btn').addEventListener('click', () => {
        togglePassword('profilePassword', document.querySelector('.toggle-password-btn i'));
    });

    // Populate halaman profil
    profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(profilePage);
        profileName.textContent = currentUser.nama;
        profileUsername.textContent = `@${currentUser.username}`;
        profileEmail.textContent = currentUser.email;
        profileApiKey.value = currentUser.apiKey;
        profilePassword.value = currentUser.password;
    });

    // Tampilkan halaman toko
    shopLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(shopPage);
    });

    // Logout
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        loginPage.classList.remove('d-none');
        mainApp.classList.add('d-none');
    });

    // Salin API key
    document.querySelector('.profile-card .copy-btn').addEventListener('click', () => {
        profileApiKey.select();
        navigator.clipboard.writeText(profileApiKey.value).then(() => {
            const btn = document.querySelector('.profile-card .copy-btn');
            btn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });
    });

    // Pengaturan mock untuk simulasi data API
    const mockSettings = {
        name: "YassProject - API's",
        version: "v1.0",
        description: "API Sederhana untuk Pengembangan",
        header: { status: "Aktif!" },
        apiSettings: { creator: "YassProject" },
        categories: [
            {
                name: "Umum",
                items: [
                    { name: "Cek IP", desc: "Mendapatkan informasi IP", path: "/api/ip?query=example" },
                    { name: "Cek Lokasi", desc: "Mendapatkan data lokasi", path: "/api/location" }
                ]
            }
        ],
        links: [
            { url: "https://github.com/yassproject", name: "GitHub" },
            { url: "https://docs.yassproject.com", name: "Dokumentasi" }
        ]
    };

    // Set konten dasar
    const setContent = (id, property, value) => {
        const element = document.getElementById(id);
        if (element) element[property] = value;
    };

    setContent('page', 'textContent', mockSettings.name);
    setContent('wm', 'textContent', `© 2025 ${mockSettings.apiSettings.creator}. Hak cipta dilindungi.`);
    setContent('header', 'textContent', mockSettings.name);
    setContent('name', 'textContent', mockSettings.name);
    setContent('version', 'textContent', mockSettings.version);
    setContent('versionHeader', 'textContent', mockSettings.header.status);
    setContent('description', 'textContent', mockSettings.description);

    // Populate menu sidebar
    mockSettings.categories.sort((a, b) => a.name.localeCompare(b.name)).forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" class="category-link" data-category="${category.name}">${category.name}</a>`;
        sidebarMenu.appendChild(li);
    });

    // Klik kategori sidebar
    sidebarMenu.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-link')) {
            e.preventDefault();
            const categoryName = e.target.dataset.category;
            showPage(apiContentPage);
            renderCategoryContent(categoryName, mockSettings);
            sidebar.classList.remove('active');
        }
    });

    // Render tautan API
    const apiLinksContainer = document.getElementById('apiLinks');
    if (apiLinksContainer && mockSettings.links?.length) {
        mockSettings.links.forEach(({ url, name }) => {
            const link = Object.assign(document.createElement('a'), {
                href: url,
                textContent: name,
                target: '_blank',
                className: 'lead me-3'
            });
            apiLinksContainer.appendChild(link);
        });
    }

    // Render konten API awal
    renderCategoryContent(mockSettings.categories[0]?.name, mockSettings);

    // Klaim key gratis
    claimFreeKey.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem(currentUser.email));
        const now = new Date();
        const lastReset = new Date(user.lastReset);
        const oneDay = 24 * 60 * 60 * 1000;

        if (now - lastReset > oneDay) {
            user.apiKey = generateApiKey(true);
            user.limit = 100;
            user.limitType = 'free';
            user.lastReset = now.toISOString();
            localStorage.setItem(currentUser.email, JSON.stringify(user));
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert('API key gratis diklaim! Limit: 100 permintaan/hari');
        } else {
            alert('Key gratis hanya bisa diklaim sekali sehari!');
        }
    });

    // Pembelian paket
    purchaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            alert(`Pembelian paket ${type} (arahkan ke gateway pembayaran)`);
        });
    });

    // Fungsi pencarian
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const apiItems = document.querySelectorAll('.api-item');
        const categoryHeaders = document.querySelectorAll('.category-header');

        apiItems.forEach(item => {
            const name = item.getAttribute('data-name').toLowerCase();
            const desc = item.getAttribute('data-desc').toLowerCase();
            item.style.display = (name.includes(searchTerm) || desc.includes(searchTerm)) ? '' : 'none';
        });

        categoryHeaders.forEach(header => {
            const categoryRow = header.nextElementSibling;
            const visibleItems = categoryRow.querySelectorAll('.api-item:not([style*="display: none"])');
            header.style.display = visibleItems.length ? '' : 'none';
        });
    });

    // Render konten kategori
    function renderCategoryContent(categoryName, settings) {
        const apiContent = document.getElementById('apiContent');
        apiContent.innerHTML = '';
        const category = settings.categories.find(cat => cat.name === categoryName);
        if (!category) return;

        const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));
        const categoryContent = sortedItems.map((item) => {
            let paramInputs = '';
            let hasParams = false;
            const params = new URLSearchParams(item.path.split('?')[1]);
            const basePath = `${window.location.origin}${item.path.split('?')[0]}`;
            let defaultEndpoint = `${window.location.origin}${item.path}`;
            if (params.toString().length > 0) {
                hasParams = true;
                paramInputs = Array.from(params.keys()).map(param => `
                    <div class="mb-2">
                        <input type="text" class="form-control param-input" placeholder="${param}" data-param="${param}" required>
                    </div>
                `).join('');
            }

            const innerDesc = item.innerDesc ? `<p class="text-muted mt-2" style="font-size: 13px;">${item.innerDesc.replace(/\n/g, '<br>')}</p>` : '';
            return `
                <div class="col-md-6 col-lg-4 api-item mb-4" data-name="${item.name}" data-desc="${item.desc}">
                    <div class="hero-section">
                        <div>
                            <h5 class="mb-0">${item.name}</h5>
                            <p class="text-muted mb-0">${item.desc}</p>
                        </div>
                        <button class="btn btn-dark btn-sm toggle-summary-btn" data-api-path="${item.path}" data-api-name="${item.name}" data-api-desc="${item.desc}">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                    <div class="summary-section">
                        ${hasParams ? `
                            <div class="input-params">
                                <h4>Parameter Input</h4>
                                ${paramInputs}
                                ${innerDesc}
                            </div>
                        ` : ''}
                        <div class="live-endpoint">
                            <h4>Live Endpoint</h4>
                            <div class="input-group">
                                <input type="text" class="form-control endpoint-input" value="${defaultEndpoint}" readonly>
                                <button class="btn btn-dark copy-btn" title="Salin Endpoint">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        <div class="button-group d-flex">
                            <button class="btn btn-try try-api-btn" data-api-path="${item.path}" data-api-name="${item.name}" data-api-desc="${item.desc}">
                                Coba Sekarang
                            </button>
                            ${hasParams ? `
                                <button class="btn btn-dark clear-btn">
                                    Bersihkan
                                </button>
                            ` : ''}
                        </div>
                        <div class="response-section mt-3">
                            <h4>Respons</h4>
                            <div class="response-wrapper position-relative">
                                <pre class="code-block response-content d-none"></pre>
                                <button class="btn btn-dark copy-response-btn" title="Salin Respons" style="display: none;">
                                    <i class="fas fa-copy"></i>
                                </button>
                                <div class="response-loading d-none d-flex justify-content-center align-items-center">
                                    <div class="spinner-border custom-spinner" role="status">
                                        <span class="visually-hidden">Memuat...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        apiContent.insertAdjacentHTML('beforeend', `<h3 class="mb-3 category-header">${category.name}</h3><div class="row">${categoryContent}</div>`);
    }

    // Event listener untuk interaksi API
    document.addEventListener('click', (event) => {
        // Toggle bagian ringkasan
        if (event.target.closest('.toggle-summary-btn')) {
            const btn = event.target.closest('.toggle-summary-btn');
            const summary = btn.closest('.api-item').querySelector('.summary-section');
            const icon = btn.querySelector('i');
            summary.classList.toggle('active');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        }

        // Salin endpoint
        if (event.target.closest('.copy-btn')) {
            const btn = event.target.closest('.copy-btn');
            const input = btn.previousElementSibling;
            input.select();
            navigator.clipboard.writeText(input.value).then(() => {
                btn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            });
        }

        // Salin respons
        if (event.target.closest('.copy-response-btn')) {
            const btn = event.target.closest('.copy-response-btn');
            const content = btn.closest('.response-wrapper').querySelector('.response-content').textContent;
            if (content) {
                navigator.clipboard.writeText(content).then(() => {
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                });
            }
        }

        // Tombol bersihkan
        if (event.target.closest('.clear-btn')) {
            const apiItem = event.target.closest('.api-item');
            const inputs = apiItem.querySelectorAll('.param-input');
            const endpointInput = apiItem.querySelector('.endpoint-input');
            const responseContent = apiItem.querySelector('.response-content');
            const copyResponseBtn = apiItem.querySelector('.copy-response-btn');
            inputs.forEach(input => {
                input.value = '';
                input.classList.remove('is-invalid');
            });
            endpointInput.value = endpointInput.value.split('?')[0];
            responseContent.innerHTML = '';
            responseContent.classList.add('d-none');
            copyResponseBtn.style.display = 'none';
        }

        // Tombol coba API
        if (!event.target.classList.contains('try-api-btn')) return;

        const { apiPath, apiName } = event.target.dataset;
        const apiItem = event.target.closest('.api-item');
        const responseContent = apiItem.querySelector('.response-content');
        const responseLoading = apiItem.querySelector('.response-loading');
        const copyResponseBtn = apiItem.querySelector('.copy-response-btn');

        let baseApiUrl = `${window.location.origin}${apiPath}`;
        const params = new URLSearchParams(apiPath.split('?')[1]);
        const hasParams = params.toString().length > 0;

        if (hasParams) {
            const inputs = apiItem.querySelectorAll('.param-input');
            const newParams = new URLSearchParams();
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                    newParams.append(input.dataset.param, input.value.trim());
                }
            });

            if (!isValid) {
                responseContent.textContent = 'Isi semua kolom yang diperlukan!';
                responseContent.classList.remove('d-none');
                copyResponseBtn.style.display = 'block';
                return;
            }

            baseApiUrl = `${window.location.origin}${apiPath.split('?')[0]}?${newParams.toString()}&apiKey=${currentUser.apiKey}`;
        } else {
            baseApiUrl = `${baseApiUrl}${baseApiUrl.includes('?') ? '&' : '?'}apiKey=${currentUser.apiKey}`;
        }

        handleApiRequest(baseApiUrl, responseContent, responseLoading, copyResponseBtn, apiName);
    });

    // Update endpoint saat input parameter berubah
    document.addEventListener('input', (event) => {
        if (!event.target.classList.contains('param-input')) {
            return;
        }

        const apiItem = event.target.closest('.api-item');
        const endpointInput = apiItem.querySelector('.endpoint-input');
        const basePath = endpointInput.value.split('?')[0];
        const inputs = apiItem.querySelectorAll('.param-input');
        const newParams = new URLSearchParams();

        inputs.forEach(input => {
            if (input.value.trim()) {
                newParams.append(input.dataset.param, input.value.trim());
            }
        });

        endpointInput.value = newParams.toString() ? `${basePath}?${newParams.toString()}&apiKey=${currentUser.apiKey}` : `${basePath}?apiKey=${currentUser.apiKey}`;
    });

    // Handle request API
    async function handleApiRequest(apiUrl, responseContent, responseLoading, copyResponseBtn, apiName) {
        responseLoading.classList.remove('d-none');
        responseContent.classList.add('d-none');
        copyResponseBtn.style.display = 'none';

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const contentType = response.headers.get('Content-Type');
            responseContent.innerHTML = '';
            if (contentType && contentType.startsWith('image/')) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = apiName;
                img.style.maxWidth = '100%';
                img.style.borderRadius = '5px';
                responseContent.appendChild(img);
            } else {
                const data = await response.json();
                responseContent.textContent = JSON.stringify(data, null, 2);
                copyResponseBtn.style.display = 'block';
            }

            responseContent.classList.remove('d-none');
        } catch (error) {
            responseContent.textContent = `Error: ${error.message}`;
            responseContent.classList.remove('d-none');
            copyResponseBtn.style.display = 'block';
        } finally {
            responseLoading.classList.add('d-none');
        }
    }

    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    sidebarClose.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Efek scroll navbar
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Fungsi untuk menampilkan kode QR
    window.showQRCode = function(type) {
        const qrMonthly = document.getElementById('qr-monthly');
        const qrYearly = document.getElementById('qr-yearly');
        if (type === 'monthly') {
            qrMonthly.classList.toggle('d-none');
            qrYearly.classList.add('d-none');
        } else {
            qrYearly.classList.toggle('d-none');
            qrMonthly.classList.add('d-none');
        }
    };

    // Sembunyikan layar pemuatan
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        body.classList.remove('no-scroll');
    }, 2000);
});
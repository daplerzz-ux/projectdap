document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Inisialisasi Data User Jika Belum Ada
    function initializeUserData() {
        if (!localStorage.getItem('userData')) {
            const defaultUser = {
                username: 'admin',
                password: '1',
                namaTampilan: 'PT. Tjandra Miftah Raharja'
            };
            localStorage.setItem('userData', JSON.stringify(defaultUser));
        }
    }
    initializeUserData();

    // Cek jika pengguna sudah login, langsung arahkan ke dashboard
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }

    // Fungsi untuk tombol tampilkan password
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('bi-eye');
        this.classList.toggle('bi-eye-slash');
    });

    // Fungsi login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const usernameInput = document.getElementById('username').value;
        const passwordInputVal = passwordInput.value;

        const validUserData = JSON.parse(localStorage.getItem('userData'));

        if (usernameInput === validUserData.username && passwordInputVal === validUserData.password) {
            sessionStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.classList.remove('d-none');
        }
    });
});

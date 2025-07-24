// Skrip ini akan berjalan di setiap halaman yang dilindungi
(function() {
    // Cek apakah ada status 'isLoggedIn' di sessionStorage
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');

    // Jika tidak ada (artinya belum login), paksa kembali ke halaman login
    if (isLoggedIn !== 'true') {
        // Tampilkan notifikasi dan arahkan kembali
        alert('Anda harus masuk terlebih dahulu untuk mengakses halaman ini.');
        window.location.href = 'login.html';
    }
})();

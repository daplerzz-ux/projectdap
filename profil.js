document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    const usernameDisplay = document.getElementById('username-display');
    const namaTampilanInput = document.getElementById('nama-tampilan');

    // Ambil data user dari localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));

    // Tampilkan data yang ada ke dalam form
    if (userData) {
        usernameDisplay.value = userData.username;
        namaTampilanInput.value = userData.namaTampilan;
    }

    // Fungsi saat form disubmit
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newNamaTampilan = namaTampilanInput.value;

        if (newNamaTampilan.trim() === '') {
            alert('Nama tampilan tidak boleh kosong.');
            return;
        }

        // Update nama tampilan di objek userData
        userData.namaTampilan = newNamaTampilan;

        // Simpan kembali objek userData yang sudah diperbarui ke localStorage
        localStorage.setItem('userData', JSON.stringify(userData));

        alert('Nama tampilan berhasil diubah!');
        // Muat ulang halaman untuk menampilkan nama baru di header
        location.reload();
    });
});

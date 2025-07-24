document.addEventListener('DOMContentLoaded', () => {
    const changePasswordForm = document.getElementById('change-password-form');
    const btnEkspor = document.getElementById('btn-ekspor-data');
    const btnHapus = document.getElementById('btn-hapus-semua-data');

    // --- Fungsi Ubah Password ---
    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Ambil data user dari localStorage
        const userData = JSON.parse(localStorage.getItem('userData'));

        if (oldPassword !== userData.password) {
            alert('Password lama salah!');
            return;
        }

        if (newPassword.length < 1) {
            alert('Password baru tidak boleh kosong.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Password baru dan konfirmasi tidak cocok!');
            return;
        }

        // Simpan password baru
        userData.password = newPassword;
        localStorage.setItem('userData', JSON.stringify(userData));

        alert('Password berhasil diubah!');
        changePasswordForm.reset();
    });

    // --- Fungsi Ekspor Data ---
    btnEkspor.addEventListener('click', () => {
        const dataPenilaian = localStorage.getItem('penilaianKaryawan');
        if (!dataPenilaian || dataPenilaian === '[]') {
            alert('Tidak ada data penilaian untuk diekspor.');
            return;
        }

        const blob = new Blob([dataPenilaian], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_penilaian_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('Data berhasil diekspor!');
    });

    // --- Fungsi Hapus Semua Data ---
    btnHapus.addEventListener('click', () => {
        if (confirm('PERINGATAN: Apakah Anda benar-benar yakin ingin menghapus SEMUA data penilaian?')) {
            if (confirm('KONFIRMASI KEDUA: Aksi ini tidak dapat dibatalkan. Lanjutkan?')) {
                localStorage.removeItem('penilaianKaryawan');
                alert('Semua data penilaian berhasil dihapus.');
                // Arahkan ke dashboard untuk melihat perubahannya
                window.location.href = 'dashboard.html';
            }
        }
    });
});

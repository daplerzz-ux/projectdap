document.addEventListener('DOMContentLoaded', () => {
    const dataToPrint = JSON.parse(sessionStorage.getItem('dataUntukCetak'));

    if (!dataToPrint) {
        document.body.innerHTML = '<div class="alert alert-danger m-3">Data tidak ditemukan. Silakan kembali dan coba lagi.</div>';
        return;
    }

    // Isi informasi dasar karyawan
    document.getElementById('cetak-nama').textContent = dataToPrint.nama || '-';
    document.getElementById('cetak-jabatan').textContent = dataToPrint.jabatan || '-';
    document.getElementById('cetak-lokasi').textContent = dataToPrint.lokasi || '-';
    document.getElementById('cetak-periode').textContent = dataToPrint.periode || '-';
    document.getElementById('cetak-catatan').textContent = dataToPrint.catatan || '-'; // PERUBAHAN DI SINI

    // Hitung skor akhir (rata-rata 1-5 dikonversi ke skala 100)
    const skorAkhir = (dataToPrint.rata_rata / 5) * 100;
    document.getElementById('cetak-skor-akhir').textContent = skorAkhir.toFixed(2);

    // Daftar semua ID input skor
    const scoreInputIds = [
        'skill_team_work', 'skill_komunikasi', 'skill_manajemen_waktu', 'skill_goal_setting', 'skill_problem_solving',
        'knowledge_pengalaman', 'knowledge_teori', 'knowledge_pengembangan',
        'attitude_integritas', 'attitude_empati', 'attitude_kooperatif', 'attitude_percaya_diri', 'attitude_komitmen', 'attitude_jujur', 'attitude_self_motivation'
    ];

    // Isi tabel skor dengan tanda centang (✓)
    scoreInputIds.forEach(id => {
        const score = dataToPrint[id]; // Nilai 1-5
        if (score) {
            const cell = document.getElementById(`cell-${id}-${score}`);
            if (cell) {
                cell.textContent = '✓';
            }
        }
    });

    // Tunda pencetakan
    setTimeout(() => {
        window.print();
        window.onafterprint = () => {
            sessionStorage.removeItem('dataUntukCetak');
            window.close();
        };
    }, 500);
});

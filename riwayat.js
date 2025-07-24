document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('riwayat-table-body');
    const namaDisplay = document.getElementById('riwayat-nama');
    const nipDisplay = document.getElementById('riwayat-nip');
    const jabatanDisplay = document.getElementById('riwayat-jabatan');

    function getPenilaianData() {
        const data = localStorage.getItem('penilaianKaryawan');
        return data ? JSON.parse(data) : [];
    }

    const getPredikatBadge = (predikat) => {
        switch (predikat) {
            case 'Sangat Baik': return 'bg-success';
            case 'Baik': return 'bg-primary';
            case 'Cukup': return 'bg-info';
            case 'Kurang': return 'bg-warning';
            case 'Sangat Kurang': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    function renderHistoryPage() {
        const nip = sessionStorage.getItem('lihatRiwayatNIP');
        if (!nip) {
            document.querySelector('.container-fluid').innerHTML = '<div class="alert alert-danger">Karyawan tidak ditemukan. Silakan kembali ke halaman Data Karyawan.</div>';
            return;
        }

        const allData = getPenilaianData();
        const historyData = allData
            .filter(item => item.nip === nip)
            .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        if (historyData.length === 0) {
            document.querySelector('.container-fluid').innerHTML = '<div class="alert alert-warning">Tidak ada riwayat penilaian untuk karyawan ini.</div>';
            return;
        }

        // Tampilkan informasi karyawan dari data terbaru
        const latestData = historyData[0];
        namaDisplay.textContent = latestData.nama;
        nipDisplay.textContent = latestData.nip;
        jabatanDisplay.textContent = latestData.jabatan;

        // Tampilkan riwayat di tabel
        tableBody.innerHTML = '';
        historyData.forEach(item => {
            const tr = document.createElement('tr');
            const tanggal = new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
            tr.innerHTML = `
                <td>${tanggal}</td>
                <td>${item.periode}</td>
                <td class="fw-bold">${item.rata_rata.toFixed(2)}</td>
                <td><span class="badge ${getPredikatBadge(item.predikat)}">${item.predikat}</span></td>
                <td>
                    <button class="btn btn-sm btn-info btn-cetak-riwayat" title="Cetak Laporan Ini"><i class="bi bi-printer"></i></button>
                </td>
            `;
            // Simpan data lengkap di elemen tr untuk dicetak
            tr.dataset.penilaian = JSON.stringify(item);
            tableBody.appendChild(tr);
        });
    }

    // Event listener untuk tombol cetak di dalam tabel riwayat
    tableBody.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button');
        if (targetButton && targetButton.classList.contains('btn-cetak-riwayat')) {
            const tr = targetButton.closest('tr');
            const data = JSON.parse(tr.dataset.penilaian);
            sessionStorage.setItem('dataUntukCetak', JSON.stringify(data));
            window.open('cetak-laporan.html', '_blank');
        }
    });

    renderHistoryPage();
});

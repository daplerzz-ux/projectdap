document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('pegawai-table-body');
    const btnTambah = document.getElementById('btn-tambah-pegawai');
    const btnCetak = document.getElementById('btn-cetak-daftar');

    function getPenilaianData() {
        const data = localStorage.getItem('penilaianKaryawan');
        return data ? JSON.parse(data) : [];
    }
    
    function savePenilaianData(data) {
        localStorage.setItem('penilaianKaryawan', JSON.stringify(data));
    }

    function renderPegawaiTable() {
        const allData = getPenilaianData();
        const pegawaiUnik = [];
        const map = new Map();
        
        allData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        for (const item of allData) {
            if (!map.has(item.nip)) {
                map.set(item.nip, true);
                pegawaiUnik.push({
                    nama: item.nama,
                    nip: item.nip,
                    jabatan: item.jabatan,
                    lokasi: item.lokasi
                });
            }
        }
        
        pegawaiUnik.sort((a, b) => a.nama.localeCompare(b.nama));

        tableBody.innerHTML = '';
        if (pegawaiUnik.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada data karyawan.</td></tr>';
            return;
        }

        pegawaiUnik.forEach((pegawai, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td>${pegawai.nama}</td>
                <td>${pegawai.nip}</td>
                <td>${pegawai.jabatan || '-'}</td>
                <td>${pegawai.lokasi}</td>
                <td class="d-print-none">
                    <button class="btn btn-sm btn-success btn-riwayat" data-nip="${pegawai.nip}" title="Lihat Riwayat Penilaian"><i class="bi bi-clock-history"></i></button>
                    <button class="btn btn-sm btn-warning btn-edit-pegawai" data-nip="${pegawai.nip}" title="Edit Data Induk"><i class="bi bi-person-gear"></i></button>
                    <button class="btn btn-sm btn-danger btn-hapus-pegawai" data-nip="${pegawai.nip}" title="Hapus Semua Data Karyawan Ini"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    btnTambah.addEventListener('click', () => {
        sessionStorage.removeItem('editKaryawanNIP');
        window.location.href = 'karyawan-form.html';
    });

    btnCetak.addEventListener('click', () => {
        window.print();
    });

    tableBody.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button');
        if (!targetButton) return;

        const nip = targetButton.dataset.nip;

        if (targetButton.classList.contains('btn-hapus-pegawai')) {
            if (confirm(`Apakah Anda yakin ingin menghapus semua data untuk NIP ${nip}? Aksi ini tidak dapat dibatalkan.`)) {
                let allData = getPenilaianData();
                const newData = allData.filter(item => item.nip !== nip);
                savePenilaianData(newData);
                renderPegawaiTable();
                alert('Semua data untuk karyawan tersebut berhasil dihapus.');
            }
        }

        if (targetButton.classList.contains('btn-edit-pegawai')) {
            sessionStorage.setItem('editKaryawanNIP', nip);
            window.location.href = 'karyawan-form.html';
        }

        // LOGIKA BARU UNTUK TOMBOL RIWAYAT
        if (targetButton.classList.contains('btn-riwayat')) {
            sessionStorage.setItem('lihatRiwayatNIP', nip);
            window.location.href = 'riwayat.html';
        }
    });

    renderPegawaiTable();
});

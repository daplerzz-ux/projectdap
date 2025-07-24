document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('laporan-table-body');
    const btnCetakLaporan = document.getElementById('btn-cetak-laporan');
    const filterQuartal = document.getElementById('filter-quartal-laporan');
    const filterTahun = document.getElementById('filter-tahun-laporan');

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
    
    function setupFilters() {
        const startYear = 2025;
        filterTahun.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const year = startYear + i;
            const option = new Option(year, year);
            filterTahun.add(option);
        }
        
        const currentYear = new Date().getFullYear();
        filterTahun.value = (currentYear >= 2025 && currentYear <= 2029) ? currentYear : "2025";
        
        const currentMonth = new Date().getMonth() + 1;
        if (currentMonth <= 3) filterQuartal.value = 1;
        else if (currentMonth <= 6) filterQuartal.value = 2;
        else if (currentMonth <= 9) filterQuartal.value = 3;
        else filterQuartal.value = 4;
    }

    function renderRankingTable(quartal, year) {
        const allData = getPenilaianData();
        let dataToRank = allData;

        // 1. Saring data berdasarkan periode yang dipilih
        if (year) {
            dataToRank = allData.filter(item => Number(item.tahunDisimpan) === Number(year));
            if (quartal) {
                const quartalMonths = { '1': [1, 2, 3], '2': [4, 5, 6], '3': [7, 8, 9], '4': [10, 11, 12] };
                const monthsInQuartal = quartalMonths[quartal];
                dataToRank = dataToRank.filter(item => monthsInQuartal.includes(item.bulanDisimpan));
            }
        }

        // 2. Dari data yang sudah disaring, ambil skor terbaru untuk setiap karyawan
        const latestScores = new Map();
        dataToRank.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        for (const item of dataToRank) {
            if (!latestScores.has(item.nip)) {
                latestScores.set(item.nip, item);
            }
        }

        // 3. Ubah menjadi Array dan urutkan berdasarkan skor rata-rata tertinggi
        const rankedEmployees = Array.from(latestScores.values());
        rankedEmployees.sort((a, b) => b.rata_rata - a.rata_rata);

        // 4. Tampilkan hasilnya di tabel
        tableBody.innerHTML = '';
        if (rankedEmployees.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada data penilaian untuk periode ini.</td></tr>';
            return;
        }

        rankedEmployees.forEach((pegawai, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <th scope="row" class="text-center">${index + 1}</th>
                <td>${pegawai.nama}</td>
                <td>${pegawai.nip}</td>
                <td>${pegawai.jabatan || '-'}</td>
                <td class="fw-bold">${pegawai.rata_rata.toFixed(2)}</td>
                <td><span class="badge ${getPredikatBadge(pegawai.predikat)}">${pegawai.predikat}</span></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Event listener untuk filter
    filterQuartal.addEventListener('change', () => renderRankingTable(filterQuartal.value, filterTahun.value));
    filterTahun.addEventListener('change', () => renderRankingTable(filterQuartal.value, filterTahun.value));
    
    // Event listener untuk tombol cetak
    btnCetakLaporan.addEventListener('click', () => {
        window.print();
    });

    // Inisialisasi
    setupFilters();
    renderRankingTable(filterQuartal.value, filterTahun.value);
});

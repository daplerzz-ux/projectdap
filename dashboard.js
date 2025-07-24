document.addEventListener('DOMContentLoaded', () => {
    const filterQuartal = document.getElementById('filter-quartal-dashboard');
    const filterTahun = document.getElementById('filter-tahun-dashboard');
    const ctx = document.getElementById('distribusiChart').getContext('2d');
    let distribusiChart; // Variabel untuk menyimpan instance grafik

    function getPenilaianData() {
        const data = localStorage.getItem('penilaianKaryawan');
        return data ? JSON.parse(data) : [];
    }

    function setupFilters() {
        const startYear = 2025;
        // PERBAIKAN DI SINI: Kosongkan dropdown sebelum mengisi untuk mencegah duplikasi
        filterTahun.innerHTML = ''; 
        for (let i = 0; i < 5; i++) {
            const year = startYear + i;
            const option = new Option(year, year);
            filterTahun.add(option);
        }
        
        const currentYear = new Date().getFullYear();
        // Atur tahun ke 2025 jika tahun saat ini di luar rentang, jika tidak, gunakan tahun saat ini
        filterTahun.value = (currentYear >= 2025 && currentYear <= 2029) ? currentYear : "2025";
        
        // Mengatur quartal default berdasarkan bulan saat ini
        const currentMonth = new Date().getMonth() + 1;
        if (currentMonth <= 3) filterQuartal.value = 1;
        else if (currentMonth <= 6) filterQuartal.value = 2;
        else if (currentMonth <= 9) filterQuartal.value = 3;
        else filterQuartal.value = 4;
    }

    function updateDashboard(quartal, year) {
        const allData = getPenilaianData();
        let filteredData = allData;

        // Terapkan filter jika ada
        if (year) {
            filteredData = allData.filter(item => Number(item.tahunDisimpan) === Number(year));
            if (quartal) {
                const quartalMonths = { '1': [1, 2, 3], '2': [4, 5, 6], '3': [7, 8, 9], '4': [10, 11, 12] };
                const monthsInQuartal = quartalMonths[quartal];
                filteredData = filteredData.filter(item => monthsInQuartal.includes(item.bulanDisimpan));
            }
        }

        // --- Hitung Ulang Statistik Berdasarkan Data yang Difilter ---
        const totalKaryawan = filteredData.length;
        const rataRataKeseluruhan = totalKaryawan > 0 ? (filteredData.reduce((sum, item) => sum + item.rata_rata, 0) / totalKaryawan) : 0;
        
        const distribusiPredikat = filteredData.reduce((acc, item) => {
            if (item.predikat !== 'Belum Dinilai') { // Jangan hitung data dummy
                acc[item.predikat] = (acc[item.predikat] || 0) + 1;
            }
            return acc;
        }, {});

        const kinerjaTerbaik = distribusiPredikat['Sangat Baik'] || 0;
        const perluPerhatian = (distribusiPredikat['Kurang'] || 0) + (distribusiPredikat['Sangat Kurang'] || 0);

        // --- Update Kartu KPI ---
        document.getElementById('total-karyawan').textContent = totalKaryawan;
        document.getElementById('rata-rata-keseluruhan').textContent = rataRataKeseluruhan.toFixed(2);
        document.getElementById('kinerja-terbaik').textContent = kinerjaTerbaik;
        document.getElementById('perlu-perhatian').textContent = perluPerhatian;

        // --- Update Grafik ---
        const urutanPredikat = ['Sangat Baik', 'Baik', 'Cukup', 'Kurang', 'Sangat Kurang'];
        const labels = urutanPredikat.filter(p => distribusiPredikat[p] !== undefined);
        const data = labels.map(label => distribusiPredikat[label]);

        const colorMap = {
            'Sangat Baik': { bg: 'rgba(40, 167, 69, 0.7)', border: '#28a745' },
            'Baik': { bg: 'rgba(10, 48, 97, 0.7)', border: '#0a3061' },
            'Cukup': { bg: 'rgba(0, 123, 255, 0.7)', border: '#007bff' },
            'Kurang': { bg: 'rgba(255, 193, 7, 0.7)', border: '#ffc107' },
            'Sangat Kurang': { bg: 'rgba(220, 53, 69, 0.7)', border: '#dc3545' }
        };

        const backgroundColors = labels.map(label => colorMap[label]?.bg || 'rgba(108, 117, 125, 0.7)');
        const borderColors = labels.map(label => colorMap[label]?.border || '#6c757d');

        if (distribusiChart) {
            // Jika grafik sudah ada, perbarui datanya
            distribusiChart.data.labels = labels;
            distribusiChart.data.datasets[0].data = data;
            distribusiChart.data.datasets[0].backgroundColor = backgroundColors;
            distribusiChart.data.datasets[0].borderColor = borderColors;
            distribusiChart.update();
        } else {
            // Jika belum ada, buat grafik baru
            distribusiChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Jumlah Karyawan',
                        data: data,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
        }
    }

    // Event listener untuk filter
    filterQuartal.addEventListener('change', () => updateDashboard(filterQuartal.value, filterTahun.value));
    filterTahun.addEventListener('change', () => updateDashboard(filterQuartal.value, filterTahun.value));

    // Inisialisasi
    setupFilters();
    updateDashboard(filterQuartal.value, filterTahun.value);
});

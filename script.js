document.addEventListener('DOMContentLoaded', () => {
    // --- Deklarasi Elemen ---
    const form = document.getElementById('form-penilaian');
    const tableBody = document.getElementById('hasil-penilaian');
    const editIdInput = document.getElementById('edit-id');
    const btnBatalEdit = document.getElementById('btn-batal-edit');
    const filterQuartal = document.getElementById('filter-quartal');
    const filterTahun = document.getElementById('filter-tahun');
    const btnTampilkanSemua = document.getElementById('btn-tampilkan-semua');
    const pilihPegawaiDropdown = document.getElementById('pilih-pegawai');
    const tanggalPenilaianInput = document.getElementById('tanggal-penilaian');
    const periodeQuartalInput = document.getElementById('periode-quartal');
    const periodeTahunInput = document.getElementById('periode-tahun');

    const scoreInputIds = [
        'skill_team_work', 'skill_komunikasi', 'skill_manajemen_waktu', 'skill_goal_setting', 'skill_problem_solving',
        'knowledge_pengalaman', 'knowledge_teori', 'knowledge_pengembangan',
        'attitude_integritas', 'attitude_empati', 'attitude_kooperatif', 'attitude_percaya_diri', 'attitude_komitmen', 'attitude_jujur', 'attitude_self_motivation'
    ];

    // --- Fungsi Bantuan ---
    const getPenilaianData = () => JSON.parse(localStorage.getItem('penilaianKaryawan')) || [];
    const savePenilaianData = (data) => localStorage.setItem('penilaianKaryawan', JSON.stringify(data));
    const hitungPredikat = (rata_rata) => {
        if (rata_rata >= 4.5) return 'Sangat Baik';
        if (rata_rata >= 3.5) return 'Baik';
        if (rata_rata >= 2.5) return 'Cukup';
        if (rata_rata >= 1.5) return 'Kurang';
        return 'Sangat Kurang';
    };
    const getPredikatBadge = (predikat) => {
        const classMap = { 'Sangat Baik': 'bg-success', 'Baik': 'bg-primary', 'Cukup': 'bg-info', 'Kurang': 'bg-warning', 'Sangat Kurang': 'bg-danger' };
        return classMap[predikat] || 'bg-secondary';
    };

    // --- Fungsi Utama ---
    function setupFilters() {
        const startYear = 2025;
        filterTahun.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const year = startYear + i;
            filterTahun.add(new Option(year, year));
        }
        
        const currentYear = new Date().getFullYear();
        filterTahun.value = (currentYear >= 2025 && currentYear <= 2029) ? currentYear : "2025";
        
        const currentMonth = new Date().getMonth() + 1;
        if (currentMonth <= 3) filterQuartal.value = 1;
        else if (currentMonth <= 6) filterQuartal.value = 2;
        else if (currentMonth <= 9) filterQuartal.value = 3;
        else filterQuartal.value = 4;
    }

    function renderTable(quartal, year) {
        let allData = getPenilaianData();
        let filteredData = allData;

        if (quartal && year) {
            const quartalMonths = { '1': [1, 2, 3], '2': [4, 5, 6], '3': [7, 8, 9], '4': [10, 11, 12] };
            const monthsInQuartal = quartalMonths[quartal];
            filteredData = allData.filter(item => 
                item.hasOwnProperty('bulanDisimpan') && 
                item.hasOwnProperty('tahunDisimpan') &&
                monthsInQuartal.includes(Number(item.bulanDisimpan)) && 
                Number(item.tahunDisimpan) === Number(year)
            );
        }
        
        filteredData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        tableBody.innerHTML = '';
        if (filteredData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Tidak ada data untuk periode ini.</td></tr>';
            return;
        }

        filteredData.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.nama}</td> <td>${p.nip}</td> <td>${p.lokasi}</td>
                <td>${p.rata_rata.toFixed(2)}</td>
                <td><span class="badge ${getPredikatBadge(p.predikat)}">${p.predikat}</span></td>
                <td>${p.catatan || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info btn-cetak" data-id="${p.id}" title="Cetak Laporan"><i class="bi bi-printer"></i></button>
                    <button class="btn btn-sm btn-warning btn-edit" data-id="${p.id}" title="Edit"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${p.id}" title="Hapus"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tr.dataset.penilaian = JSON.stringify(p);
            tableBody.appendChild(tr);
        });
    }

    function resetForm() {
        form.reset();
        editIdInput.value = '';
        pilihPegawaiDropdown.value = '';
        ['nama', 'nip', 'lokasi', 'jabatan'].forEach(id => document.getElementById(id).disabled = false);
        tanggalPenilaianInput.value = new Date().toISOString().slice(0, 10);
        form.querySelector('button[type="submit"]').textContent = 'Simpan Penilaian';
        btnBatalEdit.classList.add('d-none');
    }

    function fillFormWithData(data) {
        editIdInput.value = data.id;
        ['nama', 'nip', 'lokasi', 'jabatan', 'catatan'].forEach(key => {
            document.getElementById(key).value = data[key];
        });
        tanggalPenilaianInput.value = data.tanggal.slice(0, 10);
        
        if (data.periode && data.periode.includes(' ')) {
            const [quartal, tahun] = data.periode.split(' ');
            periodeQuartalInput.value = quartal;
            periodeTahunInput.value = tahun;
        }

        scoreInputIds.forEach(id => {
            document.getElementById(id).value = data[id];
        });

        form.querySelector('button[type="submit"]').textContent = 'Update Data';
        btnBatalEdit.classList.remove('d-none');
        window.scrollTo(0, 0);
    }

    function populatePegawaiDropdown() {
        const allData = getPenilaianData();
        const pegawaiUnik = new Map();
        allData.forEach(item => {
            if (!pegawaiUnik.has(item.nip)) {
                pegawaiUnik.set(item.nip, item);
            }
        });
        
        const sortedPegawai = Array.from(pegawaiUnik.values()).sort((a,b) => a.nama.localeCompare(b.nama));

        pilihPegawaiDropdown.innerHTML = '<option value="">-- Pilih Karyawan yang Sudah Ada --</option>';
        sortedPegawai.forEach(pegawai => {
            const option = new Option(`${pegawai.nama} (${pegawai.nip})`, pegawai.nip);
            option.dataset.pegawai = JSON.stringify(pegawai);
            pilihPegawaiDropdown.appendChild(option);
        });
    }
    
    // --- Event Listeners ---
    pilihPegawaiDropdown.addEventListener('change', (e) => {
        const selectedOption = e.target.selectedOptions[0];
        if (selectedOption.value) {
            const pegawaiData = JSON.parse(selectedOption.dataset.pegawai);
            ['nama', 'nip', 'lokasi', 'jabatan'].forEach(key => {
                document.getElementById(key).value = pegawaiData[key];
                document.getElementById(key).disabled = true;
            });
            editIdInput.value = '';
            form.querySelector('button[type="submit"]').textContent = 'Simpan Penilaian Baru';
        } else {
            resetForm();
        }
    });

    filterQuartal.addEventListener('change', () => renderTable(filterQuartal.value, filterTahun.value));
    filterTahun.addEventListener('change', () => renderTable(filterQuartal.value, filterTahun.value));
    
    btnTampilkanSemua.addEventListener('click', () => {
        setupFilters();
        renderTable(); // Panggil tanpa argumen untuk menampilkan semua
    });
    
    btnBatalEdit.addEventListener('click', resetForm);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const allData = getPenilaianData();
        const idToEdit = editIdInput.value;

        const penilaianData = {
            nama: document.getElementById('nama').value,
            nip: document.getElementById('nip').value,
            lokasi: document.getElementById('lokasi').value,
            jabatan: document.getElementById('jabatan').value,
            periode: `${periodeQuartalInput.value} ${periodeTahunInput.value}`,
            catatan: document.getElementById('catatan').value,
        };

        let totalScore = 0;
        scoreInputIds.forEach(id => {
            const value = parseInt(document.getElementById(id).value || 0);
            penilaianData[id] = value;
            totalScore += value;
        });

        penilaianData.rata_rata = totalScore / scoreInputIds.length;
        penilaianData.predikat = hitungPredikat(penilaianData.rata_rata);

        // --- PERBAIKAN LOGIKA PENYIMPANAN TANGGAL ---
        const now = new Date(); // Gunakan waktu saat ini untuk ID dan pengurutan
        const quartal = periodeQuartalInput.value;
        const tahun = periodeTahunInput.value;
        
        // Tentukan bulan representatif dari quartal yang dipilih
        const monthMap = { 'Q1': 1, 'Q2': 4, 'Q3': 7, 'Q4': 10 };
        const bulanUntukFilter = monthMap[quartal];

        penilaianData.tahunDisimpan = parseInt(tahun);
        penilaianData.bulanDisimpan = bulanUntukFilter;
        penilaianData.tanggal = now.toISOString(); // Tetap simpan tanggal asli untuk pengurutan
        // --- AKHIR PERBAIKAN ---

        if (idToEdit) {
            const index = allData.findIndex(item => item.id == idToEdit);
            if (index !== -1) {
                // Pertahankan ID dan tanggal asli saat mengedit
                penilaianData.id = allData[index].id;
                penilaianData.tanggal = allData[index].tanggal;
                allData[index] = penilaianData;
            }
        } else {
            if (!pilihPegawaiDropdown.value && allData.some(item => item.nip === penilaianData.nip)) {
                alert('Error: NIP sudah ada. Gunakan dropdown untuk menilai ulang.');
                return;
            }
            penilaianData.id = Date.now();
            allData.push(penilaianData);
        }

        savePenilaianData(allData);
        alert(`Data berhasil ${idToEdit ? 'diperbarui' : 'disimpan'}!`);
        resetForm();
        renderTable(filterQuartal.value, filterTahun.value);
        populatePegawaiDropdown();
    });

    tableBody.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button');
        if (!targetButton) return;
        const id = targetButton.dataset.id;
        const tr = targetButton.closest('tr');
        const data = JSON.parse(tr.dataset.penilaian);
        
        if (targetButton.classList.contains('btn-delete')) {
            if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                savePenilaianData(getPenilaianData().filter(item => item.id != id));
                renderTable(filterQuartal.value, filterTahun.value);
                populatePegawaiDropdown();
            }
        } else if (targetButton.classList.contains('btn-edit')) {
            fillFormWithData(data);
        } else if (targetButton.classList.contains('btn-cetak')) {
            sessionStorage.setItem('dataUntukCetak', JSON.stringify(data));
            window.open('cetak-laporan.html', '_blank');
        }
    });

    function checkForEditFromPegawai() {
        const nipToEdit = sessionStorage.getItem('editKaryawanNIP');
        if (nipToEdit) {
            const allData = getPenilaianData();
            const latestData = allData.filter(item => item.nip === nipToEdit).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))[0];
            if (latestData) {
                fillFormWithData(latestData);
            }
            sessionStorage.removeItem('editKaryawanNIP');
        }
    }

    // Inisialisasi
    setupFilters();
    renderTable(filterQuartal.value, filterTahun.value);
    populatePegawaiDropdown();
    checkForEditFromPegawai();
});

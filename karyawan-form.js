document.addEventListener('DOMContentLoaded', () => {
    const karyawanForm = document.getElementById('karyawan-form');
    const formTitle = document.getElementById('form-title');
    const nipInput = document.getElementById('nip');
    const namaInput = document.getElementById('nama');
    const lokasiInput = document.getElementById('lokasi');
    const jabatanInput = document.getElementById('jabatan');

    function getPenilaianData() {
        const data = localStorage.getItem('penilaianKaryawan');
        return data ? JSON.parse(data) : [];
    }

    function savePenilaianData(data) {
        localStorage.setItem('penilaianKaryawan', JSON.stringify(data));
    }

    // Cek apakah kita dalam mode edit
    const nipToEdit = sessionStorage.getItem('editKaryawanNIP');

    if (nipToEdit) {
        formTitle.textContent = 'Edit Data Induk Karyawan';
        const allData = getPenilaianData();
        // Ambil data terakhir dari karyawan yang akan diedit
        const karyawanData = allData.filter(item => item.nip === nipToEdit).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))[0];

        if (karyawanData) {
            namaInput.value = karyawanData.nama;
            nipInput.value = karyawanData.nip;
            lokasiInput.value = karyawanData.lokasi;
            jabatanInput.value = karyawanData.jabatan;
            
            // NIP tidak boleh diubah saat mode edit untuk menjaga integritas data
            nipInput.disabled = true; 
        }
    }

    karyawanForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const allData = getPenilaianData();
        const nipValue = nipInput.value;
        const namaValue = namaInput.value;
        const lokasiValue = lokasiInput.value;
        const jabatanValue = jabatanInput.value;

        if (nipToEdit) {
            // Mode Edit: Perbarui semua entri penilaian dengan NIP yang sama
            const updatedData = allData.map(item => {
                if (item.nip === nipToEdit) {
                    return {
                        ...item,
                        nama: namaValue,
                        lokasi: lokasiValue,
                        jabatan: jabatanValue
                    };
                }
                return item;
            });
            savePenilaianData(updatedData);
            alert('Data induk karyawan berhasil diperbarui!');
        } else {
            // Mode Tambah Baru: Cek duplikasi NIP
            if (allData.some(item => item.nip === nipValue)) {
                alert('Error: NIP sudah terdaftar. Gunakan NIP yang lain.');
                return;
            }
            // Buat entri "dummy" tanpa skor penilaian
            const newKaryawan = {
                id: Date.now(),
                nama: namaValue,
                nip: nipValue,
                lokasi: lokasiValue,
                jabatan: jabatanValue,
                periode: '-',
                rekomendasi: '-',
                tanggal: new Date().toISOString(),
                // Set semua skor ke 0 atau nilai default lainnya
                skill_team_work: 0, skill_komunikasi: 0, skill_manajemen_waktu: 0, skill_goal_setting: 0, skill_problem_solving: 0,
                knowledge_pengalaman: 0, knowledge_teori: 0, knowledge_pengembangan: 0,
                attitude_integritas: 0, attitude_empati: 0, attitude_kooperatif: 0, attitude_percaya_diri: 0, attitude_komitmen: 0, attitude_jujur: 0, attitude_self_motivation: 0,
                rata_rata: 0,
                predikat: 'Belum Dinilai'
            };
            allData.push(newKaryawan);
            savePenilaianData(allData);
            alert('Karyawan baru berhasil ditambahkan. Anda sekarang bisa melakukan penilaian di menu "Form Penilaian".');
        }

        // Hapus item dari session storage dan kembali ke halaman data karyawan
        sessionStorage.removeItem('editKaryawanNIP');
        window.location.href = 'pegawai.html';
    });
});

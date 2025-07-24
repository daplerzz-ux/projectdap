console.log("--- SERVER VERSI TERBARU SEDANG DIJALANKAN ---"); // <-- PENANDA

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database.js');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Fungsi untuk menghitung rata-rata dan predikat
const hitungPredikat = (rata_rata) => {
    if (rata_rata >= 4.5) return 'Sangat Baik';
    if (rata_rata >= 3.5) return 'Baik';
    if (rata_rata >= 2.5) return 'Cukup';
    if (rata_rata >= 1.5) return 'Kurang';
    return 'Sangat Kurang';
};

// [CREATE] Endpoint untuk menambah data penilaian baru
app.post('/api/penilaian', (req, res) => {
    const { nama, nip, departemen, nilai_kinerja, nilai_disiplin, nilai_kerjasama, komentar } = req.body;
    
    if (!nama || !nip || !departemen || !nilai_kinerja || !nilai_disiplin || !nilai_kerjasama) {
        return res.status(400).json({ error: 'Semua field wajib diisi kecuali komentar.' });
    }

    const rata_rata = (nilai_kinerja + nilai_disiplin + nilai_kerjasama) / 3;
    const predikat = hitungPredikat(rata_rata);

    const sql = `INSERT INTO penilaian_karyawan (nama, nip, departemen, nilai_kinerja, nilai_disiplin, nilai_kerjasama, rata_rata, predikat, komentar) VALUES (?,?,?,?,?,?,?,?,?)`;
    const params = [nama, nip, departemen, nilai_kinerja, nilai_disiplin, nilai_kerjasama, rata_rata.toFixed(2), predikat, komentar];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, ...req.body, rata_rata, predikat });
    });
});

// [READ] Endpoint untuk mengambil data penilaian (dengan filter bulan/tahun)
app.get('/api/penilaian', (req, res) => {
    const { month, year } = req.query;

    let sql = "SELECT * FROM penilaian_karyawan";
    const params = [];

    if (month && year) {
        const monthStr = String(month).padStart(2, '0');
        const yearMonth = `${year}-${monthStr}`;
        sql += " WHERE strftime('%Y-%m', tanggal) = ?";
        params.push(yearMonth);
    }

    sql += " ORDER BY tanggal DESC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// [UPDATE] Endpoint untuk mengubah data berdasarkan ID
app.put('/api/penilaian/:id', (req, res) => {
    const { id } = req.params;
    const { nama, nip, departemen, nilai_kinerja, nilai_disiplin, nilai_kerjasama, komentar } = req.body;

    const rata_rata = (nilai_kinerja + nilai_disiplin + nilai_kerjasama) / 3;
    const predikat = hitungPredikat(rata_rata);

    const sql = `UPDATE penilaian_karyawan SET
        nama = ?, nip = ?, departemen = ?,
        nilai_kinerja = ?, nilai_disiplin = ?, nilai_kerjasama = ?,
        rata_rata = ?, predikat = ?, komentar = ?
        WHERE id = ?`;
    
    const params = [nama, nip, departemen, nilai_kinerja, nilai_disiplin, nilai_kerjasama, rata_rata.toFixed(2), predikat, komentar, id];
    
    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Data berhasil diperbarui', changes: this.changes });
    });
});

// [DELETE] Endpoint untuk menghapus data berdasarkan ID
app.delete('/api/penilaian/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM penilaian_karyawan WHERE id = ?';
    db.run(sql, id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Data berhasil dihapus', changes: this.changes });
    });
});

// [READ] Endpoint untuk statistik dashboard
app.get('/api/dashboard-stats', (req, res) => {
    const queryTotal = "SELECT COUNT(id) as totalKaryawan, AVG(rata_rata) as rataRataKeseluruhan FROM penilaian_karyawan";
    const queryPredikat = "SELECT predikat, COUNT(id) as jumlah FROM penilaian_karyawan GROUP BY predikat ORDER BY jumlah DESC";
    const queryKinerjaTerbaik = "SELECT COUNT(id) as jumlah FROM penilaian_karyawan WHERE predikat = 'Sangat Baik'";
    const queryPerluPerhatian = "SELECT COUNT(id) as jumlah FROM penilaian_karyawan WHERE predikat IN ('Kurang', 'Sangat Kurang')";

    Promise.all([
        new Promise((resolve, reject) => db.get(queryTotal, (err, row) => err ? reject(err) : resolve(row))),
        new Promise((resolve, reject) => db.all(queryPredikat, (err, rows) => err ? reject(err) : resolve(rows))),
        new Promise((resolve, reject) => db.get(queryKinerjaTerbaik, (err, row) => err ? reject(err) : resolve(row))),
        new Promise((resolve, reject) => db.get(queryPerluPerhatian, (err, row) => err ? reject(err) : resolve(row)))
    ]).then(([totalStats, predikatStats, kinerjaTerbaikStats, perluPerhatianStats]) => {
        res.json({
            totalKaryawan: totalStats.totalKaryawan || 0,
            rataRataKeseluruhan: (totalStats.rataRataKeseluruhan || 0).toFixed(2),
            distribusiPredikat: predikatStats,
            kinerjaTerbaik: kinerjaTerbaikStats.jumlah || 0,
            perluPerhatian: perluPerhatianStats.jumlah || 0
        });
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
});

// [READ] Endpoint untuk daftar pegawai unik
app.get('/api/pegawai', (req, res) => {
    const sql = "SELECT DISTINCT nama, nip, departemen FROM penilaian_karyawan ORDER BY nama ASC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});


// Baris ini menyalakan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
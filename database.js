// 📁 database.js

// 1. Memanggil 'pakar' SQLite
const sqlite3 = require('sqlite3').verbose();

// 2. Membuat atau membuka file database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        // Jika ada error saat membuka file, tampilkan di konsol
        console.error('Error opening database:', err.message);
    } else {
        // Jika berhasil, beri tahu kita
        console.log('Connected to the SQLite database.');
        
        // 3. Menjalankan perintah untuk membuat tabel
        db.run(`CREATE TABLE IF NOT EXISTS penilaian_karyawan (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama TEXT NOT NULL,
            nip TEXT NOT NULL UNIQUE,
            departemen TEXT NOT NULL,
            nilai_kinerja INTEGER NOT NULL,
            nilai_disiplin INTEGER NOT NULL,
            nilai_kerjasama INTEGER NOT NULL,
            rata_rata REAL NOT NULL,
            predikat TEXT NOT NULL,
            komentar TEXT,
            tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                // Jika ada error saat membuat tabel, tampilkan
                console.error('Error creating table:', err.message);
            }
        });
    }
});

// 4. Mengekspor koneksi database agar bisa dipakai file lain
module.exports = db;
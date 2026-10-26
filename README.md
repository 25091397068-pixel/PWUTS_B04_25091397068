# KantinKita — Dashboard Admin Abby

## Fitur
- Dashboard ringkasan total menu, menu tersedia, stok menipis, dan menu habis.
- Daftar menu dengan pencarian nama/deskripsi.
- Filter berdasarkan kategori dan status stok.
- Kontrol tambah/kurangi stok langsung dari tabel.
- Form tambah menu dengan validasi nama, kategori, harga, stok, dan deskripsi.
- Data disimpan pada `localStorage` browser.

## Menjalankan
1. Ekstrak folder ini.
2. Letakkan file `index.html`, `style.css`, dan `app.js` dalam satu folder.
3. Untuk proyek XAMPP, salin folder ini ke `C:\\xampp\\htdocs\\` (contoh: `C:\\xampp\\htdocs\\abby-admin`).
4. Jalankan Apache, lalu buka `http://localhost/abby-admin/`.

## Catatan penting
Versi ini adalah prototipe frontend UTS. Data hanya tersimpan pada browser/perangkat yang digunakan, bukan di database MySQL dan belum terhubung ke data menu KantinKita milik anggota lain. Untuk integrasi penuh, hubungkan daftar menu ke endpoint PHP/MySQL dan samakan struktur tabel dengan proposal kelompok.

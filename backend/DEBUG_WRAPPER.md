# DEBUG WRAPPER ISSUE

## MASALAH
Wrapper tidak dipanggil untuk POST request yang error. Ini berarti Waitress menangkap exception sebelum wrapper dipanggil.

## SOLUSI YANG DICARI
Memastikan wrapper dipanggil untuk SEMUA request, termasuk yang error.

## LANGKAH DEBUGGING:
1. Pastikan server di-restart dengan code baru
2. Jalankan test dan cek log server
3. Jika tidak ada log `[WSGI WRAPPER]`, berarti wrapper tidak dipanggil
4. Jika wrapper tidak dipanggil, berarti Waitress menangkap exception sebelum wrapper dipanggil

## KEMUNGKINAN PENYEBAB:
1. Waitress menangkap exception saat Pyramid mencoba membuat request object
2. Ada error saat Pyramid mencoba parse request body
3. Ada error di level yang lebih rendah sebelum WSGI app dipanggil

## SOLUSI YANG DICARI:
Membuat wrapper yang benar-benar dipanggil untuk semua request, termasuk yang error.

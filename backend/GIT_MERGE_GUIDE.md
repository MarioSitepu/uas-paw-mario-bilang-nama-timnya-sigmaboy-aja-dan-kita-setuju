# Panduan Merge dengan Kode Teman

## Situasi
- Teman sudah push kode ke repository
- Anda belum push kode lokal
- Perlu merge kode teman dengan kode lokal Anda

## Langkah-langkah Merge

### 1. Commit Kode Lokal Anda (Jika Belum)

```bash
# Cek status
git status

# Add semua perubahan
git add .

# Commit perubahan
git commit -m "Add deployment configuration for Render"
```

### 2. Fetch dan Pull Kode dari Remote

```bash
# Fetch perubahan dari remote
git fetch origin

# Pull dan merge kode teman
git pull origin main
```

**Atau jika branch berbeda:**
```bash
git pull origin <nama-branch-teman>
```

### 3. Jika Ada Konflik

Jika ada konflik saat merge:

#### A. Lihat File yang Konflik
```bash
git status
# Akan menunjukkan file-file yang conflict
```

#### B. Resolve Konflik

Buka file yang conflict, cari tanda:
```
<<<<<<< HEAD
Kode Anda
=======
Kode teman
>>>>>>> branch-name
```

**Pilih salah satu:**
- Keep your code (hapus kode teman)
- Keep their code (hapus kode Anda)
- Keep both (gabungkan keduanya)
- Manual edit (edit sesuai kebutuhan)

#### C. Setelah Resolve

```bash
# Add file yang sudah di-resolve
git add <file-yang-conflict>

# Lanjutkan merge
git commit -m "Merge dengan kode teman"
```

### 4. Push Kode yang Sudah Di-merge

```bash
git push origin main
```

## Alternatif: Menggunakan Merge Tool

Jika konflik banyak, bisa gunakan merge tool:

```bash
# Buka merge tool
git mergetool

# Atau gunakan VS Code
git config --global merge.tool vscode
git mergetool
```

## Strategi Merge

### Option 1: Merge (Recommended)
```bash
git pull origin main
# Akan merge otomatis
```

### Option 2: Rebase (Untuk history lebih clean)
```bash
git pull --rebase origin main
# Akan rebase kode Anda di atas kode teman
```

### Option 3: Manual Merge
```bash
# Fetch dulu
git fetch origin

# Merge manual
git merge origin/main
```

## Tips

1. **Selalu commit kode lokal dulu** sebelum pull
2. **Backup kode lokal** jika khawatir:
   ```bash
   git stash  # Simpan perubahan sementara
   git pull origin main
   git stash pop  # Restore perubahan
   ```
3. **Komunikasi dengan teman** tentang perubahan yang dibuat
4. **Test setelah merge** untuk memastikan tidak ada yang rusak

## Jika Ingin Abort Merge

Jika merge bermasalah dan ingin cancel:
```bash
git merge --abort
```

## Checklist

- [ ] Commit semua perubahan lokal
- [ ] Fetch/pull dari remote
- [ ] Resolve conflicts (jika ada)
- [ ] Test aplikasi setelah merge
- [ ] Push kode yang sudah di-merge

## Contoh Workflow Lengkap

```bash
# 1. Cek status
git status

# 2. Commit perubahan lokal
git add .
git commit -m "Add deployment files"

# 3. Pull kode teman
git pull origin main

# 4. Jika ada conflict, resolve
# Edit file yang conflict
git add .
git commit -m "Resolve merge conflicts"

# 5. Push
git push origin main
```

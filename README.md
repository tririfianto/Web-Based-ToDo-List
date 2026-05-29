# Todo List App

---

## Language / Bahasa

- [English](#english)
- [Bahasa Indonesia](#bahasa-indonesia)

---

# English

A lightweight, browser-based todo list application that requires no server, installation, or internet connection. All data is automatically saved to `localStorage` so tasks persist across page refreshes and browser restarts.

## Key Features

- Add tasks via text input using the Add button or the Enter key
- Mark tasks as complete or incomplete (toggle)
- Delete individual tasks
- Filter the task list by status: All, Active, Completed
- Inline input validation — displays an error message if the input is empty or exceeds 500 characters
- Empty state message when no tasks match the active filter
- Automatic persistence to `localStorage` — no server required

---

## Running the App

No installation or build step required. Simply open `index.html` directly in a browser:

```
Double-click index.html
```

Or open it via the browser using a local file path:

```
file:///path/to/KiroWeb/index.html
```

---

## Running the Tests

Tests use Vitest and fast-check. Node.js must be installed.

**Install test dependencies (once):**

```bash
npm install
```

**Run all unit tests and property-based tests:**

```bash
npm test
```

Or directly:

```bash
npx vitest run
```

---

## Folder Structure

```
KiroWeb/
├── index.html        # App entry point — semantic markup, links style.css and app.js
├── style.css         # All styles (layout, task items, completed state, filter bar, empty state)
├── app.js            # All JavaScript — Model, View, and Controller layers
├── test.js           # Unit tests and property-based tests (Vitest + fast-check)
├── vitest.config.js  # Vitest configuration
└── package.json      # Project metadata and test dependencies
```

---

## Architecture

The app follows the MVC (Model-View-Controller) pattern within a single `app.js` file:

- **Model** — pure functions and `localStorage` I/O. No DOM access.
- **View** — DOM rendering functions. Accepts state, produces DOM mutations. No business logic.
- **Controller** — entry point. Wires DOM events to the Model, then updates the View.

---

## Technologies Used

| Technology | Description |
|---|---|
| HTML5 | Semantic markup (`main`, `section`, `ul`, `button`, `input`) |
| CSS3 | Plain stylesheet, no preprocessor |
| JavaScript ES6+ | Vanilla JS, no frameworks or external libraries |
| Vitest | Test runner for unit and property-based tests |
| fast-check | Property-based testing library (minimum 100 iterations per property) |

---

## Notes

- No runtime dependencies — `node_modules` is used for testing purposes only.
- The app runs entirely in the browser with no backend server required.
- All `localStorage` access is handled through `loadFromStorage()` and `saveToStorage()`.

---

---

# Bahasa Indonesia

Aplikasi todo list berbasis browser yang ringan dan tidak memerlukan server, instalasi, atau koneksi internet. Semua data disimpan secara otomatis di `localStorage` sehingga tugas tetap tersedia setelah halaman di-refresh atau browser ditutup.

## Fitur Utama

- Tambah tugas melalui kolom input menggunakan tombol Add atau tombol Enter
- Tandai tugas sebagai selesai atau belum selesai (toggle)
- Hapus tugas secara individual
- Filter daftar tugas berdasarkan status: All, Active, Completed
- Validasi input secara inline — menampilkan pesan error jika input kosong atau melebihi 500 karakter
- Pesan empty state ketika tidak ada tugas yang cocok dengan filter aktif
- Persistensi otomatis ke `localStorage` tanpa memerlukan server

---

## Cara Menjalankan Aplikasi

Tidak diperlukan instalasi atau build step. Cukup buka file `index.html` langsung di browser:

```
Klik dua kali pada file index.html
```

Atau buka melalui browser dengan path file lokal:

```
file:///path/to/KiroWeb/index.html
```

---

## Cara Menjalankan Pengujian

Pengujian menggunakan Vitest dan fast-check. Pastikan Node.js sudah terinstal.

**Instal dependensi pengujian (hanya sekali):**

```bash
npm install
```

**Jalankan semua unit test dan property-based test:**

```bash
npm test
```

Atau secara langsung:

```bash
npx vitest run
```

---

## Struktur Folder

```
KiroWeb/
├── index.html        # Entry point aplikasi — markup semantik, menghubungkan style.css dan app.js
├── style.css         # Semua styling (layout, task item, status selesai, filter bar, empty state)
├── app.js            # Semua logika JavaScript — lapisan Model, View, dan Controller
├── test.js           # Unit test dan property-based test (Vitest + fast-check)
├── vitest.config.js  # Konfigurasi Vitest
└── package.json      # Metadata proyek dan dependensi pengujian
```

---

## Arsitektur

Aplikasi mengikuti pola MVC (Model-View-Controller) dalam satu file `app.js`:

- **Model** — fungsi murni dan operasi `localStorage`. Tidak mengakses DOM.
- **View** — fungsi rendering DOM. Menerima state, menghasilkan mutasi DOM. Tidak mengandung logika bisnis.
- **Controller** — titik masuk. Menghubungkan event DOM ke Model, lalu memperbarui View.

---

## Teknologi yang Digunakan

| Teknologi | Keterangan |
|---|---|
| HTML5 | Markup semantik (`main`, `section`, `ul`, `button`, `input`) |
| CSS3 | Stylesheet murni tanpa preprocessor |
| JavaScript ES6+ | Vanilla JS tanpa framework atau library eksternal |
| Vitest | Test runner untuk unit test dan property-based test |
| fast-check | Library property-based testing (minimum 100 iterasi per properti) |

---

## Catatan

- Tidak ada dependensi runtime — `node_modules` hanya digunakan untuk keperluan pengujian.
- Aplikasi berjalan sepenuhnya di browser tanpa memerlukan server backend.
- Semua akses `localStorage` dilakukan melalui fungsi `loadFromStorage()` dan `saveToStorage()`.

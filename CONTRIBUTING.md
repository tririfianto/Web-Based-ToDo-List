# Contributing Guide / Panduan Kontribusi

---

## Language / Bahasa

- [English](#english)
- [Bahasa Indonesia](#bahasa-indonesia)

---

# English

Thank you for your interest in contributing to this project. This document outlines the processes, standards, and expectations that apply to all contributors.

## Table of Contents

1. [Before You Start](#1-before-you-start)
2. [Contribution Workflow](#2-contribution-workflow)
3. [Pull Request Rules](#3-pull-request-rules)
4. [Code Style Standards](#4-code-style-standards)
5. [Testing Standards](#5-testing-standards)
6. [Communication Ethics](#6-communication-ethics)

---

## 1. Before You Start

Before making any changes, please ensure you understand the following:

- Read `README.md` to understand the project's purpose, architecture, and how to run it.
- Check the existing *Issues* list to make sure the topic you want to work on is not already being handled by someone else.
- For large changes or new features, open an *Issue* first and discuss the approach before writing any code.
- For small fixes such as typos or minor bugs, you may open a Pull Request directly without creating an Issue first.

---

## 2. Contribution Workflow

Follow these steps for every contribution:

1. Fork this repository to your account.
2. Create a new branch from `main` with a descriptive name:
   ```bash
   git checkout -b fix/input-validation-error
   git checkout -b feat/keyboard-shortcut-support
   ```
3. Make your changes following the standards described in this document.
4. Run the full test suite and ensure all tests pass before committing:
   ```bash
   npm test
   ```
5. Commit your changes with a clear message (see conventions below).
6. Push the branch to your fork and open a Pull Request targeting the `main` branch of the main repository.

### Commit Message Conventions

Use the following format for commit messages:

```
<type>: <short description in English>
```

Accepted types:

| Type | Description |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `docs` | Documentation changes only |
| `style` | Formatting, whitespace, or CSS changes with no logic change |
| `chore` | Configuration or tooling changes |

Examples:

```
feat: add keyboard shortcut to clear completed tasks
fix: prevent empty task from being added on rapid click
docs: update README with browser compatibility notes
test: add property test for serialize/deserialize round-trip
```

---

## 3. Pull Request Rules

### Requirements

Every Pull Request must meet the following criteria before it can be reviewed:

- The branch is created from the latest `main` and has no merge conflicts.
- The full test suite passes (`npm test` produces no failures).
- Changes to business logic are accompanied by relevant tests.
- No new runtime dependencies are introduced (no external libraries, CDN scripts, or npm packages other than devDependencies).
- The established MVC architecture is not altered without prior discussion.

### Pull Request Description Template

Include the following information in your Pull Request description:

```
## Summary
Describe what was changed and why.

## Changes Made
- First change
- Second change

## How to Test
Steps to manually verify the changes (if applicable).

## Related Issue
Closes #<issue-number> (if applicable)
```

### Review Process

- Every Pull Request requires at least one approval before it can be merged.
- Reviewers may request changes. Respond to every review comment politely and constructively.
- Do not force push to a branch that is under review unless explicitly asked to do so.
- Pull Requests that are inactive for more than 14 days may be closed and can be reopened if needed.

---

## 4. Code Style Standards

### General

- Use **Vanilla JavaScript ES6+** — no frameworks, no runtime libraries.
- No external dependencies in production code (`index.html`, `style.css`, `app.js`).
- The app must continue to work by opening `index.html` directly from the filesystem (`file://`).

### JavaScript

**MVC Layer Separation**

Maintain strict separation between the three layers in `app.js`:

- Model: pure functions and `localStorage` I/O. Must not access the DOM.
- View: DOM rendering functions only. Must not contain business logic.
- Controller: wires DOM events to Model and View. Runs inside `DOMContentLoaded`.

**Immutability**

Model functions must not mutate their inputs. Always return new arrays or objects:

```js
// Correct
const toggleTask = (taskList, id) =>
  taskList.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

// Incorrect — mutates input directly
const toggleTask = (taskList, id) => {
  const task = taskList.find((t) => t.id === id);
  task.completed = !task.completed; // not allowed
  return taskList;
};
```

**Error Handling**

- Use `console.error` to log storage failures and JSON parse errors.
- Never swallow errors silently.
- Do not use `alert()` or modal dialogs — all user-facing error messages must be displayed inline.

**Identifiers**

- Always use `crypto.randomUUID()` to generate task IDs. Never use user-supplied values as IDs.

**localStorage Access**

- All reads and writes to `localStorage` must go through `loadFromStorage()` and `saveToStorage()`.
- Do not access `localStorage` directly outside of those two functions.

**State Flow**

Follow this flow consistently:

```
DOM Event → Controller → Model → saveToStorage → View render
```

**Writing Style**

- Use `const` for all function declarations and variables that are not reassigned.
- Use arrow functions for Model and View functions.
- Use template literals for strings containing dynamic expressions.
- One function, one responsibility.
- Include JSDoc comments for every exported or public-facing function.

### HTML

- Use semantic elements: `<main>`, `<section>`, `<ul>`, `<li>`, `<button>`, `<input>`.
- Every interactive element must have a descriptive `aria-label` attribute.
- Use `role` and `aria-live` attributes for dynamically updated content.

### CSS

- Use plain CSS3 without preprocessors (no Sass, Less, or PostCSS).
- Class names use `kebab-case` format.
- Group properties logically: positioning, box model, typography, visual.

---

## 5. Testing Standards

- Every new Model function must be accompanied by unit tests in `test.js`.
- Use Vitest as the test runner. Run with `npm test` or `npx vitest run`.
- Property-based tests use fast-check with a minimum of **100 iterations** per property.
- Tag each property test with the following comment on the first line of the `it` block:
  ```js
  // Feature: todo-list-app, Property N: <property description>
  ```
- Tests must not access the DOM — only test pure Model functions.
- Ensure all tests pass before opening a Pull Request.

---

## 6. Communication Ethics

This project is committed to maintaining an open, inclusive, and respectful environment. The following standards apply across all project communication channels, including Issues, Pull Requests, and code comments.

### Expected Behavior

- Communicate politely, clearly, and constructively.
- Critique the code, not the person.
- Receive feedback and review suggestions with an open mind.
- Acknowledge others' contributions genuinely.
- Use inclusive and non-discriminatory language.

### Unacceptable Behavior

- Comments that are condescending, attacking, or harassing.
- Language or content that discriminates based on background, identity, or experience.
- Spam, irrelevant promotion, or disruption of technical discussions.
- Claiming someone else's work as your own.

### Reporting

If you experience or witness behavior that violates the standards above, report it through the mechanisms available in this repository. All reports will be handled confidentially and taken seriously.

---

Your contribution, no matter how small, means a great deal to this project. Thank you for taking the time to read this guide.

---

---

# Bahasa Indonesia

Terima kasih atas minat Anda untuk berkontribusi pada proyek ini. Dokumen ini menjelaskan proses, standar, dan ekspektasi yang berlaku bagi semua kontributor.

## Daftar Isi

1. [Sebelum Mulai Berkontribusi](#1-sebelum-mulai-berkontribusi)
2. [Alur Kerja Kontribusi](#2-alur-kerja-kontribusi)
3. [Aturan Pull Request](#3-aturan-pull-request)
4. [Standar Gaya Penulisan Kode](#4-standar-gaya-penulisan-kode)
5. [Standar Pengujian](#5-standar-pengujian)
6. [Etika Komunikasi](#6-etika-komunikasi)

---

## 1. Sebelum Mulai Berkontribusi

Sebelum membuat perubahan, pastikan Anda memahami hal-hal berikut:

- Baca `README.md` untuk memahami tujuan, arsitektur, dan cara menjalankan proyek.
- Periksa daftar *Issues* yang sudah ada untuk memastikan topik yang ingin Anda kerjakan belum ditangani oleh orang lain.
- Untuk perubahan besar atau fitur baru, buka *Issue* terlebih dahulu dan diskusikan pendekatan yang akan diambil sebelum mulai menulis kode.
- Untuk perbaikan kecil seperti typo atau bug minor, Anda dapat langsung membuat Pull Request tanpa membuka Issue terlebih dahulu.

---

## 2. Alur Kerja Kontribusi

Ikuti langkah-langkah berikut untuk setiap kontribusi:

1. Fork repositori ini ke akun Anda.
2. Buat branch baru dari `main` dengan nama yang deskriptif:
   ```bash
   git checkout -b fix/input-validation-error
   git checkout -b feat/keyboard-shortcut-support
   ```
3. Lakukan perubahan sesuai standar yang dijelaskan di dokumen ini.
4. Jalankan seluruh test suite dan pastikan semua test lulus sebelum commit:
   ```bash
   npm test
   ```
5. Commit perubahan dengan pesan yang jelas (lihat konvensi di bawah).
6. Push branch ke fork Anda dan buat Pull Request ke branch `main` repositori utama.

### Konvensi Pesan Commit

Gunakan format berikut untuk pesan commit:

```
<type>: <deskripsi singkat dalam bahasa Inggris>
```

Tipe yang digunakan:

| Tipe | Keterangan |
|---|---|
| `feat` | Penambahan fitur baru |
| `fix` | Perbaikan bug |
| `refactor` | Perubahan kode tanpa mengubah perilaku |
| `test` | Penambahan atau perbaikan test |
| `docs` | Perubahan pada dokumentasi |
| `style` | Perubahan formatting, spasi, atau CSS tanpa mengubah logika |
| `chore` | Perubahan konfigurasi atau tooling |

Contoh:

```
feat: add keyboard shortcut to clear completed tasks
fix: prevent empty task from being added on rapid click
docs: update README with browser compatibility notes
test: add property test for serialize/deserialize round-trip
```

---

## 3. Aturan Pull Request

### Persyaratan Wajib

Setiap Pull Request harus memenuhi kriteria berikut sebelum dapat di-review:

- Branch dibuat dari `main` yang terbaru dan tidak memiliki konflik merge.
- Seluruh test suite lulus (`npm test` tidak menghasilkan kegagalan).
- Perubahan pada logika bisnis disertai dengan test yang relevan.
- Tidak memperkenalkan dependensi runtime baru (library eksternal, CDN, atau npm package selain devDependencies).
- Tidak mengubah arsitektur MVC yang sudah ditetapkan tanpa diskusi sebelumnya.

### Isi Deskripsi Pull Request

Sertakan informasi berikut dalam deskripsi Pull Request:

```
## Ringkasan
Jelaskan apa yang diubah dan mengapa.

## Perubahan yang Dilakukan
- Poin perubahan pertama
- Poin perubahan kedua

## Cara Menguji
Langkah-langkah untuk memverifikasi perubahan secara manual (jika relevan).

## Issue Terkait
Closes #<nomor-issue> (jika ada)
```

### Proses Review

- Setiap Pull Request memerlukan minimal satu approval sebelum dapat di-merge.
- Reviewer berhak meminta perubahan. Tanggapi setiap komentar review dengan sopan dan konstruktif.
- Jangan melakukan force push ke branch yang sedang dalam proses review kecuali diminta secara eksplisit.
- Pull Request yang tidak aktif selama lebih dari 14 hari dapat ditutup dan dibuka kembali jika diperlukan.

---

## 4. Standar Gaya Penulisan Kode

### Umum

- Gunakan **Vanilla JavaScript ES6+** — tidak ada framework, tidak ada library runtime.
- Tidak ada dependensi eksternal di kode produksi (`index.html`, `style.css`, `app.js`).
- Aplikasi harus tetap berjalan dengan membuka `index.html` langsung dari filesystem (`file://`).

### JavaScript

**Pemisahan lapisan MVC**

Jaga pemisahan yang ketat antara tiga lapisan dalam `app.js`:

- Model: fungsi murni dan operasi `localStorage`. Tidak boleh mengakses DOM.
- View: fungsi rendering DOM. Tidak boleh mengandung logika bisnis.
- Controller: menghubungkan event DOM ke Model dan View. Berjalan di dalam `DOMContentLoaded`.

**Immutabilitas**

Fungsi Model tidak boleh memutasi input. Selalu kembalikan array atau objek baru:

```js
// Benar
const toggleTask = (taskList, id) =>
  taskList.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

// Salah — memutasi input langsung
const toggleTask = (taskList, id) => {
  const task = taskList.find((t) => t.id === id);
  task.completed = !task.completed; // dilarang
  return taskList;
};
```

**Penanganan error**

- Gunakan `console.error` untuk mencatat kegagalan storage dan error parsing JSON.
- Jangan pernah menelan error secara diam-diam (*silent fail*).
- Jangan gunakan `alert()` atau dialog modal — semua pesan error kepada pengguna harus ditampilkan secara inline.

**Identifier**

- Selalu gunakan `crypto.randomUUID()` untuk membuat ID task. Jangan gunakan nilai yang berasal dari input pengguna sebagai ID.

**Akses localStorage**

- Semua baca/tulis ke `localStorage` harus melalui `loadFromStorage()` dan `saveToStorage()`.
- Jangan akses `localStorage` secara langsung di luar kedua fungsi tersebut.

**Alur state**

Ikuti alur berikut secara konsisten:

```
Event DOM → Controller → Model → saveToStorage → View render
```

**Gaya penulisan**

- Gunakan `const` untuk semua deklarasi fungsi dan variabel yang tidak di-reassign.
- Gunakan arrow function untuk fungsi Model dan View.
- Gunakan template literal untuk string yang mengandung ekspresi dinamis.
- Satu fungsi, satu tanggung jawab.
- Sertakan JSDoc untuk setiap fungsi yang diekspor atau bersifat publik.

### HTML

- Gunakan elemen semantik: `<main>`, `<section>`, `<ul>`, `<li>`, `<button>`, `<input>`.
- Setiap elemen interaktif harus memiliki atribut `aria-label` yang deskriptif.
- Gunakan atribut `role` dan `aria-live` untuk konten yang diperbarui secara dinamis.

### CSS

- Gunakan plain CSS3 tanpa preprocessor (tidak ada Sass, Less, atau PostCSS).
- Nama kelas menggunakan format `kebab-case`.
- Kelompokkan properti secara logis: positioning, box model, tipografi, visual.

---

## 5. Standar Pengujian

- Setiap fungsi Model baru harus disertai unit test di `test.js`.
- Gunakan Vitest sebagai test runner. Jalankan dengan `npm test` atau `npx vitest run`.
- Property-based test menggunakan fast-check dengan minimum **100 iterasi** per properti.
- Tandai setiap property test dengan komentar berikut di baris pertama blok `it`:
  ```js
  // Feature: todo-list-app, Property N: <deskripsi properti>
  ```
- Test tidak boleh mengakses DOM — hanya menguji fungsi Model yang murni.
- Pastikan seluruh test lulus sebelum membuat Pull Request.

---

## 6. Etika Komunikasi

Proyek ini berkomitmen untuk menjaga lingkungan yang terbuka, inklusif, dan saling menghormati. Standar berikut berlaku di semua saluran komunikasi proyek, termasuk Issues, Pull Request, dan komentar kode.

### Yang Diharapkan

- Berkomunikasi dengan sopan, jelas, dan konstruktif.
- Memberikan kritik terhadap kode, bukan terhadap individu.
- Menerima masukan dan saran review dengan pikiran terbuka.
- Mengakui kontribusi orang lain secara tulus.
- Menggunakan bahasa yang inklusif dan tidak diskriminatif.

### Yang Tidak Diperbolehkan

- Komentar yang bersifat merendahkan, menyerang, atau melecehkan.
- Bahasa atau konten yang bersifat diskriminatif berdasarkan latar belakang, identitas, atau pengalaman seseorang.
- Spam, promosi yang tidak relevan, atau gangguan terhadap diskusi teknis.
- Mengklaim karya orang lain sebagai milik sendiri.

### Pelaporan

Jika Anda mengalami atau menyaksikan perilaku yang melanggar standar di atas, laporkan melalui mekanisme yang tersedia di repositori ini. Semua laporan akan ditangani secara rahasia dan serius.

---

Kontribusi Anda, sekecil apapun, sangat berarti bagi proyek ini. Terima kasih telah meluangkan waktu untuk membaca panduan ini.

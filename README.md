# 💰 Aplikasi Payroll - Sistem Penggajian Indonesia

Sistem payroll lengkap dan modern untuk perusahaan Indonesia dengan fitur PPh 21, BPJS, dan regulasi ketenagakerjaan.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Fitur Utama

### 🔐 Manajemen Pengguna & Akses
- Role-Based Access Control (RBAC)
- 3 Role: Super Admin, HR Admin, Employee
- NextAuth.js Authentication

### 👥 Manajemen Karyawan
- Data lengkap karyawan (NIK, NPWP, BPJS)
- Informasi bank & kontak darurat
- Riwayat jabatan & departemen

### 📅 Absensi & Kehadiran
- Tracking kehadiran harian
- Input jam masuk & pulang
- Perhitungan jam kerja & keterlambatan
- Approval lembur

### 🏖️ Manajemen Cuti
- Multiple jenis cuti (Tahunan, Sakit, Melahirkan, dll)
- Approval workflow
- Tracking saldo cuti

### 💵 Proses Payroll
- **PPh 21 Calculator** - Kalkulasi pajak progresif 2024
- **BPJS Calculator** - Kesehatan, JHT, JP, JKK, JKM
- **Overtime Calculator** - Sesuai UU Ketenagakerjaan
- Proses gaji otomatis per bulan

### 📄 Slip Gaji
- Generate PDF slip gaji profesional
- Preview di browser
- Print langsung

### 📊 Laporan
- Ringkasan payroll bulanan
- Laporan BPJS
- Laporan PPh 21
- Export data karyawan

### 👤 Employee Self-Service
- Portal karyawan untuk lihat slip gaji
- Pengajuan cuti mandiri
- Cek saldo cuti

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js |
| Styling | Tailwind CSS |
| State | React Hooks |

---

## 📋 Spesifikasi Indonesia

### PPh 21 (2024)
- PTKP: TK/0 = Rp 54.000.000
- Tanggungan tambahan: Rp 4.500.000
- Tarif progresif: 5%, 15%, 25%, 30%, 35%

### BPJS Ketenagakerjaan
- JHT: 2% employee, 3.7% employer
- JP: 1% employee, 2% employer
- JKK: 0.24% - 1.74% employer (risiko)
- JKM: 0.3% employer

### BPJS Kesehatan
- 1% employee, 4% employer
- Max salary: Rp 12.000.000

---

## 🚀 Instalasi

### Prerequisites

- Node.js v18+
- PostgreSQL v14+

### 1. Clone Repository

```bash
git clone https://github.com/antono4/payroll.git
cd payroll
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
```

Edit file `.env`:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/payroll_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
```

### 4. Buat Database PostgreSQL

```sql
-- Buka pgAdmin atau SQL Shell
CREATE DATABASE payroll_db;
```

### 5. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema
npm run db:push

# Seed data awal
npm run db:seed
```

### 6. Jalankan Aplikasi

```bash
npm run dev
```

Buka **http://localhost:3000**

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@contoh.co.id | admin123 |
| HR Admin | hr@contoh.co.id | hr123 |
| Employee | john.doe@contoh.co.id | emp123 |

---

## 📁 Struktur Project

```
payroll/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Initial data
├── src/
│   ├── app/
│   │   ├── api/          # REST API routes
│   │   ├── dashboard/    # Admin dashboard
│   │   ├── employees/    # Employee management
│   │   ├── attendance/   # Attendance tracking
│   │   ├── leave/       # Leave management
│   │   ├── payroll/     # Payroll processing
│   │   ├── payslips/    # Payslip preview
│   │   ├── reports/     # Reports
│   │   ├── employee/    # Employee portal
│   │   ├── login/       # Login page
│   │   └── page.tsx     # Landing page
│   ├── components/
│   │   └── ui/          # Reusable UI components
│   ├── lib/
│   │   ├── calculations/ # PPh 21, BPJS, Salary calculators
│   │   ├── constants/   # Indonesia tax rates
│   │   └── pdf/         # PDF generator
│   └── services/        # Business logic
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/employees` | List semua karyawan |
| POST | `/api/employees` | Tambah karyawan |
| GET | `/api/attendance` | List kehadiran |
| POST | `/api/attendance` | Input kehadiran |
| GET | `/api/leave` | List pengajuan cuti |
| POST | `/api/leave` | Ajukan cuti |
| PUT | `/api/leave/[id]` | Approve/tolak cuti |
| GET | `/api/payroll-periods` | List periode payroll |
| POST | `/api/payroll` | Proses payroll |
| GET | `/api/payslips` | List slip gaji |
| POST | `/api/payslips` | Generate payslip |

---

## 🌐 URL Routes

| Halaman | URL |
|---------|-----|
| Landing | `/` |
| Login | `/login` |
| Dashboard | `/dashboard` |
| Karyawan | `/employees` |
| Absensi | `/attendance` |
| Cuti | `/leave` |
| Payroll | `/payroll` |
| Slip Gaji | `/payslips` |
| Laporan | `/reports` |
| Portal Karyawan | `/employee` |

---

## 📦 Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

---

## 🔧 Deployment

### Vercel (Recommended)

1. Push ke GitHub repository
2. Connect repository ke Vercel
3. Set environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
4. Deploy!

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📄 License

MIT License - Bebas digunakan untuk proyek pribadi maupun komersial.

---

## 🤝 Kontribusi

Kontribusi selalu diterima! Buka issue atau buat pull request.

---

Dibuat dengan ❤️ menggunakan Next.js untuk perusahaan Indonesia

## 📞 Support

- 📧 Email: support@payroll-app.com
- 📝 Buat Issue: GitHub Issues
- 📚 Dokumentasi: [Wiki](https://github.com/antono4/payroll/wiki)

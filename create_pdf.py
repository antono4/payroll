# Script untuk generate PDF Instalasi Windows 11
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.platypus.flowables import HRFlowable

# Colors
PRIMARY = HexColor('#2563EB')
SUCCESS = HexColor('#22C55E')
WARNING = HexColor('#FBBF24')
DANGER = HexColor('#EF4444')
GRAY = HexColor('#6B7280')
LIGHT_GRAY = HexColor('#F3F4F6')

def create_pdf():
    filename = "Modul-Instalasi-Payroll-Windows-11.pdf"
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=25*mm,
        leftMargin=25*mm,
        topMargin=30*mm,
        bottomMargin=25*mm
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(
        name='CoverTitle',
        fontSize=28,
        alignment=TA_CENTER,
        spaceAfter=20,
        textColor=PRIMARY,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        fontSize=16,
        alignment=TA_CENTER,
        spaceAfter=10,
        textColor=GRAY,
        fontName='Helvetica'
    ))
    
    styles.add(ParagraphStyle(
        name='SectionTitle',
        fontSize=18,
        spaceBefore=20,
        spaceAfter=15,
        textColor=PRIMARY,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='SubSection',
        fontSize=14,
        spaceBefore=15,
        spaceAfter=10,
        textColor=PRIMARY,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='Body',
        fontSize=11,
        alignment=TA_JUSTIFY,
        spaceAfter=8,
        leading=16,
        fontName='Helvetica'
    ))
    
    styles.add(ParagraphStyle(
        name='CodeBlock',
        fontSize=9,
        fontName='Courier',
        backColor=LIGHT_GRAY,
        leftIndent=10,
        rightIndent=10,
        spaceAfter=10,
        leading=14
    ))
    
    styles.add(ParagraphStyle(
        name='Note',
        fontSize=10,
        backColor=LIGHT_GRAY,
        leftIndent=10,
        rightIndent=10,
        spaceAfter=15,
        leading=14,
        borderColor=PRIMARY,
        borderWidth=1,
        borderPadding=5
    ))
    
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontSize=10,
        alignment=TA_CENTER,
        textColor=white,
        fontName='Helvetica-Bold',
        backColor=PRIMARY
    ))
    
    styles.add(ParagraphStyle(
        name='TableCell',
        fontSize=10,
        alignment=TA_LEFT,
        fontName='Helvetica'
    ))
    
    styles.add(ParagraphStyle(
        name='BulletItem',
        fontSize=11,
        spaceAfter=5,
        leading=16,
        leftIndent=20,
        fontName='Helvetica'
    ))
    
    # Build content
    story = []
    
    # ===== COVER PAGE =====
    story.append(Spacer(1, 50*mm))
    story.append(Paragraph("SISTEM PAYROLL", styles['CoverTitle']))
    story.append(Spacer(1, 5*mm))
    story.append(Paragraph("Modul Instalasi Windows 11", styles['CoverSubtitle']))
    story.append(Spacer(1, 20*mm))
    
    # Cover box
    cover_data = [
        ['Panduan Lengkap Instalasi'],
        ['Aplikasi Payroll Indonesia'],
        ['dengan PPh 21, BPJS, dan Slip Gaji']
    ]
    cover_table = Table(cover_data, colWidths=[120*mm])
    cover_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 2, PRIMARY),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('TEXTCOLOR', (0, 0), (-1, -1), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('FONTSIZE', (0, 1), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(cover_table)
    
    story.append(Spacer(1, 30*mm))
    story.append(Paragraph("Versi 1.0", styles['CoverSubtitle']))
    story.append(Spacer(1, 5*mm))
    story.append(Paragraph("<b>GitHub:</b> antono4/payroll", styles['Body']))
    story.append(Spacer(1, 20*mm))
    story.append(Paragraph("© 2024 - Aplikasi Payroll Indonesia", styles['CoverSubtitle']))
    
    story.append(PageBreak())
    
    # ===== TABLE OF CONTENTS =====
    story.append(Paragraph("DAFTAR ISI", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=15))
    
    toc_items = [
        "1. Pendahuluan",
        "2. Persiapan Sistem",
        "3. Pembuatan Database",
        "4. Download Project",
        "5. Setup Environment Variables",
        "6. Instalasi Dependencies",
        "7. Setup Database",
        "8. Jalankan Aplikasi",
        "9. Login Credentials",
        "10. Troubleshooting",
        "11. Quick Reference"
    ]
    
    for item in toc_items:
        story.append(Paragraph(item, styles['Body']))
    
    story.append(PageBreak())
    
    # ===== SECTION 1: PENDAHULUAN =====
    story.append(Paragraph("1. PENDAHULUAN", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=15))
    
    story.append(Paragraph("<b>Tentang Aplikasi</b>", styles['SubSection']))
    story.append(Paragraph(
        "Aplikasi Payroll adalah sistem penggajian lengkap yang dirancang khusus untuk perusahaan Indonesia. "
        "Aplikasi ini mencakup manajemen karyawan, absensi, cuti, kalkulasi PPh 21 dan BPJS, "
        "serta generate slip gaji profesional.",
        styles['Body']
    ))
    
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("<b>Fitur Utama:</b>", styles['SubSection']))
    
    features = [
        "• Manajemen Karyawan - Data lengkap dengan NIK, NPWP, BPJS",
        "• Absensi & Kehadiran - Tracking jam kerja dan keterlambatan",
        "• Manajemen Cuti - Pengajuan dan persetujuan cuti",
        "• Proses Payroll - Kalkulasi otomatis PPh 21 dan BPJS",
        "• Slip Gaji PDF - Generate slip gaji profesional",
        "• Laporan - Ringkasan payroll dan export data"
    ]
    for feat in features:
        story.append(Paragraph(feat, styles['BulletItem']))
    
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("<b>Fitur Spesifik Indonesia:</b>", styles['SubSection']))
    
    spec_data = [
        ['Komponen', 'Detail'],
        ['PPh 21 Calculator', 'Kalkulasi pajak progresif 2024'],
        ['BPJS Kesehatan', '1% employee, 4% employer'],
        ['BPJS TK (JHT, JP)', '2% employee, 3.7% employer'],
        ['Overtime', 'Sesuai UU Ketenagakerjaan No. 13/2003']
    ]
    
    spec_table = Table(spec_data, colWidths=[60*mm, 100*mm])
    spec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 1), (-1, -1), white),
    ]))
    story.append(spec_table)
    
    story.append(PageBreak())
    
    # ===== SECTION 2: PERSIAPAN SISTEM =====
    story.append(Paragraph("2. PERSIAPAN SISTEM", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=15))
    
    story.append(Paragraph("<b>Kebutuhan Sistem:</b>", styles['SubSection']))
    
    req_data = [
        ['Komponen', 'Minimum'],
        ['Sistem Operasi', 'Windows 11'],
        ['Processor', 'Intel Core i3 / AMD Ryzen 3'],
        ['RAM', '4 GB (disarankan 8 GB)'],
        ['Storage', '10 GB free space'],
        ['Koneksi Internet', 'Required']
    ]
    
    req_table = Table(req_data, colWidths=[60*mm, 100*mm])
    req_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(req_table)
    
    story.append(Spacer(1, 15*mm))
    story.append(Paragraph("<b>2.1 Install Node.js</b>", styles['SubSection']))
    story.append(Paragraph("Node.js adalah runtime JavaScript yang dibutuhkan untuk menjalankan aplikasi.", styles['Body']))
    
    story.append(Paragraph("<b>Download:</b> https://nodejs.org/", styles['Body']))
    story.append(Paragraph("<b>Langkah Instalasi:</b>", styles['Body']))
    
    node_steps = [
        "1. Buka browser, kunjungi https://nodejs.org/",
        "2. Klik 'Download Node.js LTS'",
        "3. Double-click file .msi installer",
        "4. Klik 'Next' - 'Next' - 'Next'",
        "5. CENTANG 'Automatically install necessary tools'",
        "6. Klik 'Install'",
        "7. Tunggu sampai selesai, klik 'Finish'"
    ]
    for step in node_steps:
        story.append(Paragraph(step, styles['BulletItem']))
    
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("<b>Verifikasi:</b>", styles['Body']))
    story.append(Paragraph("Buka Command Prompt, ketik:", styles['Body']))
    story.append(Paragraph("node --version", styles['CodeBlock']))
    story.append(Paragraph("npm --version", styles['CodeBlock']))
    
    story.append(Spacer(1, 15*mm))
    story.append(Paragraph("<b>2.2 Install PostgreSQL</b>", styles['SubSection']))
    story.append(Paragraph("PostgreSQL adalah database untuk menyimpan data aplikasi.", styles['Body']))
    
    story.append(Paragraph("<b>Download:</b> https://www.postgresql.org/download/windows/", styles['Body']))
    story.append(Paragraph("<b>Langkah Instalasi:</b>", styles['Body']))
    
    pg_steps = [
        "1. Download PostgreSQL installer",
        "2. Double-click installer",
        "3. Klik 'Next' beberapa kali",
        "4. ⚠️ SAAT DIPERINTAHKAN PASSWORD:",
        "   • Masukkan password yang MUDAH DIINGAT",
        "   • Contoh: postgres123",
        "   • INGET & CATAT password ini!",
        "5. Port default: 5432 (jangan diubah)",
        "6. Klik 'Next' - 'Install' - 'Finish'"
    ]
    for step in pg_steps:
        story.append(Paragraph(step, styles['BulletItem']))
    
    # Warning box
    warning_data = [['⚠️ PERINGATAN PENTING\nIngat password PostgreSQL! Password ini akan digunakan untuk DATABASE_URL di file .env']]
    warning_table = Table(warning_data, colWidths=[160*mm])
    warning_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 2, WARNING),
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#FEF3C7')),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ]))
    story.append(Spacer(1, 10*mm))
    story.append(warning_table)
    
    story.append(PageBreak())
    
    # ===== SECTION 3: PEMBUATAN DATABASE =====
    story.append(Paragraph("3. PEMBUATAN DATABASE", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=15))
    
    story.append(Paragraph("<b>3.1 Buka pgAdmin</b>", styles['SubSection']))
    story.append(Paragraph("pgAdmin adalah tool untuk manage PostgreSQL database.", styles['Body']))
    
    pgadmin_steps = [
        "1. Tekan Windows + S, ketik 'pgAdmin'",
        "2. Buka 'pgAdmin 4'",
        "3. Klik pada 'PostgreSQL' di panel kiri",
        "4. Masukkan password PostgreSQL",
        "5. Klik 'OK'"
    ]
    for step in pgadmin_steps:
        story.append(Paragraph(step, styles['BulletItem']))
    
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("<b>3.2 Buat Database Baru</b>", styles['SubSection']))
    
    db_steps = [
        "1. Klik kanan pada 'Databases'",
        "2. Pilih 'Create' → 'Database...'",
        "3. Isi field berikut:",
        "   • Database: payroll_db",
        "   • Owner: postgres",
        "   • Comment: Database Aplikasi Payroll",
        "4. Klik 'Save'"
    ]
    for step in db_steps:
        story.append(Paragraph(step, styles['BulletItem']))
    
    success_data = [['✓ SUCCESS\nDatabase payroll_db berhasil dibuat!']]
    success_table = Table(success_data, colWidths=[160*mm])
    success_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 2, SUCCESS),
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#DCFCE7')),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ]))
    story.append(Spacer(1, 10*mm))
    story.append(success_table)
    
    story.append(PageBreak())
    
    # ===== SECTION 4: DOWNLOAD PROJECT =====
    story.append(Paragraph("4. DOWNLOAD PROJECT", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=15))
    
    story.append(Paragraph("<b>4.1 Clone Repository</b>", styles['SubSection']))
    
    clone_steps = [
        "1. Buka Command Prompt atau PowerShell",
        "2. Pindah ke folder Documents:",
        "   cd Documents",
        "3. Clone repository:",
        "   git clone https://github.com/antono4/payroll.git",
        "4. Masuk ke folder:",
        "   cd payroll"
    ]
    for step in clone_steps:
        story.append(Paragraph(step, styles['BulletItem']))
    
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("<b>Struktur Folder:</b>", styles['SubSection']))
    story.append(Paragraph("""
    Documents/
    └── payroll/
        ├── prisma/
        ├── src/
        ├── node_modules/
        ├── package.json
        ├── .env.example
        └── README.md
    """, styles['CodeBlock']))
    
    story.append(PageBreak())
    
    # ===== SECTION 5: SETUP ENVIRONMENT =====
    story.append(Paragraph("5. SETUP ENVIRONMENT VARIABLES", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=15))
    
    story.append(Paragraph("<b>5.1 Buat File .env</b>", styles['SubSection']))
    story.append(Paragraph("File .env menyimpan konfigurasi aplikasi.", styles['Body']))
    
    env_steps = [
        "1. Di folder payroll, buat file baru bernama .env",
        "2. ⚠️ Pastikan extension-nya BUKAN .env.txt"
    ]
    for step in env_steps:
        story.append(Paragraph(step, styles['BulletItem']))
    
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("<b>5.2 Isi File .env</b>", styles['SubSection']))
    story.append(Paragraph("Buka file .env dengan Notepad atau VS Code, lalu isi dengan:", styles['Body']))
    
    story.append(Paragraph("""
    # DATABASE CONFIGURATION
    DATABASE_URL="postgresql://postgres:PASSWORD_KAMU@localhost:5432/payroll_db"
    
    # NEXTAUTH CONFIGURATION
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="inirahasia123456789012345678901234567890"
    """, styles['CodeBlock']))
    
    important_data = [['⚠️ IMPORTANT\nGanti PASSWORD_KAMU dengan password PostgreSQL Anda!\nContoh: DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/payroll_db"']]
    important_table = Table(important_data, colWidths=[160*mm])
    important_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 2, WARNING),
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#FEF3C7')),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ]))
    story.append(important_table)
    
    story.append(PageBreak())
    
    # ===== SECTION 6: INSTALASI DEPENDENCIES =====
    story.append(Paragraph("6. INSTALASI DEPENDENCIES", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=15))
    
    story.append(Paragraph("<b>Install NPM Packages</b>", styles['SubSection']))
    story.append(Paragraph("Buka Command Prompt di folder payroll, jalankan:", styles['Body']))
    story.append(Paragraph("npm install", styles['CodeBlock']))
    story.append(Paragraph("Proses ini akan mendownload semua package. Tunggu hingga selesai (bisa beberapa menit).", styles['Body']))
    
    success_data2 = [['✓ SUCCESS\nJika npm install berhasil tanpa error, semua dependencies sudah terinstall!']]
    success_table2 = Table(success_data2, colWidths=[160*mm])
    success_table2.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 2, SUCCESS),
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#DCFCE7')),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ]))
    story.append(Spacer(1, 10*mm))
    story.append(success_table2)
    
    story.append(PageBreak())
    
    # ===== SECTION 7: SETUP DATABASE =====
    story.append(Paragraph("7. SETUP DATABASE", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=15))
    
    db_setup = [
        ("<b>Generate Prisma Client:</b>", "npm run db:generate"),
        ("<b>Push Schema ke Database:</b>", "npm run db:push"),
        ("<b>Seed Data Awal:</b>", "npm run db:seed")
    ]
    
    for title, cmd in db_setup:
        story.append(Paragraph(title, styles['SubSection']))
        story.append(Paragraph(cmd, styles['CodeBlock']))
    
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("Seed akan membuat:", styles['Body']))
    seed_items = [
        "• Roles (Super Admin, HR Admin, Employee)",
        "• Sample employees",
        "• Salary components default",
        "• Leave types"
    ]
    for item in seed_items:
        story.append(Paragraph(item, styles['BulletItem']))
    
    success_data3 = [['✓ DATABASE READY\nDatabase sudah siap dengan tabel dan data awal!']]
    success_table3 = Table(success_data3, colWidths=[160*mm])
    success_table3.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 2, SUCCESS),
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#DCFCE7')),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ]))
    story.append(Spacer(1, 10*mm))
    story.append(success_table3)
    
    story.append(PageBreak())
    
    # ===== SECTION 8: JALANKAN APLIKASI =====
    story.append(Paragraph("8. JALANKAN APLIKASI", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=15))
    
    story.append(Paragraph("<b>Start Development Server</b>", styles['SubSection']))
    story.append(Paragraph("npm run dev", styles['CodeBlock']))
    story.append(Paragraph("Tunggu beberapa detik sampai muncul:", styles['Body']))
    story.append(Paragraph("  Local:        http://localhost:3000", styles['CodeBlock']))
    story.append(Paragraph("  ready started server on localhost:3000", styles['CodeBlock']))
    
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("<b>Buka di Browser</b>", styles['SubSection']))
    open_steps = [
        "1. Buka browser (Chrome, Firefox, Edge)",
        "2. Ketik: http://localhost:3000",
        "3. Halaman landing akan muncul"
    ]
    for step in open_steps:
        story.append(Paragraph(step, styles['BulletItem']))
    
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("<b>Halaman Login</b>", styles['SubSection']))
    story.append(Paragraph("1. Klik tombol Login di pojok kanan atas", styles['Body']))
    story.append(Paragraph("2. Atau langsung ke: http://localhost:3000/login", styles['Body']))
    
    story.append(PageBreak())
    
    # ===== SECTION 9: LOGIN CREDENTIALS =====
    story.append(Paragraph("9. LOGIN CREDENTIALS", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=15))
    
    story.append(Paragraph("Gunakan salah satu akun berikut untuk login:", styles['Body']))
    
    cred_data = [
        ['Role', 'Email', 'Password', 'Akses'],
        ['Super Admin', 'admin@contoh.co.id', 'admin123', 'Semua fitur'],
        ['HR Admin', 'hr@contoh.co.id', 'hr123', 'Payroll, Karyawan'],
        ['Employee', 'john.doe@contoh.co.id', 'emp123', 'Slip Gaji, Cuti']
    ]
    
    cred_table = Table(cred_data, colWidths=[35*mm, 50*mm, 30*mm, 45*mm])
    cred_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 1), (-1, 1), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), LIGHT_GRAY),
    ]))
    story.append(cred_table)
    
    story.append(Spacer(1, 15*mm))
    story.append(Paragraph("<b>Fitur per Role:</b>", styles['SubSection']))
    
    story.append(Paragraph("<b>Super Admin</b>", styles['Body']))
    super_features = ["• Semua fitur HR Admin", "• Pengaturan sistem", "• Manajemen user"]
    for feat in super_features:
        story.append(Paragraph(feat, styles['BulletItem']))
    
    story.append(Paragraph("<b>HR Admin</b>", styles['Body']))
    hr_features = ["• Manajemen karyawan", "• Proses payroll", "• Approval cuti", "• Lihat slip gaji", "• Laporan"]
    for feat in hr_features:
        story.append(Paragraph(feat, styles['BulletItem']))
    
    story.append(Paragraph("<b>Employee</b>", styles['Body']))
    emp_features = ["• Lihat slip gaji sendiri", "• Ajukan cuti", "• Cek saldo cuti", "• Update profil"]
    for feat in emp_features:
        story.append(Paragraph(feat, styles['BulletItem']))
    
    story.append(PageBreak())
    
    # ===== SECTION 10: TROUBLESHOOTING =====
    story.append(Paragraph("10. TROUBLESHOOTING", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=15))
    
    # Error 1
    story.append(Paragraph("<b>Error: npm not recognized</b>", styles['SubSection']))
    story.append(Paragraph("<b>Penyebab:</b> Node.js belum terinstall dengan PATH yang benar.", styles['Body']))
    story.append(Paragraph("<b>Solusi:</b>", styles['Body']))
    sol1 = ["1. Restart komputer", "2. Jika masih error, reinstall Node.js", "3. Pastikan centang 'Add to PATH'"]
    for s in sol1:
        story.append(Paragraph(s, styles['BulletItem']))
    
    story.append(Spacer(1, 10*mm))
    
    # Error 2
    story.append(Paragraph("<b>Error: Database connection failed</b>", styles['SubSection']))
    story.append(Paragraph("<b>Penyebab:</b> Password PostgreSQL salah atau PostgreSQL service tidak jalan.", styles['Body']))
    story.append(Paragraph("<b>Solusi:</b>", styles['Body']))
    sol2 = [
        "1. Pastikan PostgreSQL service sedang berjalan:",
        "   • Tekan Win + R, ketik services.msc",
        "   • Cari postgresql-x64-xx",
        "   • Pastikan Status: Running",
        "2. Cek password di file .env"
    ]
    for s in sol2:
        story.append(Paragraph(s, styles['BulletItem']))
    
    story.append(Spacer(1, 10*mm))
    
    # Error 3
    story.append(Paragraph("<b>Error: Port 3000 already in use</b>", styles['SubSection']))
    story.append(Paragraph("<b>Penyebab:</b> Ada aplikasi lain yang menggunakan port 3000.", styles['Body']))
    story.append(Paragraph("<b>Solusi:</b>", styles['Body']))
    story.append(Paragraph("Gunakan port berbeda:", styles['Body']))
    story.append(Paragraph("set PORT=3001 && npm run dev", styles['CodeBlock']))
    story.append(Paragraph("Buka http://localhost:3001", styles['Body']))
    
    story.append(PageBreak())
    
    # ===== SECTION 11: QUICK REFERENCE =====
    story.append(Paragraph("11. QUICK REFERENCE", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=15))
    
    story.append(Paragraph("<b>URL Routes</b>", styles['SubSection']))
    
    url_data = [
        ['Halaman', 'URL'],
        ['Landing Page', 'http://localhost:3000'],
        ['Login', 'http://localhost:3000/login'],
        ['Dashboard', 'http://localhost:3000/dashboard'],
        ['Karyawan', 'http://localhost:3000/employees'],
        ['Absensi', 'http://localhost:3000/attendance'],
        ['Cuti', 'http://localhost:3000/leave'],
        ['Payroll', 'http://localhost:3000/payroll'],
        ['Slip Gaji', 'http://localhost:3000/payslips'],
        ['Laporan', 'http://localhost:3000/reports']
    ]
    
    url_table = Table(url_data, colWidths=[60*mm, 100*mm])
    url_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Courier'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(url_table)
    
    story.append(Spacer(1, 15*mm))
    story.append(Paragraph("<b>Useful Commands</b>", styles['SubSection']))
    
    cmd_data = [
        ['Command', 'Fungsi'],
        ['npm run dev', 'Jalankan dev server'],
        ['npm run build', 'Build production'],
        ['npm run db:push', 'Update database schema'],
        ['npm run db:seed', 'Reset & seed data'],
        ['npm run db:studio', 'Buka Prisma Studio']
    ]
    
    cmd_table = Table(cmd_data, colWidths=[60*mm, 100*mm])
    cmd_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Courier'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(cmd_table)
    
    # ===== FOOTER =====
    story.append(Spacer(1, 30*mm))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=20))
    story.append(Paragraph("Terima Kasih!", styles['CoverTitle']))
    story.append(Paragraph("Aplikasi Payroll Indonesia v1.0", styles['Body']))
    story.append(Paragraph("GitHub: https://github.com/antono4/payroll", styles['Body']))
    story.append(Paragraph("© 2024 - Dibuat dengan Next.js untuk Indonesia", styles['Body']))
    
    # Build PDF
    doc.build(story)
    print(f"✓ PDF created: {filename}")

if __name__ == "__main__":
    create_pdf()

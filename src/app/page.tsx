import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Payroll System</h1>
                <p className="text-xs text-gray-500">HR Management Indonesia</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Sistem Payroll & HRIS
            <span className="block text-blue-600">Komprehensif untuk Indonesia</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Kelola penggajian, kehadiran, cuti, dan laporan karyawan dengan mudah.
            Didesain khusus sesuai regulasi perpajakan dan BPJS Indonesia.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Mulai Sekarang
            </Link>
            <a
              href="#features"
              className="px-8 py-3 text-base font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              Pelajari Fitur
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Manajemen Karyawan',
              description: 'Data lengkap karyawan, jabatan, departemen, dan informasi bank.',
              icon: '👥',
            },
            {
              title: 'Absensi & Kehadiran',
              description: 'Tracking kehadiran harian, lembur, dan generating laporan.',
              icon: '📅',
            },
            {
              title: 'Manajemen Cuti',
              description: 'Pengajuan, persetujuan, dan tracking saldo cuti karyawan.',
              icon: '🏖️',
            },
            {
              title: 'Proses Payroll',
              description: 'Kalkulasi otomatis gaji, potongan, pajak PPh 21, dan BPJS.',
              icon: '💰',
            },
            {
              title: 'Slip Gaji PDF',
              description: 'Generate slip gaji profesional dalam format PDF.',
              icon: '📄',
            },
            {
              title: 'Laporan Lengkap',
              description: 'Ringkasan payroll bulanan dan export laporan Excel.',
              icon: '📊',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="mt-24 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-8">
            Built with Modern Tech Stack
          </h3>
          <div className="flex justify-center gap-8 flex-wrap">
            {['Next.js 14', 'TypeScript', 'PostgreSQL', 'Prisma ORM', 'Tailwind CSS', 'NextAuth'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            © 2024 Payroll System. Dibuat dengan Next.js untuk perusahaan Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}

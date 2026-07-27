import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Payroll System</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">admin@contoh.co.id</span>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">A</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Selamat datang di sistem payroll</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: 'Total Karyawan', value: '150', change: '+5 bulan ini', color: 'blue' },
            { label: 'Gaji Bulan Ini', value: 'Rp 450.5jt', change: 'Processed', color: 'green' },
            { label: 'Cuti Pending', value: '12', change: 'Menunggu approval', color: 'yellow' },
            { label: 'Absensi Hari Ini', value: '142/150', change: '94.7%', color: 'indigo' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu Utama</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Karyawan', href: '/employees', icon: '👥', color: 'bg-blue-50 text-blue-600' },
              { name: 'Absensi', href: '/attendance', icon: '📅', color: 'bg-green-50 text-green-600' },
              { name: 'Cuti', href: '/leave', icon: '🏖️', color: 'bg-yellow-50 text-yellow-600' },
              { name: 'Payroll', href: '/payroll', icon: '💰', color: 'bg-purple-50 text-purple-600' },
              { name: 'Komponen Gaji', href: '/components', icon: '📋', color: 'bg-pink-50 text-pink-600' },
              { name: 'Laporan', href: '/reports', icon: '📊', color: 'bg-indigo-50 text-indigo-600' },
              { name: 'Slip Gaji', href: '/payslips', icon: '📄', color: 'bg-teal-50 text-teal-600' },
              { name: 'Pengaturan', href: '/settings', icon: '⚙️', color: 'bg-gray-50 text-gray-600' },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition"
              >
                <span className="text-3xl mb-2">{item.icon}</span>
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payroll */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payroll Terbaru</h2>
              <Link href="/payroll" className="text-sm text-blue-600 hover:text-blue-700">
                Lihat semua
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { period: 'Juli 2024', status: 'Paid', employees: 150, total: 'Rp 450.500.000' },
                { period: 'Juni 2024', status: 'Paid', employees: 148, total: 'Rp 445.200.000' },
                { period: 'Mei 2024', status: 'Paid', employees: 145, total: 'Rp 438.750.000' },
              ].map((payroll, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{payroll.period}</p>
                    <p className="text-sm text-gray-500">{payroll.employees} karyawan</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      payroll.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payroll.status}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">{payroll.total}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Leave Requests */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pengajuan Cuti Pending</h2>
              <Link href="/leave" className="text-sm text-blue-600 hover:text-blue-700">
                Lihat semua
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { name: 'John Doe', type: 'Cuti Tahunan', dates: '25-26 Jul 2024', days: 2 },
                { name: 'Jane Smith', type: 'Cuti Sakit', dates: '22 Jul 2024', days: 1 },
                { name: 'Bob Wilson', type: 'Cuti Tahunan', dates: '29-31 Jul 2024', days: 3 },
              ].map((leave, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{leave.name}</p>
                    <p className="text-sm text-gray-500">{leave.type} • {leave.dates}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{leave.days} hari</span>
                    <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100">
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

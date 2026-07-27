'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/badge';

interface Payslip {
  id: string;
  periodName: string;
  netSalary: number;
  status: string;
  createdAt: string;
}

interface LeaveBalance {
  leaveType: { name: string; code: string };
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export default function EmployeePortalPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [payslipHtml, setPayslipHtml] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch payslips
      const payslipRes = await fetch('/api/payslips?limit=6');
      const payslipData = await payslipRes.json();
      setPayslips(payslipData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = async (payslip: Payslip) => {
    // In real app, this would fetch the actual payslip
    setSelectedPayslip(payslip);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Sample employee data
  const employeeData = {
    name: 'John Doe',
    employeeNumber: 'EMP003',
    department: 'IT',
    position: 'Software Engineer',
    joinDate: '10 Januari 2023',
    email: 'john.doe@contoh.co.id',
    phone: '+62 812 3456 7891',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Employee Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{employeeData.name}</span>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 py-3">
            {['Dashboard', 'Profil', 'Slip Gaji', 'Cuti', 'Absensi'].map((item, i) => (
              <a
                key={i}
                href={`/employee/${item.toLowerCase().replace(' ', '-')}`}
                className={`text-sm font-medium ${i === 0 ? 'text-blue-600 border-b-2 border-blue-600 pb-2' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Selamat Datang, {employeeData.name}!</h1>
          <p className="text-gray-500">Berikut ringkasan informasi Anda</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-600">JD</span>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">No. Karyawan</p>
                <p className="font-medium">{employeeData.employeeNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Departemen</p>
                <p className="font-medium">{employeeData.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Jabatan</p>
                <p className="font-medium">{employeeData.position}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Tanggal Masuk</p>
                <p className="font-medium">{employeeData.joinDate}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Edit Profil</Button>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Gaji Bulan Ini</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(payslips[0]?.netSalary || 0)}
              </p>
              <Badge variant="success" className="mt-2">Sudah Dibayar</Badge>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Saldo Cuti</p>
              <p className="text-2xl font-bold text-blue-600">8 Hari</p>
              <p className="text-xs text-gray-400 mt-2">dari 12 hari cuti tahunan</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Kehadiran Bulan Ini</p>
              <p className="text-2xl font-bold text-yellow-600">22/22</p>
              <p className="text-xs text-gray-400 mt-2">Hadir (Termasuk cuti)</p>
            </div>
          </Card>
        </div>

        {/* Payslips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Slip Gaji Terakhir">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Memuat...</div>
            ) : payslips.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada slip gaji</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payslips.slice(0, 3).map((payslip) => (
                  <div 
                    key={payslip.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleViewPayslip(payslip)}
                  >
                    <div>
                      <p className="font-medium">{payslip.periodName}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(payslip.netSalary)}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/employee/payslips'}>
                  Lihat Semua Slip Gaji
                </Button>
              </div>
            )}
          </Card>

          <Card title="Ajukan Cuti">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Cuti Tahunan', used: 4, total: 12, color: 'bg-blue-500' },
                  { name: 'Cuti Sakit', used: 2, total: 14, color: 'bg-green-500' },
                ].map((leave, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{leave.name}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-bold">{leave.total - leave.used}</span>
                      <span className="text-sm text-gray-400">/ {leave.total} hari</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${leave.color}`}
                        style={{ width: `${(leave.used / leave.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajukan Cuti Baru
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card title="Aktivitas Terbaru" className="mt-6">
          <div className="space-y-4">
            {[
              { date: '15 Jul 2024', action: 'Slip Gaji Juni 2024 tersedia', icon: '📄' },
              { date: '10 Jul 2024', action: 'Pengajuan cuti disetujui', icon: '✅' },
              { date: '01 Jul 2024', action: 'Slip Gaji Mei 2024 tersedia', icon: '📄' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

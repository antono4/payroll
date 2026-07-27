'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, Modal } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/badge';

interface Attendance {
  id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
  lateMinutes: number;
  workHour: number | null;
  employee: {
    fullName: string;
    employeeNumber: string;
    department: { name: string };
  };
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [statusFilter, dateFilter]);

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (dateFilter) {
        params.set('startDate', dateFilter);
        params.set('endDate', dateFilter);
      }
      params.set('limit', '50');
      
      const res = await fetch(`/api/attendance?${params}`);
      const data = await res.json();
      setAttendance(data.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttendance = async () => {
    if (!selectedDate) return;
    
    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          status: 'present',
        }),
      });
      setShowModal(false);
      fetchAttendance();
    } catch (error) {
      console.error('Error adding attendance:', error);
    }
  };

  const formatTime = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      present: 'success',
      late: 'warning',
      absent: 'danger',
      sick: 'info',
      leave: 'default',
      cuti: 'default',
    };
    const labels: Record<string, string> = {
      present: 'Hadir',
      late: 'Terlambat',
      absent: 'Alfa',
      sick: 'Sakit',
      leave: 'Izin',
      cuti: 'Cuti',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayStats = attendance.filter(a => a.date.split('T')[0] === today);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Absensi & Kehadiran</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
                ← Dashboard
              </a>
              <Button onClick={() => setShowModal(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Input Absensi
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'present', label: 'Hadir' },
                { value: 'late', label: 'Terlambat' },
                { value: 'absent', label: 'Alfa' },
                { value: 'sick', label: 'Sakit' },
                { value: 'leave', label: 'Izin' },
              ]}
            />
            <Input
              placeholder="Cari karyawan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Hadir', value: todayStats.filter(a => a.status === 'present').length, color: 'bg-green-50 border-green-200' },
            { label: 'Terlambat', value: todayStats.filter(a => a.status === 'late').length, color: 'bg-yellow-50 border-yellow-200' },
            { label: 'Alfa', value: todayStats.filter(a => a.status === 'absent').length, color: 'bg-red-50 border-red-200' },
            { label: 'Sakit', value: todayStats.filter(a => a.status === 'sick').length, color: 'bg-blue-50 border-blue-200' },
            { label: 'Izin/Cuti', value: todayStats.filter(a => ['leave', 'cuti'].includes(a.status)).length, color: 'bg-purple-50 border-purple-200' },
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-lg border ${stat.color}`}>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Attendance List */}
        <Card title="Daftar Kehadiran">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat...</div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data kehadiran
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Tanggal</TableHeadCell>
                  <TableHeadCell>Karyawan</TableHeadCell>
                  <TableHeadCell>Jam Masuk</TableHeadCell>
                  <TableHeadCell>Jam Pulang</TableHeadCell>
                  <TableHeadCell>Jam Kerja</TableHeadCell>
                  <TableHeadCell>Terlambat</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map((att) => (
                  <TableRow key={att.id}>
                    <TableCell className="text-sm">{formatDate(att.date)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{att.employee.fullName}</div>
                        <div className="text-xs text-gray-500">{att.employee.employeeNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatTime(att.clockIn)}</TableCell>
                    <TableCell>{formatTime(att.clockOut)}</TableCell>
                    <TableCell>{att.workHour ? `${att.workHour.toFixed(1)} jam` : '-'}</TableCell>
                    <TableCell className={att.lateMinutes > 0 ? 'text-red-600' : ''}>
                      {att.lateMinutes > 0 ? `${att.lateMinutes} menit` : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(att.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>

      {/* Add Attendance Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Input Absensi"
      >
        <div className="space-y-4">
          <Input
            label="Tanggal"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Untuk input absensi per karyawan, silakan gunakan halaman detail karyawan.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button onClick={handleAddAttendance}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

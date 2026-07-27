'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/badge';
import { Modal } from '@/components/ui/badge';

interface PayrollPeriod {
  id: string;
  name: string;
  year: number;
  month: number;
  status: string;
  periodStart: string;
  periodEnd: string;
  _count: { headers: number };
}

interface PayrollSummary {
  periodId: string;
  periodName: string;
  totalEmployees: number;
  totalEarnings: number;
  totalDeductions: number;
  totalTax: number;
  totalNetSalary: number;
}

export default function PayrollPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const res = await fetch('/api/payroll-periods');
      const data = await res.json();
      setPeriods(data);
    } catch (error) {
      console.error('Error fetching periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePeriod = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    try {
      const res = await fetch('/api/payroll-periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      });
      
      if (res.ok) {
        fetchPeriods();
      }
    } catch (error) {
      console.error('Error creating period:', error);
    }
  };

  const handleProcessPayroll = async (periodId: string) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        fetchPeriods();
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
    } finally {
      setProcessing(false);
      setShowProcessModal(false);
    }
  };

  const handleViewSummary = async (period: PayrollPeriod) => {
    setSelectedPeriod(period);
    try {
      const res = await fetch(`/api/payroll?periodId=${period.id}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
      draft: 'default',
      calculated: 'info',
      approved: 'warning',
      paid: 'success',
    };
    const labels: Record<string, string> = {
      draft: 'Draft',
      calculated: 'Dihitung',
      approved: 'Disetujui',
      paid: 'Dibayar',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Proses Payroll</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
                ← Dashboard
              </a>
              <Button onClick={handleCreatePeriod}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buat Periode Baru
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Periode', value: periods.length, icon: '📅' },
            { label: 'Pending', value: periods.filter(p => p.status === 'draft').length, icon: '⏳' },
            { label: 'Sudah Dibayar', value: periods.filter(p => p.status === 'paid').length, icon: '✅' },
            { label: 'Total Karyawan', value: periods.reduce((sum, p) => sum + p._count.headers, 0), icon: '👥' },
          ].map((stat, i) => (
            <Card key={i}>
              <div className="flex items-center gap-4">
                <span className="text-3xl">{stat.icon}</span>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Period List */}
        <Card title="Daftar Periode Payroll">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat...</div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada periode payroll.</p>
              <Button className="mt-4" onClick={handleCreatePeriod}>
                Buat Periode Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Periode</TableHeadCell>
                  <TableHeadCell>Tanggal</TableHeadCell>
                  <TableHeadCell>Karyawan</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Aksi</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">{period.name}</TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(period.periodStart).toLocaleDateString('id-ID')} - 
                      {new Date(period.periodEnd).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>{period._count.headers} orang</TableCell>
                    <TableCell>{getStatusBadge(period.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {period.status === 'draft' && (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedPeriod(period);
                              setShowProcessModal(true);
                            }}
                            disabled={processing}
                          >
                            Proses Gaji
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewSummary(period)}
                        >
                          Lihat Rincian
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>

      {/* Process Modal */}
      <Modal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        title="Proses Payroll"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Proses Gaji {selectedPeriod?.name}?</h3>
          <p className="text-gray-500 mb-6">
            Sistem akan menghitung gaji semua karyawan aktif untuk periode ini.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setShowProcessModal(false)}>
              Batal
            </Button>
            <Button 
              onClick={() => selectedPeriod && handleProcessPayroll(selectedPeriod.id)}
              loading={processing}
            >
              Mulai Proses
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Ringkasan Payroll - ${selectedPeriod?.name}`}
        size="lg"
      >
        {summary && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Total Penghasilan</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(summary.totalEarnings)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">Total Potongan</p>
                <p className="text-xl font-bold text-red-700">{formatCurrency(summary.totalDeductions)}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">Total PPh 21</p>
                <p className="text-xl font-bold text-yellow-700">{formatCurrency(summary.totalTax)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Total Gaji Bersih</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(summary.totalNetSalary)}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Total Karyawan: <strong>{summary.totalEmployees}</strong></p>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Tutup
              </Button>
              <Button>Lihat Detail Karyawan</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

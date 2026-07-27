'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { printPayslip } from '@/lib/pdf/payslip';

interface Payslip {
  id: string;
  employeeId: string;
  periodName: string;
  pdfUrl: string | null;
  generatedAt: string;
  employee: {
    fullName: string;
    employeeNumber: string;
    department: { name: string };
  };
  payrollHeader: {
    netSalary: number;
    totalEarnings: number;
    totalDeductions: number;
    status: string;
  };
}

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [payslipHtml, setPayslipHtml] = useState<string | null>(null);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      const res = await fetch('/api/payslips?limit=50');
      const data = await res.json();
      setPayslips(data.data || []);
    } catch (error) {
      console.error('Error fetching payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = async (payslip: Payslip) => {
    try {
      const res = await fetch('/api/payslips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payrollHeaderId: payslip.payrollHeaderId }),
      });
      const data = await res.json();
      setPayslipHtml(data.html);
      setSelectedPayslip(payslip);
    } catch (error) {
      console.error('Error generating payslip:', error);
    }
  };

  const handlePrint = () => {
    if (payslipHtml) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(payslipHtml);
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredPayslips = payslips.filter(p => 
    p.employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.employee.employeeNumber.toLowerCase().includes(search.toLowerCase())
  );

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
              <span className="font-bold text-gray-900">Slip Gaji</span>
            </div>
            <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              ← Kembali ke Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <Card className="mb-6">
          <div className="flex gap-4">
            <Input
              placeholder="Cari nama atau nomor karyawan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payslips List */}
          <div className="lg:col-span-2">
            <Card title="Daftar Slip Gaji">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Memuat...</div>
              ) : filteredPayslips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada slip gaji ditemukan
                </div>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeadCell>Karyawan</TableHeadCell>
                      <TableHeadCell>Periode</TableHeadCell>
                      <TableHeadCell>Gaji Bersih</TableHeadCell>
                      <TableHeadCell>Status</TableHeadCell>
                      <TableHeadCell>Aksi</TableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPayslips.map((payslip) => (
                      <TableRow 
                        key={payslip.id}
                        className={selectedPayslip?.id === payslip.id ? 'bg-blue-50' : ''}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{payslip.employee.fullName}</div>
                            <div className="text-xs text-gray-500">{payslip.employee.employeeNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>{payslip.periodName}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(payslip.payrollHeader.netSalary)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={payslip.payrollHeader.status === 'paid' ? 'success' : 'warning'}>
                            {payslip.payrollHeader.status === 'paid' ? 'Lunas' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewPayslip(payslip as any)}
                            >
                              Lihat
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>

          {/* Payslip Preview */}
          <div className="lg:col-span-1">
            <Card title="Preview Slip Gaji">
              {selectedPayslip && payslipHtml ? (
                <div>
                  <div className="border rounded-lg overflow-hidden mb-4">
                    <iframe
                      srcDoc={payslipHtml}
                      className="w-full h-[500px] bg-white"
                      title="Payslip Preview"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handlePrint} className="flex-1">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Cetak
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Pilih slip gaji untuk melihat preview</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

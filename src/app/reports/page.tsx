'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/badge';
import { Select } from '@/components/ui/badge';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedReport, setSelectedReport] = useState('');

  const reports = [
    {
      id: 'payroll-summary',
      name: 'Ringkasan Payroll Bulanan',
      description: 'Total penghasilan, potongan, pajak, dan gaji bersih per periode',
      icon: '💰',
    },
    {
      id: 'attendance-summary',
      name: 'Rekapitulasi Kehadiran',
      description: 'Ringkasan kehadiran per karyawan per periode',
      icon: '📅',
    },
    {
      id: 'leave-summary',
      name: 'Laporan Cuti Karyawan',
      description: 'Detail penggunaan cuti dan saldo cuti karyawan',
      icon: '🏖️',
    },
    {
      id: 'bpjs-report',
      name: 'Laporan BPJS',
      description: 'Ringkasan kontribusi BPJS Kesehatan dan Ketenagakerjaan',
      icon: '🏥',
    },
    {
      id: 'pph21-report',
      name: 'Laporan PPh 21',
      description: 'Daftar PPh 21 karyawan untuk pelaporan pajak',
      icon: '📋',
    },
    {
      id: 'employee-list',
      name: 'Daftar Karyawan',
      description: 'Data lengkap karyawan dalam format Excel',
      icon: '👥',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Laporan</span>
            </div>
            <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              ← Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Periode"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              options={[
                { value: '', label: 'Pilih Periode' },
                { value: '2024-07', label: 'Juli 2024' },
                { value: '2024-06', label: 'Juni 2024' },
                { value: '2024-05', label: 'Mei 2024' },
              ]}
            />
            <div className="flex items-end">
              <Button className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </Button>
            </div>
          </div>
        </Card>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  {report.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Sample Report Preview */}
        <Card title="Preview: Ringkasan Payroll Juli 2024" className="mt-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departemen</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Gaji</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Potongan</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total PPh 21</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Bersih</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { dept: 'IT', count: 45, gross: 315000000, deduction: 47250000, tax: 9450000, net: 258300000 },
                  { dept: 'Finance', count: 20, gross: 180000000, deduction: 27000000, tax: 5400000, net: 147600000 },
                  { dept: 'HR', count: 15, gross: 120000000, deduction: 18000000, tax: 3600000, net: 98400000 },
                  { dept: 'Marketing', count: 35, gross: 245000000, deduction: 36750000, tax: 7350000, net: 200900000 },
                  { dept: 'Operations', count: 35, gross: 210000000, deduction: 31500000, tax: 6300000, net: 172200000 },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-medium">{row.dept}</td>
                    <td className="px-4 py-3 text-right">{row.count}</td>
                    <td className="px-4 py-3 text-right text-blue-600">
                      Rp {row.gross.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      Rp {row.deduction.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right text-yellow-600">
                      Rp {row.tax.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                      Rp {row.net.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-4 py-3 font-bold">TOTAL</td>
                  <td className="px-4 py-3 text-right font-bold">150</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">Rp 1,070,000,000</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">Rp 160,500,000</td>
                  <td className="px-4 py-3 text-right font-bold text-yellow-600">Rp 32,100,000</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">Rp 877,400,000</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}

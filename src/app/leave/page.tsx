'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, Modal } from '@/components/ui/badge';
import { Select } from '@/components/ui/badge';

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string | null;
  status: string;
  createdAt: string;
  employee: {
    fullName: string;
    employeeNumber: string;
    department: { name: string };
  };
  leaveType: {
    name: string;
    code: string;
  };
}

export default function LeavePage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [actionModal, setActionModal] = useState<{ show: boolean; action: 'approve' | 'reject' }>({ show: false, action: 'approve' });

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const fetchLeaves = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      
      const res = await fetch(`/api/leave?${params}`);
      const data = await res.json();
      setLeaves(data || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (leaveId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      await fetch(`/api/leave/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          approvedBy: 'admin', // In real app, get from session
          rejectedReason: reason,
        }),
      });
      setActionModal({ show: false, action: 'approve' });
      setSelectedLeave(null);
      fetchLeaves();
    } catch (error) {
      console.error('Error processing leave:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      cancelled: 'default',
    };
    const labels: Record<string, string> = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      cancelled: 'Dibatalkan',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  // Calculate stats
  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Manajemen Cuti</span>
            </div>
            <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              ← Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Total Pengajuan', value: leaves.length, icon: '📋', color: 'blue' },
            { label: 'Menunggu Approval', value: pendingCount, icon: '⏳', color: 'yellow' },
            { label: 'Disetujui', value: approvedCount, icon: '✅', color: 'green' },
            { label: 'Ditolak', value: leaves.filter(l => l.status === 'rejected').length, icon: '❌', color: 'red' },
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

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex gap-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'pending', label: 'Menunggu' },
                { value: 'approved', label: 'Disetujui' },
                { value: 'rejected', label: 'Ditolak' },
              ]}
            />
          </div>
        </Card>

        {/* Leave List */}
        <Card title="Daftar Pengajuan Cuti">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat...</div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada pengajuan cuti
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Karyawan</TableHeadCell>
                  <TableHeadCell>Jenis Cuti</TableHeadCell>
                  <TableHeadCell>Tanggal</TableHeadCell>
                  <TableHeadCell>Durasi</TableHeadCell>
                  <TableHeadCell>Alasan</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Aksi</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{leave.employee.fullName}</div>
                        <div className="text-xs text-gray-500">{leave.employee.department.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {leave.leaveType.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{formatDate(leave.startDate)}</div>
                      <div className="text-gray-400">s/d {formatDate(leave.endDate)}</div>
                    </TableCell>
                    <TableCell className="font-medium">{leave.totalDays} hari</TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                      {leave.reason || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell>
                      {leave.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setActionModal({ show: true, action: 'approve' });
                            }}
                          >
                            Setuju
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setActionModal({ show: true, action: 'reject' });
                            }}
                          >
                            Tolak
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>

      {/* Action Modal */}
      <Modal
        isOpen={actionModal.show}
        onClose={() => setActionModal({ show: false, action: 'approve' })}
        title={actionModal.action === 'approve' ? 'Setujui Cuti' : 'Tolak Cuti'}
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>{selectedLeave.employee.fullName}</strong></p>
              <p className="text-sm text-gray-600">
                {selectedLeave.leaveType.name} • {selectedLeave.totalDays} hari
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
              </p>
            </div>
            
            {actionModal.action === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan Penolakan
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Masukkan alasan penolakan..."
                />
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setActionModal({ show: false, action: 'approve' })}>
                Batal
              </Button>
              <Button 
                className={actionModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                onClick={() => handleAction(selectedLeave.id, actionModal.action)}
              >
                {actionModal.action === 'approve' ? 'Setuju' : 'Tolak'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

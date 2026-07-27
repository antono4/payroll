'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, Modal } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/badge';

interface Employee {
  id: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  employmentType: string;
  joinDate: string;
  department?: { name: string };
  position?: { title: string };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, [search, departmentFilter]);

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (departmentFilter) params.set('departmentId', departmentFilter);
      params.set('limit', '50');
      
      const res = await fetch(`/api/employees?${params}`);
      const data = await res.json();
      setEmployees(data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      active: 'success',
      inactive: 'warning',
      terminated: 'danger',
      resigned: 'danger',
    };
    const labels: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Nonaktif',
      terminated: 'Diberhentikan',
      resigned: 'Mengundurkan Diri',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Manajemen Karyawan</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
                ← Dashboard
              </a>
              <Button onClick={() => { setSelectedEmployee(null); setShowModal(true); }}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Karyawan
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Cari nama, NIK, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              options={[
                { value: '', label: 'Semua Departemen' },
                { value: 'it', label: 'IT' },
                { value: 'hr', label: 'HR' },
                { value: 'finance', label: 'Finance' },
              ]}
            />
          </div>
        </Card>

        {/* Employee List */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Daftar Karyawan</h3>
            <p className="text-sm text-gray-500">Total: {employees.length} karyawan</p>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada karyawan ditemukan
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>No.</TableHeadCell>
                  <TableHeadCell>Karyawan</TableHeadCell>
                  <TableHeadCell>Departemen</TableHeadCell>
                  <TableHeadCell>Jabatan</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Tanggal Masuk</TableHeadCell>
                  <TableHeadCell>Aksi</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee, index) => (
                  <TableRow key={employee.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.fullName}</div>
                        <div className="text-xs text-gray-500">{employee.employeeNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department?.name || '-'}</TableCell>
                    <TableCell>{employee.position?.title || '-'}</TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell>{formatDate(employee.joinDate)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => handleViewEmployee(employee)}>
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>

      {/* Employee Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedEmployee ? 'Detail Karyawan' : 'Tambah Karyawan'}
        size="lg"
      >
        {selectedEmployee ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase">Nama Lengkap</label>
                <p className="font-medium">{selectedEmployee.fullName}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">No. Karyawan</label>
                <p className="font-medium">{selectedEmployee.employeeNumber}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Email</label>
                <p className="font-medium">{selectedEmployee.email || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Telepon</label>
                <p className="font-medium">{selectedEmployee.phone || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Departemen</label>
                <p className="font-medium">{selectedEmployee.department?.name || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Jabatan</label>
                <p className="font-medium">{selectedEmployee.position?.title || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Status</label>
                {getStatusBadge(selectedEmployee.status)}
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Tanggal Masuk</label>
                <p className="font-medium">{formatDate(selectedEmployee.joinDate)}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Tutup
              </Button>
              <Button>Edit</Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nama Lengkap" placeholder="Masukkan nama lengkap" required />
              <Input label="No. Karyawan" placeholder="EMP-001" required />
              <Input label="Email" type="email" placeholder="email@perusahaan.com" />
              <Input label="Telepon" placeholder="+62 xxx" />
              <Select 
                label="Departemen" 
                options={[
                  { value: '', label: 'Pilih Departemen' },
                  { value: 'it', label: 'IT' },
                  { value: 'hr', label: 'HR' },
                  { value: 'finance', label: 'Finance' },
                ]}
              />
              <Select 
                label="Jabatan" 
                options={[
                  { value: '', label: 'Pilih Jabatan' },
                  { value: 'staff', label: 'Staff' },
                  { value: 'senior', label: 'Senior' },
                  { value: 'lead', label: 'Lead' },
                  { value: 'manager', label: 'Manager' },
                ]}
              />
              <Input label="Tanggal Masuk" type="date" required />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

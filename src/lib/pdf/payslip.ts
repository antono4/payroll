// ============================================
// Payslip PDF Generator
// Using jsPDF for PDF generation
// ============================================

interface PayslipData {
  // Company Info
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyLogo?: string;
  
  // Employee Info
  employeeName: string;
  employeeNumber: string;
  department: string;
  position: string;
  joinDate: string;
  npwp: string;
  bpjsNumber: string;
  
  // Payroll Period
  periodName: string;
  periodMonth: number;
  periodYear: number;
  paymentDate: string;
  
  // Earnings
  earnings: Array<{
    name: string;
    amount: number;
  }>;
  totalEarnings: number;
  
  // Deductions
  deductions: Array<{
    name: string;
    amount: number;
  }>;
  totalDeductions: number;
  
  // Tax
  taxAmount: number;
  
  // Net Salary
  netSalary: number;
  
  // Bank Info
  bankName: string;
  bankAccount: string;
}

// Format currency to IDR
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Generate payslip HTML for printing/PDF
export function generatePayslipHTML(data: PayslipData): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Slip Gaji - ${data.periodName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; font-size: 12px; color: #333; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; border: 2px solid #2563eb; border-radius: 8px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 6px 6px 0 0; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { font-size: 12px; opacity: 0.9; }
    .content { padding: 20px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: bold; color: #2563eb; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #e5e7eb; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .info-item { margin-bottom: 8px; }
    .info-label { font-size: 10px; color: #6b7280; text-transform: uppercase; }
    .info-value { font-size: 13px; font-weight: 500; }
    .salary-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .salary-table th, .salary-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .salary-table th { background: #f3f4f6; font-weight: 600; font-size: 11px; color: #6b7280; }
    .salary-table .text-right { text-align: right; }
    .salary-table .total-row { font-weight: bold; background: #f9fafb; }
    .salary-table .earnings { color: #059669; }
    .salary-table .deductions { color: #dc2626; }
    .net-salary { background: #2563eb; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px; }
    .net-salary .label { font-size: 12px; opacity: 0.9; }
    .net-salary .amount { font-size: 24px; font-weight: bold; }
    .footer { padding: 15px 20px; background: #f3f4f6; border-radius: 0 0 6px 6px; font-size: 10px; color: #6b7280; text-align: center; }
    .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 30px; text-align: center; }
    .signature-box { padding-top: 60px; }
    .signature-line { border-top: 1px solid #333; padding-top: 5px; font-size: 10px; }
    @media print { body { padding: 0; } .container { border: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.companyName}</h1>
      <p>Slip Gaji - ${data.periodName}</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="info-grid">
          <div>
            <div class="info-item">
              <div class="info-label">Nama Karyawan</div>
              <div class="info-value">${data.employeeName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Nomor Karyawan</div>
              <div class="info-value">${data.employeeNumber}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Departemen</div>
              <div class="info-value">${data.department}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Jabatan</div>
              <div class="info-value">${data.position}</div>
            </div>
          </div>
          <div>
            <div class="info-item">
              <div class="info-label">Tanggal Masuk</div>
              <div class="info-value">${data.joinDate}</div>
            </div>
            <div class="info-item">
              <div class="info-label">NPWP</div>
              <div class="info-value">${data.npwp || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">BPJS</div>
              <div class="info-value">${data.bpjsNumber || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tanggal Bayar</div>
              <div class="info-value">${data.paymentDate}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Penghasilan (Earnings)</div>
        <table class="salary-table">
          <thead>
            <tr>
              <th>Keterangan</th>
              <th class="text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            ${data.earnings.map(e => `
              <tr>
                <td>${e.name}</td>
                <td class="text-right earnings">${formatRupiah(e.amount)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td>Total Penghasilan</td>
              <td class="text-right earnings">${formatRupiah(data.totalEarnings)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <div class="section-title">Potongan (Deductions)</div>
        <table class="salary-table">
          <thead>
            <tr>
              <th>Keterangan</th>
              <th class="text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            ${data.deductions.map(d => `
              <tr>
                <td>${d.name}</td>
                <td class="text-right deductions">${formatRupiah(d.amount)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td>Total Potongan</td>
              <td class="text-right deductions">${formatRupiah(data.totalDeductions)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <div class="section-title">Pajak (Tax)</div>
        <table class="salary-table">
          <thead>
            <tr>
              <th>Keterangan</th>
              <th class="text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PPh 21 Bulan Ini</td>
              <td class="text-right deductions">${formatRupiah(data.taxAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="net-salary">
        <div class="label">GAJI BERSIH (TAKE HOME PAY)</div>
        <div class="amount">${formatRupiah(data.netSalary)}</div>
      </div>
      
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line">Karyawan</div>
        </div>
        <div class="signature-box">
          <div class="signature-line">HR / Keuangan</div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>Slip gaji ini dicetak pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      <p>Dokumen ini dicetak dari sistem ${data.companyName} - Rahasia</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Generate payslip as base64 (for API response)
export async function generatePayslipPDF(data: PayslipData): Promise<string> {
  // In a real implementation, you would use jsPDF or puppeteer here
  // For now, we return HTML that can be converted to PDF client-side
  const html = generatePayslipHTML(data);
  
  // Base64 encode the HTML
  return Buffer.from(html).toString('base64');
}

// Print payslip function (for client-side)
export function printPayslip(data: PayslipData) {
  const html = generatePayslipHTML(data);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

// Download payslip as HTML file
export function downloadPayslipHTML(data: PayslipData) {
  const html = generatePayslipHTML(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `slip-gaji-${data.employeeNumber}-${data.periodName.replace(' ', '-')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

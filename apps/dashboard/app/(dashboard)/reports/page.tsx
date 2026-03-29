import { fetchApi } from '@/lib/api-client';
import type { ReportRecord } from '@treasuryos/types';
import { CreateReportForm } from '@/components/create-report-form';
import { ReportJobStatus } from '@treasuryos/types';
import { AppShell } from '@/components/app-shell';

export default async function ReportsPage() {
  const { reports } = await fetchApi<{ reports: ReportRecord[] }>('reports', {
    next: { revalidate: 0 },
  });

  return (
    <AppShell>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>Compliance Reports</h1>
            <p style={{ color: '#888', marginTop: '0.5rem' }}>Generate and download monthly operational summaries.</p>
          </div>
          <CreateReportForm />
        </header>

      <div style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#111', borderBottom: '1px solid #333' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: 500, color: '#888' }}>Month</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: '#888' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: '#888' }}>Entities</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: '#888' }}>Cases (Total/Open)</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: '#888' }}>Created</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: '#888', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{report.month}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.875rem', 
                    background: report.status === ReportJobStatus.Generated ? '#003300' : report.status === ReportJobStatus.Failed ? '#330000' : '#333', 
                    color: report.status === ReportJobStatus.Generated ? '#0f0' : report.status === ReportJobStatus.Failed ? '#f00' : '#fff' 
                  }}>
                    {report.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#ccc' }}>{report.metrics?.entityCount || 0}</td>
                <td style={{ padding: '1rem', color: '#ccc' }}>
                  {report.metrics?.totalCaseCount || 0} / {report.metrics?.openCaseCount || 0}
                </td>
                <td style={{ padding: '1rem', color: '#888', fontSize: '0.875rem' }}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {report.status === ReportJobStatus.Generated && (
                    <a 
                      href={`/api/download/${report.id}`} 
                      download 
                      style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: 500 }}
                    >
                      Download CSV
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#888' }}>
                  No reports generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </AppShell>
  );
}

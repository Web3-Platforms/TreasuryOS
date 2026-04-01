import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import {
  convertCsvToXlsxBuffer,
  extractAttachmentFilename,
  getReportDownloadMimeType,
  getReportDownloadName,
  resolveReportDownloadFormat,
} from '@/lib/report-downloads';

const API_BASE_URL = process.env.API_BASE_URL;

type ReportDownloadContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function handleReportDownload(
  request: Request,
  context: ReportDownloadContext,
) {
  const { id } = await context.params;
  const format = resolveReportDownloadFormat(new URL(request.url).searchParams.get('format'));
  const cookieStore = await cookies();
  const token = cookieStore.get('treasuryos_access_token')?.value;

  if (!API_BASE_URL) {
    return new NextResponse('Server misconfiguration: API_BASE_URL is not set.', {
      status: 500,
    });
  }

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!format) {
    return new NextResponse('Invalid report format. Supported formats: csv, xlsx.', {
      status: 400,
    });
  }

  const response = await fetch(`${API_BASE_URL}/reports/${id}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');

    return new NextResponse(message || `Error downloading report: ${response.statusText}`, {
      status: response.status,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  const upstreamFileName = extractAttachmentFilename(response.headers.get('content-disposition'));

  if (format === 'csv') {
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': response.headers.get('content-type') || getReportDownloadMimeType('csv'),
        'Content-Disposition': `attachment; filename="${getReportDownloadName(id, upstreamFileName, 'csv')}"`,
      },
    });
  }

  const csvContents = await response.text();
  const xlsxContents = await convertCsvToXlsxBuffer(csvContents);

  return new NextResponse(xlsxContents, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': getReportDownloadMimeType('xlsx'),
      'Content-Disposition': `attachment; filename="${getReportDownloadName(id, upstreamFileName, 'xlsx')}"`,
    },
  });
}

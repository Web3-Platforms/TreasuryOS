import { handleReportDownload } from '@/lib/report-download-route';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleReportDownload(request, context);
}

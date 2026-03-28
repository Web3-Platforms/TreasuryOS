import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

export async function GET(request: Request, context: { params: { id: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('treasuryos_access_token')?.value;

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const response = await fetch(`${API_BASE_URL}/reports/${context.params.id}/download`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return new NextResponse(`Error downloading report: ${response.statusText}`, { status: response.status });
  }

  return new NextResponse(response.body, {
    status: 200,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'text/csv',
      'Content-Disposition': response.headers.get('content-disposition') || `attachment; filename="report-${context.params.id}.csv"`,
    },
  });
}

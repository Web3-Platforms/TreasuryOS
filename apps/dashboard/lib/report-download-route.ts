import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, buildLoginUrl } from "@/lib/auth";

import {
  convertCsvToXlsxBuffer,
  extractAttachmentFilename,
  getReportDownloadMimeType,
  getReportDownloadName,
  resolveReportDownloadFormat,
} from "@/lib/report-downloads";

const API_BASE_URL = process.env.API_BASE_URL;

type ReportDownloadContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function handleReportDownload(
  request: Request,
  context: ReportDownloadContext,
) {
  const requestUrl = new URL(request.url);
  const callbackUrl = `${requestUrl.pathname}${requestUrl.search}`;
  const { id } = await context.params;
  const format = resolveReportDownloadFormat(
    requestUrl.searchParams.get("format"),
  );
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!API_BASE_URL) {
    return new NextResponse(
      "Server misconfiguration: API_BASE_URL is not set.",
      {
        status: 500,
      },
    );
  }

  if (!token) {
    return NextResponse.redirect(
      new URL(buildLoginUrl({ callbackUrl }), request.url),
    );
  }

  if (!format) {
    return new NextResponse(
      "Invalid report format. Supported formats: csv, xlsx.",
      {
        status: 400,
      },
    );
  }

  const response = await fetch(`${API_BASE_URL}/reports/${id}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      return NextResponse.redirect(
        new URL(
          buildLoginUrl({
            callbackUrl,
            reauth: true,
            sessionExpired: true,
          }),
          request.url,
        ),
      );
    }

    const message = await response.text().catch(() => "");

    return new NextResponse(
      message || `Error downloading report: ${response.statusText}`,
      {
        status: response.status,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      },
    );
  }

  const upstreamFileName = extractAttachmentFilename(
    response.headers.get("content-disposition"),
  );

  if (format === "csv") {
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type":
          response.headers.get("content-type") ||
          getReportDownloadMimeType("csv"),
        "Content-Disposition": `attachment; filename="${getReportDownloadName(id, upstreamFileName, "csv")}"`,
      },
    });
  }

  const csvContents = await response.text();
  const xlsxContents = await convertCsvToXlsxBuffer(csvContents);

  return new NextResponse(xlsxContents, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": getReportDownloadMimeType("xlsx"),
      "Content-Disposition": `attachment; filename="${getReportDownloadName(id, upstreamFileName, "xlsx")}"`,
    },
  });
}

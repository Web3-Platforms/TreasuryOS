import ExcelJS from 'exceljs';

export const reportDownloadFormats = ['csv', 'xlsx'] as const;

export type ReportDownloadFormat = (typeof reportDownloadFormats)[number];

const REPORT_DOWNLOAD_MIME_TYPES: Record<ReportDownloadFormat, string> = {
  csv: 'text/csv; charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export function resolveReportDownloadFormat(
  value: string | null | undefined,
): ReportDownloadFormat | null {
  if (!value) {
    return 'csv';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'csv' || normalized === 'xlsx') {
    return normalized;
  }

  return null;
}

export function getReportDownloadMimeType(format: ReportDownloadFormat) {
  return REPORT_DOWNLOAD_MIME_TYPES[format];
}

export function extractAttachmentFilename(header: string | null | undefined) {
  if (!header) {
    return null;
  }

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) {
    return decodeURIComponent(utf8Match[1].replace(/^"|"$/g, ''));
  }

  const simpleMatch = header.match(/filename="?([^"]+)"?/i);
  return simpleMatch ? simpleMatch[1] : null;
}

export function getReportDownloadName(
  reportId: string,
  baseName: string | null | undefined,
  format: ReportDownloadFormat,
) {
  const fallback = `report-${reportId}.csv`;
  const sourceName = (baseName?.trim() || fallback).replace(/[\\/]/g, '-');

  if (format === 'csv') {
    return /\.csv$/i.test(sourceName) ? sourceName : `${sourceName}.csv`;
  }

  if (/\.xlsx$/i.test(sourceName)) {
    return sourceName;
  }

  if (/\.[^.]+$/i.test(sourceName)) {
    return sourceName.replace(/\.[^.]+$/i, '.xlsx');
  }

  return `${sourceName}.xlsx`;
}

export function parseCsvRows(csvText: string) {
  const normalized = csvText.replace(/\r\n?/g, '\n');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];

    if (inQuotes) {
      if (character === '"') {
        if (normalized[index + 1] === '"') {
          currentCell += '"';
          index += 1;
          continue;
        }

        inQuotes = false;
        continue;
      }

      currentCell += character;
      continue;
    }

    if (character === '"') {
      inQuotes = true;
      continue;
    }

    if (character === ',') {
      currentRow.push(currentCell);
      currentCell = '';
      continue;
    }

    if (character === '\n') {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      continue;
    }

    currentCell += character;
  }

  if (inQuotes) {
    throw new Error('Invalid CSV: unterminated quoted field');
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

export async function convertCsvToXlsxBuffer(csvText: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');
  const rows = parseCsvRows(csvText);

  if (rows.length > 0) {
    worksheet.addRows(rows);
    worksheet.getRow(1).font = { bold: true };
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  const contents = await workbook.xlsx.writeBuffer();
  return Buffer.from(contents);
}

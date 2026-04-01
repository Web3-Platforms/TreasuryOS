import assert from 'node:assert/strict';
import test from 'node:test';

import ExcelJS from 'exceljs';

import {
  convertCsvToXlsxBuffer,
  extractAttachmentFilename,
  getReportDownloadName,
  parseCsvRows,
  resolveReportDownloadFormat,
} from '../apps/dashboard/lib/report-downloads.js';

test('resolveReportDownloadFormat defaults to csv and rejects invalid values', () => {
  assert.equal(resolveReportDownloadFormat(undefined), 'csv');
  assert.equal(resolveReportDownloadFormat('xlsx'), 'xlsx');
  assert.equal(resolveReportDownloadFormat('CSV'), 'csv');
  assert.equal(resolveReportDownloadFormat('json'), null);
});

test('extractAttachmentFilename returns the upstream attachment filename', () => {
  assert.equal(
    extractAttachmentFilename('attachment; filename="mica-operations-2026-03.csv"'),
    'mica-operations-2026-03.csv',
  );
  assert.equal(
    extractAttachmentFilename("attachment; filename*=UTF-8''mica-operations-2026-03.csv"),
    'mica-operations-2026-03.csv',
  );
});

test('getReportDownloadName swaps csv for xlsx when requested', () => {
  assert.equal(
    getReportDownloadName('report_123', 'mica-operations-2026-03.csv', 'xlsx'),
    'mica-operations-2026-03.xlsx',
  );
  assert.equal(
    getReportDownloadName('report_123', null, 'csv'),
    'report-report_123.csv',
  );
});

test('parseCsvRows handles escaped quotes and commas', () => {
  assert.deepEqual(
    parseCsvRows('section,details\nsummary,"hello, ""world"""'),
    [
      ['section', 'details'],
      ['summary', 'hello, "world"'],
    ],
  );
});

test('convertCsvToXlsxBuffer creates a readable Excel workbook', async () => {
  const csv = 'section,metric,value\naudit,report_month,2026-03\n';
  const buffer = await convertCsvToXlsxBuffer(csv);

  assert.equal(buffer[0], 0x50);
  assert.equal(buffer[1], 0x4b);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet('Report');
  assert.ok(worksheet);
  assert.equal(worksheet.getCell('A1').text, 'section');
  assert.equal(worksheet.getCell('B1').text, 'metric');
  assert.equal(worksheet.getCell('C2').text, '2026-03');
});

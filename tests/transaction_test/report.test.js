const { test, expect } = require('@playwright/test');

test('Sales validation debug run', async ({ page }) => {

  test.setTimeout(90000); // prevent timeout

  console.log('🚀 TEST STARTED');

  // =========================================================
  // LOGIN
  // =========================================================
  await page.goto('https://devv2.clickbacon.com/login', {
    waitUntil: 'domcontentloaded'
  });

  await page.fill('input[type="email"]', 'Manasa.p+gowdaa@polynomial.ai');
  await page.fill('input[type="password"]', 'Manasa@1666');
  await page.click('button:has-text("Login")');

  await page.waitForURL('**/dashboard');
  console.log('✅ Login done');

  // =========================================================
  // TRANSACTION → SALES
  // =========================================================
  await page.click('text=Transaction');
  await page.click('text=Sales');

  // ✅ Wait for actual monetary data (NOT just rows)
  await page.waitForFunction(() => {
    const rows = document.querySelectorAll('tbody tr');
    return Array.from(rows).some(row =>
      /\$[\d,]+(\.\d+)?/.test(row.innerText)
    );
  });

  // =========================================================
  // FILTER → THIS MONTH
  // =========================================================
  await page.click('text=Filter by range');
  await page.click('text=This Month');

  // ✅ Wait again after filter (data reload)
  await page.waitForFunction(() => {
    const rows = document.querySelectorAll('tbody tr');
    return Array.from(rows).some(row =>
      /\$[\d,]+(\.\d+)?/.test(row.innerText)
    );
  });

  console.log('📊 Rows loaded:', await page.locator('tbody tr').count());

  // =========================================================
  // TRANSACTION TOTAL
  // =========================================================
  const transactionAmounts = await page.$$eval('tbody tr', (rows) => {
    return rows.map(row => {
      const text = row.innerText;

      const matches = text.match(/\$[\d,]+(\.\d+)?/g);
      if (!matches || matches.length === 0) return 0;

      const amount = matches[matches.length - 1];

      return parseFloat(amount.replace(/[$,]/g, '').trim()) || 0;
    });
  });

  const salesTransactionTotal =
    transactionAmounts.reduce((sum, val) => sum + val, 0);

  console.log('🟢 Transaction Sales Total:', salesTransactionTotal);

  // ✅ Safety check (fail early if bad data)
  expect(salesTransactionTotal).toBeGreaterThan(0);

  // =========================================================
  // REPORTS
  // =========================================================
  await page.click('text=Reports');
  await page.click('text=Restaurant Summary Report');

  // ✅ Wait for report UI
  await page.waitForSelector('text=Show All Accounts');

  const toggle = page.locator('text=Show All Accounts');
  await toggle.click();

  // ✅ Wait for "Total Sales" row to appear
  const row = page.locator('tr', {
    hasText: /total sales/i
  });

  await expect(row).toBeVisible({ timeout: 20000 });

  // =========================================================
  // REPORT TOTAL
  // =========================================================
  const reportSalesText = await row
    .locator('text=/\\$\\s?[\\d,]+\\.\\d{2}/')
    .first()
    .textContent();

  if (!reportSalesText) {
    throw new Error('Report Sales value not found');
  }

  const reportSalesTotal = parseFloat(
    reportSalesText.replace(/[$,\s]/g, '')
  );

  console.log('🔵 Reports Sales Total:', reportSalesTotal);

  // =========================================================
  // FINAL ASSERTION
  // =========================================================
  console.log('-----------------------------');
  console.log('Transaction:', salesTransactionTotal);
  console.log('Reports:', reportSalesTotal);
  console.log('-----------------------------');

  expect(reportSalesTotal).toBe(salesTransactionTotal);
});
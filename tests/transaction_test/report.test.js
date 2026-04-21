const { test, expect } = require('@playwright/test');

test('Sales validation debug run', async ({ page }) => {

  console.log('🚀 TEST STARTED');

  // =========================================================
  // LOGIN
  // =========================================================
  //await:  Means wait until this step is finished
  //domcontentloaded means: HTML structure is loaded - Page is NOT fully loaded - usefull for login page
  await page.goto('https://devv2.clickbacon.com/login', {
    waitUntil: 'domcontentloaded'
  });

  //await page.pause();

  await page.fill('input[type="email"]', 'manasa.p+9085@polynomial.ai');
  await page.fill('input[type="password"]', 'Manasa@1666');
  await page.click('button:has-text("Login")');

  await page.waitForURL('**/dashboard');
  console.log('✅ Login done');

  //await page.pause();

  // =========================================================
  // TRANSACTION → SALES
  // =========================================================
  await page.click('text=Transaction');
  await page.click('text=Sales');

  await page.waitForLoadState('networkidle');

 // await page.pause();

  // -------------------------
  // FILTER → THIS MONTH
  // -------------------------
  await page.click('text=Filter by range');
  await page.click('text=This Month');

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  //await page.pause();

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

  //await page.pause();

  // =========================================================
  // REPORTS
  // =========================================================
  await page.click('text=Reports');
  await page.click('text=Restaurant Summary Report');

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const toggle = page.locator('text=Show All Accounts');
  await toggle.waitFor({ state: 'visible', timeout: 15000 });
  await toggle.click();

  await page.waitForTimeout(3000);

  await page.mouse.wheel(1000, 0);
  await page.waitForTimeout(1000);

  // =========================================================
  // REPORT TOTAL
  // =========================================================
  const row = page.locator('tr', {
    hasText: /total sales/i
  });

  await row.waitFor({ state: 'visible', timeout: 15000 });

  await row.scrollIntoViewIfNeeded();

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
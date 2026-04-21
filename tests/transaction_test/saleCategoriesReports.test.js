const { test } = require('@playwright/test');

test.setTimeout(180000);

test('Extract categories from transaction via API', async ({ page }) => {

  console.log('🚀 Test Started');

  // =========================
  // 1. LOGIN (UI)
  // =========================
  await page.goto('https://devv2.clickbacon.com/login');

  await page.fill('input[type="email"]', 'manasa.p+9085@polynomial.ai');
  await page.fill('input[type="password"]', 'Manasa@1666');
  await page.click('button:has-text("Login")');

  await page.waitForURL('**/dashboard');
  console.log('✅ Login done');

  // =========================
  // 2. NAVIGATE (UI)
  // =========================
  await page.getByRole('button', { name: /Transactions/i }).first().click();
  await page.locator('text=Sales').first().click({ force: true });

  await page.waitForURL('**/sales');
  console.log('📂 On Sales page');

  // =========================
  // 3. FILTER (UI)
  // =========================
  await page.locator('text=Filter By Range').click();
  await page.getByText('This Month', { exact: true }).click();

  console.log('📅 Filter applied');

  // =========================
  // 4. WAIT FOR TABLE (UI)
  // =========================
  await page.waitForSelector('tbody tr', { timeout: 30000 });

  const rows = page.locator('tbody tr');
  const count = await rows.count();

  console.log('📊 Rows found:', count);

  if (count === 0) {
    throw new Error('❌ No transactions found');
  }

  // =====================================================
  // 5. API CAPTURE START (IMPORTANT - PLACE THIS BEFORE CLICK)
  // =====================================================
  const responsePromise = page.waitForResponse(resp =>
  resp.url().includes('/backend/sales') &&
  resp.url().includes('id=')&&
  resp.status() === 200
);
  // =========================
  // 6. OPEN TRANSACTION (UI ACTION TRIGGERS API)
  // =========================
  await rows.first().click();
  console.log('🔗 Transaction opened');

  // =====================================================
  // 7. GET API RESPONSE (THIS IS WHERE DATA COMES FROM)
  // =====================================================
  const response = await responsePromise;

  const data = await response.json();

  // 🔴 DEBUG (IMPORTANT ON FIRST RUN)
  console.log('📡 API RAW RESPONSE:', JSON.stringify(data, null, 2));

  // =====================================================
  // 8. EXTRACT DATA FROM API (CHANGE PATH IF NEEDED)
  // =====================================================

  // 👉 CASE 1 (most common)
  let categories = data.data?.salesCategories || [];

  // 👉 CASE 2 (IF YOUR API IS NESTED, UNCOMMENT THIS)
  // let categories = data.data?.categories || [];

  // 👉 CASE 3 (if inside transaction object)
  // let categories = data.transaction?.categories || [];

  // =========================
  // 9. PRINT RESULT
  // =========================
  console.log('\n════════════════════════════');
  console.log('CATEGORY        AMOUNT');
  console.log('════════════════════════════');

  let total = 0;

  for (const item of categories) {

  if (!item || item.amount === 0) continue;

  const name = item.name;
  const amount = item.amount;

  console.log(`${name.padEnd(20)} $${amount}`);
  total += amount;
}

  console.log('────────────────────────────');
  console.log(`TOTAL           $${total}`);
  console.log('════════════════════════════\n');

});
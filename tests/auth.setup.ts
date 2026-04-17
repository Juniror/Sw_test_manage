import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  console.log('Navigating to login...');
  await page.goto('http://147.50.253.67:3002/login');
  
  console.log('Filling credentials...');
  await page.getByPlaceholder('กรอกไอดีของคุณ').fill('admin_test');
  await page.getByPlaceholder('••••••••').fill('admin');
  
  console.log('Clicking login...');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  
  console.log('Waiting for Logout icon/title...');
  const logoutBtn = page.getByTitle('ออกจากระบบ');
  await logoutBtn.waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForLoadState('networkidle');
  
  console.log('Login successful, ensuring directory exists...');
  const dir = path.dirname(authFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log('Saving state to:', authFile);
  await page.context().storageState({ path: authFile });
});

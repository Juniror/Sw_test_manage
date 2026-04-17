import { Locator, Page } from '@playwright/test';
 
 /**
  * IncomeListPage Object Model.
  * Handles interactions on the income listing page.
  */
 export class IncomeListPage {
   private readonly page: Page;
   readonly recordIncomeButton: Locator;
 
   constructor(page: Page) {
     this.page = page;
     // Priority 1: getByRole with accessible name
     this.recordIncomeButton = page.getByRole('button', { name: 'บันทึกรายรับ', exact: true });
   }
 
   /**
    * Opens the form to record new income.
    */
   async openRecordForm() {
     await this.recordIncomeButton.waitFor({ state: 'visible' });
     await this.recordIncomeButton.click();
   }
 
   /**
    * Navigates to the Income section (secondary navigation fallback).
    */
   async navigateToIncome() {
     await this.page.getByRole('button', { name: 'รายรับ', exact: true }).click();
   }
 }

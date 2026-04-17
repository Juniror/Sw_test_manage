import { Locator, Page } from '@playwright/test';
 
 /**
  * ExpenseListPage Object Model.
  * Handles interactions on the expense/bill listing and approvals page.
  */
 export class ExpenseListPage {
   private readonly page: Page;
   readonly summaryButton: Locator;
   readonly pendingBillsButton: Locator;
   readonly approveButton: Locator;
   readonly rejectButton: Locator;
   readonly confirmApproveButton: Locator;
   readonly confirmRejectButton: Locator;
 
   constructor(page: Page) {
     this.page = page;
     // Priority 1: getByRole
     this.summaryButton = page.getByRole('button', { name: 'รวมจ่าย', exact: true });
     this.pendingBillsButton = page.getByRole('button', { name: 'บิลรออนุมัติ', exact: true });
 
     this.approveButton = page.getByRole('button', { name: 'อนุมัติบิล', exact: true });
     this.rejectButton = page.getByRole('button', { name: 'ปฏิเสธบิล', exact: true });
 
     this.confirmApproveButton = page.getByRole('button', { name: 'ใช่, อนุมัติเลย', exact: true });
     this.confirmRejectButton = page.getByRole('button', { name: 'ยืนยันการปฏิเสธ', exact: true });
   }
 
   /**
    * Navigates to the main Expenses section.
    */
   async navigateToExpenses() {
     await this.summaryButton.click();
   }
 
   /**
    * Navigates to the Pending Bills tab for approvals.
    */
   async navigateToPendingBills() {
     await this.navigateToExpenses();
     await this.pendingBillsButton.click();
   }
 
   /**
    * Directly navigates to the Bill History page.
    */
   async navigateToBillHistory() {
     await this.page.goto('/expenses/history');
   }
 
   /**
    * Approves the first available pending bill.
    */
   async approveFirstBill() {
     await this.approveButton.first().waitFor({ state: 'visible' });
     await this.approveButton.first().click();
     
     await this.confirmApproveButton.waitFor({ state: 'visible' });
     await this.confirmApproveButton.click();
   }
 
   /**
    * Rejects the first available pending bill.
    */
   async rejectFirstBill() {
     const firstReject = this.rejectButton.first();
     await firstReject.waitFor({ state: 'visible' });
     await firstReject.click();
     
     await this.confirmRejectButton.waitFor({ state: 'visible' });
     await this.confirmRejectButton.click();
   }
 
   /**
    * Filters bills by status label.
    */
   async filterByStatus(status: string) {
     const filter = this.page.getByRole('button', { name: status, exact: true });
     await filter.waitFor({ state: 'visible' });
     await filter.click();
   }
 
   /**
    * Returns the count of bills currently visible in the list.
    */
   async getBillCount(): Promise<number> {
     const rows = this.page.locator('tbody tr, [role="row"]');
     // Basic wait for content to appear if any
     await rows.first().waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
     return await rows.count();
   }
 }

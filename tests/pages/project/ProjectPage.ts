import { Locator, Page } from '@playwright/test';
 
 export interface ProjectProgressData {
   structure?: string;
   electrical?: string;
   plumbing?: string;
 }
 
 /**
  * ProjectPage Object Model.
  * Handles interactions on the Project/Site management page.
  */
 export class ProjectPage {
   public readonly page: Page;
   readonly structureInput: Locator;
   readonly electricalInput: Locator;
   readonly plumbingInput: Locator;
   readonly updateProgressButton: Locator;
   readonly saveButton: Locator;
 
   constructor(page: Page) {
     this.page = page;
     // Priority 1: getByRole
     this.updateProgressButton = page.getByRole('button', { name: 'อัปเดทความคืบหน้าไซต์งาน', exact: true });
     // Priority 3: getByLabel/Placeholder (using name attribute as fallback)
     this.structureInput = page.locator('input[name="structure"]');
     this.electricalInput = page.locator('input[name="electrical"]');
     this.plumbingInput = page.locator('input[name="plumbing"]');
     this.saveButton = page.getByRole('button', { name: 'บันทึก', exact: true });
   }
 
   /**
    * Clicks on a project by its name (accessible via image alt/name).
    */
   async clickProjectByName(projectName: string) {
     await this.page.getByRole('img', { name: projectName }).click();
   }
 
   /**
    * Switches to the Employees tab within a project.
    */
   async clickEmployeeTab() {
     await this.page.getByRole('button', { name: /พนักงาน/, exact: false }).click();
   }
 
   /**
    * Switches to the Expenses/Bills tab within a project.
    */
   async clickExpenseTab() {
     await this.page.getByRole('button', { name: /ดูค่าใช้จ่าย/, exact: false }).click();
   }
 
   /**
    * Opens the form to update site progress.
    */
   async openUpdateProgressForm() {
     await this.updateProgressButton.waitFor({ state: 'visible' });
     await this.updateProgressButton.click();
   }
 
   /**
    * Fills the progress update form with provided data.
    */
   async fillProgress(data: Partial<ProjectProgressData>) {
     if (data.structure) await this.structureInput.fill(data.structure);
     if (data.electrical) await this.electricalInput.fill(data.electrical);
     if (data.plumbing) await this.plumbingInput.fill(data.plumbing);
   }
 
   /**
    * Submits the progress update form.
    */
   async submitProgress() {
     await this.saveButton.click();
     await this.saveButton.waitFor({ state: 'hidden' });
   }
 }

const { visible } = require("ansi-colors");
const { timeout } = require("async");
const { name } = require("commander");
const { exact } = require("prop-types");

class PmaTenderSubmission{
    constructor(page){
        this.page = page;
        this.tenderTab = page.locator('a[href="/tenders"]');

        this.tenderRow = (tenderId) => page.locator('tr, div[role="row"]').filter({ hasText: tenderId });
        this.actionBtnById = (tenderId) => this.tenderRow(tenderId).locator('i.ri-eye-line').first();

        //this.actionBtn = page.locator('i[class="ri-eye-line"]').first();
        this.prioritiesText = page.locator('p:has-text("Priorities")');
        this.submitReplyToRMCBtn = page.getByRole('Button',{name:'Submit Reply To RMC'});

        this.respondToThisTenderTitle = page.locator('p:has-text("Respond to this tender")');
        this.yourResponseToRMCTitle = page.locator('p:has-text("Your Response To The RMC")');
        this.yourResponseTextInput = page.getByPlaceholder('Type Here');
        this.nextBtn = page.getByRole('Button',{name:'Next'});

        this.yourQuoteTitle = page.getByText('Your Quote',{exact:true});
        this.managementFeeInput = page.locator('input[name="managementFee"]');
        this.accountingFeeInput = page.locator('input[name="accountingFee"]');
        this.coSecFeeInput = page.locator('input[name="coSecFee"]');
        this.outOfHouseFeeInput = page.locator('input[name="outOfHouseFee"]');
        this.emergencyLightingTasksInput = page.locator('input[name="emergencyLightingTasks"]');
        this.fireDoorInspectionsInput = page.locator('input[name="fireDoorInspections"]');
        this.amlMoneyLaunderingChecksInput = page.locator('input[name="amlMoneyLaunderingChecks"]');
        this.confirmManagementFeesBtn = page.getByRole('Button',{name:'Confirm Management Fees'});

        this.submitResponseBtn = page.getByRole('Button',{name:'Submit Response'});


    }

    //Helpers

    async waitForLoader() {
    const loader = this.page.locator('div.bg-opacity-50, img[alt="Loading..."], .MuiBackdrop-root').first();
    await loader.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await this.page.waitForTimeout(1000);
   }


    async smartFill(locator, value) {
    if (!value) return;
        await this.waitForLoader();
        await locator.waitFor({ state: 'visible', timeout: 15000 });
        await locator.click({ force: true });
        await locator.fill(String(value));
        await locator.press('Tab');
    if ((await locator.inputValue()) === "") {
        const delay = String(value).length > 60 ? 0 : 20;
        await locator.pressSequentially(String(value), { delay });
        await locator.press('Tab');
    }
  }

  //Apply for Live Tenders

    async applyForTender(userData,tenderId){
        await this.tenderTab.click();
        await this.page.waitForURL('**/tenders', { timeout: 8000 });

        const specificActionBtn = this.actionBtnById(tenderId);
        await specificActionBtn.scrollIntoViewIfNeeded();
        if(specificActionBtn.isVisible()){
           await specificActionBtn.click();
        }
        else {
            throw new Error (`Tender ID ${tenderId} not found in live tenders list`)
        }
        
        await this.prioritiesText.waitFor({state:'visible',timeout:10000});

        await this.submitReplyToRMCBtn.scrollIntoViewIfNeeded();
        await this.submitReplyToRMCBtn.click();
        await this.respondToThisTenderTitle.waitFor({state:'visible',timeout:10000});

        await this.yourResponseToRMCTitle.scrollIntoViewIfNeeded();
        await this.smartFill(this.yourResponseTextInput, userData.textResponse);
        await this.nextBtn.click();

        await this.yourQuoteTitle.scrollIntoViewIfNeeded();
        await this.yourQuoteTitle.waitFor({state:'visible',timeout:10000});
        await this.smartFill(this.managementFeeInput,userData.managementFee);
        await this.smartFill(this.accountingFeeInput,userData.accountingFee);
        await this.smartFill(this.coSecFeeInput,userData.coSecFee);
        await this.smartFill(this.outOfHouseFeeInput,userData.outOfHoursFee);
        await this.smartFill(this.emergencyLightingTasksInput,userData.emergencyLightingTestsFee);
        await this.smartFill(this.fireDoorInspectionsInput,userData.fireDoorInspectionsFee);
        await this.smartFill(this.amlMoneyLaunderingChecksInput,userData.amlMoneyLaunderingChecksFee);
        await this.confirmManagementFeesBtn.click();

        await this.submitResponseBtn.scrollIntoViewIfNeeded();
        await this.submitResponseBtn.click();

        await this.page.waitForURL('**/tenders',{timeout:10000});

        console.log(`Response submitted successfully for ${tenderId}`);

        
    }




}

module.exports = PmaTenderSubmission;
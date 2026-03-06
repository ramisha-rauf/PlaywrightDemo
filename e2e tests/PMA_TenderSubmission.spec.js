const {test,expect} = require('@playwright/test');

const LoginPage = require('../pages/loginPage');

const PmaTenderSubmission = require('../pages/PMA_TenderSubmissionPage');

test('Apply for Tenders',async({page})=>{
    const loginPage = new LoginPage(page);
    const tenderSubmission = new PmaTenderSubmission(page);

    await loginPage.PMAloginToApplication('ramisha_rauf+231@strategisthub.com','Henry@12');
    await page.waitForLoadState('networkidle');

    const tenderId = "TND-10141";

    await tenderSubmission.applyForTender({
        textResponse: 'Transparency is the cornerstone of our management philosophy. We provide the RMC Directors with real-time access to financial reporting, maintenance logs, and compliance certificates via our dedicated portal. This ensures you are never in the dark regarding the building status.',
        managementFee : '100',
        accountingFee: '20',
        coSecFee: '50',
        outOfHoursFee: '40',
        emergencyLightingTestsFee: '60',
        fireDoorInspectionsFee: '75',
        amlMoneyLaunderingChecksFee: '35',
        tenderId

    });



    

})
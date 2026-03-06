const {test,expect} = require('@playwright/test');

const LoginPage = require('../pages/loginPage');

const RmcTenderReplies = require('../pages/RMC_TenderRepliesPage');

test('Shortlist PMAs for Your Tender',async({page})=>{
    const loginPage = new LoginPage(page);
    const tenderReplies = new RmcTenderReplies(page);

    await loginPage.RMCloginToApplication('ramisha_rauf+256@strategisthub.com','Henry@12');
    await page.waitForLoadState('networkidle');

    await tenderReplies.shortlistPMAs();
    

})
const {test,expect} = require('@playwright/test');
const LoginPage = require('../pages/loginPage');
const DirectorVerificationPage = require('../pages/RMC_DirectorVerificationPage');

test('Verify director identity with resume logic', async ({ page,context }) => {
    await context.clearCookies();
    const directorVerificationPage = new DirectorVerificationPage(page);
    const loginPage = new LoginPage(page);

    const userData = {
        companyName: '16570215',
        directorName: 'AHMED IBRAHIM, Abdul Azim'
    };

    // Login
    await loginPage.RMCloginToApplication('ramisha_rauf+264@strategisthub.com', 'Henry@12');
    
    await page.waitForLoadState('networkidle');

    const verifyBtn = page.getByRole('button', { name: 'Verify Now' });
    const continueBtn = page.getByRole('button', { name: 'Continue Verification' });

    // SMART DETECTION: Wait for ANY button to be visible before acting
    console.log("Checking for verification status on dashboard...");
    await Promise.race([
        verifyBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
        continueBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
    ]);

    if (await continueBtn.isVisible()) {
        console.log("Status: Found 'Continue Verification'. Resuming...");
        await continueBtn.click();
    } else if (await verifyBtn.isVisible()) {
        console.log("Status: Found 'Verify Now'. Starting fresh...");
        await verifyBtn.click();
    } else {
        await page.screenshot({ path: 'button-not-found.png' });
        // console.log('Verification Complete')
        // return;
       throw new Error("Neither 'Verify Now' nor 'Continue Verification' buttons were found on the dashboard.");
    }

    await page.waitForURL(url => !url.href.includes('dashboard'), { timeout: 10000 });

    await page.waitForURL(url => !url.href.includes('dashboard'));

    const companyInput = page.locator('input[name="companies"]');
    const directorDropdown = page.getByLabel('Choose Director');

    console.log("Detecting current step...");
    await Promise.any([
        companyInput.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
        directorDropdown.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {})
    ]);

    if (await directorDropdown.isVisible()) {
        console.log("Confirmed: Landed on Director Step. Resuming...");
        await directorVerificationPage.resumeFromDirector(userData);
    } 
    else if (await companyInput.isVisible()) {
        console.log("Confirmed: Landed on Initial Search. Starting fresh...");
        await directorVerificationPage.startFreshVerification(userData);
    } 
    else {
        // Fallback: Take a screenshot if we land somewhere unexpected
        await page.screenshot({ path: 'unknown-state.png' });
        throw new Error("Failed to detect page state. Check 'unknown-state.png'");
    }
});
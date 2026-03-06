const { expect } = require('@playwright/test');
const { delay } = require('bluebird');

class DirectorVerificationPage {
    constructor(page) {
        this.page = page;
        this.companyNameInput = page.locator('input[name="companies"]');
        this.selectCompanyDropdown = page.getByLabel('Select Company');
        this.chooseDirectorDropdown = page.getByRole('combobox', { name: /Choose Director/i });
        this.nextButton = page.getByRole('button', { name: 'Next' });
        this.goToDashboardButton = page.getByRole('button', { name: 'Go To Dashboard' });
        this.matchConfirmed = page.locator('p').filter({ hasText: /^MATCH CONFIRMED$/ }).first();
        this.welcomeBack = page.locator('h2').filter({ hasText: /^Welcome Back$/ }).first();
    }

    async waitForLoader() {
        const loader = this.page.locator('div.bg-opacity-50, .MuiBackdrop-root').first();
        await loader.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    }

    async smartFill(locator, value) {
        if (!value) return;
        await this.waitForLoader();
        await locator.waitFor({ state: 'visible' });
        await locator.fill(String(value), {delay: 10});
        await locator.press('Tab');
    }

    async clickAndNavigate(clickAction, targetLocator) {
        await this.waitForLoader();
        await clickAction();
        await targetLocator.waitFor({ state: 'visible', timeout: 15000 });
    }

    /**
     * FULL FLOW: Start from the very beginning
     */
    async startFreshVerification(userData) {
        await this.smartFill(this.companyNameInput, userData.companyName);
        
        // Wait for search results
        const firstOption = this.page.getByRole('option').first();
        await this.selectCompanyDropdown.click();
        await firstOption.waitFor({ state: 'visible' });
        await firstOption.click();

        await this.clickAndNavigate(() => this.nextButton.click(), this.chooseDirectorDropdown);
        await this.resumeFromDirector(userData);
    }

    /**
     * RESUME: If already at the Director selection step
     */
    async resumeFromDirector(userData) {
        await this.waitForLoader();
        
        const dropdown = this.chooseDirectorDropdown.first();
        await dropdown.waitFor({ state: 'visible' });
        
        // 1. Click to open
        await dropdown.click({ force: true });

        // 2. Wait for ANY option to appear (ensures the list has loaded)
        const anyOption = this.page.getByRole('option');
        try {
            await anyOption.first().waitFor({ state: 'visible', timeout: 5000 });
        } catch (e) {
            console.log("List didn't appear, trying to click again...");
            await dropdown.click({ force: true });
        }

        // 3. SMART LOCATOR: Use a Regex to find the name regardless of "Last, First" or "First Last"
        // This looks for both parts of the name anywhere in the text
        const nameRegex = new RegExp(userData.directorName.split(' ').join('|'), 'i');
        const directorOption = this.page.getByRole('option').filter({ hasText: nameRegex }).first();

        console.log(`Looking for director matching: ${userData.directorName}`);
        
        // 4. Wait and Click
        await directorOption.waitFor({ state: 'visible', timeout: 10000 });
        await directorOption.click({ force: true });

        // 5. Submit
        await this.nextButton.click({ force: true });
        await this.finalize();
    }

    async finalize() {
        // 1. Click the final button
        await this.goToDashboardButton.waitFor({ state: 'visible' });
        await this.goToDashboardButton.click({ force: true });

        // 2. Wait for the Dashboard to load fully
        await this.page.waitForURL(/.*dashboard/, { timeout: 15000 });
        //await this.welcomeBack.waitFor({ state: 'visible' });

        // 3. ASSERTION: Ensure no verification buttons exist anymore
        // We use 'hidden' state to ensure the UI has updated
        const verifyBtn = this.page.getByRole('button', { name: /Verify Now/i });
        const continueBtn = this.page.getByRole('button', { name: /Continue Verification/i });

        await expect(verifyBtn).toBeHidden({ timeout: 10000 });
        await expect(continueBtn).toBeHidden({ timeout: 10000 });

        console.log("Success: Director Verification Done.");
        return;
    }
}

module.exports = DirectorVerificationPage;
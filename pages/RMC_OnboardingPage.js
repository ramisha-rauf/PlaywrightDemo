class RmcSignupPage {
  constructor(page) {
    this.page = page;

    // STEP - 0: Onboarding & Account
    this.directorCard = page.locator("//img[contains(@alt,'Director')]");
    this.firstNameInput = page.getByLabel('First Name');
    this.lastNameInput = page.getByLabel('Last Name');
    this.emailInput = page.getByLabel('Email');
    this.phoneInput = page.getByLabel('Phone Number');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.verificationMethodCard = page.locator('div').filter({ hasText: /^Email$/ }).first();
    this.otpInputs = [0, 1, 2, 3, 4, 5].map(i => page.locator(`#code-${i}`));

    // STEP - 1: Postcode & Block Details
    this.postcodeInput = page.locator('input[name="postcode"]');
    this.findAddressButton = page.getByRole('button', { name: 'Find Address' });
    this.selectAddressDropdown = page.getByLabel('Select Address');
    this.continueWithSelectedAddressButton = page.getByRole('button', { name: 'Continue with Selected Address' });
    this.blockNameInput = page.getByLabel('Block Name');
    this.noOfUnitsInput = page.getByLabel('No of Units');
    this.currentManagingAgentInput = page.getByLabel('Current Managing Agent');
    this.numberOfBlocksDropdown = page.getByLabel('Number of Blocks');
    this.yearBuiltDropdown = page.getByLabel('Year Built');

    // STEP - 2: Budget
    this.managementFeeInput = page.getByLabel('Management Fee');
    this.cosecFeeInput = page.getByLabel('CoSec Fee');
    this.accountingFeeInput = page.getByLabel('Accounting Fee');
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });

    // STEP - 3: Property Characteristics
    this.leasehold1 = page.locator("//img[contains(@alt,'Converted House')]");
    this.leasehold2 = page.locator("//img[contains(@alt,'Purpose Built Flat')]");
    this.leasehold3 = page.locator("//img[contains(@alt,'Mixed Development')]");

    this.buildingHeight1 = page.locator("//img[contains(@alt,'Below 11m')]");
    this.buildingHeight2 = page.locator("//img[contains(@alt,'11m - 18m')]");
    this.buildingHeight3 = page.locator("//img[contains(@alt,'Above 18m')]");
    this.buildingHeight4 = page.locator("//img[contains(@alt,'Don't Know')]");

    this.blockCondition1 = page.locator("//img[contains(@alt,'Excellent')]");
    this.blockCondition2 = page.locator("//img[contains(@alt,'Good')]");
    this.blockCondition3 = page.locator("//img[contains(@alt,'Fair')]");
    this.blockCondition4 = page.locator("//img[contains(@alt,'Poor')]");

    this.outdoorSpace1 = page.locator("//img[contains(@alt,'Large Shared Space')]");
    this.outdoorSpace2 = page.locator("//img[contains(@alt,'Some')]");
    this.outdoorSpace3 = page.locator("//img[contains(@alt,'None')]");

    // STEP - 5: Priorities & Open Ended
    this.openEndedTitle = page.locator('h6:has-text("Help Managing Agents Understand Your Needs")');
    this.textInputs1 = page.locator('textarea[name="1"]');
    this.textInputs2 = page.locator('textarea[name="2"]');
    this.textInputs3 = page.locator('textarea[name="3"]');
    this.goToDashboardButton = page.getByRole('button', { name: 'Go to Dashboard' });
    this.okButton = page.getByRole('button', { name: 'Ok' });
  }

  // --- Helpers ---

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

  async clickAndNavigate(clickAction, targetLocator) {
    await this.waitForLoader();
    await clickAction();
    try {
      await targetLocator.waitFor({ state: 'visible', timeout: 15000 });
    } catch (e) {
      const error = this.page.locator('.Mui-error, [role="alert"]').first();
      if (await error.isVisible()) {
        throw new Error(`Navigation blocked by UI error: ${await error.innerText()}`);
      }
      await clickAction();
      await targetLocator.waitFor({ state: 'visible', timeout: 10000 });
    }
  }

  // --- Navigation & Actions ---

  async goto() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => localStorage.clear());
    await this.page.evaluate(() => sessionStorage.clear());
    await this.page.goto('https://rmc.strategisthubpro.com/login');
    const signupLink = this.page.getByText(/Sign up here/i).first();
    await signupLink.waitFor({ state: 'visible' });
    await signupLink.click();
    await this.page.waitForURL('**/onboarding', { timeout: 15000 });
  }

  async fillResidentDetails(userData) {
    await this.directorCard.click();
    await this.page.waitForURL('**/director', { timeout: 10000 });
    await this.smartFill(this.firstNameInput, userData.firstName);
    await this.smartFill(this.lastNameInput, userData.lastName);
    await this.smartFill(this.emailInput, userData.email);
    await this.smartFill(this.phoneInput, userData.phone);
    await this.smartFill(this.passwordInput, userData.password);
    await this.smartFill(this.confirmPasswordInput, userData.confirmPassword);
    await this.clickAndNavigate(() => this.nextButton.click({ force: true }), this.verificationMethodCard);
    await this.page.waitForTimeout(2000);
    await this.verificationMethodCard.click({ force: true });
    await this.page.waitForURL('**/otp'), { timeout: 10000 };
  }

  async verifyEmail(userData) {
    await this.otpInputs[0].waitFor({ state: 'visible' });
    for (let i = 0; i < 6; i++) {
      await this.smartFill(this.otpInputs[i], userData.otp[i]);
    }
    await this.postcodeInput.waitFor({ state: 'visible', timeout: 15000 });
  }

  async fillPostcode(userData) {
    await this.waitForLoader();
    await this.smartFill(this.postcodeInput, userData.postcode);
    await this.clickAndNavigate(() => this.findAddressButton.click({ force: true }), this.selectAddressDropdown);
    await this.page.waitForURL('**/address', { timeout: 10000 });
    await this.selectAddressDropdown.click({ force: true });
    const allOptions = this.page.getByRole('option');
    await allOptions.nth(3).waitFor({ state: 'visible', timeout: 15000 });
    const count = await allOptions.count();
    await allOptions.nth(count > 3 ? 5 : 0).click({ force: true });
    await this.clickAndNavigate(() => this.continueWithSelectedAddressButton.click({ force: true }), this.blockNameInput);
  }

  async fillBlockDetails(userData) {
    await this.waitForLoader();
    await this.smartFill(this.blockNameInput, userData.blockName);
    await this.smartFill(this.noOfUnitsInput, userData.noOfUnits);
    await this.smartFill(this.currentManagingAgentInput, userData.currentManagingAgent);

    // 1. Select Number of Blocks
    await this.numberOfBlocksDropdown.click({ force: true });
    // Use a locator that specifically waits for the listbox to pop up
    await this.page.getByRole('listbox').waitFor({ state: 'visible', timeout: 5000 }).catch(async () => {
        // Retry click if it didn't open the first time
        await this.numberOfBlocksDropdown.click({ force: true });
    });
    await this.page.getByRole('listbox').getByRole('option').nth(1).click(); 

    // 2. Select Year Built
    await this.yearBuiltDropdown.click({ force: true });
    const yearListbox = this.page.getByRole('listbox');
    
    // RE-TRY LOGIC: If the listbox doesn't show up in 5s, click again
    try {
        await yearListbox.waitFor({ state: 'visible', timeout: 5000 });
    } catch (e) {
        console.log("Year listbox didn't appear, retrying click...");
        await this.yearBuiltDropdown.click({ force: true });
        await yearListbox.waitFor({ state: 'visible', timeout: 5000 });
    }
    
    // Select the 3rd option
    await yearListbox.getByRole('option').nth(2).click();

    await this.clickAndNavigate(() => this.nextButton.click({ force: true }), this.managementFeeInput);
  }

  async fillBudgetDetails(userData) {
    await this.waitForLoader();
    await this.smartFill(this.managementFeeInput, userData.managementFee);
    await this.smartFill(this.cosecFeeInput, userData.cosecFee);
    await this.smartFill(this.accountingFeeInput, userData.accountingFee);
    await this.confirmButton.click({ force: true });
    await this.page.locator('text=/Thank You/i').waitFor({ state: 'visible', timeout: 15000 });
    await this.clickAndNavigate(() => this.confirmButton.click({ force: true }), this.leasehold1);
  }

  async selectPropertyDetails(userData) {
    await this.waitForLoader();
    const leaseholdCard = userData.leaseholdPreference === 'Converted House' ? this.leasehold1 :
      userData.leaseholdPreference === 'Purpose Built Flat' ? this.leasehold2 : this.leasehold3;
    await this.clickAndNavigate(() => leaseholdCard.click({ force: true }), this.buildingHeight1);

    const heightCard = userData.buildingHeightPreference === 'Below 11m' ? this.buildingHeight1 :
      userData.buildingHeightPreference === '11m - 18m' ? this.buildingHeight2 :
      userData.buildingHeightPreference === 'Above 18m' ? this.buildingHeight3 : this.buildingHeight4;
    await this.clickAndNavigate(() => heightCard.click({ force: true }), this.blockCondition1);

    const conditionCard = userData.blockConditionPreference === 'Excellent' ? this.blockCondition1 :
      userData.blockConditionPreference === 'Good' ? this.blockCondition2 :
      userData.blockConditionPreference === 'Fair' ? this.blockCondition3 : this.blockCondition4;
    await this.clickAndNavigate(() => conditionCard.click({ force: true }), this.outdoorSpace1);

    const spaceCard = userData.outdoorSpacePreference === 'Large Shared Space' ? this.outdoorSpace1 :
      userData.outdoorSpacePreference === 'Some' ? this.outdoorSpace2 : this.outdoorSpace3;
    await this.clickAndNavigate(() => spaceCard.click({ force: true }), this.page.locator('text=/Drag and drop/i').first());
  }

  async dragAllPrioritiesAndNext(sources, targets) {
    // for (let i = 0; i < sources.length; i++) {
    //   const src = this.page.locator(sources[i]).first();
    //   const dst = this.page.locator(targets[i]).first();
    //   await src.waitFor({ state: 'visible' });
    //   await src.dragTo(dst);
    //   await this.page.waitForTimeout(300);
    // }
    console.log("STOP: Please arrange priorities manually in the browser window.");
    
    // This opens the Playwright Inspector and pauses execution
    await this.page.pause(); 

    // Once you click 'Resume' in the Inspector, the script continues
    await this.nextButton.click();
    await this.openEndedTitle.waitFor({ state: 'visible', timeout: 15000 });
  }

  async fillOpenEndedQuestions(userData) {
    const inputs = [this.textInputs1, this.textInputs2, this.textInputs3];
    for (let i = 0; i < 3; i++) {
      await inputs[i].scrollIntoViewIfNeeded();
      await inputs[i].fill(userData.openEndedResponses[i]);
    }
    await this.goToDashboardButton.click();
    try {
      await this.okButton.waitFor({ state: 'visible', timeout: 8000 });
      await this.okButton.click();
    } catch (e) {
      console.log("Final OK button not found, checking for dashboard...");
    }
    await this.page.waitForURL('**/dashboard', { timeout: 15000 });
  }
}

module.exports = RmcSignupPage;
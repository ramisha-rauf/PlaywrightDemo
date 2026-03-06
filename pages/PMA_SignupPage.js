// const { timeout } = require("async");
// const { timeout } = require("async");
// const { time } = require("node:console");

class PmaSignup {
    constructor(page) {
        this.page = page;

        // STEP-1: Registration
        this.companyNameInput = page.locator('input[name="companyName"]');
        this.companyWebsiteInput = page.locator('input[name="website"]');
        this.companyLandlineInput = page.locator('input[name="landline"]');
        this.fullNameInput = page.locator('input[name="fullName"]');
        this.mobileNumberInput = page.locator('input[name="mobileNumber"]');
        this.emailInput = page.locator('input[name="email"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
        this.nextButton = page.getByRole('button', { name: 'Next' }).filter({ visible: true });

        // STEP-2: OTP & Postcode
        // Hardened locator: targets the specific container for "Email"
        this.verificationMethodCard = page.locator('div').filter({ hasText: /^Email$/ }).first();
        this.otpInputs = [0, 1, 2, 3, 4, 5].map(i => page.locator(`#code-${i}`));
        this.postcodeInput = page.locator('input[name="postcode"]');
        this.findAddressButton = page.getByRole('button', { name: 'Find Address' });
        this.selectAddressDropdown = page.getByLabel('Select Address');
        this.continueWithSelectedAddressButton = page.getByRole('button', { name: 'Continue with Selected Address' });

        // ... rest of your locators are fine ...
        this.yearsTrading = page.locator('input[name="tradingYears"]');
        this.totalUnits = page.locator('input[name="unitsManaged"]');
        this.unitsPerAccountManager = page.locator('input[name="unitsAccountManager"]');
        this.contactPreferenceDropdown = page.getByLabel('Mobile/Landline');
        this.secondaryFullNameInput = page.locator('input[name="secondaryFullName"]');
        this.secondaryEmailInput = page.locator('input[name="secondaryEmail"]');
        this.secondaryPhoneInput = page.locator('input[name="secondaryPhone"]');
        this.secondaryLandlineInput = page.locator('input[name="secondaryMobile"]');
        this.manualCard = page.locator("//img[@alt='Manually']").filter({ visible: true });
        this.averageRatingInput = page.locator('input[name="averageRating"]');
        this.numberOfReviewsInput = page.locator('input[name="numberOfReviews"]');
        this.emailNotificationCard1 = page.getByText('Primary User', {exact: true});
        this.emailNotificationCard2 = page.getByText('Secondary User', { exact: true });
        this.emailNotificationCard3 = page.getByText('Both',{exact: true});
        this.minimumManagementFeeInput = page.getByRole('spinbutton', { name: /Minimum Fee/i });
        this.maximumManagementFeeInput = page.getByRole('spinbutton', { name: /Maximum Fee/i });
        this.companyLogo = page.locator('#file-upload');
        this.companyBioInput = page.locator('textarea[name="companyBio"]');
        this.skipButton = page.getByRole('button', { name: 'Skip' }).filter({ visible: true }).first();
        this.okButton = page.getByRole('button', { name: 'Ok' }).filter({ visible: true });
    }

    async waitForLoader() {
        const loader = this.page.locator('div.bg-opacity-50, img[alt="Loading..."], .MuiBackdrop-root').first();
        await loader.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        // Use 1s instead of 3s to keep the test fast but stable
        await this.page.waitForTimeout(1000);
    }

    async smartFill(locator, value) {
        if (!value) return;
        await this.waitForLoader();
        await locator.waitFor({ state: 'visible', timeout: 15000 });
        await locator.click({ force: true });
        await locator.fill(String(value));
        await locator.press('Tab');
        
        if (await locator.inputValue() === "") {
            const delay = String(value).length > 60 ? 0 : 20;
            await locator.pressSequentially(String(value), { delay });
            await locator.press('Tab');
        }
    }

    async clickAndNavigate(clickAction, targetLocator) {
        await this.waitForLoader();
        await clickAction();
        // If the target doesn't show up, check for validation errors
        try {
            await targetLocator.waitFor({ state: 'visible', timeout: 15000 });
        } catch (e) {
            const error = this.page.locator('.Mui-error, [role="alert"]').first();
            if (await error.isVisible()) {
                throw new Error(`Navigation blocked by UI error: ${await error.innerText()}`);
            }
            // Retry the click once
            await clickAction();
            await targetLocator.waitFor({ state: 'visible', timeout: 10000 });
        }
    }

    async goto() {
        // Clear session to prevent being redirected to the dashboard
        await this.page.context().clearCookies();
        await this.page.evaluate(() => localStorage.clear());
        await this.page.evaluate(() => sessionStorage.clear());

        await this.page.goto('https://pma.strategisthubpro.com/login');
        
        const signupLink = this.page.getByText(/Sign up here/i).first();
        await signupLink.waitFor({ state: 'visible' });
        await signupLink.click();

        // Use a more flexible wait
        await this.page.waitForURL(url => url.href.includes('company'), { timeout: 15000 });
    }

    async fillCompanyDetails(userData) {
        await this.smartFill(this.companyNameInput, userData.companyName);
        await this.smartFill(this.companyWebsiteInput, userData.companyWebsite);
        await this.smartFill(this.companyLandlineInput, userData.companyLandline);
        await this.smartFill(this.fullNameInput, userData.fullName);
        await this.smartFill(this.mobileNumberInput, userData.mobileNumber);
        await this.smartFill(this.emailInput, userData.email);
        await this.smartFill(this.passwordInput, userData.password);
        await this.smartFill(this.confirmPasswordInput, userData.confirmPassword);

        // STABILITY FIX: Wait for navigation to OTP method selection
        await this.clickAndNavigate(() => this.nextButton.click({ force: true }), this.verificationMethodCard);
        
        // Give the card a moment to be clickable
        await this.page.waitForTimeout(5000);
        await this.verificationMethodCard.click({ force: true });
    }

    async verifyEmail(userData) {
        // Ensure first OTP box is ready
        await this.otpInputs[0].waitFor({ state: 'visible' });
        for (let i = 0; i < 6; i++) {
            await this.smartFill(this.otpInputs[i], userData.otp[i]);
        }
        await this.postcodeInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    async fillPostcode(userData) {
        await this.smartFill(this.postcodeInput, userData.postcode);
        await this.clickAndNavigate(() => this.findAddressButton.click({ force: true }), this.selectAddressDropdown);
        
        // Hardened Dropdown logic
        await this.selectAddressDropdown.click({ force: true });
        const allOptions = this.page.getByRole('option');
        
        try {
            await allOptions.first().waitFor({ state: 'visible', timeout: 15000 });
        } catch (e) {
            // Re-click if it didn't open
            await this.selectAddressDropdown.click({ force: true });
            await allOptions.first().waitFor({ state: 'visible', timeout: 10000 });
        }

        const count = await allOptions.count();
        const index = count > 3 ? 5 : 0;
        await allOptions.nth(index).click({ force: true });

        await this.clickAndNavigate(() => this.continueWithSelectedAddressButton.click({ force: true }), this.yearsTrading);
    }

        async fillBusinessProfile(userData) {
        await this.smartFill(this.yearsTrading, userData.yearsTrading);
        await this.smartFill(this.totalUnits, userData.totalUnits);
        await this.smartFill(this.unitsPerAccountManager, userData.unitsPerAccountManager);
        await this.contactPreferenceDropdown.click({ force: true });
        await this.page.getByRole('option').nth(1).click();
        await this.smartFill(this.secondaryFullNameInput, userData.secondaryFullName);
        await this.smartFill(this.secondaryEmailInput, userData.secondaryEmail);
        await this.smartFill(this.secondaryPhoneInput, userData.secondaryPhone);
        await this.smartFill(this.secondaryLandlineInput, userData.secondaryLandline);

        await this.clickAndNavigate(() => this.nextButton.click({ force: true }), this.manualCard);

     }

    async fillGoogleReviews(userData) {
        await this.waitForLoader();
        await this.manualCard.click({ force: true });
        await this.page.waitForURL('**/reviews-form', { timeout: 15000});
        await this.smartFill(this.averageRatingInput, userData.averageRating);
        await this.smartFill(this.numberOfReviewsInput, userData.numberOfReviews);

        await this.clickAndNavigate(() => this.nextButton.click({ force: true }), this.manualCard);
    }

    async fillTrustpilotReviews(userData) {
        await this.waitForLoader();
        await this.manualCard.click({ force: true });
        await this.page.waitForURL('**/trustpilot-form', { timeout: 15000});
        await this.smartFill(this.averageRatingInput, userData.averageRating);
        await this.smartFill(this.numberOfReviewsInput, userData.numberOfReviews);

        await this.clickAndNavigate(() => this.nextButton.click({ force: true }), this.emailNotificationCard2);
    }
    async fillEmailNotificationPreference(userData) {
        await this.waitForLoader();
        const pref = userData.emailNotificationPreference;
        const card = pref === 'Primary User' ? this.emailNotificationCard1 : 
                     pref === 'Secondary User' ? this.emailNotificationCard2 : this.emailNotificationCard3;

        await this.clickAndNavigate(() => card.click({ force: true }), this.minimumManagementFeeInput);
    }

    async fillManagementFee(userData) {
        await this.smartFill(this.minimumManagementFeeInput, userData.minimumManagementFeePerUnit);
        await this.smartFill(this.maximumManagementFeeInput, userData.maximumManagementFeePerUnit);
        await this.clickAndNavigate(() => this.nextButton.click({ force: true }), this.companyBioInput);
    }

    async fillCompanyProfileSetup(userData) {
        // Fix for 'Undefined' error
        if (userData.companyLogo && this.companyLogo) {
            await this.companyLogo.setInputFiles(userData.companyLogo);
        }
        await this.smartFill(this.companyBioInput, userData.companyBio);
        await this.clickAndNavigate(() => this.nextButton.click({ force: true }), this.skipButton);
    }

    async skipLocationSetup(userData) { // Added userData parameter
        await this.skipButton.click();
        const confirmationText = this.page.getByText(/Confirmation!/i);
        
        try {
            await confirmationText.waitFor({ state: 'visible', timeout: 10000 });
            await this.okButton.click();
            await this.page.waitForURL('**/dashboard', { timeout: 20000 });
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForSelector(`text=Welcome Back, ${userData.fullName.split(' ')[0]}`);
        } catch (e) {
            if (!this.page.url().includes('/dashboard')) throw e;
        }
        console.log('PMA Onboarding: Complete');
    }
}

module.exports = PmaSignup;

// class PmaSignup {

//     constructor(page) {
//         this.page = page;

//         //STEP-1
//         this.companyNameInput = page.locator('input[name="companyName"]');
//         this.companyWebsiteInput = page.locator('input[name="website"]');
//         this.companyLandlineInput = page.locator('input[name="landline"]');
//         this.fullNameInput = page.locator('input[name="fullName"]');
//         this.mobileNumberInput = page.locator('input[name="mobileNumber"]');
//         this.emailInput = page.locator('input[name="email"]');
//         this.passwordInput = page.locator('input[name="password"]');
//         this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');

//         this.nextButton = page.getByRole('button', { name: 'Next' });

//         this.verificationMethodCard = page.locator("//img[@alt='Email']");
//         this.firstDigitInput = page.locator('#code-0');
//         this.secondDigitInput = page.locator('#code-1');
//         this.thirdDigitInput = page.locator('#code-2');
//         this.fourthDigitInput = page.locator('#code-3');
//         this.fifthDigitInput = page.locator('#code-4');
//         this.sixthDigitInput = page.locator('#code-5');
       

//         //STEP-2

//         this.postcodeInput = page.locator('input[name="postcode"]');
//         this.findAddressButton = page.getByRole('button', { name: 'Find Address' });
//         this.selectAddressDropdown = page.getByLabel('Select Address');
//         this.continueWithSelectedAddressButton = page.getByRole('button', { name: 'Continue with Selected Address' });

        
//         this.yearsTrading= page.locator('input[name="tradingYears"]');
//         this.totalUnits= page.locator('input[name="unitsManaged"]');
//         this.unitsPerAccountManager = page.locator('input[name="unitsAccountManager"]');
//         this.contactPreferenceDropdown = page.getByLabel('Mobile/Landline');
//         this.secondaryFullNameInput = page.locator('input[name="secondaryFullName"]');
//         this.secondaryEmailInput = page.locator('input[name="secondaryEmail"]');
//         this.secondaryPhoneInput = page.locator('input[name="secondaryPhone"]');
//         this.secondaryLandlineInput = page.locator('input[name="secondaryMobile"]');

//         //STEP-3
//         this.manualCard = page.locator("//img[@alt='Manually']");
//         this.averageRatingInput = page.locator('input[name="averageRating"]');
//         this.numberOfReviewsInput = page.locator('input[name="numberOfReviews"]');

//         //STEP-4
//         this.emailNotificationCard1 = page.locator("text='Primary User'");
//         this.emailNotificationCard2 = page.locator("text='Secondary User'");
//         this.emailNotificationCard3 = page.locator("text='Both'");

//         //STEP-5
//         // this.minimumManagementFeeInput = page.locator('input[name="minimumManagementFeePerUnit"]');
//         // this.maximumManagementFeeInput = page.locator('input[name="maximumManagementFeePerUnit"]');
//         this.minimumManagementFeeInput = page.getByRole('spinbutton', { name: 'Minimum Fee per Unit (inc VAT)' });
//         this.maximumManagementFeeInput = page.getByRole('spinbutton', { name: 'Maximum Fee per Unit (inc VAT)' });

//         //STEP-6 
//         this.companyLogo = page.locator('#file-upload');
//         this.companyBioInput = page.locator('textarea[name="companyBio"]');


//         //STEP-7
//         this.skipButton = page.getByRole('button', { name: 'Skip' });
//         this.okButton = page.getByRole('button', { name: 'Ok' });
        


//     }

//     async goto() {
//     await this.page.goto('https://pma.strategisthubpro.com/login');
//     await this.clickSignup();
//     await this.page.waitForURL('**/company'); 
//    }

//    // Click the signup element using multiple fallback strategies to avoid locator timeouts
//    async clickSignup() {
//     const candidates = [
//       this.page.getByRole('link', { name: /Sign up here/i }).first(),
//       this.page.locator('a:has-text("Sign up here")').first(),
//       this.page.locator('text=Sign up here').first(),
//       this.page.locator('p:has-text("Sign up here")').first(),
//       this.page.locator('text=Don\'t have an account? Sign up here.').first(),
//     ];

//     for (const loc of candidates) {
//       try {
//         await loc.waitFor({ state: 'visible', timeout: 2500 });
//         await loc.click({ timeout: 5000 });
//         return;
//       } catch (e) {
//         // try next candidate
//       }
//     }

//     // Final fallback: click via DOM query by text (no waiting)
//     const clicked = await this.page.evaluate(() => {
//       const text = "Sign up here";
//       const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
//       while (walker.nextNode()) {
//         const el = walker.currentNode;
//         if (el.innerText && el.innerText.includes(text)) {
//           try { el.click(); return true; } catch (e) { return false; }
//         }
//       }
//       return false;
//     });

//     if (!clicked) throw new Error('Unable to find or click the Sign up element');
//   }

//   async fillCompanyDetails(userData){
//     await this.companyNameInput.fill(userData.companyName);
//     await this.companyWebsiteInput.fill(userData.companyWebsite);
//     await this.companyLandlineInput.fill(userData.companyLandline);
//     await this.fullNameInput.fill(userData.fullName);
//     await this.mobileNumberInput.fill(userData.mobileNumber);
//     await this.emailInput.fill(userData.email);
//     await this.passwordInput.fill(userData.password);
//     await this.confirmPasswordInput.fill(userData.confirmPassword);

//     await this.nextButton.click();
//     await this.page.waitForURL('**/otp-verification', { timeout: 7000 }).catch(() => {});
//     await this.verificationMethodCard.click();
//   }

//   async verifyEmail(userData) {
//     await this.firstDigitInput.fill(userData.otp[0]);
//     await this.secondDigitInput.fill(userData.otp[1]);
//     await this.thirdDigitInput.fill(userData.otp[2]);
//     await this.fourthDigitInput.fill(userData.otp[3]);
//     await this.fifthDigitInput.fill(userData.otp[4]);
//     await this.sixthDigitInput.fill(userData.otp[5]);

//     // wait for a post-verification page 
//     await this.page.waitForURL('**/locationcode', { timeout: 7000 }).catch(() => {});

//   }

//   async fillPostcode(userData) {
//     await this.postcodeInput.waitFor({ state: 'visible', timeout: 3000 });
//     await this.postcodeInput.fill(userData.postcode);

//     await this.findAddressButton.click();
//     await this.page.waitForURL('**/pinlocation', { timeout: 5000 });

//     // 1. Open the dropdown
//     await this.selectAddressDropdown.waitFor({ state: 'visible', timeout: 3000 });
//     await this.selectAddressDropdown.click();

//     // 2. Locate all options and pick one by index
//     // .nth(0) is the same as .first()
//     const targetOption = this.page.getByRole('option').nth(2); 

//     // 3. Wait for it to be ready and click
//     await targetOption.waitFor({ state: 'visible', timeout: 3000});
    
//     // Optional: Log what you are clicking
//     console.log('Clicking address:', await targetOption.innerText());

//     await targetOption.click();

//     await this.continueWithSelectedAddressButton.click();
//     await this.page.waitForURL('**/business-profile', { timeout: 7000 }).catch(() => {});
// }

//   // // Helper to reliably select an option inside an open listbox
//   // async selectListboxOption(listbox, value) {
//   //   const v = String(value).trim();

//   //   // 1) Exact visible text (fast and reliable)
//   //   const exact = listbox.getByRole('option', { name: v, exact: true });
//   //   try { await exact.waitFor({ state: 'visible', timeout: 800 }); await exact.click(); return; } catch (e) { }

//   //   // 2) data-value attribute (MUI often uses this)
//   //   const byData = listbox.locator(`[data-value="${v}"]`).first();
//   //   if (await byData.count() > 0) { await byData.click(); return; }

//   //   // 3) Flexible regex: handle dashes and variable spacing (e.g. "2001-2010" vs "2001 - 2010")
//   //   const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//   //   let pattern;
//   //   if (v.includes('-')) {
//   //     const parts = v.split('-').map(p => esc(p.trim()));
//   //     pattern = parts.join('\\s*[-–—]\\s*'); // allow any dash and optional spaces
//   //   } else {
//   //     pattern = esc(v).replace(/\\\s\+/g, '\\s+'); // preserve multi-space tolerance
//   //   }
//   //   const regex = new RegExp(`^${pattern}$`, 'i');
//   //   const regexOpt = listbox.getByRole('option', { name: regex, exact: false });

//   //   try {
//   //     await regexOpt.first().waitFor({ state: 'visible', timeout: 2000 });
//   //     await regexOpt.first().click();
//   //     return;
//   //   } catch (err) {
//   //     // Debug info to help fix selectors quickly
//   //     const items = await listbox.locator('role=option').allInnerTexts();
//   //     throw new Error(`Could not select option "${value}". Listbox options: ${JSON.stringify(items)}`);
//   //   }
//   // }

//   async fillBusinessProfile(userData) {
//       await this.yearsTrading.fill(userData.yearsTrading);
//       await this.totalUnits.waitFor({ state: 'visible' }, 5000);
//       await this.totalUnits.fill(userData.totalUnits);
//       await this.unitsPerAccountManager.waitFor({ state: 'visible' });
//       await this.unitsPerAccountManager.fill(userData.unitsPerAccountManager);

//       // 3. SECURE CHECK: If the field is blank, fill it again (Forcefully)
//     if (await this.totalUnits.inputValue() === "") {
//         await this.totalUnits.type(userData.totalUnits, { delay: 100 });
//     }

//     // 3. SECURE CHECK: If the field is blank, fill it again (Forcefully)
//     if (await this.unitsPerAccountManager.inputValue() === "") {
//         await this.unitsPerAccountManager.type(userData.unitsPerAccountManager, { delay: 100 });
//     }

//       await this.contactPreferenceDropdown.click();
//       // .nth(1) is the same as .first()
//       const targetOption = this.page.getByRole('option').nth(1); 
//       await targetOption.waitFor({ state: 'visible', timeout: 3000});
//       await targetOption.click();
//    //   await this.selectListboxOption(this.page.getByRole('listbox'), userData.contactPreference);
//       await this.secondaryFullNameInput.fill(userData.secondaryFullName);
//       await this.secondaryEmailInput.fill(userData.secondaryEmail);
//       await this.secondaryPhoneInput.fill(userData.secondaryPhone);
//       await this.secondaryLandlineInput.fill(userData.secondaryLandline);

//       await this.nextButton.click();
//       await this.page.waitForURL('**/google-reviews', { timeout: 10000 });

//   }

//   async fillGoogleReviews(userData) {
//     await this.manualCard.waitFor({ state: 'visible' });
//     await this.manualCard.click();
//     await this.page.waitForURL('**/reviews-form', { timeout: 10000 });

//     await this.averageRatingInput.waitFor({ state: 'visible', timeout: 3000});
//     await this.averageRatingInput.fill(userData.averageRating);

//     await this.numberOfReviewsInput.waitFor({ state: 'visible', timeout: 3000});
//     await this.numberOfReviewsInput.fill(userData.numberOfReviews);

//     await this.nextButton.click();
//     await this.page.waitForURL('**/trustpilot-reviews', { timeout: 10000 });
//   }

//   async fillTrustpilotReviews(userData) {
//     await this.manualCard.waitFor({ state: 'visible' });
//     await this.manualCard.click();
//     await this.page.waitForURL('**/trustpilot-form', { timeout: 10000 });

//     await this.averageRatingInput.waitFor({ state: 'visible', timeout: 3000 });
//     await this.averageRatingInput.fill(userData.averageRating);

//     await this.numberOfReviewsInput.waitFor({ state: 'visible', timeout: 3000 });
//     await this.numberOfReviewsInput.fill(userData.numberOfReviews);

//     await this.nextButton.click();
//     await this.page.waitForURL('**/email-notification', { timeout: 10000 }).catch(()=>{});

//   }

//   async fillEmailNotificationPreference(userData) {
//     await this.emailNotificationCard1.waitFor({ state: 'visible', timeout: 3000 });
//     if (userData.emailNotificationPreference === 'Primary User') {
//         await this.emailNotificationCard1.click();
//     } else if (userData.emailNotificationPreference === 'Secondary User') {
//         await this.emailNotificationCard2.click();
//     } else if (userData.emailNotificationPreference === 'Both') {
//         await this.emailNotificationCard3.click();
//     }
//     await this.page.waitForURL('**/management', { timeout: 10000 }).catch(()=>{});
//   }

//   async fillManagementFee(userData) {
//     await this.minimumManagementFeeInput.waitFor({ state: 'visible', timeout: 3000 });
//     await this.minimumManagementFeeInput.fill(userData.minimumManagementFeePerUnit);

//     await this.maximumManagementFeeInput.waitFor({ state: 'visible', timeout: 3000 });
//     await this.maximumManagementFeeInput.fill(userData.maximumManagementFeePerUnit);

//     await this.nextButton.click();
//     await this.page.waitForURL('**/company-details', { timeout: 10000 }).catch(()=>{});
//   }
  
//   async fillCompanyProfileSetup(userData) {
//     //await this.companyLogo.waitFor({ state: 'visible' });
//     await this.companyLogo.setInputFiles(userData.companyLogo);

//     await this.companyBioInput.waitFor({ state: 'visible' , timeout: 3000});
//     await this.companyBioInput.fill(userData.companyBio);

//     await this.nextButton.click();
//     await this.page.waitForURL('**/location-form', { timeout: 10000 }).catch(()=>{});
//   }

//  async skipLocationSetup() {
//     // 1. Ensure the skip button is ready and click it
//     //await this.skipButton.waitFor({ state: 'visible', timeout: 5000 });
//     await this.skipButton.click();

//     // 2. Wait for the confirmation modal to appear
//     // Using getByText is more reliable for "Confirmation!"
//     const confirmationText = this.page.getByText('/Confirmation!/i');
    
//     try {
//         await confirmationText.waitFor({ state: 'visible', timeout: 10000 });
        
//         // 3. Click OK only if the modal appeared
//         await this.okButton.waitFor({ state: 'visible' });
//         await this.okButton.click();
        
//         // 4. Wait for the final redirect to dashboard
//         await this.page.waitForURL('**/dashboard', { timeout: 10000 });
//         console.log('PMA Onboarding: Successfully redirected to Dashboard');
        
//     } catch (e) {
//         // If the modal never appeared, check if we redirected anyway
//         const currentUrl = this.page.url();
//         if (currentUrl.includes('/dashboard')) {
//             console.log('PMA Onboarding: Skipped confirmation but reached Dashboard');
//         } else {
//             throw new Error(`Failed to complete setup. Current URL: ${currentUrl}. Error: ${e.message}`);
//         }
//     }
// }
//     async completeOnboarding() {

//     await this.page.waitForLoadState('networkidle');
//     if (this.page.url().includes('/dashboard')) {
//       console.log("PMA Onboarding: Complete");
//     }
//   }
//  }

//  module.exports = PmaSignup;

// class PmaSignup {
//     constructor(page) {
//         this.page = page;

//         // STEP-1: Registration
//         this.companyNameInput = page.locator('input[name="companyName"]');
//         this.companyWebsiteInput = page.locator('input[name="website"]');
//         this.companyLandlineInput = page.locator('input[name="landline"]');
//         this.fullNameInput = page.locator('input[name="fullName"]');
//         this.mobileNumberInput = page.locator('input[name="mobileNumber"]');
//         this.emailInput = page.locator('input[name="email"]');
//         this.passwordInput = page.locator('input[name="password"]');
//         this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
//         this.nextButton = page.getByRole('button', { name: 'Next' });

//         // STEP-2: Verification & Location
//         this.verificationMethodCard = page.locator("//img[@alt='Email']");
//         this.otpInputs = [0, 1, 2, 3, 4, 5].map(i => page.locator(`#code-${i}`));
//         this.postcodeInput = page.locator('input[name="postcode"]');
//         this.findAddressButton = page.getByRole('button', { name: 'Find Address' });
//         this.selectAddressDropdown = page.getByLabel('Select Address');
//         this.continueWithSelectedAddressButton = page.getByRole('button', { name: 'Continue with Selected Address' });

//         // STEP-3: Business Profile
//         this.yearsTrading = page.locator('input[name="tradingYears"]');
//         this.totalUnits = page.locator('input[name="unitsManaged"]');
//         this.unitsPerAccountManager = page.locator('input[name="unitsAccountManager"]');
//         this.contactPreferenceDropdown = page.getByLabel('Mobile/Landline');
//         this.secondaryFullNameInput = page.locator('input[name="secondaryFullName"]');
//         this.secondaryEmailInput = page.locator('input[name="secondaryEmail"]');
//         this.secondaryPhoneInput = page.locator('input[name="secondaryPhone"]');
//         this.secondaryLandlineInput = page.locator('input[name="secondaryMobile"]');

//         // STEP-4 & 5: Reviews & Notifications
//         this.manualCard = page.locator("//img[@alt='Manually']");
//         this.averageRatingInput = page.locator('input[name="averageRating"]');
//         this.numberOfReviewsInput = page.locator('input[name="numberOfReviews"]');
//         this.emailNotificationCard1 = page.getByText('Primary User', { exact: true });
//         this.emailNotificationCard2 = page.getByText('Secondary User', { exact: true });
//         this.emailNotificationCard3 = page.getByText('Both', { exact: true });

//         // STEP-6: Fees & Profile
//         this.minimumManagementFeeInput = page.getByRole('spinbutton', { name: 'Minimum Fee per Unit (inc VAT)' });
//         this.maximumManagementFeeInput = page.getByRole('spinbutton', { name: 'Maximum Fee per Unit (inc VAT)' });
//         this.companyLogo = page.locator('#file-upload');
//         this.companyBioInput = page.locator('textarea[name="companyBio"]');

//         // STEP-7: Finalize
//         this.skipButton = page.getByRole('button', { name: 'Skip' }).first();
//         this.okButton = page.getByRole('button', { name: 'Ok' });
//     }

//     /**
//      * SMART FILL: Fills and retries if empty.
//      */
//  async smartFill(locator, value) {
//     if (value === undefined || value === null) return;

//     await locator.waitFor({ state: 'visible', timeout: 10000 });
    
//     // 1. Click to gain focus (triggers the 'onFocus' event)
//     await locator.click();
    
//     // 2. Clear anything existing and fill
//     await locator.fill(String(value));
    
//     // 3. IMPORTANT: Press Tab to "blur" the field. 
//     // This forces the website to save the state/validation.
//     await locator.press('Tab');

//     // 4. Verify and Retry if the system wiped it
//     let currentValue = await locator.inputValue();
//     if (currentValue === "") {
//         console.warn(`Field was wiped! Retrying with sequential typing...`);
//         await locator.click();
//         // Use pressSequentially to mimic human speed (very effective for React state)
//         await locator.pressSequentially(String(value), { delay: 100 });
//         await locator.press('Tab');
//     }

//     // 5. Final assertion to stop the test if the site is broken
//     if (await locator.inputValue() === "") {
//         throw new Error(`Critical: System keeps wiping the field [${await locator.getAttribute('name')}].`);
//     }
// }

//     async goto() {
//         await this.page.goto('https://pma.strategisthubpro.com/login', { waitUntil: 'networkidle', timeout: 30000 });
//         await this.clickSignup();
//         await this.page.waitForURL('**/company', { timeout: 15000 });
//     }

//     async clickSignup() {
//         const signupLink = this.page.getByText(/Sign up here/i).first();
//         await signupLink.waitFor({ state: 'visible', timeout: 10000 });
//         await signupLink.click();
//     }

//     async fillCompanyDetails(userData) {
//         await this.smartFill(this.companyNameInput, userData.companyName);
//         await this.smartFill(this.companyWebsiteInput, userData.companyWebsite);
//         await this.smartFill(this.companyLandlineInput, userData.companyLandline);
//         await this.smartFill(this.fullNameInput, userData.fullName);
//         await this.smartFill(this.mobileNumberInput, userData.mobileNumber);
//         await this.smartFill(this.emailInput, userData.email);
//         await this.smartFill(this.passwordInput, userData.password);
//         await this.smartFill(this.confirmPasswordInput, userData.confirmPassword);

//         await this.nextButton.click();
//         await this.page.waitForURL('**/otp-verification', { timeout: 15000 });
//         await this.page.waitForLoadState('networkidle');
//         await this.verificationMethodCard.click();
//     }

//     async verifyEmail(userData) {
//         for (let i = 0; i < 6; i++) {
//             await this.smartFill(this.otpInputs[i], userData.otp[i]);
//         }
//         await this.page.waitForURL('**/locationcode', { timeout: 15000 });
//         await this.page.waitForLoadState('domcontentloaded');
//     }

//     async fillPostcode(userData) {
//         await this.smartFill(this.postcodeInput, userData.postcode);
//         await this.findAddressButton.click();
//         await this.page.waitForURL('**/pinlocation', { timeout: 15000 });

//         await this.selectAddressDropdown.waitFor({ state: 'visible' });
//         await this.selectAddressDropdown.click();
//         const targetOption = this.page.getByRole('option').nth(2);
//         await targetOption.waitFor({ state: 'visible', timeout: 10000 });
//         await targetOption.click();

//         await this.continueWithSelectedAddressButton.click();
//         await this.page.waitForURL('**/business-profile', { timeout: 15000 });
//         await this.page.waitForLoadState('networkidle');
//     }

//     async fillBusinessProfile(userData) {
//         await this.smartFill(this.yearsTrading, userData.yearsTrading);
//         await this.smartFill(this.totalUnits, userData.totalUnits);
//         await this.smartFill(this.unitsPerAccountManager, userData.unitsPerAccountManager);
        
//         await this.contactPreferenceDropdown.click();
//         await this.page.getByRole('option').nth(1).click();

//         await this.smartFill(this.secondaryFullNameInput, userData.secondaryFullName);
//         await this.smartFill(this.secondaryEmailInput, userData.secondaryEmail);
//         await this.smartFill(this.secondaryPhoneInput, userData.secondaryPhone);
//         await this.smartFill(this.secondaryLandlineInput, userData.secondaryLandline);

//         await this.nextButton.click();
//         await this.page.waitForURL('**/google-reviews', { timeout: 15000 });
//         await this.page.waitForLoadState('networkidle');
//     }

//     async fillGoogleReviews(userData) {
//         await this.manualCard.waitFor({ state: 'visible', timeout: 10000 });
//         await this.manualCard.click();
//         await this.page.waitForURL('**/reviews-form', { timeout: 15000 });

//         await this.smartFill(this.averageRatingInput, userData.averageRating);
//         await this.smartFill(this.numberOfReviewsInput, userData.numberOfReviews);

//         await this.nextButton.click();
//         await this.page.waitForURL('**/trustpilot-reviews', { timeout: 15000 });
//     }

//     async fillTrustpilotReviews(userData) {
//         await this.manualCard.waitFor({ state: 'visible', timeout: 10000 });
//         await this.manualCard.click();
//         await this.page.waitForURL('**/trustpilot-form', { timeout: 15000 });

//         await this.smartFill(this.averageRatingInput, userData.averageRating);
//         await this.smartFill(this.numberOfReviewsInput, userData.numberOfReviews);

//         await this.nextButton.click();
//         await this.page.waitForURL('**/email-notification', { timeout: 15000 });
//     }

//     async fillEmailNotificationPreference(userData) {
//         const pref = userData.emailNotificationPreference;
//         const card = pref === 'Primary User' ? this.emailNotificationCard1 : 
//                      pref === 'Secondary User' ? this.emailNotificationCard2 : this.emailNotificationCard3;
        
//         await card.waitFor({ state: 'visible', timeout: 10000 });
//         await card.click();

//         await this.page.waitForURL('**/management', { timeout: 15000 });
//     }

//     async fillManagementFee(userData) {
//         await this.smartFill(this.minimumManagementFeeInput, userData.minimumManagementFeePerUnit);
//         await this.smartFill(this.maximumManagementFeeInput, userData.maximumManagementFeePerUnit);

//         await this.nextButton.click();
//         await this.page.waitForURL('**/company-details', { timeout: 15000 });
//     }

//     async fillCompanyProfileSetup(userData) {
//         if (userData.companyLogo) await this.companyLogo.setInputFiles(userData.companyLogo);
//         await this.smartFill(this.companyBioInput, userData.companyBio);

//         await this.nextButton.click();
//         await this.page.waitForURL('**/location-form', { timeout: 15000 });
//     }

//     async skipLocationSetup() {
//         await this.skipButton.waitFor({ state: 'visible', timeout: 10000 });
//         await this.skipButton.click();
        
//         const confirmationText = this.page.getByText(/Confirmation!/i);
//         try {
//             await confirmationText.waitFor({ state: 'visible', timeout: 10000 });
//             await this.okButton.click();
//             await this.page.waitForURL('**/dashboard', { timeout: 20000 });
//         } catch (e) {
//             if (!this.page.url().includes('/dashboard')) throw e;
//         }
//         console.log('PMA Onboarding: Complete');
//     }
// }

// module.exports = PmaSignup;



// class PmaSignup {
//     constructor(page) {
//         this.page = page;

//         // STEP-1: Registration
//         this.companyNameInput = page.locator('input[name="companyName"]');
//         this.companyWebsiteInput = page.locator('input[name="website"]');
//         this.companyLandlineInput = page.locator('input[name="landline"]');
//         this.fullNameInput = page.locator('input[name="fullName"]');
//         this.mobileNumberInput = page.locator('input[name="mobileNumber"]');
//         this.emailInput = page.locator('input[name="email"]');
//         this.passwordInput = page.locator('input[name="password"]');
//         this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
        
//         // Multi-match fix: use visible filter to avoid hidden step buttons
//         this.nextButton = page.getByRole('button', { name: 'Next' }).filter({ visible: true });

//         // STEP-2: Verification & Location
//         this.verificationMethodCard = page.locator("//img[@alt='Email']");
//         this.otpInputs = [0, 1, 2, 3, 4, 5].map(i => page.locator(`#code-${i}`));
//         this.postcodeInput = page.locator('input[name="postcode"]');
//         this.findAddressButton = page.getByRole('button', { name: 'Find Address' });
//         this.selectAddressDropdown = page.getByLabel('Select Address');
//         this.continueWithSelectedAddressButton = page.getByRole('button', { name: 'Continue with Selected Address' });

//         // STEP-3: Business Profile
//         this.yearsTrading = page.locator('input[name="tradingYears"]');
//         this.totalUnits = page.locator('input[name="unitsManaged"]');
//         this.unitsPerAccountManager = page.locator('input[name="unitsAccountManager"]');
//         this.contactPreferenceDropdown = page.getByLabel('Mobile/Landline');
//         this.secondaryFullNameInput = page.locator('input[name="secondaryFullName"]');
//         this.secondaryEmailInput = page.locator('input[name="secondaryEmail"]');
//         this.secondaryPhoneInput = page.locator('input[name="secondaryPhone"]');
//         this.secondaryLandlineInput = page.locator('input[name="secondaryMobile"]');

//         // STEP-4 & 5: Reviews & Notifications
//         this.manualCard = page.locator("//img[@alt='Manually']").filter({ visible: true });
//         this.averageRatingInput = page.locator('input[name="averageRating"]');
//         this.numberOfReviewsInput = page.locator('input[name="numberOfReviews"]');
//         this.emailNotificationCard1 = page.getByText('Primary User', { exact: true });
//         this.emailNotificationCard2 = page.getByText('Secondary User', { exact: true });
//         this.emailNotificationCard3 = page.getByText('Both', { exact: true });

//         // STEP-6: Fees & Profile
//         this.minimumManagementFeeInput = page.getByRole('spinbutton', { name: /Minimum Fee/i });
//         this.maximumManagementFeeInput = page.getByRole('spinbutton', { name: /Maximum Fee/i });
//         this.companyLogo = page.locator('#file-upload');
//         this.companyBioInput = page.locator('textarea[name="companyBio"]');

//         // STEP-7: Finalize
//         this.skipButton = page.getByRole('button', { name: 'Skip' }).first().filter({ visible: true });
//         this.okButton = page.getByRole('button', { name: 'Ok' }).filter({ visible: true });
//     }

//     /**
//      * GLOBAL OVERLAY HANDLER
//      * Waits for the loading spinner/backdrop to vanish.
//      */
//     async waitForLoader() {
//         const loader = this.page.locator('div.bg-opacity-50, img[alt="Loading..."], .MuiBackdrop-root').first();
//         if (await loader.isVisible()) {
//             await loader.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => console.log("Loader still present, forcing interaction..."));
//         }
//     }

//     /**
//      * SMART FILL: Prevents "wiping" by clicking, filling, and tabbing out.
//      */
//     async smartFill(locator, value) {
//         if (!value) return;
//         await this.waitForLoader();
//         await locator.waitFor({ state: 'visible', timeout: 10000 });
        
//         // 1. Fill normally
//         await locator.click({ force: true });
//         await locator.fill(String(value));
//         await locator.press('Tab');
//         await this.page.waitForTimeout(300);

//         // 2. Retry Logic
//         if (await locator.inputValue() === "") {
//             console.warn(`Field wiped. Retrying...`);
//             await locator.click({ force: true });
            
//             // If text is long (Bio), don't use delay to prevent timeout
//             const delay = String(value).length > 50 ? 0 : 30;
//             await locator.pressSequentially(String(value), { delay });
//             await locator.press('Tab');
//         }
//     }
//     /**
//      * Resilient Navigation: Clicks Next and waits for URL, handling errors.
//      */
//     async validateAndClickNext(targetUrlPart) {
//     await this.nextButton.waitFor({ state: 'visible', timeout: 10000 });
    
//     try {
//         // We use 'commit' or 'domcontentloaded' instead of 'load' to be faster
//         await Promise.all([
//             this.page.waitForURL(url => url.href.includes(targetUrlPart), { 
//                 timeout: 10000, 
//                 waitUntil: 'domcontentloaded' 
//             }),
//             this.nextButton.click({ force: true }) // Force click in case of overlays
//         ]);
        
//         // Use 'load' instead of 'networkidle' to avoid hanging on background trackers
//         await this.page.waitForLoadState('load'); 
//     } catch (e) {
//         const currentUrl = this.page.url();
//         console.error(`Navigation failed. Stayed on: ${currentUrl}`);
        
//         // Take a screenshot to see if a red validation error appeared
//         await this.page.screenshot({ path: `error-${targetUrlPart}.png` });
//         throw new Error(`Failed to navigate to ${targetUrlPart}. Check screenshot.`);
//     }
// }


//     async goto() {
//         await this.page.goto('https://pma.strategisthubpro.com/login', { waitUntil: 'networkidle' });
//         const signupLink = this.page.getByText(/Sign up here/i).first();
//         await signupLink.click();
//         await this.page.waitForURL('**/company', { timeout: 15000 });
//     }

//     async fillCompanyDetails(userData) {
//         await this.smartFill(this.companyNameInput, userData.companyName);
//         await this.smartFill(this.companyWebsiteInput, userData.companyWebsite);
//         await this.smartFill(this.companyLandlineInput, userData.companyLandline);
//         await this.smartFill(this.fullNameInput, userData.fullName);
//         await this.smartFill(this.mobileNumberInput, userData.mobileNumber);
//         await this.smartFill(this.emailInput, userData.email);
//         await this.smartFill(this.passwordInput, userData.password);
//         await this.smartFill(this.confirmPasswordInput, userData.confirmPassword);

//         await this.validateAndClickNext('otp-verification');
//         await this.verificationMethodCard.click();
//     }

//     async verifyEmail(userData) {
//         for (let i = 0; i < 6; i++) {
//             await this.smartFill(this.otpInputs[i], userData.otp[i]);
//         }
//         await this.page.waitForURL('**/locationcode', { timeout: 15000 });
//     }

//     async fillPostcode(userData) {
//         await this.smartFill(this.postcodeInput, userData.postcode);
//         await this.findAddressButton.click();
//         await this.page.waitForURL('**/pinlocation', { timeout: 15000 });

//         await this.selectAddressDropdown.click();
//         const targetOption = this.page.getByRole('option').nth(3);
//         await targetOption.waitFor({ state: 'visible' });
//         await targetOption.click();

//         await this.continueWithSelectedAddressButton.click();
//         await this.page.waitForURL('**/business-profile', { timeout: 15000 });
//     }

//     async fillBusinessProfile(userData) {
//         await this.smartFill(this.yearsTrading, userData.yearsTrading);
//         await this.smartFill(this.totalUnits, userData.totalUnits);
//         await this.smartFill(this.unitsPerAccountManager, userData.unitsPerAccountManager);
        
//         await this.contactPreferenceDropdown.click();
//         await this.page.getByRole('option').nth(1).click();

//         await this.smartFill(this.secondaryFullNameInput, userData.secondaryFullName);
//         await this.smartFill(this.secondaryEmailInput, userData.secondaryEmail);
//         await this.smartFill(this.secondaryPhoneInput, userData.secondaryPhone);
//         await this.smartFill(this.secondaryLandlineInput, userData.secondaryLandline);

//         await this.validateAndClickNext('google-reviews');
//     }

//         async fillGoogleReviews(userData) {
//         await this.manualCard.click();
        
//         // WAIT for the "Manual" form to actually be ready
//         await this.page.waitForLoadState('networkidle');
//         await this.page.waitForTimeout(1000); // Give the overlay time to fade out

//         await this.smartFill(this.averageRatingInput, userData.averageRating);
//         await this.smartFill(this.numberOfReviewsInput, userData.numberOfReviews);

//         await this.validateAndClickNext('trustpilot-reviews');
//     }

//     // async fillTrustpilotReviews(userData) {
//     //     await this.manualCard.click({force:true});
        
//     //     // WAIT for the UI transition
//     //     await this.page.waitForLoadState('networkidle');
//     //     await this.page.waitForTimeout(5000);

//     //     await this.smartFill(this.averageRatingInput, userData.averageRating);
//     //     await this.smartFill(this.numberOfReviewsInput, userData.numberOfReviews);

//     //     await this.validateAndClickNext('email-notification');
//     // }

//     async fillTrustpilotReviews(userData) {
//     // 1. Ensure we are actually on the Trustpilot selection page
//     await this.page.waitForURL('**/trustpilot-reviews', { timeout: 15000 });
//     await this.waitForLoader();

//     // 2. Click the 'Manually' card for THIS step
//     // Using .first() or a more specific locator helps if multiple cards exist in DOM
//     await this.manualCard.waitFor({ state: 'visible' });
//     await this.manualCard.click({ force: true });

//     // 3. WAIT for the Form to mount before calling smartFill
//     // This is the bridge that prevents the 10s timeout at line 646
//     await this.page.waitForURL('**/trustpilot-form', { timeout: 15000 });
    
//     // Check if the specific input for THIS page is ready
//     await this.averageRatingInput.waitFor({ state: 'visible', timeout: 10000 });

//     // 4. Now fill the fields
//     await this.smartFill(this.averageRatingInput, userData.averageRating);
//     await this.smartFill(this.numberOfReviewsInput, userData.numberOfReviews);

//     await this.validateAndClickNext('email-notification');
// }

//     async fillEmailNotificationPreference(userData) {
//         const pref = userData.emailNotificationPreference;
//         const card = pref === 'Primary User' ? this.emailNotificationCard1 : 
//                      pref === 'Secondary User' ? this.emailNotificationCard2 : this.emailNotificationCard3;
        
//         await card.click({force:true});
//         await this.page.waitForURL(url => url.href.includes('management'), { timeout: 15000 });
//     }

//     async fillManagementFee(userData) {
//         await this.smartFill(this.minimumManagementFeeInput, userData.minimumManagementFeePerUnit);
//         await this.smartFill(this.maximumManagementFeeInput, userData.maximumManagementFeePerUnit);

//         await this.validateAndClickNext('company-details');
//     }

//     async fillCompanyProfileSetup(userData) {
//         if (userData.companyLogo) {
//             await this.companyLogo.setInputFiles(userData.companyLogo);
//         }
//         await this.smartFill(this.companyBioInput, userData.companyBio);

//         await this.validateAndClickNext('location-form');
//     }

//     async skipLocationSetup() {
//         await this.skipButton.click();
//         const confirmationText = this.page.getByText(/Confirmation!/i);
        
//         try {
//             await confirmationText.waitFor({ state: 'visible', timeout: 10000 });
//             await this.okButton.click();
//             await this.page.waitForURL('**/dashboard', { timeout: 20000 });
//             await this.page.waitForLoadState('networkidle');
//             await this.page.waitForSelector(`text=Welcome Back, ${userData.fullName.split(' ')[0]}`);
//         } catch (e) {
//             if (!this.page.url().includes('/dashboard')) throw e;
//         }
//         console.log('PMA Onboarding: Complete');
//     }

//     async fillCompanyDetails(userData) {
//         await this.smartFill(this.companyNameInput, userData.companyName);
//         await this.smartFill(this.companyWebsiteInput, userData.companyWebsite);
//         await this.smartFill(this.companyLandlineInput, userData.companyLandline);
//         await this.smartFill(this.fullNameInput, userData.fullName);
//         await this.smartFill(this.mobileNumberInput, userData.mobileNumber);
//         await this.smartFill(this.emailInput, userData.email);
//         await this.smartFill(this.passwordInput, userData.password);
//         await this.smartFill(this.confirmPasswordInput, userData.confirmPassword);
//         await this.validateAndClickNext('otp-verification');
//         await this.verificationMethodCard.click({ force: true });
//     }

//     async verifyEmail(userData) {
//         await this.waitForLoader();
//         for (let i = 0; i < 6; i++) {
//             await this.smartFill(this.otpInputs[i], userData.otp[i]);
//         }
//         await this.page.waitForURL('**/locationcode', { timeout: 20000 });
//     }

//     // async fillPostcode(userData) {
//     //     await this.smartFill(this.postcodeInput, userData.postcode);
//     //     await this.findAddressButton.waitFor({ state: 'visible', timeout: 10000 });
//     //     await this.page.waitForTimeout(1000); // 1-second "Human" pause for state stability
//     //     await this.findAddressButton.click({ force: true });
//     //     await this.page.waitForURL('**/pinlocation', { timeout: 10000});
//     //     await this.selectAddressDropdown.click({ force: true });
//     //     await this.page.getByRole('option').nth(4).click();
//     //     await this.continueWithSelectedAddressButton.click({ force: true });
//     //     await this.page.waitForURL('**/business-profile', { timeout: 15000});
//     //}

//     async fillPostcode(userData) {
//     // 1. Wait for the page to be ready
//     await this.page.waitForURL('**/locationcode', { waitUntil: 'networkidle' });
    
//     // 2. Fill Postcode
//     await this.smartFill(this.postcodeInput, userData.postcode);

//     // 3. Click Find Address and wait for the Pin Location page
//     await Promise.all([
//         this.page.waitForURL(url => url.href.includes('pinlocation'), { timeout: 20000 }),
//         this.findAddressButton.click({ force: true })
//     ]);

//     // 4. Handle Address Dropdown
//     await this.waitForLoader(); // Ensure the "searching" spinner is gone
    
//     // Wait for the dropdown to be visible
//     await this.selectAddressDropdown.waitFor({ state: 'visible', timeout: 10000 });
    
//     // Some MUI dropdowns need a second to be "clickable"
//     await this.page.waitForTimeout(500); 
//     await this.selectAddressDropdown.click({ force: true });

//     // 5. CRITICAL FIX: Wait for the options to populate
//     const targetOption = this.page.getByRole('option').nth(4);
    
//     // We wait for the specific option to appear in the DOM
//     await targetOption.waitFor({ state: 'visible', timeout: 15000 });
    
//     // Click the address
//     await targetOption.click({ force: true });

//     // 6. Move to next step
//     await Promise.all([
//         this.page.waitForURL(url => url.href.includes('business-profile'), { timeout: 15000 }),
//         this.continueWithSelectedAddressButton.click({ force: true })
//     ]);
// }

//     async fillBusinessProfile(userData) {
//         await this.smartFill(this.yearsTrading, userData.yearsTrading);
//         await this.smartFill(this.totalUnits, userData.totalUnits);
//         await this.smartFill(this.unitsPerAccountManager, userData.unitsPerAccountManager);
//         await this.contactPreferenceDropdown.click({ force: true });
//         await this.page.getByRole('option').nth(1).click();
//         await this.smartFill(this.secondaryFullNameInput, userData.secondaryFullName);
//         await this.smartFill(this.secondaryEmailInput, userData.secondaryEmail);
//         await this.smartFill(this.secondaryPhoneInput, userData.secondaryPhone);
//         await this.smartFill(this.secondaryLandlineInput, userData.secondaryLandline);
//         await this.validateAndClickNext('google-reviews');
//     }

//     async fillGoogleReviews(userData) {
//         await this.waitForLoader();
//         await this.manualCard.click({ force: true });
//         await this.page.waitForURL('**/reviews-form', { timeout: 15000});
//         await this.smartFill(this.averageRatingInput, userData.averageRating);
//         await this.smartFill(this.numberOfReviewsInput, userData.numberOfReviews);
//         await this.validateAndClickNext('trustpilot-reviews');
//     }

//     async fillTrustpilotReviews(userData) {
//         await this.waitForLoader();
//         await this.manualCard.click({ force: true });
//         await this.page.waitForURL('**/trustpilot-form', { timeout: 15000});
//         await this.smartFill(this.averageRatingInput, userData.averageRating);
//         await this.smartFill(this.numberOfReviewsInput, userData.numberOfReviews);
//         await this.validateAndClickNext('email-notification');
//     }

//     async fillEmailNotificationPreference(userData) {
//         await this.waitForLoader();
//         const pref = userData.emailNotificationPreference;
//         const card = pref === 'Primary User' ? this.emailNotificationCard1 : 
//                      pref === 'Secondary User' ? this.emailNotificationCard2 : this.emailNotificationCard3;
        
//         // Using force click because the loader image is specifically blocking this card
//         await card.click({ force: true });
//         await this.page.waitForURL(url => url.href.includes('management'), { timeout: 15000 });
//     }

//     async fillManagementFee(userData) {
//         await this.smartFill(this.minimumManagementFeeInput, userData.minimumManagementFeePerUnit);
//         await this.smartFill(this.maximumManagementFeeInput, userData.maximumManagementFeePerUnit);
//         await this.validateAndClickNext('company-profile');
//     }

//     async fillCompanyProfileSetup(userData) {
//         if (userData.companyLogo) await this.companyLogo.setInputFiles(userData.companyLogo);
//         // PASS 'true' for fast typing to avoid timeout on long bio
//         await this.smartFill(this.companyBioInput, userData.companyBio, true);
//         await this.validateAndClickNext('location-form');
//     }

//     async skipLocationSetup() {
//         await this.skipButton.click();
//         const confirmationText = this.page.getByText(/Confirmation!/i);
        
//         try {
//             await confirmationText.waitFor({ state: 'visible', timeout: 10000 });
//             await this.okButton.click();
//             await this.page.waitForURL('**/dashboard', { timeout: 20000 });
//             await this.page.waitForLoadState('networkidle');
//             await this.page.waitForSelector(`text=Welcome Back, ${userData.fullName.split(' ')[0]}`);
//         } catch (e) {
//             if (!this.page.url().includes('/dashboard')) throw e;
//         }
//         console.log('PMA Onboarding: Complete');
//     }
//}




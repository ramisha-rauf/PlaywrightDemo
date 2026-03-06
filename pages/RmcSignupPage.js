// const { timeout } = require("async");
// class RmcSignupPage {
//   constructor(page) {
//     this.page = page;
//     // Signup link is sometimes rendered as text, paragraph, or anchor.We'll use a resilient click helper instead of a single locator.

//     //STEP - 0
//     this.signupLink = null;
//     this.directorCard = page.locator("//img[contains(@alt,'Director')]");
//     this.firstNameInput = page.getByLabel('First Name'); // Or getByPlaceholder
//     this.lastNameInput = page.getByLabel('Last Name');
//     this.emailInput = page.getByLabel('Email');
//     this.phoneInput = page.getByLabel('Phone Number');
//     this.passwordInput = page.locator('input[name="password"]'); // Names are usually more stable than IDs
//     this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
//     this.nextButton = page.getByRole('button', { name: 'Next' });
//     this.verificationMethodCard = page.locator("//img[@alt='Email']");
//     this.verificationMethodCard = page.locator('div').filter({ hasText: /^Email$/ }).first();
//     this.otpInputs = [0, 1, 2, 3, 4, 5].map(i => page.locator(`#code-${i}`));

//     //STEP-1

//     this.postcodeInput = page.locator('input[name="postcode"]');
//     this.findAddressButton = page.getByRole('button', { name: 'Find Address' });
//     this.selectAddressDropdown = page.getByLabel('Select Address');
//     this.continueWithSelectedAddressButton = page.getByRole('button', { name: 'Continue with Selected Address' });

//     this.blockNameInput = page.getByLabel('Block Name');
//     this.noOfUnitsInput = page.getByLabel('No of Units');
//     this.currentManagingAgentInput = page.getByLabel('Current Managing Agent');
//     this.numberOfBlocksDropdown = page.getByLabel('Number of Blocks');
//     this.yearBuiltDropdown = page.getByLabel('Year Built');

//     //STEP-2

//     this.managementFeeInput = page.getByLabel('Management Fee');
//     this.cosecFeeInput = page.getByLabel('CoSec Fee');
//     this.accountingFeeInput = page.getByLabel('Accounting Fee');
//     this.confirmButton = page.getByRole('button', { name: 'Confirm' });

//     //STEP-3
//     this.leasehold1 = page.locator("//img[contains(@alt,'Converted House')]");
//     this.leasehold2 = page.locator("//img[contains(@alt,'Purpose Built Flat')]");
//     this.leasehold3 = page.locator("//img[contains(@alt,'Mixed Development')]");
 
//     this.buildingHeight1 = page.locator("//img[contains(@alt,'Below 11m')]");
//     this.buildingHeight2 = page.locator("//img[contains(@alt,'11m - 18m')]");
//     this.buildingHeight3 = page.locator("//img[contains(@alt,'Above 18m')]");
//     this.buildingHeight4 = page.locator("//img[contains(@alt,'Don't Know')]");

//     this.blockCondition1 = page.locator("//img[contains(@alt,'Excellent')]");
//     this.blockCondition2 = page.locator("//img[contains(@alt,'Good')]");
//     this.blockCondition3 = page.locator("//img[contains(@alt,'Fair')]");
//     this.blockCondition4 = page.locator("//img[contains(@alt,'Poor')]");

//     this.outdoorSpace1 = page.locator("//img[contains(@alt,'Large Shared Space')]");
//     this.outdoorSpace2 = page.locator("//img[contains(@alt,'Some')]");
//     this.outdoorSpace3 = page.locator("//img[contains(@alt,'None')]");

//     //STEP-5
//     this.openEndedTitle = page.locator('h6:has-text("Help Managing Agents Understand Your Needs")');
//     this.textInputs1 = page.locator('textarea[name="1"]');
//     this.textInputs2 = page.locator('textarea[name="2"]');
//     this.textInputs3 = page.locator('textarea[name="3"]');
//     this.goToDashboardButton = page.getByRole('button', { name: 'Go to Dashboard' });
//     this.okButton = page.getByRole('button', { name: 'Ok' });

//   }

//   async waitForLoader() {
//         const loader = this.page.locator('div.bg-opacity-50, img[alt="Loading..."], .MuiBackdrop-root').first();
//         await loader.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
//         // Use 1s instead of 3s to keep the test fast but stable
//         await this.page.waitForTimeout(1000);
//     }

//   async smartFill(locator, value) {
//         if (!value) return;
//         await this.waitForLoader();
//         await locator.waitFor({ state: 'visible', timeout: 15000 });
//         await locator.click({ force: true });
//         await locator.fill(String(value));
//         await locator.press('Tab');
        
//         if (await locator.inputValue() === "") {
//             const delay = String(value).length > 60 ? 0 : 20;
//             await locator.pressSequentially(String(value), { delay });
//             await locator.press('Tab');
//         }
//     }

//   async clickAndNavigate(clickAction, targetLocator) {
//         await this.waitForLoader();
//         await clickAction();
//         // If the target doesn't show up, check for validation errors
//         try {
//             await targetLocator.waitFor({ state: 'visible', timeout: 15000 });
//         } catch (e) {
//             const error = this.page.locator('.Mui-error, [role="alert"]').first();
//             if (await error.isVisible()) {
//                 throw new Error(`Navigation blocked by UI error: ${await error.innerText()}`);
//             }
//             // Retry the click once
//             await clickAction();
//             await targetLocator.waitFor({ state: 'visible', timeout: 10000 });
//         }
//     }

//   async goto() {
//     // Clear session to prevent being redirected to the dashboard
//         await this.page.context().clearCookies();
//         await this.page.evaluate(() => localStorage.clear());
//         await this.page.evaluate(() => sessionStorage.clear());

//         await this.page.goto('https://rmc.strategisthubpro.com/login');

//         const signupLink = this.page.getByText(/Sign up here/i).first();
//         await signupLink.waitFor({ state: 'visible' });
//         await signupLink.click();

//         await this.page.waitForURL(url=> url.href.includes('**/onboarding'), {timeout: 15000}); // Wait for the onboarding page to load
//   }

//   // Click the signup element using multiple fallback strategies to avoid locator timeouts
//   // async clickSignup() {
//   //   const candidates = [
//   //     this.page.getByRole('link', { name: /Sign up here/i }).first(),
//   //     this.page.locator('a:has-text("Sign up here")').first(),
//   //     this.page.locator('text=Sign up here').first(),
//   //     this.page.locator('p:has-text("Sign up here")').first(),
//   //     this.page.locator('text=Don\'t have an account? Sign up here.').first(),
//   //   ];

//   //   for (const loc of candidates) {
//   //     try {
//   //       await loc.waitFor({ state: 'visible', timeout: 2500 });
//   //       await loc.click({ timeout: 5000 });
//   //       return;
//   //     } catch (e) {
//   //       // try next candidate
//   //     }
//   //   }

//   //   // Final fallback: click via DOM query by text (no waiting)
//   //   const clicked = await this.page.evaluate(() => {
//   //     const text = "Sign up here";
//   //     const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
//   //     while (walker.nextNode()) {
//   //       const el = walker.currentNode;
//   //       if (el.innerText && el.innerText.includes(text)) {
//   //         try { el.click(); return true; } catch (e) { return false; }
//   //       }
//   //     }
//   //     return false;
//   //   });

//   //   if (!clicked) throw new Error('Unable to find or click the Sign up element');
//   // }

//   async fillResidentDetails(userData) {
//     await this.directorCard.click();
//     await this.page.waitForURL('**/director'); // Use glob pattern for flexibility

//     await this.smartFill(this.firstNameInput, userData.firstName);
//     await this.smartFill(this.lastNameInput, userData.lastName);
//     await this.smartFill(this.emailInput, userData.email);
//     await this.smartFill(this.phoneInput, userData.phone);
//     await this.smartFill(this.passwordInput, userData.password);
//     await this.smartFill(this.confirmPasswordInput, userData.confirmPassword);

//     // STABILITY FIX: Wait for navigation to OTP method selection
//     await this.clickAndNavigate(() => this.nextButton.click({ force: true }), this.verificationMethodCard);
        
//     // Give the card a moment to be clickable
//     await this.page.waitForTimeout(5000);
//     await this.verificationMethodCard.click({ force: true });

//     await this.page.waitForURL('**/otp');
//   }

//   async verifyEmail(userData) {
//         // Ensure first OTP box is ready
//         await this.otpInputs[0].waitFor({ state: 'visible' });
//         for (let i = 0; i < 6; i++) {
//             await this.smartFill(this.otpInputs[i], userData.otp[i]);
//         }
//         await this.postcodeInput.waitFor({ state: 'visible', timeout: 15000 });
//   }

//   async fillPostcode(userData) {
//     await this.waitForLoader();

//     await this.smartFill(this.postcodeInput, userData.postcode);
//     await this.clickAndNavigate(() => this.findAddressButton.click({ force: true }), this.selectAddressDropdown);

//     await this.page.waitForURL('**/address');

//     // 1. Click the dropdown trigger
//     await this.selectAddressDropdown.click({ force: true });
//         const allOptions = this.page.getByRole('option');
        
//         try {
//             await allOptions.first().waitFor({ state: 'visible', timeout: 15000 });
//         } catch (e) {
//             // Re-click if it didn't open
//             await this.selectAddressDropdown.click({ force: true });
//             await allOptions.first().waitFor({ state: 'visible', timeout: 10000 });
//         }

//       const count = await allOptions.count();
//       const index = count > 3 ? 5 : 0;
//       await allOptions.nth(index).click({ force: true });

//       await this.clickAndNavigate(() => this.continueWithSelectedAddressButton.click({ force: true }), this.yearsTrading);

//       //await this.page.waitForURL('**/details');
//   }

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

//   async fillBlockDetails(userData) {
//     await this.waitForLoader();

//     await this.smartFill(this.blockNameInput,userData.blockName);
//     await this.smartFill(this.noOfUnitsInput, userData.noOfUnits);
//     await this.smartFill(this.currentManagingAgentInput, userData.currentManagingAgent);
//     // await this.numberOfBlocksDropdown.selectOption({ label: userData.numberOfBlocks });
//     await this.numberOfBlocksDropdown.click({force:true});
//     const listbox1 = this.page.getByRole('listbox').nth(2).click();
//     // await listbox1.waitFor({ state: 'visible' });
//     // await this.selectListboxOption(listbox1, userData.numberOfBlocks);
//     // await this.yearBuiltDropdown.selectOption({ label: userData.yearBuilt });
//     await this.yearBuiltDropdown.click({force: true});
//     const listbox2 = this.page.getByRole('listbox').nth(3).click();
//     // await listbox2.waitFor({ state: 'visible' });
//     // await this.selectListboxOption(listbox2, userData.yearBuilt);
//     await this.clickAndNavigate(() => this.nextButton.click({ force: true }), this.managementFeeInput);

//     //await this.page.waitForURL('**/budget');
//   }

//   async fillBudgetDetails(userData) {
//     await this.waitForLoader();

//     await this.smartFill(this.managementFeeInput,userData.managementFee);
//     await this.smartFill(this.cosecFeeInput, userData.cosecFee);
//     await this.smartFill(this.accountingFeeInput, userData.accountingFee);
//     await this.confirmButton.click({force:true});
//     await this.page.locator('text=/Thank You for Providing Your Budget/i').waitFor({ state: 'visible', timeout: 15000 });

//     await this.clickAndNavigate(() => this.confirmButton.click({ force: true }), this.leasehold1);
//     //await this.page.waitForURL('**/leaseholder');
//   }

//   async selectPropertyDetails(userData) {
//     await this.waitForLoader();

//     const leaseholdPref = userData.leaseholdPreference;
//     const leaseholdCard = leaseholdPref === 'Converted House' ? this.leasehold1 :
//                           leaseholdPref === 'Purpose Built Flat' ? this.leasehold2 : this.leasehold3;
                           
//     await this.clickAndNavigate(()=> leaseholdCard.click({force: true}), this.buildingHeight1);

//     //await this.page.waitForURL('**/buildings');

//     const buildingHeightPref = userData.buildingHeightPreference;
//     const buildingHeightCard = buildingHeightPref === 'Below 11m' ? this.buildingHeight1 :
//                                buildingHeightPref === '11m - 18m' ? this.buildingHeight2 : 
//                                buildingHeightPref === 'Above 18m' ? this.buildingHeight3: this.buildingHeight4;

//     await this.clickAndNavigate(()=>buildingHeightCard.click({force:true}),this.blockCondition1);

//     //await this.page.waitForURL('**/blocks');

//     //await this.blockConditionCard.click();

//     const blockConditionPref = userData.blockConditionPreference;
//     const blockConditionCard = blockConditionPref === 'Excellent' ? this.blockCondition1 :
//                                blockConditionPref === 'Good' ? this.blockCondition2 : 
//                                blockConditionPref === 'Fair' ? this.blockCondition3: this.blockCondition4;

//     await this.clickAndNavigate(()=>blockConditionCard.click({force:true}),this.outdoorSpace1);

//     //await this.page.waitForURL('**/spaces');

//     //await this.outdoorSpacesCard.click();

//     const outdoorSpacePref = userData.outdoorSpacePreference;
//     const outdoorSpaceCard = outdoorSpacePref === 'Large Shared Space' ? this.outdoorSpace1 :
//                                outdoorSpacePref === 'Some' ? this.outdoorSpace2 : this.outdoorSpace3 ;

//     await this.clickAndNavigate(()=>outdoorSpaceCard.click({force:true}),this.blockCondition1);

//     // await this.page.waitForURL('**/priorities');

//   }
// }

//   // async dragAllPrioritiesAndNext(sources, targets, method = 'dragTo') {
//   //   // allow single options object: { sources, targets, method }
//   //   if (arguments.length === 1 && typeof sources === 'object' && !Array.isArray(sources)) {
//   //     const opts = sources;
//   //     sources = opts.sourceLocators || opts.sources || opts.source || [];
//   //     targets = opts.targetLocators || opts.targets || opts.target || [];
//   //     method = opts.method || method;
//   //   }

//   //   if (!Array.isArray(sources) || !Array.isArray(targets) || sources.length !== targets.length) {
//   //     throw new Error('sources and targets must be arrays of equal length');
//   //   }

//   //   // Check page state before starting
//   //   if (this.page.isClosed && this.page.isClosed()) {
//   //     throw new Error('Page is already closed before starting drag operations');
//   //   }

//   //   console.log(`Starting drag operations for ${sources.length} items...`);
//   //   console.log('Current page URL:', this.page.url());
    
//   //   const results = [];
//   //   for (let i = 0; i < sources.length; i++) {
//   //     const srcSel = sources[i];
//   //     const dstSel = targets[i];
//   //     const src = this.page.locator(srcSel).first();
//   //     const dst = this.page.locator(dstSel).first();

//   //     console.log(`\n--- Processing Drag ${i + 1}/7 ---`);
//   //     console.log(`Drag ${i}: Page URL before operation:`, this.page.url());

//   //     // Check page state
//   //     if (this.page.isClosed && this.page.isClosed()) {
//   //       throw new Error(`Page closed during drag operation ${i + 1}/7`);
//   //     }

//   //     try {
//   //       // Wait for elements to be visible
//   //       console.log(`Drag ${i}: Waiting for source element to be visible...`);
//   //       await src.waitFor({ state: 'visible', timeout: 5000 });
        
//   //       console.log(`Drag ${i}: Waiting for target element to be visible...`);
//   //       await dst.waitFor({ state: 'visible', timeout: 5000 });
        
//   //       // Get source text for logging
//   //       let srcText = '';
//   //       try { srcText = (await src.innerText()).trim(); } catch (e) { srcText = ''; }
//   //       console.log(`Drag ${i}: Source text: "${srcText}"`);

//   //       // Check if source is still in DOM and visible
//   //       const srcVisible = await src.isVisible().catch(() => false);
//   //       const dstVisible = await dst.isVisible().catch(() => false);
//   //       console.log(`Drag ${i}: Source visible: ${srcVisible}, Target visible: ${dstVisible}`);

//   //       if (!srcVisible || !dstVisible) {
//   //         throw new Error(`Source visible: ${srcVisible}, Target visible: ${dstVisible}`);
//   //       }

//   //       // Scroll elements into view
//   //       console.log(`Drag ${i}: Scrolling elements into view...`);
//   //       await src.scrollIntoViewIfNeeded();
//   //       await dst.scrollIntoViewIfNeeded();
//   //       await this.page.waitForTimeout(200);

//   //       // Perform simple drag operation
//   //       console.log(`Drag ${i}: Performing dragTo operation...`);
//   //       await src.dragTo(dst, { timeout: 8000 });
        
//   //       // Brief pause for UI update
//   //       await this.page.waitForTimeout(200);
        
//   //       // Verify drag was successful by checking if source is still visible
//   //       const srcStillVisible = await src.isVisible().catch(() => false);
//   //       console.log(`Drag ${i}: Source still visible after drag: ${srcStillVisible}`);
        
//   //       console.log(`✓ Drag ${i}: Successfully dragged and dropped (${srcText})`);
//   //       results.push({ index: i, success: true });
        
//   //     } catch (err) {
//   //       console.error(`✗ Drag ${i}: Failed - ${err.message}`);
        
//   //       // Additional debugging for failed drags
//   //       try {
//   //         const pageUrl = this.page.url();
//   //         console.error(`Drag ${i}: Current page URL: ${pageUrl}`);
          
//   //         const srcVisible = await src.isVisible().catch(() => false);
//   //         const dstVisible = await dst.isVisible().catch(() => false);
//   //         console.error(`Drag ${i}: Final visibility check - Source: ${srcVisible}, Target: ${dstVisible}`);
          
//   //         // Take screenshot for debugging
//   //         const screenshotPath = `drag-failure-${i + 1}-${Date.now()}.png`;
//   //         await this.page.screenshot({ path: screenshotPath, fullPage: false });
//   //         console.error(`Drag ${i}: Screenshot saved: ${screenshotPath}`);
//   //       } catch (debugErr) {
//   //         console.error(`Drag ${i}: Debug info failed: ${debugErr.message}`);
//   //       }
        
//   //       results.push({ index: i, success: false, error: err.message });
        
//   //       // If page closed, throw immediately
//   //       if (this.page.isClosed && this.page.isClosed()) {
//   //         throw new Error(`Page closed during drag operation ${i + 1}/7`);
//   //       }
//   //     }
//   //   }

//   //   // Print summary
//   //   console.log('\n========== DRAG AND DROP SUMMARY ==========');
//   //   const successful = results.filter(r => r.success);
//   //   const failed = results.filter(r => !r.success);
//   //   console.log(`Total Items: ${results.length}`);
//   //   console.log(`Successful: ${successful.length}`);
//   //   console.log(`Failed: ${failed.length}`);
    
//   //   if (failed.length > 0) {
//   //     console.error('Failed items:');
//   //     failed.forEach(f => {
//   //       console.error(`  - Item ${f.index}: ${f.error}`);
//   //     });
//   //     throw new Error(`${failed.length} drag operations failed`);
//   //   }

//   //   // Verify all priorities were successfully dragged and dropped
//   //   console.log('✓ All 7 priorities have been correctly dragged and dropped. Proceeding to click Next...');
//   //   console.log('==========================================\n');

//   //   // Check page state before clicking Next
//   //   if (this.page.isClosed && this.page.isClosed()) {
//   //     throw new Error('Page closed before clicking Next button after drag operations');
//   //   }

//   //   // Click Next button
//   //   // console.log('Clicking Next button...');
//   //   // await this.nextButton.click();

//   //   //Wait for page navigation - prioritize textarea visibility over URL matching
//   //   // console.log('Waiting for page to load and textareas to appear...');
//   //   // try {
//   //   //   // Wait for textareas to appear on the open-ended questions page
//   //   //   await this.openEndedTitle.waitFor({ state: 'visible', timeout: 15000 });
//   //   //   console.log('✓ Successfully navigated to open-ended questions page. Textareas are visible.');
//   //   // } catch (e) {
//   //   //   console.warn('Textareas not immediately visible after clicking Next. Waiting for page load...');
//   //   //   // If textareas not visible, wait for page load and try again
//   //   //   await this.page.waitForLoadState('networkidle').catch(() => null);
//   //   //   try {
//   //   //     await this.openEndedTitle.scrollIntoViewIfNeeded();
//   //   //     await this.openEndedTitle.waitFor({ state: 'visible', timeout: 10000 });
//   //   //     console.log('✓ Textareas found after page load.');
//   //   //   } catch (retryErr) {
//   //   //     console.warn('Could not confirm textarea visibility:', retryErr.message);
//   //   //   }
//   //   // }

//   //   return results;
//   // }

//   // async fillOpenEndedQuestions(userData) {

//     // // Validate responses early
//     // if (!userData || !Array.isArray(userData.openEndedResponses) || userData.openEndedResponses.length < 3) {
//     //   throw new Error('Missing openEndedResponses or insufficient responses (need 3)');
//     // }

//     // // Check if page is still open before starting
//     // if (this.page.isClosed && this.page.isClosed()) {
//     //   throw new Error('Page is already closed before filling open-ended questions');
//     // }

//     // try {
//     //   console.log('fillOpenEndedQuestions: Waiting for page to load...');
//     //   // Wait for page to finish loading
//     //   await this.page.waitForLoadState('networkidle').catch(() => null);
      
//     //   // Check page state after waiting for load state
//     //   if (this.page.isClosed && this.page.isClosed()) {
//     //     throw new Error('Page closed while waiting for load state');
//     //   }
      
//     //   console.log('fillOpenEndedQuestions: Waiting for textareas...');
      
//     //   // Wait for each textarea to be visible before filling
//     //   for (let i = 0; i < 3; i++) {
//     //     // Check page state before each textarea operation
//     //     if (this.page.isClosed && this.page.isClosed()) {
//       //     throw new Error(`Page closed before filling textarea ${i + 1}`);
//       //   }

//       //   const ta = [this.textInputs1, this.textInputs2, this.textInputs3][i];
//       //   const taName = `textarea[name="${i + 1}"]`;
//       //   console.log(`Waiting for ${taName}...`);
        
//       //   // First wait for element to be in DOM (even if hidden)
//       //   await ta.waitFor({ state: 'attached', timeout: 8000 });
        
//       //   // Check page state after element attachment
//       //   if (this.page.isClosed && this.page.isClosed()) {
//       //     throw new Error(`Page closed after textarea ${i + 1} attachment`);
//       //   }
        
//       //   // Then scroll into view and wait for visibility
//       //   await ta.scrollIntoViewIfNeeded();
//       //   await ta.waitFor({ state: 'visible', timeout: 8000 });
        
//       //   // Check page state before filling
//       //   if (this.page.isClosed && this.page.isClosed()) {
//       //     throw new Error(`Page closed before filling textarea ${i + 1}`);
//       //   }
        
//       //   await ta.fill(userData.openEndedResponses[i]);
//       //   console.log(`Filled textarea ${i + 1}`);
//       // }

//       // console.log('fillOpenEndedQuestions: Clicking Go to Dashboard...');
      
//       // // Check page state before clicking dashboard button
//       // if (this.page.isClosed && this.page.isClosed()) {
//       //   throw new Error('Page closed before clicking Go to Dashboard button');
//       // }
      
//       // // Click Go to Dashboard (non-blocking URL wait)
//       // await Promise.all([
//       //   this.page.waitForURL('**/thank-you', { timeout: 8000 }).catch(() => null),
//       //   this.goToDashboardButton.click()
//       // ]);

//       // console.log('fillOpenEndedQuestions: Waiting for final confirmation...');
      
//       // // Check page state before final confirmation
//       // if (this.page.isClosed && this.page.isClosed()) {
//       //   throw new Error('Page closed before final confirmation step');
//       // }
      
//       // // Final confirmation with shorter timeout
//       // try {
//       //   await this.page.locator('text=/Thank You – You Are All Set!/i').waitFor({ state: 'visible', timeout: 8000 });
//       //   await this.okButton.click();
//       //   await this.page.waitForURL('**/dashboard', { timeout: 8000 });
//       // } catch (e) {
//       //   console.warn('Final confirmation text not found (may be OK):', e.message);
//       // }
      
//       // console.log('fillOpenEndedQuestions: Complete');

//   //   } catch (err) {
//   //     // Only check page closure if it's not already the error we're throwing
//   //     if (!err.message.includes('Page closed')) {
//   //       if (this.page.isClosed && this.page.isClosed()) {
//   //         throw new Error('Page closed during open-ended questions');
//   //       }
//   //     } else {
//   //       throw err; // Re-throw our custom page closed errors
//   //     }
      
//   //     // Provide additional diagnostics
//   //     let diagnostics = '';
//   //     try {
//   //       const url = this.page.url();
//   //       diagnostics = ` Current URL: ${url}.`;
//   //     } catch (e) {}
      
//   //     console.error('fillOpenEndedQuestions error:', err.message, diagnostics);
//   //     throw new Error(`Failed to fill open-ended questions: ${err.message}${diagnostics}`);
//   //   }

//   // }

// module.exports = RmcSignupPage;


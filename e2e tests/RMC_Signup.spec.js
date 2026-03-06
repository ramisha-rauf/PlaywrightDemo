const { test, expect } = require('@playwright/test');
const RmcSignupPage = require('../pages/RMC_OnboardingPage');
const LoginPage = require('../pages/loginPage');
const DirectorVerificationPage = require('../pages/RMC_DirectorVerificationPage');

test("Verify RMC application signup", async ({ page }) => {
    // 1. Increase Timeout - Onboarding is a long process
    test.setTimeout(120000);

    const rmcSignupPage=new RmcSignupPage(page);

    const loginPage = new LoginPage(page);

    const directorVerificationPage = new DirectorVerificationPage(page);

    // 1. Initial Entry: Login
    await loginPage.RMCloginToApplication('ramisha_rauf+264@strategisthub.com', 'Henry@12');
    await page.waitForLoadState('networkidle');

    if(page.url().includes('/dashboard')){

        const completeSetupBtn = page.getByRole('button', { name: 'Complete Sign Up' });

        await completeSetupBtn.waitFor({ state: 'visible' });
        
        await completeSetupBtn.click();

        await page.waitForURL('**/postcode', { timeout: 10000 }).catch(() => {}); 

    } else if (page.url().includes('/login') || page.url().includes('/director')) {

        console.log("Status: New User or Unverified. Starting Fresh Signup...");

        await rmcSignupPage.goto();

        await rmcSignupPage.fillResidentDetails({
            firstName: 'Abdul Azim',
            lastName: 'AHMED IBRAHIM',
            email: 'ramisha_rauf+264@strategisthub.com',
            phone: '07123456789',
            password: 'Henry@12',
            confirmPassword: 'Henry@12'
    });

        await rmcSignupPage.verifyEmail({
            otp: '123456'
        });
    }

    // --- STEP 3: POSTCODE ---

    if (page.url().includes('/postcode') || page.url().includes('/address')) {
        console.log("Status: Filling Postcode...");
        await rmcSignupPage.fillPostcode({ postcode: 'GU15 1LQ' });
    }

    // --- STEP 4: BLOCK DETAILS---
    
    await page.waitForURL('**/details', { timeout: 15000 }).catch(() => {});
    if (page.url().includes('/details')) {
        console.log("Status: Filling Block Details...");
        await rmcSignupPage.fillBlockDetails({
            blockName: 'Township',
            noOfUnits: '280',
            currentManagingAgent: 'Oscar'
        });
    }

    // --- STEP 5: BUDGET ---

    await page.waitForURL(url => url.href.includes('budget') || url.href.includes('form'), { timeout: 10000 }).catch(() => {});
    if (page.url().includes('/budget')) {
        console.log("Status: Filling Budget Details...");
        await rmcSignupPage.fillBudgetDetails({
        managementFee : '210',
        cosecFee : '310',
        accountingFee : '420'
    })
    }

    // --- STEP 6: Property Details ---

    await page.waitForURL('**/leaseholder', { timeout: 10000 }).catch(() => {});
    if (page.url().includes('/leaseholder')) {
        console.log("Status: Setting Property Details...");
        await rmcSignupPage.selectPropertyDetails({
            leaseholdPreference: 'Converted House',
            buildingHeightPreference: 'Above 18m',
            blockConditionPreference: 'Excellent',
            outdoorSpace: 'Large'
        });
    }

    await page.waitForURL('**/priorities', { timeout: 10000 }).catch(() => {});
    if(page.url().includes('/priorities')){
        console.log("Status: Setting Priorities");
        rmcSignupPage.dragAllPrioritiesAndNext();
    }

    await page.waitForURL('**/open', { timeout: 10000 }).catch(() => {});
    if(page.url().includes('/open')){
        console.log('Status: Filling Open Ended Questions');
        rmcSignupPage.fillOpenEndedQuestions({
            openEndedResponses:[
                'The most significant hurdle with our current management has been a persistent "communication black hole," where resident queries and Director emails often go unacknowledged for business weeks, forcing volunteer board members to act as intermediaries. This lack of responsiveness is coupled with a "reactive maintenance trap," where issues like communal lighting failures or gate malfunctions are only addressed after they are reported by frustrated residents, rather than being identified during routine professional site inspections. Furthermore, we have experienced considerable "financial fog" due to the late delivery of year-end accounts and a general lack of transparency regarding the status of the reserve fund, which makes it nearly impossible for the Board to make informed, long-term decisions for the estate.',
                'In transitioning to a new agent, we are looking for a shift toward "proactive stewardship" that prioritizes the long-term health of the building over short-term "firefighting." We expect a management style defined by a strict Service Level Agreement (SLA) that guarantees a 24-hour acknowledgement of all queries, ensuring that residents feel their concerns are being professionally managed. Additionally, we want to see a strategic approach to the building’s finances, specifically the development of a 10-year Planned Preventative Maintenance (PPM) schedule. This will allow us to anticipate major capital expenditure and build a sufficient sinking fund, ultimately protecting the propertys value and preventing the "special levy" shocks that cause distress to leaseholders.',
                'To modernize the way our block is managed, we believe the implementation of a real-time financial dashboard is essential, allowing Directors to view live bank balances and current expenditure against the budget at any time. Transparency would be further enhanced by a digital maintenance tracking system, where residents can see the live status of a repair—from the initial instruction of a contractor to the final completion—without needing to call the office for updates. Finally, a centralized "Compliance Vault" for all statutory documents, such as Fire Risk Assessments, EICRs, and insurance policies, would ensure that the RMC is always audit-ready and that critical health and safety data is accessible 24/7 for total peace of mind.'
            ]
        })
    }

    await page.waitForURL('**/dashboard',{timeout:10000}).catch(()=>{});
    if(page.url().includes('/dashboard')){

        const completeSetupBtn = page.getByRole('button', { name: 'Complete Sign Up' });

        await completeSetupBtn.waitFor({ state: 'hidden' });

        console.log('RMC SIGNUP DONE');
    }

});




// const {test,expect} = require('@playwright/test');

// const SignupPage = require('../pages/signupPage');

// const LoginPage = require('../pages/loginPage');

// test("Verify application signup",async({page})=>{
//     test.setTimeout(120000); // Increase timeout to 2 minutes

//     const signupPage=new SignupPage(page);

//     const loginPage=new LoginPage(page);

//     await loginPage.loginToApplication('ramisha_rauf+230@strategisthub.com', 'Henry@12');

//     await expect(page).toHaveURL('https://rmc.strategisthubpro.com/dashboard', { timeout: 15000 });

//     await page.getByRole('button', { name: 'Complete Sign Up' }).click();

//     await expect(page).toHaveURL('https://rmc.strategisthubpro.com/priorities');

//     await signupPage.goto();

//     await signupPage.fillResidentDetails({
//         firstName: 'Carlos Miguel Cavaco Vicente',
//         lastName: 'DE AZEVEDO',
//         email: 'ramisha_rauf+230@strategisthub.com',
//         phone: '07123456789',
//         password: 'Henry@12',
//         confirmPassword: 'Henry@12'
//     });

//     await signupPage.verifyEmail({
//         otp: '123456' 
//     });

 
    

//     // await signupPage.dragElement({
//     //     sourceLocator: "//p[normalize-space()='Clearer Communication']",
//     //     targetLocator: "//img[@alt='11m - 18m Typically 4 to 5 floors ']"

//     // })

//     // await signupPage.dragMultipleItemsToBoxes({
//     //     sourceLocators: [
//     //         "//p[normalize-space()='Clearer Communication']",
//     //         "//p[normalize-space()='Saving Money']",
//     //         "//p[normalize-space()='Proactive Management']",
//     //         "//p[normalize-space()='Higher Standards']",
//     //         "//p[normalize-space()='Better Problem Solving']",
//     //         "//p[normalize-space()='Clearer Financial Reporting']",
//     //         "//p[normalize-space()='Being Involved']"
//     //     ],
//     //     targetLocators: [
//     //         "span:has-text('1')",
//     //         "span:has-text('2')",
//     //         "span:has-text('3')",
//     //         "span:has-text('4')",
//     //         "span:has-text('5')",
//     //         "span:has-text('6')",
//     //         "span:has-text('7')"
//     //     ],
//     //     method: 'dragTo' 
//     // });

//     // async function verifyDragAndDrop() {
//     //     const target1 = await page.locator("span:has-text('1')");
//     //     const target2 = await page.locator("span:has-text('2')");
//     //     const target3 = await page.locator("span:has-text('3')");
//     //     const target4 = await page.locator("span:has-text('4')");
//     //     const target5 = await page.locator("span:has-text('5')");
//     //     const target6 = await page.locator("span:has-text('6')");
//     //     const target7 = await page.locator("span:has-text('7')");

//     //     await expect(target1).toContainText('Clearer Communication');
//     //     await expect(target2).toContainText('Saving Money');
//     //     await expect(target3).toContainText('Proactive Management');
//     //     await expect(target4).toContainText('Higher Standards');
//     //     await expect(target5).toContainText('Better Problem Solving');
//     //     await expect(target6).toContainText('Clearer Financial Reporting');
//     //     await expect(target7).toContainText('Being Involved');
//     // }

//     //await verifyDragAndDrop();

//   //   await signupPage.dragAllPriorities({

//   //   sourceLocators: [

//   //   "//p[normalize-space()='Clearer Communication']",
//   //   "//p[normalize-space()='Saving Money']",
//   //   "//p[normalize-space()='Proactive Management']",
//   //   "//p[normalize-space()='Higher Standards']",
//   //   "//p[normalize-space()='Better Problem Solving']",
//   //   "//p[normalize-space()='Clearer Financial Reporting']",
//   //   "//p[normalize-space()='Being Involved']"

//   // ],

//   //   targetLocators: [
//   //     "//div[contains(@class,'mt-24')]/div[1]/div[1]",
//   //     "//div[contains(@class,'mt-24')]//div[2]/div[1]",
//   //     "//div[contains(@class,'mt-24')]//div[3]/div[1]",
//   //     "//div[contains(@class,'mt-24')]//div[4]/div[1]",
//   //     "//div[contains(@class,'mt-24')]//div[5]/div[1]",
//   //     "//div[contains(@class,'mt-24')]//div[6]/div[1]",
//   //     "//div[contains(@class,'mt-24')]//div[7]/div[1]"
//   //   ],
//   //   method: 'mouse'
    
//   // });
  
//  // await expect(page).toHaveURL('https://rmc.strategisthubpro.com/open');

  

//   await signupPage.fillOpenEndedQuestions({
//       openEndedResponses: [
//           'Response to question 1',
//           'Response to question 2',
//           'Response to question 3'
//         ]
//     });

// });


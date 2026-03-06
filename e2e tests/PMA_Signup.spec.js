const { test, expect } = require('@playwright/test');
const path = require('path')
const PmaSignupPage = require('../pages/PMA_SignupPage');
const LoginPage = require('../pages/loginPage');

test("Verify PMA application signup", async ({ page }) => {
    // 1. Increase Timeout - Onboarding is a long process
    test.setTimeout(120000);

    const pmaSignupPage=new PmaSignupPage(page);

    const loginPage = new LoginPage(page);

    // 1. Initial Entry: Login
    await loginPage.PMAloginToApplication('ramisha_rauf+255@strategisthub.com', 'Henry@12');
    await page.waitForLoadState('networkidle');

    if(page.url().includes('/dashboard')){

        const completeSetupBtn = page.getByRole('button', { name: 'Complete Setup' });

        await completeSetupBtn.waitFor({ state: 'visible' });
        
        await completeSetupBtn.click();

        await page.waitForURL('**/locationcode', { timeout: 10000 }).catch(() => {}); 

    } else if (page.url().includes('/login') || page.url().includes('/company')) {

        console.log("Status: New User or Unverified. Starting Fresh Signup...");

        await pmaSignupPage.goto();

        await pmaSignupPage.fillCompanyDetails({
            companyName: 'Savills Management',
            companyWebsite: 'https://www.savills-managemnt.com',
            companyLandline: '0123456789',
            fullName: 'Alexander',
            mobileNumber: '07123456789',
            email: 'ramisha_rauf+255@strategisthub.com',
            password: 'Henry@12',
            confirmPassword: 'Henry@12'
    });

        await pmaSignupPage.verifyEmail({
            otp: '123456'
        });
    }

    // --- STEP 3: POSTCODE ---

    if (page.url().includes('/locationcode') || page.url().includes('/pinlocation')) {
        console.log("Status: Filling Postcode...");
        await pmaSignupPage.fillPostcode({ postcode: 'GU15 1LQ' });
    }

    // --- STEP 4: BUSINESS PROFILE ---
    
    await page.waitForURL('**/business-profile', { timeout: 15000 }).catch(() => {});
    if (page.url().includes('/business-profile')) {
        console.log("Status: Filling Business Details...");
        await pmaSignupPage.fillBusinessProfile({
            yearsTrading: '12',
            totalUnits: '1980',
            unitsPerAccountManager: '120',
            secondaryFullName: 'Benjamin',
            secondaryEmail: 'benjamin_09@gmail.com',
            secondaryPhone: '07123456789',
            secondaryLandline: '0123456789'
        });
    }

    // --- STEP 5: REVIEWS ---

    await page.waitForURL(url => url.href.includes('reviews') || url.href.includes('form'), { timeout: 10000 }).catch(() => {});
    if (page.url().includes('/google-reviews') || page.url().includes('/reviews-form') || page.url().includes('/trustpilot-reviews') || page.url().includes('/trustpilot-form')) {
        console.log("Status: Filling Reviews...");
        await pmaSignupPage.fillGoogleReviews({ averageRating: '4.9', numberOfReviews: '80' });
        await pmaSignupPage.fillTrustpilotReviews({ averageRating: '3.3', numberOfReviews: '440' });
    }

    // --- STEP 6: NOTIFICATIONS ---

    await page.waitForURL('**/email-notification', { timeout: 10000 }).catch(() => {});
    if (page.url().includes('/email-notification')) {
        console.log("Status: Setting Preferences...");
        await pmaSignupPage.fillEmailNotificationPreference({ emailNotificationPreference: 'Primary User' });
    }

    // --- STEP 7: MANAGEMENT FEES ---

    await page.waitForURL('**/management', { timeout: 10000 }).catch(() => {});
    if (page.url().includes('/management')) {
        console.log("Status: Setting Fee Range...");
        await pmaSignupPage.fillManagementFee({
            minimumManagementFeePerUnit: '150',
            maximumManagementFeePerUnit: '460'
        });
    }

    // --- STEP 8: PROFILE SETUP ---
   
    await page.waitForURL('**/company-details', { timeout: 3000 }).catch(() => {});
    if (page.url().includes('/company-details')) {
        console.log("Status: Uploading Logo and Bio...");
        await pmaSignupPage.fillCompanyProfileSetup({
            companyLogo: 'C:/Users/user/Desktop/SMSC - Playwright Automation/test-data/company-logo.png',
            companyBio: 'We are a leading property management company...'
        });
    }

    // --- STEP 9: FINAL SKIP ---

    await page.waitForURL('**/location-form', { timeout: 10000 }).catch(() => {});
    if (page.url().includes('/location-form')) {
        console.log("Status: Skipping Branch Setup...");
        await pmaSignupPage.skipLocationSetup();
        console.log("PMA Onboarding Complete")
    }
});


// const {test,expect} = require('@playwright/test');

// const PmaSignupPage = require('../pages/pmaSignupPage');

// const LoginPage = require('../pages/loginPage');

// test("Verify PMA application signup",async({page})=>{

//     const pmaSignupPage=new PmaSignupPage(page);

//     const loginPage = new LoginPage(page);

//     // 1. Initial Entry: Login
//     await loginPage.PMAloginToApplication('ramisha_rauf+252@strategisthub.com', 'Henry@12');
//     await page.waitForLoadState('networkidle');

//     if(page.url().includes('/dashboard')){

//         const completeSetupBtn = page.getByRole('button', { name: 'Complete Setup' });

//         await completeSetupBtn.waitFor({ state: 'visible' });
        
//         await completeSetupBtn.click();

//         await page.waitForURL('**/locationcode', { timeout: 10000 }).catch(() => {}); 

//         //await expect(page).toHaveURL('https://pma.strategisthubpro.com/company-details');

//     } else if (page.url().includes('/login') || page.url().includes('/company')) {

//         console.log("Status: New User or Unverified. Starting Fresh Signup...");

//         await pmaSignupPage.goto();

//         await pmaSignupPage.fillCompanyDetails({
//             companyName: 'National',
//             companyWebsite: 'https://www.national.com',
//             companyLandline: '0123456789',
//             fullName: 'David Arthur',
//             mobileNumber: '07123456789',
//             email: 'ramisha_rauf+25@strategisthub.com',
//             password: 'Henry@12',
//             confirmPassword: 'Henry@12'
//     });

//         await pmaSignupPage.verifyEmail({
//             otp: '123456'
//         });
//     }

//     if (page.url().includes('/locationcode') || page.url().includes('/pinlocation')) {
//         console.log("Status: At Location Setup. Filling Postcode...");
        
//         await pmaSignupPage.fillPostcode({
//             postcode: 'GU15 1LQ'
//         //addressLabel: 'Cafe On The Hill, 91 Brixton Hill, London SW2 1AA'
//         });
//     }

//     if (page.url().includes('/business-profile')) {
//         console.log("Status: At Business Profile Setup. Filling Business Details...");

//         await pmaSignupPage.fillBusinessProfile({
//             yearsTrading: '9',
//             totalUnits:'2250',
//             unitsPerAccountManager:'400',
//         //  contactPreference:'Mobile',
//             secondaryFullName:'Robinson',
//             secondaryEmail:'robinnn_77@gmail.com',
//             secondaryPhone:'07123456789',
//             secondaryLandline:'0123456789'

//         });
//     }

//     if (page.url().includes('/google-reviews') || page.url().includes('/reviews-form') || page.url().includes('/trustpilot-reviews') || page.url().includes('/trustpilot-form')) {

//         console.log("Status: At Reviews Setup. Filling Google and Trustpilot Reviews...");

//         await pmaSignupPage.fillGoogleReviews({
//         averageRating:'2.3',
//         numberOfReviews:'160'
//         });

//     await pmaSignupPage.fillTrustpilotReviews({
//         averageRating:'2.8',
//         numberOfReviews:'450'
//         });
//     }

//     if (page.url().includes('/email-notification')) {
//         console.log("Status: At Email Notification Setup. Setting Preferences...");

//         await pmaSignupPage.fillEmailNotificationPreference({
//             emailNotificationPreference:'Both'
//         });
//     }

//     await page.waitForLoadState('networkidle');

//     if (page.url().includes('/management')) {
//         console.log("Status: At Management Fee Setup. Setting Fee Range...");

//         await pmaSignupPage.fillManagementFee({
//             minimumManagementFeePerUnit:'120',
//             maximumManagementFeePerUnit:'349'
//         });
//     }

//     await page.waitForLoadState('networkidle');

//     if (page.url().includes('/company-details')) {
//         console.log("Status: At Company Profile Setup. Uploading Logo and Filling Bio...");

//         await pmaSignupPage.fillCompanyProfileSetup({
//         companyLogo:'C:/Users/user/Desktop/SMSC - Playwright Automation/test-data/company-logo-3.jpg',
//         companyBio:'We are a leading property management company with over 10 years of experience in providing exceptional services to our clients. Our team of dedicated professionals is committed to delivering top-notch property management solutions that cater to the unique needs of each client. We pride ourselves on our attention to detail, proactive approach, and excellent customer service. Our mission is to maximize the value of our clients\' properties while ensuring a seamless and stress-free experience for both property owners and tenants.'

//         });
//     }

//     await page.waitForLoadState('networkidle');

//     if(page.url().includes('/location-form')){
//         console.log("Status: At Location Setup. Skipping Branch Location Setup...");

//         await pmaSignupPage.skipLocationSetup();
//     }
 

// });


//.................................



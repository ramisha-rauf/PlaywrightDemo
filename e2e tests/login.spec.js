const {test,expect}=require('@playwright/test');

test('login test',async({page})=>{
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    //await page.fill('input[name="username"]','Admin');

    await page.getByPlaceholder('Username').type('Admin');
    await page.locator("//input[@placeholder='Password']").type('admin123');

   // await page.fill('input[name="password"]','admin123');

    await page.click('button[type="submit"]');
    await page.waitForSelector('.oxd-userdropdown-name');
    await page.screenshot({path:'login_success.png'});
    await expect(page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');

    await page.waitForTimeout(3000);
    //await page.getByAltText("profile picture").click();
    await page.locator("//img[@class='oxd-userdropdown-img']").click();
    await page.getByText('Logout').click();

    await expect(page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

});

test("Verify invalid credentials",async({page})=>{
    await page.goto('https://rmc.strategisthubpro.com/login');
    console.log(await page.viewportSize().width);
    console.log(await page.viewportSize().height);
    await page.getByPlaceholder('Email').type('ramisha_rauf+165@strategisthub.com')
    await page.getByPlaceholder('Password').type('InvalidPassword123!');

    await page.locator("//button[@type='submit']").click();

    // assert the error message by matching visible text anywhere on the page
    await expect(page.getByText('Invalid credentials', { exact: false })).toBeVisible({ timeout: 7000 });
})

test("Verify tooltip text",async({page})=>{
    await page.goto('https://rmc.strategisthubpro.com/login');

    await page.getByPlaceholder('Email').type('ramisha_rauf+165@strategisthub.com')
    await page.getByPlaceholder('Password').type('Henry@12');

    await page.locator("//button[@type='submit']").click();

    await expect(page).toHaveURL('https://rmc.strategisthubpro.com/dashboard');
    //scroll down to element
    await page.locator("//i[@class='ri-information-line cursor-pointer text-black transition-colors mt-1 ml-2']").scrollIntoViewIfNeeded();
    //click on icon
    await page.locator("//i[@class='ri-information-line cursor-pointer text-black transition-colors mt-1 ml-2']").click();
    // wait for the dialog and assert a few meaningful fragments instead of one long string
    const dialog = page.getByRole('dialog', { name: /About Your Tender Reports/i });
    await expect(dialog).toBeVisible({ timeout: 7000 });
    await expect(dialog.getByText('You can download both key reports', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Blind Tender Report', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Final Tender Report', { exact: false })).toBeVisible();
})

test("verify multiple tabs",async({browser})=>{
    const context=await browser.newContext();
    const page=await context.newPage();

    await page.goto('https://find-and-update.company-information.service.gov.uk/');

    const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            page.locator("//a[@href='http://resurces.companieshouse.gov.uk/legal/termsAndConditions.shtml']").click()

    ])

    await newPage.waitForTimeout(3000);
})
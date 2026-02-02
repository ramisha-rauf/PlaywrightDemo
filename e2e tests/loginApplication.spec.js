const {test, expect}=require('@playwright/test');
const LoginPage=require('../pages/loginPage');
const LogoutPage = require('../pages/logoutPage');


test("Verify application login and logout",async({page})=>{
    const loginPage=new LoginPage(page);
    const logoutPage=new LogoutPage(page);

    await loginPage.loginToApplication('ramisha_rauf+207@strategisthub.com','Henry@12');

    await expect(page).toHaveURL('https://rmc.strategisthubpro.com/dashboard');

    await logoutPage.logoutFromApplication();

    await expect(page).toHaveURL('https://rmc.strategisthubpro.com/login');

})
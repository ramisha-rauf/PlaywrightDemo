class LoginPage 
{
  constructor(page){
    this.page=page;
    this.email=page.getByPlaceholder('Email');
    this.password=page.getByPlaceholder('Password');
    this.loginButton=page.locator('//button[@type="submit"]');
  }
    
    
    // async RMCloginToApplication(emailValue,passwordValue)
    // {
    //   await this.page.goto('https://rmc.strategisthubpro.com/login');
    //   await this.email.fill(emailValue);
    //   await this.password.fill(passwordValue);
    //   await this.loginButton.click();
    //   // optional: wait for a post-login URL or element
    //   //await this.page.waitForURL('**/dashboard');
    // }

    async RMCloginToApplication(emailValue, passwordValue) {
    // Wait for 'commit' instead of the full 'load'
    await this.page.goto('https://rmc.strategisthubpro.com/login', { 
        waitUntil: 'commit', 
        timeout: 60000 // Increased to 60s just in case
    });
    
    // Ensure the email field is ready before typing
    await this.email.waitFor({ state: 'visible', timeout: 15000 });
    
    await this.email.fill(emailValue);
    await this.password.fill(passwordValue);
    await this.loginButton.click();
}

    async PMAloginToApplication(emailValue,passwordValue)
    {
      await this.page.goto('https://pma.strategisthubpro.com/login');
      await this.email.fill(emailValue);
      await this.password.fill(passwordValue);
      await this.loginButton.click();
      // optional: wait for a post-login URL or element
      //await this.page.waitForURL('**/dashboard');
    }
}

module.exports=LoginPage




  // async loginToApplication(emailValue, passwordValue) {
  // const url = 'https://rmc.strategisthubpro.com/login';
  // // Retry navigation a few times and avoid waiting for full 'load'
  // for (let attempt = 0; attempt < 3; attempt++) {
  //   try {
  //     await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  //     break;
  //   } catch (err) {
  //     if (attempt === 2) throw err;
  //     await this.page.waitForTimeout(1000);
  //   }
  // }

  // await this.email.fill(emailValue);
  // await this.password.fill(passwordValue);

  // // Click and wait for navigation to dashboard
  // await Promise.all([
  //   this.page.waitForURL('**/dashboard', { timeout: 15000 }),
  //   this.loginButton.click()
  // ]);
// }
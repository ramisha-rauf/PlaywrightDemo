class LoginPage 
{
  constructor(page){
    this.page=page;
    this.email=page.getByPlaceholder('Email');
    this.password=page.getByPlaceholder('Password');
    this.loginButton=page.locator('//button[@type="submit"]');
  }
    
    
    async loginToApplication(emailValue,passwordValue)
    {
      await this.page.goto('https://rmc.strategisthubpro.com/login');
      await this.email.fill(emailValue);
      await this.password.fill(passwordValue);
      await this.loginButton.click();
      // optional: wait for a post-login URL or element
      //await this.page.waitForURL('**/dashboard');
    }
}

module.exports=LoginPage
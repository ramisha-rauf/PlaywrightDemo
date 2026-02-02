class LogoutPage
{
   constructor(page)
   {
        this.page=page;
        this.profileIcon=page.locator("//*[@id='__next']/body/div[1]/div/div/header/div[1]/div/div[2]/div[3]/span/div");
        this.logoutButton=page.getByText('Sign Out');
   }

   async logoutFromApplication()
   {
      await this.profileIcon.click();
      await this.logoutButton.click();
   }
}

module.exports=LogoutPage;
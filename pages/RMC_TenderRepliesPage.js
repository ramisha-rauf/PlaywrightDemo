const { visible } = require("ansi-colors");
const { timeout } = require("async");
const { name } = require("commander");
const { exact } = require("prop-types");

class RmcTenderReplies{
    constructor(page){
        this.page = page;
        this.tenderRepliesTab = page.locator('a[href="/tender-result"]');

        // this.tenderRow = (tenderId) => page.locator('tr, div[role="row"]').filter({ hasText: tenderId });
        // this.actionBtnById = (tenderId) => this.tenderRow(tenderId).locator('i.ri-eye-line').first();

        this.viewAgentsResponseBtn = page.getByRole('Button',{name:'View Agents Response & Quote'}).first();
        this.managingAgentResponseText = page.locator('h4:has-text("Managing Agent Response")');
        this.shortlistAgentBtn = page.getByRole('Button',{name:'Shortlist Agent'});

        this.confirmYourSelectionTitle = page.locator('h4:has-text("Confirm Your Selection")');
        this.confirmSelectionBtn = page.getByRole('Button',{name:'Confirm Selection'});
        this.shortlistingConfirmedTitle = page.locator('h2:has-text("Shortlisting Confirmed")');
        this.closeBtn = page.getByRole('Button',{name:'Close'});

        this.shortlistedAgentsTitle = page.locator('h2:has-text("Shortlisted Agents")');

    }


  //Shortlist PMAs for your tender

    async shortlistPMAs(){
        await this.tenderRepliesTab.click();
        await this.page.waitForURL('**/tender-result', { timeout: 8000 });

        await this.viewAgentsResponseBtn.scrollIntoViewIfNeeded();
        if(this.viewAgentsResponseBtn.isVisible()){
           await this.viewAgentsResponseBtn.click();
        }
        else {
            throw new Error (`No Data Found in the List`)
        }
        
        await this.managingAgentResponseText.waitFor({state:'visible',timeout:10000});
        await this.shortlistAgentBtn.scrollIntoViewIfNeeded();
        await this.shortlistAgentBtn.click();

        await this.confirmYourSelectionTitle.waitFor({state:'visible',timeout:10000});
        await this.confirmSelectionBtn.click();
        await this.shortlistingConfirmedTitle.waitFor({state:'visible',timeout:10000});
        await this.closeBtn.click();

        await this.page.waitForURL('**/shortlist-agent',{timeout:10000});

        await this.shortlistedAgentsTitle.waitFor({state:'visible',timeout:10000});

        console.log('PMA Shortlisting Done');
        
    }




}

module.exports = RmcTenderReplies;
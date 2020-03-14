const puppeteer = require('puppeteer');
const ips = require('./ip_address')

const action = async (ip) => {
    return new Promise(async (resolve) => {
    
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    try {
        console.log(`Requesting gui for ${ip}`)
        console.log("--------------")

        // Loging in
        await page.goto(`http://${ip}`);
        console.log(`Visiting ${ip}`)
        await page.waitForSelector("#login-box");
        await page.$eval('.gwt-TextBox', el => el.value = 'admin');
        await page.$eval('.gwt-PasswordTextBox', el => el.value = 'NeXT123!'); 
        await page.click('.gwt-Button');
        console.log(`Logging in to ${ip}`)

        await page.waitFor(1000)
        await page.waitForSelector(".feature[name='reboot']");

        // reboot
        await page.click(".feature[name='reboot']");

        await page.waitFor(1000);
        await page.waitForSelector(".command .button.green");

        await page.click(".command .button.green")
        console.log(`Rebooting`)
        console.log("--------------")

        await page.waitFor(3000)
        await browser.close()

        resolve();

    } catch (error) {
        console.log(error)
    }
})
  };
    

 // run loop
  (async () => {
    for (const item of ips){
        await action(item)
    }
  })()


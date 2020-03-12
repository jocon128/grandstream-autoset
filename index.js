const puppeteer = require('puppeteer');
const ips = require('./ip_address')

const configServer = "172.27.0.5/prov";
const firmwareServer = "172.27.0.5/prov";

const action = async (ip) => {
    return new Promise(async (resolve) => {
    
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    try {
        console.log(`Requesting gui for ${ip}`)
        console.log("--------------")

        // Loging
        await page.goto(`http://${ip}`);
        console.log(`Visiting ${ip}`)
        await page.waitForSelector("#login-box");
        await page.$eval('.gwt-TextBox', el => el.value = 'admin');
        await page.$eval('.gwt-PasswordTextBox', el => el.value = 'NeXT123!'); 
        await page.click('.gwt-Button');
        console.log(`Logging in to ${ip}`)

        // Get SIP Details
        await page.waitForSelector(".gwt-HTML");
        await page.waitFor(1000)
        await page.goto(`http://${ip}/#page:account_1_general`)
        await page.waitForSelector("input[name='P35']")
        const SIP = await page.$eval("input[name='P35']", el => el.value)
        console.log(`Device SIP is ${SIP}`)

        // Get MAC address and IP Address
        await page.goto(`http://${ip}/#page:status_network`)
        page.waitForSelector(".pad-Main div:first-child .contents div");
        await page.waitFor(1000)
        const MAC = await page.$eval(".pad-Main div:first-child .contents div", el => el.innerHTML)
        console.log(`Device MAC is ${MAC}`)
        const IP = await page.$eval(".pad-Main div:nth-child(4) .contents div", el => el.innerHTML)
        console.log(`Device IP is ${IP}`)
        
        await page.waitFor(1000);

        // Set hostname to GS-{Room number}
        let ROOM = SIP.substr(2)
        await page.goto(`http://${ip}/#page:network_basic`)
        await page.waitFor(1000)
        await page.waitForSelector("input[name='P146']")
        await page.$eval("input[name='P146']", (el, room) => el.value = `GS-${room}`, ROOM);
        console.log(`Setting hostname to GS-${ROOM}`)

        // save and apply
        await page.click(".row-config.last button:nth-child(2)");
        await page.waitFor(1000);

        // Set update interval, config + firmware server address

        await page.goto(`http://${ip}/#page:maintenance_upgrade`);
        await page.waitForSelector("input[name='P194']")
        await page.waitFor(1000)
        await page.click("input[name='P194'][value='2']")
        await page.waitFor(500)
        await page.click("input[name='P212'][value='1']")
        await page.waitFor(500)
        await page.click("input[name='P6767'][value='1']")
        await page.waitFor(1000)
        await page.$eval("input[name='P237']", (el, configserver) => el.value = configserver, configServer);
        await page.waitFor(1000)
        await page.$eval("input[name='P192']", (el, firmwareserver) => el.value = firmwareserver, firmwareServer);
        await page.waitFor(1000)

        // save and apply
        await page.click(".row-config.last button:nth-child(2)");
        console.log(`Set firmware and config server`)

        await page.waitFor(1000)

        // Navigate to home
        await page.goto(`http://${ip}`);
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


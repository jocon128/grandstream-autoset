const puppeteer = require("puppeteer");
const ips = require("./ip_address");
const fs = require("fs");

const action = async ip => {
  return new Promise(async resolve => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
      console.log(`Requesting gui for ${ip}`);
      console.log("--------------");

      // Loging
      await page.goto(`http://${ip}`, { timeout: "10000" });
      console.log(`Visiting ${ip}`);
      await page.waitForSelector("#login-box");
      await page.$eval(".gwt-TextBox", el => (el.value = "admin"));
      await page.$eval(".gwt-PasswordTextBox", el => (el.value = "NeXT123!"));
      await page.click(".gwt-Button");
      console.log(`Logging in to ${ip}`);

      // Get SIP Details
      await page.waitForSelector(".gwt-HTML");
      await page.waitFor(1000);
      await page.goto(`http://${ip}/#page:account_1_general`);
      await page.waitForSelector("input[name='P35']");
      const SIP = await page.$eval("input[name='P35']", el => el.value);
      console.log(`Device SIP is ${SIP}`);

      // Get MAC address and IP Address
      await page.goto(`http://${ip}/#page:status_network`);
      page.waitForSelector(".pad-Main div:first-child .contents div");
      await page.waitFor(1000);
      const MAC = await page.$eval(
        ".pad-Main div:first-child .contents div",
        el => el.innerHTML
      );
      console.log(`Device MAC is ${MAC}`);
      const IP = await page.$eval(
        ".pad-Main div:nth-child(4) .contents div",
        el => el.innerHTML
      );
      console.log(`Device IP is ${IP}`);

      // Get Firmware Version
      await page.goto(`http://${ip}/#page:status_system_info`);
      await page.waitFor(1000);

      await page.waitForSelector(".pad-Main div:nth-child(8) .contents div");
      const VERSION = await page.$eval(
        ".pad-Main div:nth-child(8) .contents div",
        el => el.innerHTML
      );
      let ROOM = SIP.substr(2);

      console.log(`Device firmware is ${VERSION}`);

      console.log("--------------");

      const info = {
        room: ROOM,
        mac_address: MAC,
        ip_address: IP,
        firmware: VERSION
      };

      fs.readFile("results.json", (err, data) => {
        var json = JSON.parse(data);
        json.push(info);

        fs.writeFile("results.json", JSON.stringify(json), () => {});
      });

      await page.waitFor(3000);
      await browser.close();

      resolve();
    } catch (error) {
      console.log(error);
      resolve();
    }
  });
};

// run loop
(async () => {
  const total = ips.length;
  for (const [index, item] of ips.entries()) {
    console.log(`${index + 1} of ${total}`);
    await action(item);
  }
})();

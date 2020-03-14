const puppeteer = require("puppeteer");
const ips = require("./ip_address");

const action = async ip => {
  return new Promise(async resolve => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
      console.log(`Requesting gui for ${ip}`);
      console.log("--------------");

      // Loging in
      await page.goto(`http://${ip}`);
      console.log(`Visiting ${ip}`);
      await page.waitForSelector("#login-box");
      await page.$eval(".gwt-TextBox", el => (el.value = "admin"));
      await page.$eval(".gwt-PasswordTextBox", el => (el.value = "NeXT123!"));
      await page.click(".gwt-Button");
      console.log(`Logging in to ${ip}`);

      await page.waitFor(1000);
      await page.waitForSelector(".feature[name='prov']");

      // reboot
      await page.click(".feature[name='prov']");

      await page.waitFor(1000);

      console.log(`Provisoning`);
      console.log("--------------");

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

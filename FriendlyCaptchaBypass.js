require("dotenv").config();
const puppeteer = require("puppeteer");
const {
  RequestInterceptionManager,
} = require("puppeteer-intercept-and-modify-requests");

let browser, page, client;
let loggedIn = false;
async function main() {
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 150,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    args: [
      "--disable-web-security",
      "--disable-dev-shm-usage",
      `--proxy-server=${process.env.PROXY_SERVER}`,
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--unlimited-storage",
      "--full-memory-crash-report",
    ],
  });


  
  page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows; U; Windows NT 10.2; WOW64; en-US) AppleWebKit/535.16 (KHTML, like Gecko) Chrome/51.0.3655.377 Safari/535.1 Edge/11.89293');
  
  
  client = await page.target().createCDPSession();
  const interceptManager = new RequestInterceptionManager(client);

  await interceptManager.intercept({
    // specify the URL pattern to intercept:
    urlPattern: 'https://unpkg.com/friendly-challenge@0.9.13/widget.module.min.js',
    // specify how you want to modify the response (may be async):
    modifyResponse({ body }) {
      return {
        body: body.replaceAll(
          '-1===l.indexOf("headless")&&-1===A.appVersion.indexOf("Headless")&&-1===l.indexOf("bot")&&-1===l.indexOf("crawl")&&!0!==A.webdriver&&A.language&&(void 0===A.languages||A.languages.length)',
          "true"
        ),
      };
    },
  });
  
  
  
  await page.goto('URL');
}
main();

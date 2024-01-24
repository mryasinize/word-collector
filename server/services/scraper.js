const puppeteer = require("puppeteer-core");

/** This class is for scraping Google Translate website to get translation of a word */
class TranslationScraper {
    static targetWeb = "https://translate.google.com/#en/bn/";

    /** Your Chrome executable path */
    static chromeExecutablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    /** The X-path of translation text container */
    static translationContainerXpath = "::-p-xpath(/html/body/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[2]/div[3]/c-wiz[2]/div[1]/div[7]/div/div[1]/span[1]/span/span)";

    /** Scrapes translation from Google Translate website 
     * @param {string} word The word to translate
     * @param {boolean} includeMoreTranslations Whether should scrape more translations
     * 
     * @returns {{word:string, translation:string, moreTranslations:string[]}} Scraped data from website
    */
    static async getTranslation(word, includeMoreTranslations) {
        const browser = await puppeteer.launch({
            executablePath: TranslationScraper.chromeExecutablePath
        });
        const page = await browser.newPage();

        await page.goto(TranslationScraper.targetWeb + word);
        const translationContainer = await page.waitForSelector(TranslationScraper.translationContainerXpath);

        const translation = await (await translationContainer.getProperty("textContent")).jsonValue();
        const moreTranslations = includeMoreTranslations ? await page.$$eval('.s0ijVb .ryNqvb', translations => translations.map(translation => translation.textContent)) : [];

        await translationContainer.dispose();
        await browser.close();

        return {
            word,
            translation,
            moreTranslations
        }
    }
}

module.exports = { TranslationScraper }
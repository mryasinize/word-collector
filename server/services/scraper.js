const puppeteer = require("puppeteer-core");

/** This class is for scraping Google Translate website to get translation of a word */
class TranslationScraper {
    static targetWeb = "https://translate.google.com/#en/bn/";

    /** Your Chrome executable path */
    static chromeExecutablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    /** The selector of translation text container */
    static translationContainerSelector = ".sciAJc > .QcsUad .ryNqvb";

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
        await page.waitForSelector(TranslationScraper.translationContainerSelector);

        const translation = await page.$eval(TranslationScraper.translationContainerSelector, translation => translation.textContent);
        const moreTranslations = includeMoreTranslations ? await page.$$eval('.s0ijVb .ryNqvb', translations => translations.map(translation => translation.textContent)) : [];

        await browser.close();

        return {
            word,
            translation,
            moreTranslations
        }
    }
}

module.exports = { TranslationScraper }
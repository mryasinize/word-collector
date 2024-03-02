const { google } = require("googleapis");
const { Settings } = require("./settings");
const { capitalizeFirstLetter } = require("../utils");
const randomNumberGenerator = require("random-number-csprng");

/** This class is for interacting with Google Sheet API */
class SheetAPI {
    static sheets = null;
    // Type the key file path of your service account here or paste the credentials into service-account-creds.json file
    static keyFilePath = "./service-account-creds.json";
    static scopes = ["https://www.googleapis.com/auth/spreadsheets"];

    /** Initializes the SheetAPI */
    static async initialize() {
        if (!this.sheets) {
            const auth = new google.auth.GoogleAuth({
                keyFile: SheetAPI.keyFilePath,
                scopes: SheetAPI.scopes
            });

            const authClient = await auth.getClient()
            SheetAPI.sheets = google.sheets({ version: "v4", auth: authClient }).spreadsheets;
        }
    }

    /** Returns the current sheet name
     * @returns {string} The name of the current sheet
     */
    static async getSheetName() {

        const { spreadsheetId, sheetId } = SheetAPI.getSettings()

        const spreadsheet = await SheetAPI.sheets.get({ spreadsheetId })

        const sheet = spreadsheet.data.sheets.find(({ properties }) => properties.sheetId === sheetId);

        if (!sheet) {
            throw Error("Invalid sheet info")
        }

        return sheet.properties.title;
    }

    /** Reads settings.json file
     * @returns {{spreadsheetId:string,sheetId:number}}
     */
    static getSettings() {

        const settings = Settings.getContents();

        if (!settings.spreadsheetId || isNaN(settings.sheetId)) {
            throw Error("Invalid sheet info")
        }

        return settings
    }

    /** Sorts Sheet rows */
    static async sortSheetValues() {

        const { spreadsheetId, sheetId } = SheetAPI.getSettings()

        await SheetAPI.sheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        sortRange: {
                            range: {
                                sheetId,
                                startRowIndex: 1
                            },
                            sortSpecs: [{
                                sortOrder: "ASCENDING",
                                dimensionIndex: 0
                            }]
                        }
                    }
                ]
            }
        });
    }

    /** Gets information about a word from Sheet
     * @param {string} word The word to get information
     * 
     * @returns {{exists:boolean, word:string, translations:string, definitions:string, examples:string}} Information about the word
     */
    static async getWordInfo(word) {
        try {
            const { spreadsheetId } = SheetAPI.getSettings();
            const sheetName = await SheetAPI.getSheetName();

            const sheetColumns = await SheetAPI.sheets.values.get({ spreadsheetId, range: `${sheetName}!A2:Z`, majorDimension: "COLUMNS" })

            if (!sheetColumns.data.values) {
                return {
                    exists: false,
                    word: word
                }
            }
            
            const words = sheetColumns.data.values[0];
            const wordTranslations = sheetColumns.data.values[1];
            const wordDefinitions = sheetColumns.data.values[2] || "";
            const wordExamples = sheetColumns.data.values[3] || "";

            const _word = word.toLowerCase()
            const wordIndex = words.indexOf(_word) === -1 ? words.indexOf(capitalizeFirstLetter(_word)) : words.indexOf(_word)

            const wordInfo = {
                exists: words.includes(_word) || words.includes(capitalizeFirstLetter(_word)),
                word: _word,
                translations: wordTranslations[wordIndex],
                definitions: wordDefinitions[wordIndex],
                examples: wordExamples[wordIndex],
            }

            return wordInfo;

        } catch (error) {
            return { error: error.status === 404 ? Error("Invalid sheet info") : error }
        }
    }

    /** Picks some random words from Sheet
     * @param {number} count How many?
     * 
     * @returns {Array<Array<string>>} Array of random words
     */
    static async getRandomWords(count) {
        try {
            const randomWordsInfo = [];
            const { spreadsheetId } = SheetAPI.getSettings();
            const sheetName = await SheetAPI.getSheetName();
            const sheetColumns = await SheetAPI.sheets.values.get({ spreadsheetId, range: `${sheetName}!A2:B`, majorDimension: "ROWS" })
            const sheetLength = sheetColumns.data.values.length;

            for (let i = 0; i < parseInt(count); i++) {
                const randomIndex = await randomNumberGenerator(0, sheetLength);
                randomWordsInfo.push(sheetColumns.data.values[randomIndex]);
            }

            return randomWordsInfo;

        } catch (error) {
            return { error: error.status === 404 ? Error("Invalid sheet info") : error }
        }
    }

    /** Appends a row in Sheet
     * @param {string[]} rowValues The row values to append
     */
    static async saveWord(rowValues) {
        try {
            const { spreadsheetId } = SheetAPI.getSettings();
            const sheetName = await SheetAPI.getSheetName();

            const res = await SheetAPI.sheets.values.append({
                spreadsheetId,
                range: `${sheetName}!A2:Z`,
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: [rowValues]
                }
            })

            await SheetAPI.sortSheetValues()

            return res;

        } catch (error) {
            return { error: error.status === 404 ? Error("Invalid sheet info") : error }
        }
    }

    /** Updates a particular row
     * @param {string[]} updatedRowValues Updated row values
     */
    static async updateWord(updatedRowValues) {
        try {
            const { spreadsheetId } = SheetAPI.getSettings();
            const sheetName = await SheetAPI.getSheetName();

            const columns = await SheetAPI.sheets.values.get({ spreadsheetId, range: `${sheetName}!A2:Z`, majorDimension: "COLUMNS" })

            const words = columns.data.values[0];
            const _word = updatedRowValues[0].toLowerCase()
            const wordIndex = words.indexOf(_word) === -1 ? words.indexOf(capitalizeFirstLetter(_word)) : words.indexOf(_word)
            const updateRange = `${sheetName}!A${wordIndex + 2}`

            const res = await SheetAPI.sheets.values.update({
                spreadsheetId,
                range: updateRange,
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: [updatedRowValues]
                }
            })

            return res;

        } catch (error) {
            return { error: error.status === 404 ? Error("Invalid sheet info") : error }
        }
    }

    /** Deletes word from Sheet
     * @param {string} targetWord The word to delete
     */
    static async deleteWord(targetWord) {
        try {
            const { spreadsheetId } = SheetAPI.getSettings()
            const sheetName = await SheetAPI.getSheetName();

            const columns = await SheetAPI.sheets.values.get({ spreadsheetId, range: `${sheetName}!A2:Z`, majorDimension: "COLUMNS" })

            const words = columns.data.values[0];
            const _word = targetWord.toLowerCase()
            const wordIndex = words.indexOf(_word) === -1 ? words.indexOf(capitalizeFirstLetter(_word)) : words.indexOf(_word)
            const deleteRange = `${sheetName}!A${wordIndex + 2}:Z${wordIndex + 2}`

            const res = await SheetAPI.sheets.values.clear({
                spreadsheetId,
                range: deleteRange,
            })

            await SheetAPI.sortSheetValues();

            return res;

        } catch (error) {
            return { error: error.status === 404 ? Error("Invalid sheet info") : error }
        }
    }
}

module.exports = { SheetAPI }
const { readFileSync, writeFileSync, existsSync } = require('fs');

/** This class is for settings related tasks such as getting and updating the settings.json file */
class Settings {
    static settingsPath = "./settings.json";

    /**
     * Use this function to get current contents of settings.json file
     * @returns {{spreadsheetId:string,sheetId:number}} Contents from settings.json file
     */
    static getContents() {

        if (existsSync(this.settingsPath)) {
            const settings = JSON.parse(readFileSync(this.settingsPath));

            return settings;
        } else {
            throw Error("Could not find settings file")
        }

    }

    /**
     * Updates settings.json file
     * @param {Object} updatedSettings - Updated settings object
     * @param {string} updatedSettings.spreadsheetId 
     * @param {number} updatedSettings.sheetId
     */
    static update({ spreadsheetId, sheetId }) {

        if (existsSync(this.settingsPath)) {

            if (typeof spreadsheetId === "string" && typeof sheetId === "number") {

                writeFileSync(this.settingsPath, JSON.stringify({ spreadsheetId, sheetId }))

            } else {
                throw Error("Invalid settings data types")
            }
        } else {
            throw Error("Could not find settings file")
        }
    }
}

module.exports = { Settings } 
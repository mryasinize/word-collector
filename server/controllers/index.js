const { SheetAPI } = require("../services/sheet");
const { Settings } = require("../services/settings");
const { TranslationScraper } = require("../services/scraper");

const getTranslationController = async (req, res, next) => {
    try {
        const { word } = req.query;
        const { translation, moreTranslations } = await TranslationScraper.getTranslation(word, true);

        return res.json({
            success: true,
            wordInfo: {
                word,
                translation,
                moreTranslations
            }
        })
    } catch (error) {
        console.log(error)
    }
}

const getSettingsController = async (req, res, next) => {
    try {
        const settings = Settings.getContents();
        return res.json({
            success: true,
            settings
        })
    } catch (error) {
        next(error)
    }
}

const updateSettingsController = async (req, res, next) => {
    try {
        const { spreadsheetId, sheetId } = req.body;
        Settings.update({ spreadsheetId, sheetId })

        return res.json({
            success: true
        })
    } catch (error) {
        next(error)
    }
}

const getWordController = async (req, res, next) => {
    try {
        const { word } = req.query;
        const wordInfo = await SheetAPI.getWordInfo(word);

        if (wordInfo.error) {
            throw wordInfo.error;
        }

        return res.json({
            success: true,
            wordInfo
        })
    } catch (error) {
        next(error)
    }
}

const addWordController = async (req, res, next) => {
    try {
        const { payload } = req.body;
        let rowValues = [];

        if (payload.scrape) {
            const { translation } = await TranslationScraper.getTranslation(payload.word, false);
            rowValues = [payload.word, translation, null, null];
        } else {
            rowValues = payload.rowValues;
        }
        const response = await SheetAPI.saveWord(rowValues);
        if (response.status === 200) {
            return res.json({
                success: true,
                wordInfo: {
                    exists: true,
                    word: rowValues[0],
                    translations: rowValues[1],
                    definitions: rowValues[2],
                    examples: rowValues[3],
                }
            })
        } else {
            throw response.error
        }
    } catch (error) {
        next(error)
    }
}

const updateWordController = async (req, res, next) => {
    try {
        const { updatedRowData } = req.body;
        const response = await SheetAPI.updateWord(updatedRowData)
        if (response.status === 200) {
            return res.json({
                success: true,
                wordInfo: {
                    exists: true,
                    word: updatedRowData[0],
                    translations: updatedRowData[1],
                    definitions: updatedRowData[2],
                    examples: updatedRowData[3],
                }
            })
        } else {
            throw response.error
        }

    } catch (error) {
        next(error)
    }
}

const deleteWordController = async (req, res, next) => {
    try {
        const { targetWord } = req.body;
        const response = await SheetAPI.deleteWord(targetWord);
        if (response.status === 200) {
            return res.json({
                success: true,
            })
        } else {
            throw response.error
        }

    } catch (error) {
        next(error)
    }
}

module.exports = { getSettingsController, updateSettingsController, getWordController, addWordController, updateWordController, deleteWordController, getTranslationController }
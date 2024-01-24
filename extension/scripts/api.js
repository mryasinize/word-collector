const addWordToSheet = async () => {
    const isGoogleTranslatePage = window.location.hostname === "translate.google.com";
    try {
        let payload = {
            scrape: false
        }
        renderMessage("Adding...");
        if (isGoogleTranslatePage) {
            const { word, translations, definitions, examples } = tempWordInfo;
            payload.rowValues = [word, translations, definitions || "", examples || ""];
            payload.scrape = false;
        } else {
            if (Object.keys(bubbleWordInfo.scrapedData).length === 0) {
                payload.word = bubbleWordInfo.data.word;
                payload.scrape = true;
            } else {

                payload.scrape = false;
                const isModifySectionVisible = ModifyWordSection.isVisible();

                if (isModifySectionVisible) {
                    const modifiedWord = ModifyWordSection.getCurrentInput();
                    const newTranslation = ModifyWordSection.getCurrentTranslation();
                    payload.rowValues = [modifiedWord, newTranslation, null, null];
                } else {
                    let newTranslation = bubbleWordInfo.scrapedData.translation;
                    const isMoreTranslationsSectionVisible = MoreTranslationsSection.isVisible();
                    if (isMoreTranslationsSectionVisible) {
                        const selectedTranslations = MoreTranslationsSection.getSelectedTranslations();
                        selectedTranslations.forEach(checkedTranslationElement => {
                            newTranslation += ` / ${checkedTranslationElement.trim().toLowerCase()}`;
                        })
                    }
                    payload.rowValues = [selectedWord, newTranslation, null, null];
                }
            }


        }
        chrome.runtime.sendMessage({ requestType: "ADD_WORD", payload });
    } catch (error) {
        console.log(error);
        renderMessage("Something went wrong", true);
    }
}

const deleteWordFromSheet = async () => {
    const isGoogleTranslatePage = window.location.hostname === "translate.google.com";
    try {
        let targetWord;
        renderMessage("Deleting...");
        if (isGoogleTranslatePage) {
            targetWord = originalWordInfo.word
        } else {

            const isModifySectionVisible = ModifyWordSection.isVisible();
            if (isModifySectionVisible) {
                const modifiedWord = ModifyWordSection.getCurrentInput();
                targetWord = modifiedWord;

            } else {
                targetWord = bubbleWordInfo.data.word;
            }
        }
        chrome.runtime.sendMessage({ requestType: "DELETE_WORD", targetWord });
    } catch (error) {
        console.log(error);
        renderMessage("Something went wrong", true);
    }
}

const updateWordInSheet = async () => {
    try {
        const isGoogleTranslatePage = window.location.hostname === "translate.google.com";
        let updatedRowData;
        renderMessage("Updating...")
        if (isGoogleTranslatePage) {
            const { word, translations, definitions, examples } = tempWordInfo;
            updatedRowData = [word, translations, definitions || "", examples || ""];
        } else {

            const isModifySectionVisible = ModifyWordSection.isVisible();
            if (isModifySectionVisible) {

                const modifiedWord = ModifyWordSection.getCurrentInput();
                const updatedTranslation = ModifyWordSection.getCurrentTranslation();
                updatedRowData = [modifiedWord, updatedTranslation];

            } else {

                let updatedTranslation = bubbleWordInfo.data.translations.split("/").map(translation => translation.trim())[0];

                const isMoreTranslationsSectionVisible = MoreTranslationsSection.isVisible();
                if (isMoreTranslationsSectionVisible) {

                    const selectedTranslations = MoreTranslationsSection.getSelectedTranslations();
                    selectedTranslations.forEach(checkedTranslationElement => {
                        updatedTranslation += ` / ${checkedTranslationElement.trim().toLowerCase()}`;
                    })

                }
                updatedRowData = [selectedWord, updatedTranslation];
            }
        }
        chrome.runtime.sendMessage({ requestType: "UPDATE_WORD", updatedRowData });
    } catch (error) {
        console.log(error);
        renderMessage("Something went wrong", true);
    }
}

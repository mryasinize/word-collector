let selectedWord = "";
let shadowRoot;
let tempWordInfo = {};
let originalWordInfo = {};
const bubbleWordInfo = {
    data: {},
    scrapedData: {}
}
const modifiedBubbleWordInfo = {
    data: {},
    scrapedData: {}
}


/** Handles response sent from background.js
 * @param {Object} payload The payload received from api
 */
const responseHandler = (payload) => {
    try {
        const isGoogleTranslatePage = window.location.hostname === "translate.google.com";
        const { responseType, success, wordInfo, isTemp } = payload;
        let shouldDisplayDisabledButton = false;

        if (!success) {
            throw payload.error
        }

        if (isGoogleTranslatePage) {
            const word = document.querySelector(".D5aOJc").textContent.trim().toLowerCase();
            if (!word) {
                shouldDisplayDisabledButton = true;
            }
        } else {
            const isModifySectionVisible = ModifyWordSection.isVisible();
            const currentInputText = ModifyWordSection.getCurrentInput();
            if (isModifySectionVisible && !currentInputText) {
                shouldDisplayDisabledButton = true;
            }
        }
        if (shouldDisplayDisabledButton) {
            renderActionButton("add", true);
        } else {
            switch (responseType) {
                case "CHECK_WORD_EXISTENCE":
                    if (isGoogleTranslatePage) {
                        const translationContainer = document.querySelector(".HwtZe");
                        if (wordInfo.exists) {

                            tempWordInfo = { ...wordInfo }
                            originalWordInfo = { ...wordInfo }
                            translationContainer.textContent = wordInfo.translations;
                            renderActionButton("delete");

                        } else {
                            tempWordInfo = {
                                ...wordInfo,
                                translations: document.querySelector(".ryNqvb").textContent
                            }
                            originalWordInfo = {}
                            renderActionButton("add")
                        }

                        insertCheckboxes();

                        const translationObserver = new MutationObserver(() => {
                            if (translationContainer.querySelector(".ryNqvb")) {
                                translationContainer.textContent = tempWordInfo.translations;
                            }
                        })
                        translationObserver.observe(translationContainer, { childList: true, subtree: true });

                    } else {

                        if (isTemp) {
                            modifiedBubbleWordInfo.data = { ...wordInfo };
                        } else {
                            bubbleWordInfo.data = { ...wordInfo };
                            renderActionButton(wordInfo.exists ? "delete" : "add")
                        }

                        this.wordExists = wordInfo.exists;
                        this.translations = ""

                        if (wordInfo.exists) {
                            ModifyWordSection.renderText(wordInfo.translations);
                            this.translations = wordInfo.translations;
                            renderActionButton("delete")
                        }
                    }
                    break;

                case "TRANSLATION":

                    if (isTemp) {
                        modifiedBubbleWordInfo.scrapedData = { ...wordInfo };
                    } else {
                        bubbleWordInfo.scrapedData = { ...wordInfo };
                    }

                    const isModifySectionVisible = ModifyWordSection.isVisible();

                    if (!this.wordExists && isModifySectionVisible) {
                        ModifyWordSection.renderText(wordInfo.translation);
                        renderActionButton("add");
                    }

                    const isMoreTranslationsSectionVisible = MoreTranslationsSection.isVisible();

                    if (isMoreTranslationsSectionVisible) {

                        if (wordInfo.moreTranslations.length > 0) {

                            const translations = this.translations.split("/").map(translation => translation.trim()) || [];
                            MoreTranslationsSection.renderTranslationsList(wordInfo.moreTranslations, translations);

                        } else {
                            MoreTranslationsSection.renderMessage("No more translations found");
                        }
                    }
                    break;

                case "ADD_WORD":
                    renderActionButton("delete");
                    if (isGoogleTranslatePage) {
                        tempWordInfo = { ...wordInfo }
                        originalWordInfo = { ...wordInfo }
                    } else {
                        if (Object.keys(modifiedBubbleWordInfo.data).length > 0) {
                            modifiedBubbleWordInfo.data = { ...wordInfo };
                        } else {
                            bubbleWordInfo.data = { ...wordInfo };
                        }
                    }
                    break;

                case "UPDATE_WORD":
                    renderActionButton("delete");
                    if (success) {
                        if (isGoogleTranslatePage) {
                            originalWordInfo = { ...tempWordInfo }
                        } else {
                            if (Object.keys(modifiedBubbleWordInfo.data).length > 0) {
                                modifiedBubbleWordInfo.data = { ...wordInfo };
                            } else {
                                bubbleWordInfo.data = { ...wordInfo };
                            }
                        }
                    }
                    break;

                case "DELETE_WORD":
                    renderActionButton("add");
                    if (isGoogleTranslatePage) {
                        originalWordInfo = {}
                        tempWordInfo.exists = false;
                    } else {
                        if (Object.keys(modifiedBubbleWordInfo.data).length > 0) {
                            modifiedBubbleWordInfo.data.exists = false;
                        } else {
                            bubbleWordInfo.data.exists = false;
                        }
                    }
                    break;

                default:
                    break;
            }
        }

    } catch (error) {
        console.log(error)
        renderMessage(error.message, true);
    }
}

/** Here we are observing changes in the DOM. If the website is `translate.google.com` then we are observing C-WIZ tag to see if it is removed or not.
 * If it's removed, then our elements(that we injected externally) are also removed as well. So we re-render them again.
 * And we are also looking for Google Translate bubble icon i.e. `gtx-trans` id (that you get when you select a text). If it pops up, we are fetching information about selected text upfront
 * so that if the user expands the bubble (contains `gtx-bubble` class), it can show the results instantly instead of loading
 */
const bodyMutationObserver = new MutationObserver(async (records) => {
    for (const record of records) {
        if (record.removedNodes.length > 0) {
            for (const removedNode of record.removedNodes) {
                if (removedNode.nodeName === "C-WIZ") {
                    renderTranslateOptions()
                }
            }
        };
        if (record.addedNodes.length > 0) {
            for (const addedNode of record.addedNodes) {
                if (addedNode.id === "gtx-trans") {

                    bubbleWordInfo.data = {};
                    bubbleWordInfo.scrapedData = {};
                    modifiedBubbleWordInfo.data = {};
                    modifiedBubbleWordInfo.scrapedData = {};

                    selectedWord = window.getSelection().toString().trim().toLowerCase();
                    chrome.runtime.sendMessage({ requestType: "CHECK_WORD_EXISTENCE", word: selectedWord, isTemp: false });
                    chrome.runtime.sendMessage({ requestType: "TRANSLATION", word: selectedWord, isTemp: false });
                }
                if (addedNode.classList.contains("gtx-bubble")) {

                    await renderBubbleTranslateOptions();

                    if (Object.keys(bubbleWordInfo.data).length === 0) {
                        renderMessage("Checking...");
                    } else {
                        renderActionButton(bubbleWordInfo.data.exists ? "delete" : "add")
                    }
                }
            }
        };
    }
})

bodyMutationObserver.observe(document.body, { childList: true });

chrome.runtime.onMessage.addListener(responseHandler)

if (window.location.hostname === "translate.google.com") {
    window.onload = renderTranslateOptions;
}
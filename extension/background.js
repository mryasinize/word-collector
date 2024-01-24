import { addWordInfo, deleteWordInfo, getTranslation, getWordInfo, updateWordInfo } from "./api.js";

const messageHandler = async (message) => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    try {
        let res;
        switch (message.requestType) {
            case "CHECK_WORD_EXISTENCE": {
                res = await getWordInfo(message.word);
                break;
            }
            case "TRANSLATION": {
                res = await getTranslation(message.word);
                break;
            }
            case "ADD_WORD": {
                res = await addWordInfo(message.payload);
                break;
            }
            case "UPDATE_WORD": {
                res = await updateWordInfo(message.updatedRowData);
                break;
            }
            case "DELETE_WORD": {
                res = await deleteWordInfo(message.targetWord);
                break;
            }

            default:
                break;
        }

        chrome.tabs.sendMessage(tab.id, { responseType: message.requestType, ...res, isTemp: message.isTemp })

    } catch (error) {
        console.log(error);
        chrome.tabs.sendMessage(tab.id, {
            success: false,
            error: {
                message: "Something went wrong",
                originalMessage: error.stack.toString()
            }
        })
    }
}

chrome.runtime.onMessage.addListener(messageHandler);

chrome.runtime.onInstalled.addListener(async () => {
    chrome.contextMenus.create({
        id: 'youtube_search',
        title: 'Seach YouTube for "%s"',
        contexts: ['selection']
    });
});

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'youtube_search') {
        chrome.tabs.create({
            url: 'https://www.youtube.com/results?search_query=' + info.selectionText,
            active: true
        });
    }
});
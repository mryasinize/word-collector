/**
 * These classes and functions are used for rendering custom elements and handling interactions in the Google Translate Bubble (i.e. google translate chrome extension)
 */

let moreTranslationsButton;
let modifyWordButton;

/** This class if for handling More translation section */
class MoreTranslationsSection {

    /** Checks wheter more translation section is visible in the DOM or not
     * @returns {boolean} 
     */
    static isVisible() {
        const moreTranslationSection = shadowRoot?.querySelector("#more_translation_section");
        if (moreTranslationSection) {
            return true;
        } else {
            return false;
        }
    }

    /** Mounts More translation section info DOM */
    static mount() {

        const isVisibleInDOM = MoreTranslationsSection.isVisible();

        if (!isVisibleInDOM) {
            const translateOptionsContainer = shadowRoot?.querySelector("#translate_options");
            const moreTranslationSection = document.createElement("div");
            const titleContainerSpan = document.createElement("span");

            moreTranslationSection.id = "more_translation_section";
            titleContainerSpan.textContent = "More translations:";
            titleContainerSpan.style.color = "#a2a2a2";

            moreTranslationSection.append(titleContainerSpan);
            translateOptionsContainer.append(moreTranslationSection);
        }
    }

    /** Mounts more translation section from DOM */
    static unmount() {

        const isVisibleInDOM = MoreTranslationsSection.isVisible();

        if (isVisibleInDOM) {
            const moreTranslationSection = shadowRoot?.querySelector("#more_translation_section");
            moreTranslationSection.remove();
        }
    }

    /** Renders custom loading messages
     * @param {string} message The message text
     */
    static renderMessage(message) {

        const moreTranslationSection = shadowRoot?.querySelector("#more_translation_section");

        let moreTranslationMessageSpan = moreTranslationSection.querySelector("#more_translation_message");
        if (moreTranslationMessageSpan) {
            moreTranslationMessageSpan.textContent = message;

        } else {

            const moreTranslationsList = moreTranslationSection.querySelector("#more_translations_list");
            moreTranslationsList?.remove();

            moreTranslationMessageSpan = document.createElement("span");
            moreTranslationMessageSpan.id = "more_translation_message";
            moreTranslationMessageSpan.textContent = message;

            moreTranslationSection.append(moreTranslationMessageSpan);
        }
    }

    /**
     * Handles checkbox click of each rendered translation under more translation section
     * @param {Event} e 
     */
    static checkboxHandler = (e) => {
        try {
            console.log(modifiedBubbleWordInfo)
            const { value, checked } = e.target;

            const isModifySectionVisible = ModifyWordSection.isVisible();

            if (isModifySectionVisible) {
                const currentTranslation = ModifyWordSection.getCurrentTranslation();
                if (checked) {
                    ModifyWordSection.renderText(currentTranslation + ` / ${value}`);

                } else {
                    ModifyWordSection.renderText(currentTranslation.replace(` / ${value}`, ''))
                }
            }

            if ((Object.keys(modifiedBubbleWordInfo.data).length > 0 && modifiedBubbleWordInfo.data.exists) || bubbleWordInfo.data.exists) {
                let originalTranslations = [];

                if (Object.keys(modifiedBubbleWordInfo.data).length > 0) {
                    originalTranslations = modifiedBubbleWordInfo.data.translations.split("/").slice(1).map(translation => translation.trim())
                } else {
                    originalTranslations = bubbleWordInfo.data.translations.split("/").slice(1).map(translation => translation.trim())
                }

                const checkedTranslationElementArray = MoreTranslationsSection.getSelectedTranslations();
                if (checkedTranslationElementArray.length === originalTranslations.length) {
                    const hasTranslationChanged = checkedTranslationElementArray.some(translation => {
                        return !originalTranslations.includes(translation)
                    })
                    renderActionButton(hasTranslationChanged ? "update" : "delete");
                } else {
                    renderActionButton("update");
                }
            }

        } catch (error) {
            console.log(error)
        }
    }

    /** Renders more translations as a list
     * @param {string[]} translationsArray Translations to render
     * @param {string[]} selectedTranslations Translations that should to be selected by default
     * @param {HTMLElement} container Container in which translation list should be rendered
     */
    static renderTranslationsList(translationsArray, selectedTranslations, container) {

        const isVisibleInDOM = MoreTranslationsSection.isVisible();

        if (isVisibleInDOM) {

            const moreTranslationSection = container || shadowRoot?.querySelector("#more_translation_section");

            const moreTranslationsList = moreTranslationSection.querySelector("#more_translations_list");
            moreTranslationsList?.remove();

            const moreTranslationMessageSpan = moreTranslationSection.querySelector("#more_translation_message");
            moreTranslationMessageSpan?.remove();

            const ul = document.createElement("ul");
            ul.id = "more_translations_list"

            const tempTranslationsArray = [];
            const _wordInfo = Object.keys(modifiedBubbleWordInfo.data).length > 0 ? modifiedBubbleWordInfo : bubbleWordInfo;
            if (_wordInfo.data.exists) {
                tempTranslationsArray.push(_wordInfo.data.translations.split("/")[0].trim())
            } else {
                tempTranslationsArray.push(_wordInfo.scrapedData.translation.trim())
            }

            for (const translation of translationsArray) {
                if (!tempTranslationsArray.includes(translation)) {
                    const li = document.createElement("li");
                    const checkbox = document.createElement("input");
                    const translationContainerSpan = document.createElement("span");

                    li.style.display = "flex";
                    li.style.alignItems = "center";
                    li.style.gap = "10px";

                    checkbox.onclick = (e) => e.stopPropagation()
                    checkbox.onchange = MoreTranslationsSection.checkboxHandler;
                    checkbox.type = "checkbox";
                    checkbox.style.minWidth = "18px";
                    checkbox.style.height = "18px";
                    checkbox.value = translation;
                    checkbox.checked = selectedTranslations.includes(translation)
                    translationContainerSpan.textContent = translation;

                    li.append(checkbox, translationContainerSpan)
                    ul.append(li);
                    tempTranslationsArray.push(translation);
                }
            }

            moreTranslationSection.append(ul);
        }

    }

    /** Returns currently selected translations
     * @returns {string[]} Selected translations
     */
    static getSelectedTranslations() {
        const moreTranslationsList = shadowRoot?.querySelector("#more_translations_list");
        if (moreTranslationsList) {
            const translationsArray = Array.from(moreTranslationsList.querySelectorAll("input:checked")).map(checkedTranslationElement => {
                return checkedTranslationElement.value.trim().toLowerCase();
            });
            return translationsArray;
        }
        return [];
    }
}

/** This class is for handling Modify section */
class ModifyWordSection {

    /** Checks wheter modify word section is visible in the DOM or not
     * @returns {boolean} 
     */
    static isVisible() {
        const modifyWordSection = shadowRoot?.querySelector("#modify_word_section");
        if (modifyWordSection) {
            return true;
        } else {
            return false;
        }
    }

    /** Mounts Modify word section into the DOM */
    static mount() {

        const translateOptionsContainer = shadowRoot?.querySelector("#translate_options");

        const modifyWordSection = document.createElement("div");
        const input = document.createElement("input");
        const translationContainer = document.createElement("div");
        const titleContainerSpan = document.createElement("span");
        const translationTextContainerSpan = document.createElement("span");

        modifyWordSection.id = "modify_word_section";
        titleContainerSpan.textContent = "Translation:";
        translationTextContainerSpan.id = "translation_text";
        translationContainer.id = "translation_container";
        titleContainerSpan.style.color = "#a2a2a2";
        input.id = "alter_text_input";
        input.autofocus = true;
        input.value = selectedWord;
        input.oninput = ModifyWordSection.inputHandler;

        if (bubbleWordInfo.data.exists) {

            translationTextContainerSpan.textContent = bubbleWordInfo.data.translations;

        } else if (Object.keys(bubbleWordInfo.scrapedData).length > 0) {

            let newTranslation = bubbleWordInfo.scrapedData.translation;

            const selectedTranslations = MoreTranslationsSection.getSelectedTranslations();

            selectedTranslations.forEach(checkedTranslationElement => {
                newTranslation += ` / ${checkedTranslationElement.trim().toLowerCase()}`;
            })

            translationTextContainerSpan.textContent = newTranslation;

        } else {
            translationTextContainerSpan.textContent = "getting translation...";
        }

        translationContainer.append(titleContainerSpan, translationTextContainerSpan);
        modifyWordSection.append(input, translationContainer);

        const isMoreTranslationSectionVisibleInDOM = MoreTranslationsSection.isVisible();

        if (isMoreTranslationSectionVisibleInDOM) {
            translateOptionsContainer.insertBefore(modifyWordSection, shadowRoot?.querySelector("#more_translation_section"));
        } else {
            translateOptionsContainer.append(modifyWordSection)
        }
    }

    /** Unmounts Modify word section from DOM */
    static unmount() {

        const isVisibleInDOM = ModifyWordSection.isVisible();

        if (isVisibleInDOM) {
            const modifyWordSection = shadowRoot?.querySelector("#modify_word_section");
            modifyWordSection.remove();
        }
    }

    /** Makes translation visible */
    static showTranslationContainer() {

        const isVisibleInDOM = ModifyWordSection.isVisible();

        if (isVisibleInDOM) {
            const translationContainer = shadowRoot?.querySelector("#translation_container");
            translationContainer.style.display = "flex";
        }
    }

    /** Hides translation */
    static hideTranslationContainer() {

        const isVisibleInDOM = ModifyWordSection.isVisible();

        if (isVisibleInDOM) {
            const translationContainer = shadowRoot?.querySelector("#translation_container");
            translationContainer.style.display = "none";
        }
    }

    /**
     * Handles user inputs  
     * @param {Event} e 
     */
    static inputHandler(e) {
        const inputValue = e.target.value.trim().toLowerCase();

        if (isEmpty(inputValue)) {

            ModifyWordSection.hideTranslationContainer();
            MoreTranslationsSection.unmount();

            moreTranslationsButton.changeTitle("More translations");
            moreTranslationsButton.changeOnClick(openMoreTranslationsSection);
            renderActionButton("add", true);
        } else {

            renderMessage("Checking...");

            ModifyWordSection.showTranslationContainer();
            ModifyWordSection.renderText("translating...");

            const isMoreTranslationsSectionVisible = MoreTranslationsSection.isVisible();
            if (isMoreTranslationsSectionVisible) {
                MoreTranslationsSection.mount();
                MoreTranslationsSection.renderMessage("getting more translations...")
            }

            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                if (!isEmpty(inputValue)) {
                    chrome.runtime.sendMessage({ requestType: "CHECK_WORD_EXISTENCE", word: inputValue, isTemp: true })
                    chrome.runtime.sendMessage({ requestType: "TRANSLATION", word: inputValue, isTemp: true })
                }
            }, 500)
        }
    }

    /** Gets current input text
     * @returns {string} Current input text
     */
    static getCurrentInput() {
        const isVisibleInDOM = ModifyWordSection.isVisible();
        if (isVisibleInDOM) {
            const currentWord = shadowRoot?.querySelector("#alter_text_input").value.toLowerCase().trim();
            return currentWord;
        }

    }

    /** Gets current translation text
     * @returns {string} Current translation
     */
    static getCurrentTranslation() {

        const isVisibleInDOM = ModifyWordSection.isVisible();
        if (isVisibleInDOM) {
            const currentTranslation = shadowRoot?.querySelector("#translation_text").textContent.toLowerCase().trim();
            return currentTranslation;
        }
    }

    /** Renders translations and custom loading messages
     * @param {string} newText Text to be rendered
     */
    static renderText(newText) {

        const isVisibleInDOM = ModifyWordSection.isVisible();
        if (isVisibleInDOM) {
            const currentTranslationText = shadowRoot?.querySelector("#translation_text");
            if (currentTranslationText) {
                currentTranslationText.textContent = newText;
            } else {
                const translationContainer = shadowRoot?.querySelector("#translation_container");
                const newTranslationTextContainerSpan = document.createElement("span");
                newTranslationTextContainerSpan.id = "translation_text";
                newTranslationTextContainerSpan.textContent = newText;
                translationContainer.append(newTranslationTextContainerSpan);

            }
        }
    }
}

/** Base calss of Header buttons */
class TranslateOptionsButton {
    constructor(title, onClick) {
        this.title = title;
        this.onClick = onClick;
        this.button = this.#createButton();
    }

    #createButton() {
        const button = document.createElement("button");
        button.classList.add("translate_options_btn");
        button.textContent = this.title;
        button.onclick = this.onClick;
        return button;
    }

    /** Changes current title of the button
     * @param {string} title New title
     */
    changeTitle(title) {
        this.title = title;
        this.button.textContent = this.title;
    }

    /** Changes current onclick funtion of the button
     * @param {Function} onClick New function
     */
    changeOnClick(onClick) {
        this.onClick = onClick;
        this.button.onclick = this.onClick;
    }

    /** Renders itself
     * @param {HTMLElement} targetElement The container in which the button should be rendered
     */
    render(targetElement) {
        targetElement.appendChild(this.button);
    }
}

const openModifyWordSection = () => {
    try {
        ModifyWordSection.mount();
        modifyWordButton.changeTitle("Cancel");
        modifyWordButton.changeOnClick(() => {

            modifiedBubbleWordInfo.data = {};
            modifiedBubbleWordInfo.scrapedData = {};
            modifiedBubbleWordInfo.data = {};
            modifiedBubbleWordInfo.scrapedData = {};

            ModifyWordSection.unmount();

            modifyWordButton.changeTitle("Modify word");
            modifyWordButton.changeOnClick(openModifyWordSection);


            renderActionButton(bubbleWordInfo.data.exists ? "delete" : "add");

            if (bubbleWordInfo.scrapedData.moreTranslations.length > 0) {

                const translations = bubbleWordInfo.data.translations?.split("/").map(translation => translation.trim()) || [];

                MoreTranslationsSection.renderTranslationsList(bubbleWordInfo.scrapedData.moreTranslations, translations)

            } else {
                MoreTranslationsSection.renderMessage("No more translations found")
            }
        })

    } catch (error) {
        console.log(error)
    }
}

const openMoreTranslationsSection = () => {
    try {
        MoreTranslationsSection.mount();
        if (Object.keys(modifiedBubbleWordInfo.scrapedData).length > 0 || Object.keys(bubbleWordInfo.scrapedData).length > 0) {

            if ((Object.keys(modifiedBubbleWordInfo.scrapedData).length > 0 && modifiedBubbleWordInfo.scrapedData.moreTranslations.length === 0) || (Object.keys(modifiedBubbleWordInfo.scrapedData).length === 0 && bubbleWordInfo.scrapedData.moreTranslations.length === 0)) {
                MoreTranslationsSection.renderMessage("No more translations found");
            } else {
                const transaltions = modifiedBubbleWordInfo.scrapedData.moreTranslations || bubbleWordInfo.scrapedData.moreTranslations
                const selectedTranslations = modifiedBubbleWordInfo.data.translations?.split("/").map(translation => translation.trim()) || bubbleWordInfo.data.translations?.split("/").map(translation => translation.trim()) || [];
                MoreTranslationsSection.renderTranslationsList(transaltions, selectedTranslations)
            }
        } else {
            MoreTranslationsSection.renderMessage("getting more translations...");
        }

        moreTranslationsButton.changeTitle("Hide more translations");
        moreTranslationsButton.changeOnClick(() => {
            MoreTranslationsSection.unmount();
            moreTranslationsButton.changeTitle("More translations");
            moreTranslationsButton.changeOnClick(openMoreTranslationsSection)
        })

    } catch (error) {
        console.log(error)
    }
}

const renderBubbleTranslateOptions = async () => {
    try {
        const rootContainer = document.querySelector(".gtx-bubble");

        const mainContainerDiv = document.createElement("div");
        mainContainerDiv.id = "main_container"
        mainContainerDiv.style.width = "100%";
        mainContainerDiv.style.marginTop = "40px";
        mainContainerDiv.style.userSelect = "none";

        const translateOptionsContainer = document.createElement("div");
        const optionsHeaderSection = document.createElement("div");

        translateOptionsContainer.id = "translate_options";
        optionsHeaderSection.id = "translate_options_header_section";

        moreTranslationsButton = new TranslateOptionsButton("More translations", openMoreTranslationsSection);
        moreTranslationsButton.render(optionsHeaderSection);

        modifyWordButton = new TranslateOptionsButton("Modify word", openModifyWordSection);
        modifyWordButton.render(optionsHeaderSection);

        translateOptionsContainer.append(optionsHeaderSection);


        const shadow = mainContainerDiv.attachShadow({ mode: "open" });

        const url = chrome.runtime.getURL('content.css');
        const cssText = await fetch(url).then((response) => response.text())

        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(cssText);
        shadow.adoptedStyleSheets = [styleSheet];

        shadowRoot = mainContainerDiv.shadowRoot;

        const action_btn = shadowRoot?.querySelector("#action_btn");
        const messageContainer = shadowRoot?.querySelector("#bubble_msg_container");

        if (action_btn || messageContainer) {
            shadow.insertBefore(translateOptionsContainer, (action_btn || messageContainer))
        } else {
            shadow.append(translateOptionsContainer)
        }

        rootContainer.append(mainContainerDiv);
    } catch (error) {
        console.log(error);
        renderMessage("Something went wrong", true);
    }
}
/**
 * This file is responsible for handling interactions and rendering cumstom elements in Google Translate website
 */

/** This class if for handling checkboxes in more translation section */
class CheckboxInjector {
    static panelObservers = {};
    #containerPanel = null;
    #panelType = "";

    constructor(containerPanel, panelType) {
        this.#containerPanel = containerPanel;
        this.#panelType = panelType;
    }

    /** Injects checkboxes in each translation */
    injectCheckboxes() {
        try {
            this.#removeAllCheckboxes();
            const [translations, definitions, examples] = getDistinctWordInfo(tempWordInfo);
            if (this.#containerPanel) {

                let checkboxContainerRows = null;
                let checkboxValueClassName = null;
                let targetPanel = null;
                let targetOptions = {
                    attributes: true,
                    attributeFilter: ["class"]
                }

                switch (this.#panelType) {
                    case "translation":
                        checkboxContainerRows = this.#containerPanel.querySelectorAll(".QcsUad");
                        checkboxValueClassName = "ryNqvb";
                        targetPanel = this.#containerPanel.children[1];
                        targetOptions = {
                            childList: true,
                            subtree: true
                        };
                        break;

                    case "definition":
                        checkboxContainerRows = this.#containerPanel.querySelectorAll(".eqNifb");
                        checkboxValueClassName = "fw3eif";
                        targetPanel = this.#containerPanel.querySelector(".Sp3AF").children[0]; targetOptions = {
                            attributes: true,
                            attributeFilter: ["class"]
                        }
                        break;

                    case "example":
                        checkboxContainerRows = this.#containerPanel.querySelectorAll(".QjQRrf");
                        checkboxValueClassName = "AZPoqf";
                        targetPanel = this.#containerPanel.querySelector(".Sp3AF").children[1];
                        break;

                    default:
                        break;
                }

                checkboxContainerRows.length === 0 && (checkboxContainerRows = null);
                checkboxContainerRows.forEach(row => {

                    const checkboxValue = row.querySelector("." + checkboxValueClassName).textContent.trim()

                    const checkbox = this.#createCheckboxElement();
                    checkbox.value = checkboxValue;

                    if (this.#panelType === "translation") {

                        const randomId = this.#generateRandomId();

                        const checkboxContainer = row.querySelector(".lRu31");
                        checkboxContainer.setAttribute("container-id", randomId);
                        checkboxContainer.style.display = "flex";
                        checkboxContainer.style.alignItems = "center";

                        checkbox.setAttribute("parent-container-id", randomId);
                        checkbox.checked = translations.includes(checkboxValue);
                        checkbox.disabled = checkboxValue === translations[0];

                        checkboxContainer.insertBefore(checkbox, checkboxContainer.children[0])

                    } else if (this.#panelType === "definition" || this.#panelType === "example") {

                        checkbox.checked = this.#panelType === "definition" ? definitions.includes(checkboxValue) : examples.includes(checkboxValue);
                        row.insertBefore(checkbox, row.children[1])
                    }

                });

                this.#observePanel(targetPanel, targetOptions);
            }
        } catch (error) {
            console.log(error);
            renderMessage("Something went wrong", true);
        }
    }

    /** Handles interactions with checkboxes
     * @param {Event} e
     */
    static checkboxClickHandler = (e) => {
        try {
            const { value, checked } = e.target;
            const checkboxType = e.target.getAttribute("checkbox-type") + "s";
            const [tempTranslations, tempDefinitions, tempExamples] = getDistinctWordInfo(tempWordInfo);

            let distinctWordInfo = {
                translations: tempTranslations,
                definitions: tempDefinitions,
                examples: tempExamples
            };

            if (checked) {
                if (tempWordInfo[checkboxType]) {
                    tempWordInfo[checkboxType] += ` / ${value}`;
                } else {
                    tempWordInfo[checkboxType] = value;
                }
            } else {
                if (checkboxType === "translations") {
                    tempWordInfo[checkboxType] = tempWordInfo[checkboxType].replace(` / ${value}`, '');
                }
                else if (checkboxType === "definitions" || checkboxType === "examples") {
                    const filteredValues = distinctWordInfo[checkboxType].filter(_value => _value !== value);
                    if (filteredValues.length > 0) {
                        tempWordInfo[checkboxType] = filteredValues.reduce((prevValue, currentValue) => {
                            if (prevValue) {
                                return prevValue + " / " + currentValue
                            } else {
                                return currentValue;
                            }
                        })
                    } else {
                        tempWordInfo[checkboxType] = "";
                    }

                }
            }

            if (checkboxType === "translations") {
                const translationContainer = document.querySelector(".HwtZe");
                translationContainer.textContent = tempWordInfo.translations;
            }

            if (originalWordInfo.exists) {
                renderActionButton(isWordInfoModified() ? "update" : "delete");
            }
        } catch (error) {
            console.log(error);
            renderMessage("Something went wrong", true);
        }
    }

    /** Observes each translation container panel 
     * to see wheter a perticular checkbox got destroyed or not. If so, it re-renderes the checkbox again
     */
    #observePanel(targetPanel, targetOptions) {
        try {

            CheckboxInjector.panelObservers[this.#panelType]?.disconnect()
            CheckboxInjector.panelObservers[this.#panelType] = new MutationObserver((mutations) => {
                try {
                    const [translations, definitions, examples] = getDistinctWordInfo(tempWordInfo);

                    if (this.#panelType === "translation") {

                        for (const mutation of mutations) {
                            if (mutation.removedNodes.length > 0) {

                                const removedCheckbox = Array.from(mutation.removedNodes).find(node => node.classList.contains("translationCheckbox"));

                                if (removedCheckbox) {

                                    const parentContainerId = removedCheckbox.getAttribute("parent-container-id");
                                    const checkboxContainer = document.querySelector(`[container-id='${parentContainerId}']`)
                                    const translation = checkboxContainer.querySelector(".ryNqvb").textContent.trim();

                                    const checkbox = this.#createCheckboxElement();
                                    checkbox.setAttribute("parent-container-id", parentContainerId);
                                    checkbox.value = translation;
                                    checkbox.checked = translations.includes(translation);
                                    checkbox.disabled = translation === translations[0];

                                    checkboxContainer.insertBefore(checkbox, checkboxContainer.children[0])
                                }

                            }
                        }

                    } else if (this.#panelType === "definition" || this.#panelType === "example") {

                        const definitionCheckboxes = document.querySelectorAll("[checkbox-type='definition']")
                        const exampleCheckboxes = document.querySelectorAll("[checkbox-type='example']")


                        if (definitionCheckboxes.length === 0) {
                            const definitionContainerRows = document.querySelectorAll(".Dwvecf .eqNifb");
                            definitionContainerRows.length > 0 && definitionContainerRows.forEach(row => {

                                const definition = row.querySelector(".fw3eif").textContent.trim()

                                const checkbox = this.#createCheckboxElement();
                                checkbox.value = definition;
                                checkbox.setAttribute("checkbox-type", "definition");
                                checkbox.checked = definitions.includes(definition);

                                row.insertBefore(checkbox, row.children[1])
                            });
                        }

                        if (exampleCheckboxes.length === 0) {
                            const examplesContainerRows = document.querySelectorAll(".Dwvecf .QjQRrf");
                            examplesContainerRows.length > 0 && examplesContainerRows.forEach(row => {

                                const example = row.querySelector(".AZPoqf").textContent.trim();

                                const checkbox = this.#createCheckboxElement();
                                checkbox.value = example;
                                checkbox.setAttribute("checkbox-type", "example");
                                checkbox.checked = examples.includes(example);

                                row.insertBefore(checkbox, row.children[1])
                            });
                        }
                    }
                } catch (error) {
                    console.log(error);
                    renderMessage("Something went wrong", true);

                }
            })
            CheckboxInjector.panelObservers[this.#panelType].observe(targetPanel, targetOptions)

        } catch (error) {
            console.log(error);
            renderMessage("Something went wrong", true);
        }
    }

    #createCheckboxElement() {
        const checkbox = document.createElement("input")
        checkbox.onclick = (e) => e.stopPropagation()
        checkbox.onchange = CheckboxInjector.checkboxClickHandler
        checkbox.classList.add("translationCheckbox");
        checkbox.setAttribute("checkbox-type", this.#panelType)
        checkbox.type = "checkbox";
        checkbox.style.minWidth = "18px"
        checkbox.style.height = "18px"
        checkbox.style.marginRight = "15px"
        return checkbox;
    }

    #generateRandomId() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';

        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            id += characters.charAt(randomIndex);
        }

        return id;
    }

    #removeAllCheckboxes() {
        document.querySelectorAll(`[checkbox-type='${this.#panelType}']`).forEach(checkbox => checkbox.remove());
    }

}


/** Injects checkboxes into More translations, Definitions and Examples panel */
const insertCheckboxes = () => {
    try {

        const moreTranslationsPanel = document.querySelector(".hX7wnb");
        const sidePanel = document.querySelector(".kmXzdf");

        if (moreTranslationsPanel) {
            const moreTranslationsPanelCheckboxInjector = new CheckboxInjector(moreTranslationsPanel, "translation");
            moreTranslationsPanelCheckboxInjector.injectCheckboxes();
        }

        if (sidePanel) {
            const definitionsCheckboxInjector = new CheckboxInjector(sidePanel, "definition");
            const examplesCheckboxInjector = new CheckboxInjector(sidePanel, "example");
            definitionsCheckboxInjector.injectCheckboxes();
            examplesCheckboxInjector.injectCheckboxes();
        }

    } catch (error) {
        console.log(error);
        renderMessage("Something went wrong", true);
    }
}

/** Renders action button */
const renderTranslateOptions = async () => {
    try {
        const wordPanelButtonsContainer = document.querySelector(".FFpbKc");
        wordPanelButtonsContainer.querySelector(".r375lc").style.display = "flex"
        wordPanelButtonsContainer.querySelector(".r375lc").style.alignItems = "center"

        const wordContainer = document.querySelector(".D5aOJc");
        const word = wordContainer.textContent.trim().toLowerCase();

        if (word) {
            renderMessage("Checking...")
            chrome.runtime.sendMessage({ requestType: "CHECK_WORD_EXISTENCE", word })
        } else {
            renderActionButton("add", true)
        }

        const wordContainerObserver = new MutationObserver(() => {

            const wordContainer = document.querySelector(".D5aOJc");
            const word = wordContainer.textContent.trim().toLowerCase();

            if (!word) {
                renderActionButton("add", true)
            }
            else {
                renderMessage("Checking...")
            }

            clearTimeout(this.timeoutId)

            if (word) {
                this.timeoutId = setTimeout(() => {
                    chrome.runtime.sendMessage({ requestType: "CHECK_WORD_EXISTENCE", word })
                }, 500)
            }

        })

        wordContainerObserver.observe(wordContainer, { childList: true });

    } catch (error) {
        console.error(error);
        renderMessage("Something went wrong", true);
    }
}
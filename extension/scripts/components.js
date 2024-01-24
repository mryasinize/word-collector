/**
 * Renders appropriate action button
 * @param {string} buttonType The type of the button
 * @param {boolean} disabled Whether the button should be desabled 
 */
const renderActionButton = (buttonType, disabled = false) => {
    try {
        const isGoogleTranslatePage = window.location.hostname === "translate.google.com";
        document.querySelector("#message_container")?.remove();
        document.querySelector("#action_btn")?.remove();
        shadowRoot?.querySelector("#message_container")?.remove();
        shadowRoot?.querySelector("#action_btn")?.remove();

        const actionBtn = document.createElement("button")
        actionBtn.id = "action_btn";
        const iconContainer = document.createElement("span");
        const buttonTextContainer = document.createElement("span");

        actionBtn.disabled = disabled;
        actionBtn.style.backgroundColor = "#0175ce";
        iconContainer.style.marginRight = "8px";
        iconContainer.style.width = "20px";
        iconContainer.style.height = "20px";
        iconContainer.style.display = "flex";

        switch (buttonType) {
            case "add":
                iconContainer.innerHTML = icons.add;
                buttonTextContainer.textContent = "Add";
                actionBtn.onclick = addWordToSheet
                break;

            case "delete":
                iconContainer.innerHTML = icons.delete;
                buttonTextContainer.textContent = "Delete";
                actionBtn.style.backgroundColor = "#ff7676";
                actionBtn.onclick = deleteWordFromSheet;
                break;

            case "update":
                iconContainer.innerHTML = icons.update;
                buttonTextContainer.textContent = "Update";
                actionBtn.onclick = updateWordInSheet
                break;

            default:
                break;
        }

        actionBtn.append(iconContainer, buttonTextContainer);

        if (isGoogleTranslatePage) {
            actionBtn.style.marginLeft = "10px";
            const translationPanel = document.querySelector(".FFpbKc");
            translationPanel.children[1].appendChild(actionBtn)
        } else {
            shadowRoot?.append(actionBtn);
        }
    } catch (error) {
        console.log(error);
        renderMessage("Something went wrong", true);
    }
}

/** Renders custom messages
 * @param {string} messageText The message text
 */
const renderMessage = (messageText = "Loading...", error = false) => {
    try {
        const isGoogleTranslatePage = window.location.hostname === "translate.google.com";

        document.querySelector("#message_container")?.remove();
        document.querySelector("#action_btn")?.remove();
        shadowRoot?.querySelector("#message_container")?.remove();
        shadowRoot?.querySelector("#action_btn")?.remove();

        const messageContainerDiv = document.createElement("div");
        const messageSpan = document.createElement("span");

        messageContainerDiv.id = "message_container";
        messageContainerDiv.style.backgroundColor = error ? "#ff7676" : "#0175ce";
        messageSpan.textContent = messageText;

        if (error) {
            const icon = document.createElement("span");
            icon.style.marginRight = "8px";
            icon.style.display = "flex";
            icon.style.width = "20px";
            icon.style.height = "20px";
            icon.innerHTML = icons.error;
            messageContainerDiv.append(icon, messageSpan)
        } else {
            messageContainerDiv.append(messageSpan)
        }

        if (isGoogleTranslatePage) {
            messageContainerDiv.style.marginLeft = "10px";
            const translationPanel = document.querySelector(".FFpbKc");
            translationPanel.children[1].appendChild(messageContainerDiv);
        } else if (shadowRoot) {
            shadowRoot.append(messageContainerDiv);
        }
    } catch (error) {
        console.log(error);
    }
}
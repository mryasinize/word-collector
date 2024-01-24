const BASE_API_URL = "http://localhost:4137";
let sheetInfo = {};

const fields = document.querySelectorAll("input");
const actionButtonContainer = document.querySelector("#actionButtonContainer");
const cancelButton = document.querySelector("#cancel-btn");
const saveButton = document.querySelector("#save-btn");
const editButton = document.querySelector("#edit-btn");

const editFields = () => {

    editButton.style.display = "none";
    actionButtonContainer.style.display = "flex";
    cancelButton.onclick = cancelEdit;
    saveButton.onclick = saveSettings;

    fields.forEach(field => {
        field.readOnly = false;
        field.style.cursor = null
    });

}

const cancelEdit = () => {

    document.querySelector("#spreadsheet-id").value = sheetInfo.spreadsheetId;
    document.querySelector("#sheet-id").value = sheetInfo.sheetId;

    editButton.style.display = "block";
    actionButtonContainer.style.display = "none";
    cancelButton.onclick = null;
    saveButton.onclick = null;

    fields.forEach(field => {
        field.readOnly = true;
        field.style.cursor = "not-allowed"
    });
}

const saveSettings = async () => {
    try {

        const spreadsheetIdField = document.querySelector("#spreadsheet-id");
        const sheetIdField = document.querySelector("#sheet-id");

        const cancelButton = document.querySelector("#cancel-btn");
        const saveButton = document.querySelector("#save-btn");

        saveButton.textContent = "Saving...";

        saveButton.disabled = true;
        cancelButton.disabled = true;

        const updatedSettings = {
            spreadsheetId: spreadsheetIdField.value,
            sheetId: parseInt(sheetIdField.value)
        }

        const options = {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedSettings),
            method: "PUT"
        }

        const res = await (await fetch(`${BASE_API_URL}/updateSettings`, options)).json()

        if (!res.success) {
            throw res.error
        }

        cancelEdit();
        document.querySelector("#spreadsheet-id").value = updatedSettings.spreadsheetId;
        document.querySelector("#sheet-id").value = updatedSettings.sheetId;

    } catch (error) {
        console.log(error);
        alert("Something went wrong");
        saveButton.textContent = "Try again";
        saveButton.disabled = false;
        cancelButton.disabled = false;
    }
}

const loadSettings = async () => {
    try {

        const loadingMessageContainer = document.getElementById("loadingMessage");

        const span = document.createElement("span");
        span.textContent = "Loading settings...";

        loadingMessageContainer.children[0]?.remove();
        loadingMessageContainer.append(span);

        const res = await (await fetch(`${BASE_API_URL}/getSettings`)).json();

        if (!res.success) {
            throw res.error;
        }
        sheetInfo = res.settings;
        document.querySelector("#spreadsheet-id").value = res.settings.spreadsheetId;
        document.querySelector("#sheet-id").value = res.settings.sheetId;

        document.getElementById("settingsContainer").style.display = "block";
        loadingMessageContainer.style.display = "none";

    } catch (error) {

        console.log(error);
        alert("Something went wrong");

        const loadingMessageContainer = document.getElementById("loadingMessage");

        document.getElementById("settingsContainer").style.display = "none";
        loadingMessageContainer.style.display = "flex";

        const tryAgainButton = document.createElement("button");
        tryAgainButton.textContent = "Try again";
        tryAgainButton.onclick = loadSettings;

        loadingMessageContainer.children[0].remove();
        loadingMessageContainer.append(tryAgainButton);
    }
}

const main = () => {
    const editBtn = document.querySelector("#edit-btn");
    editBtn.onclick = editFields;
    loadSettings();
}

document.addEventListener("DOMContentLoaded", main);

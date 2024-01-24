const BASE_API_URL = "http://localhost:4137";

const options = {
    headers: {
        "Content-Type": "application/json"
    }
}

export const getTranslation = async (word) => {
    try {
        const res = await fetch(`${BASE_API_URL}/translate?word=` + word);
        if (!res.ok) {
            throw Error(res.statusText)
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.log(error)
        return {
            error: {
                message: "Something went wrong",
                originalMessage: error.message.toString()
            }
        }
    }
}

export const getWordInfo = async (word) => {
    try {
        const res = await fetch(`${BASE_API_URL}/getWord?word=` + word)
        if (!res.ok) {
            throw Error(res.statusText)
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.log(error)
        return {
            error: {
                message: "Something went wrong",
                originalMessage: error.message.toString()
            }
        }
    }
}

export const addWordInfo = async (payload) => {
    try {

        options.method = "POST";
        options.body = JSON.stringify({ payload })

        const res = await fetch(`${BASE_API_URL}/addWord`, options);
        if (!res.ok) {
            throw Error(res.statusText)
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.log(error)
        return {
            error: {
                message: "Something went wrong",
                originalMessage: error.message.toString()
            }
        }
    }
}

export const updateWordInfo = async (updatedRowData) => {
    try {

        options.method = "PUT";
        options.body = JSON.stringify({ updatedRowData })

        const res = await fetch(`${BASE_API_URL}/updateWord`, options);
        if (!res.ok) {
            throw Error(res.statusText)
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.log(error)
        return {
            error: {
                message: "Something went wrong",
                originalMessage: error.message.toString()
            }
        }
    }
}

export const deleteWordInfo = async (targetWord) => {
    try {

        options.method = "DELETE";
        options.body = JSON.stringify({ targetWord })

        const res = await fetch(`${BASE_API_URL}/deleteWord`, options);
        if (!res.ok) {
            throw Error(res.statusText)
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.log(error)
        return {
            error: {
                message: "Something went wrong",
                originalMessage: error.message.toString()
            }
        }
    }
}
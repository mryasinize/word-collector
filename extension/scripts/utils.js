const isEmpty = (text) => {
    const regx = /^\s*$/;
    return regx.test(text);
};

const getDistinctWordInfo = wordInfo => {

    const translations = wordInfo.translations?.split("/").map(translation => translation.trim()) || []
    const definitions = wordInfo.definitions?.split("/").map(definition => definition.trim()) || []
    const examples = wordInfo.examples?.split("/").map(example => example.trim()) || []

    return [translations, definitions, examples]
}

const isWordInfoModified = () => {

    const [originalTranslations, originalDefinitions, originalExamples] = getDistinctWordInfo(originalWordInfo);
    const [tempTranslations, tempDefinitions, tempExamples] = getDistinctWordInfo(tempWordInfo);

    const isModified = (tempTranslations.length !== originalTranslations.length) || (tempDefinitions.length !== originalDefinitions.length) || (tempExamples.length !== originalExamples.length) ||
        tempTranslations.some((translation) => !originalTranslations.includes(translation)) ||
        tempDefinitions.some((definition) => !originalDefinitions.includes(definition)) ||
        tempExamples.some((example) => !originalExamples.includes(example));

    return isModified;
}
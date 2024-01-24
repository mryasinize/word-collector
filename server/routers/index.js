const { Router } = require('express');
const { addWordController, deleteWordController, getSettingsController, getWordController, updateSettingsController, updateWordController, getTranslationController } = require('../controllers');

const router = Router()

router.get("/translate", getTranslationController)

router.get("/getSettings", getSettingsController)

router.put("/updateSettings", updateSettingsController)

router.get("/getWord", getWordController)

router.post("/addWord", addWordController)

router.put("/updateWord", updateWordController)

router.delete("/deleteWord", deleteWordController)

module.exports = router


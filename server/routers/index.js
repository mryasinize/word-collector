const { Router } = require('express');
const controllers = require('../controllers');

const router = Router()

router.get("/translate", controllers.getTranslationController)

router.get("/getSettings", controllers.getSettingsController)

router.put("/updateSettings", controllers.updateSettingsController)

router.get("/getWord", controllers.getWordController)

router.get("/getRandomWords", controllers.getRandomWordsController)

router.post("/addWord", controllers.addWordController)

router.put("/updateWord", controllers.updateWordController)

router.delete("/deleteWord", controllers.deleteWordController)

module.exports = router


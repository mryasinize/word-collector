const express = require('express');
const router = require('./routers');
const cors = require('cors');
const { globalErrorHandler } = require('./middlewares');
const { SheetAPI } = require('./services/sheet');
const PORT = 4137;

const server = express()
server.use(express.json())
server.use(cors())
server.use(router)
server.use(globalErrorHandler);
(async () => {
    await SheetAPI.initialize();
    server.listen(PORT, () => console.log(`[SERVER IS RUNNING AT PORT ${PORT}]`));
})()
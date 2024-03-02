const { app, BrowserWindow, ipcMain } = require('electron');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 630,
        height: 360,
        center: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        },
        frame: false,
        transparent: true,
        resizable: false
    })

    if (app.isPackaged) {
        /** 
         * Index file of react build. 
         * Make sure you moved the `static` folder and the `index.html` file from the `build` folder into the root folder (electron) and change the path of the `script` and the `link` tag to the relative path when packaging the app. 
         * For example, from => src="/static/js/main.7241b41c.js" to => src="./static/js/main.7241b41c.js" (Just add a '.').
         * Otherwise it will not work.
         */
        win.loadFile("index.html");

        // Enables Memzer to run automatically on startup. Comment this in development.
        app.setLoginItemSettings({
            openAtLogin: true,
            path: app.getPath("exe")
        })

    } else {
        // Otherwise, loading the react development version.
        win.loadURL("http://localhost:3000/");
    }

    ipcMain.on('close-app', () => {
        app.quit();
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createWindow()
})
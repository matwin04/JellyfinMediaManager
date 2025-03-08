const { app, BrowserWindow } = require("electron");
const path = require("path");
const { exec } = require("child_process");

let mainWindow;
const SERVER_URL = "http://localhost:3031"; // URL of the Express server

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false, // Security best practice
            contextIsolation: true, // Ensures Electron security
            enableRemoteModule: false,
        },
    });

    mainWindow.loadURL(SERVER_URL); // Load the Express app in Electron

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

// Start the Express server first
function startServer() {
    const serverProcess = exec("node server.js");

    serverProcess.stdout.on("data", (data) => console.log(`Server: ${data}`));
    serverProcess.stderr.on("data", (data) => console.error(`Server Error: ${data}`));

    serverProcess.on("close", (code) => console.log(`Server exited with code ${code}`));
}

app.whenReady().then(() => {
    startServer(); // Start Express server
    setTimeout(createMainWindow, 2000); // Delay to ensure server starts
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// Recreate window if app is reactivated
app.on("activate", () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});
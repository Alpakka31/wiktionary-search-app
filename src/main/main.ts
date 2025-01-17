import {
    app,
    BrowserWindow,
    ipcMain,
    Menu,
    MenuItemConstructorOptions,
    dialog,
    shell,
} from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let originalSize = { width: 800, height: 600 };

// Path to config file
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: originalSize.width,
        height: originalSize.height,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            devTools: true,
        },
        /*
            From: https://www.svgrepo.com/svg/497606/translate
            License: MIT License

            Converted to .ico with: https://redketchup.io/icon-converter
            And slightly rounded the icon.
        */
        icon: path.join(__dirname, '../../icon.ico'),
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

const createMenu = () => {
    const template: MenuItemConstructorOptions[] = [
        {
            label: 'Menu',
            submenu: [
                {
                    label: 'Go Home',
                    click() {
                        mainWindow
                            ?.loadFile(
                                path.join(__dirname, '../renderer/index.html')
                            )
                            .then(() => {
                                if (fs.existsSync(configPath)) {
                                    const config = JSON.parse(
                                        fs.readFileSync(configPath, 'utf8')
                                    );
                                    mainWindow?.webContents.send(
                                        'update-background',
                                        config.backgroundImage
                                    );
                                }
                            });
                    },
                },
                {
                    label: 'Change Background',
                    click() {
                        const result = dialog.showOpenDialogSync({
                            properties: ['openFile'],
                            filters: [
                                {
                                    name: 'Images',
                                    extensions: ['jpg', 'png', 'gif'],
                                },
                            ],
                        });
                        if (result && result[0]) {
                            if (fs.existsSync(configPath)) {
                                const correctedPath = result[0].replace(
                                    /\\/g,
                                    '/'
                                );
                                const config = JSON.parse(
                                    fs.readFileSync(configPath, 'utf8')
                                );
                                config.backgroundImage = correctedPath;
                                fs.writeFileSync(
                                    configPath,
                                    JSON.stringify(config, null, 2)
                                );

                                mainWindow?.webContents.send(
                                    'update-background',
                                    correctedPath
                                );
                            }
                        }
                    },
                },
                {
                    label: 'Remove Background',
                    click() {
                        if (fs.existsSync(configPath)) {
                            const config = JSON.parse(
                                fs.readFileSync(configPath, 'utf8')
                            );
                            config.backgroundImage = '';
                            fs.writeFileSync(
                                configPath,
                                JSON.stringify(config, null, 2)
                            );

                            mainWindow?.webContents.send(
                                'update-background',
                                ''
                            );
                        }
                    },
                },
                { type: 'separator' },
                { role: 'quit' },
            ] as MenuItemConstructorOptions[],
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' },
            ] as MenuItemConstructorOptions[],
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'toggleFullscreen' },
                { type: 'separator' },
                {
                    label: 'Restore Original Size',
                    click() {
                        mainWindow?.setSize(
                            originalSize.width,
                            originalSize.height
                        );
                    },
                },
            ] as MenuItemConstructorOptions[],
        },
        {
            role: 'window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { role: 'close' },
            ] as MenuItemConstructorOptions[],
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Source Code (GitHub)',
                    click: async () => {
                        await shell.openExternal(
                            'https://github.com/Alpakka31/wiktionary-search-app'
                        );
                    },
                },
                {
                    label: "Author's GitHub",
                    click: async () => {
                        await shell.openExternal(
                            'https://github.com/Alpakka31'
                        );
                    },
                },
            ] as MenuItemConstructorOptions[],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
};

app.on('ready', () => {
    createWindow();
    createMenu();

    if (!fs.existsSync(configPath)) {
        const defaultConfig = { backgroundImage: '' };
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    }
});

// A strict C-S-P (Client-Security-Policy):
/*
    mainWindow.webContents.session.webRequest.onHeadersReceived(
        (details: any, callback: (response: any) => void) => {
            callback({
                responseHeaders: Object.assign(
                    {
                        'Content-Security-Policy': [
                            `default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; media-src 'self'; style-src 'self'; frame-ancestors 'none'; form-action 'self';`,
                        ],
                    },
                    details.responseHeaders
                ),
            });
        }
    );
    */

let config: any;
if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

ipcMain.handle('get-config', () => {
    return config;
});

ipcMain.on('search-wiktionary', (event, arg) => {
    const searchUrl = `https://en.wiktionary.org/wiki/${arg}`;
    event.sender.send('open-url', searchUrl);
});

ipcMain.handle('load-url', (event, url) => {
    if (mainWindow) {
        mainWindow.loadURL(url);
    }
});

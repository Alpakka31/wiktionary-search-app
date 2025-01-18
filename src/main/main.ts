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

const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

const instanceLock = app.requestSingleInstanceLock();

if (!instanceLock) {
    app.on('ready', () => {
        dialog.showMessageBox({
            type: 'error',
            title: 'The program is already running!',
            message:
                'The program is already running! You are trying to open a new instance.',
        });
    });

    app.quit();
}

// Path to config file
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');

const iconPath = () => {
    if (isMac) {
        return path.join(__dirname, '../../icon.icns');
    } else if (isLinux) {
        return path.join(__dirname, '../../icon.png');
    } else {
        return path.join(__dirname, '../../icon.ico');
    }
};

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: originalSize.width,
        height: originalSize.height,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            devTools: true,
            sandbox: true,
        },
        /*
            From:
                https://www.freeicons.org/icons/iconsax
                https://github.com/Vuesax/iconsax
                
            License: GPLv3 License

            Converted to .ico with: https://redketchup.io/icon-converter
            And slightly rounded the icon.
        */
        icon: iconPath(),
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

const createMenu = () => {
    const template: MenuItemConstructorOptions[] = [
        ...(isMac
            ? [
                  {
                      label: app.name,
                      submenu: [
                          { role: 'about' },
                          { type: 'separator' },
                          { role: 'services' },
                          { type: 'separator' },
                          { role: 'hide' },
                          { role: 'hideOthers' },
                          { role: 'unhide' },
                          { type: 'separator' },
                          { role: 'quit' },
                      ] as MenuItemConstructorOptions[],
                  },
              ]
            : []),
        {
            label: 'Menu',
            submenu: [
                {
                    label: 'Go Back',
                    accelerator: isMac ? 'Option+Cmd+Down' : 'Ctrl+Down',
                    click() {
                        if (mainWindow && mainWindow.webContents) {
                            const { navigationHistory } =
                                mainWindow.webContents;

                            if (navigationHistory.canGoBack()) {
                                navigationHistory.goBack();
                            }
                        }
                    },
                },
                {
                    label: 'Go Forward',
                    accelerator: isMac ? 'Option+Cmd+Up' : 'Ctrl+Up',
                    click() {
                        if (mainWindow && mainWindow.webContents) {
                            const { navigationHistory } =
                                mainWindow.webContents;

                            if (navigationHistory.canGoForward()) {
                                navigationHistory.goForward();
                            }
                        }
                    },
                },
                {
                    label: 'Go Home',
                    accelerator: isMac ? 'Shift+Option+H' : 'Ctrl+H',
                    click() {
                        // Don't reload the home page if already there.
                        let homeUrl;
                        if (isMac || isLinux) {
                            homeUrl = `file://${path.join(__dirname, '../renderer/index.html')}`;
                        } else {
                            homeUrl = `file:///${path.join(__dirname, '../renderer/index.html')}`;
                        }

                        const fixHomeUrl = homeUrl.replace(/\\/g, '/');
                        const formattedHomeUrl = encodeURIComponent(fixHomeUrl);
                        const mainWindowUrl =
                            mainWindow?.webContents.getURL() ?? '';

                        // getURL() is mostly same as fixHomeUrl,
                        // but also contains some URI encoding.
                        // So it must first be decoded from the
                        // URI encoding format back to normal.
                        // Then decodedMainWindowUrl is encoded
                        // back to URI encoding format, so
                        // that it can be compared with formattedHomeUrl.
                        const decodedMainWindowUrl =
                            decodeURIComponent(mainWindowUrl);
                        const formattedMainWindowUrl =
                            encodeURIComponent(decodedMainWindowUrl);

                        if (
                            mainWindow &&
                            formattedMainWindowUrl !== formattedHomeUrl
                        ) {
                            mainWindow.loadFile(
                                path.join(__dirname, '../renderer/index.html')
                            );
                        }
                    },
                },
                { type: 'separator' },
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
                                    JSON.stringify(config, null, 4)
                                );

                                mainWindow?.webContents.send(
                                    'update-background',
                                    correctedPath,
                                    false
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

                            if (config.backgroundImage === '') {
                                mainWindow?.webContents.send(
                                    'update-background',
                                    '',
                                    true
                                );
                            } else {
                                config.backgroundImage = '';
                                fs.writeFileSync(
                                    configPath,
                                    JSON.stringify(config, null, 4)
                                );

                                mainWindow?.webContents.send(
                                    'update-background',
                                    '',
                                    false
                                );
                            }
                        }
                    },
                },
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit' },
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
                ...(isMac
                    ? [
                          { role: 'pasteAndMatchStyle' },
                          { role: 'delete' },
                          { role: 'selectAll' },
                          { type: 'separator' },
                          {
                              label: 'Speech',
                              submenu: [
                                  { role: 'startSpeaking' },
                                  { role: 'stopSpeaking' },
                              ] as MenuItemConstructorOptions[],
                          },
                      ]
                    : [
                          { role: 'delete' },
                          { type: 'separator' },
                          { role: 'selectAll' },
                      ]),
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
                ...(isMac
                    ? [
                          { type: 'separator' },
                          { role: 'front' },
                          { type: 'separator' },
                          { role: 'window' },
                      ]
                    : [{ role: 'close' }]),
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

    // Create a default config.json with no background image
    if (!fs.existsSync(configPath)) {
        const defaultConfig = { backgroundImage: '' };
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
    }
});

// For macOS, Cmd+W functionality: Don't kill the program when it's closed
app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});

// For macOS, Cmd+W functionality: Be able to open it again after closing it
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
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

ipcMain.on('get-config', (event) => {
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        event.returnValue = config;
    } else {
        event.returnValue = null;
    }
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


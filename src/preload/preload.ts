import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    searchWiktionary: (word: string) =>
        ipcRenderer.send('search-wiktionary', word),
    loadUrl: (url: string) => ipcRenderer.invoke('load-url', url),
    getConfig: () => ipcRenderer.sendSync('get-config'),
    onUpdateBackground: (callback: (path: string) => void) =>
        ipcRenderer.on('update-background', (event, path) => callback(path)),
});

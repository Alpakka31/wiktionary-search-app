import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    searchWiktionary: (word: string) =>
        ipcRenderer.send('search-wiktionary', word),
    loadUrl: (url: string) => ipcRenderer.invoke('load-url', url),
    getConfig: async () => await ipcRenderer.invoke('get-config'),
    onOpenUrl: (callback: (url: string) => void) =>
        ipcRenderer.on('open-url', (event, url) => callback(url)),
    onUpdateBackground: (callback: (path: string) => void) =>
        ipcRenderer.on('update-background', (event, path) => callback(path)),
});

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    searchWiktionary: (word: string) =>
        ipcRenderer.send('search-wiktionary', word),
    loadUrl: (url: string) => ipcRenderer.invoke('load-url', url),
    onOpenUrl: (callback: (url: string) => void) =>
        ipcRenderer.on('open-url', (event, url) => callback(url)),
    getConfig: () => ipcRenderer.sendSync('get-config'),
    onUpdateBackground: (
        callback: (path: string, isAlreadyRemoved: boolean) => void
    ) =>
        ipcRenderer.on('update-background', (event, path, isAlreadyRemoved) =>
            callback(path, isAlreadyRemoved)
        ),
});


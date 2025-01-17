interface Window {
    api: {
        searchWiktionary: (word: string) => void;
        loadUrl: (url: string) => void;
        getConfig: () => Promise<{ backgroundImage: string }>;
        onOpenUrl: (callback: (url: string) => void) => void;
        onUpdateBackground: (callback: (path: string) => void) => void;
    };
}

// Search for a word on Wiktionary
function searchWord() {
    const searchElement = document.getElementById(
        'search'
    ) as HTMLInputElement | null;
    const errorMessage = document.getElementById(
        'error-message'
    ) as HTMLInputElement | null;
    const customNotification = document.getElementById(
        'custom-notification'
    ) as HTMLInputElement | null;
    const notificationText = document.getElementById(
        'notification-text'
    ) as HTMLInputElement | null;

    if (searchElement) {
        const word = searchElement.value.trim();

        if (word) {
            // Show notification
            if (notificationText)
                notificationText.innerText = `Loading Wiktionary page for '${word}'...`;
            if (customNotification) customNotification.style.display = 'block';

            // Send IPC-message
            window.api.searchWiktionary(word);
        } else {
            if (errorMessage) errorMessage.style.display = 'block';
            if (customNotification) customNotification.style.display = 'none';
        }
    }
}

// Event listeners
document.getElementById('search-button')?.addEventListener('click', (e) => {
    e.preventDefault();
    searchWord();
});

document.getElementById('search')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchWord();
    }
});

// Update it when changed or removed
window.api.onUpdateBackground((path: string) => {
    document.body.style.backgroundImage = `url("${path}")`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center';
});

// Set the initial background
window.addEventListener('DOMContentLoaded', async () => {
    const config = await window.api.getConfig();

    // When config.json doesn't yet exist
    // 'config' here is undefined.
    //
    // This is just to silence an
    // error on DevTools console.
    if (config !== undefined) {
        if (config.backgroundImage !== '') {
            document.body.style.backgroundImage = `url('${config.backgroundImage}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundPosition = 'center';
        }
    }
});

window.api.onOpenUrl((url: string) => {
    window.api.loadUrl(url);
});

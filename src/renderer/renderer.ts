interface Window {
    api: {
        searchWiktionary: (word: string) => void;
        loadUrl: (url: string) => void;
        getConfig: () => { backgroundImage: string };
        onOpenUrl: (callback: (url: string) => void) => void;
        onUpdateBackground: (
            callback: (path: string, isAlreadyRemoved: boolean) => void
        ) => void;
    };
}

function showNotificationStart(message: string, isError: boolean = false) {
    const notificationText = document.getElementById(
        'notification-text'
    ) as HTMLInputElement | null;
    const customNotification = document.getElementById(
        'custom-notification'
    ) as HTMLInputElement | null;

    if (notificationText) {
        if (isError === true) {
            // #ff0000 = red
            notificationText.style.color = '#ff0000';
            notificationText.style.fontWeight = '700'; // Bold
        } else {
            // #ffffff = white
            notificationText.style.color = '#ffffff';
            notificationText.style.fontWeight = '400'; // Regular
        }
        notificationText.innerText = message;
    }
    if (customNotification) {
        customNotification.style.display = 'block';
        customNotification.classList.remove('fade-out');
        customNotification.classList.add('fade-in');
    }
}

function showNotificationEnd(animationLength: number = 2000) {
    const customNotification = document.getElementById(
        'custom-notification'
    ) as HTMLInputElement | null;
    if (customNotification) {
        customNotification.classList.remove('fade-in');
        customNotification.classList.add('fade-out');

        setTimeout(() => {
            customNotification.style.display = 'none';
            customNotification.classList.remove('fade-out');
        }, animationLength); // Animation length
    }
}

function setBackground(imagePath: string) {
    document.body.style.backgroundImage = `url("${imagePath}")`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center';
}

// Search for a word on Wiktionary
function searchWord() {
    const searchElement = document.getElementById(
        'search'
    ) as HTMLInputElement | null;

    if (searchElement) {
        const word = searchElement.value.trim();

        if (word) {
            showNotificationStart(`Loading Wiktionary page for '${word}'...`);

            const interval = setInterval(() => {
                showNotificationEnd(1000);
                clearInterval(interval);

                // Send IPC-message
                window.api.searchWiktionary(word);
            }, 1000);
        } else {
            showNotificationStart(`Please enter a word.`, true);

            const interval = setInterval(() => {
                showNotificationEnd(1800);
                clearInterval(interval);
            }, 1800);
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
window.api.onUpdateBackground((path: string, isAlreadyRemoved: boolean) => {
    if (path === '') {
        if (isAlreadyRemoved) {
            showNotificationStart(`Background is already removed...`, true);
        } else {
            showNotificationStart(`Removing background...`);
        }
    } else {
        showNotificationStart(`Changing background to '${path}'...`);
    }

    setBackground(path);

    const interval = setInterval(() => {
        showNotificationEnd(1800);
        clearInterval(interval);
    }, 1800);
});

window.addEventListener('DOMContentLoaded', () => {
    const config = window.api.getConfig();

    // When config.json doesn't yet exist
    // 'config' here is undefined.
    //
    // This is just to silence an
    // error on DevTools console.
    if (config && config.backgroundImage) {
        showNotificationStart(`Loading config.json...`);
        setBackground(config.backgroundImage);

        // Delay hiding the notifcation
        const interval = setInterval(() => {
            showNotificationEnd(1800);
            clearInterval(interval);
        }, 1800); // Notification visibility time
    }
});

window.api.onOpenUrl((url: string) => {
    window.api.loadUrl(url);
});


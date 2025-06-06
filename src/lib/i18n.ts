// src/lib/i18n.ts
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Define your namespaces (these should match your JSON file names, e.g., common.json, home.json)
const namespaces = ['home']; // Add all your relevant namespaces here
// const namespaces = ['common', 'home', 'about', 'contact', 'services', 'mailing-list']; // Add all your relevant namespaces here
const defaultNS = 'common'; // Set 'common' as the default namespace for convenience

export const supportedLngs = ['en', 'hi']; // Ensure this matches your actual supported languages
// export const supportedLngs = ['en', 'es']; // Ensure this matches your actual supported languages

// A Svelte store to keep track of the current language, in sync with i18next
export const currentLanguage = writable('en');

/**
 * Initializes the i18next instance. This should be called once, typically in +layout.svelte onMount.
 * @param lng The initial language to set.
 * @param resources Optional: Pre-loaded resources (from server-side load function) to avoid initial fetches.
 */
export async function initI18n(
    lng = 'en',
    resources?: Record<string, Record<string, string>>
) {
    console.log('--- i18n.ts initI18n START ---');
    console.log('i18n.ts: initI18n called with requested lng:', lng);

    if (!i18n.isInitialized) {
        console.log('i18n.ts: i18next not initialized, setting up...');
        await i18n
            .use(Backend) // Use Backend for loading translations over HTTP
            .use(LanguageDetector) // Use LanguageDetector to detect user's language
            .init({
                fallbackLng: 'en', // Fallback language if translation is missing
                supportedLngs, // List of supported languages
                defaultNS, // The default namespace if no namespace is specified in t()
                ns: namespaces, // Declare all available namespaces
                debug: false, // Set to true for development to see i18next logs
                interpolation: {
                    escapeValue: false, // Svelte handles escaping, no need for i18next to do it
                },
                backend: {
                    // Path to your translation files. {{lng}} and {{ns}} are placeholders.
                    loadPath: '/locales/{{lng}}/{{ns}}.json',
                },
                detection: {
                    // Order in which language detection methods are tried
                    order: ['querystring', 'cookie', 'localStorage', 'navigator'],
                    // Caches detected language for future visits
                    caches: ['cookie', 'localStorage'],
                    // Query string parameter name for language
                    lookupQuerystring: 'lang'
                },
                // If on the server, we don't have browser resources yet, so use empty object.
                // On the client, Backend will load them.
                resources: browser ? undefined : {}
            });

        // Event listener to update the Svelte store when i18next's language changes
        i18n.on('languageChanged', (newLng: string) => {
            console.log('i18n.ts: i18next languageChanged event fired, newLng:', newLng);
            currentLanguage.set(newLng); // Update the Svelte store
        });
    }

    // Add initial resources if provided (from +layout.ts load function on server/hydration)
    if (resources) {
        try {
            Object.entries(resources).forEach(([namespace, translations]) => {
                i18n.addResourceBundle(lng, namespace, translations, true, true);
            });
            console.log('i18n.ts: Added initial resources for lng:', lng);
        } catch (error) {
            console.error('i18n.ts: Failed to add initial resources:', error);
            // Continue initialization even if resource addition fails
        }
    }


    // Ensure i18next's internal language matches the requested language
    if (i18n.language !== lng) {
        console.log(`i18n.ts: i18n.language (${i18n.language}) !== requested lng (${lng}). Changing language.`);
        await i18n.changeLanguage(lng);
    } else {
        console.log(`i18n.ts: i18n.language (${i18n.language}) is already the requested lng (${lng}).`);
    }

    // Ensure the Svelte store reflects the final current i18n language
    currentLanguage.set(i18n.language);
    console.log('i18n.ts: Setting Svelte store currentLanguage to:', i18n.language);
    console.log('--- i18n.ts initI18n END ---');

    return i18n; // Return the i18next instance
}

/**
 * A wrapper for i18next's `t` function that explicitly supports namespaces.
 * This is the function you'll use in your Svelte components.
 * @param namespace The namespace (e.g., 'common', 'home').
 * @param key The translation key.
 * @param options Optional: an object for placeholder replacement.
 * @returns The translated string.
 */
export const t = (namespace: string, key: string, options?: Record<string, unknown>): string => {
    if (!namespace || !key) {
        console.warn('i18n.ts: Invalid parameters for t() function', { namespace, key });
        return key; // Return the key as fallback
    }

    // If the namespace is the default, you can just use the key.
    // Otherwise, prepend the namespace to the key using i18next's syntax.
    if (namespace === defaultNS) {
        return i18n.t(key, options);
    }
    return i18n.t(`${namespace}:${key}`, options);
};

// Export the changeLanguage function directly from i18next for convenience
export const changeLanguage = async (lng: string) => {
    if (!supportedLngs.includes(lng)) {
        console.warn(`i18n.ts: Unsupported language requested: ${lng}. Supported languages:`, supportedLngs);
        return;
    }

    console.log('i18n.ts: Direct changeLanguage called for:', lng);
    await i18n.changeLanguage(lng);
};


// This object will be passed via setContext in +layout.svelte
// Components will then retrieve this object using getContext('i18n')
export const i18nContext = {
    t, // Your namespaced t() wrapper
    changeLanguage, // Your changeLanguage function
    currentLanguage, // The Svelte store for the current language
    supportedLngs // The array of supported languages
};

// Export the raw i18n instance as a default export for direct access if needed
export default i18n;
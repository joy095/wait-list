// src/lib/i18n.ts
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const defaultNS = 'translation';
export const supportedLngs = ['en', 'es'];

export const currentLanguage = writable('en');

export async function initI18n(lng = 'en', ns = defaultNS) {
    console.log('--- i18n.ts initI18n START ---');
    console.log('i18n.ts: initI18n called with requested lng:', lng);

    if (!i18n.isInitialized) {
        console.log('i18n.ts: i18next not initialized, setting up...');
        i18n
            .use(Backend)
            .use(LanguageDetector)
            .init({
                fallbackLng: 'en',
                supportedLngs,
                defaultNS,
                ns,
                debug: false,
                interpolation: {
                    escapeValue: false,
                },
                backend: {
                    loadPath: '/locales/{{lng}}/{{ns}}.json',
                },
                detection: {
                    order: ['querystring', 'cookie', 'localStorage', 'navigator'],
                    caches: ['cookie', 'localStorage'],
                },
                resources: browser ? undefined : {},
            });

        i18n.on('languageChanged', (newLng: string) => {
            console.log('i18n.ts: i18next languageChanged event fired, newLng:', newLng);
            currentLanguage.set(newLng); // Update the Svelte store
        });
    }

    // Check if i18next's current language is different from the requested language
    if (i18n.language !== lng) {
        console.log(`i18n.ts: i18n.language (${i18n.language}) !== requested lng (${lng}). Changing language.`);
        await i18n.changeLanguage(lng);
    } else {
        console.log(`i18n.ts: i18n.language (${i18n.language}) is already the requested lng (${lng}).`);
    }

    // Ensure the Svelte store reflects the current i18n language
    console.log('i18n.ts: Setting Svelte store currentLanguage to:', i18n.language);
    currentLanguage.set(i18n.language);
    console.log('--- i18n.ts initI18n END ---');

    return i18n;
}

export default i18n;
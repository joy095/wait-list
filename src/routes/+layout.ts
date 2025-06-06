// src/routes/+layout.ts
import { initI18n, supportedLngs } from '$lib/i18n'; // No need for defaultNS here
import type { LayoutLoad } from './$types';

// Define all your namespaces here, matching the list in your src/lib/i18n.ts
const namespaces = ['common', 'home'];
// const namespaces = ['common', 'home', 'about', 'contact', 'services', 'mailing-list'];

const allTranslations = import.meta.glob('/locales/**/*.json', { eager: true });

export const load: LayoutLoad = async ({ url }) => {
    // console.log('--- +layout.ts LOAD START ---');
    // console.log('Layout Load URL:', url.toString());

    const requestedLng = url.searchParams.get('lang');
    const actualLng = supportedLngs.includes(requestedLng || '') ? requestedLng || 'en' : 'en';

    // console.log('Layout Load Determined Lang:', actualLng);

    const i18nInstance = await initI18n(actualLng);

    const serverLoadedResources: Record<string, Record<string, string>> = {};

    // Manually reconstruct the namespaced resources from the glob import
    namespaces.forEach(ns => {
        const path = `/locales/${actualLng}/${ns}.json`;
        if (allTranslations[path]) {
            serverLoadedResources[ns] = (allTranslations[path] as { default: Record<string, string> }).default;
            // console.log(`+layout.ts: Loaded ${actualLng}/${ns}.json via glob`);
        } else {
            // console.warn(`+layout.ts: Glob did not find translations for ${actualLng}/${ns}.json`);
            serverLoadedResources[ns] = {};
        }
    });

    // console.log('Layout Load i18n.language after init/load:', i18nInstance.language);
    // console.log('Layout Load Collected Server Resources:', JSON.stringify(serverLoadedResources, null, 2));

    // console.log('--- +layout.ts LOAD END ---');
    return {
        i18n: {
            lng: i18nInstance.language,
            resources: serverLoadedResources
        }
    };
};
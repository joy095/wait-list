// src/routes/+layout.ts
import { initI18n } from '$lib/i18n';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
    // Log the URL received by the layout load function
    console.log('--- +layout.ts LOAD START ---');
    console.log('Layout Load URL:', url.toString());

    const lng = url.searchParams.get('lang') || 'en'; // Get language from URL or default to 'en'
    console.log('Layout Load Lang from URL:', lng);

    // Initialize i18n on the server
    const i18nInstance = await initI18n(lng, 'translation'); // Pass default namespace
    await i18nInstance.loadResources(); // Ensure resources are loaded
    console.log('Layout Load i18n.language after init/load:', i18nInstance.language);

    const resources = i18nInstance.services.resourceStore.data;

    console.log('--- +layout.ts LOAD END ---');
    return {
        i18n: {
            lng: i18nInstance.language,
            resources: {
                [i18nInstance.language]: {
                    translation: resources[i18nInstance.language]?.translation || {}
                }
            }
        }
    };
};
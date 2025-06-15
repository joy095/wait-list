import type { PageLoad } from './$types';

export const load: PageLoad = () => {
    const canonicalUrl = 'https://wait-list-gamma.vercel.app/contact';

    return {
        title: 'Contact us - Wait list Signup',
        description: 'Contact us for any questions or concerns. We are here to help!',
        url: canonicalUrl,
        image: 'https://wait-list-gamma.vercel.app/contact.png',
        siteName: 'Wail List for Premium Barbers & Makeup Artists',
        twitterHandle: '@JoyKarmakar9871'
    };
};

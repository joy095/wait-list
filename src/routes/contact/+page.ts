import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async () => {
    return {
        title: 'Contact us - Wait list Signup',
        description:
            'Contact us for any questions or concerns. We are here to help!',
        url: 'https://wait-list-gamma.vercel.app/contact',
        image: 'https://wait-list-gamma.vercel.app/wait-list.jpg"',
        siteName: 'Wail List for Premium Barbers & Makeup Artists',
        twitterHandle: '@JoyKarmakar9871'
    };
};

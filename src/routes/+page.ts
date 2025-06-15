// src/routes/+page.ts or +page.server.ts
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
    const baseUrl = 'https://wait-list-gamma.vercel.app'; // Fixed canonical URL

    return {
        title: 'Bookings | Premium Waitlist for Top Barbers & Makeup Artists',
        description:
            'Join the exclusive waitlist for Bookings with the best barbers and makeup artists in your city. Instant scheduling, premium service, and hassle-free appointments.',
        url: baseUrl, // Always same for OG purposes
        image: `${baseUrl}/wait-list.jpg`,
        siteName: 'Wail List for Premium Barbers & Makeup Artists',
        twitterHandle: '@JoyKarmakar9871'
    };
};

import { lucia } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const actions = {
    default: async (event) => {
        const sessionId = event.cookies.get(lucia.sessionCookieName);
        if (sessionId) {
            await lucia.invalidateSession(sessionId);
        }

        const blankSessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(blankSessionCookie.name, blankSessionCookie.value, {
            path: '.',
            ...blankSessionCookie.attributes,
        });

        // event.locals.user = null;
        // event.locals.session = null;

        throw redirect(303, '/login');
    },
} satisfies Actions;

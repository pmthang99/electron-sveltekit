// import type { Handle, RequestEvent } from '@sveltejs/kit';
// import * as db from '$lib/server/db';

// // Attach authorization to each server request (role may have changed)
// async function attachUserToRequestEvent(sessionId: string, event: RequestEvent) {
//     const session = db.getSession(sessionId);
//     console.log(session);

//     if (session) {
//         event.locals.user = session.user;
//     }
// }

// // Invoked for each endpoint called and initially for SSR router
// export const handle: Handle = async ({ event, resolve }) => {
//     const { cookies } = event;
//     const sessionId = cookies.get('session');

//     // before endpoint or page is called
//     if (sessionId) {
//         await attachUserToRequestEvent(sessionId, event);
//     }

//     if (!event.locals.user) cookies.delete('session', { path: '/' });

//     const response = await resolve(event);

//     // after endpoint or page is called

//     return response;
// };

import { lucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(lucia.sessionCookieName);
    if (!sessionId) {
        event.locals.user = null;
        event.locals.session = null;
        return resolve(event);
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        // sveltekit types deviates from the de-facto standard
        // you can use 'as any' too
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes,
        });
    }
    if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes,
        });
    }
    event.locals.user = user;
    event.locals.session = session;
    return resolve(event);
};

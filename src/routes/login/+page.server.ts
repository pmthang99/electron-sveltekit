import type { Actions } from './$types';

import * as bcrypt from 'bcryptjs';

import { fail, redirect } from '@sveltejs/kit';
import { getUser } from '$lib/server/db';
import { lucia } from '$lib/server/auth';

export const actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');
        if (
            typeof username !== 'string' ||
            username.length < 3 ||
            username.length > 31 ||
            !/^[a-z0-9_-]+$/.test(username)
        ) {
            return fail(400, {
                message: 'Invalid username',
            });
        }
        if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
            return fail(400, {
                message: 'Invalid password',
            });
        }

        const user = getUser(username as string);
        if (!user) {
            return fail(401, {
                message: 'Invalid username or password',
            });
        }

        const valid = user && bcrypt.compareSync(password as string, user.password);
        if (!valid) {
            console.log('Invalid');
            return fail(401, {
                message: 'Invalid username or password',
            });
        }

        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes,
        });
        // const sessionId = users.createSession(user);
        // cookies.set('sessionid', sessionId, { path: '/', httpOnly: true, sameSite: 'strict' });

        // return { success: true };
        throw redirect(302, '/');
    },
} satisfies Actions;

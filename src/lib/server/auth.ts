import { Lucia, TimeSpan } from 'lucia';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import { dev } from '$app/environment';
import db from '$lib/server/db';
import type { User } from './db/types';

const adapter = new BetterSqlite3Adapter(db, {
    user: 'user',
    session: 'session',
}); // your adapter

export const lucia = new Lucia(adapter, {
    sessionExpiresIn: new TimeSpan(1, 'h'),
    sessionCookie: {
        attributes: {
            // set to `true` when using HTTPS
            secure: !dev,
            sameSite: 'strict',
            path: '/',
        },
    },
    getUserAttributes: (attributes: User) => {
        return {
            // attributes has the type of DatabaseUserAttributes
            username: attributes.username,
            role: attributes.role,
        };
    },
});

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: Omit<User, 'id'>;
    }
}

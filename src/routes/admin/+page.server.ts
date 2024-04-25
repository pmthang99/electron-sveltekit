import { Role } from '$lib/enum';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { addUser, deleteUser, listUser } from '$lib/server/db';
import { isInStringEnum } from '$lib/utils';
import bcrypt from 'bcryptjs';

const authorized = [Role.Admin];

function isAuthorized(user) {
    return authorized.includes(user.role);
}

export const load = (async ({ locals }) => {
    const { user } = locals;
    if (!user) {
        throw redirect(302, '/login?referer=/admin');
    }
    if (!isAuthorized(user)) {
        throw redirect(302, '/');
    }
    const users = listUser();

    return {
        users,
    };
}) satisfies PageServerLoad;

export const actions = {
    add: async ({ locals, request }) => {
        const user = locals.user;
        console.log(user);
        if (!user) {
            return fail(401, {
                message: 'Unauthorized',
            });
        }
        if (!isAuthorized(user)) {
            return fail(403, {
                message: 'Forbidden',
            });
        }

        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');
        const role = data.get('role');
        if (
            typeof username !== 'string' ||
            typeof password !== 'string' ||
            typeof role !== 'string' ||
            !isInStringEnum(role, Role)
        ) {
            return fail(400, {
                message: 'Bad request',
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        addUser(username, hashedPassword, role);

        return {
            success: true,
        };
    },
    delete: async ({ locals, request }) => {
        const user = locals.user;
        if (!user) {
            return fail(401, {
                message: 'Unauthorized',
            });
        }
        if (!isAuthorized(user)) {
            return fail(403, {
                message: 'Forbidden',
            });
        }
        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');
        const role = data.get('role');
        if (
            typeof username !== 'string' ||
            typeof password !== 'string' ||
            typeof role !== 'string' ||
            !(role in Role)
        ) {
            return fail(400, {
                message: 'Bad request',
            });
        }
        deleteUser(username);

        return {
            success: true,
        };
    },
} satisfies Actions;

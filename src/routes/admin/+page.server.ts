import { Role } from '$lib/enum';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { addUser, listUser } from '$lib/server/db';
import bcrypt from 'bcryptjs';

export const load = (async ({ locals }) => {
    const { user } = locals;
    const authorized = [Role.Admin];
    if (!user) {
        redirect(302, '/login?referer=/admin');
    }
    if (!authorized.includes(user.role)) {
        redirect(302, '/');
    }
    const users = listUser();

    return {
        users,
    };
}) satisfies PageServerLoad;

export const actions = {
    addUser: async ({ request }) => {
        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');
        const role = data.get('role');
        if (
            typeof username !== 'string' ||
            typeof password !== 'string' ||
            typeof role !== 'string'
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
} satisfies Actions;

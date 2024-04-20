import { addDepartment, listDepartment, removeDepartment } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { Role } from '$lib/server/db/types';

export const load = (async ({ depends, locals }) => {
    const { user } = locals;
    const authorized = [Role.Admin];
    if (!user || !authorized.includes(user.role)) {
        throw redirect(302, '/login?referer=/units');
    }
    const departments = listDepartment();
    depends('app:refresh');
    return {
        departments,
    };
}) satisfies PageServerLoad;

export const actions = {
    add: async ({ request }) => {
        const data = await request.formData();
        const departmentName = data.get('name');
        if (typeof departmentName !== 'string') {
            return {
                error: true,
                message: 'Bad request',
            };
        }
        addDepartment(departmentName);

        return {
            success: true,
        };
    },
    remove: async ({ request }) => {
        const data = await request.formData();
        removeDepartment(data.get('id') as string);
        return { success: true };
    },
} satisfies Actions;

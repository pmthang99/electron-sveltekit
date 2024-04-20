import { Role } from '$lib/enum';
import { listItemDepartment } from '$lib/server/db';
import { ItemType } from '$lib/server/db/types';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const itemType = ItemType.Document;

export const load = (async ({ locals, url }) => {
    const user = locals.user;
    const authorized = [Role.Admin, Role.User];

    if (!user) {
        throw redirect(302, '/login');
    }
    if (!authorized.includes(user.role)) {
        throw redirect(302, '/');
    }

    const itemName = url.searchParams.get('itemName') as string;
    const departmentId = parseInt(url.searchParams.get('departmentId') as string);
    if (departmentId && itemName) {
        const full = true;
        const result = listItemDepartment(itemType, departmentId, itemName, full);
        return { result };
    }
    return {};
}) satisfies PageServerLoad;

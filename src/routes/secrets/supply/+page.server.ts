import { Role } from '$lib/enum';
import { listItemStorage, supplyItemV2 } from '$lib/server/db';
import { ItemType, type Item } from '$lib/server/db/types';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const itemType = ItemType.Secret;

export const load = (async ({ locals, url }) => {
    const { user } = locals;
    const authorized = [Role.Admin];

    if (!user) {
        throw redirect(302, '/login');
    }
    if (!authorized.includes(user.role)) {
        throw redirect(302, '/');
    }

    if (url.searchParams.has('itemName')) {
        const itemName = url.searchParams.get('itemName') as string;
        const storageItems = listItemStorage(itemType, itemName) as Item[];
        return { storageItems };
    }
    return {};
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const date = formData.get('date') as string;
        const departmentId = parseInt(formData.get('departmentId') as string);
        const itemList = JSON.parse(formData.get('itemList') as string);
        console.log(departmentId);
        console.log(itemList);
        const resultIds = supplyItemV2(itemList, departmentId, date);
        // const results = supplyItem(item_id, department_id, quantity, date);
        return { success: true, data: resultIds };
    },
} satisfies Actions;

import { Role } from '$lib/enum';
import { listItemStorage, listItemStorageName, supplyItemV2 } from '$lib/server/db';
import { ItemType, type Item } from '$lib/server/db/types';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const itemType = ItemType.Document;

export const load = (async ({ locals, url }) => {
    const { user } = locals;
    const authorized = [Role.Admin];

    if (!user) {
        redirect(302, '/login');
    }
    if (!authorized.includes(user.role)) {
        redirect(302, '/');
    }

    const storageNames = listItemStorageName(itemType);

    if (url.searchParams.has('item')) {
        const itemName = url.searchParams.get('item');
        const storageItems = listItemStorage(itemType, itemName) as Item[];
        return { storageItems, storageNames };
    }

    return { storageNames };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const date = formData.get('date') as string;
        const departmentId = parseInt(formData.get('departmentId') as string);
        const itemList = JSON.parse(formData.get('itemList') as string);
        const resultIds = supplyItemV2(itemList, departmentId, date);
        return { success: true, data: resultIds };
    },
} satisfies Actions;

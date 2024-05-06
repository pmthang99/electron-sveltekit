import { Role } from '$lib/enum';
import {
    listEquipmentStorageByName,
    listEquipmentStorageDistinct,
    supplyEquipment,
} from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
    const { user } = locals;
    const authorized = [Role.Admin];

    if (!user) {
        redirect(302, '/login');
    }
    if (!authorized.includes(user.role)) {
        redirect(302, '/');
    }

    const storageNames = listEquipmentStorageDistinct();

    if (url.searchParams.has('item')) {
        const itemName = url.searchParams.get('item');
        const storageItems = listEquipmentStorageByName(itemName);
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
        const resultIds = supplyEquipment(itemList, departmentId, date);
        return { success: true, data: resultIds };
    },
} satisfies Actions;

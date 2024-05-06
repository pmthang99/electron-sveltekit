import { Role } from '$lib/enum';
import {
    listEquipmentDepartmentByName,
    listEquipmentDepartmentDistinct,
    returnEquipment,
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

    const departmentId = parseInt(url.searchParams.get('departmentId'));
    const itemName = url.searchParams.get('item');
    if (!departmentId) {
        return {};
    }
    const itemDepartmentNameList = listEquipmentDepartmentDistinct(departmentId);

    if (!itemName) {
        return {
            itemDepartmentNameList,
        };
    }
    const items = listEquipmentDepartmentByName(departmentId, itemName);
    return { items, itemDepartmentNameList };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const date = formData.get('date') as string;
        const departmentId = parseInt(formData.get('departmentId') as string);
        const itemList = JSON.parse(formData.get('itemList') as string);
        const resultIds = returnEquipment(itemList, departmentId, date);
        return { success: true, data: resultIds };
    },
} satisfies Actions;

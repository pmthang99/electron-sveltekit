import { listItemDepartment, listItemDepartmentName, returnItemV2 } from '$lib/server/db';
import { ItemType, type Item } from '$lib/server/db/types';
import type { Actions, PageServerLoad } from './$types';

const itemType = ItemType.Secret;

export const load = (async ({ url }) => {
    const departmentId = parseInt(url.searchParams.get('departmentId'));
    const itemName = url.searchParams.get('itemName');
    if (!departmentId) {
        return {};
    }
    const itemDepartmentNameList = listItemDepartmentName(itemType, departmentId) as {
        name: string;
    }[];

    if (!itemName) {
        return {
            itemDepartmentNameList,
        };
    }
    const items = listItemDepartment(itemType, departmentId, itemName) as Item[];
    return { items, itemDepartmentNameList };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const date = formData.get('date') as string;
        const departmentId = parseInt(formData.get('departmentId') as string);
        const itemList = JSON.parse(formData.get('itemList') as string);
        console.log(itemList);
        const resultIds = returnItemV2(itemList, departmentId, date);
        return { success: true, data: resultIds };
    },
} satisfies Actions;

import { listDepartment, listItemName } from '$lib/server/db';
import { ItemType } from '$lib/server/db/types';
import type { LayoutServerLoad } from './$types';

const itemType = ItemType.Document;

export const load = (async () => {
    const itemNameList = listItemName(itemType);
    const departments = listDepartment();
    return {
        itemNameList,
        departments,
    };
}) satisfies LayoutServerLoad;

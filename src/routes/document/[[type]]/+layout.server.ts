import { listDepartment, listItemName } from '$lib/server/db';
import { ItemType } from '$lib/server/db/types';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params }) => {
    const itemType = params.type === 'secret' ? ItemType.Secret : ItemType.Document;
    const itemNameList = listItemName(itemType);
    const departments = listDepartment();
    return {
        itemNameList,
        departments,
    };
}) satisfies LayoutServerLoad;

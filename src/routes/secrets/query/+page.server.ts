import { listItemDepartment } from '$lib/server/db';
import { ItemType } from '$lib/server/db/types';
import type { PageServerLoad } from './$types';

const itemType = ItemType.Secret;

export const load = (async ({ url }) => {
    const itemName = url.searchParams.get('itemName') as string;
    const departmentId = parseInt(url.searchParams.get('departmentId') as string);
    if (departmentId && itemName) {
        const full = true;
        const result = listItemDepartment(itemType, departmentId, itemName, full);
        return { result };
    }
    return {};
}) satisfies PageServerLoad;

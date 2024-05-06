import { listDepartment, listEquipmentDistinct } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load = (async () => {
    const itemNameList = listEquipmentDistinct();
    const departments = listDepartment();
    return {
        itemNameList,
        departments,
    };
}) satisfies LayoutServerLoad;

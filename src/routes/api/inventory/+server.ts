import { listInventory } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    const result = listInventory(null, data.department_id, data.item_id);
    return Response.json({ result });
};
import { returnItem } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const formData = await request.formData();
    const date = formData.get('date') as string;
    const department_id = parseInt(formData.get('department_id') as string);
    const item_id = parseInt(formData.get('item_id') as string);
    const quantity = parseInt(formData.get('quantity') as string);
    const results = returnItem(item_id, department_id, quantity, date);
    return new Response(JSON.stringify({ success: true, data: results }), {
        headers: { 'Content-Type': 'application/json' },
    });
};

import { viewTransactionsByIds } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    const result = viewTransactionsByIds(data.ids);
    return Response.json({ result });
};
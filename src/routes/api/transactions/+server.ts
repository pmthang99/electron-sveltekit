import { viewTransactionsByIds } from '$lib/server/db';
import { exportWord } from '$lib/server/word';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    const department = data.department;
    const action = data.action;
    const itemType = data.itemType;
    const transactionType = data.transactionType;
    const result = viewTransactionsByIds(data.ids);
    if (action === 'download') {
        return new Response(
            await exportWord(
                {
                    date: new Date().toISOString().split('T')[0],
                    department,
                    transactions: result,
                },
                itemType,
                transactionType,
            ),
            {
                headers: {
                    'Content-Type':
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': `attachment; filename="document.docx"`,
                },
            },
        );
    }
    return Response.json({ result });
};

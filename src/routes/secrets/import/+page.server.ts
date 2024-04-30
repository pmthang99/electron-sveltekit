import { importItems, listItem } from '$lib/server/db';
import { ItemType } from '$lib/server/db/types';
import { fail, redirect } from '@sveltejs/kit';
import * as xlsx from 'xlsx';
import type { PageServerLoad } from './$types';
import { Role } from '$lib/enum';

const itemType = ItemType.Secret;

export const load = (({ locals }) => {
    const { user } = locals;
    const authorized = [Role.Admin];

    if (!user) {
        redirect(302, '/login');
    }
    if (!authorized.includes(user.role)) {
        redirect(302, '/');
    }

    const items = listItem(itemType);
    return {
        items,
    };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file.name || file.name === 'undefined') {
            return fail(400, {
                error: true,
                message: 'You must provide a file to upload',
            });
        }

        _handleFileUpload(file);

        return {
            success: true,
        };
    },
};

function _handleFileUpload(file: File) {
    file.arrayBuffer().then((buffer) => {
        const workbook = xlsx.read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false });

        const headerRow: any = data.shift();
        const nameCol = headerRow.findIndex((e: string) => e === 'Tài liệu');
        const codeCol = headerRow.findIndex((e: string) => e === 'Mã tài liệu') ?? null;
        const quantityCol = headerRow.findIndex((e: string) => e === 'Số lượng');
        const authorCol = headerRow.findIndex((e: string) => e === 'Tác giả');
        const yearCol = headerRow.findIndex((e: string) => e === 'Năm');
        const noteCol = headerRow.findIndex((e: string) => e === 'Ghi chú');

        const itemList = [];
        for (const row of data) {
            const name = row[nameCol];
            const code = codeCol ? row[codeCol] : null;
            const quantity = row[quantityCol];
            const author = authorCol ? row[authorCol] : null;
            const year = yearCol ? row[yearCol] : null;
            const note = noteCol ? row[noteCol] : null;
            itemList.push({
                name,
                type: itemType,
                code,
                quantity,
                author,
                year,
                note,
            });
        }
        importItems(itemList);
    });
}

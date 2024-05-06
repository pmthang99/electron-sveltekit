import { Role } from '$lib/enum';
import { importEquipment, listEquipment } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import * as xlsx from 'xlsx';
import type { PageServerLoad } from './$types';

export const load = (({ locals }) => {
    const { user } = locals;
    const authorized = [Role.Admin];

    if (!user) {
        redirect(302, '/login');
    }
    if (!authorized.includes(user.role)) {
        redirect(302, '/');
    }

    const items = listEquipment();
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
        const nameCol = headerRow.findIndex((e: string) => e === 'Trang bị');
        const codeCol = headerRow.findIndex((e: string) => e === 'Mã trang bị') ?? null;
        const quantityCol = headerRow.findIndex((e: string) => e === 'Số lượng');
        const syncCol = headerRow.findIndex((e: string) => e === 'Đồng bộ');
        const beforeStatusCol = headerRow.findIndex((e: string) => e === 'Tình trạng khi cấp');
        const afterStatusCol = headerRow.findIndex((e: string) => e === 'Tình trạng khi trả');

        const itemList = [];
        for (const row of data) {
            const name = row[nameCol];
            const code = codeCol ? row[codeCol] : null;
            const quantity = row[quantityCol];
            const sync = syncCol ? row[syncCol] : null;
            const before_status = beforeStatusCol ? row[beforeStatusCol] : null;
            const after_status = afterStatusCol ? row[afterStatusCol] : null;
            itemList.push({
                name,
                code,
                quantity,
                sync,
                before_status,
                after_status,
            });
        }
        importEquipment(itemList);
    });
}

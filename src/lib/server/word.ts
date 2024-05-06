import { ItemType, TransactionType } from '$lib/enum';
import { createReport } from 'docx-templates';
import fs from 'fs';
import type { Transaction } from './db/types';

export async function exportWord(
    data: { date: string; department: string; transactions: Transaction[] },
    itemType: ItemType,
    transactionType: TransactionType,
) {
    const preparedData = {
        day: data.date.split('-')[2],
        month: data.date.split('-')[1],
        year: data.date.split('-')[0],
        department: data.department,
        transactions: data.transactions,
    };

    let template: Buffer;
    if (itemType === ItemType.Equipment) {
        if (transactionType === TransactionType.Supply) {
            template = fs.readFileSync('./templates/equipment-supply.docx');
        } else {
            template = fs.readFileSync('./templates/equipment-return.docx');
        }
    } else {
        if (transactionType === TransactionType.Supply) {
            template = fs.readFileSync('./templates/document-supply.docx');
        } else {
            template = fs.readFileSync('./templates/document-return.docx');
        }
    }

    return createReport({ template, data: preparedData });
}

export interface User {
    id: string;
    username: string;
    password: string;
    role: string;
}

export interface Session {}

export interface Department {
    id: number;
    name: string;
    is_deleted: boolean;
}

export interface Item {
    id: number;
    name: string;
    type: ItemType;
    code?: string;
    author?: string;
    year?: string;
    note?: string;
    supply_date?: string;
    return_date?: string;
    quantity: number;
}

export interface Inventory {
    id: number;
    code: string | null;
    team_id: number | null;
    item_id: number | null;
    quantity: number;
}

export interface Transaction {
    id: number;
    item_id: number;
    code: string | null;
    quantity: number;
    department_id: number;
    transaction_type: string;
    date: string;
}

export enum ItemType {
    Document = 'document',
    Secret = 'secret',
    Equipment = 'equipment',
}

export enum TransactionType {
    Supply = 'supply',
    Return = 'return',
}

export enum Role {
    Admin = 'admin',
}

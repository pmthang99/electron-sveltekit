export interface User {
    id: number;
    username: string;
    password: string;
    role: Role;
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
    item_id: number;
    name: string;
    item_type: ItemType;
    author?: string;
    year?: string;
    code?: string;
    note?: string;
    department_id: number;
    type: TransactionType;
    quantity: number;
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

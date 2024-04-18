declare global {
    namespace App {
        interface Locals {
            user: import('lucia').User | null;
            session: import('lucia').Session | null;
        }
    }
}

// declare namespace App {
//     interface Locals {
//         user: User;
//     }
// }

interface AuthenticationResult {
    statusCode: number;
    status: string;
    user: User;
    sessionId: string;
}

interface Credential {
    username: string;
    password: string;
}

interface UserProperties {
    id: number;
    expires?: string;
    role: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dept?: string;
}

type User = UserProperties | null | undefined;

interface UserSession {
    id: string;
    user: User;
}

export {};

import { fail } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import type { Actions } from './$types';
import { getUser, updatePassword } from '$lib/server/db';

export const actions = {
    default: async ({ locals, request }) => {
        const formData = await request.formData();
        const currentPassword = formData.get('current-password');
        const newPassword = formData.get('new-password');
        const confirmPassword = formData.get('confirm-password');

        if (
            typeof currentPassword !== 'string' ||
            typeof newPassword !== 'string' ||
            typeof confirmPassword !== 'string'
        ) {
            return fail(400, {
                message: 'Invalid password',
            });
        }

        if (newPassword.length < 6 || newPassword.length > 255 || newPassword !== confirmPassword) {
            return fail(400, {
                message: 'Mật khẩu mới không hợp lệ',
            });
        }

        const { user } = locals;
        const databaseUser = getUser(user.username);
        if (!databaseUser) {
            console.log('User not found in database');
            return fail(500, {
                message: 'Internal server error',
            });
        }

        const valid = databaseUser && bcrypt.compareSync(currentPassword, databaseUser.password);
        if (!valid) {
            return fail(401, {
                message: 'Mật khẩu hiện tại không chính xác',
            });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        updatePassword(databaseUser.id, hashedPassword);
        return { success: true };
    },
} satisfies Actions;

<script lang="ts">
    import { enhance } from '$app/forms';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import type { ActionData } from './$types';

    export let form: ActionData;
    let open = true;
</script>

<Dialog.Root>
    <Dialog.Content class="max-w-[500px]">
        <form method="post" use:enhance>
            <Dialog.Header>
                <Dialog.Title>Đổi mật khẩu</Dialog.Title>
            </Dialog.Header>
            <div class="grid gap-4 py-4">
                <div class="grid grid-cols-3 items-center gap-4">
                    <Label for="current-password" class="text-left">Mật khẩu hiện tại</Label>
                    <Input id="current-password" type="password" class="col-span-2" />
                </div>
                <div class="grid grid-cols-3 items-center gap-4">
                    <Label for="new-password" class="text-left">Mật khẩu mới</Label>
                    <Input id="new-password" type="password" class="col-span-2" />
                </div>
                <div class="grid grid-cols-3 items-center gap-4">
                    <Label for="confirm-password" class="text-left">Xác nhận</Label>
                    <Input id="confirm-password" type="password" class="col-span-2" />
                </div>
            </div>
            <Dialog.Footer>
                {#if form?.message}
                    <p class="text-red-500">{form.message}</p>
                {/if}
                <Button type="submit">Xác nhận</Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>

<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { page } from '$app/stores';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Button } from './components/ui/button';
    import { Input } from './components/ui/input';
    import { Label } from './components/ui/label';
    export let open: boolean;
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="max-w-[500px]">
        <form
            method="post"
            action="/auth/change-password"
            use:enhance={() => {
                return async ({ result }) => {
                    // if (result.type === 'success') {
                    //     open = false;
                    // }
                    await applyAction(result);
                };
            }}
        >
            <Dialog.Header>
                <Dialog.Title>Đổi mật khẩu</Dialog.Title>
            </Dialog.Header>
            <div class="grid gap-4 py-4">
                <div class="grid grid-cols-3 items-center gap-4">
                    <Label for="current-password" class="text-left">Mật khẩu hiện tại</Label>
                    <Input
                        id="current-password"
                        name="current-password"
                        type="password"
                        class="col-span-2"
                    />
                </div>
                <div class="grid grid-cols-3 items-center gap-4">
                    <Label for="new-password" class="text-left">Mật khẩu mới</Label>
                    <Input
                        id="new-password"
                        name="new-password"
                        type="password"
                        class="col-span-2"
                    />
                </div>
                <div class="grid grid-cols-3 items-center gap-4">
                    <Label for="confirm-password" class="text-left">Xác nhận</Label>
                    <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        class="col-span-2"
                    />
                </div>
            </div>
            <Dialog.Footer>
                {#if $page.form?.message}
                    <p class="text-red-500">{$page.form.message}</p>
                {:else if $page.form?.success}
                    <p class="text-green-500">Đổi mật khẩu thành công</p>
                {/if}
                <Button type="submit">Xác nhận</Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>

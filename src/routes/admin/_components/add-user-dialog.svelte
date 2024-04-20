<script lang="ts">
    import { applyAction, deserialize, enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import { Button, buttonVariants } from '$lib/components/ui/button';
    import {
        Dialog,
        DialogContent,
        DialogFooter,
        DialogHeader,
        DialogTitle,
        DialogTrigger,
    } from '$lib/components/ui/dialog';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import * as Select from '$lib/components/ui/select';
    import { Role } from '$lib/enum';
    import type { ActionResult } from '@sveltejs/kit';

    let open = false;
    let isLoading = false;
    let selectedRole;
    // export let handleSubmit: (arg: string) => any;
    const formData = {
        username: '',
        password: '',
        role: '',
    };

    async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
        if (!selectedRole.value) {
            console.log('bthc');
            return;
        }
        isLoading = true;

        const data = new FormData(event.currentTarget);
        data.set('role', selectedRole.value);
        console.log(data);

        const response = await fetch(event.currentTarget.action, {
            method: 'POST',
            body: data,
        });

        const result: ActionResult = deserialize(await response.text());

        if (result.type === 'success') {
            // rerun all `load` functions, following the successful update
            await invalidateAll();
        }

        applyAction(result);

        isLoading = false;
        open = false;

        // setTimeout(() => {
        //     isLoading = false;
        // }, 3000);
    }
</script>

<Dialog bind:open>
    <DialogTrigger class={buttonVariants({ variant: 'outline' })}>Thêm tài khoản</DialogTrigger>
    <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
            <DialogTitle>Thêm tài khoản</DialogTitle>
        </DialogHeader>
        <div class="gap-4 py-4">
            <div class="items-center gap-4">
                <form
                    class="grid grid-cols-4 items-center gap-4"
                    id="form"
                    method="POST"
                    action="?/addUser"
                    on:submit|preventDefault={handleSubmit}
                >
                    <Label for="username" class="text-right">Tên tài khoản</Label>
                    <Input id="username" name="username" class="col-span-3" required />
                    <Label for="password" class="text-right">Mật khẩu</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        class="col-span-3"
                        required
                    />
                    <Label for="role" class="text-right">Vai trò</Label>
                    <Select.Root
                        name="role"
                        selected={selectedRole}
                        onSelectedChange={(select) => {
                            select && (selectedRole = select);
                        }}
                    >
                        <Select.Trigger class="col-span-3">
                            <Select.Value placeholder="Chọn vai trò" />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value={Role.Admin}>Quản trị viên</Select.Item>
                            <Select.Item value={Role.User}>Người dùng</Select.Item>
                        </Select.Content>
                    </Select.Root>
                    <Button class="col-start-4" type="submit" disabled={isLoading}>Thêm</Button>
                </form>
            </div>
        </div>
    </DialogContent>
</Dialog>

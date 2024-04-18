<script lang="ts">
    import { enhance } from '$app/forms';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { cn } from '$lib/utils.js';
    import { Loader } from 'lucide-svelte';

    let className: string | undefined | null = undefined;
    let message: string | null | undefined = undefined;
    export { className as class, message };

    let isLoading = false;

    async function onSubmit() {
        isLoading = true;

        // fetch('/login', {
        //     method: 'POST',
        //     body: new FormData(document.querySelector('form')),
        // }).finally(() => {
        //     isLoading = false;
        // });
    }
</script>

<div class={cn('grid gap-6', className)} {...$$restProps}>
    <!-- <form method="post" action="/login" on:submit={onSubmit} use:enhance> -->
    <form method="post" use:enhance>
        <div class="grid gap-2">
            <div class="grid gap-1">
                <Label class="sr-only" for="username">Email</Label>
                <Input
                    id="username"
                    name="username"
                    placeholder="Tên đăng nhập"
                    autocapitalize="none"
                    autocomplete="username"
                    autocorrect="off"
                    disabled={isLoading}
                />
            </div>
            <div class="grid gap-1">
                <Label class="sr-only" for="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    placeholder="Mật khẩu"
                    type="password"
                    autocapitalize="none"
                    autocomplete="password"
                    autocorrect="off"
                    disabled={isLoading}
                />
            </div>
            <div class="grid gap-1">
                {#if message}
                    <p class="text-danger">{message}</p>
                {/if}
                <Button type="submit" disabled={isLoading} class="mt-10">
                    {#if isLoading}
                        <Loader class="mr-2 h-4 w-4 animate-spin" />
                    {/if}
                    Đăng nhập
                </Button>
            </div>
        </div>
    </form>
</div>

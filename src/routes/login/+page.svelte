<script lang="ts">
    import { enhance } from '$app/forms';
    import { Button } from '$lib/components/ui/button';
    import CardContent from '$lib/components/ui/card/card-content.svelte';
    import Card from '$lib/components/ui/card/card.svelte';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import type { ActionData } from './$types';
    export let form: ActionData;
</script>

<div
    class="container relative hidden h-[800px] flex-col items-center justify-center md:flex lg:max-w-none lg:px-0"
>
    <Card>
        <CardContent class="lg:p-8">
            <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div class="grid gap-6">
                    <form method="post">
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
                                />
                            </div>
                            <div class="grid gap-1">
                                {#if form?.message}
                                    <p class="text-red-500">{form.message}</p>
                                {/if}
                                <Button type="submit" class="mt-10">Đăng nhập</Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </CardContent>
    </Card>
</div>

<script lang="ts">
    import type { LayoutServerData } from './$types';
    import { onMount } from 'svelte';
    import { goto, beforeNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { loginSession } from '../stores';
    import '../app.pcss';
    import '../app.scss';
    import SideBar from '$lib/SideBar.svelte';
    import Header from '$lib/Header.svelte';
    import { Card, CardContent } from '$lib/components/ui/card';
    import CardHeader from '$lib/components/ui/card/card-header.svelte';
    import { writable, type Writable } from 'svelte/store';
    import { Role } from '$lib/enum';

    export let data: LayoutServerData;
    const { user } = data;
    $loginSession = user;

    beforeNavigate(() => {
        // let expiryDate = $loginSession.expires ? new Date($loginSession.expires) : undefined;
        // if (expiryDate && expiryDate < new Date()) {
        //     goto('/login');
        //     $loginSession = null;
        // }
    });

    onMount(() => {});

    async function logout() {
        const url = '/auth/logout';
        const res = await fetch(url, {
            method: 'POST',
        });
        if (res.ok) {
            loginSession.set(undefined);
            goto('/login');
        } else {
            console.error(`Failed to logout: ${res.status} (${res.statusText})`);
        }
    }

    let title: Writable<string> = writable('');

    let items = [
        {
            title: 'Hệ thống',
            href: '/admin',
            roles: [Role.Admin],
        },
        {
            title: 'Tài liệu',
            href: '/document/',
            roles: [Role.Admin, Role.User],
            children: [
                {
                    title: 'Nhập tài liệu',
                    href: '/document/import',
                    roles: [Role.Admin],
                },
                {
                    title: 'Cấp tài liệu',
                    href: '/document/supply',
                    roles: [Role.Admin],
                },
                {
                    title: 'Trả tài liệu',
                    href: '/document/return',
                    roles: [Role.Admin],
                },
                { title: 'Tra cứu', href: '/document/query', roles: [Role.Admin, Role.User] },
            ],
        },
        {
            title: 'Tài liệu mật',
            href: '/document/secret/',
            roles: [Role.Admin, Role.User],
            children: [
                {
                    title: 'Nhập tài liệu mật',
                    href: '/document/secret/import',
                    roles: [Role.Admin],
                },
                {
                    title: 'Cấp tài liệu mật',
                    href: '/document/secret/supply',
                    roles: [Role.Admin],
                },
                {
                    title: 'Trả tài liệu mật',
                    href: '/document/secret/return',
                    roles: [Role.Admin],
                },
                {
                    title: 'Tra cứu',
                    href: '/document/secret/query',
                    roles: [Role.Admin, Role.User],
                },
            ],
        },
        {
            title: 'Trang bị',
            href: '/equipments',
            roles: [Role.Admin, Role.User],
            children: [
                {
                    title: 'Nhập trang bị',
                    href: '/equipments/import',
                    roles: [Role.Admin],
                },
                {
                    title: 'Cấp trang bị',
                    href: '/equipments/supply',
                    roles: [Role.Admin],
                },
                {
                    title: 'Trả trang bị',
                    href: '/equipments/return',
                    roles: [Role.Admin],
                },
                { title: 'Tra cứu', href: '/equipments/query', roles: [Role.Admin, Role.User] },
            ],
        },
        {
            title: 'Danh sách đơn vị',
            href: '/units',
            roles: [Role.Admin],
        },
    ];

    $: {
        const path = $page.url.pathname;
        for (let item of items) {
            if (item.children) {
                for (let child of item.children) {
                    if (path.includes(child.href)) {
                        $title = child.title;
                        break;
                    }
                }
            } else {
                if (path.includes(item.href)) {
                    $title = item.title;
                    break;
                }
            }
        }
    }
</script>

<div class="flex flex-col min-h-screen">
    {#if $page.url.pathname === '/login'}
        <slot />
    {:else}
        <Header {user} />
        <div class="flex flex-1">
            <div class="w-[100%] pt-[14%] grid lg:grid-cols-5">
                <SideBar
                    class="rounded-lg border-t border-r bg-background min-h-[100%]"
                    {items}
                    {user}
                ></SideBar>
                <div class="col-span-3 lg:col-span-4 ml-15">
                    <div class="container">
                        <Card>
                            <CardHeader class="items-center ">
                                <h2 class="font-bold text-3xl tracking-tight">
                                    {$title.toUpperCase()}
                                </h2>
                            </CardHeader>
                            <CardContent><slot /></CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
<!-- <div class="main">
    <slot />
</div> -->

<!-- <style lang="scss">
    .active {
        background-color: white;
        color: #ff3e00;
    }
</style> -->

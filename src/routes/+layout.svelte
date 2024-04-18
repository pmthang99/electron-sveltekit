<script lang="ts">
    import type { LayoutServerData } from './$types';
    import { onMount } from 'svelte';
    import { goto, beforeNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { loginSession } from '../stores';
    import '../app.pcss';
    import '../app.scss';
    import SideBar from '$lib/SideBar.svelte';
    import { Card, CardContent } from '$lib/components/ui/card';
    import CardHeader from '$lib/components/ui/card/card-header.svelte';

    export let data: LayoutServerData;

    // const { user } = data;
    // $loginSession = user;

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

    let path: string;
    let title: string;

    let items = [
        {
            title: 'Tài liệu',
            href: '/documents',
            children: [
                { title: 'Nhập tài liệu', href: '/documents/import' },
                { title: 'Cấp tài liệu', href: '/documents/supply' },
                { title: 'Trả tài liệu', href: '/documents/return' },
                { title: 'Tra cứu', href: '/documents/query' },
            ],
        },
        {
            title: 'Tài liệu mật',
            href: '/secrets',
            children: [
                { title: 'Nhập tài liệu mật', href: '/secrets/import' },
                { title: 'Cấp tài liệu mật', href: '/secrets/supply' },
                { title: 'Trả tài liệu mật', href: '/secrets/return' },
                { title: 'Tra cứu', href: '/secrets/query' },
            ],
        },
        {
            title: 'Trang bị',
            href: '/equipments',
            children: [
                { title: 'Nhập trang bị', href: '/equipments/import' },
                { title: 'Cấp trang bị', href: '/equipments/supply' },
                { title: 'Trả trang bị', href: '/equipments/return' },
                { title: 'Tra cứu', href: '/equipments/query' },
            ],
        },
        {
            title: 'Danh sách đơn vị',
            href: '/units',
        },
    ];

    $: {
        path = $page.url.pathname;
        for (let item of items) {
            if (item.href === path) {
                title = item.title;
                break;
            }
            if (item.children) {
                for (let child of item.children) {
                    if (child.href === path) {
                        title = child.title;
                        break;
                    }
                }
            }
        }
    }
</script>

<div class="pt-[14%] min-h-screen grid lg:grid-cols-5">
    <SideBar class="bg-background" {items}></SideBar>
    <div class="col-span-3 lg:col-span-4 lg:border-l ml-15">
        <div class="container">
            <Card>
                <CardHeader class="items-center">{title}</CardHeader>
                <CardContent><slot /></CardContent>
            </Card>
        </div>
    </div>
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

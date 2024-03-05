<script>
    import { page } from '$app/stores';
    import '../app.pcss';
    import '../app.scss';

    let path;

    let locations = [
        {
            name: 'Tài liệu thường',
            href: '/documents',
        },
        {
            name: 'Tài liệu mật',
            href: '/secrets',
        },
        {
            name: 'Trang bị',
            href: '/equipments',
        },
        {
            name: 'Danh sách đơn vị',
            href: '/units',
        },
    ];

    $: {
        path = $page.url.pathname;
    }
</script>

<nav class="sidenav">
    {#each locations as { name, href }}
        <a
            {href}
            class:active={path === href}
        >
            {name}
        </a>
    {/each}
</nav>

<div class="main">
    <slot />
</div>

<style lang="scss">
    .active {
        background-color: white;
        color: #ff3e00;
    }
</style>

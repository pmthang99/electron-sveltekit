<!-- Based on: https://www.w3schools.com/howto/howto_css_fixed_sidebar.asp -->

<script>
    import { page } from '$app/stores';
    import '../app.scss';

    let path;

    let locations = [
        { name: 'Tài liệu thường', href: '/documents' },
        { name: 'Tài liệu mật', href: '/secrets' },
        { name: 'Trang bị', href: '/equipments' },
        { name: 'Danh sách đơn vị', href: '/units' },
    ];

    $: path = $page.url.pathname;
</script>

<nav class="sidenav">
    <!-- {#each locations as { name, href }}
        <a {href} class:active={path === href}>{name}</a>
    {/each} -->
    <a href="/documents" class:active={path === '/documents'}
        >Tài liệu thường
    </a>
    <a href="/secrets" class:active={path === '/secrets'}>Tài liệu mật</a>
    <a href="/equipments" class:active={path === '/equipments'}>Trang bị</a>
    <a href="/units" class={path === '/units/' ? 'active' : ''}
        >Danh sách đơn vị</a
    >

    <!-- <a href="/page1">Page 1</a>
    <a href="/page2">Page 2</a>
    <a href="/page3">Page 3</a> -->
</nav>

<style lang="scss">
    .active {
        background-color: #ff3e00;
        color: white;
    }
</style>

<script>
    // import DialogChangePassword from '../routes/auth/change-password/+page.svelte';
    import DialogChangePassword from './change-password-dialog.svelte';
    export let user;
    let changePasswordDialogOpen = false;

    function isLoggedIn() {
        return user;
    }

    function toggleChangePassword() {
        changePasswordDialogOpen = !changePasswordDialogOpen;
    }
</script>

<header>
    <nav>
        <svg viewBox="0 0 2 3" aria-hidden="true">
            <path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
        </svg>
        {#if isLoggedIn()}
            <div class="user">
                Hello&nbsp;
                <span class="font-bold">{user.username.toUpperCase()}</span>
            </div>
            <ul>
                <li>
                    <!-- <a href="/auth/change-password">Đổi mật khẩu</a> -->
                    <button on:click={toggleChangePassword}>Đổi mật khẩu</button>
                </li>
                <li>
                    <form action="/logout" method="POST" class="align-middle">
                        <button type="submit">Đăng xuất</button>
                    </form>
                </li>
            </ul>
        {:else}
            <ul>
                <li>
                    <a href="/login">Đăng nhập</a>
                </li>
                <!-- <li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
                <a href="/">Home</a>
            </li>
            <li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
                <a href="/about">About</a>
            </li>
            <li aria-current={$page.url.pathname.startsWith('/sverdle') ? 'page' : undefined}>
                <a href="/sverdle">Sverdle</a>
            </li> -->
            </ul>
        {/if}
        <svg viewBox="0 0 2 3" aria-hidden="true">
            <path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
        </svg>
    </nav>
    <DialogChangePassword bind:open={changePasswordDialogOpen} />
</header>

<style>
    header {
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-between;
    }

    /* .corner {
        width: 3em;
        height: 3em;
    }

    .corner a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    .corner img {
        width: 2em;
        height: 2em;
        object-fit: contain;
    } */

    nav {
        display: flex;
        justify-content: center;
        margin-right: 100px;
        --background: rgba(255, 0, 0, 0.7);
    }

    svg {
        width: 2em;
        height: 3em;
        display: block;
    }

    path {
        fill: var(--background);
    }

    ul {
        position: relative;
        padding: 0;
        margin: 0;
        height: 3em;
        display: flex;
        justify-content: center;
        align-items: center;
        list-style: none;
        background: var(--background);
        background-size: contain;
    }

    li,
    form {
        position: relative;
        height: 100%;
    }

    /* li[aria-current='page']::before {
        --size: 6px;
        content: '';
        width: 0;
        height: 0;
        position: absolute;
        top: 0;
        left: calc(50% - var(--size));
        border: var(--size) solid transparent;
        border-top: var(--size) solid var(--color-theme-1);
    } */

    nav a,
    nav button {
        display: flex;
        height: 100%;
        align-items: center;
        padding: 0 0.5rem;
        color: var(--color-text);
        font-weight: 700;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        /* text-decoration: none; */
        transition: color 0.2s linear;
    }

    a:hover {
        color: var(--color-theme-1);
    }

    .user {
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--background);
        padding-right: 20px;
    }
</style>

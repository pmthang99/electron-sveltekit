<script lang="ts">
    import { cn } from '$lib/utils.js';
    import { page } from '$app/stores';
    import { cubicInOut } from 'svelte/easing';
    import { crossfade } from 'svelte/transition';
    import { Button, buttonVariants } from '$lib/components/ui/button';
    import {
        Accordion,
        AccordionContent,
        AccordionItem,
        AccordionTrigger,
    } from '$lib/components/ui/accordion';

    type NavItem = {
        href?: string;
        title: string;
        children?: NavItem[];
    };
    let className: string | undefined | null = undefined;
    export let items: NavItem[];
    export { className as class };

    const [send, receive] = crossfade({
        duration: 250,
        easing: cubicInOut,
    });
</script>

<nav class={cn('flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 px-3', className)}>
    {#each items as item}
        {@const isActive = $page.url.pathname === item.href}
        {#if item.children}
            <Accordion>
                <AccordionItem value={item.title}>
                    <AccordionTrigger
                        class={cn(
                            buttonVariants({
                                size: 'sm',
                                variant: 'ghost',
                            }),
                            !isActive && 'hover:underline',
                            'relative justify-start hover:bg-transparent space-y-1',
                        )}
                    >
                        <div class="flex items-center justify-start">
                            {item.title}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div class="ml-7 flex flex-col space-y-1">
                            {#each item.children as child}
                                <Button
                                    href={child.href}
                                    variant="ghost"
                                    class={cn(
                                        !isActive && 'hover:underline',
                                        'relative justify-start hover:bg-transparent space-y-1',
                                    )}
                                    data-sveltekit-noscroll
                                >
                                    {#if isActive}
                                        <div
                                            class="absolute inset-0 rounded-md bg-muted"
                                            in:send={{ key: 'active-sidebar-tab' }}
                                            out:receive={{ key: 'active-sidebar-tab' }}
                                        />
                                    {/if}
                                    <div class="relative">
                                        {child.title}
                                    </div>
                                </Button>
                            {/each}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        {:else}
            <Button
                href={item.href}
                variant="ghost"
                class={cn(
                    !isActive && 'hover:underline',
                    'relative justify-start hover:bg-transparent space-y-1',
                )}
                data-sveltekit-noscroll
            >
                {#if isActive}
                    <div
                        class="absolute inset-0 rounded-md bg-muted"
                        in:send={{ key: 'active-sidebar-tab' }}
                        out:receive={{ key: 'active-sidebar-tab' }}
                    />
                {/if}
                <div class="relative">
                    {item.title}
                </div>
            </Button>
        {/if}
    {/each}
</nav>

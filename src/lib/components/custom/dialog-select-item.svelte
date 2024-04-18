<script lang="ts">
    import { Button, buttonVariants } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { cn } from '$lib/utils';
    import { createEventDispatcher, onMount } from 'svelte';
    import type { Writable } from 'svelte/store';
    import DataTable from './data-table.svelte';

    let open: boolean;
    let items: any[];
    let selectedIds: any[] = [];
    export { items };

    onMount(() => {
        console.log('2: Mounted');
    });

    let select;
    const dispatch = createEventDispatcher();

    // function handleItemSelection(item) {
    //     if (selectedItems.includes(item)) {
    //         selectedItems = selectedItems.filter((selectedItem) => selectedItem !== item);
    //     } else {
    //         selectedItems = [...selectedItems, item];
    //     }
    // }

    function getInitialSelectedDataIds() {
        console.log('Called');
        const initialSelectedDataIds = {};
        if (selectedIds) {
            selectedIds.forEach((id) => {
                const idx = items.findIndex((item) => item.id === id);
                initialSelectedDataIds[idx.toString()] = true;
            });
        }
        return initialSelectedDataIds;
    }

    function handleConfirm() {
        if (select) {
            console.log(select);
            // selectedIds = Object.keys(select).map((idx) => items[idx].id);
            selectedIds = Object.keys(select);
        } else {
            console.log('There');
            selectedIds = [];
        }
        console.log(selectedIds);
        dispatch('confirm', selectedIds);
        open = false;
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Trigger
        class={cn(
            buttonVariants({ variant: 'outline' }),
            'w-[280px] justify-start pl-4 text-left font-normal',
        )}
    >
        {selectedIds?.length ?? 0}
    </Dialog.Trigger>
    <Dialog.Content class="max-w-[80%]">
        <Dialog.Header>
            <Dialog.Title>Chọn số lượng</Dialog.Title>
            <div class="flex-1 justify-center">
                <Button variant="outline" on:click={handleConfirm}>OK</Button>
            </div>
        </Dialog.Header>
        <div class="gap-4 py-4">
            <DataTable {items} bind:select initialSelectedDataIds={getInitialSelectedDataIds()} />
            <!-- <DataTable {items} /> -->
        </div>
    </Dialog.Content>
</Dialog.Root>
<!-- <div class="dialog">
    <h2>Select Items</h2>
    <ul>
        {#each items as item}
            <li
                class:selected={selectedItems.includes(item)}
                on:click={() => handleItemSelection(item)}
            >
                {item}
            </li>
        {/each}
    </ul>
    <div class="buttons">
        <button on:click={handleConfirm}>Confirm</button>
        <button on:click={handleCancel}>Cancel</button>
    </div>
</div> -->

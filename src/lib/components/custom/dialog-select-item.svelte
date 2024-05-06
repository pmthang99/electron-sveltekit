<script lang="ts">
    import { Button, buttonVariants } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { cn } from '$lib/utils';
    import { createEventDispatcher } from 'svelte';
    import DataTable from './data-table.svelte';

    let open: boolean;
    let items: any[];
    let selectedIds: any[] = [];
    export { items };

    let select: any;
    const dispatch = createEventDispatcher();

    // function handleItemSelection(item) {
    //     if (selectedItems.includes(item)) {
    //         selectedItems = selectedItems.filter((selectedItem) => selectedItem !== item);
    //     } else {
    //         selectedItems = [...selectedItems, item];
    //     }
    // }

    function getInitialSelectedDataIds() {
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
            selectedIds = Object.keys(select);
        } else {
            selectedIds = [];
        }
        dispatch('confirm', selectedIds);
        open = false;
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Trigger
        class={cn(
            buttonVariants({ variant: 'outline' }),
            'w-[300px] justify-start pl-4 text-left font-normal',
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
        </div>
    </Dialog.Content>
</Dialog.Root>

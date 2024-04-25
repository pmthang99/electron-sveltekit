<script lang="ts">
    import { MoreHorizontal } from 'lucide-svelte';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { Button } from '$lib/components/ui/button';
    import { invalidate } from '$app/navigation';

    export let id: string;

    const formData = new FormData();
    formData.append('id', id);

    function onDeleteClick(event) {
        // if (typeof window === 'undefined') return [];
        // window.db.teams.remove(id);
        // refresh();
        fetch('/admin?/remove', {
            method: 'POST',
            body: formData,
        })
            .then((res) => {
                if (res.ok) {
                    invalidate('app:refresh');
                    refresh();
                }
            })
            .catch((err) => {
                console.log('Error deleting unit', err);
            });
    }
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger asChild let:builder>
        <Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
            <span class="sr-only">Open menu</span>
            <MoreHorizontal class="h-4 w-4" />
        </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <DropdownMenu.Group>
            <DropdownMenu.Label>Hành động</DropdownMenu.Label>
            <DropdownMenu.Item on:click={onDeleteClick}>Xoá đơn vị</DropdownMenu.Item>
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>

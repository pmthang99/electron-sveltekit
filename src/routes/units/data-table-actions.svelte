<script lang="ts">
  import { MoreHorizontal } from "lucide-svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";

  export let id: string;
  export let refresh: () => void;

  function onDeleteClick(id: string) {
    if (typeof window === "undefined") return [];
    window.db.teams.remove(id);
    refresh();
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button
      variant="ghost"
      builders={[builder]}
      size="icon"
      class="relative h-8 w-8 p-0"
    >
      <span class="sr-only">Open menu</span>
      <MoreHorizontal class="h-4 w-4" />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Label>Hành động</DropdownMenu.Label>
      <DropdownMenu.Item on:click={() => onDeleteClick(id)}
        >Xoá đơn vị</DropdownMenu.Item
      >
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>

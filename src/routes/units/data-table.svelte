<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import {
    Render,
    Subscribe,
    createRender,
    createTable,
  } from "svelte-headless-table";
  import { writable } from "svelte/store";
  import type { Org } from "./+page.svelte";
  import DataTableActions from "./data-table-actions.svelte";
  import { onMount } from "svelte";

  export let source: Org[];

  const data = writable([]);

  const table = createTable(data);

  const columns = table.createColumns([
    table.column({
      accessor: "index",
      header: "STT",
    }),
    table.column({
      accessor: "name",
      header: "Tên đơn vị",
    }),
    table.column({
      accessor: ({ id }) => id,
      header: "",
      cell: ({ value }) => {
        return createRender(DataTableActions, { id: value, refresh });
      },
    }),
  ]);

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs } =
    table.createViewModel(columns);

  onMount(() => {
    refresh();
  });

  function refresh() {
    if (typeof window === "undefined") return [];
    source = window.db.teams.list();
    source.forEach((item) => (item.index = source.indexOf(item) + 1));
    data.set(source);
  }
</script>

<div class="rounded-md border">
  <Table.Root {...$tableAttrs}>
    <Table.Header>
      {#each $headerRows as headerRow}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
                <Table.Head {...attrs}>
                  <Render of={cell.render()} />
                </Table.Head>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Header>
    <Table.Body {...$tableBodyAttrs}>
      {#each $pageRows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
          <Table.Row {...rowAttrs}>
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell {...attrs}>
                  <Render of={cell.render()} />
                </Table.Cell>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Body>
  </Table.Root>
</div>

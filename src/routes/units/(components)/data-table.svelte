<script lang="ts">
    import * as Table from '$lib/components/ui/table';
    import { onMount } from 'svelte';
    import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
    import { addPagination } from 'svelte-headless-table/plugins';
    import { writable } from 'svelte/store';
    import DataTableActions from './data-table-actions.svelte';
    import DataTablePagination from './data-table-pagination.svelte';

    export let data: any[];

    const dataSource = writable([]);
    const table = createTable(dataSource, {
        page: addPagination(),
    });
    const columns = table.createColumns([
        table.column({
            accessor: 'index',
            header: 'STT',
        }),
        table.column({
            accessor: 'name',
            header: 'Tên đơn vị',
        }),
        table.column({
            accessor: ({ id }) => id,
            header: '',
            cell: ({ value }) => {
                return createRender(DataTableActions, { id: value, refresh });
            },
        }),
    ]);

    const tableModel = table.createViewModel(columns);
    const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = tableModel;

    onMount(() => {
        refresh();
    });

    function refresh() {
        const processData = data.map((item, index) => ({ index: index + 1, ...item }));
        $dataSource = processData;
    }
</script>

<div>
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
    <div class="flex items-center justify-end space-x-4 py-4">
        <DataTablePagination {tableModel} />
    </div>
    <!--    <Button
            variant="outline"
            size="sm"
            on:click={() => ($pageIndex = $pageIndex - 1)}
            disabled={!$hasPreviousPage}
        >
            Previous
        </Button>
        <Button
            variant="outline"
            size="sm"
            disabled={!$hasNextPage}
            on:click={() => ($pageIndex = $pageIndex + 1)}
        >
            Next
        </Button> 
    </div> -->
</div>

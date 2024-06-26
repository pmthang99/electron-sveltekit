<script lang="ts">
    import { addPagination, addTableFilter } from 'svelte-headless-table/plugins';
    import * as Table from '$lib/components/ui/table';
    import { Render, Subscribe, createTable } from 'svelte-headless-table';
    import { readable } from 'svelte/store';
    import DataTablePagination from './data-table-pagination.svelte';
    import { Input } from '$lib/components/ui/input';

    export let source: any[];

    const table = createTable(readable(source), {
        page: addPagination(),
        filter: addTableFilter({
            fn: ({ filterValue, value }) => {
                return value.toLowerCase().includes(filterValue.toLowerCase());
            },
            initialFilterValue: '',
        }),
    });

    const columns = table.createColumns([
        table.column({
            accessor: 'name',
            header: 'Tên tài liệu',
        }),
        table.column({
            accessor: 'code',
            header: 'Mã tài liệu',
            cell: ({ value }) => value ?? '--',
        }),
        table.column({
            accessor: 'quantity',
            header: 'Số lượng',
            plugins: {
                filter: { exclude: true },
            },
        }),
        table.column({
            accessor: 'author',
            header: 'Tác giả',
            cell: ({ value }) => value ?? '--',
        }),
        table.column({
            accessor: 'year',
            header: 'Năm',
            cell: ({ value }) => value ?? '--',
            plugins: {
                filter: { exclude: true },
            },
        }),
        table.column({
            accessor: 'note',
            header: 'Ghi chú',
            cell: ({ value }) => value ?? '--',
        }),
    ]);

    const tableModel = table.createViewModel(columns);
    const { headerRows, pageRows, rows, tableAttrs, tableBodyAttrs, pluginStates } = tableModel;
    const { filterValue } = pluginStates.filter;
</script>

<div>
    <div class="flex gap-10 items-center py-4">
        <Input
            class="max-w-sm"
            placeholder="Tên tài liệu..."
            type="text"
            bind:value={$filterValue}
        />
        <p>{$rows.length}</p>
    </div>
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
</div>

<script lang="ts">
    import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
    import { addPagination, addSelectedRows } from 'svelte-headless-table/plugins';
    import { readable } from 'svelte/store';
    import * as Table from '$lib/components/ui/table';
    import DataTableCheckbox from './data-table-checkbox.svelte';
    import DataTablePagination from './data-table-pagination.svelte';
    import { onDestroy, onMount } from 'svelte';

    let items: any[];
    let initialSelectedDataIds: { [key: string]: boolean };
    let select;
    export { items, select, initialSelectedDataIds };

    const table = createTable(readable(items), {
        select: addSelectedRows({ initialSelectedDataIds }),
        page: addPagination(),
    });

    const itemType = items[0].type ?? 'document';

    const columns = table.createColumns([
        table.display({
            id: 'select',
            header: (_, { pluginStates }) => {
                const { allPageRowsSelected } = pluginStates.select;
                return createRender(DataTableCheckbox, {
                    checked: allPageRowsSelected,
                    'aria-label': 'Select all',
                });
            },
            cell: ({ row }, { pluginStates }) => {
                const { getRowState } = pluginStates.select;
                const { isSelected } = getRowState(row);
                // isSelected.set(initialSelectedDataIds[row.id] ?? false);
                // console.log(row.id);
                // console.log(initialSelectedDataIds[row.id]);
                return createRender(DataTableCheckbox, {
                    checked: isSelected,
                    'aria-label': 'Select row',
                    class: 'translate-y-[2px]',
                });
            },
        }),
        table.column({
            accessor: 'name',
            header: isEquipment() ? 'Trang bị' : 'Tài liệu',
        }),
        table.column({
            accessor: 'code',
            header: isEquipment() ? 'Mã trang bị' : 'Mã tài liệu',
            cell: ({ value }) => value ?? '--',
        }),
        table.column({
            accessor: 'quantity',
            header: 'Số lượng',
        }),
        table.column({
            accessor: 'author',
            header: isEquipment() ? 'Nước sản xuất' : 'Tác giả',
            cell: ({ value }) => value ?? '--',
        }),
        table.column({
            accessor: 'year',
            header: 'Năm',
            cell: ({ value }) => value ?? '--',
        }),
        table.column({
            accessor: 'note',
            header: 'Ghi chú',
            cell: ({ value }) => value ?? '--',
        }),
    ]);

    const tableModel = table.createViewModel(columns);
    const { headerRows, pageRows, pluginStates, tableAttrs, tableBodyAttrs } = tableModel;

    const { selectedDataIds } = pluginStates.select;

    onMount(() => console.log('Mounted'));

    $: {
        console.log(initialSelectedDataIds);
        console.log($selectedDataIds);
        select = $selectedDataIds;
    }

    onDestroy(() => {
        console.log('Destroyed');
    });

    function isEquipment() {
        return itemType === 'equipment';
    }
</script>

<div class="space-y-4">
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
                {#if $pageRows.length}
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
                {:else}
                    <Table.Row>
                        <Table.Cell colspan={columns.length} class="h-24 text-center">
                            No results.
                        </Table.Cell>
                    </Table.Row>
                {/if}
            </Table.Body>
        </Table.Root>
    </div>
    <DataTablePagination {tableModel} />
</div>

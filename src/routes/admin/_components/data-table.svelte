<script lang="ts">
    import { Input } from '$lib/components/ui/input';
    import * as Table from '$lib/components/ui/table';
    import { Role } from '$lib/enum';
    import { onMount } from 'svelte';
    import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
    import { addPagination, addTableFilter } from 'svelte-headless-table/plugins';
    import { writable } from 'svelte/store';
    import AddUserDialog from './add-user-dialog.svelte';
    import DataTableActions from './data-table-actions.svelte';
    import DataTablePagination from './data-table-pagination.svelte';

    export let source: any[];
    const dataSource = writable(source);

    const table = createTable(dataSource, {
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
            accessor: 'index',
            header: 'STT',
            plugins: {
                filter: { exclude: true },
            },
        }),
        table.column({
            accessor: 'username',
            header: 'Tài khoản',
        }),
        table.column({
            accessor: 'role',
            header: 'Vai trò',
            cell: ({ value }) => {
                switch (value) {
                    case Role.Admin:
                        return 'Quản trị viên';
                    case Role.User:
                        return 'Người dùng';
                    default:
                        return '--';
                }
            },
        }),
        table.column({
            accessor: ({ username }) => username,
            header: '',
            cell: ({ value }) => {
                if (value === 'admin') return '';
                return createRender(DataTableActions, { username: value, refresh });
            },
            plugins: {
                filter: { exclude: true },
            },
        }),
    ]);

    const tableModel = table.createViewModel(columns);
    const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = tableModel;
    const { filterValue } = pluginStates.filter;

    onMount(() => {
        refresh();
    });

    function refresh() {
        const processData = source.map((item, index) => ({ index: index + 1, ...item }));
        $dataSource = processData;
    }

    $: {
        $dataSource = source.map((item, index) => ({ index: index + 1, ...item }));
    }
</script>

<div>
    <div class="flex justify-between py-4">
        <div class="flex gap-10">
            <Input
                class="max-w-sm"
                placeholder="Tên tài khoản"
                type="text"
                bind:value={$filterValue}
            />
        </div>
        <AddUserDialog />
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

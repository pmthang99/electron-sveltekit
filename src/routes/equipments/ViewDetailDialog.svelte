<script lang="ts">
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
    import * as Table from '$lib/components/ui/table';
    import { Render, Subscribe, createTable } from 'svelte-headless-table';
    import { writable } from 'svelte/store';

    export let dataSource: Array<any>;
    export let open: boolean;

    const table = createTable(writable(dataSource));
    const columns = table.createColumns([
        table.column({
            accessor: 'name',
            header: 'Trang bị',
        }),
        table.column({
            accessor: 'code',
            header: 'Mã trang bị',
            cell: ({ value }) => value ?? '--',
        }),
        table.column({
            accessor: 'quantity',
            header: 'Số lượng',
        }),
        table.column({
            accessor: 'date',
            header: 'Ngày',
        }),
        table.column({
            accessor: 'sync',
            header: 'Đồng bộ',
            cell: ({ value }) => value ?? '',
            plugins: {
                filter: { exclude: true },
            },
        }),
        table.column({
            accessor: 'before_status',
            header: 'Tình trạng khi cấp',
            cell: ({ value }) => value ?? '',
            plugins: {
                filter: { exclude: true },
            },
        }),
        table.column({
            accessor: 'after_status',
            header: 'Tình trạng khi trả',
            cell: ({ value }) => value ?? '',
            plugins: {
                filter: { exclude: true },
            },
        }),
    ]);

    const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);
</script>

<Dialog bind:open>
    <DialogContent class="max-w-[80%]">
        <DialogHeader>
            <DialogTitle>Danh sách</DialogTitle>
        </DialogHeader>
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
    </DialogContent>
</Dialog>

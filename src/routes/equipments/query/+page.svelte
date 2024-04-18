<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import Label from '$lib/components/ui/label/label.svelte';
    import * as Select from '$lib/components/ui/select';
    import * as Table from '$lib/components/ui/table';
    import { getLocalTimeZone, today } from '@internationalized/date';
    import type { DateRange } from 'bits-ui';
    import { Render, Subscribe, createTable } from 'svelte-headless-table';
    import { writable } from 'svelte/store';

    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import type { PageData } from './$types';
    export let data: PageData;

    let viewDialog = false;

    const dataSource = writable([]);
    const table = createTable(dataSource);
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
        }),
        table.column({
            accessor: 'note',
            header: 'Ghi chú',
            cell: ({ value }) => value ?? '--',
        }),
        table.column({
            accessor: 'supply_date',
            header: 'Ngày cấp',
            cell: ({ value }) => value ?? '--',
        }),
        table.column({
            accessor: 'return_date',
            header: 'Ngày trả',
            cell: ({ value }) => value ?? '--',
        }),
    ]);

    const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);

    const now = today(getLocalTimeZone());

    let value: DateRange | undefined = {
        start: now.add({ days: -10 }),
        end: now,
    };

    let input = {
        from_date: value.start,
        to_date: value.end,
        team: null,
        item: null,
    };

    function resetSearchParams() {
        $page.url.searchParams.delete('departmentId');
        $page.url.searchParams.delete('itemName');
    }

    function onQuery() {
        // fetch('/api/inventory', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         department_id: input.team.value,
        //         item_id: input.item.value,
        //     }),
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        // })
        //     .then((res) => res.json())
        //     .then((data) => {
        //         $dataSource = data.result;
        //         viewDialog = true;
        //     });

        const searchParams = new URLSearchParams();
        searchParams.set('departmentId', input.team.value);
        searchParams.set('itemName', input.item.value);
        goto(`?${searchParams.toString()}`);
        viewDialog = true;
    }

    $: {
        if (data?.result) {
            $dataSource = data.result;
        }
    }
</script>

<div class="flex justify-center">
    <div class="flex flex-col">
        <div class="mb-6">
            <Label for="unit-input" class="mb-2 block">Đơn vị</Label>
            <Select.Root selected={input.team} onSelectedChange={(value) => (input.team = value)}>
                <Select.Trigger class="w-[300px]">
                    <Select.Value placeholder="Chọn đơn vị" />
                </Select.Trigger>
                <Select.Content>
                    {#each data.departments as dept}
                        <Select.Item value={dept.id}>{dept.name}</Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>
        <div class="mb-6">
            <Label class="mb-2 block">Tài liệu</Label>
            <Select.Root selected={input.item} onSelectedChange={(value) => (input.item = value)}>
                <Select.Trigger class="w-[300px]">
                    <Select.Value placeholder="Chọn tài liệu" />
                </Select.Trigger>
                <Select.Content>
                    {#each data.itemNameList as item}
                        <Select.Item value={item.name}>{item.name}</Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>
        <div class="mb-6 text-center">
            <Button on:click={onQuery}>Tra cứu</Button>
        </div>
    </div>
</div>
<Dialog.Root
    bind:open={viewDialog}
    onOpenChange={() => {
        viewDialog = !viewDialog;
    }}
>
    <Dialog.Content class="max-w-[80%]">
        <Dialog.Header>
            <Dialog.Title>Danh sách</Dialog.Title>
        </Dialog.Header>
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
    </Dialog.Content>
</Dialog.Root>

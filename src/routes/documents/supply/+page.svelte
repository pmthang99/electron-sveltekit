<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import DialogSelectItem from '$lib/components/custom/dialog-select-item.svelte';
    import { Button, buttonVariants } from '$lib/components/ui/button';
    import { Calendar } from '$lib/components/ui/calendar';
    import { Label } from '$lib/components/ui/label';
    import * as Popover from '$lib/components/ui/popover';
    import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
    } from '$lib/components/ui/select';
    import { cn } from '$lib/utils';
    import { CalendarDate, DateFormatter, getLocalTimeZone, today } from '@internationalized/date';
    import { CalendarIcon } from 'lucide-svelte';
    import type { ComponentEvents } from 'svelte';
    import ViewDetailDialog from '../ViewDetailDialog.svelte';
    import type { ActionData, PageData } from './$types';
    import type { ActionResult } from '@sveltejs/kit';
    import { deserialize } from '$app/forms';
    export let data: PageData;
    export let form: ActionData;

    let selectedIndexes = [];

    let resultIds = null;
    let resultDetails = [];

    const df = new DateFormatter('vi-VN', {
        dateStyle: 'long',
    });

    let placeholder = today(getLocalTimeZone());

    let input = {
        date: placeholder,
        org: null,
        item: null,
        quantity: 1,
    };

    let inputItemName = undefined;
    let inputDepartment = undefined;

    let viewDialog = false;

    function onReset() {
        input = {
            date: placeholder,
            org: null,
            item: null,
            quantity: 1,
        };

        resultIds = null;
    }

    async function onSave() {
        const date = input.date.toString();
        const departmentId = inputDepartment.value;
        console.log(departmentId);
        const selectedItems = selectedIndexes.map((idx) => {
            const item = data.storageItems[idx];
            return {
                id: item.id,
                quantity: item.quantity,
            };
        });
        console.log(selectedIndexes);
        console.log(selectedItems);
        // const item_id = input.item.value;
        // const quantity = input.quantity;

        const formData = new FormData();
        formData.append('date', date);
        formData.append('departmentId', departmentId);
        formData.append('itemList', JSON.stringify(selectedItems));

        const response = await fetch($page.url.pathname, {
            method: 'POST',
            body: formData,
        });
        const result: ActionResult = deserialize(await response.text());

        // const response = await fetch('/api/documents/supply', {
        //     method: 'POST',
        //     body: formData,
        // });
        // const data = await response.json();
        // resultIds = data.data;
        console.log(result.type);
        if (result.type === 'success') {
            console.log(result.data.data);
        }
    }

    async function onView() {
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: resultIds }),
        });
        resultDetails = (await response.json()).result;
        viewDialog = true;
    }

    function onPrint() {
        console.log('Print');
    }

    function triggerFetch() {
        if (inputItemName) {
            const searchParams = new URLSearchParams($page.url.searchParams.toString());
            searchParams.set('itemName', inputItemName.value);
            goto(`?${searchParams.toString()}`);
        }
    }

    function handleConfirmEvent(event: ComponentEvents<DialogSelectItem>['confirm']) {
        selectedIndexes = event.detail;
    }
</script>

<div class="flex justify-center">
    <div class="flex flex-col">
        <div class="mb-6 grid gap-2">
            <Label class="mb-2">Ngày cấp</Label>
            <Popover.Root>
                <Popover.Trigger
                    class={cn(
                        buttonVariants({ variant: 'outline' }),
                        'w-[280px] justify-start pl-4 text-left font-normal',
                        !input.date && 'text-muted-foreground',
                    )}
                >
                    {input.date ? df.format(input.date.toDate(getLocalTimeZone())) : 'Pick a date'}
                    <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
                </Popover.Trigger>
                <Popover.Content class="w-auto p-0" side="top">
                    <Calendar
                        bind:value={input.date}
                        minValue={new CalendarDate(1900, 1, 1)}
                        maxValue={today(getLocalTimeZone())}
                        initialFocus
                    />
                </Popover.Content>
            </Popover.Root>
        </div>
        <div class="mb-6">
            <Label class="mb-2 block">Đơn vị</Label>
            <Select
                selected={inputDepartment}
                onSelectedChange={(value) => (inputDepartment = value)}
            >
                <SelectTrigger class="w-[280px]">
                    <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                    {#each data.departments as department}
                        <SelectItem value={department.id}>{department.name}</SelectItem>
                    {/each}
                </SelectContent>
            </Select>
        </div>
        <div class="mb-6">
            <Label class="mb-2 block">Tài liệu</Label>
            <Select
                selected={inputItemName}
                onSelectedChange={(value) => {
                    inputItemName = value;
                    triggerFetch();
                }}
            >
                <SelectTrigger class="w-[280px]">
                    <SelectValue placeholder="Chọn tài liệu" />
                </SelectTrigger>
                <SelectContent>
                    {#each data.itemNameList as item}
                        <SelectItem value={item.name}>{item.name}</SelectItem>
                    {/each}
                </SelectContent>
            </Select>
        </div>
        <div class="mb-6">
            <Label for="quantity" class="mb-2 block">Số lượng</Label>
            <DialogSelectItem on:confirm={handleConfirmEvent} items={data.storageItems} />
        </div>
        <div class="mb-6 flex gap-20">
            <div class="flex flex-1 justify-center gap-10">
                <Button on:click={onReset}>Reset</Button>
                <Button on:click={onSave}>Save</Button>
            </div>
            <div class="flex flex-1 justify-center gap-10">
                <Button disabled={!resultIds} on:click={onView}>View</Button>
                <Button disabled on:click={onPrint}>Print</Button>
            </div>
        </div>
        {#if viewDialog}
            <ViewDetailDialog bind:open={viewDialog} bind:dataSource={resultDetails} />
        {/if}
    </div>
</div>

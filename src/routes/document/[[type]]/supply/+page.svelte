<script lang="ts">
    import { deserialize } from '$app/forms';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import DialogSelectItem from '$lib/components/custom/dialog-select-item.svelte';
    import { Button, buttonVariants } from '$lib/components/ui/button';
    import { Calendar } from '$lib/components/ui/calendar';
    import { Input } from '$lib/components/ui/input';
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
    import type { ActionResult } from '@sveltejs/kit';
    import { CalendarIcon } from 'lucide-svelte';
    import { onMount, type ComponentEvents } from 'svelte';
    import ViewDetailDialog from '../ViewDetailDialog.svelte';
    import type { PageData } from './$types';
    export let data: PageData;

    let selected = [];

    let resultIds = null;
    let resultDetails: any[];

    const df = new DateFormatter('vi-VN', {
        dateStyle: 'long',
    });

    let placeholder = today(getLocalTimeZone());

    let input = {
        date: placeholder,
        org: null,
        item: null,
        quantity: 0,
    };

    let inputDate = placeholder;
    let inputItemName = undefined;
    let inputDepartment = undefined;

    let viewDialog = false;

    function onReset() {
        inputDate = placeholder;
        inputItemName = null;
        inputDepartment = null;
        input = {
            date: placeholder,
            org: null,
            item: null,
            quantity: 0,
        };

        resultIds = null;
        goto($page.url.pathname);
    }

    async function onSave() {
        const date = input.date.toString();
        const departmentId = inputDepartment.value;
        let selectedItems: { id: number; quantity: number }[];
        if (input.quantity > 0) {
            selectedItems = [
                {
                    id: data.storageItems[0].id,
                    quantity: input.quantity,
                },
            ];
        } else {
            selectedItems = selected.map((idx) => {
                const item = data.storageItems[idx];
                return {
                    id: item.id,
                    quantity: item.quantity,
                };
            });
        }

        const formData = new FormData();
        formData.append('date', date);
        formData.append('departmentId', departmentId);
        formData.append('itemList', JSON.stringify(selectedItems));

        const response = await fetch($page.url.pathname, {
            method: 'POST',
            body: formData,
        });
        const result: ActionResult = deserialize(await response.text());

        if (result.type === 'success') {
            resultIds = result.data.data;
        }
    }

    async function onView() {
        if (!resultDetails) {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: resultIds, action: 'view' }),
            });
            resultDetails = (await response.json()).result;
        }
        viewDialog = true;
    }

    async function onPrint() {
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ids: resultIds,
                department: inputDepartment.label,
                action: 'download',
                transactionType: 'supply',
                itemType: 'document',
            }),
        });

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.docx';
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
    }

    function onChangeValue() {
        const searchParams = new URLSearchParams($page.url.searchParams.toString());
        if (inputItemName) {
            searchParams.set('item', inputItemName.value);
            selected.splice(0, selected.length);
        }
        goto(`?${searchParams.toString()}`);
    }

    onMount(() => {
        if ($page.url.searchParams.has('departmentId')) {
            const departmentId = $page.url.searchParams.get('departmentId');
            const departmentName = data.departments.find(
                (dept) => dept.id === parseInt(departmentId),
            );
            inputDepartment = {
                value: departmentId,
                label: departmentName.name,
            };
        }
        if ($page.url.searchParams.has('item')) {
            inputItemName = {
                value: $page.url.searchParams.get('item'),
                label: $page.url.searchParams.get('item'),
            };
        }
    });

    function handleConfirmEvent(event: ComponentEvents<DialogSelectItem>['confirm']) {
        selected = event.detail;
    }
</script>

<div class="flex justify-center">
    <div class="flex flex-col">
        <div class="mb-6 mx-auto grid gap-2">
            <Label class="mb-2">Ngày cấp</Label>
            <Popover.Root>
                <Popover.Trigger
                    class={cn(
                        buttonVariants({ variant: 'outline' }),
                        'w-[300px] justify-start pl-4 text-left font-normal',
                        !input.date && 'text-muted-foreground',
                    )}
                >
                    {inputDate ? df.format(inputDate.toDate(getLocalTimeZone())) : 'Pick a date'}
                    <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
                </Popover.Trigger>
                <Popover.Content class="w-auto p-0" side="top">
                    <Calendar
                        bind:value={inputDate}
                        minValue={new CalendarDate(1900, 1, 1)}
                        maxValue={today(getLocalTimeZone())}
                        initialFocus
                    />
                </Popover.Content>
            </Popover.Root>
        </div>
        <div class="mb-6 mx-auto">
            <Label class="mb-2 block">Đơn vị</Label>
            <Select
                selected={inputDepartment}
                onSelectedChange={(value) => (inputDepartment = value)}
            >
                <SelectTrigger class="w-[300px]">
                    <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                    {#each data.departments as department}
                        <SelectItem value={department.id} label={department.name} />
                    {/each}
                </SelectContent>
            </Select>
        </div>
        <div class="mb-6 mx-auto">
            <Label class="mb-2 block">Tài liệu</Label>
            <Select
                selected={inputItemName}
                onSelectedChange={(value) => {
                    inputItemName = value;
                    onChangeValue();
                }}
            >
                <SelectTrigger class="w-[300px]">
                    <SelectValue placeholder="Chọn tài liệu" />
                </SelectTrigger>
                <SelectContent>
                    {#each data.storageNames as name}
                        <SelectItem value={name} label={name} />
                    {/each}
                </SelectContent>
            </Select>
        </div>
        <div class="mb-6 mx-auto">
            <Label for="quantity" class="mb-2 block">Số lượng</Label>
            {#if data.storageItems && data.storageItems.length > 1}
                <DialogSelectItem on:confirm={handleConfirmEvent} items={data.storageItems} />
            {:else}
                <Input class="w-[300px]" type="number" id="quantity" bind:value={input.quantity} />
            {/if}
        </div>
        <div class="mb-6 mx-auto flex gap-20">
            <div class="flex flex-1 justify-center gap-10">
                <Button on:click={onReset}>Reset</Button>
                <Button disabled={resultIds} on:click={onSave}>Save</Button>
            </div>
            <div class="flex flex-1 justify-center gap-10">
                <Button disabled={!resultIds} on:click={onView}>View</Button>
                <Button disabled={!resultIds} on:click={onPrint}>Print</Button>
            </div>
        </div>
        {#if resultDetails}
            <ViewDetailDialog bind:open={viewDialog} bind:dataSource={resultDetails} />
        {/if}
    </div>
</div>

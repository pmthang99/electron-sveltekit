<!-- <script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
    import { CalendarIcon } from 'lucide-svelte';
    import {
        type DateValue,
        DateFormatter,
        getLocalTimeZone,
        parseDate,
        CalendarDate,
        today,
    } from '@internationalized/date';

    import { Button, buttonVariants } from '$lib/components/ui/button';
    import { Calendar } from '$lib/components/ui/calendar';
    import { FormControl, FormField, FormLabel } from '$lib/components/ui/form';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import {
        Popover,
        PopoverContent,
        PopoverTrigger,
    } from '$lib/components/ui/popover';
    import { cn } from '$lib/utils';

    import type { SuperValidated, Infer } from 'sveltekit-superforms';
    import SuperDebug, { superForm } from 'sveltekit-superforms';
    import { zodClient } from 'sveltekit-superforms/adapters';
    import { toast } from 'svelte-sonner';

    import { formSchema, type FormSchema } from './schema';
    import FormFieldErrors from '$lib/components/ui/form/form-field-errors.svelte';

    let data: SuperValidated<Infer<FormSchema>> = $page.data.datePicker;
    export { data as form };

    const form = superForm(data, {
        validators: zodClient(formSchema),
        onUpdated: ({ form: f }) => {
            if (!f.valid) {
                toast.error('Please fill in all required fields');
            }
        },
    });

    const { form: formData, enhance } = form;

    const df = new DateFormatter('vi-VN', {
        dateStyle: 'medium',
    });

    let value: DateValue | string;
    $: value = $formData.date ? parseDate($formData.date) : '';
    let placeholder: DateValue = today(getLocalTimeZone());

    let units = [
        {
            name: 'Unit 1',
            value: 'unit-1',
        },
        {
            name: 'Unit 2',
            value: 'unit-2',
        },
        {
            name: 'Unit 3',
            value: 'unit-3',
        },
    ];
</script>

<form class="space-y-8" use:enhance>
    <FormField {form} name="date" class="flex flex-col">
        <FormControl let:attrs>
            <FormLabel>Date</FormLabel>
            <Popover>
                <PopoverTrigger
                    {...attrs}
                    class={cn(
                        buttonVariants({ variant: 'outline' }),
                        'w-[280px] justify-start pl-4 text-left font-normal',
                        !value && 'text-muted-foreground'
                    )}
                >
                    {value
                        ? df.format(value.toDate(getLocalTimeZone()))
                        : 'Pick a date'}
                    <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" side="top">
                    <Calendar
                        {value}
                        bind:placeholder
                        minValue={new CalendarDate(1900, 1, 1)}
                        maxValue={today(getLocalTimeZone())}
                        calendarLabel="Select a date"
                        initialForcus
                        onValueChange={(v) => {
                            if (v) {
                                $formData.date = v.toString();
                            } else {
                                $formData.date = '';
                            }
                        }}
                        class="w-auto"
                    />
                </PopoverContent>
            </Popover>
            <FormFieldErrors />
        </FormControl>
    </FormField>
    <Button type="submit">Submit</Button>
    {#if browser}
        <SuperDebug data={$formData} />
    {/if}
</form>
<!-- <div class="mb-6">
  <Label for="date" class="mb-2 block">Date</Label>
  <Input id="date-input" type="date" />
</div>
<div class="mb-6">
  <Label for="unit-input" class="mb-2 block">Unit input</Label>
  <Select id="unit-input" class="mt-2" items={units} bind:value={input.unit} />
</div>
<div class="mb-6">
  <Label for="default-input" class="mb-2 block">Default input</Label>
  <Input id="default-input" placeholder="Default input" />
</div>
<div class="mb-6">
  <Label for="quantity-input" class="mb-2 block">Quantity</Label>
  <Input id="quantity-input" type="number" />
</div>
<div class="mb-6 flex">
    <div class="flex flex-1 justify-center gap-10">
        <Button>Reset</Button>
        <Button>Save</Button>
    </div>
    <div class="flex flex-1 justify-center gap-10">
        <Button>View</Button>
        <Button>Print</Button>
    </div>
</div> -->

<script lang="ts">
  import {
    type DateValue,
    DateFormatter,
    getLocalTimeZone,
    parseDate,
    CalendarDate,
    today,
  } from "@internationalized/date";
  import { cn } from "$lib/utils";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { Calendar } from "$lib/components/ui/calendar";
  import * as Popover from "$lib/components/ui/popover";
  import * as Form from "$lib/components/ui/form";
  import { toast } from "svelte-sonner";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import {
    Select,
    SelectContent,
    SelectInput,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "$lib/components/ui/select";
  import { CalendarIcon } from "lucide-svelte";
  import ViewDetailDialog from "./ViewDetailDialog.svelte";

  const type = "DOCUMENTS";

  let orgList = loadOrgList();
  let itemList = loadItemList();

  let resultIds = null;
  let resultDetails = [];

  const df = new DateFormatter("vi-VN", {
    dateStyle: "long",
  });

  let placeholder: DateValue = today(getLocalTimeZone());

  let input = {
    date: placeholder,
    org: null,
    item: null,
    quantity: 1,
  };

  let viewDialog = false;

  function loadOrgList() {
    if (typeof window === "undefined") return;
    return window.db.teams.list();
  }

  function loadItemList() {
    if (typeof window === "undefined") return;
    return window.db.items.listByType(type);
  }

  function onReset() {
    input = {
      date: placeholder,
      org: null,
      item: null,
      quantity: 1,
    };

    resultIds = null;
  }

  function onSave() {
    if (typeof window === "undefined") return;
    const date = input.date.toString();
    const team_id = input.org.value;
    const item_id = input.item.value;
    const quantity =
      typeof input.quantity === "string"
        ? parseInt(input.quantity)
        : input.quantity;

    resultIds = window.db.items.supplyItem(item_id, team_id, quantity, date);
  }

  function onView() {
    if (typeof window === "undefined") return;
    resultDetails = window.db.transactions.viewByIds(resultIds);
    viewDialog = true;
  }

  function onPrint() {
    console.log("Print");
  }
</script>

<div class="flex justify-center">
  <div class="flex flex-col">
    <div class="mb-6 grid gap-2">
      <Label class="mb-2">Ngày cấp</Label>
      <Popover.Root>
        <Popover.Trigger
          class={cn(
            buttonVariants({ variant: "outline" }),
            "w-[280px] justify-start pl-4 text-left font-normal",
            !input.date && "text-muted-foreground"
          )}
        >
          {input.date
            ? df.format(input.date.toDate(getLocalTimeZone()))
            : "Pick a date"}
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
        selected={input.org}
        onSelectedChange={(value) => (input.org = value)}
      >
        <SelectTrigger class="w-[280px]">
          <SelectValue placeholder="Chọn đơn vị" />
        </SelectTrigger>
        <SelectContent>
          {#each orgList as org}
            <SelectItem value={org.id}>{org.name}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
    </div>
    <div class="mb-6">
      <Label class="mb-2 block">Tài liệu</Label>
      <Select
        selected={input.item}
        onSelectedChange={(value) => (input.item = value)}
      >
        <SelectTrigger class="w-[280px]">
          <SelectValue placeholder="Chọn tài liệu" />
        </SelectTrigger>
        <SelectContent>
          {#each itemList as item}
            <SelectItem value={item.id}>{item.name}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
    </div>
    <div class="mb-6">
      <Label for="quantity" class="mb-2 block">Số lượng</Label>
      <Input
        class="w-[280px]"
        type="number"
        id="quantity"
        bind:value={input.quantity}
      />
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
    {#key viewDialog}
      <ViewDetailDialog
        bind:open={viewDialog}
        bind:dataSource={resultDetails}
      />
    {/key}
  </div>
</div>

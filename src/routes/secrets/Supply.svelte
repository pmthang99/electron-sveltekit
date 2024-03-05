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

  const type = "SECRETS";

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
    if (typeof window === "undefined") return [];
    return window.db.teams.list();
  }

  function loadItemList() {
    if (typeof window === "undefined") return [];
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
    if (typeof window === "undefined") return [];
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
    if (typeof window === "undefined") return [];
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

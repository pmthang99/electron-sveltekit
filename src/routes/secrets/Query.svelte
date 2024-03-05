<script lang="ts">
  import { readable, writable } from "svelte/store";
  import { Subscribe, Render, createTable } from "svelte-headless-table";
  import type { DateRange } from "bits-ui";
  import {
    CalendarDate,
    DateFormatter,
    getLocalTimeZone,
    type DateValue,
  } from "@internationalized/date";
  import { cn } from "$lib/utils";
  import { Button } from "$lib/components/ui/button";
  import { RangeCalendar } from "$lib/components/ui/range-calendar";
  import * as Popover from "$lib/components/ui/popover";
  import Label from "$lib/components/ui/label/label.svelte";
  import * as Select from "$lib/components/ui/select";
  import { CalendarIcon } from "lucide-svelte";
  import { today } from "@internationalized/date";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Table from "$lib/components/ui/table";

  const itemType = "SECRETS";

  // let dataSource = [];
  let viewDialog = false;

  const dataSource = writable([]);
  const table = createTable(dataSource);
  const columns = table.createColumns([
    table.column({
      accessor: "name",
      header: "Tên tài liệu",
    }),
    table.column({
      accessor: "code",
      header: "Mã tài liệu",
      cell: ({ value }) => value ?? "--",
    }),
    table.column({
      accessor: "quantity",
      header: "Số lượng",
    }),
  ]);

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs } =
    table.createViewModel(columns);

  const df = new DateFormatter("vi-VN", {
    dateStyle: "medium",
  });

  const now = today(getLocalTimeZone());

  let teamList = loadTeamList();
  let itemList = loadItemList();

  let value: DateRange | undefined = {
    start: now.add({ days: -10 }),
    end: now,
  };

  let startValue: DateValue | undefined = undefined;

  let input = {
    from_date: value.start,
    to_date: value.end,
    team: null,
    item: null,
  };

  function loadTeamList() {
    if (typeof window === "undefined") return [];
    return window.db.teams.list();
  }

  function loadItemList() {
    if (typeof window === "undefined") return [];
    return window.db.items.listByType(itemType);
  }

  function onQuery() {
    if (typeof window === "undefined") return [];
    const team_id = input.team.value;
    const item_id = input.item.value;
    dataSource.set(
      window.db.inventory.listInventoryOfTeam(itemType, team_id, item_id)
    );
    viewDialog = true;
  }
</script>

<div class="flex justify-center">
  <div class="flex flex-col">
    <!--
      <div class="mb-6 grid gap-2" id="date-range">
        <Label for="date-range" class="mb-2">Chọn ngày tra cứu</Label>
        <Popover.Root openFocus>
          <Popover.Trigger asChild let:builder>
            <Button
              variant="outline"
              class={cn(
                "w-[300px] justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
              builders={[builder]}
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              {#if value && value.start}
                {#if value.end}
                  {df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
                    value.end.toDate(getLocalTimeZone())
                  )}
                {:else}
                  {df.format(value.start.toDate(getLocalTimeZone()))}
                {/if}
              {:else if startValue}
                {df.format(startValue.toDate(getLocalTimeZone()))}
              {:else}
                Pick a date
              {/if}
            </Button>
          </Popover.Trigger>
          <Popover.Content class="w-auto p-0" align="start">
            <RangeCalendar
              bind:value
              bind:startValue
              initialFocus
              numberOfMonths={2}
              placeholder={value?.start}
            />
          </Popover.Content>
        </Popover.Root>
      </div>
      -->
    <div class="mb-6">
      <Label for="unit-input" class="mb-2 block">Đơn vị</Label>
      <Select.Root
        selected={input.team}
        onSelectedChange={(value) => (input.team = value)}
      >
        <Select.Trigger class="w-[300px]">
          <Select.Value placeholder="Chọn đơn vị" />
        </Select.Trigger>
        <Select.Content>
          {#each teamList as org}
            <Select.Item value={org.id}>{org.name}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
    <div class="mb-6">
      <Label class="mb-2 block">Tài liệu</Label>
      <Select.Root
        selected={input.item}
        onSelectedChange={(value) => (input.item = value)}
      >
        <Select.Trigger class="w-[300px]">
          <Select.Value placeholder="Chọn tài liệu" />
        </Select.Trigger>
        <Select.Content>
          {#each itemList as item}
            <Select.Item value={item.id}>{item.name}</Select.Item>
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
  onOpenChange={() => (viewDialog = !viewDialog)}
>
  <Dialog.Content class="sm:max-w-[500px]">
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
                  <Subscribe
                    attrs={cell.attrs()}
                    let:attrs
                    props={cell.props()}
                  >
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

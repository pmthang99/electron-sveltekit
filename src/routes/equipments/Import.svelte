<script lang="ts">
  import ImportDataTable from "./ImportDataTable.svelte";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { onMount } from "svelte";
  import * as xlsx from "xlsx";

  const type = "EQUIPMENTS";

  let items = [];
  let dataSource = [];
  let files: FileList;

  $: if (files) {
    files[0].arrayBuffer().then((value) => {
      const workbook = xlsx.read(value);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      importData(data);
    });
  }

  onMount(() => {
    if (typeof window === "undefined") return;
    items = window.db.items.listByType(type);
    dataSource = loadData();
  });

  function loadData() {
    if (typeof window === "undefined") return [];
    return window.db.items.loadItemsInStorage(type);
  }

  function importData(data: Array<any>) {
    if (typeof window === "undefined") return;
    const headerRow = data.shift();
    const nameColumn = headerRow.findIndex((e) => e === "Tài liệu");
    const codeColumn = headerRow.findIndex((e) => e === "Mã tài liệu") ?? null;
    const quantityCol = headerRow.findIndex((e) => e === "Số lượng");

    for (const row of data) {
      window.db.items.importItem(
        row[nameColumn],
        row[codeColumn],
        type,
        row[quantityCol]
      );
    }

    dataSource = loadData();
  }
</script>

<div class="grid w-full max-w-sm items-center justify-center gap-1.5">
  {#if dataSource.length === 0}
    <Label for="file">Tập tin dữ liệu</Label>
    <input
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      bind:files
      id="file"
      type="file"
    />
  {:else}
    <!-- TODO -->
    <svelte:component this={ImportDataTable} source={dataSource} />
  {/if}
</div>

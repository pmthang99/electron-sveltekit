<script context="module" lang="ts">
  export type Org = {
    index: number;
    id: string;
    name: string;
  };
</script>

<script lang="ts">
  import { Card, CardHeader } from "$lib/components/ui/card";
  import CardContent from "$lib/components/ui/card/card-content.svelte";
  import AddDialog from "./add-dialog.svelte";
  import DataTable from "./data-table.svelte";
  import AlertDialog from "./alert-dialog.svelte";
  import { onMount } from "svelte";

  let alertDialog = false;

  let data = [];

  onMount(() => {
    data = getData();
  });

  function getData() {
    try {
      if (typeof window === "undefined") return [];
      return window.db.teams.list();
    } catch (err) {
      console.log("Error fetching data: ", err);
      return [];
    }
  }

  function handleSubmit(name: string) {
    try {
      if (typeof window === "undefined") return [];
      window.db.teams.add(name);
      data = getData();
    } catch (err) {
      console.log("Before", alertDialog);
      console.log("Error adding new org", err);
      alertDialog = true;
      console.log(alertDialog);
    }
  }
</script>

<div class="container mx-auto mt-[10%] py-10">
  <Card>
    <CardHeader class="items-center">Danh sách đơn vị</CardHeader>
    <CardContent>
      <AddDialog {handleSubmit} />
      <AlertDialog bind:open={alertDialog}></AlertDialog>
      {#key data.length}
        <DataTable bind:source={data} />
      {/key}
    </CardContent>
  </Card>
</div>

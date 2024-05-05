<script lang="ts">
    import type { PageServerData } from './$types';
    import AddDialog from './(components)/add-dialog.svelte';
    import AlertDialog from './(components)/alert-dialog.svelte';
    import DataTable from './(components)/data-table.svelte';

    export let data: PageServerData;
    let alertDialog = false;

    function handleSubmit(name: string) {
        try {
            if (typeof window === 'undefined') return [];
            window.db.teams.add(name);
            // data = getData();
        } catch (err) {
            alertDialog = true;
        }
    }
</script>

<!-- <div class="container">
    <Card>
        <CardHeader class="items-center">Danh sách đơn vị</CardHeader>
        <CardContent> -->
<AddDialog />
<AlertDialog bind:open={alertDialog}></AlertDialog>
<DataTable bind:data={data.departments} />
<!-- </CardContent>
    </Card>
</div> -->

<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Label } from '$lib/components/ui/label';
    import { Input } from '$lib/components/ui/input';
    import ImportDataTable from './(components)/data-table.svelte';

    import type { PageData } from './$types';
    export let data: PageData;
</script>

<div class="w-full items-center justify-center gap-1.5">
    {#if data.items.length === 0}
        <form method="POST" enctype="multipart/form-data">
            <Label for="file">Tập tin dữ liệu</Label>
            <Input
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                id="file"
                name="file"
                type="file"
                required
            />
            <Button type="submit">Tải file</Button>
        </form>
    {:else}
        <ImportDataTable source={data.items} />
    {/if}
</div>

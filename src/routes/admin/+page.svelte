<script lang="ts">
    import type { PageData } from './$types';
    import DataTable from './_components/data-table.svelte';

    export let data: PageData;
</script>

<DataTable source={data.users} />

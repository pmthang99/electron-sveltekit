<script lang="ts">
    import type { PageData } from './$types';
    import DataTable from './_components/data-table.svelte';

    export let data: PageData;

    $: {
        console.log(data);
    }
</script>

<DataTable source={data.users} />

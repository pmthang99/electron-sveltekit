<script lang="ts">
    import type { HTMLButtonAttributes } from 'svelte/elements';
    import type { Writable } from 'svelte/store';
    import Checkbox from '../ui/checkbox/checkbox.svelte';

    type $$Props = HTMLButtonAttributes & {
        checked: Writable<boolean>;
    };
    export let checked: Writable<boolean>;

    $: {
        console.log($checked);
    }
</script>

<Checkbox bind:checked={$checked} {...$$restProps} />

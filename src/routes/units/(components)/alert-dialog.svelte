<script lang="ts">
    import * as AlertDialog from '$lib/components/ui/alert-dialog';

    export let open: boolean;

    function toggle() {
        open = !open;
    }
</script>

<AlertDialog.Root {open} onOpenChange={toggle}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
            <AlertDialog.Description>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Action>Continue</AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

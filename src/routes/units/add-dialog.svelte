<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";

  let name = "";
  let open = false;
  export let handleSubmit: (arg: string) => any;

  function onSubmit() {
    open = false;
    handleSubmit(name);
  }
</script>

<Dialog bind:open>
  <DialogTrigger class={buttonVariants({ variant: "outline" })}>
    Thêm đơn vị
  </DialogTrigger>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Thêm đơn vị</DialogTitle>
    </DialogHeader>
    <div class="gap-4 py-4">
      <div class="items-center gap-4">
        <form
          class="grid grid-cols-4 items-center gap-4"
          id="form"
          on:submit|preventDefault={onSubmit}
        >
          <Label for="name" class="text-right">Tên đơn vị</Label>
          <Input id="name" bind:value={name} class="col-span-3" required />
          <Button class="col-start-4" type="submit" on:submit={onSubmit}
            >Thêm</Button
          >
        </form>
      </div>
    </div>
  </DialogContent>
</Dialog>

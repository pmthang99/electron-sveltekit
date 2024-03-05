<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs";
  import Import from "./Import.svelte";
  import Supply from "./Supply.svelte";
  import Return from "./Return.svelte";
  import Query from "./Query.svelte";
  import { Card, CardContent, CardHeader } from "$lib/components/ui/card";

  let subpages = [
    {
      value: "import",
      component: Import,
      title: "Nhập tài liệu mật",
    },
    {
      value: "supply",
      component: Supply,
      title: "Cấp tài liệu mật",
    },
    {
      value: "return",
      component: Return,
      title: "Trả tài liệu mật",
    },
    {
      value: "query",
      component: Query,
      title: "Tra cứu",
    },
  ];
</script>

<div class="flex justify-center mt-[20%]">
  <Tabs.Root value="import" class="w-[80%]">
    <Tabs.List class="grid w-full grid-cols-4">
      {#each subpages as subpage}
        <Tabs.Trigger value={subpage.value}>{subpage.title}</Tabs.Trigger>
      {/each}
    </Tabs.List>
    {#each subpages as subpage}
      <Tabs.Content value={subpage.value}>
        <Card>
          <CardHeader class="items-center">
            {subpage.title}
          </CardHeader>
          <CardContent class="space-y-2 items-center">
            <svelte:component this={subpage.component} />
          </CardContent>
        </Card>
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</div>

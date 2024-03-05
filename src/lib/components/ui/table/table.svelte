<script>
	import { cn } from "$lib/utils";
	let className = undefined;
	export { className as class };
</script>

<div class="w-full overflow-auto">
	<table class={cn("w-full caption-bottom text-sm", className)} {...$$restProps}>
		<slot />
	</table>
</div>

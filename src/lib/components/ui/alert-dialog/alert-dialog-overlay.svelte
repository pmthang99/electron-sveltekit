<script>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { fade } from "svelte/transition";
	let className = undefined;
	export let transition = fade;
	export let transitionConfig = {
		duration: 150,
	};
	export { className as class };
</script>

<AlertDialogPrimitive.Overlay
	{transition}
	{transitionConfig}
	class={cn("fixed inset-0 z-50 bg-background/80 backdrop-blur-sm ", className)}
	{...$$restProps}
/>

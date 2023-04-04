<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import PageContainer from '$lib/components/glue/PageContainer.svelte';
	import Textarea from '$lib/components/glue/Textarea.svelte';
	import TextInput from '$lib/components/glue/TextInput.svelte';
	import { supabase } from '$lib/glue/supabaseClient';

	let name: string = '';
	let content: string = '';

	const handleSubmit = async () => {
		const { data, error } = await supabase
			.from('post')
			.insert([{ name, content, user_id: $page.data.session?.user?.id }])
			.select('*');
		if (error) {
			console.log('error', error);
		} else {
			console.log('data', data);
			goto('/posts');
		}
	};
</script>

<PageContainer>
	<div class="flex justify-center px-4 py-6">
		<div class="w-full max-w-6xl">
			<form on:submit={handleSubmit}>
				<h1 class="text-4xl font-extrabold">New post</h1>
				<h2 class="mt-8 text-xl font-bold text-base-content/80">Information</h2>
				<div class="mt-2">
					<TextInput label="Name" bind:value={name} />
				</div>
				<div class="mt-2">
					<Textarea label="Content" bind:value={content} />
				</div>
				<button class="btn-primary btn mt-8">Create post</button>
			</form>
		</div>
	</div>
</PageContainer>

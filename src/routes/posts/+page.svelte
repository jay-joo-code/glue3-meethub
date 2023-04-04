<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import PageContainer from '$lib/components/glue/PageContainer.svelte';
	import { supabase } from '$lib/glue/supabaseClient';

	const togglePublish = async (postId, value) => {
		const { data, error } = await supabase
			.from('post')
			.update({ published: value })
			.eq('id', postId);

		if (error) {
			console.log('error', error);
		} else {
			invalidateAll();
		}
	};
</script>

<PageContainer>
	<div class="px-4 py-4">
		<a href="/new-post">
			<button class="btn-primary btn">New post</button>
		</a>
		<div class="mt-6 space-y-3">
			{#each $page?.data?.posts as post (post?.id)}
				<div class="rounded-xl bg-base-200 py-3 px-4">
					<div class="flex items-start justify-between">
						<p class="font-bold ">{post?.name}</p>

						<button
							class="btn-sm btn"
							on:click={() => {
								togglePublish(post?.id, !post?.published);
							}}>{post?.published ? 'Unpublish' : 'Publish'}</button
						>
					</div>
					<p class="mt-2 text-sm text-base-content/80">{post?.content}</p>
					<p class="mt-2 text-xs font-semibold">{post?.published ? 'Published' : 'Draft'}</p>
				</div>
			{/each}
		</div>
	</div>
</PageContainer>

<script lang="ts">
	import PageContainer from '$lib/components/glue/PageContainer.svelte';
	import Select from '$lib/components/glue/Select.svelte';
	import TextInput from '$lib/components/glue/TextInput.svelte';
	import MultiDatepicker from '$lib/components/glue/MultiDatepicker.svelte';
	import { supabase } from '$lib/glue/supabaseClient';
	import { generateTimeStamps } from '$lib/util/timestamps';
	import { goto } from '$app/navigation';

	let name: string = '';
	let earliestTime: string = '0900';
	let latestTime: string = '1700';
	let selectedDates = [];

	const createEvent = async () => {
		console.log('create event');
		const { data, error } = await supabase
			.from('event')
			.insert([
				{ name, earliest_time: earliestTime, latest_time: latestTime, dates: selectedDates }
			])
			.select('*');

		if (error) {
			console.log('error', error);
		} else {
			goto(`/event/${data[0].hash_id}`);
		}
	};
</script>

<PageContainer title="Home">
	<div class="flex justify-center">
		<form on:submit={createEvent} class="w-full max-w-[40rem] py-6">
			<h1 class="text-3xl font-extrabold">New event</h1>
			<TextInput class="mt-8 max-w-[30rem]" bind:value={name} label="Event name" />

			<p class="mt-6 text-lg font-bold">Which days might work?</p>
			<MultiDatepicker class="mt-4" bind:selectedDates />

			<Select
				class="mt-6 max-w-[10rem]"
				label="No earlier than"
				bind:value={earliestTime}
				options={generateTimeStamps()}
			/>
			<Select
				class="mt-2 max-w-[10rem]"
				label="No later than"
				bind:value={latestTime}
				options={generateTimeStamps()}
			/>
			<button class="btn-primary btn mt-8">Create event</button>
		</form>
	</div>
</PageContainer>

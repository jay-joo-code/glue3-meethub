<script lang="ts">
	import { page } from '$app/stores';
	import CalendarWeek from '$lib/components/CalendarWeek.svelte';
	import PageContainer from '$lib/components/glue/PageContainer.svelte';
	import TextInput from '$lib/components/glue/TextInput.svelte';
	import { supabase } from '$lib/glue/supabaseClient';
	import IconLink from '$lib/icons/glue/IconLink.svelte';
	import { entryConfig } from '$lib/stores/entry';
	import { toast } from '@zerodevx/svelte-toast';

	let linkInput;
	let entry;
	let myAvailability = new Set();
	let signInLoading = false;
	let manualName = '';

	$: event = $page?.data?.event;
	$: entryId = $entryConfig[event?.hash_id];
	$: myAvailabilityMethod = entry ? entry?.variant : 'unset';
	$: {
		(async () => {
			fetchEntry(entryId);
		})();
	}

	const copyLink = () => {
		linkInput.select();
		document.execCommand('copy');
		toast.push('✅ Link copied to clipboard');
	};

	const handleSignIn = async () => {
		signInLoading = true;

		let targetEntry;
		const { data: existingEntry } = await supabase
			.from('entry')
			.select('*')
			.eq('name', manualName)
			.eq('event_id', event?.id)
			.single();

		if (!existingEntry) {
			const { data } = await supabase
				.from('entry')
				.upsert([{ variant: 'manual', name: manualName, event_id: event?.id }])
				.select('*')
				.single();

			targetEntry = data;
		} else {
			targetEntry = existingEntry;
		}

		if (targetEntry) {
			$entryConfig = { ...$entryConfig, [event?.hash_id]: targetEntry?.id };
			myAvailabilityMethod = targetEntry?.variant;
			myAvailability = new Set(targetEntry.times);
		}

		signInLoading = false;
	};

	const fetchEntry = async (entryId) => {
		let { data } = await supabase.from('entry').select('*').eq('id', entryId).single();
		entry = data;
		myAvailabilityMethod = data?.variant;
		myAvailability = new Set(data?.times?.map((time) => new Date(time)?.toISOString()));
	};

	const signOut = () => {
		delete $entryConfig[event?.hash_id];
		$entryConfig = { ...$entryConfig };
		myAvailability = new Set();
	};

	const saveEntry = async (dates) => {
		await supabase
			.from('entry')
			.update({ times: Array.from(dates) })
			.eq('id', entryId);
	};
</script>

<PageContainer title={event?.name}>
	<div class="flex justify-center">
		<div class="flex w-full max-w-6xl flex-wrap justify-center md:px-4 md:py-4">
			<!-- desktop left section -->
			<div class="mt-6 w-full md:mt-0 md:w-1/2 md:pr-4 lg:pr-6">
				<h1 class="text-3xl font-extrabold md:text-4xl">{event?.name}</h1>

				<!-- event link -->
				<div class="form-control mt-4 w-5/6">
					<button on:click={copyLink}>
						<label class="input-group-sm input-group cursor-pointer">
							<span class="bg-base-300 px-2 text-lg"><IconLink /></span>
							<input
								bind:this={linkInput}
								type="text"
								class="input-bordered input input-sm w-full cursor-pointer"
								value={`https://when2meet.vercel.app/event/${event?.hash_id}`}
								readonly
							/>
						</label>
					</button>
				</div>

				<!-- my availability -->
				<div class="mt-12 flex items-center ">
					<h2 class="text-xl font-bold">
						{entry ? `${entry?.name}'s` : 'My'} availability
					</h2>
					{#if entry}
						<button class="btn-xs btn ml-4" on:click={signOut}>Sign out</button>
					{/if}
				</div>

				<div class="">
					{#if myAvailabilityMethod === 'unset'}
						<div class="mt-6 w-[240px]">
							<button class="btn-primary btn-block btn">Autofill with Google Calendar</button>
							<div class="divider">OR</div>
							<button
								class="btn-block btn"
								on:click={() => {
									myAvailabilityMethod = 'manual';
								}}>Fill in manually</button
							>
						</div>
					{:else if myAvailabilityMethod === 'manual'}
						{#if !entry}
							<div class="">
								<p class="mt-2 text-xs text-base-content/70">
									Sign in with your name to start entering your availability
								</p>
								<div class="mt-4 flex items-end space-x-2">
									<TextInput
										class="max-w-[14rem] [&_input]:input-sm"
										label="Name"
										bind:value={manualName}
									/>
									<button
										class="btn-primary btn-sm btn {signInLoading ? 'loading' : ''}"
										on:click={handleSignIn}>Sign in</button
									>
								</div>
							</div>
						{:else}
							<div class="mt-6">
								<CalendarWeek
									dates={event?.dates
										?.map((day) => new Date(day))
										?.sort((a, b) => a.getTime() - b.getTime())}
									earliestTime={event?.earliest_time}
									latestTime={event?.latest_time}
									bind:selected={myAvailability}
									onEndDrag={saveEntry}
								/>
							</div>
						{/if}
					{/if}
				</div>
			</div>

			<!-- desktop right section -->
			<div class="mt-12 w-full md:mt-0 md:w-1/2 md:pl-4 lg:pl-6">
				<h2 class="text-xl font-bold">Group's availability</h2>
				<div class="mt-6">
					<CalendarWeek
						dates={event?.dates
							?.map((day) => new Date(day))
							?.sort((a, b) => a.getTime() - b.getTime())}
						earliestTime={event?.earliest_time}
						latestTime={event?.latest_time}
					/>
				</div>
			</div>
		</div>
	</div>
</PageContainer>

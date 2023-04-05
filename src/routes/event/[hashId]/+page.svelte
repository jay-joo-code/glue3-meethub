<script lang="ts">
	import { page } from '$app/stores';
	import CalendarWeek from '$lib/components/CalendarWeek.svelte';
	import PageContainer from '$lib/components/glue/PageContainer.svelte';
	import IconLink from '$lib/icons/glue/IconLink.svelte';
	import { toast } from '@zerodevx/svelte-toast';

	$: event = $page?.data?.event;
	let linkInput;
	let myAvailabilityMethod: 'unset' | 'manual' | 'google' = 'unset';
	let myAvailability = new Set();

	const copyLink = () => {
		linkInput.select();
		document.execCommand('copy');
		toast.push('✅ Link copied to clipboard');
	};
</script>

<PageContainer title={event?.name}>
	<div class="flex justify-center">
		<div class="flex w-full max-w-6xl flex-wrap justify-center md:px-4 md:py-4">
			<!-- desktop left section -->
			<div class="w-full md:w-1/2 md:pr-4 lg:pr-6">
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
				<h2 class="mt-12 text-xl font-bold">My availability</h2>

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
					<div class="mt-6">
						<CalendarWeek
							dates={event?.dates
								?.map((day) => new Date(day))
								?.sort((a, b) => a.getTime() - b.getTime())}
							earliestTime={event?.earliest_time}
							latestTime={event?.latest_time}
							bind:selected={myAvailability}
						/>
					</div>
				{/if}
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

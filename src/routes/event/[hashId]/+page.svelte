<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import CalendarWeek from '$lib/components/CalendarWeek.svelte';
	import CopyLink from '$lib/components/CopyLink.svelte';
	import Checkbox from '$lib/components/glue/Checkbox.svelte';
	import PageContainer from '$lib/components/glue/PageContainer.svelte';
	import TextInput from '$lib/components/glue/TextInput.svelte';
	import { supabase } from '$lib/glue/supabaseClient';
	import { entryConfig } from '$lib/stores/entry';
	import {
		eventIdsToEvents,
		fetchCalendarList,
		fetchEventsByCalendarIds,
		findCalendar,
		timeMaxOfEvent,
		timeMinOfEvent
	} from '$lib/util/gcal';
	import { timesExcludingGcalEvents } from '$lib/util/timestamps';
	import { format, parse } from 'date-fns';

	let manualSignInLoading = false;
	let isAutofillStartLoading = false;
	let isFetchEventsLoading = false;
	let isConfirmLoading = false;

	let entry;
	let myAvailability = new Set();
	let manualName = '';
	let selectedCalendarIds = [];
	let autofillStep: 'select' | 'confirm' = 'select';
	let calendars = [];
	let eventsByCalendar = [];
	let selectedEventIds = [];
	let myAvailabilityMethod: 'manual' | 'gcal' | 'unset' = 'unset';

	$: event = $page?.data?.event;
	$: groupEntries = $page?.data?.groupEntries;
	$: entryId = $entryConfig[event?.hash_id];

	$: fetchEntry(entryId);

	const manualSignIn = async () => {
		manualSignInLoading = true;

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
				.insert([{ name: manualName, event_id: event?.id }])
				.select('*')
				.single();

			targetEntry = data;
		} else {
			targetEntry = existingEntry;
		}

		if (targetEntry) {
			$entryConfig = { ...$entryConfig, [event?.hash_id]: targetEntry?.id };
			myAvailability = new Set(targetEntry.times);
		}

		manualSignInLoading = false;
	};

	const fetchEntry = async (entryId) => {
		if (entryId) {
			let { data } = await supabase.from('entry').select('*').eq('id', entryId).single();

			if (data) {
				entry = data;
				myAvailability = new Set(data?.times?.map((time) => new Date(time)?.toISOString()));
				myAvailabilityMethod = 'manual';
			}
		}
	};

	const saveEntry = async (times) => {
		await supabase
			.from('entry')
			.update({ times: Array.from(times) })
			.eq('id', entryId);
		invalidateAll();
	};

	const signOut = () => {
		delete $entryConfig[event?.hash_id];
		$entryConfig = { ...$entryConfig };
		entry = null;
		myAvailability = new Set();
		myAvailabilityMethod = 'unset';
	};

	async function signInWithGoogle() {
		await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				queryParams: {
					access_type: 'offline',
					prompt: 'consent'
				},
				redirectTo: window.location.href,
				scopes: 'https://www.googleapis.com/auth/calendar.readonly'
			}
		});
	}

	const handleAutofillClick = async () => {
		isAutofillStartLoading = true;

		// NOTE: sometimes throws error that auth token is invalid
		if ($page.data.session) {
			calendars = await fetchCalendarList($page.data.session);
			selectedCalendarIds = calendars
				?.filter((calendar) => calendar?.selected)
				?.map((calendar) => calendar?.id);
			myAvailabilityMethod = 'gcal';
		} else {
			signInWithGoogle();
		}

		isAutofillStartLoading = false;
	};

	const fetchAutofillEvents = async () => {
		isFetchEventsLoading = true;
		eventsByCalendar = await fetchEventsByCalendarIds(
			$page.data.session,
			selectedCalendarIds,
			timeMinOfEvent(event),
			timeMaxOfEvent(event)
		);
		autofillStep = 'confirm';
		let newSelectedEventIds = [];
		eventsByCalendar?.forEach((calendar) =>
			calendar?.events?.forEach((event) => newSelectedEventIds?.push(event?.id))
		);
		selectedEventIds = newSelectedEventIds;
		isFetchEventsLoading = false;
	};

	const handleAutofill = async () => {
		isConfirmLoading = true;

		const gcalEvents = eventIdsToEvents(selectedEventIds, eventsByCalendar);
		const times = timesExcludingGcalEvents(
			gcalEvents,
			event?.earliest_time,
			event?.latest_time,
			event?.dates
		);

		const { data } = await supabase
			.from('entry')
			.insert([
				{
					name: $page.data.session?.user?.user_metadata?.name,
					event_id: event?.id,
					times,
					user_id: $page.data.session?.user?.id
				}
			])
			.select('*')
			.single();

		if (data) {
			$entryConfig = { ...$entryConfig, [event?.hash_id]: data?.id };
			myAvailability = new Set(data.times);
			myAvailabilityMethod = 'manual';
			invalidateAll();
		}

		isConfirmLoading = false;
	};
</script>

<PageContainer title={event?.name} noPadding={true}>
	<div class="flex justify-center">
		<div class="flex w-full max-w-6xl flex-wrap justify-center md:px-4 md:py-4">
			<!-- desktop left section -->
			<div class="mt-6 w-full md:mt-0 md:w-1/2 md:pr-4 lg:pr-6">
				<!-- section: event info -->
				<div class="px-4">
					<h1 class="text-3xl font-extrabold md:text-4xl">{event?.name}</h1>
					<CopyLink href="https://when2meet.vercel.app/event/{event?.hash_id}" />
				</div>

				<!-- section: my availability -->
				<div class="mt-12 border-t-4 border-b-4 border-base-content/10 px-4 py-6 md:border-0">
					<div class="flex items-center ">
						<h2 class="text-xl font-bold">
							{entry ? `${entry?.name}'s` : 'My'} availability
						</h2>
						{#if entry}
							<button class="btn-xs btn ml-4" on:click={signOut}>Sign out</button>
						{/if}
					</div>

					<div class="">
						{#if myAvailabilityMethod === 'unset'}
							<div class="mt-6 w-[280px]">
								<button
									class="btn-primary btn-block btn {isAutofillStartLoading && 'loading'}"
									on:click={handleAutofillClick}>Autofill with Google Calendar</button
								>
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
											class="btn-primary btn-sm btn {manualSignInLoading ? 'loading' : ''}"
											on:click={manualSignIn}>Sign in</button
										>
									</div>
								</div>
							{:else}
								<div class="mt-6">
									<CalendarWeek
										dates={event?.dates
											?.map((day) => parse(day, 'yyyy-MM-dd', new Date()))
											?.sort((a, b) => a.getTime() - b.getTime())}
										earliestTime={event?.earliest_time}
										latestTime={event?.latest_time}
										bind:selected={myAvailability}
										onEndDrag={saveEntry}
									/>
								</div>
							{/if}
						{:else if myAvailabilityMethod === 'gcal'}
							{#if autofillStep === 'select'}
								<p class="mt-6 text-lg font-bold">Select calendars to autofill with</p>
								<div class="mt-3 space-y-0.5">
									{#each calendars as calendar}
										<div class="flex items-center space-x-2">
											<div class="inline">
												<Checkbox
													class="checkbox-sm"
													label={calendar?.summary}
													checked={selectedCalendarIds?.includes(calendar?.id)}
													on:change={(event) => {
														if (event.target.checked) {
															selectedCalendarIds = [...selectedCalendarIds, calendar?.id];
														} else {
															selectedCalendarIds = selectedCalendarIds.filter(
																(id) => id !== calendar?.id
															);
														}
													}}
												/>
											</div>
											<div
												style="background-color: {calendar.backgroundColor}"
												class="h-3 w-3 rounded-full"
											/>
										</div>
									{/each}
								</div>
								<button
									class="btn-primary btn mt-3 {isFetchEventsLoading && 'loading'}"
									on:click={fetchAutofillEvents}>Next</button
								>
							{:else if autofillStep === 'confirm'}
								<p class="mt-6 text-lg font-bold">Confirm events to autofill with</p>
								<div class="mt-3">
									<div class="space-y-3">
										{#each eventsByCalendar as calendar}
											<div class="">
												<div class="flex items-center space-x-2">
													<p class="text-sm font-medium">
														{findCalendar(calendar?.calendarId, calendars).summary}
													</p>
													<div
														style="background-color: {findCalendar(calendar?.calendarId, calendars)
															.backgroundColor}"
														class="h-3 w-3 rounded-full"
													/>
												</div>
												{#if calendar?.events?.length === 0}
													<p class="mt-0.5 text-xs text-base-content/70">
														No events in the relevant date range
													</p>
												{:else}
													<div class="mt-1">
														{#each calendar?.events as event}
															<div class="flex items-center">
																<div class="inline">
																	<Checkbox
																		class="checkbox-xs"
																		label={event?.summary}
																		checked={selectedEventIds?.includes(event?.id)}
																		on:change={(changeEvent) => {
																			if (changeEvent.target.checked) {
																				selectedEventIds = [...selectedEventIds, event?.id];
																			} else {
																				selectedEventIds = selectedEventIds.filter(
																					(id) => id !== event?.id
																				);
																			}
																		}}
																	/>
																</div>
																<p class="ml-2 text-xs text-base-content/70">
																	{format(new Date(event?.start?.dateTime), 'MMM dd iii, hh:mma')} -
																	{format(new Date(event?.end?.dateTime), 'hh:mma')}
																</p>
															</div>
														{/each}
													</div>
												{/if}
											</div>
										{/each}
									</div>
									<div class="mt-4 flex space-x-1">
										<button class="btn-primary btn" on:click={handleAutofill}>Autofill</button>
										<button
											class="btn-ghost btn"
											on:click={() => {
												autofillStep = 'select';
											}}>Back</button
										>
									</div>
								</div>
							{/if}
						{/if}
					</div>
				</div>
			</div>

			<!-- desktop right section -->
			<div class="mt-12 w-full px-4 md:mt-0 md:w-1/2 md:pl-4 lg:pl-6">
				<h2 class="text-xl font-bold">Group's availability</h2>
				<div class="mt-6">
					<CalendarWeek
						dates={event?.dates
							?.map((day) => parse(day, 'yyyy-MM-dd', new Date()))
							?.sort((a, b) => a.getTime() - b.getTime())}
						earliestTime={event?.earliest_time}
						latestTime={event?.latest_time}
						mode="display"
						{groupEntries}
					/>
				</div>
			</div>
		</div>
	</div>
</PageContainer>

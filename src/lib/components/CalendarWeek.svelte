<script lang="ts">
	import countTimes from '$lib/util/countTimes';
	import {
		applyTimestampToDate,
		displayTimeString,
		generateHourlyTimestamps,
		getIncrementedTimestamps
	} from '$lib/util/timestamps';
	import { format } from 'date-fns';

	export let dates = [new Date()];
	export let earliestTime = '0900';
	export let latestTime = '1700';
	export let selected = new Set();
	export let onEndDrag: (dates) => void = () => {};
	export let mode: 'edit' | 'display' = 'edit';
	export let groupEntries = [];

	let timestamps = getIncrementedTimestamps(earliestTime, latestTime);
	let hours = generateHourlyTimestamps(earliestTime, latestTime);
	let isDragging = false;
	let dragType: 'add' | 'remove' = 'add';
	let dragDate;
	let dragStartTimestamp;
	let dragEndTimestamp;
	let viewingDateString;

	$: [timesCounter, maxCount] = countTimes(groupEntries) || [{}, 0];
	$: allNames = groupEntries.map((entry) => entry.name);
	$: availableNames = timesCounter[viewingDateString] || [];
	$: unavailableNames = allNames.filter((name) => !availableNames?.includes(name));

	// $: if (mode === 'display')
	// 	console.log('log', groupEntries, timesCounter, maxCount, availableNames);

	const isDragSelected = (date, timestamp: string, dragEndTimestamp) => {
		const lowerTimestamp = Math.min(Number(dragStartTimestamp), Number(dragEndTimestamp));
		const higherTimestamp = Math.max(Number(dragStartTimestamp), Number(dragEndTimestamp));

		return (
			date === dragDate &&
			Number(timestamp) >= lowerTimestamp &&
			Number(timestamp) <= higherTimestamp
		);
	};

	const endDrag = () => {
		if (mode === 'edit' && isDragging) {
			isDragging = false;

			const lowerTimestamp = Math.min(Number(dragStartTimestamp), Number(dragEndTimestamp));
			const higherTimestamp = Math.max(Number(dragStartTimestamp), Number(dragEndTimestamp));
			const timestampsBetween = [
				...getIncrementedTimestamps(
					String(lowerTimestamp).padStart(4, '0'),
					String(higherTimestamp).padStart(4, '0')
				),
				String(higherTimestamp).padStart(4, '0')
			];

			const selectedDateStrings = timestampsBetween?.map((timestamp) =>
				applyTimestampToDate(dragDate, timestamp).toISOString()
			);
			for (const item of selectedDateStrings) {
				if (dragType === 'add') {
					selected.add(item);
				} else {
					selected.delete(item);
				}
			}

			selected = new Set(selected);

			onEndDrag(selected);
		}
	};

	const bgColorClass = (
		day,
		timestamp,
		dragEndTimestamp,
		isDragging,
		selected,
		timesCounter,
		maxCount
	) => {
		if (mode === 'edit') {
			if (isDragging && isDragSelected(day, timestamp, dragEndTimestamp)) {
				if (dragType === 'add') {
					return 'bg-base-content/30';
				} else {
					return 'bg-base-100';
				}
			} else if (selected.has(applyTimestampToDate(day, timestamp).toISOString())) {
				return 'bg-primary';
			}
			return '';
		} else {
			const date = applyTimestampToDate(day, timestamp).toISOString();
			const count = timesCounter[date]?.length || 0;
			if (count === 0) {
				return 'bg-base-100';
			} else {
				return 'bg-primary';
			}
		}
	};

	const getOpacity = (day, timestamp, timesCounter, maxCount) => {
		if (mode === 'edit') {
			return 1;
		}
		const date = applyTimestampToDate(day, timestamp).toISOString();
		const count = timesCounter[date]?.length || 0;

		if (count === 0) {
			return 1;
		}
		const opacity = (count / maxCount).toFixed(2);
		return opacity;
	};
</script>

<div class="flex items-start">
	<div class="mr-1 pt-8">
		{#each hours as hour}
			<div class="relative mb-[1.78rem] pr-1">
				<p class="text-right text-xs text-base-content/80">{displayTimeString(hour)}</p>
			</div>
		{/each}
	</div>

	<div class="week-view" style="--rowlength:{dates?.length};" on:mouseleave={endDrag}>
		{#each dates as day}
			<div class="pb-2 text-center text-sm">
				<p class="text-[0.6rem] leading-tight">{format(day, 'MMM dd')}</p>
				<p class="text-md font-semibold">{format(day, 'iii')}</p>
			</div>
		{/each}

		{#each timestamps as timestamp, row_idx}
			{#each dates as day, col_idx}
				<div class="dropdown">
					<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<label
						tabindex="0"
						style="--opacity: {getOpacity(day, timestamp, timesCounter, maxCount)}"
						class="tailwind-opacity-is-fking-buggy hour block h-[0.7rem] border-b border-r border-base-content/20
            {row_idx === 0 ? 'border-t' : ''}
						{col_idx === 0 ? 'border-l' : ''}
            {(row_idx - 1) % 4 === 0 ? 'border-b-dashed' : ''}
            {row_idx % 2 === 0 ? 'border-b-none' : ''}
            {bgColorClass(
							day,
							timestamp,
							dragEndTimestamp,
							isDragging,
							selected,
							timesCounter,
							maxCount
						)}
            "
						on:click={() => {
							if (mode === 'display') {
								viewingDateString = applyTimestampToDate(day, timestamp)?.toISOString();
							}
						}}
						on:mousedown={() => {
							if (mode === 'edit') {
								isDragging = true;
								if (selected.has(applyTimestampToDate(day, timestamp).toISOString())) {
									dragType = 'remove';
								} else {
									dragType = 'add';
								}
								dragDate = day;
								dragStartTimestamp = timestamp;
								dragEndTimestamp = timestamp;
							}
						}}
						on:mouseenter={() => {
							if (mode === 'edit' && isDragging) {
								dragEndTimestamp = timestamp;
							}
						}}
						on:mouseup={endDrag}
					/>
					{#if mode === 'display'}
						<ul tabindex="0" class="dropdown-content rounded bg-base-200 p-2 shadow-xl">
							<div>
								<div class="flex items-center space-x-1">
									<div class="h-2 w-2 rounded-full bg-success" />
									<p class="text-sm font-semibold">Available</p>
								</div>
								{#each availableNames as name}
									<p class="mt-1 ml-3 text-xs font-medium text-base-content/80">{name}</p>
								{/each}
							</div>

							<div class="mt-2">
								<div class="flex items-center space-x-1">
									<div class="h-2 w-2 rounded-full bg-error" />
									<p class="text-sm font-semibold">Unavailable</p>
								</div>
								{#each unavailableNames as name}
									<p class="mt-1 ml-3 text-xs font-medium text-base-content/80">{name}</p>
								{/each}
							</div>
						</ul>
					{/if}
				</div>
			{/each}
		{/each}
	</div>
</div>

<style>
	.week-view {
		display: grid;
		grid-template-columns: repeat(var(--rowlength), 3.5rem);
		grid-auto-rows: auto;
	}

	.hour {
		padding: 4px;
		text-align: center;
	}

	.day-header,
	.hour-header {
		font-weight: bold;
	}

	.border-b-dashed {
		border-style: solid solid dashed solid;
	}

	.border-b-none {
		border-style: solid solid none solid;
	}

	.tailwind-opacity-is-fking-buggy {
		opacity: var(--opacity);
	}
</style>

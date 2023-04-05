<script lang="ts">
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
	export let onEndDrag: (dates) => void;

	let timestamps = getIncrementedTimestamps(earliestTime, latestTime);
	let hours = generateHourlyTimestamps(earliestTime, latestTime);
	let isDragging = false;
	let dragType: 'add' | 'remove' = 'add';
	let dragDate;
	let dragStartTimestamp;
	let dragEndTimestamp;

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
		if (isDragging) {
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

	const bgColorClass = (day, timestamp, dragEndTimestamp, isDragging, selected) => {
		if (isDragging && isDragSelected(day, timestamp, dragEndTimestamp)) {
			if (dragType === 'add') {
				return 'bg-base-content/30';
			} else {
				return 'bg-base-100';
			}
		} else if (selected.has(applyTimestampToDate(day, timestamp).toISOString())) {
			return 'bg-primary/70';
		}
		return '';
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
				<button
					class="hour h-[0.7rem] border-b border-r border-base-content/20
            {row_idx === 0 ? 'border-t' : ''}
						{col_idx === 0 ? 'border-l' : ''}
            {(row_idx - 1) % 4 === 0 ? 'border-b-dashed' : ''}
            {row_idx % 2 === 0 ? 'border-b-none' : ''}
            {bgColorClass(day, timestamp, dragEndTimestamp, isDragging, selected)}
            "
					on:mousedown={() => {
						isDragging = true;
						if (selected.has(applyTimestampToDate(day, timestamp).toISOString())) {
							dragType = 'remove';
						} else {
							dragType = 'add';
						}
						dragDate = day;
						dragStartTimestamp = timestamp;
						dragEndTimestamp = timestamp;
					}}
					on:mouseenter={() => {
						if (isDragging) {
							dragEndTimestamp = timestamp;
						}
					}}
					on:mouseup={endDrag}
				/>
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
</style>

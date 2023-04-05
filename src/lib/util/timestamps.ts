import { format } from 'date-fns';

export function generateTimeStamps() {
	const timeStamps = [];

	for (let hour = 0; hour < 24; hour++) {
		for (let minute = 0; minute < 60; minute += 30) {
			const hourString = hour.toString().padStart(2, '0');
			const minuteString = minute.toString().padStart(2, '0');
			const amPm = hour < 12 ? 'AM' : 'PM';
			const formattedHour = hour % 12 || 12;

			timeStamps.push({
				value: hourString + minuteString,
				label: `${formattedHour}:${minuteString} ${amPm}`
			});
		}
	}

	return timeStamps;
}

export function generateHourlyTimestamps(earliestTime, latestTime) {
	const earliestHour = parseInt(earliestTime.slice(0, 2), 10);
	const latestHour = parseInt(latestTime.slice(0, 2), 10);

	const timestamps = [];

	for (let hour = earliestHour; hour <= latestHour; hour++) {
		timestamps.push(hour.toString().padStart(2, '0') + '00');
	}

	return timestamps;
}

export function displayTimeString(timeStr) {
	// Make sure the input string has exactly 4 characters
	if (timeStr.length !== 4) {
		throw new Error('Invalid time string format');
	}

	// Extract hours and minutes from the input string
	const hours = parseInt(timeStr.slice(0, 2), 10);
	const minutes = parseInt(timeStr.slice(2), 10);

	// Validate hours and minutes
	if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
		throw new Error('Invalid time string values');
	}

	// Create a date object with the extracted hours and minutes
	const dateObj = new Date();
	dateObj.setHours(hours, minutes, 0, 0);

	// Format the date object using date-fns
	return format(dateObj, 'haaa');
}

export function getIncrementedTimestamps(earliesttime, latesttime) {
	const timestamps = [];
	let currenttime = earliesttime;
	while (currenttime < latesttime) {
		timestamps.push(currenttime);
		const hour = parseInt(currenttime.substring(0, 2));
		const minute = parseInt(currenttime.substring(2));
		if (minute == 45) {
			currenttime = (hour + 1).toString().padStart(2, '0') + '00';
		} else {
			currenttime = hour.toString().padStart(2, '0') + (minute + 15).toString().padStart(2, '0');
		}
	}
	return timestamps;
}

export function applyTimestampToDate(date, timestamp): Date {
	const hour = parseInt(timestamp.substring(0, 2));
	const minute = parseInt(timestamp.substring(2));
	date.setHours(hour, minute, 0, 0);
	return date;
}

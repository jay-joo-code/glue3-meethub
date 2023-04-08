import { add, formatRFC3339, max, min, parse, sub } from 'date-fns';
import { applyTimestampToDate } from './timestamps';

export const fetchAllEvents = async (session) => {
	const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
		headers: {
			Authorization: `Bearer ${session?.provider_token}`
		}
	});

	return await response.json();
};

export const fetchCalendarList = async (session) => {
	const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
		headers: {
			Authorization: `Bearer ${session?.provider_token}`
		}
	});

	return (await response.json())?.items ?? [];
};

export const fetchEvents = async (session, calendarId, timeMin, timeMax) => {
	const response = await fetch(
		`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`,
		{
			headers: {
				Authorization: `Bearer ${session?.provider_token}`
			}
		}
	);

	return (await response.json())?.items?.filter((event) => event?.start?.dateTime) ?? [];
};

export const fetchEventsByCalendarIds = async (session, calendarIds, timeMin, timeMax) => {
	const promises = calendarIds.map(async (calendarId) => ({
		calendarId,
		events: await fetchEvents(session, calendarId, timeMin, timeMax)
	}));
	return await Promise.all(promises);
};

export const timeMaxOfEvent = (event) => {
	const maxDate = max(event?.dates?.map((date) => parse(date, 'yyyy-MM-dd', new Date())));
	const maxDatetime = applyTimestampToDate(maxDate, event?.latest_time);
	return formatRFC3339(maxDatetime);
};

export const timeMinOfEvent = (event) => {
	const minDate = min(event?.dates?.map((date) => parse(date, 'yyyy-MM-dd', new Date())));
	const minDatetime = applyTimestampToDate(minDate, event?.earliest_time);
	return formatRFC3339(minDatetime);
};

export const findCalendar = (calendarId, calendarList) => {
	return calendarList.find((calendar) => calendar.id === calendarId);
};

export const eventIdsToEvents = (eventIds, eventsByCalendar) => {
	return eventIds?.map((eventId) => findEvent(eventId, eventsByCalendar));
};

export const findEvent = (eventId, eventsByCalendar) => {
	let event;
	eventsByCalendar.forEach((calendar) => {
		const foundEvent = calendar?.events.find((event) => event.id === eventId);
		if (foundEvent) event = foundEvent;
	});
	return event;
};

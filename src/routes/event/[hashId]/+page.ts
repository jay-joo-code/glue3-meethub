import { supabase } from '$lib/glue/supabaseClient.js';

export const load = async ({ params }) => {
	const { data: event } = await supabase
		.from('event')
		.select('*')
		.eq('hash_id', params?.hashId)
		.single();

	let groupEntries;

	if (event) {
		const { data: entries } = await supabase.from('entry').select('*').eq('event_id', event?.id);
		groupEntries = entries;
	}

	return { event, groupEntries };
};

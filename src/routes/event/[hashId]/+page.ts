import { supabase } from '$lib/glue/supabaseClient.js';

export const load = async ({ params }) => {
	const { data: event, error } = await supabase
		.from('event')
		.select('*')
		.eq('hash_id', params?.hashId)
		.single();

	return { event };
};

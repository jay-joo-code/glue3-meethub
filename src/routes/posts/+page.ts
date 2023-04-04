import { supabase } from '$lib/glue/supabaseClient';

export const load = async () => {
	const { data: posts } = await supabase
		.from('post')
		.select('*')
		.order('created_at', { ascending: false });
	return { posts };
};

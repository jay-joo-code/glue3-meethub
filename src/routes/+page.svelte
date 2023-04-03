<script lang="ts">
	import SectionBoldStatement from '$lib/components/glue/landing/SectionBoldStatement.svelte';
	import SectionHero from '$lib/components/glue/landing/SectionHero.svelte';
	import SectionInfo from '$lib/components/glue/landing/SectionInfo.svelte';
	import PageContainer from '$lib/components/glue/PageContainer.svelte';
</script>

<PageContainer title="Home">
	<SectionHero />
	<SectionBoldStatement />
	<SectionInfo />
	<SectionInfo isReversed={true} />
</PageContainer>

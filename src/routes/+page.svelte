<script lang="ts">
	import AssetsTable from '$lib/components/assetstable.svelte';

	import { livecoinwatchApiKey } from '$lib/stores/livecoinwatch.store';

	let hasApiKey = false;

	livecoinwatchApiKey.subscribe((value) => {
		hasApiKey = !!value;
	});
</script>

<div class="vstack gap-1">
	<p class="lead mt-5">
		Welcome to your <strong>Crypto Assets Dashboard!</strong>
	</p>
	<div>
		This page is designed to help you monitor the real-time value of your assets using
		cryptocurrency as a benchmark.
	</div>
	<div>
		With fiat currencies losing value, it's essential to have a reliable way to track the actual
		value of your investments.
	</div>
	<div>
		By 'indexing' your assets using cryptocurrencies, you can better understand their worth.
		Indexing here means that the dashboard calculates the value of your assets based on the current
		value of cryptocurrencies, providing you with a more stable and potentially appreciating
		currency to measure your investments.
	</div>
	<div>
		This dashboard offers a comprehensive overview of your assets, including their initial cost,
		current value, and performance over time.
	</div>
	<div>With this powerful tool, you can stay informed and make better financial decisions.</div>
</div>
<div class="mt-5">
	{#if hasApiKey}
		<p class="lead">Your Assets</p>
	{:else}
		<p class="lead">Please enter your LiveCoinWatch API key to get started</p>
	{/if}
	{#if hasApiKey}
		<AssetsTable />
	{/if}
</div>
<p class="mt-5">
	This site does not collect, store, or use any personal information. All data is stored locally on
	your browser, ensuring your privacy and security. The only external communication is with the
	<a href="https://www.livecoinwatch.com/tools/api" target="_blank">LiveCoinMarket API</a> to fetch historical
	cryptocurrency prices
</p>

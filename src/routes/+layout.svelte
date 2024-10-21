<script lang="ts">
	import {
		Styles,
		Container,
		Navbar,
		NavbarBrand,
		ThemeToggler,
		Button,
		Icon,
		useColorMode
	} from '@sveltestrap/sveltestrap';
	import { livecoinwatchApiKey } from '$lib/stores/livecoinwatch.store';
	import { fiats } from '$lib/stores/fiats.store';
	import { user } from '$lib/stores/user.store';
	import ApiKey from '$lib/components/livecoinwatch.svelte';
	import NewAsset from '$lib/components/newasset.svelte';
	let apiKey = { value: '' };
	let currentColorMode: string;
	let toggleColorMode: () => void;
	let isApiKeyOpen: boolean = false;
	let isAssetOpen: boolean = false;
	let assetButtonDisplay: string = 'd-none';
	const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

	if (prefersDarkScheme.matches) {
		useColorMode('dark');
	} else {
		useColorMode('light');
	}
	livecoinwatchApiKey.subscribe(async (value) => {
		if (value) {
			apiKey.value = value.length > 6 ? value.slice(0, 6) + '...' : value;
		} else {
			apiKey.value = 'No API Key';
		}
		await fiats.refresh();
	});
	fiats.subscribe((value) => {
		if (Array.isArray(value) && value.length > 0) {
			assetButtonDisplay = 'd-inline-block';
		} else {
			assetButtonDisplay = 'd-none';
		}
	});

	function openApiKey() {
		isApiKeyOpen = !isApiKeyOpen;
	}

	function onApiKeyClose(): void {
		isApiKeyOpen = false;
	}

	function openAsset() {
		isAssetOpen = !isApiKeyOpen;
	}

	function onAssetClose(): void {
		isAssetOpen = false;
	}

	function clearData(): void {
		if (confirm('Are you sure you want to clear all data?')) {
			user.reset();
			livecoinwatchApiKey.set(undefined);
		}
	}
</script>

<Styles />

<Navbar expand="md" container="md">
	<NavbarBrand href="/">Crypto Assets</NavbarBrand>
	<div class="gap-3">
		<ThemeToggler class="ms-auto">
			<Button color={currentColorMode} on:click={() => toggleColorMode()}>
				{#if currentColorMode === 'light'}
					<Icon name="moon-stars-fill" />
				{:else}
					<Icon name="sun-fill" />
				{/if}
			</Button>
		</ThemeToggler>
		<Button on:click={openAsset} class={assetButtonDisplay}>New Assets</Button>
		<Button color={currentColorMode} on:click={openApiKey}>{apiKey.value}</Button>
		<Button color={currentColorMode} on:click={clearData}><Icon name="fire" /></Button>
	</div>
</Navbar>
<Container>
	<ApiKey isOpen={isApiKeyOpen} onClose={onApiKeyClose} />
	<NewAsset isOpen={isAssetOpen} onClose={onAssetClose} />
	<slot />
</Container>

<script lang="ts">
	import { livecoinwatchApiKey } from '$lib/stores/livecoinwatch.store';
	import { Button, Input, Modal, ModalBody, ModalFooter } from '@sveltestrap/sveltestrap';

	let apiKey: { value: string | undefined } = { value: undefined };
	export let isOpen: boolean;
	export let onClose: () => void;

	$: livecoinwatchApiKey.subscribe((value) => {
		apiKey.value = value;
	});

	const saveApiKey = () => {
		livecoinwatchApiKey.set(apiKey.value);
		isOpen = false;
	};
</script>

<Modal {isOpen} on:close={onClose} backdrop centered fade header="LiveCoinWatch SDK Key">
	<ModalBody>
		<p>
			To get started, you need to get an API key from LiveCoinWatch. You can get one by visiting
			<a href="https://www.livecoinwatch.com/tools/api" target="_blank" rel="noopener noreferrer">
				https://www.livecoinwatch.com/tools/api
			</a>
		</p>
		<Input
			type="text"
			bind:value={apiKey.value}
			id="apiKey"
			placeholder="Enter your LiveCoinWatch SDK Key"
		/>
	</ModalBody>
	<ModalFooter>
		<Button color="secondary" on:click={onClose}>Cancel</Button>
		<Button color="primary" on:click={saveApiKey}>Save</Button>
	</ModalFooter>
</Modal>

<script lang="ts">
	import {
		Form,
		FormGroup,
		Input,
		InputGroup,
		InputGroupText,
		Button,
		Modal,
		ModalBody,
		ModalFooter,
		Label
	} from '@sveltestrap/sveltestrap';
	import { fiats } from '$lib/stores/fiats.store';
	import { user } from '$lib/stores/user.store';
	import { liveCoinWatchApi } from '$lib/sdks/livecoinwatch.api';
	import * as yup from 'yup';

	export let isOpen = false;
	export let onClose: () => void;

	let currency = '';
	let cost: number = 0;
	let date: Date | undefined = undefined;
	let name = '';
	let currencySymbol = '$';
	let validated: boolean | undefined = undefined;
	let data: any = [];
	let validationErrors: { [key: string]: string } = {};

	const schema = yup.object().shape({
		name: yup.string().required(),
		cost: yup.number().required().positive(),
		currency: yup.string().required(),
		date: yup.date().required().max(new Date())
	});

	fiats.subscribe((value) => {
		data = value;
	});

	const handleCurrencyChange = (e: Event): void => {
		const selectedCurrency = (e.target as HTMLInputElement).value;
		currency = selectedCurrency;
		const selectedCurrencyData = data.find(
			(c: { code: string; symbol: string }) => c.code === selectedCurrency
		);
		currencySymbol = selectedCurrencyData.symbol || '$';
		validateField('currency', currency);
	};

	async function handleSubmit(event: Event) {
		event.preventDefault();
		try {
			await schema.validate(
				{
					name,
					cost,
					currency,
					date
				},
				{ abortEarly: false }
			);
			validated = true;
			validationErrors = {};

			await saveFormData();
			onClose();
		} catch (error) {
			validated = false;
			validationErrors = (error as yup.ValidationError).inner.reduce((acc: any, err) => {
				if (err.path) {
					acc[err.path] = err.message;
				}
				return acc;
			}, {});
		}
	}

	const handleNameChange = () => {
		validateField('name', name);
	};

	const handleCostChange = () => {
		validateField('cost', cost);
	};

	const handleDateChange = () => {
		validateField('date', date);
	};

	const validateField = async (field: string, value: string | number | Date | undefined) => {
		try {
			await schema.validateAt(field, { [field]: value });
			validationErrors[field] = '';
		} catch (err) {
			validationErrors[field] = (err as yup.ValidationError).message;
		}
	};

	async function saveFormData() {
		const formData = {
			name,
			cost,
			currency,
			date
		};
		const validDate = new Date(date as Date);
		const price = await liveCoinWatchApi.getCoinPrice(validDate, currency);
		user.addAsset({
			...formData,
			date: validDate,
			coin: price
		});
	}
</script>

<Modal {isOpen} on:close={onClose} backdrop centered fade header="LiveCoinWatch SDK Key">
	<ModalBody>
		<Form {validated} on:submit={handleSubmit}>
			<FormGroup>
				<Label for="name">Name</Label>
				<Input
					placeholder="Name"
					bind:value={name}
					on:change={handleNameChange}
					invalid={!!validationErrors.name}
				/>
				{#if validationErrors.name}
					<div class="invalid-feedback" style="display: block;">{validationErrors.name}</div>
				{/if}
			</FormGroup>
			<FormGroup>
				<Label for="cost">Cost</Label>
				<InputGroup>
					<InputGroupText>{currencySymbol}</InputGroupText>
					<Input
						type="number"
						placeholder="0.00"
						bind:value={cost}
						on:change={handleCostChange}
						invalid={!!validationErrors.cost}
					/>
					<InputGroupText style="padding: 0">
						<Input
							type="select"
							on:change={handleCurrencyChange}
							bind:value={currency}
							invalid={!!validationErrors.currency}
							style=" border-top-left-radius: 0; border-bottom-left-radius: 0"
						>
							{#each data as c}
								<option value={c.code}>{c.code}</option>
							{/each}
						</Input>
					</InputGroupText>
					{#if validationErrors.cost || validationErrors.currency}
						<div class="invalid-feedback" style="display: block;">
							{validationErrors.cost || validationErrors.currency}
						</div>
					{/if}
				</InputGroup>
			</FormGroup>
			<FormGroup>
				<Label for="date">Date of purchase</Label>
				<Input
					type="date"
					bind:value={date}
					on:change={handleDateChange}
					invalid={!!validationErrors.date}
				/>
				{#if validationErrors.date}
					<div class="invalid-feedback" style="display: block;">{validationErrors.date}</div>
				{/if}
			</FormGroup>
		</Form>
	</ModalBody>
	<ModalFooter>
		<Button color="secondary" on:click={onClose}>Cancel</Button>
		<Button color="primary" on:click={handleSubmit}>Save</Button>
	</ModalFooter>
</Modal>

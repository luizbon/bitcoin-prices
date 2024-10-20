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
		ModalFooter
	} from '@sveltestrap/sveltestrap';
	import { fiats } from '$lib/stores/fiats.store';
	import { user } from '$lib/stores/user.store';
	import { liveCoinWatchApi } from '$lib/sdks/livecoinwatch.api';
	import * as yup from 'yup';

	export let isOpen = false;
	export let onClose: () => void;

	let currency = '';
	let cost: number = 0;
	let date: Date = new Date();
	let name = '';
	let currencySymbol = '$';
	let validated: boolean | undefined = undefined;
	let data: any = [];
	let validationErrors: { [key: string]: string } = {};

	const schema = yup.object().shape({
		name: yup.string().required(),
		cost: yup.number().required().positive(),
		currency: yup.string().required(),
		date: yup.date().max(new Date())
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
			isOpen = false;
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

	const validateField = async (field: string, value: string | number | Date) => {
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
		const price = await liveCoinWatchApi.getCoinPrice(new Date(date), currency);
		user.addAsset({
			...formData,
			coin: price
		});
	}
</script>

<Modal {isOpen} on:close={onClose} backdrop centered fade header="LiveCoinWatch SDK Key">
	<ModalBody>
		<Form {validated} on:submit={handleSubmit}>
			<FormGroup>
				<Input
					placeholder="Name"
					bind:value={name}
					invalid={validationErrors.name !== undefined}
					valid={validationErrors.name === undefined}
					on:change={handleNameChange}
				/>
			</FormGroup>
			<FormGroup>
				<InputGroup>
					<InputGroupText>{currencySymbol}</InputGroupText>
					<Input
						type="number"
						placeholder="0.00"
						bind:value={cost}
						invalid={validationErrors.cost !== undefined}
						valid={validationErrors.cost === undefined}
						on:change={handleCostChange}
					/>
					<InputGroupText style="padding: 0">
						<Input
							invalid={validationErrors.currency !== undefined}
							valid={validationErrors.currency === undefined}
							type="select"
							on:change={handleCurrencyChange}
							bind:value={currency}
							style=" border-top-left-radius: 0; border-bottom-left-radius: 0"
						>
							{#each data as c}
								<option value={c.code}>{c.code}</option>
							{/each}
						</Input>
					</InputGroupText>
				</InputGroup>
			</FormGroup>
			<FormGroup>
				<Input
					type="date"
					bind:value={date}
					invalid={validationErrors.date !== undefined}
					valid={validationErrors.date === undefined}
					on:change={handleDateChange}
				/>
			</FormGroup>
		</Form>
	</ModalBody>
	<ModalFooter>
		<Button color="secondary" on:click={onClose}>Cancel</Button>
		<Button color="primary" on:click={handleSubmit}>Save</Button>
	</ModalFooter>
</Modal>

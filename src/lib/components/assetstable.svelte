<script lang="ts">
	import { user } from '$lib/stores/user.store';
	import { Table, Button } from '@sveltestrap/sveltestrap';
	import { currentPrices } from '$lib/stores/currentprices.store';
	let prices: { [key: string]: { rate: number } } = {};
	currentPrices.subscribe((value) => (prices = value));

	type Asset = {
		name: string;
		currency: string;
		cost: number;
		date: Date;
		coin: {
			webp32: string;
			name: string;
			symbol: string;
			price: {
				rate: number;
			};
			code: string;
		};
	};

	function deleteAsset(asset: Asset): void {
		user.removeAsset(asset);
	}
</script>

<Table>
	<thead>
		<tr>
			<th></th>
			<th>Asset</th>
			<th>Cost</th>
			<th>Date</th>
			<th>Coin Value</th>
			<th>Current Cost</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each $user.assets as asset}
			<tr>
				<td><img src={asset.coin.webp32} alt={asset.coin.name} /></td>
				<td>{asset.name}</td>
				<td>
					{new Intl.NumberFormat(undefined, {
						style: 'currency',
						currency: asset.currency
					}).format(asset.cost)}
				</td>
				<td>{new Date(asset.date).toLocaleDateString()}</td>
				<td>
					{asset.coin.symbol}
					{new Intl.NumberFormat(undefined, {
						style: 'decimal'
					}).format(asset.cost / asset.coin.price.rate)}
				</td>
				<td>
					{#if prices[`${asset.currency}_${asset.coin.code}`]}
						{new Intl.NumberFormat(undefined, {
							style: 'currency',
							currency: asset.currency
						}).format(
							prices[`${asset.currency}_${asset.coin.code}`].rate *
								(asset.cost / asset.coin.price.rate)
						)}
					{:else}
						Loading...
					{/if}
				</td>
				<td>
					<Button color="danger" on:click={() => deleteAsset(asset)}>Delete</Button>
				</td>
			</tr>
		{/each}
	</tbody>
</Table>

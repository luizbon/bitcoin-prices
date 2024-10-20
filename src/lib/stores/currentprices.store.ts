import { user } from './user.store';
import { writable } from 'svelte/store';
import { liveCoinWatchApi } from '$lib/sdks/livecoinwatch.api';

export const currentPrices = writable({});

user.subscribe(async (value) => {
	const distinctCoins = [
		...new Set(
			value.assets.map((asset) => {
				return {
					currency: asset.currency,
					code: asset.coin.code
				};
			})
		)
	];
	for (const coin of distinctCoins) {
		try {
			const price = await liveCoinWatchApi.getCurrentCoinPrice(coin.currency, coin.code);
			currentPrices.update((prices) => {
				return {
					...prices,
					[`${coin.currency}_${coin.code}`]: price
				};
			});
		} catch (error) {
			console.error(error);
		}
	}
});

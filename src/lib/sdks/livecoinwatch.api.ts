import { PUBLIC_LIVECOINWATCH_URL } from '$env/static/public';
import { livecoinwatchApiKey } from '$lib/stores/livecoinwatch.store';

export interface IFiat {
	code: string;
	name: string;
	symbol?: string;
}

interface IHistoryItem {
	date: number;
	rate: number;
}

interface ICoinPriceHisroty {
	history?: Array<IHistoryItem>;
	price?: IHistoryItem;
}

let api_key: string;

livecoinwatchApiKey.subscribe((value) => {
	api_key = value;
});

const getAllFiats = async (
	localFetch: (
		input: RequestInfo | URL,
		init?: RequestInit | undefined
	) => Promise<Response> = fetch
) => {
	const response = await localFetch(`${PUBLIC_LIVECOINWATCH_URL}/fiats/all`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': api_key
		}
	});
	const data = await response.json();
	return data.sort((a: IFiat, b: IFiat) => a.code.localeCompare(b.code));
};

const getCoinPrice = async (
	date: Date,
	currency: string,
	coinCode: string = 'BTC',
	localFetch: (
		input: RequestInfo | URL,
		init?: RequestInit | undefined
	) => Promise<Response> = fetch
) => {
	const startInEpoch = date.getTime();
	const endInEpoch = date.getTime() + 24 * 60 * 60 * 1000;
	const response = await localFetch(`${PUBLIC_LIVECOINWATCH_URL}/coins/single/history`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': api_key
		},
		body: JSON.stringify({
			currency: currency,
			code: coinCode,
			meta: true,
			start: startInEpoch,
			end: endInEpoch
		})
	});

	if (!response.ok) {
		const responseText = await response.text();
		throw new Error(`Failed to fetch data ${response.statusText}: ${responseText}`);
	}

	const data: ICoinPriceHisroty = await response.json();
	const history: IHistoryItem[] | undefined = data.history;
	if (!history) {
		throw new Error('No history data');
	}
	const targetDate = date.toISOString().split('T')[0];
	const lastPrice = history
		.filter((item: any) => {
			const entryDate = new Date(item.date).toISOString().split('T')[0];
			return entryDate === targetDate;
		})
		.pop();
	delete data.history;
	data.price = lastPrice;
	return data;
};

const getCurrentCoinPrice = async (
	currency: string,
	coinCode: string = 'BTC',
	localFetch: (
		input: RequestInfo | URL,
		init?: RequestInit | undefined
	) => Promise<Response> = fetch
) => {
	const response = await localFetch(`${PUBLIC_LIVECOINWATCH_URL}/coins/single`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': api_key
		},
		body: JSON.stringify({
			currency: currency,
			code: coinCode,
			meta: false
		})
	});

	if (!response.ok) {
		const responseText = await response.text();
		throw new Error(`Failed to fetch data ${response.statusText}: ${responseText}`);
	}

	return await response.json();
};

export const liveCoinWatchApi = {
	getAllFiats,
	getCoinPrice,
	getCurrentCoinPrice
};

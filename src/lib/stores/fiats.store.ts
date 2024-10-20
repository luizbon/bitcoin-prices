import { writable } from 'svelte/store';
import { liveCoinWatchApi } from '$lib/sdks/livecoinwatch.api';

export const fiats = writable({});

const data = await liveCoinWatchApi.getAllFiats(fetch);

fiats.set(data);

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { openDB } from 'idb';

interface Asset {
	name: string;
	cost: number;
	currency: string;
	date: Date;
	coin: any;
}

interface User {
	assets: Array<Asset>;
}
const emptyUser: User = {
	assets: []
};

const DB_NAME = 'crypto-tracker';
const DB_VERSION = 1;
const DB_STORE = 'user-store';

const _openDB = async () => {
	return await openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			db.createObjectStore(DB_STORE);
		}
	});
};

const getUserFromDB = async (): Promise<User> => {
	if (!browser) return emptyUser;

	const db = await _openDB();

	const user = await db.get(DB_STORE, 'user');
	return user || emptyUser;
};

const saveUserToDB = async (user: User) => {
	if (!browser) return;

	const db = await _openDB();

	await db.put(DB_STORE, user, 'user');
};

const initialUser = await getUserFromDB();

const { subscribe, set, update } = writable<User>(initialUser);

subscribe((value) => {
	saveUserToDB(value);
});

function createUser() {
	const addAsset = (asset: Asset) => {
		update((user) => {
			if (!user.assets) {
				user.assets = [];
			}
			user.assets.push(asset);

			return user;
		});
	};

	const removeAsset = (asset: Asset) => {
		update((user) => {
			if (!user.assets) {
				user.assets = [];
			}
			user.assets = user.assets.filter((a) => a !== asset);

			return user;
		});
	};

	const reset = () => {
		set(emptyUser);
	};

	return {
		subscribe,
		addAsset,
		removeAsset,
		reset
	};
}

export const user = createUser();

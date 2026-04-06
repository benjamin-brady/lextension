export interface PersistedStateHistoryEntry<T> {
	snapshot: T;
	timestamp: number;
}

export interface PersistedGameRecord<TState, THistorySnapshot> {
	storageId: string;
	snapshot: TState;
	history: PersistedStateHistoryEntry<THistorySnapshot>[];
	checks: number;
	solved: boolean;
	updatedAt: number;
}

const DB_NAME = 'simicle';
const DB_VERSION = 1;
const STORE_NAME = 'game-history';

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
	if (databasePromise) {
		return databasePromise;
	}

	databasePromise = new Promise((resolve, reject) => {
		if (typeof indexedDB === 'undefined') {
			reject(new Error('IndexedDB unavailable'));
			return;
		}

		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const database = request.result;
			if (database.objectStoreNames.contains(STORE_NAME)) {
				return;
			}

			const store = database.createObjectStore(STORE_NAME, { keyPath: 'storageId' });
			store.createIndex('updatedAt', 'updatedAt');
			store.createIndex('solved', 'solved');
		};

		request.onsuccess = () => {
			const database = request.result;
			database.onversionchange = () => {
				database.close();
			};
			resolve(database);
		};

		request.onerror = () => {
			reject(request.error ?? new Error('Failed to open IndexedDB'));
		};
	});

	return databasePromise;
}

export async function saveGameRecord<TState, THistorySnapshot>(
	record: PersistedGameRecord<TState, THistorySnapshot>
): Promise<void> {
	if (typeof indexedDB === 'undefined') {
		return;
	}

	const database = await openDatabase();

	await new Promise<void>((resolve, reject) => {
		const transaction = database.transaction(STORE_NAME, 'readwrite');
		transaction.oncomplete = () => resolve();
		transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB write aborted'));
		transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB write failed'));

		transaction.objectStore(STORE_NAME).put(record);
	});
}

export async function deleteGameRecord(storageId: string): Promise<void> {
	if (typeof indexedDB === 'undefined') {
		return;
	}

	const database = await openDatabase();

	await new Promise<void>((resolve, reject) => {
		const transaction = database.transaction(STORE_NAME, 'readwrite');
		transaction.oncomplete = () => resolve();
		transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB delete aborted'));
		transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB delete failed'));

		transaction.objectStore(STORE_NAME).delete(storageId);
	});
}

export async function loadSolvedGameIds(storageIds: string[]): Promise<Set<string>> {
	if (typeof indexedDB === 'undefined' || storageIds.length === 0) {
		return new Set();
	}

	const database = await openDatabase();

	return await new Promise<Set<string>>((resolve, reject) => {
		const transaction = database.transaction(STORE_NAME, 'readonly');
		const store = transaction.objectStore(STORE_NAME);
		const solvedIds = new Set<string>();

		transaction.oncomplete = () => resolve(solvedIds);
		transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB read aborted'));
		transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB read failed'));

		for (const storageId of storageIds) {
			const request = store.get(storageId);
			request.onsuccess = () => {
				const record = request.result as PersistedGameRecord<unknown, unknown> | undefined;
				if (record?.solved) {
					solvedIds.add(storageId);
				}
			};
		}
	});
}
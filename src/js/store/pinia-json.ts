import { fs, path as _path } from '../lib/cep/node';
import type { Store, PiniaPluginContext } from 'pinia';

declare module 'pinia' {
    export interface DefineStoreOptionsBase<S extends StateTree, Store> {
        json?: {
            path: string;
        }
    }
}

function hydrateStore(store: Store, path: string) {
    try {
        const data = fs.readFileSync(path, 'utf-8');
        const json = JSON.parse(data);

        // Merge the object with the store's state
        store.$state = { ...store.$state, ...json };
        console.info(`Loaded state from ${path}`, store.$state);
    } catch (error) {
        console.error(`Failed to load state from ${path}:`, error);
    }
}

function persistState(store: Store, path: string) {
    try {
        const stateJson = JSON.stringify(store.$state, null, 2);
    
        const dir = _path.dirname(path);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path, stateJson);
    } catch (error) {
        console.error(`Failed to save state to ${path}:`, error);
    }
}

export default function piniaJson(context: PiniaPluginContext) {
    const { store, options } = context;
    // Check if the store has a 'json' key in its options
    if (options.json) {
        let { path } = options.json;

        // Append '.json' if 'path' doesn't already end with it
        if (!path.endsWith('.json')) {
            path += '.json';
        }

        hydrateStore(store, path);

        store.$subscribe(() => {
            persistState(store, path);
        });
    }
}
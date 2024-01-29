import CSInterface, { CSEvent } from '../lib/cep/csinterface';
import type { PiniaPluginContext } from 'pinia';

type stateChangePayload = {
    storeId: string;
    state: object;
}

export default function piniaCEP(context: PiniaPluginContext) {
    const { store } = context;
    const csInterface = new CSInterface();

    // Register a CEP event listener that updates the store's state
    csInterface.addEventListener('stateChange', (event: CSEvent<stateChangePayload>) => {
        const { storeId, state } = event.data;
        if (store.$id === storeId && JSON.stringify(state) !== JSON.stringify(store.$state)) {
            store.$state = { ...store.$state, ...state };
            console.log(`Updated state for ${storeId}`, store.$state);
        }
    });

    store.$subscribe(() => {
        // Dispatch a CEP event with the new state
        const appId = csInterface.getApplicationID();
        const extensionId = csInterface.getExtensionID();
        const event = new CSEvent('stateChange', 'APPLICATION', appId, extensionId)
        event.data = {
            storeId: store.$id,
            state: store.$state,
        };
        csInterface.dispatchEvent(event);
        console.log(`Dispatched stateChange event for ${store.$id}`, store.$state)
    });
}
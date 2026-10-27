import { getServiceName } from './service_instance_key';

export { createServiceInstanceKey, getServiceName, removeServiceInstances } from './service_instance_key';

export enum ServiceType {
    TRANSLATE = 'translate',
    RECOGNIZE = 'recognize',
    TTS = 'tts',
    COLLECTION = 'collection',
}

export enum ServiceSourceType {
    BUILDIN = 'buildin',
    PLUGIN = 'plugin',
}

export function getServiceSouceType(serviceInstanceKey: string): ServiceSourceType {
    if (serviceInstanceKey.startsWith('plugin')) {
        return ServiceSourceType.PLUGIN;
    } else {
        return ServiceSourceType.BUILDIN;
    }
}

export function whetherPluginService(serviceInstanceKey: string): boolean {
    return getServiceSouceType(serviceInstanceKey) === ServiceSourceType.PLUGIN;
}

export function getDisplayInstanceName(instanceName: string, serviceNameSupplier: () => string): string {
    return instanceName || serviceNameSupplier();
}

// The serviceInstanceKey consists of the service name and it's id, separated by @
// In earlier versions, the @ separator and id were optional, so they all have only one instance.
export const INSTANCE_NAME_CONFIG_KEY = 'instanceName';

export function whetherAvailableService(
    serviceInstanceKey: string,
    availableServices: Record<ServiceSourceType, Record<string, any>>
) {
    const serviceSourceType = getServiceSouceType(serviceInstanceKey);
    const serviceName = getServiceName(serviceInstanceKey);
    return availableServices[serviceSourceType]?.[serviceName] !== undefined;
}

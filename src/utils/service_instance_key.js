// The serviceInstanceKey consists of the service name and it's id, separated by @
// In earlier versions, the @ separator and id were optional, so they all have only one instance.
export function createServiceInstanceKey(serviceName) {
    const randomId = Math.random().toString(36).substring(2);
    return `${serviceName}@${randomId}`;
}

// if the serviceInstanceKey is from a plugin, serviceName is it's pluginId
export function getServiceName(serviceInstanceKey) {
    return serviceInstanceKey.split('@')[0];
}

/**
 * 从服务实例列表中移除目标。
 * - 传入实例 key（包含 @）时只移除该实例
 * - 传入服务名/插件名时移除该服务的所有实例（用于卸载插件、删除内置服务）
 */
export function removeServiceInstances(list, target) {
    if (target.includes('@')) {
        return list.filter((key) => key !== target);
    }
    return list.filter((key) => key !== target && getServiceName(key) !== target);
}

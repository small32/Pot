import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createServiceInstanceKey,
    getServiceName,
    removeServiceInstances,
} from '../src/utils/service_instance_key.js';

test('实例 key 由服务名与随机 id 组成', () => {
    const key = createServiceInstanceKey('bing');
    assert.ok(key.startsWith('bing@'));
    assert.equal(getServiceName(key), 'bing');
    assert.equal(getServiceName('bing'), 'bing');
});

test('按实例 key 删除只移除该实例', () => {
    const list = ['bing@1', 'bing@2', 'google@1'];
    assert.deepEqual(removeServiceInstances(list, 'bing@1'), ['bing@2', 'google@1']);
});

test('按插件名删除会移除该插件的所有实例（卸载插件场景）', () => {
    const list = ['plugin-foo@1', 'plugin-foo@2', 'bing@1'];
    assert.deepEqual(removeServiceInstances(list, 'plugin-foo'), ['bing@1']);
});

test('兼容旧版裸服务名', () => {
    const list = ['system', 'system@1', 'tesseract'];
    assert.deepEqual(removeServiceInstances(list, 'system'), ['tesseract']);
});

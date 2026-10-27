import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizePortInput, parsePort } from '../src/utils/port.js';

test('parsePort 接受合法端口', () => {
    assert.equal(parsePort('8080'), 8080);
    assert.equal(parsePort(65535), 65535);
    assert.equal(parsePort(' 1 '), 1);
});

test('parsePort 拒绝非法端口', () => {
    assert.equal(parsePort(''), null);
    assert.equal(parsePort('0'), null);
    assert.equal(parsePort('65536'), null);
    assert.equal(parsePort('abc'), null);
    assert.equal(parsePort('1.5'), null);
    assert.equal(parsePort(Number.NaN), null);
    assert.equal(parsePort(null), null);
    assert.equal(parsePort(undefined), null);
});

test('normalizePortInput 空值返回调用方指定的空值', () => {
    assert.equal(normalizePortInput('', { emptyValue: 0 }), 0);
    assert.equal(normalizePortInput('', { emptyValue: '' }), '');
    assert.equal(normalizePortInput(null), '');
});

test('normalizePortInput 不会把 NaN 写入配置', () => {
    assert.equal(normalizePortInput('abc'), null);
    assert.equal(normalizePortInput('-'), null);
});

test('normalizePortInput 收敛越界值', () => {
    assert.equal(normalizePortInput('70000', { max: 65535 }), 65535);
    assert.equal(normalizePortInput('-5', { min: 0 }), 0);
    assert.equal(normalizePortInput('8080.9'), 8080);
});

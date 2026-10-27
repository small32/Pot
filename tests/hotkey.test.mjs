import test from 'node:test';
import assert from 'node:assert/strict';

import { getHotkeyFromEvent } from '../src/utils/hotkey.js';

test('组合修饰键生成快捷键', () => {
    assert.equal(getHotkeyFromEvent({ ctrlKey: true, code: 'KeyA' }, 'Windows_NT'), 'Ctrl+A');
    assert.equal(
        getHotkeyFromEvent({ ctrlKey: true, shiftKey: true, altKey: true, code: 'Digit1' }, 'Windows_NT'),
        'Ctrl+Shift+Alt+1'
    );
});

test('macOS 使用 Command，其他平台使用 Super', () => {
    assert.equal(getHotkeyFromEvent({ metaKey: true, code: 'ArrowUp' }, 'Darwin'), 'Command+Up');
    assert.equal(getHotkeyFromEvent({ metaKey: true, code: 'ArrowUp' }, 'Windows_NT'), 'Super+Up');
});

test('只按修饰键时返回 null，避免写入无效快捷键', () => {
    assert.equal(getHotkeyFromEvent({ ctrlKey: true, code: 'ControlLeft' }, 'Windows_NT'), null);
    assert.equal(getHotkeyFromEvent({ shiftKey: true, code: '' }, 'Windows_NT'), null);
});

test('功能键与符号键映射', () => {
    assert.equal(getHotkeyFromEvent({ code: 'F12' }, 'Windows_NT'), 'F12');
    assert.equal(getHotkeyFromEvent({ code: 'Backquote' }, 'Windows_NT'), '`');
    assert.equal(getHotkeyFromEvent({ code: 'Numpad5' }, 'Windows_NT'), 'Num5');
    assert.equal(getHotkeyFromEvent({ code: 'IntlYen' }, 'Windows_NT'), 'Yen');
});

test('未知按键返回 null', () => {
    assert.equal(getHotkeyFromEvent({ code: 'Unidentified' }, 'Windows_NT'), null);
});

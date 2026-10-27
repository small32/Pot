import test from 'node:test';
import assert from 'node:assert/strict';

import { parseSseLines } from '../src/utils/sse.js';

test('解析完整的 data 行并保留未结束的残留', () => {
    const { payloads, rest } = parseSseLines('data: {"a":1}\ndata: {"a":2}\npartial');
    assert.deepEqual(payloads, ['{"a":1}', '{"a":2}']);
    assert.equal(rest, 'partial');
});

test('跳过空行与 [DONE]', () => {
    const { payloads, rest } = parseSseLines('data: [DONE]\n\ndata:\n');
    assert.deepEqual(payloads, []);
    assert.equal(rest, '');
});

test('JSON 被拆到两个 chunk 时不会误解析', () => {
    const first = 'data: {"choices":[{"delta":{"content":"你';
    const firstResult = parseSseLines(first);
    assert.deepEqual(firstResult.payloads, []);
    assert.equal(firstResult.rest, first);

    const secondResult = parseSseLines(firstResult.rest + '好"}}]}\ndata: [DONE]\n');
    assert.equal(secondResult.payloads.length, 1);
    const data = JSON.parse(secondResult.payloads[0]);
    assert.equal(data.choices[0].delta.content, '你好');
    assert.equal(secondResult.rest, '');
});

test('兼容 CRLF 换行', () => {
    const { payloads } = parseSseLines('data: {"a":1}\r\ndata: {"a":2}\r\n');
    assert.deepEqual(payloads, ['{"a":1}', '{"a":2}']);
});

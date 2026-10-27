import * as jose from 'jose';

import { Language } from './info';
import { parseSseLines } from '../../../utils/sse';

export async function translate(text, from, to, options = {}) {
    const { config, setResult, detect } = options;

    let { model, apiKey, promptList } = config;

    let [id, secret] = apiKey.split('.');
    if (id === undefined || secret === undefined) {
        return Promise.reject('invalid apikey');
    }
    promptList = promptList.map((item) => {
        return {
            ...item,
            content: item.content
                .replaceAll('$text', text)
                .replaceAll('$from', from)
                .replaceAll('$to', to)
                .replaceAll('$detect', Language[detect]),
        };
    });

    //
    let timestamp = new Date().getTime();
    let payload = {
        api_key: id,
        exp: timestamp + 1000 * 60,
        timestamp: timestamp,
    };
    secret = new TextEncoder().encode(secret);
    let jwt = new jose.SignJWT(payload).setProtectedHeader({ alg: 'HS256', sign_type: 'SIGN' });
    let token = await jwt.sign(secret);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token,
    };

    const body = {
        model: model,
        messages: promptList,
        stream: true,
        thinking: {
            type: 'disabled',
        },
    };

    let result = '';
    // 必须使用 WebView 原生 fetch：Tauri 的 http.fetch 响应只有 data，无法读取流
    const response = await window.fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw `Http Request Error\nHttp Status: ${response.status}\n${await response.text()}`;
    }
    if (!response.body) {
        throw 'Streaming response body is not available';
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            buffer += decoder.decode(value, { stream: true });
            const { payloads, rest } = parseSseLines(buffer);
            buffer = rest;
            for (const line of payloads) {
                let data;
                try {
                    data = JSON.parse(line);
                } catch {
                    // 忽略非 JSON 的保活行
                    continue;
                }
                const content = data?.choices?.[0]?.delta?.content;
                if (content) {
                    result += content;
                    if (setResult) {
                        setResult(result + '_');
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }

    return result;
}

export * from './Config';
export * from './info';

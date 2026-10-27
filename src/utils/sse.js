/**
 * 从流式文本缓冲中切出完整的 SSE data 行。
 * 返回值 payloads 为已去掉 "data:" 前缀的完整行，rest 为尚未结束的残留内容。
 */
export function parseSseLines(buffer) {
    const lines = buffer.split('\n');
    const rest = lines.pop() ?? '';
    const payloads = [];
    for (const line of lines) {
        const text = line.trim();
        if (!text.startsWith('data:')) {
            continue;
        }
        const data = text.slice(5).trim();
        if (data === '' || data === '[DONE]') {
            continue;
        }
        payloads.push(data);
    }
    return { payloads, rest };
}

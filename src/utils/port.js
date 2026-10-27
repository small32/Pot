/**
 * 解析端口号，非法值返回 null（用于判断代理配置是否可用）。
 */
export function parsePort(value) {
    if (typeof value === 'number') {
        return Number.isInteger(value) && value > 0 && value <= 65535 ? value : null;
    }
    if (typeof value !== 'string') {
        return null;
    }
    const text = value.trim();
    if (text === '' || !/^\d+$/.test(text)) {
        return null;
    }
    const port = Number(text);
    return port > 0 && port <= 65535 ? port : null;
}

/**
 * 将输入框内容规范化为端口数值。
 * - 空值返回 emptyValue
 * - 非数字返回 null（调用方应保持原值，避免把 NaN 写入配置）
 * - 越界值收敛到 [min, max]
 */
export function normalizePortInput(value, { min = 1, max = 65535, emptyValue = '' } = {}) {
    if (value === '' || value === null || value === undefined) {
        return emptyValue;
    }
    const port = Number(value);
    if (!Number.isFinite(port)) {
        return null;
    }
    return Math.min(max, Math.max(min, Math.trunc(port)));
}

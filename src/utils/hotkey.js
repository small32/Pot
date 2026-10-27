// 与 tauri global-shortcut 接受的按键名称保持一致
export const hotkeyKeyMap = {
    Backquote: '`',
    Backslash: '\\',
    BracketLeft: '[',
    BracketRight: ']',
    Comma: ',',
    Equal: '=',
    Minus: '-',
    Plus: 'PLUS',
    Period: '.',
    Quote: "'",
    Semicolon: ';',
    Slash: '/',
    Backspace: 'Backspace',
    CapsLock: 'Capslock',
    ContextMenu: 'Contextmenu',
    Space: 'Space',
    Tab: 'Tab',
    Convert: 'Convert',
    Delete: 'Delete',
    End: 'End',
    Help: 'Help',
    Home: 'Home',
    PageDown: 'Pagedown',
    PageUp: 'Pageup',
    Escape: 'Esc',
    PrintScreen: 'Printscreen',
    ScrollLock: 'Scrolllock',
    Pause: 'Pause',
    Insert: 'Insert',
    Suspend: 'Suspend',
};

/**
 * 将键盘事件转换为 tauri 全局快捷键字符串。
 * 只按下修饰键或不可识别的按键时返回 null。
 */
export function getHotkeyFromEvent(event, osType) {
    const modifiers = [];
    if (event.ctrlKey) {
        modifiers.push('Ctrl');
    }
    if (event.shiftKey) {
        modifiers.push('Shift');
    }
    if (event.metaKey) {
        modifiers.push(osType === 'Darwin' ? 'Command' : 'Super');
    }
    if (event.altKey) {
        modifiers.push('Alt');
    }

    let code = event.code ?? '';
    if (code.startsWith('Key')) {
        code = code.substring(3);
    } else if (code.startsWith('Digit')) {
        code = code.substring(5);
    } else if (code.startsWith('Numpad')) {
        code = 'Num' + code.substring(6);
    } else if (code.startsWith('Arrow')) {
        code = code.substring(5);
    } else if (code.startsWith('Intl')) {
        code = code.substring(4);
    } else if (/^F\d+$/.test(code)) {
        // F1 - F24 直接使用
    } else if (hotkeyKeyMap[code] !== undefined) {
        code = hotkeyKeyMap[code];
    } else {
        code = '';
    }

    if (code === '') {
        return null;
    }
    return [...modifiers, code].join('+');
}

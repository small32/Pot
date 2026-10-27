import { unregister, isRegistered } from '@tauri-apps/api/globalShortcut';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { CardBody } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { Input } from '@nextui-org/react';
import { Card } from '@nextui-org/react';
import React, { useState } from 'react';

import { useConfig } from '../../../../hooks/useConfig';
import { useToastStyle } from '../../../../hooks';
import { osType } from '../../../../utils/env';
import { getHotkeyFromEvent } from '../../../../utils/hotkey';
import { invoke } from '@tauri-apps/api';

function HotkeyInput({ name, label }) {
    const [savedKey, setSavedKey] = useConfig(name, '');
    // null 表示没有待保存的修改
    const [draftKey, setDraftKey] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    const onKeyDown = (event) => {
        event.preventDefault();
        if (event.key === 'Backspace') {
            setDraftKey('');
            return;
        }
        const hotkey = getHotkeyFromEvent(event, osType);
        if (hotkey !== null) {
            setDraftKey(hotkey);
        }
    };

    const apply = async () => {
        if (draftKey === null) {
            return;
        }
        if (draftKey === savedKey) {
            setDraftKey(null);
            return;
        }
        setIsLoading(true);
        try {
            if (draftKey !== '') {
                if (await isRegistered(draftKey)) {
                    throw t('config.hotkey.is_register');
                }
                // 先注册新快捷键，成功后再注销旧快捷键并落盘
                await invoke('register_shortcut_by_frontend', { name, shortcut: draftKey });
            }
            if (savedKey) {
                await unregister(savedKey).catch(() => {});
            }
            setSavedKey(draftKey);
            setDraftKey(null);
            toast.success(t('config.hotkey.success'), { style: toastStyle });
        } catch (e) {
            toast.error(typeof e === 'string' ? e : e.toString(), { style: toastStyle });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        savedKey !== null && (
            <div className='config-item'>
                <h3 className='my-auto'>{t(label)}</h3>
                <Input
                    type='hotkey'
                    variant='bordered'
                    value={draftKey ?? savedKey}
                    label={t('config.hotkey.set_hotkey')}
                    className='max-w-[50%]'
                    onKeyDown={onKeyDown}
                    endContent={
                        <Button
                            size='sm'
                            variant='flat'
                            isLoading={isLoading}
                            className={`${draftKey === null ? 'hidden' : ''}`}
                            onPress={apply}
                        >
                            {t('common.ok')}
                        </Button>
                    }
                />
            </div>
        )
    );
}

export default function Hotkey() {
    return (
        <Card>
            <Toaster />
            <CardBody>
                <HotkeyInput
                    name='hotkey_selection_translate'
                    label='config.hotkey.selection_translate'
                />
                <HotkeyInput
                    name='hotkey_input_translate'
                    label='config.hotkey.input_translate'
                />
                <HotkeyInput
                    name='hotkey_ocr_recognize'
                    label='config.hotkey.ocr_recognize'
                />
                <HotkeyInput
                    name='hotkey_ocr_translate'
                    label='config.hotkey.ocr_translate'
                />
            </CardBody>
        </Card>
    );
}

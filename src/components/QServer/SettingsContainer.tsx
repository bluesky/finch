import React, { useState } from 'react';
import SettingsMetadata from './SettingsMetadata';
import SettingsAudioAlert from './SettingsAudioAlert';
import SettingsScreenLock from './SettingsScreenLock';
import SettingsAuthentication from './SettingsAuthentication';
import { WidgetStyleProps } from './Widget';
import { GlobalMetadata } from './types/types';

type SettingsContainerProps = WidgetStyleProps & {
    isGlobalMetadataChecked: boolean;
    handleGlobalMetadataCheckboxChange: (isChecked: boolean) => void;
    updateGlobalMetadata: (newGlobalMetadata: GlobalMetadata) => void;
};
export default function SettingsContainer({
    isGlobalMetadataChecked = false,
    handleGlobalMetadataCheckboxChange = () => {},
    updateGlobalMetadata = () => {},
}: SettingsContainerProps) {
    const [selectedSetting, setSelectedSetting] = useState('Metadata');

    const renderSettingContent = () => {
        switch (selectedSetting) {
            case 'Metadata':
                return (
                    <SettingsMetadata
                        isGlobalMetadataChecked={isGlobalMetadataChecked}
                        handleGlobalMetadataCheckboxChange={handleGlobalMetadataCheckboxChange}
                        updateGlobalMetadata={updateGlobalMetadata}
                    />
                );
            case 'Authentication':
                return <SettingsAuthentication />;
            case 'Audio Alerts':
                return <SettingsAudioAlert />;
            case 'Screen Lock':
                return <SettingsScreenLock />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-full w-full">
            {/* Sidebar */}
            <ul className="w-1/4 max-w-48 flex-shrink-0 p-4 bg-gray-100 h-full overflow-auto rounded-bl-md">
                {['Metadata', 'Authentication', 'Audio Alerts', 'Screen Lock'].map((setting) => (
                    <li
                        key={setting}
                        onClick={() => setSelectedSetting(setting)}
                        className={`p-2 cursor-pointer font-medium text-black ${selectedSetting === setting ? 'bg-indigo-200 rounded-md' : ''} hover:bg-indigo-100`}
                    >
                        {setting}
                    </li>
                ))}
            </ul>

            {/* Content Area */}
            <div className="flex-grow h-full overflow-auto pt-2">{renderSettingContent()}</div>
        </div>
    );
}

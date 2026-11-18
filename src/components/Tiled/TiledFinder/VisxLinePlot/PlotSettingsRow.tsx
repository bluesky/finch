import { cn } from '@/lib/utils';

export type SettingOption = {
    value: string | boolean;
    label: string;
    disabled?: boolean;
};

export type SettingConfig = {
    type: 'radio' | 'checkbox';
    currentValue: string | boolean;
    options: SettingOption[];
};

interface PlotSettingsRowProps {
    title: string;
    setting?: SettingConfig;
    handleChange?: (value: string | boolean) => void;
    children?: React.ReactNode;
    className?: string;
}

export default function PlotSettingsRow({
    title,
    setting,
    handleChange,
    children,
    className,
}: PlotSettingsRowProps) {
    return (
        <div className={cn('flex w-full items-center py-1', className)}>
            <strong className="block w-24 flex-shrink-0">{title}</strong>
            <div className="flex flex-wrap gap-4">
                {setting &&
                    handleChange &&
                    setting.options.map((option) => (
                        <label key={option.label} className="flex items-center gap-1 text-sm">
                            <input
                                type={setting.type}
                                disabled={option.disabled}
                                onChange={() => handleChange(option.value)}
                                checked={
                                    setting.type === 'radio'
                                        ? setting.currentValue === option.value
                                        : setting.currentValue === true
                                }
                            />
                            {option.label}
                        </label>
                    ))}

                {children}
            </div>
        </div>
    );
}

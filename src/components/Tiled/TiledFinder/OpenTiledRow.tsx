import ButtonCopyToClipboard from './ui/ButtonCopyToClipboard';
import { TiledItemLinks } from './types';
import { cn } from '@/lib/utils';
export interface OpenTiledRowProps {
    userInputApiKey: string | undefined;
    setIsViewerOpen: (isOpen: boolean) => void;
    buttonModeText: string;
    selectedData: TiledItemLinks | null;
    handleInputChange: (value: string) => void;
    userInputReverseSort: boolean;
    handleReverseSortChange: (reverse: boolean) => void;
    showApiKeyInput?: boolean;
    showReverseSortInput?: boolean;
    showSelectedData?: boolean;
    className?: string;
}
export default function OpenTiledRow({
    userInputApiKey,
    setIsViewerOpen,
    buttonModeText,
    selectedData,
    handleInputChange,
    userInputReverseSort,
    handleReverseSortChange,
    showApiKeyInput,
    showReverseSortInput,
    showSelectedData,
    className,
}: OpenTiledRowProps) {
    return (
        <span className="flex gap-2 items-center">
            {showApiKeyInput && (
                <>
                    <label htmlFor="apikey" className="text-gray-700 text-sm flex items-center">
                        API Key:
                    </label>
                    <input
                        type="text"
                        className="border border-gray-300 rounded-md px-2 py-1 h-fit"
                        placeholder="Enter API Key (optional)"
                        value={userInputApiKey || ''}
                        onChange={(e) => handleInputChange(e.target.value)}
                        name="apikey"
                    />
                </>
            )}
            {showReverseSortInput && (
                <>
                    <label
                        htmlFor="reverseSort"
                        className="text-gray-700 text-sm flex items-center"
                    >
                        Reverse Sort:
                    </label>
                    <input
                        type="checkbox"
                        className="border border-gray-300 rounded-md px-2 py-1 h-fit"
                        checked={userInputReverseSort}
                        onChange={(e) => handleReverseSortChange(e.target.checked)}
                        name="reverseSort"
                    />
                </>
            )}

            <button
                className={cn(
                    'bg-blue-600 hover:bg-blue-500 text-white rounded-md px-2 py-1 h-fit ml-4',
                    className,
                )}
                onClick={() => setIsViewerOpen(true)}
            >
                {buttonModeText}
            </button>
            {showSelectedData && (
                <>
                    <p className=" text-black text-nowrap overflow-x-auto max-w-72 min-w-36 w-fit bg-white hover:cursor-text px-1 py-1">
                        {selectedData && selectedData.self.split('/').pop()}
                    </p>
                    <ButtonCopyToClipboard
                        size="small"
                        showText={true}
                        copyText={selectedData ? selectedData.self : ''}
                    />
                </>
            )}
        </span>
    );
}

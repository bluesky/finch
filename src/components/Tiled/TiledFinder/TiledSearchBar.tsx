import { MagnifyingGlass, CaretDown } from '@phosphor-icons/react';
import { useState, useRef, useEffect, useCallback } from 'react';

type TiledSearchBarProps = {
    // Define any props needed for the TiledSearchBar component
    handleSearchIdClick?: (searchId: string) => void;
    handleSearchMetadataClick?: (metadata: string) => void;
    handleSearchSpecClick?: (spec: string) => void;
    debounceMs?: number; // Allow customizable debounce delay
};

type SearchType = 'id' | 'metadata' | 'spec';

export default function TiledSearchBar({
    handleSearchIdClick,
    handleSearchMetadataClick,
    handleSearchSpecClick,
    debounceMs = 300,
}: TiledSearchBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [selectedType, setSelectedType] = useState<SearchType | null>(null);
    const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const searchOptions: SearchType[] = ['id', 'metadata', 'spec'];

    // Debounced callback execution
    const executeCallback = useCallback(
        (input: string, type: SearchType | null) => {
            if (!input.trim()) return;

            const searchType = type || 'id'; // Default to 'id' if no type is selected

            switch (searchType) {
                case 'id':
                    handleSearchIdClick?.(input);
                    break;
                case 'metadata':
                    handleSearchMetadataClick?.(input);
                    break;
                case 'spec':
                    handleSearchSpecClick?.(input);
                    break;
            }
        },
        [handleSearchIdClick, handleSearchMetadataClick, handleSearchSpecClick],
    );

    // Debounced search effect
    useEffect(() => {
        // Clear previous timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Only trigger search if there's input and the component is expanded
        if (searchInput.trim() && isExpanded) {
            debounceTimeoutRef.current = setTimeout(() => {
                executeCallback(searchInput, selectedType);
            }, debounceMs);
        }

        // Cleanup timeout on unmount or when dependencies change
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [searchInput, isExpanded, debounceMs, executeCallback, selectedType]);

    // Auto-focus when expanded
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    // Handle clicks outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
                setShowDropdown(false);
                setShowTypeDropdown(false);
                setSearchInput('');
                setSelectedType(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleIconClick = () => {
        setIsExpanded(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
        setShowDropdown(value.length > 0);
        setFocusedOptionIndex(-1); // Reset focus when typing
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            // Always handle Escape - close dropdown or entire component
            e.preventDefault();
            if (showDropdown) {
                setShowDropdown(false);
                setFocusedOptionIndex(-1);
                inputRef.current?.focus();
            } else {
                // Close the entire search component
                setIsExpanded(false);
                setSearchInput('');
                setSelectedType(null);
                setFocusedOptionIndex(-1);
            }
            return;
        }

        if (!showDropdown || searchInput.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedOptionIndex((prev) =>
                    prev < searchOptions.length - 1 ? prev + 1 : prev,
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedOptionIndex((prev) => (prev > 0 ? prev - 1 : -1));
                if (focusedOptionIndex === 0) {
                    // If we're at the first option and go up, focus back on input
                    setFocusedOptionIndex(-1);
                    inputRef.current?.focus();
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (focusedOptionIndex >= 0 && focusedOptionIndex < searchOptions.length) {
                    handleOptionClick(searchOptions[focusedOptionIndex]);
                } else {
                    //default to id search if no option is focused
                    handleOptionClick('id');
                }
                break;
            default:
                // Any other key (letters) should focus back on input
                if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9]/)) {
                    setFocusedOptionIndex(-1);
                    inputRef.current?.focus();
                }
                break;
        }
    };

    const handleOptionClick = (type: SearchType) => {
        setSelectedType(type);
        setShowDropdown(false);
        setShowTypeDropdown(false);
        setFocusedOptionIndex(-1);

        // Execute the appropriate callback
        switch (type) {
            case 'id':
                handleSearchIdClick?.(searchInput);
                break;
            case 'metadata':
                console.log('handleOptionClick metadata');
                handleSearchMetadataClick?.(searchInput);
                break;
            case 'spec':
                handleSearchSpecClick?.(searchInput);
                break;
        }
    };

    const handleTypeIndicatorClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowTypeDropdown(!showTypeDropdown);
        setShowDropdown(false);
    };

    const handleTypeChange = (type: SearchType) => {
        setSelectedType(type);
        setShowTypeDropdown(false);

        // Execute the appropriate callback with current search input
        if (searchInput) {
            switch (type) {
                case 'id':
                    handleSearchIdClick?.(searchInput);
                    break;
                case 'metadata':
                    console.log('handleTypeChange metadata');
                    handleSearchMetadataClick?.(searchInput);
                    break;
                case 'spec':
                    handleSearchSpecClick?.(searchInput);
                    break;
            }
        }
    };

    const getSelectedTypeDisplay = () => {
        switch (selectedType) {
            case 'id':
                return 'id';
            case 'metadata':
                return 'md';
            case 'spec':
                return 'spec';
            default:
                return null;
        }
    };

    return (
        <div className="relative flex justify-end w-64 h-10 " ref={containerRef}>
            {/* Main search component */}
            <div
                className={`
                    flex items-center transition-all duration-300 ease-in-out cursor-pointer 
                    ${
                        isExpanded
                            ? 'w-64 h-full border border-slate-300 rounded-md px-3 py-4 bg-white'
                            : 'w-8 h-full'
                    }
                `}
                onClick={!isExpanded ? handleIconClick : undefined}
            >
                {/* Magnifying glass icon - always present and left-justified */}
                <MagnifyingGlass
                    size={20}
                    className="text-slate-500 hover:text-slate-700 flex-shrink-0"
                />

                {/* Input field - only visible when expanded */}
                <input
                    ref={inputRef}
                    type="text"
                    value={searchInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className={`${isExpanded ? 'w-full ml-2' : 'w-0 max-w-0 ml-0'} transition-all duration-300 ease-in-out outline-none flex-1 text-sm`}
                    placeholder={isExpanded ? 'Hit Enter to Search...' : ''}
                />

                {/* Selected type indicator */}
                {selectedType && (
                    <div className="relative">
                        <div
                            className="flex items-center pl-2 px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors"
                            onClick={handleTypeIndicatorClick}
                        >
                            <span>{getSelectedTypeDisplay()}</span>
                            <CaretDown size={12} className="ml-1" />
                        </div>

                        {/* Type dropdown */}
                        {showTypeDropdown && (
                            <div className="absolute top-full right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50 min-w-24">
                                <div
                                    className="px-3 py-1 hover:bg-slate-50 cursor-pointer text-xs"
                                    onClick={() => handleTypeChange('id')}
                                >
                                    id
                                </div>
                                <div
                                    className="px-3 py-1 hover:bg-slate-50 cursor-pointer text-xs"
                                    onClick={() => handleTypeChange('metadata')}
                                >
                                    md
                                </div>
                                <div
                                    className="px-3 py-1 hover:bg-slate-50 cursor-pointer text-xs"
                                    onClick={() => handleTypeChange('spec')}
                                >
                                    spec
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Dropdown options - only visible when typing */}
            {showDropdown && searchInput.length > 0 && (
                <div className="absolute top-full right-0 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50">
                    {searchOptions.map((option, index) => (
                        <div
                            key={option}
                            className={`px-3 py-2 cursor-pointer border-b border-slate-100 
                                ${index === searchOptions.length - 1 ? 'border-b-0' : ''}`}
                            onClick={() => handleOptionClick(option)}
                        >
                            <div className="text-xs text-slate-400 uppercase tracking-wide">
                                {option}
                            </div>
                            <div
                                className={`text-sm text-slate-700 hover:bg-slate-50 rounded px-1 -mx-1 ${
                                    focusedOptionIndex === index ? 'bg-slate-300' : ''
                                }`}
                            >
                                {option === 'id' && `id is "${searchInput}"`}
                                {option === 'metadata' &&
                                    `metadata key or value is "${searchInput}"`}
                                {option === 'spec' && `spec is "${searchInput}"`}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

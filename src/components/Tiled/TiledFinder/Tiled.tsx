import { useState, useCallback, useMemo } from 'react';
import TiledContainer from './TiledContainer';
import TiledFinderQueryBoundary from './TiledFinderQueryBoundary';
import Login from './Login';
import StartupScreen from './StartupScreen';
import OpenTiledRow from './OpenTiledRow';
import './Tiled.css';

import { cn } from '@/lib/utils';
import { TiledItemLinks, TiledItemSelectionData, TiledSearchItem, TiledStructures } from './types';
import {
    generateLinksForCallback,
    getApiKeyFromLocalStorage,
    getAuthFromLocalStorage,
} from './utils';
import {
    TiledApiClient,
    TiledApiProvider,
    getDefaultTiledApiClient,
    useTiledApiClientOptional,
} from '@/api/tiled';

export type TiledProps = {
    /** Callback fired when a user selects an item, receives the item's selection data (links, structure, slice info, etc.). */
    onSelectCallback?: (data: TiledItemSelectionData) => void;
    /** API key used to authenticate requests to the Tiled server. If omitted, the key is read from local storage. Ignored inside an app-level `TiledApiProvider`, whose client is used instead. */
    apiKey?: string;
    /** Bearer token used to authenticate requests to the Tiled server. Ignored inside an app-level `TiledApiProvider`, whose client is used instead. */
    bearerToken?: string;
    /** Overall size preset for the viewer UI. Defaults to `'small'`. */
    size?: 'small' | 'medium' | 'large';
    /** If true, the viewer closes itself after a selection is made. Defaults to `false`. */
    closeOnSelect?: boolean;
    /** Renders the viewer in popup-style chrome (e.g. with a close affordance). */
    isPopup?: boolean;
    /** When true, displays a startup screen prompting the user to enter / confirm the Tiled URL before loading. Defaults to `false`. */
    enableStartupScreen?: boolean;
    /** Base URL of the Tiled server to connect to. Falls back to the default configured URL when omitted. Ignored inside an app-level `TiledApiProvider`, whose client is used instead. */
    tiledBaseUrl?: string;
    /** Additional className applied to the outer background wrapper. */
    backgroundClassName?: string;
    /** When true, container navigation collapses into a single column instead of the Miller-column layout. Defaults to `false`. */
    singleColumnMode?: boolean;
    /** Additional className applied to the main content wrapper. */
    contentClassName?: string;
    /** Additional className applied to the content wrapper when the viewer is expanded. */
    expandedContentClassName?: string;
    /** If true, the viewer renders at full width on mount. Defaults to `false`. */
    isFullWidth?: boolean;
    /** If true, the component renders as a button that opens the viewer on click. Defaults to `false`. */
    isButtonMode?: boolean;
    /** In button mode, show the API-key input alongside the trigger button. */
    inButtonModeShowApiKeyInput?: boolean;
    /** In button mode, show the reverse-sort toggle alongside the trigger button. */
    inButtonModeShowReverseSortInput?: boolean;
    /** In button mode, render a panel showing the currently selected data. */
    inButtonModeShowSelectedData?: boolean;
    /** Label text for the trigger button in button mode. Defaults to `"Select Data"`. */
    buttonModeText?: string;
    /** Sort listings in descending order (newest first). Defaults to `true`. */
    reverseSort?: boolean;
    /** Path within the Tiled tree to open on mount (e.g. `"my/dataset"`). Ignored inside an app-level `TiledApiProvider`, whose client is used instead. */
    initialPath?: string;
    /** When true, show the Bluesky `plan_name` next to each item in the listing if available. */
    showPlanName?: boolean;
    /** When true, show the Bluesky run start time next to each item in the listing if available. */
    showPlanStartTime?: boolean;
    /** Number of items to fetch per page when listing a container. */
    pageLimit?: number;
    /** When true, restore the last visited item from local storage on startup. */
    reloadLastItemOnStartup?: boolean;
    /** When true, the active access and refresh tokens are included in the `onSelectCallback` payload. Defaults to `false`. */
    includeAuthTokensInSelectCallback?: boolean;
    /** Redirect URL passed through to the OIDC login flow. */
    oidcRedirectUrl?: string;
    /** How container contents are laid out: `'columns'` for the Miller-column layout, `'rows'` for a single indented list. Defaults to `'columns'`. */
    displayMode?: 'columns' | 'rows';
    /**Applies additoinal CSS classes to the button when in button mode only */
    buttonClassName?: string;
};
/**
 * The Tiled data browser. Uses the app's `QueryClientProvider` when there is one, and a private
 * client otherwise, so it works both inside a Finch app and dropped into a page on its own.
 */
export default function Tiled(props: TiledProps) {
    return (
        <TiledFinderQueryBoundary>
            <TiledViewer {...props} />
        </TiledFinderQueryBoundary>
    );
}

function TiledViewer({
    onSelectCallback,
    apiKey,
    bearerToken,
    size = 'small',
    closeOnSelect = false,
    isPopup,
    enableStartupScreen = false,
    tiledBaseUrl,
    backgroundClassName,
    contentClassName,
    expandedContentClassName,
    singleColumnMode = false,
    isFullWidth = false,
    isButtonMode = false,
    inButtonModeShowApiKeyInput,
    inButtonModeShowReverseSortInput,
    inButtonModeShowSelectedData,
    buttonModeText = 'Select Data',
    reverseSort = true,
    initialPath,
    showPlanName,
    showPlanStartTime,
    pageLimit,
    reloadLastItemOnStartup,
    includeAuthTokensInSelectCallback = false,
    oidcRedirectUrl,
    displayMode = 'columns',
    buttonClassName,
    ...props
}: TiledProps) {
    const [isClosed, setIsClosed] = useState<boolean>(false);
    const [showStartupScreen, setShowStartupScreen] = useState<boolean>(true);
    const [isViewerOpen, setIsViewerOpen] = useState<boolean>(!isButtonMode);
    const [url, setUrl] = useState<undefined | string>(tiledBaseUrl);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [selectedData, setSelectedData] = useState<TiledItemLinks | null>(null);
    const [userInputApiKey, setUserInputApiKey] = useState<string | undefined>(
        apiKey || getApiKeyFromLocalStorage(),
    );
    const [userInputReverseSort, setUserInputReverseSort] = useState<boolean>(reverseSort || false);
    const [showLogin, setShowLogin] = useState<boolean>(false);

    // Which Tiled client the viewer reads through:
    // - an app-level TiledApiProvider, when there is one — the app decides the server and credentials,
    //   and `tiledBaseUrl`, `apiKey`, `bearerToken` and `initialPath` are not applied;
    // - otherwise a client of its own built from those props, so they never leak into the app's
    //   default Tiled client (and two viewers can point at different servers).
    // Every request below resolves the client through the hooks, so this is the only place it is chosen.
    const appClient = useTiledApiClientOptional();
    const ownClient = useMemo(
        () =>
            appClient
                ? null
                : new TiledApiClient({
                      baseUrl: url || getDefaultTiledApiClient().getBaseUrl(),
                      apiKey: userInputApiKey || null,
                      // A bearerToken prop takes precedence over a stored session.
                      bearerToken: bearerToken || getAuthFromLocalStorage()?.accessToken || null,
                      initialPath,
                      //on auth failures the client cannot recover from (e.g. a failed token refresh) show the login component
                      onAuthError: (error) => {
                          console.error('Authentication error:', error);
                          setShowLogin(true);
                      },
                  }),
        [appClient, url, userInputApiKey, bearerToken, initialPath],
    );
    // The server actually being browsed: shown in the header and used to build selection links.
    const serverUrl =
        appClient && typeof appClient.getBaseUrl === 'function' ? appClient.getBaseUrl() : url;

    const handleLoginSuccess = useCallback(() => {
        setShowLogin(false);
    }, []);

    const handleSelectClick = (item: TiledSearchItem<TiledStructures>, currentSlice?: number[]) => {
        const links: TiledItemLinks = generateLinksForCallback(item, serverUrl);
        setSelectedData(links);
        const selectedDataInfo: TiledItemSelectionData = {
            ...links,
            id: item.id,
            ancestors: item.attributes.ancestors,
        };
        if (includeAuthTokensInSelectCallback) {
            //get from local storage
            const tokens = getAuthFromLocalStorage();
            if (tokens) {
                selectedDataInfo.refreshToken = tokens.refreshToken;
                selectedDataInfo.accessToken = tokens.accessToken;
            } else {
                selectedDataInfo.refreshToken = null;
                selectedDataInfo.accessToken = null;
            }
        }
        if (currentSlice) {
            selectedDataInfo.currentSlice = currentSlice;
        }
        onSelectCallback?.(selectedDataInfo);
        if (closeOnSelect) {
            setIsClosed(true);
        }
        if (isButtonMode) {
            setIsViewerOpen(false);
        }
    };

    const handleClickOutside = () => {
        if (isPopup || isButtonMode) {
            setIsViewerOpen(false);
        }
    };

    const sizeClassMap = {
        small: 'w-[600px] h-[500px]',
        medium: 'w-[800px] h-[800px]',
        large: 'w-[1200px] h-[1200px]',
    };

    const expandedSizeClassMap = {
        small: 'w-[800px] h-[800px]',
        medium: 'w-[1000px] h-[1000px]',
        large: 'w-[1600px] h-[1600px]',
    };

    const handleExpandClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleStartupScreenSubmit = () => {
        setShowStartupScreen(false);
    };

    const handleApiKeyChange = (newApiKey: string) => {
        setUserInputApiKey(newApiKey);
        localStorage.setItem('tiledApiKey', newApiKey);
    };

    if (!isClosed) {
        const content = (
            <>
                {isButtonMode && (
                    <OpenTiledRow
                        userInputApiKey={userInputApiKey}
                        setIsViewerOpen={setIsViewerOpen}
                        buttonModeText={buttonModeText}
                        selectedData={selectedData}
                        userInputReverseSort={userInputReverseSort}
                        handleReverseSortChange={setUserInputReverseSort}
                        handleInputChange={handleApiKeyChange}
                        showApiKeyInput={inButtonModeShowApiKeyInput}
                        showReverseSortInput={inButtonModeShowReverseSortInput}
                        showSelectedData={inButtonModeShowSelectedData}
                        className={buttonClassName}
                    />
                )}

                {isViewerOpen && (
                    <div
                        className={cn(
                            isPopup || isButtonMode
                                ? 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center'
                                : `flex w-full h-full min-w-[600px] min-h-[500px] justify-center items-center ${
                                      size && sizeClassMap[size]
                                  } ${size && isExpanded && expandedSizeClassMap[size]}
                            text-slate-700`,
                            backgroundClassName,
                        )}
                        onClick={handleClickOutside}
                        {...props}
                    >
                        <div
                            className={cn(
                                `
                                    flex flex-col border border-slate-400 shadow-lg rounded-md bg-white max-w-full max-h-full 
                                    ${isPopup || isButtonMode ? 'h-full w-full max-h-[calc(100vh-12rem)] min-h-[500px] max-w-[calc(100vw-12rem)] min-w-[500px]' : sizeClassMap[size]} 
                                    ${isFullWidth ? 'w-full' : ''} ${isExpanded ? cn(size ? expandedSizeClassMap[size] : 'h-full w-full', expandedContentClassName) : ''}
                                `,
                                contentClassName,
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {enableStartupScreen && showStartupScreen ? (
                                <StartupScreen
                                    url={url}
                                    handleUrlChange={setUrl}
                                    handleSubmit={handleStartupScreenSubmit}
                                />
                            ) : (
                                <>
                                    {showLogin ? (
                                        <Login
                                            onSuccess={handleLoginSuccess}
                                            url={serverUrl}
                                            oidcRedirectUrl={oidcRedirectUrl}
                                        />
                                    ) : (
                                        <TiledContainer
                                            url={serverUrl}
                                            onAuthError={() => setShowLogin(true)}
                                            handleSelectClick={handleSelectClick}
                                            singleColumnMode={singleColumnMode}
                                            handleExpandClick={handleExpandClick}
                                            isExpanded={isExpanded}
                                            apiKey={userInputApiKey}
                                            bearerToken={bearerToken}
                                            reverseSort={userInputReverseSort}
                                            showPlanName={showPlanName}
                                            showPlanStartTime={showPlanStartTime}
                                            pageLimit={pageLimit}
                                            reloadLastItemOnStartup={reloadLastItemOnStartup}
                                            displayMode={displayMode}
                                        />
                                    )}
                                    {(isPopup || isButtonMode) && (
                                        <p
                                            className="w-full absolute top-8 text-center text-gray-200 text-3xl -translate-x-1/2 left-1/2 hover:cursor-default"
                                            onClick={handleClickOutside}
                                        >
                                            Select an Item or Click Outside to Close
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </>
        );
        return ownClient ? (
            <TiledApiProvider client={ownClient}>{content}</TiledApiProvider>
        ) : (
            content
        );
    }
}

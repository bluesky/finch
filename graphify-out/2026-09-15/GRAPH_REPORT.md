# Graph Report - finch  (2026-09-15)

## Corpus Check
- Large corpus: 693 files · ~411,499 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 3479 nodes · 10213 edges · 226 communities (133 shown, 84 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 146 edges (avg confidence: 0.84)
- Token cost: 2,119,760 input · 235,508 output

## Community Hubs (Navigation)
- QServer Client Fallbacks & Auth
- Ophyd PV Socket & Endstation Display
- QServer API Client Methods
- Ophyd Sim Core & Transport Seam
- QServer Sim Queue Operations
- Ophyd Device Socket Types
- Storybook Sample Pages & Header
- QServer Plans & Devices Types
- UI Component Library & Controllers
- Energy vs Current Plot & Shutter Sim
- ReactEDM Device Rendering
- QServer Console/History/Lock Types
- QServer Client Error Handling & Testing
- Tiled Array Hooks & Search Encoding
- Package Dev Dependencies
- QServer Admin Endpoint Registry
- Package Metadata
- QServer Client Fallback Strategies
- Ophyd Sim Providers & Camera Socket
- QServer Admin & Auth Mutation Hooks
- Tiled Temp Types
- Ophyd Socket Paths
- QServer Auth Endpoints
- QServer Sim Fixtures & Config
- Storybook All-Components Page & Ophyd Sim Types
- BeamVis EPICS Context
- Hexapod Component
- QServer Environment Hooks & Icons
- QServer Default Client & Interceptors
- QServer Auth Hooks
- Testing Tests
- Qserver
- Qserver Hooks
- Qserver
- Qserver Sim
- Tiled
- Shared
- Tiled Hooks
- Qserver Hooks
- Qserver
- Src Components
- Qserver
- Src Components
- Beamvis
- Ophyd
- Qserver
- Tiled
- Src Components
- Tsconfig
- Src Components
- Qserver
- Stories
- Beamvis
- Src Components
- Qserver Sim Core
- Tsconfig Compileroptions
- Stories
- Testing Tests
- Qserver Client
- Src Components
- Qserver Client
- Tiled Hooks
- Stories
- Src Components
- Beamvis
- Stories
- Beamvis
- Src Components
- Src Components
- Tiled
- Tiled Hooks
- Stories
- Qserver
- Features
- Github Workflows Publish
- Shared
- Qserver Client
- Qserver Hooks
- Ophyd Sim Camera
- Components
- Package
- Qserver
- Beamvis
- Qserver
- Qserver Client
- Stories
- Qserver
- Beamvis
- Beamvis
- Finchapplayout
- Package
- Stories
- Features
- Src App Pages
- Src Components
- Src Components
- Src Components
- Qserver Client
- Qserver Endpoints
- Stories
- Stories
- Src Components
- Ophyd Sim Core
- Stories
- Concept
- Qserver Hooks
- Stories
- Stories Reactedm
- Src Components
- Src Components
- Ref
- Qserver Types
- Qserver
- Testing Tests
- Tsconfig Node Compileroptions
- Qserver Endpoints Adminendpoints
- Finchapplayout
- Src Components
- Testing Setup
- Qserver Endpoints
- Qserver Generated
- Src Components
- Reactedm
- Stories
- Qserver Endpoints
- Src Components
- Qserver
- Reactedm
- Stories
- Concept
- Package
- Ref
- Src Components
- Reactedm
- Reactedm
- Concept
- Package
- Package
- Qserver Endpoints
- Src Components
- Stories
- Vite Env
- Concept
- Concept
- Finch Project
- Finch Ui Project
- Package
- Beamvis
- Beamvis
- Beamvis
- Stories
- Stories
- Stories
- Storybook Manager Head
- Public Finchiconcircle Logo
- Public Images Als
- Public Images Det
- Public Images Det
- Public Images Det
- Public Images Finchbannersmalldarkmode
- Public Vite
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Qserver Client
- Assets
- Assets
- Beamvis
- Beamvis
- Beamvis
- Qserver
- Qserver
- Qserver
- Qserver
- Qserver
- Stories
- Stories
- Stories
- Stories
- Stories
- Stories
- Stories
- Stories
- Stories
- Stories

## God Nodes (most connected - your core abstractions)
1. `react` - 191 edges
2. `cn()` - 186 edges
3. `QServerApiClient` - 147 edges
4. `QServerRequestOptions` - 146 edges
5. `getDefaultQServerClient()` - 98 edges
6. `vitest` - 78 edges
7. `QServerSimulator` - 76 edges
8. `GetWithBodyOptions` - 57 edges
9. `useQServerMutation()` - 56 edges
10. `@testing-library/react` - 55 edges

## Surprising Connections (you probably didn't know these)
- `Storybook About.mdx` --semantically_similar_to--> `Finch README`  [INFERRED] [semantically similar]
  src/stories/About.mdx → README.md
- `src/main.tsx local entry point` --calls--> `App()`  [EXTRACTED]
  Repo Instructions.txt → src/app/App.tsx
- `qServer facade.ts` --calls--> `QServerApiClient`  [EXTRACTED]
  src/api/qServer/SKILLS.md → src/api/qServer/client/QServerApiClient.ts
- `Finch Repository Instructions` --references--> `App()`  [EXTRACTED]
  Repo Instructions.txt → src/app/App.tsx
- `App()` --shares_data_with--> `FinchConfigProvider`  [EXTRACTED]
  src/app/App.tsx → Repo Instructions.txt

## Import Cycles
- 4-file cycle: `src/components/ReactEDM/DeviceRender.tsx -> src/components/ReactEDM/widgets/RelatedDisp.tsx -> src/components/ReactEDM/UIView.tsx -> src/components/ReactEDM/UICanvas.tsx -> src/components/ReactEDM/DeviceRender.tsx`

## Hyperedges (group relationships)
- **Ophyd PV Transport Seam (sim vs real IOC)** — src_lib_ophyd_sim_transport_createophydsimtransport_createophydsimtransport, src_api_ophyd_useophydpvsocket_useophydpvsocket, src_api_ophyd_useophydsocket_useophydsocket, src_components_beamvis_readme_doc [INFERRED 0.80]
- **Browser-Side Backend Simulator Pattern (ophyd-sim / qserver-sim)** — src_lib_ophyd_sim_readme_doc, src_lib_qserver_sim_readme_doc, src_lib_ophyd_sim_skills_doc, src_lib_qserver_sim_skills_doc [INFERRED 0.85]
- **Retired Legacy Hook Layer Kept For Reference (qServer_archive / tiled_archive)** — src_api_qserver_skills_doc, src_api_tiled_skills_doc, src_api_qserver_archive_retiredlayer, src_api_tiled_archive_retiredlayer [INFERRED 0.85]
- **Ophyd Sim transport-seam pattern** — shared_ophydsimprovider_ophydsimprovider, shared_ophydtransportprovider_ophydtransportprovider, src_lib_ophyd_sim_transport_createophydsimtransport_createophydsimtransport, src_api_ophyd_useophydpvsocket_useophydpvsocket [EXTRACTED 0.90]
- **QServer Sim provider/client swap pattern** — shared_qserversimprovider_qserversimprovider, shared_qserverapiprovider_qserverapiprovider, shared_createqserversimclient_createqserversimclient, src_api_qserver_readme_qserverapiclient [EXTRACTED 0.90]
- **ReactEDM widget rendering pipeline** — shared_uiview_uiview, shared_uicanvas_uicanvas, shared_stylerender_stylerender, shared_devicerender_devicerender, shared_compositedevicerenderer_compositedevicerenderer [EXTRACTED 0.95]
- **Endstation Display Animated Illustration Assets** — src_components_endstationdisplay_assets_0_base, src_components_endstationdisplay_assets_1_light_blocked, src_components_endstationdisplay_assets_1_light_unblocked, src_components_endstationdisplay_assets_2_shutter_moveable, src_components_endstationdisplay_assets_3_beamstop_moveable, src_components_endstationdisplay_assets_4_light_mono_moveable, src_components_endstationdisplay_assets_5_sample_holder [INFERRED 0.75]
- **Finch Backend Services (Tiled, Ophyd Socket, Q Server)** — src_stories_assets_fincharchitecture_tiled_component, src_stories_assets_fincharchitecture_ophyd_socket_component, src_stories_assets_fincharchitecture_qserver_component, src_stories_assets_fincharchitecture_bluesky_backend_component [INFERRED 0.85]

## Communities (226 total, 84 thin omitted)

### Community 0 - "QServer Client Fallbacks & Auth"
Cohesion: 0.06
Nodes (55): getQueueItemViaQueueScan(), resolvePosition(), AuthAwareConfig, RetryableConfig, QServerQueueEndpoints, SAMPLE_PLAN, QServerSuccessResponse, ConsoleOutputUpdateBody (+47 more)

### Community 1 - "Ophyd PV Socket & Endstation Display"
Cohesion: 0.04
Nodes (66): Beamline Endstation Apparatus Illustration, react-dom, initialDevices(), useOphydPVSocket(), deviceIcons, DeviceControllerBox(), Endstation Display Base Layer (SVG), Light Blocked Layer (Endstation Display) (+58 more)

### Community 2 - "QServer API Client Methods"
Cohesion: 0.07
Nodes (3): QServerApiClient, QServerRequestOptions, buildPath()

### Community 3 - "Ophyd Sim Core & Transport Seam"
Cohesion: 0.06
Nodes (33): Transport Seam Design Rationale, SimulatedBeamline(), createOphydSim(), DependencyGraph, Scheduler, PVEntry, SimState, CreateOphydSimOptions (+25 more)

### Community 4 - "QServer Sim Queue Operations"
Cohesion: 0.08
Nodes (13): QueueItemAddress, ReControlResponse, clone(), describeAddress(), insertItem(), ok(), QServerSimulator, refuse() (+5 more)

### Community 5 - "Ophyd Device Socket Types"
Cohesion: 0.06
Nodes (45): ActionRequest, ActionRequestRefresh, ActionRequestSet, ActionRequestSubscribe, ActionRequestUnsubscribe, ErrorResponse, MessageResponse, MetaUpdateResponse (+37 more)

### Community 6 - "Storybook Sample Pages & Header"
Cohesion: 0.05
Nodes (44): @storybook/react, icons, Header(), HeaderProps, InputSliderRange(), InputSliderRangeProps, Main(), MainProps (+36 more)

### Community 7 - "QServer Plans & Devices Types"
Cohesion: 0.07
Nodes (51): Component, Device, Parameter, Plan, createUuidUidFactory(), SimUidFactory, SimUidPrefix, component() (+43 more)

### Community 8 - "UI Component Library & Controllers"
Cohesion: 0.07
Nodes (46): lucide-react, @radix-ui/react-dropdown-menu, @radix-ui/react-popover, @radix-ui/react-select, ControllerAbsoluteMove(), ControllerAbsoluteMoveProps, ControllerRelativeMove(), ControllerRelativeMoveProps (+38 more)

### Community 9 - "Energy vs Current Plot & Shutter Sim"
Cohesion: 0.08
Nodes (46): EnergyVsCurrentPlotPV(), EnergyVsCurrentPlotPVProps, Pair, shutter(), SHUTTER_CLOSED_VALUE, SHUTTER_OPEN_VALUE, ShutterOptions, braggAngle() (+38 more)

### Community 10 - "ReactEDM Device Rendering"
Cohesion: 0.09
Nodes (41): useMock(), useVariant(), DeviceRender(), DeviceRenderProps, useMockOphydSocket(), StyleRender(), StyleRenderProps, Entry (+33 more)

### Community 11 - "QServer Console/History/Lock Types"
Cohesion: 0.06
Nodes (29): ConsoleOutputMessage, HistoryItem, Result, LockInfo, QueueItem, RunsActiveListItem, GetStatusResponse, TaskState (+21 more)

### Community 12 - "QServer Client Error Handling & Testing"
Cohesion: 0.08
Nodes (28): @testing-library/user-event, toQServerApiError(), extractValidationErrors(), QServerApiError, QServerGetBodyUnsupportedError, QServerHttpMethod, ValidationError, QServerApiProvider() (+20 more)

### Community 13 - "Tiled Array Hooks & Search Encoding"
Cohesion: 0.09
Nodes (42): encodeSearchConfig(), encodeSearchFilters(), encodeValue(), TiledSearchKeyArgs, TiledArrayAnyEndpointOptions, TiledArrayAnyOptions, TiledArrayBufferEndpointOptions, TiledArrayBufferOptions (+34 more)

### Community 14 - "Package Dev Dependencies"
Cohesion: 0.04
Nodes (45): devDependencies, autoprefixer, axios, @chromatic-com/storybook, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-hooks (+37 more)

### Community 15 - "QServer Admin Endpoint Registry"
Cohesion: 0.12
Nodes (27): getEndpointById(), getEndpointsByGroup(), adminEndpointDescriptors, consoleEndpointDescriptors, environmentEndpointDescriptors, functionsScriptsEndpointDescriptors, QServerFunctionsScriptsEndpoints, historyEndpointDescriptors (+19 more)

### Community 16 - "Package Metadata"
Cohesion: 0.05
Nodes (41): author, files, homepage, license, main, module, name, private (+33 more)

### Community 17 - "QServer Client Fallback Strategies"
Cohesion: 0.10
Nodes (14): getConsoleOutputUpdateViaPoll(), getLockInfoViaStatus(), warnGetBodyOnce(), describeAlternative(), QServerHistoryEndpoints, QServerPlansDevicesEndpoints, QServerStatusEndpoints, GetWithBodyOptions (+6 more)

### Community 18 - "Ophyd Sim Providers & Camera Socket"
Cohesion: 0.08
Nodes (35): createOphydSim factory, OphydSimProvider, OphydTransportProvider, Camera socket seam / CameraCanvas, bitmapCache, createSimDetectorCameraSocketFactory(), loadImageBitmap(), renderDetectorFrame() (+27 more)

### Community 19 - "QServer Admin & Auth Mutation Hooks"
Cohesion: 0.11
Nodes (38): useQueueInterruptKernelMutation(), useQueueStopManagerMutation(), useQueueTestKillManagerMutation(), useQueueCreateApiKeyForPrincipalMutation(), useQueueCreateApiKeyMutation(), useQueueLogoutMutation(), useQueueRefreshSessionMutation(), useQueueRevokeApiKeyMutation() (+30 more)

### Community 20 - "Tiled Temp Types"
Cohesion: 0.05
Nodes (31): ArrayStructure, AwkwardForm, AwkwardStructure, Breadcrumb, ContainerStructure, PathItem, Paths, pathsSample (+23 more)

### Community 21 - "Ophyd Socket Paths"
Cohesion: 0.08
Nodes (31): ophydSocketCameraPath, ophydSocketDevicePath, ophydSocketPVPath, ophydSocketTIFFPath, FailedQueueItem, MetadataKwarg, isFinchMissingArgumentError(), FinchHttpRequestOptions (+23 more)

### Community 22 - "QServer Auth Endpoints"
Cohesion: 0.09
Nodes (25): authEndpointDescriptors, QServerAuthEndpoints, CurrentApiKeyInfoResponse, LogoutResponse, NewApiKeyResponse, PrincipalListResponse, PrincipalResponse, ScopesResponse (+17 more)

### Community 23 - "QServer Sim Fixtures & Config"
Cohesion: 0.14
Nodes (23): createQServerSim(), CreateQServerSimOptions, QServerSimUids, defaultHistory, failedHistoryItem, defaultQueue, BASE_SCENARIO_OPTIONS, defaultQServer() (+15 more)

### Community 24 - "Storybook All-Components Page & Ophyd Sim Types"
Cohesion: 0.09
Nodes (22): AllComponentsPage(), OphydSim, useSimSet(), useSimSignal(), OphydSimContext, useOphydSim(), useOphydSimOptional(), OphydSimProvider() (+14 more)

### Community 25 - "BeamVis EPICS Context"
Cohesion: 0.07
Nodes (24): react, EpicsContextType, EpicsContext, MockContext, MockContextType, MockProvider(), VariantContext, VariantContextType (+16 more)

### Community 26 - "Hexapod Component"
Cohesion: 0.11
Nodes (27): Hexapod(), HexapodProps, defaultMovePositionForm, HexapodController(), HexapodControllerProps, MoveMode, HexapodHeader(), HexapodHeaderProps (+19 more)

### Community 27 - "QServer Environment Hooks & Icons"
Cohesion: 0.12
Nodes (27): dayjs, useQueueOpenEnvironmentMutation(), ArbitraryKwargs, RunningQueueItem, customIcons, ContainerQServer(), ContainerQServerProps, useQueueServer() (+19 more)

### Community 28 - "QServer Default Client & Interceptors"
Cohesion: 0.12
Nodes (31): addRequestInterceptor(), addResponseInterceptor(), clearGlobalAuth(), clearInterceptors(), configureQServerClient(), ejectInterceptor(), getGlobalApiKey(), getGlobalAxiosClient() (+23 more)

### Community 29 - "QServer Auth Hooks"
Cohesion: 0.11
Nodes (32): useQueueTestServerSleepQuery(), QueueCreateApiKeyForPrincipalVariables, QueueRevokeApiKeyVariables, QueueRevokeSessionVariables, useQueueGetCurrentApiKeyInfoQuery(), useQueueGetPrincipalQuery(), useQueueGetScopesQuery(), useQueueListPrincipalsQuery() (+24 more)

### Community 30 - "Testing Tests"
Cohesion: 0.13
Nodes (21): react-router, FinchAppLayout(), FinchAppLayoutProps, FinchMainContent(), FinchMainContentProps, FinchSidebar(), FinchSidebarProps, useActiveRoute() (+13 more)

### Community 31 - "Qserver"
Cohesion: 0.13
Nodes (27): createQServerApiClient(), getReadOnlyEndpoints(), QSERVER_ENDPOINT_GROUPS, QSERVER_GROUP_LABELS, isQServerApiError(), QServerEndpointGroup, QServerEndpointInvocation, ConnectionBar() (+19 more)

### Community 32 - "Qserver Hooks"
Cohesion: 0.09
Nodes (24): axios, invalidateAllQServerQueries(), invalidateQServerRoots(), QSERVER_INVALIDATION_BUNDLES, QServerMutationHookName, resolveInvalidationRoots(), useQServerInvalidate(), QSERVER_QUERY_ROOT (+16 more)

### Community 33 - "Qserver"
Cohesion: 0.11
Nodes (19): buildAuthMessage(), createQServerSocket(), DEFAULT_RECONNECT, describeError(), withQueryAuth(), QSERVER_SOCKET_PATHS, QSERVER_WS_AUTH_TIMEOUT_MS, QSERVER_WS_CLOSE_AUTH_REQUIRED (+11 more)

### Community 34 - "Qserver Sim"
Cohesion: 0.12
Nodes (25): One Dispatcher, Two Client Seams Rationale, Console Output WS Sample Transcript, RunListOption, describe(), handleRequest(), normalizePath(), notImplemented(), checkAuth() (+17 more)

### Community 35 - "Tiled"
Cohesion: 0.13
Nodes (24): @blueskyproject/tiled, isTiledEndpointUnavailableError(), TiledEndpointUnavailableError, TILED_INVALIDATION_BUNDLES, TiledQueryScope, completeClientSurface(), TiledClientResolution, TILED_CLIENT_LIKE_METHODS (+16 more)

### Community 36 - "Shared"
Cohesion: 0.08
Nodes (32): Bluesky Web, BrowserRouter, createQServerSimAdapter, createQServerSimClient, FinchConfigProvider, Ophyd API (ophyd-websocket), QServerApiProvider, QServerSimProvider (+24 more)

### Community 37 - "Tiled Hooks"
Cohesion: 0.22
Nodes (26): stripUndefined(), useTiledArrayAsBufferQuery(), useTiledArrayAsJSONQuery(), useTiledArrayAsPngQuery(), useTiledArrayAsQuery(), useTiledServerInfoQuery(), arrayKeyParts(), tableKeyParts() (+18 more)

### Community 38 - "Qserver Hooks"
Cohesion: 0.30
Nodes (14): @tanstack/react-query, QServerMutationEngineArgs, QServerQueryEngineArgs, QSERVER_MUTATION_INVALIDATIONS, QServerInvalidationBundleName, QServerQueryKeyFor, qServerQueryKeys, QServerHookError (+6 more)

### Community 39 - "Qserver"
Cohesion: 0.18
Nodes (23): channelOptions(), createQServerConsoleSocket(), createQServerInfoSocket(), createQServerStatusSocket(), QServerChannelSocketOptions, isFrame(), isQServerConsoleFrame(), isQServerInfoFrame() (+15 more)

### Community 40 - "Src Components"
Cohesion: 0.14
Nodes (18): BeamEnergyAbout(), BeamEnergyAboutProps, BeamEnergyController(), BeamEnergyControllerProps, MoveMode, moveModeList, BeamEnergyCurrentValue(), BeamEnergyCurrentValueProps (+10 more)

### Community 41 - "Qserver"
Cohesion: 0.11
Nodes (21): react-tooltip, DictionaryInput(), DictionaryInputProps, InputDict, inputDictDefault, InputField, MultiSelectInput(), MultiSelectInputProps (+13 more)

### Community 42 - "Src Components"
Cohesion: 0.17
Nodes (19): useTabLS(), ReactEDMContent(), ReactEDMContentProps, TabManagementContext, TabManagementContextType, TabManagementProvider(), TabsContext, useTabsContext() (+11 more)

### Community 43 - "Beamvis"
Cohesion: 0.08
Nodes (11): EffectComposer, FBXLoader, FullScreenQuad, Pass, RenderPass, three/examples/jsm/loaders/FBXLoader, three/examples/jsm/postprocessing/EffectComposer, three/examples/jsm/postprocessing/Pass (+3 more)

### Community 44 - "Ophyd"
Cohesion: 0.16
Nodes (19): CameraSocketFactoryContext, DeviceTransportContext, PVTransportContext, useCameraSocketFactory(), useOphydDeviceTransport(), useOphydPVTransport(), OphydTransportProvider(), OphydTransportProviderProps (+11 more)

### Community 45 - "Qserver"
Cohesion: 0.14
Nodes (20): QSERVER_CLIENT_LIKE_METHODS, QServerClientLike, QServerApiContext, QServerApiProviderProps, QServerSocketFactory, QServerSocketFactoryContext, useQServerApiClient(), useQServerApiClientOptional() (+12 more)

### Community 46 - "Tiled"
Cohesion: 0.14
Nodes (15): useTiledWriterDetImageHeatmap(), UseTiledWriterDetImageHeatmapOptions, useTiledWriterScatterPlot(), UseTiledWriterScatterPlotOptions, UseTiledWriterScatterPlotReturn, TiledScatterPlot(), TiledScatterPlotProps, TiledWriterDetImageHeatmap() (+7 more)

### Community 47 - "Src Components"
Cohesion: 0.14
Nodes (19): CameraContainer(), CameraContainerProps, CameraControlPanel(), CameraControlPanelProps, sizeMap, useCameraContainer(), UseCameraContainerProps, TIFFContainer() (+11 more)

### Community 48 - "Tsconfig"
Cohesion: 0.08
Nodes (25): compilerOptions, allowJs, allowSyntheticDefaultImports, baseUrl, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames (+17 more)

### Community 49 - "Src Components"
Cohesion: 0.15
Nodes (17): CameraCustomSetup(), CameraSettings(), CameraSettingsProps, InputEnum(), InputEnumProps, InputField(), InputFieldProps, InputFloat() (+9 more)

### Community 50 - "Qserver"
Cohesion: 0.12
Nodes (24): qserver-sim Deliberate Omissions, src/api/qServer_archive (retired hand-rolled client), qServer facade.ts, qServer fallbacks.ts, qServer Generated Types README, Queue Server API Client README, Payload-GET Browser Limitation, Queue Server Websocket Auth Modes (+16 more)

### Community 51 - "Stories"
Cohesion: 0.11
Nodes (18): @storybook/test, ButtonCopyToClipboard(), ButtonCopyToClipboardProps, InputSlider(), InputSliderProps, CustomColors, meta, Primary (+10 more)

### Community 52 - "Beamvis"
Cohesion: 0.10
Nodes (17): BeamlineDefinition, beamlineDefinitions, bl531Definition, bl733Definition, bl832Definition, exampleDefinition, bl531ControlLayout, bl531Definition (+9 more)

### Community 53 - "Src Components"
Cohesion: 0.15
Nodes (14): generateDemoBase(), Histogram(), HistogramProps, HistogramDeviceController(), HistogramDeviceControllerProps, HistogramPlot(), HistorgramPlotProps, HistogramPlotSettings() (+6 more)

### Community 54 - "Qserver Sim Core"
Cohesion: 0.15
Nodes (19): environmentOpenBeginSequence(), environmentOpenFinishSequence(), formatClockTime(), formatConsolePrefix(), formatConsoleTimestamp(), formatItemDict(), LEGACY_CONSOLE_PREFIXES, planEndSequence() (+11 more)

### Community 55 - "Tsconfig Compileroptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+14 more)

### Community 56 - "Stories"
Cohesion: 0.11
Nodes (15): react-plotly.js, PlotlyHeatmap(), PlotlyHeatmapProps, PlotlyHeatmapProps, PlotlyHeatmapTiled(), Default, eggData, Electric (+7 more)

### Community 57 - "Testing Tests"
Cohesion: 0.12
Nodes (13): @testing-library/react, vitest, DeviceControllerBoxSimple(), FinchHeader(), FinchHeaderProps, defaultProps, mockDevice, defaultProps (+5 more)

### Community 58 - "Qserver Client"
Cohesion: 0.13
Nodes (10): eject(), Installer, InterceptorRegistry, RegistryEntry, InterceptorHandle, QServerErrorInterceptor, QServerRequestInterceptor, QServerResponseInterceptor (+2 more)

### Community 59 - "Src Components"
Cohesion: 0.20
Nodes (16): @phosphor-icons/react, ExperimentAngleScan(), ExperimentAngleScanProps, ExperimentEnergyScan(), ExperimentEnergyScanProps, ExperimentHistoryProps, ExperimentXASAlignment(), ExperimentXASAlignmentProps (+8 more)

### Community 60 - "Qserver Client"
Cohesion: 0.12
Nodes (17): BODY_REQUIRED_GET_ENDPOINT_IDS, canSendGetBody(), hasPayload(), isBodyRequired(), NO_BROWSER_PATH_ENDPOINT_IDS, PAYLOAD_GET_ENDPOINT_IDS, PayloadGetEndpointId, resetGetBodyWarnings() (+9 more)

### Community 61 - "Tiled Hooks"
Cohesion: 0.19
Nodes (16): TiledLoginVariables, useTiledLoginMutation(), TiledMutationEngineArgs, useTiledMutation(), TiledQueryEngineArgs, invalidateAllTiledQueries(), invalidateTiledRoots(), resolveInvalidationRoots() (+8 more)

### Community 62 - "Stories"
Cohesion: 0.14
Nodes (16): useOptionalFinchConfig(), useTiledMostRecentDetImage(), UseTiledMostRecentDetImageOptions, UseTiledMostRecentDetImageReturn, TiledWrapper(), ButtonMode, CustomUrl, LocalHostUrl (+8 more)

### Community 63 - "Src Components"
Cohesion: 0.19
Nodes (14): controllerIcons, tailwindIcons, Button(), ButtonProps, buttonVariants, getButtonClasses(), paddingSizes, textSizes (+6 more)

### Community 64 - "Beamvis"
Cohesion: 0.19
Nodes (14): createCylindricalStage(), createTiltStage(), createXYZStage(), createStage(), BaseConfig, beamColorMap, BeamConfig, BeamStopConfig (+6 more)

### Community 65 - "Stories"
Cohesion: 0.10
Nodes (18): buttonVariants, ButtonWithIcon(), ButtonWithIconProps, getButtonClasses(), iconSizes, paddingSizes, spacingSizes, textSizes (+10 more)

### Community 66 - "Beamvis"
Cohesion: 0.22
Nodes (12): three, createBeam(), buildBeamStop(), createBeamStop(), createDetector(), createMotor(), createSample(), createSlit factory (+4 more)

### Community 67 - "Src Components"
Cohesion: 0.18
Nodes (12): useOphydSocket(), beamlineIcons, BeamEnergy(), BeamEnergyIconWithValueProps, useBeamEnergyPV(), UseBeamEnergyPVProps, computeEnergyFromMonoAngle(), energy (+4 more)

### Community 68 - "Src Components"
Cohesion: 0.20
Nodes (13): useQueueGetPlansAllowedQuery(), useQueueExecuteItemMutation(), PostItemAddResponse, ExperimentExecutePlanButton(), ExperimentExecutePlanButtonProps, ExperimentExecutePlanButtonGeneric(), ExperimentExecutePlanButtonGenericProps, ExperimentPlanSettings() (+5 more)

### Community 69 - "Tiled"
Cohesion: 0.17
Nodes (16): AnyFinchHttpRequestOptions, AssertTrue, combineAbortSignals(), ConformsToFinchHttpRequestOptions, ConformsToFinchRequestOptions, mergeRequestOptions(), useTiledArrayImagePath(), clientScope() (+8 more)

### Community 70 - "Tiled Hooks"
Cohesion: 0.16
Nodes (18): SearchQueryOptions, useSearch(), useTiledSearchByFullTextQuery(), useTiledSearchByMetadataComparisonQuery(), useTiledSearchByMetadataEqualsQuery(), useTiledSearchByRegexQuery(), useTiledSearchBySpecsQuery(), useTiledSearchByStructureFamilyQuery() (+10 more)

### Community 71 - "Stories"
Cohesion: 0.11
Nodes (12): Paper(), PaperProps, CustomClasses, CustomTitle, Default, ExplorerTabProps, meta, routes (+4 more)

### Community 72 - "Qserver"
Cohesion: 0.14
Nodes (16): QItem(), QItemProps, QItemPopup(), QSRunEngineWorker(), QSRunEngineWorkerProps, ToggleSlider(), ToggleSliderProps, ParameterInput (+8 more)

### Community 73 - "Features"
Cohesion: 0.23
Nodes (13): ComponentViewer(), ComponentViewerProps, ComponentViewerExampleReal(), ComponentViewerCollection, ComponentViewerItemRow, TestItem, TestItemCollection, createTestResultsJSON() (+5 more)

### Community 74 - "Github Workflows Publish"
Cohesion: 0.16
Nodes (18): Bluesky Queue Server (related project), NPM Publish Pipeline Rationale, Ophyd WebSocket (related project), Storybook GH Pages Deploy Rationale, Tiled (related project), Publish NPM Package Workflow, Publish Storybook Workflow, Run Tests Workflow (+10 more)

### Community 75 - "Shared"
Cohesion: 0.18
Nodes (19): ADLParser (ADL file parser), BobParser (BOB file parser), CompositeDeviceRenderer component, DeviceRender component, Entry data structure / UIEntry interface, ReactEDM component, StyleRender component, ReactEDM/styles.json variants config (+11 more)

### Community 76 - "Qserver Client"
Cohesion: 0.21
Nodes (19): getDefaultQServerClient(), clearHistory(), createApiKey(), createApiKeyForPrincipal(), getConsoleOutput(), getConsoleOutputUID(), getLockInfo(), getRunsActive() (+11 more)

### Community 77 - "Qserver Hooks"
Cohesion: 0.22
Nodes (15): useQueueGetHistoryQuery(), useQueueAddItemMutation(), useQueueGetItemQuery(), useQueueGetQuery(), useQueueStartMutation(), useQueueGetStatusQuery(), _GetWithBodyOptionsConform, _QServerOptionsConform (+7 more)

### Community 78 - "Ophyd Sim Camera"
Cohesion: 0.16
Nodes (7): CameraFramePayload, createSimCameraSocketFactory(), SimCameraSocket, SimCameraSocketOptions, CameraSocketLike, CameraSocketMessageEvent, makeSocket()

### Community 79 - "Components"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 80 - "Package"
Cohesion: 0.11
Nodes (18): dependencies, @blueskyproject/tiled, class-variance-authority, clsx, d3-shape, dayjs, lucide-react, @phosphor-icons/react (+10 more)

### Community 81 - "Qserver"
Cohesion: 0.11
Nodes (17): GetRunsActiveResponse, mockAddItemFailResponse, mockAddItemSuccessArgsResponse, mockAddItemSuccessResponse, mockDeleteQueueItemResponse, mockEnvironmentOpenResponse, mockExecuteItemResponse, mockGetApiStatusResponse (+9 more)

### Community 82 - "Beamvis"
Cohesion: 0.18
Nodes (11): App(), EpicsApi, EpicsContext, useEpics(), usePV(), OphydProvider(), PVWSProvider(), BACKEND (+3 more)

### Community 83 - "Qserver"
Cohesion: 0.15
Nodes (12): Checkbox(), CheckboxProps, SettingsAudioAlert(), SettingsAuthentication(), SettingsContainer(), SettingsContainerProps, InputDict, inputDictDefault (+4 more)

### Community 84 - "Qserver Client"
Cohesion: 0.24
Nodes (16): abortRE(), closeEnvironment(), getPermissions(), getQueue(), getRoot(), getStatus(), getTaskResult(), getTaskStatus() (+8 more)

### Community 85 - "Stories"
Cohesion: 0.14
Nodes (12): ButtonIconOnly(), ButtonIconOnlyProps, buttonVariants, getButtonClasses(), Active, ActiveSecondary, CustomColors, Disabled (+4 more)

### Community 86 - "Qserver"
Cohesion: 0.15
Nodes (13): AddQueueItemButton(), AddQueueItemButtonProps, QSAddItem(), QsAddItemProps, ConsoleMessage, formatConsoleFrame(), QSConsole(), QSConsoleProps (+5 more)

### Community 87 - "Beamvis"
Cohesion: 0.15
Nodes (14): Transition to Component-Centric 3D View, Decouple Control Handlers from PVs, Refactor: Dynamic Control Panels, Dynamic Synoptic Statuses, BeamVis About.tsx (entry point), BeamlineContainer.tsx (3D scene controller), ControlLayout, ControlModules() (+6 more)

### Community 88 - "Beamvis"
Cohesion: 0.20
Nodes (13): d3-shape, Legend(), Edge, edges, Node, nodes, Point, statusColor (+5 more)

### Community 89 - "Finchapplayout"
Cohesion: 0.31
Nodes (13): buildPageRoutes(), findCollision(), Page, PageRenderer, toChildUrl(), toPages(), toRoutePath(), toTabChildPath() (+5 more)

### Community 90 - "Package"
Cohesion: 0.13
Nodes (15): scripts, build, build-storybook, deploy-storybook, dev, format, format:fix, lint (+7 more)

### Community 91 - "Stories"
Cohesion: 0.19
Nodes (11): makeDevice(), useSimOphydPVSocket(), BeamEnergyPV(), SignalMonitorPlotDevice(), ComponentViewerExampleSim(), SIM_DEVICES, DEMO_DEVICES, OphydHooksDemo() (+3 more)

### Community 92 - "Features"
Cohesion: 0.18
Nodes (9): useTiledSearchQuery(), itemLabel(), TiledLinePlotMaker(), TiledLinePlotMakerProps, meta, Primary, queryClient, Story (+1 more)

### Community 93 - "Src App Pages"
Cohesion: 0.19
Nodes (9): queryClient, AboutFinchPage(), Documentation(), TestPage(), finchIcons, doc, GoogleDoc(), GoogleDocProps (+1 more)

### Community 94 - "Src Components"
Cohesion: 0.19
Nodes (12): phosphorIcons, CameraCanvasFeatures(), CameraCanvasFeaturesProps, Point, RelativePoint, RelativeStroke, Stroke, useCameraDraw() (+4 more)

### Community 95 - "Src Components"
Cohesion: 0.19
Nodes (9): DeviceLike, SignalMonitorPlotDeviceProps, SignalMonitorPlotPV(), SignalMonitorPlotPVProps, Default, meta, Story, PlotlyScatterData (+1 more)

### Community 96 - "Src Components"
Cohesion: 0.26
Nodes (8): initialDevices(), useOphydDeviceSocket(), useBeamEnergyOphyd(), UseBeamEnergyOphydProps, SignalMonitorPlotOphyd(), SignalMonitorPlotOphydProps, ScatterMock, OphydDevices

### Community 97 - "Qserver Client"
Cohesion: 0.18
Nodes (5): QServerClientConfig, ApiKeyLocation, ApiKeyScheme, GetBodyStrategy, QServerAuthErrorCallback

### Community 98 - "Qserver Endpoints"
Cohesion: 0.23
Nodes (3): QServerRunEngineEndpoints, GetRunsResponse, ReResumeBody

### Community 99 - "Stories"
Cohesion: 0.17
Nodes (11): BeamEnergyOphyd(), createMockDeviceTransport(), withDeviceTransport(), Default, deviceTransport, meta, Story, Default (+3 more)

### Community 100 - "Stories"
Cohesion: 0.18
Nodes (10): PlotlyScatter, PlotlyScatterProps, sampleData, titleFont, Default, meta, NoTitles, sampleData (+2 more)

### Community 101 - "Src Components"
Cohesion: 0.30
Nodes (11): ExperimentFormGeneric(), ExperimentFormGenericProps, firstLine(), hasEveryRequiredValue(), hasValue(), initializeParameters(), initialValueFor(), isDeviceCollection() (+3 more)

### Community 103 - "Stories"
Cohesion: 0.30
Nodes (12): Finch Architecture Diagram, Bluesky Backend, Finch UI, HTTP Requests Channel, Ophyd Socket, Q Server, React, shadcn/ui (+4 more)

### Community 104 - "Concept"
Cohesion: 0.33
Nodes (11): Hexapod 6-DOF Motion, Rx (Rotation about X), Ry (Rotation about Y), Rz (Rotation about Z), Tx (Translation along X), Ty (Translation along Y), Tz (Translation along Z), Hexapod Base Platform (+3 more)

### Community 105 - "Qserver Hooks"
Cohesion: 0.35
Nodes (8): isQServerEndpointUnavailableError(), QServerEndpointUnavailableError, QServerQueryScope, completeEndpointSurface(), injectedScope(), QServerClientResolution, useQServerClient(), QServerEndpoints

### Community 106 - "Stories"
Cohesion: 0.18
Nodes (10): Active, ActiveSecondary, CustomColors, Disabled, Large, meta, Primary, Secondary (+2 more)

### Community 107 - "Stories Reactedm"
Cohesion: 0.20
Nodes (9): ReactEDM(), ReactEDMProps, Bob, Default, Legacy, meta, Paper, Slate (+1 more)

### Community 108 - "Src Components"
Cohesion: 0.44
Nodes (9): ExperimentHistory(), ExperimentXASScan(), ExperimentXASScanProps, getLocalStorageEnergyStart(), getLocalStorageEnergyStop(), getLocalStorageNumber(), getLocalStorageNumPoints(), getLocalStorageRoiHigh() (+1 more)

### Community 109 - "Src Components"
Cohesion: 0.31
Nodes (7): axisOptions(), Experiment(), ExperimentProps, FALLBACK_AXIS_COLUMNS, useTiledRunTableColumns(), UseTiledRunTableColumnsOptions, UseTiledRunTableColumnsReturn

### Community 110 - "Ref"
Cohesion: 0.25
Nodes (7): eslint-config-prettier, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, eslint-plugin-storybook, globals, typescript-eslint

### Community 111 - "Qserver Types"
Cohesion: 0.46
Nodes (4): QServerTasksEndpoints, GetTaskResultResponse, GetTaskStatusResponse, TaskBody

### Community 112 - "Qserver"
Cohesion: 0.32
Nodes (6): QServerSocketChannel, JsonResultViewer(), JsonResultViewerProps, CHANNEL_LABELS, SocketPaneProps, STATUS_COLORS

### Community 114 - "Tsconfig Node Compileroptions"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, resolveJsonModule, include

### Community 117 - "Finchapplayout"
Cohesion: 0.38
Nodes (4): FinchPageTabs(), FinchPageTabsProps, mockTabs, RouteTab

### Community 118 - "Src Components"
Cohesion: 0.40
Nodes (5): class-variance-authority, @radix-ui/react-slot, Button, ButtonProps, buttonVariants

### Community 120 - "Qserver Endpoints"
Cohesion: 0.40
Nodes (3): QServerLockEndpoints, LockResponse, UnlockBody

### Community 121 - "Qserver Generated"
Cohesion: 0.33
Nodes (5): components, $defs, operations, paths, webhooks

### Community 122 - "Src Components"
Cohesion: 0.53
Nodes (3): IFrame(), IFrameProps, useResizeObserver()

### Community 123 - "Reactedm"
Cohesion: 0.40
Nodes (4): MockMessageData, MockMessageWrapper, MockUpdate, deviceMessages

### Community 124 - "Stories"
Cohesion: 0.73
Nodes (6): Finch Communication Diagram, Bluesky Backend Services (cloud), Finch (Frontend App), Ophyd WebSocket, Q Server, Tiled

### Community 126 - "Src Components"
Cohesion: 0.50
Nodes (3): InputEnumBoxRounded(), InputEnumBoxRoundedProps, defaultProps

### Community 127 - "Qserver"
Cohesion: 0.40
Nodes (4): listScanSample, moveThenCountSample, planSettings, scanSample

### Community 128 - "Reactedm"
Cohesion: 0.60
Nodes (4): CustomFormatObject, parseCustomFormat(), parseObject(), removeQuotes()

### Community 129 - "Stories"
Cohesion: 0.40
Nodes (5): Finch Compatibility Diagram, Blue Circular Wand Icon, Blue Diamond Logo Icon, Teal Gradient Lightning Bolt Icon, Material UI (MUI) Logo Icon

### Community 130 - "Concept"
Cohesion: 0.67
Nodes (4): Figma Design Tool, Histogram Range Slider Widget, Storybook Connect Figma Plugin, Figma Plugin Screenshot (Storybook Connect)

### Community 131 - "Package"
Cohesion: 0.50
Nodes (4): peerDependencies, react, react-dom, react-router

### Community 132 - "Ref"
Cohesion: 0.50
Nodes (3): @storybook/addons, @storybook/theming, customTheme

### Community 134 - "Reactedm"
Cohesion: 0.67
Nodes (3): adlFiles, formatAdlContent(), modules

### Community 135 - "Reactedm"
Cohesion: 0.67
Nodes (3): bobFiles, formatbobContent(), modules

### Community 137 - "Concept"
Cohesion: 1.00
Nodes (3): Area Detector Scattering/Diffraction Pattern, Pixel Detector Module Gaps (grid lines), Detector 1M Frame Image (det_1m_1.png)

### Community 138 - "Package"
Cohesion: 0.67
Nodes (3): exports, ./dist/finch.css, ./style.css

### Community 139 - "Package"
Cohesion: 0.67
Nodes (3): repository, type, url

### Community 142 - "Stories"
Cohesion: 0.67
Nodes (3): Assets Illustration, Image Asset, Text/Font Asset

## Ambiguous Edges - Review These
- `QServerRegistry.test.tsx` → `QServerNewRegistry.test.tsx`  [AMBIGUOUS]
  .github/workflows/test.yml · relation: semantically_similar_to

## Knowledge Gaps
- **873 isolated node(s):** `config`, `customTheme`, `preview`, `$schema`, `style` (+868 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1073 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **84 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `QServerRegistry.test.tsx` and `QServerNewRegistry.test.tsx`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `react` connect `BeamVis EPICS Context` to `Ophyd PV Socket & Endstation Display`, `Ophyd Device Socket Types`, `Storybook Sample Pages & Header`, `QServer Plans & Devices Types`, `UI Component Library & Controllers`, `Energy vs Current Plot & Shutter Sim`, `ReactEDM Device Rendering`, `QServer Client Error Handling & Testing`, `Tiled Array Hooks & Search Encoding`, `Package Metadata`, `Ophyd Sim Providers & Camera Socket`, `Ophyd Socket Paths`, `Storybook All-Components Page & Ophyd Sim Types`, `Hexapod Component`, `QServer Environment Hooks & Icons`, `Testing Tests`, `Qserver`, `Qserver Hooks`, `Qserver`, `Tiled`, `Qserver`, `Src Components`, `Qserver`, `Src Components`, `Ophyd`, `Qserver`, `Tiled`, `Src Components`, `Src Components`, `Stories`, `Beamvis`, `Src Components`, `Stories`, `Qserver Client`, `Src Components`, `Tiled Hooks`, `Stories`, `Src Components`, `Stories`, `Beamvis`, `Src Components`, `Src Components`, `Tiled`, `Features`, `Qserver Hooks`, `Beamvis`, `Qserver`, `Stories`, `Qserver`, `Beamvis`, `Beamvis`, `Stories`, `Features`, `Src App Pages`, `Src Components`, `Src Components`, `Src Components`, `Stories`, `Src Components`, `Qserver Hooks`, `Src Components`, `Src Components`, `Qserver`, `Src Components`, `Src Components`, `Reactedm`, `Src Components`?**
  _High betweenness centrality (0.260) - this node is a cross-community bridge._
- **Why does `QServerApiClient` connect `QServer API Client Methods` to `QServer Client Fallbacks & Auth`, `Qserver Client`, `Qserver Sim`, `Qserver Hooks`, `Qserver Hooks`, `Qserver Client`, `Qserver Client`, `QServer Admin Endpoint Registry`, `QServer Client Fallback Strategies`, `Qserver`, `Qserver Client`, `Qserver Endpoints Adminendpoints`, `Ophyd Socket Paths`, `Qserver Client`, `QServer Default Client & Interceptors`, `Qserver`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `vitest` connect `Testing Tests` to `Ophyd PV Socket & Endstation Display`, `Ophyd Sim Core & Transport Seam`, `Ophyd Device Socket Types`, `Storybook Sample Pages & Header`, `Src Components`, `UI Component Library & Controllers`, `Energy vs Current Plot & Shutter Sim`, `QServer Client Error Handling & Testing`, `Package Metadata`, `Ophyd Sim Providers & Camera Socket`, `Ophyd Socket Paths`, `QServer Sim Fixtures & Config`, `Hexapod Component`, `QServer Environment Hooks & Icons`, `Testing Tests`, `Qserver Hooks`, `Qserver`, `Qserver Sim`, `Tiled`, `Qserver`, `Src Components`, `Tiled`, `Src Components`, `Stories`, `Src Components`, `Stories`, `Qserver Client`, `Src Components`, `Src Components`, `Stories`, `Features`, `Qserver Hooks`, `Ophyd Sim Camera`, `Stories`, `Finchapplayout`, `Features`, `Src App Pages`, `Src Components`, `Stories`, `Finchapplayout`, `Src Components`, `Src Components`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `config`, `customTheme`, `preview` to the rest of the system?**
  _873 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `QServer Client Fallbacks & Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.05934065934065934 - nodes in this community are weakly interconnected._
- **Should `Ophyd PV Socket & Endstation Display` be split into smaller, more focused modules?**
  _Cohesion score 0.04089635854341737 - nodes in this community are weakly interconnected._
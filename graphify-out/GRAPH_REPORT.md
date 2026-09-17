# Graph Report - finch  (2026-09-15)

## Corpus Check
- 644 files · ~415,519 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3546 nodes · 9676 edges · 198 communities (123 shown, 65 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 144 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d4988922`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- QServerSuccessResponse
- useOphydPVSocket
- QServerApiClient
- ophyd-sim/core/types.ts
- QServerSimulator
- deviceTypes.ts
- SamplePage1.tsx
- qserver-sim/index.ts
- cn
- beamstopBeamline.ts
- DeviceRender.tsx
- QServerSim.ts
- QServerSim
- tiled/types/common.ts
- devDependencies
- qServer/types/common.ts
- package.json
- QServerApiClient.ts
- ophyd-sim/index.ts
- qServer/hooks/index.ts
- tempTypes.ts
- ColormapPicker.stories.tsx
- generatedAliases.ts
- defaultQServer.ts
- createOphydSimTransport
- components/ReactEDM/ReactEDM.tsx
- Hexapod.test.tsx
- QueueServer.tsx
- qServer/index.ts
- SimulatedBeamline.tsx
- FinchAppLayout.tsx
- TestQserver.tsx
- FinchConfigProvider.tsx
- sockets/types.ts
- clientSeams.test.ts
- useTiledClient.ts
- QServer Sim
- tiled/hooks/index.ts
- useTiledQuery.ts
- useQServerChannelSockets.ts
- src/index.ts
- types/types.ts
- ReactEDMTabs.tsx
- three-examples.d.ts
- OphydTransportProvider.tsx
- QServerSimDemo.tsx
- requestOptions.ts
- Camera.test.tsx
- compilerOptions
- Ophyd Sim
- Finch Repository Instructions
- InputSlider.stories.ts
- ComponentConfig
- createFallbackTransport.ts
- GetStatusResponse
- compilerOptions
- ExperimentAngleScan.tsx
- deviceControllerTypes.ts
- InterceptorHandle
- ExperimentXASAlignment.tsx
- QServerClient.test.tsx
- tiled/hooks/invalidation.ts
- apiUtils.ts
- icons.tsx
- stage/index.ts
- ButtonWithIcon.stories.tsx
- factories/index.ts
- useOphydSocket
- Experiment.tsx
- ComponentConfig.ts
- tiled/hooks/typeTests.ts
- FinchAppLayout.stories.tsx
- QItem.tsx
- ComponentViewerExampleReal.tsx
- app/App.tsx
- ReactEDM Home / Overview
- facade.ts
- useQueueGetQuery
- transport/types.ts
- components.json
- dependencies
- qServerMockData.ts
- BeamVis/main.tsx
- SettingsContainer.tsx
- tests/Experiment.test.tsx
- ButtonIconOnly.stories.tsx
- QSConsole.tsx
- BeamVis README
- useHexapod.ts
- pageRoutes.tsx
- scripts
- InputSliderRange.stories.tsx
- TiledLinePlotMaker.tsx
- GoogleDoc.tsx
- CameraCanvas.tsx
- SignalMonitorPlotDevice.tsx
- ButtonWithIcon.tsx
- OphydDeviceExplorer.tsx
- HexapodController.tsx
- ophydSimDecorators.tsx
- ButtonCopyToClipboard.tsx
- SimScheduler
- SimRegistration
- Finch Architecture Diagram
- Hexapod Top (Mobile) Platform
- QServerEndpoints
- Button.stories.ts
- ReactEDM.stories.ts
- ExperimentXASScan.tsx
- ItemDetailModal.tsx
- stories/Header.tsx
- SocketPane.tsx
- epics.tsx
- compilerOptions
- bl531/config.ts
- @chromatic-com/storybook
- FinchMainContent.tsx
- CLAUDE.md
- ResizeObserver
- eslint
- schema.d.ts
- eslint-config-prettier
- eslint-plugin-react-refresh
- Finch Communication Diagram
- gh-pages
- postcss
- qServerPlanSettings.js
- react-tooltip
- Finch Compatibility Diagram
- Storybook Connect Figma Plugin
- peerDependencies
- manager.ts
- @storybook/addon-essentials
- adl/index.ts
- bob/index.ts
- Area Detector Scattering/Diffraction Pattern
- @storybook/addon-interactions
- @storybook/blocks
- @storybook/react-vite
- formData.ts
- Assets Illustration
- vite-env.d.ts
- Accessibility
- Storybook Autodocs Feature
- Finch
- Finch UI
- @storybook/test
- BeamVis Component
- Monochromator (Beamline Optic)
- Toroidal Mirror (Beamline Optic)
- Bluesky Logo
- Context (Docs Organization Concept)
- Theming
- Storybook Manager Head
- Finch Circle Icon Logo
- ALS Logo Wheel (Aperture Pinwheel Icon)
- Detector Image (det_1m_2.png) - Scattering Pattern with Streak Artifact
- Detector 1M Image 3 (Scattering Pattern)
- Detector 1M Beamstop Diagram
- Finch Banner (Small, Dark Mode)
- Vite Logo
- tailwindcss
- @testing-library/jest-dom
- @testing-library/user-event
- @types/node
- @types/react-dom
- typescript-eslint
- @vitejs/plugin-react
- ALS Logo
- React Logo
- React Logo (BeamVis assets)
- Slit Icon (Beamline Component Graphic)
- Source Icon (BeamVis)
- Running Icon 2 (QServer status)
- Running Icon Frame 3
- Running Icon Frame 4
- Running Icon Frame 5
- Running Icon Frame 6
- Accessibility Illustration (PNG)
- Addon Library Icon Grid
- Discord Icon
- Finch UI Construction Illustration
- GitHub Icon
- Share Storybook Link Screenshot
- Styling (CSS Frameworks Icon Grid)
- Testing PASS/FAIL Panel Illustration
- Tutorials Icon
- YouTube Icon

## God Nodes (most connected - your core abstractions)
1. `cn()` - 195 edges
2. `QServerApiClient` - 147 edges
3. `QServerRequestOptions` - 145 edges
4. `getDefaultQServerClient()` - 98 edges
5. `QServerSimulator` - 76 edges
6. `GetWithBodyOptions` - 57 edges
7. `useQServerMutation()` - 56 edges
8. `QServerSuccessResponse` - 51 edges
9. `useOphydPVSocket()` - 46 edges
10. `useQServerQuery()` - 44 edges

## Surprising Connections (you probably didn't know these)
- `src/main.tsx local entry point` --calls--> `App()`  [EXTRACTED]
  Repo Instructions.txt → src/app/App.tsx
- `Storybook About.mdx` --semantically_similar_to--> `Finch README`  [INFERRED] [semantically similar]
  src/stories/About.mdx → README.md
- `qServer facade.ts` --calls--> `QServerApiClient`  [EXTRACTED]
  src/api/qServer/SKILLS.md → src/api/qServer/client/QServerApiClient.ts
- `Finch Repository Instructions` --references--> `App()`  [EXTRACTED]
  Repo Instructions.txt → src/app/App.tsx
- `App()` --shares_data_with--> `FinchConfigProvider`  [EXTRACTED]
  src/app/App.tsx → Repo Instructions.txt

## Import Cycles
- 4-file cycle: `src/components/ReactEDM/DeviceRender.tsx -> src/components/ReactEDM/widgets/RelatedDisp.tsx -> src/components/ReactEDM/UIView.tsx -> src/components/ReactEDM/UICanvas.tsx -> src/components/ReactEDM/DeviceRender.tsx`

## Hyperedges (group relationships)
- **Ophyd Sim transport-seam pattern** — shared_ophydsimprovider_ophydsimprovider, shared_ophydtransportprovider_ophydtransportprovider, src_lib_ophyd_sim_transport_createophydsimtransport_createophydsimtransport, src_api_ophyd_useophydpvsocket_useophydpvsocket [EXTRACTED 0.90]
- **QServer Sim provider/client swap pattern** — shared_qserversimprovider_qserversimprovider, shared_qserverapiprovider_qserverapiprovider, shared_createqserversimclient_createqserversimclient, src_api_qserver_readme_qserverapiclient [EXTRACTED 0.90]
- **ReactEDM widget rendering pipeline** — shared_uiview_uiview, shared_uicanvas_uicanvas, shared_stylerender_stylerender, shared_devicerender_devicerender, shared_compositedevicerenderer_compositedevicerenderer [EXTRACTED 0.95]
- **Endstation Display Animated Illustration Assets** — src_components_endstationdisplay_assets_0_base, src_components_endstationdisplay_assets_1_light_blocked, src_components_endstationdisplay_assets_1_light_unblocked, src_components_endstationdisplay_assets_2_shutter_moveable, src_components_endstationdisplay_assets_3_beamstop_moveable, src_components_endstationdisplay_assets_4_light_mono_moveable, src_components_endstationdisplay_assets_5_sample_holder [INFERRED 0.75]
- **Ophyd PV Transport Seam (sim vs real IOC)** — src_lib_ophyd_sim_transport_createophydsimtransport_createophydsimtransport, src_api_ophyd_useophydpvsocket_useophydpvsocket, src_api_ophyd_useophydsocket_useophydsocket, src_components_beamvis_readme_doc [INFERRED 0.80]
- **Browser-Side Backend Simulator Pattern (ophyd-sim / qserver-sim)** — src_lib_ophyd_sim_readme_doc, src_lib_qserver_sim_readme_doc, src_lib_ophyd_sim_skills_doc, src_lib_qserver_sim_skills_doc [INFERRED 0.85]
- **Finch Backend Services (Tiled, Ophyd Socket, Q Server)** — src_stories_assets_fincharchitecture_tiled_component, src_stories_assets_fincharchitecture_ophyd_socket_component, src_stories_assets_fincharchitecture_qserver_component, src_stories_assets_fincharchitecture_bluesky_backend_component [INFERRED 0.85]
- **Retired Legacy Hook Layer Kept For Reference (qServer_archive / tiled_archive)** — src_api_qserver_skills_doc, src_api_tiled_skills_doc, src_api_qserver_archive_retiredlayer, src_api_tiled_archive_retiredlayer [INFERRED 0.85]

## Communities (198 total, 65 thin omitted)

### Community 0 - "QServerSuccessResponse"
Cohesion: 0.07
Nodes (31): QServerFunctionsScriptsEndpoints, QServerQueueEndpoints, QServerSuccessResponse, ExecuteFunctionBody, ExecuteFunctionResponse, TaskStartedResponse, UploadScriptBody, UploadScriptResponse (+23 more)

### Community 1 - "useOphydPVSocket"
Cohesion: 0.05
Nodes (54): initialDevices(), useOphydPVSocket(), deviceIcons, DeviceControllerBox(), Shutter(), ShutterProps, ShutterState, STATE_STYLES (+46 more)

### Community 2 - "QServerApiClient"
Cohesion: 0.04
Nodes (12): QServerApiClient, QServerClientConfig, QServerRunEngineEndpoints, ApiKeyLocation, ApiKeyScheme, GetBodyStrategy, QServerAuthErrorCallback, QServerRequestOptions (+4 more)

### Community 3 - "ophyd-sim/core/types.ts"
Cohesion: 0.08
Nodes (20): createOphydSim(), DependencyGraph, Scheduler, PVEntry, SimState, CreateOphydSimOptions, PVMetadata, SimEvent (+12 more)

### Community 4 - "QServerSimulator"
Cohesion: 0.08
Nodes (13): PostItemAddResponse, QueueItemAddress, ReControlResponse, clone(), describeAddress(), highestScanId(), insertItem(), ok() (+5 more)

### Community 5 - "deviceTypes.ts"
Cohesion: 0.17
Nodes (16): ActionRequest, ActionRequestRefresh, ActionRequestSet, ActionRequestSubscribe, ActionRequestUnsubscribe, ErrorResponse, MessageResponse, MetaUpdateResponse (+8 more)

### Community 6 - "SamplePage1.tsx"
Cohesion: 0.06
Nodes (34): icons, Header(), HeaderProps, Main(), MainProps, Sidebar(), SidebarProps, SidebarItem() (+26 more)

### Community 7 - "qserver-sim/index.ts"
Cohesion: 0.08
Nodes (46): Component, Device, Parameter, Plan, createCounterUidFactory(), createUuidUidFactory(), SimUidFactory, SimUidPrefix (+38 more)

### Community 8 - "cn"
Cohesion: 0.06
Nodes (46): Bento(), BentoProps, FinchHeader(), FinchHeaderProps, generateDemoBase(), Histogram(), HistogramProps, HistogramDeviceController() (+38 more)

### Community 9 - "beamstopBeamline.ts"
Cohesion: 0.10
Nodes (30): motor(), MotorOptions, braggAngle(), BraggAngleOptions, gaussian(), gaussian2d(), Gaussian2dOptions, GaussianOptions (+22 more)

### Community 10 - "DeviceRender.tsx"
Cohesion: 0.07
Nodes (52): useMock(), useVariant(), VariantContext, VariantContextType, VariantProvider(), DeviceRender(), DeviceRenderProps, StyleRender() (+44 more)

### Community 11 - "QServerSim.ts"
Cohesion: 0.06
Nodes (47): ConsoleOutputMessage, HistoryItem, Result, LockInfo, QueueItem, RunsActiveListItem, PlanQueueMode, TaskState (+39 more)

### Community 12 - "QServerSim"
Cohesion: 0.10
Nodes (24): WebSocketLike, extractValidationErrors(), QServerApiError, QServerApiProvider(), createQServerSimClient(), QServerSimClient, QServerSim, defaultQServer() (+16 more)

### Community 13 - "tiled/types/common.ts"
Cohesion: 0.10
Nodes (42): encodeSearchFilters(), encodeValue(), TiledArrayAnyEndpointOptions, TiledArrayAnyOptions, TiledArrayBufferEndpointOptions, TiledArrayBufferOptions, TiledArrayEndpointOptionsMap, TiledArrayImagePathEndpointOptions (+34 more)

### Community 14 - "devDependencies"
Cohesion: 0.04
Nodes (47): autoprefixer, axios, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-storybook, globals, happy-dom, husky (+39 more)

### Community 15 - "qServer/types/common.ts"
Cohesion: 0.08
Nodes (40): getEndpointById(), getEndpointsByGroup(), adminEndpointDescriptors, QServerAdminEndpoints, authEndpointDescriptors, environmentEndpointDescriptors, QServerEnvironmentEndpoints, functionsScriptsEndpointDescriptors (+32 more)

### Community 16 - "package.json"
Cohesion: 0.08
Nodes (21): author, bugs, url, exports, ./dist/finch.css, ./style.css, files, homepage (+13 more)

### Community 17 - "QServerApiClient.ts"
Cohesion: 0.05
Nodes (45): getConsoleOutputUpdateViaPoll(), getLockInfoViaStatus(), getQueueItemViaQueueScan(), resolvePosition(), canSendGetBody(), hasPayload(), isBodyRequired(), warnGetBodyOnce() (+37 more)

### Community 18 - "ophyd-sim/index.ts"
Cohesion: 0.10
Nodes (30): bitmapCache, createSimDetectorCameraSocketFactory(), loadImageBitmap(), renderDetectorFrame(), RenderLayer, SimDetectorCameraOptions, CameraFramePayload, createSimCameraSocketFactory() (+22 more)

### Community 19 - "qServer/hooks/index.ts"
Cohesion: 0.06
Nodes (101): useQueueInterruptKernelMutation(), useQueueStopManagerMutation(), useQueueTestKillManagerMutation(), useQueueTestServerSleepQuery(), QueueCreateApiKeyForPrincipalVariables, QueueRevokeApiKeyVariables, QueueRevokeSessionVariables, useQueueCreateApiKeyForPrincipalMutation() (+93 more)

### Community 20 - "tempTypes.ts"
Cohesion: 0.05
Nodes (31): ArrayStructure, AwkwardForm, AwkwardStructure, Breadcrumb, ContainerStructure, PathItem, Paths, pathsSample (+23 more)

### Community 21 - "ColormapPicker.stories.tsx"
Cohesion: 0.16
Nodes (14): ColormapPicker(), ColormapPickerProps, ColormapDef, COLORMAPS, COLORMAPSPLOTLY, CustomColormaps, Default, FilteredColormaps (+6 more)

### Community 22 - "generatedAliases.ts"
Cohesion: 0.07
Nodes (25): QServerAuthEndpoints, CurrentApiKeyInfoResponse, LogoutResponse, NewApiKeyResponse, PrincipalListResponse, PrincipalResponse, ScopesResponse, SessionRefreshBody (+17 more)

### Community 23 - "defaultQServer.ts"
Cohesion: 0.15
Nodes (21): createQServerSim(), CreateQServerSimOptions, QServerSimUids, defaultHistory, failedHistoryItem, defaultQueue, BASE_SCENARIO_OPTIONS, emptyQServer() (+13 more)

### Community 24 - "createOphydSimTransport"
Cohesion: 0.07
Nodes (29): Transport Seam Design Rationale, OphydPVMessageListener, OphydPVOutgoingMessage, SimulatedBeamline(), OphydSim, useSimSet(), useSimSignal(), OphydSimContext (+21 more)

### Community 25 - "components/ReactEDM/ReactEDM.tsx"
Cohesion: 0.24
Nodes (8): MockContext, MockContextType, MockProvider(), PresentationLayer(), PresentationLayerProps, getConfigFromLocalStorage(), ReactEDM(), ReactEDMProps

### Community 26 - "Hexapod.test.tsx"
Cohesion: 0.26
Nodes (8): Hexapod(), HexapodProps, HexapodHeader(), HexapodHeaderProps, HexapodPlot(), defaultHeaderProps, makeDevice(), makeRBVs()

### Community 27 - "QueueServer.tsx"
Cohesion: 0.13
Nodes (29): useQueueOpenEnvironmentMutation(), useQueueGetHistoryQuery(), useQueueStartMutation(), useQueueGetStatusQuery(), RunningQueueItem, ContainerQServer(), useQueueServer(), MainPanel() (+21 more)

### Community 28 - "qServer/index.ts"
Cohesion: 0.12
Nodes (30): addRequestInterceptor(), addResponseInterceptor(), clearGlobalAuth(), clearInterceptors(), configureQServerClient(), ejectInterceptor(), getGlobalApiKey(), getGlobalAxiosClient() (+22 more)

### Community 29 - "SimulatedBeamline.tsx"
Cohesion: 0.09
Nodes (27): Beamline Endstation Apparatus Illustration, Endstation Display Base Layer (SVG), Light Blocked Layer (Endstation Display), Light Unblocked Layer, Shutter Moveable Layer, Beamstop Moveable (Stage 3), Light Mono Moveable Layer, Sample Holder (Endstation Layer 5) (+19 more)

### Community 30 - "FinchAppLayout.tsx"
Cohesion: 0.17
Nodes (14): FinchAppLayout(), FinchAppLayoutProps, FinchSidebar(), FinchSidebarProps, useActiveRoute(), mockRoutes, RenderLayoutOptions, mockRoutes (+6 more)

### Community 31 - "TestQserver.tsx"
Cohesion: 0.12
Nodes (28): createQServerApiClient(), getReadOnlyEndpoints(), QSERVER_ENDPOINT_GROUPS, QSERVER_GROUP_LABELS, isQServerApiError(), QServerEndpointGroup, QServerEndpointInvocation, ConnectionBar() (+20 more)

### Community 32 - "FinchConfigProvider.tsx"
Cohesion: 0.38
Nodes (5): cleanConfig(), cleanUrl(), FinchConfig, FinchConfigContext, FinchConfigProvider()

### Community 33 - "sockets/types.ts"
Cohesion: 0.09
Nodes (18): buildAuthMessage(), createQServerSocket(), DEFAULT_RECONNECT, describeError(), withQueryAuth(), QSERVER_SOCKET_PATHS, QSERVER_WS_AUTH_TIMEOUT_MS, QSERVER_WS_CLOSE_AUTH_REQUIRED (+10 more)

### Community 34 - "clientSeams.test.ts"
Cohesion: 0.14
Nodes (22): RunListOption, describe(), handleRequest(), normalizePath(), notImplemented(), checkAuth(), createQServerSimAdapter(), extractPath() (+14 more)

### Community 35 - "useTiledClient.ts"
Cohesion: 0.16
Nodes (19): FinchQueryScope, isTiledEndpointUnavailableError(), TiledEndpointUnavailableError, TiledQueryScope, completeClientSurface(), TiledClientResolution, TILED_CLIENT_LIKE_METHODS, TiledClientLike (+11 more)

### Community 36 - "QServer Sim"
Cohesion: 0.09
Nodes (31): Bluesky Web, BrowserRouter, createQServerSimAdapter, createQServerSimClient, FinchConfigProvider, Ophyd API (ophyd-websocket), QServerApiProvider, QServerSimProvider (+23 more)

### Community 37 - "tiled/hooks/index.ts"
Cohesion: 0.19
Nodes (26): stripUndefined(), useTiledArrayAsBufferQuery(), useTiledArrayAsJSONQuery(), useTiledArrayAsPngQuery(), useTiledArrayAsQuery(), useTiledArrayImagePath(), useTiledServerInfoQuery(), arrayKeyParts() (+18 more)

### Community 38 - "useTiledQuery.ts"
Cohesion: 0.44
Nodes (5): resolveEnabled(), TiledQueryEngineArgs, TiledQueryKeyFor, tiledQueryKeys, TiledHookError

### Community 39 - "useQServerChannelSockets.ts"
Cohesion: 0.21
Nodes (20): channelOptions(), createQServerConsoleSocket(), createQServerInfoSocket(), createQServerStatusSocket(), QServerChannelSocketOptions, isFrame(), isQServerConsoleFrame(), isQServerInfoFrame() (+12 more)

### Community 40 - "src/index.ts"
Cohesion: 0.06
Nodes (42): BeamEnergyAbout(), BeamEnergyAboutProps, BeamEnergyController(), BeamEnergyControllerProps, MoveMode, moveModeList, BeamEnergyCurrentValue(), BeamEnergyCurrentValueProps (+34 more)

### Community 41 - "types/types.ts"
Cohesion: 0.08
Nodes (42): ArbitraryKwargs, ExperimentFormGeneric(), ExperimentFormGenericProps, firstLine(), hasEveryRequiredValue(), hasValue(), initializeParameters(), initialValueFor() (+34 more)

### Community 42 - "ReactEDMTabs.tsx"
Cohesion: 0.17
Nodes (19): useTabLS(), ReactEDMContent(), ReactEDMContentProps, TabManagementContext, TabManagementContextType, TabManagementProvider(), TabsContext, useTabsContext() (+11 more)

### Community 43 - "three-examples.d.ts"
Cohesion: 0.08
Nodes (11): EffectComposer, FBXLoader, FullScreenQuad, Pass, RenderPass, three/examples/jsm/loaders/FBXLoader, three/examples/jsm/postprocessing/EffectComposer, three/examples/jsm/postprocessing/Pass (+3 more)

### Community 44 - "OphydTransportProvider.tsx"
Cohesion: 0.16
Nodes (14): CameraSocketFactoryContext, DeviceTransportContext, PVTransportContext, useOphydDeviceTransport(), useOphydPVTransport(), OphydTransportProvider(), OphydTransportProviderProps, createWebSocketDeviceTransport() (+6 more)

### Community 45 - "QServerSimDemo.tsx"
Cohesion: 0.11
Nodes (25): qserver-sim Deliberate Omissions, One Dispatcher, Two Client Seams Rationale, Console Output WS Sample Transcript, QSERVER_CLIENT_LIKE_METHODS, QServerClientLike, QServerApiContext, QServerApiProviderProps, QServerSocketFactory (+17 more)

### Community 46 - "requestOptions.ts"
Cohesion: 0.09
Nodes (31): AnyFinchHttpRequestOptions, AssertTrue, combineAbortSignals(), ConformsToFinchHttpRequestOptions, ConformsToFinchRequestOptions, FinchHttpRequestOptions, FinchRequestOptions, mergeRequestOptions() (+23 more)

### Community 47 - "Camera.test.tsx"
Cohesion: 0.06
Nodes (42): CameraContainer(), CameraContainerProps, CameraControlPanel(), CameraControlPanelProps, CameraCustomSetup(), sizeMap, CameraSettings(), CameraSettingsProps (+34 more)

### Community 48 - "compilerOptions"
Cohesion: 0.05
Nodes (40): **/*BeamVis*/**/*, ESNext, node_modules, node_modules/@types, src/api/tiled_archive/**/*, src/**/BeamVis/**/*, src/components/BeamVis/**/*, src/index.d.ts (+32 more)

### Community 49 - "Ophyd Sim"
Cohesion: 0.10
Nodes (18): createOphydSim factory, OphydSimProvider, OphydTransportProvider, Camera socket seam / CameraCanvas, AXES, Axis, clamp(), hexapod() (+10 more)

### Community 50 - "Finch Repository Instructions"
Cohesion: 0.07
Nodes (40): Bluesky Queue Server (related project), NPM Publish Pipeline Rationale, Ophyd WebSocket (related project), Storybook GH Pages Deploy Rationale, Tiled (related project), Publish NPM Package Workflow, Publish Storybook Workflow, Run Tests Workflow (+32 more)

### Community 51 - "InputSlider.stories.ts"
Cohesion: 0.19
Nodes (11): InputSlider(), InputSliderProps, Default, InteractiveInputSlider(), meta, Story, WithCustomTicks, WithFillBar (+3 more)

### Community 52 - "ComponentConfig"
Cohesion: 0.13
Nodes (16): BeamlineDefinition, beamlineDefinitions, bl531Definition, bl733Definition, bl832Definition, exampleDefinition, BeamlineContainerProps, ControlLayout (+8 more)

### Community 53 - "createFallbackTransport.ts"
Cohesion: 0.19
Nodes (9): ActionMessage, createFallbackTransport(), CreateFallbackTransportOptions, defaultSubKey(), GenericTransport, SUBSCRIBE_ACTIONS, SubscribeAction, OphydTransportStatus (+1 more)

### Community 54 - "GetStatusResponse"
Cohesion: 0.24
Nodes (10): GetStatusResponse, deriveStatus(), STATUS_KEYS, QServerSimContext, useQServerSim(), useQServerSimOptional(), QServerSimProvider(), QServerSimProviderProps (+2 more)

### Community 55 - "compilerOptions"
Cohesion: 0.07
Nodes (26): ES2020, compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module (+18 more)

### Community 56 - "ExperimentAngleScan.tsx"
Cohesion: 0.09
Nodes (19): ExperimentAngleScanProps, PlotlyHeatmap(), PlotlyHeatmapProps, PlotlyHeatmapProps, PlotlyHeatmapTiled(), TiledWriterDetImageHeatmap(), TiledWriterDetImageHeatmapProps, TiledHeatmapSelector() (+11 more)

### Community 57 - "deviceControllerTypes.ts"
Cohesion: 0.08
Nodes (31): ControllerAbsoluteMove(), ControllerRelativeMove(), DeviceControllerBoxProps, DeviceControllerBoxSimple(), DeviceControllerBoxSimpleProps, InputNumber(), InputNumberProps, MockMessageData (+23 more)

### Community 58 - "InterceptorHandle"
Cohesion: 0.22
Nodes (5): eject(), Installer, InterceptorRegistry, RegistryEntry, InterceptorHandle

### Community 59 - "ExperimentXASAlignment.tsx"
Cohesion: 0.29
Nodes (9): ExperimentHistory(), ExperimentHistoryProps, ExperimentXASAlignment(), ExperimentXASAlignmentProps, getLs(), readStartField(), RunsExplorerProps, TiledSearchItem (+1 more)

### Community 60 - "QServerClient.test.tsx"
Cohesion: 0.15
Nodes (14): BODY_REQUIRED_GET_ENDPOINT_IDS, NO_BROWSER_PATH_ENDPOINT_IDS, PAYLOAD_GET_ENDPOINT_IDS, PayloadGetEndpointId, resetGetBodyWarnings(), setGetBodySupportOverride(), warned, QSERVER_ENDPOINTS (+6 more)

### Community 61 - "tiled/hooks/invalidation.ts"
Cohesion: 0.17
Nodes (18): TiledLoginVariables, useTiledLoginMutation(), TiledMutationEngineArgs, useTiledMutation(), invalidateAllTiledQueries(), invalidateTiledRoots(), resolveInvalidationRoots(), TILED_INVALIDATION_BUNDLES (+10 more)

### Community 62 - "apiUtils.ts"
Cohesion: 0.12
Nodes (20): useOptionalFinchConfig(), useOphydPVSocket(), useTiledMostRecentDetImage(), UseTiledMostRecentDetImageOptions, UseTiledMostRecentDetImageReturn, useTiledWriterDetImageHeatmap(), UseTiledWriterDetImageHeatmapOptions, TiledWrapper() (+12 more)

### Community 63 - "icons.tsx"
Cohesion: 0.11
Nodes (21): controllerIcons, customIcons, tailwindIcons, Button(), ButtonProps, buttonVariants, getButtonClasses(), paddingSizes (+13 more)

### Community 64 - "stage/index.ts"
Cohesion: 0.35
Nodes (5): createCylindricalStage(), createTiltStage(), createXYZStage(), createStage(), StageConfig

### Community 65 - "ButtonWithIcon.stories.tsx"
Cohesion: 0.17
Nodes (10): Active, ActiveSecondary, CustomColors, Disabled, Large, meta, Primary, Secondary (+2 more)

### Community 66 - "factories/index.ts"
Cohesion: 0.23
Nodes (11): createBeam(), buildBeamStop(), createBeamStop(), createDetector(), createMotor(), createSample(), createSlit factory, createObjectFromConfig() (+3 more)

### Community 67 - "useOphydSocket"
Cohesion: 0.11
Nodes (23): useOphydSocket(), beamlineIcons, BeamEnergy(), BeamEnergyIconWithValueProps, useBeamEnergyPV(), UseBeamEnergyPVProps, computeEnergyFromMonoAngle(), energy (+15 more)

### Community 68 - "Experiment.tsx"
Cohesion: 0.27
Nodes (10): useQueueGetPlansAllowedQuery(), useQueueExecuteItemMutation(), axisOptions(), Experiment(), ExperimentProps, FALLBACK_AXIS_COLUMNS, ExperimentExecutePlanButton(), ExperimentExecutePlanButtonProps (+2 more)

### Community 69 - "ComponentConfig.ts"
Cohesion: 0.18
Nodes (12): bl832ControlLayout, bl832Definition, bl832SceneConfig, BaseConfig, beamColorMap, BeamConfig, BeamStopConfig, DetectorConfig (+4 more)

### Community 70 - "tiled/hooks/typeTests.ts"
Cohesion: 0.14
Nodes (21): encodeSearchConfig(), SearchQueryOptions, useSearch(), useTiledSearchByFullTextQuery(), useTiledSearchByMetadataComparisonQuery(), useTiledSearchByMetadataEqualsQuery(), useTiledSearchByRegexQuery(), useTiledSearchBySpecsQuery() (+13 more)

### Community 71 - "FinchAppLayout.stories.tsx"
Cohesion: 0.12
Nodes (10): CustomClasses, CustomTitle, Default, ExplorerTabProps, meta, routes, routesWithTabs, Story (+2 more)

### Community 72 - "QItem.tsx"
Cohesion: 0.23
Nodes (10): QItem(), QItemProps, colorList, colorListOpacity, colorMap, colorMapOpacity, getPlanColor(), getPlanColorOpacity() (+2 more)

### Community 73 - "ComponentViewerExampleReal.tsx"
Cohesion: 0.14
Nodes (20): makeDevice(), useSimOphydPVSocket(), AllComponentsPage(), ComponentViewer(), ComponentViewerProps, ComponentViewerExampleReal(), ComponentViewerExampleSim(), SIM_DEVICES (+12 more)

### Community 74 - "app/App.tsx"
Cohesion: 0.17
Nodes (9): queryClient, AboutFinchPage(), QueueMonitorPage(), RunsPage(), ScanDashboardPage(), TestPage(), finchIcons, RunsExplorer() (+1 more)

### Community 75 - "ReactEDM Home / Overview"
Cohesion: 0.18
Nodes (19): ADLParser (ADL file parser), BobParser (BOB file parser), CompositeDeviceRenderer component, DeviceRender component, Entry data structure / UIEntry interface, ReactEDM component, StyleRender component, ReactEDM/styles.json variants config (+11 more)

### Community 76 - "facade.ts"
Cohesion: 0.06
Nodes (71): getDefaultQServerClient(), abortRE(), addQueueItem(), addQueueItemBatch(), cancelQueueStop(), clearHistory(), clearQueue(), closeEnvironment() (+63 more)

### Community 77 - "useQueueGetQuery"
Cohesion: 0.23
Nodes (11): useQueueAddItemMutation(), useQueueGetItemQuery(), useQueueGetQuery(), _GetWithBodyOptionsConform, _QServerOptionsConform, useCallShapeChecks(), useInferenceChecks(), demoClient (+3 more)

### Community 78 - "transport/types.ts"
Cohesion: 0.33
Nodes (10): ActionRequest, ActionRequestRefresh, ActionRequestSet, ActionRequestSubscribe, ActionRequestUnsubscribe, ErrorResponse, MessageResponse, MetaUpdateResponse (+2 more)

### Community 79 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 80 - "dependencies"
Cohesion: 0.06
Nodes (35): @blueskyproject/tiled, class-variance-authority, clsx, d3-shape, dayjs, lucide-react, dependencies, @blueskyproject/tiled (+27 more)

### Community 81 - "qServerMockData.ts"
Cohesion: 0.11
Nodes (17): GetRunsActiveResponse, mockAddItemFailResponse, mockAddItemSuccessArgsResponse, mockAddItemSuccessResponse, mockDeleteQueueItemResponse, mockEnvironmentOpenResponse, mockExecuteItemResponse, mockGetApiStatusResponse (+9 more)

### Community 82 - "BeamVis/main.tsx"
Cohesion: 0.16
Nodes (12): App(), BeamlineContainer(), EpicsApi, EpicsContext, useEpics(), usePV(), OphydProvider(), PVWSProvider() (+4 more)

### Community 83 - "SettingsContainer.tsx"
Cohesion: 0.17
Nodes (10): Checkbox(), CheckboxProps, SettingsAudioAlert(), SettingsAuthentication(), SettingsContainerProps, InputDict, inputDictDefault, SettingsMetadata() (+2 more)

### Community 84 - "tests/Experiment.test.tsx"
Cohesion: 0.24
Nodes (8): ExperimentAngleScan(), ExperimentEnergyScan(), ExperimentEnergyScanProps, getBlueskyRunList(), RunListClient, useGetBlueskyRunList(), HistoryQueryResult, {
    usePlansAllowedQueryMock,
    useQueueQueryMock,
    useExecuteQueueItemMutationMock,
    useTiledSearchQueryMock,
}

### Community 85 - "ButtonIconOnly.stories.tsx"
Cohesion: 0.14
Nodes (12): ButtonIconOnly(), ButtonIconOnlyProps, buttonVariants, getButtonClasses(), Active, ActiveSecondary, CustomColors, Disabled (+4 more)

### Community 86 - "QSConsole.tsx"
Cohesion: 0.23
Nodes (9): MainPanelProps, ConsoleMessage, formatConsoleFrame(), QSConsole(), QSConsoleProps, timestamp(), Widget(), WidgetProps (+1 more)

### Community 87 - "BeamVis README"
Cohesion: 0.29
Nodes (8): Transition to Component-Centric 3D View, Decouple Control Handlers from PVs, Refactor: Dynamic Control Panels, Dynamic Synoptic Statuses, BeamVis About.tsx (entry point), BeamlineContainer.tsx (3D scene controller), BeamVis README, ThreeScene.tsx (3D renderer)

### Community 88 - "useHexapod.ts"
Cohesion: 0.21
Nodes (12): AXES, AxisKey, AxisMoveParams, makeDemoDevice(), SimPos, useHexapod(), UseHexapodProps, ZERO_POS (+4 more)

### Community 89 - "pageRoutes.tsx"
Cohesion: 0.31
Nodes (13): buildPageRoutes(), findCollision(), Page, PageRenderer, toChildUrl(), toPages(), toRoutePath(), toTabChildPath() (+5 more)

### Community 90 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, build-storybook, deploy-storybook, dev, format, format:fix, lint (+7 more)

### Community 91 - "InputSliderRange.stories.tsx"
Cohesion: 0.20
Nodes (9): InputSliderRange(), InputSliderRangeProps, Default, meta, Story, WithCustomTicks, WithoutLabel, WithoutLabelOrInput (+1 more)

### Community 92 - "TiledLinePlotMaker.tsx"
Cohesion: 0.18
Nodes (8): itemLabel(), TiledLinePlotMaker(), TiledLinePlotMakerProps, meta, Primary, queryClient, Story, SearchQueryResult

### Community 93 - "GoogleDoc.tsx"
Cohesion: 0.36
Nodes (5): Documentation(), doc, GoogleDoc(), GoogleDocProps, sampleDocs

### Community 94 - "CameraCanvas.tsx"
Cohesion: 0.11
Nodes (24): useCameraSocketFactory(), ophydSocketCameraPath, ophydSocketDevicePath, ophydSocketPVPath, ophydSocketTIFFPath, phosphorIcons, CameraCanvas(), CameraCanvasProps (+16 more)

### Community 95 - "SignalMonitorPlotDevice.tsx"
Cohesion: 0.08
Nodes (29): initialDevices(), useOphydDeviceSocket(), useBeamEnergyOphyd(), UseBeamEnergyOphydProps, PlotlyScatter, PlotlyScatterProps, sampleData, titleFont (+21 more)

### Community 96 - "ButtonWithIcon.tsx"
Cohesion: 0.22
Nodes (8): buttonVariants, ButtonWithIcon(), ButtonWithIconProps, getButtonClasses(), iconSizes, paddingSizes, spacingSizes, textSizes

### Community 97 - "OphydDeviceExplorer.tsx"
Cohesion: 0.24
Nodes (8): OphydDevicesPage(), DeviceInfo, DeviceSignalDescription, DeviceSignalValue, getPrimarySignal(), ListDevicesResponse, OphydDeviceExplorer(), SetDeviceErrorResponse

### Community 98 - "HexapodController.tsx"
Cohesion: 0.33
Nodes (7): defaultMovePositionForm, HexapodController(), HexapodControllerProps, MoveMode, HexapodMovePositionForm, HexapodRBVs, formatCurrentValue()

### Community 99 - "ophydSimDecorators.tsx"
Cohesion: 0.18
Nodes (11): createMockDeviceTransport(), Decorator, withDeviceTransport(), Default, deviceTransport, meta, Story, Default (+3 more)

### Community 100 - "ButtonCopyToClipboard.tsx"
Cohesion: 0.28
Nodes (6): ButtonCopyToClipboard(), ButtonCopyToClipboardProps, CustomColors, meta, Primary, Story

### Community 103 - "Finch Architecture Diagram"
Cohesion: 0.30
Nodes (12): Finch Architecture Diagram, Bluesky Backend, Finch UI, HTTP Requests Channel, Ophyd Socket, Q Server, React, shadcn/ui (+4 more)

### Community 104 - "Hexapod Top (Mobile) Platform"
Cohesion: 0.33
Nodes (11): Hexapod 6-DOF Motion, Rx (Rotation about X), Ry (Rotation about Y), Rz (Rotation about Z), Tx (Translation along X), Ty (Translation along Y), Tz (Translation along Z), Hexapod Base Platform (+3 more)

### Community 105 - "QServerEndpoints"
Cohesion: 0.17
Nodes (10): QServerPermissionsEndpoints, isQServerEndpointUnavailableError(), QServerEndpointUnavailableError, QServerEndpoints, GetPermissionsResponse, PermissionsResponse, ReloadPermissionsBody, SetPermissionsBody (+2 more)

### Community 106 - "Button.stories.ts"
Cohesion: 0.18
Nodes (10): Active, ActiveSecondary, CustomColors, Disabled, Large, meta, Primary, Secondary (+2 more)

### Community 107 - "ReactEDM.stories.ts"
Cohesion: 0.20
Nodes (9): ReactEDM(), ReactEDMProps, Bob, Default, Legacy, meta, Paper, Slate (+1 more)

### Community 108 - "ExperimentXASScan.tsx"
Cohesion: 0.50
Nodes (8): ExperimentXASScan(), ExperimentXASScanProps, getLocalStorageEnergyStart(), getLocalStorageEnergyStop(), getLocalStorageNumber(), getLocalStorageNumPoints(), getLocalStorageRoiHigh(), getLocalStorageRoiLow()

### Community 109 - "ItemDetailModal.tsx"
Cohesion: 0.36
Nodes (6): DetailItem, formatTime(), isHistoryItem(), isRunningItem(), ItemDetailModal(), ItemDetailModalProps

### Community 111 - "stories/Header.tsx"
Cohesion: 0.33
Nodes (4): Button(), ButtonProps, HeaderProps, User

### Community 112 - "SocketPane.tsx"
Cohesion: 0.24
Nodes (12): QServerSocketChannel, useChannelSocketOptions(), useQServerConsoleSocket(), useQServerInfoSocket(), useQServerStatusSocket(), useQServerSocket(), JsonResultViewer(), JsonResultViewerProps (+4 more)

### Community 114 - "compilerOptions"
Cohesion: 0.18
Nodes (10): package.json, src/vite-env.d.ts, vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution (+2 more)

### Community 115 - "bl531/config.ts"
Cohesion: 0.50
Nodes (3): bl531ControlLayout, bl531Definition, bl531SceneConfig

### Community 117 - "FinchMainContent.tsx"
Cohesion: 0.17
Nodes (10): FinchMainContent(), FinchMainContentProps, FinchPageTabs(), FinchPageTabsProps, mockRoutes, RenderContentOptions, slashedTabRoutes, tabbedRoutes (+2 more)

### Community 121 - "schema.d.ts"
Cohesion: 0.33
Nodes (5): components, $defs, operations, paths, webhooks

### Community 124 - "Finch Communication Diagram"
Cohesion: 0.73
Nodes (6): Finch Communication Diagram, Bluesky Backend Services (cloud), Finch (Frontend App), Ophyd WebSocket, Q Server, Tiled

### Community 127 - "qServerPlanSettings.js"
Cohesion: 0.40
Nodes (4): listScanSample, moveThenCountSample, planSettings, scanSample

### Community 129 - "Finch Compatibility Diagram"
Cohesion: 0.40
Nodes (5): Finch Compatibility Diagram, Blue Circular Wand Icon, Blue Diamond Logo Icon, Teal Gradient Lightning Bolt Icon, Material UI (MUI) Logo Icon

### Community 130 - "Storybook Connect Figma Plugin"
Cohesion: 0.67
Nodes (4): Figma Design Tool, Histogram Range Slider Widget, Storybook Connect Figma Plugin, Figma Plugin Screenshot (Storybook Connect)

### Community 131 - "peerDependencies"
Cohesion: 0.22
Nodes (9): react, react-dom, peerDependencies, react, react-dom, react-router, react, react-dom (+1 more)

### Community 134 - "adl/index.ts"
Cohesion: 0.67
Nodes (3): adlFiles, formatAdlContent(), modules

### Community 135 - "bob/index.ts"
Cohesion: 0.67
Nodes (3): bobFiles, formatbobContent(), modules

### Community 137 - "Area Detector Scattering/Diffraction Pattern"
Cohesion: 1.00
Nodes (3): Area Detector Scattering/Diffraction Pattern, Pixel Detector Module Gaps (grid lines), Detector 1M Frame Image (det_1m_1.png)

### Community 142 - "Assets Illustration"
Cohesion: 0.67
Nodes (3): Assets Illustration, Image Asset, Text/Font Asset

## Ambiguous Edges - Review These
- `QServerRegistry.test.tsx` → `QServerNewRegistry.test.tsx`  [AMBIGUOUS]
  .github/workflows/test.yml · relation: semantically_similar_to

## Knowledge Gaps
- **875 isolated node(s):** `config`, `customTheme`, `preview`, `$schema`, `style` (+870 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1082 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `QServerRegistry.test.tsx` and `QServerNewRegistry.test.tsx`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `QServerApiClient` connect `QServerApiClient` to `clientSeams.test.ts`, `src/index.ts`, `QServerEndpoints`, `facade.ts`, `QServerSimDemo.tsx`, `QServerClient.test.tsx`, `qServer/types/common.ts`, `QServerApiClient.ts`, `Finch Repository Instructions`, `qServer/hooks/index.ts`, `InterceptorHandle`, `qServer/index.ts`, `TestQserver.tsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `useOphydPVSocket`, `SamplePage1.tsx`, `DeviceRender.tsx`, `ColormapPicker.stories.tsx`, `createOphydSimTransport`, `QueueServer.tsx`, `SimulatedBeamline.tsx`, `FinchAppLayout.tsx`, `src/index.ts`, `types/types.ts`, `requestOptions.ts`, `Camera.test.tsx`, `InputSlider.stories.ts`, `ExperimentAngleScan.tsx`, `deviceControllerTypes.ts`, `ExperimentXASAlignment.tsx`, `icons.tsx`, `Experiment.tsx`, `ComponentViewerExampleReal.tsx`, `app/App.tsx`, `tests/Experiment.test.tsx`, `ButtonIconOnly.stories.tsx`, `InputSliderRange.stories.tsx`, `TiledLinePlotMaker.tsx`, `GoogleDoc.tsx`, `SignalMonitorPlotDevice.tsx`, `ButtonWithIcon.tsx`, `OphydDeviceExplorer.tsx`, `ButtonCopyToClipboard.tsx`, `ExperimentXASScan.tsx`, `FinchMainContent.tsx`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `QServerRequestOptions` connect `QServerApiClient` to `QServerSuccessResponse`, `QServerEndpoints`, `facade.ts`, `useQueueGetQuery`, `qServer/types/common.ts`, `QServerApiClient.ts`, `qServer/hooks/index.ts`, `tests/Experiment.test.tsx`, `generatedAliases.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `config`, `customTheme`, `preview` to the rest of the system?**
  _875 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `QServerSuccessResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06711915535444947 - nodes in this community are weakly interconnected._
- **Should `useOphydPVSocket` be split into smaller, more focused modules?**
  _Cohesion score 0.04655712050078247 - nodes in this community are weakly interconnected._
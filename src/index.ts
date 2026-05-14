import './components/style.css';

//COMPONENTS
export { default as Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { default as ButtonWithIcon } from './components/ButtonWithIcon';
export type { ButtonWithIconProps } from './components/ButtonWithIcon';

export { default as ButtonCopyToClipboard } from './components/ButtonCopyToClipboard';
export type { ButtonCopyToClipboardProps } from './components/ButtonCopyToClipboard';

export { default as InputSlider } from './components/InputSlider';
export type { InputSliderProps } from './components/InputSlider';

export { default as ColormapPicker } from './components/ColormapPicker/ColormapPicker';
export type { ColormapPickerProps } from './components/ColormapPicker/ColormapPicker';
export { COLORMAPS, COLORMAPSPLOTLY } from './components/ColormapPicker/colormaps';
export type { ColormapDef } from './components/ColormapPicker/colormaps';

// re-export the NPM Tiled component and its props type so its available natively in finch
export { default as TiledLookup } from './components/Tiled/Tiled';
export type { TiledProps } from './components/Tiled/Tiled';

export { default as TiledHeatmapSelector } from './features/TiledHeatmapSelector';
export type { TiledHeatmapSelectorProps } from './features/TiledHeatmapSelector';

export { default as Beamstop } from './features/Beamstop';
export type { BeamstopProps } from './features/Beamstop';

export { default as HubAppLayout } from './components/HubAppLayout';
export type { HubAppLayoutProps } from './components/HubAppLayout';

export { default as HubHeader } from './components/HubHeader';
export type { HubHeaderProps } from './components/HubHeader';

export { default as HubMainContent } from './components/HubMainContent';
export type { HubMainContentProps } from './components/HubMainContent';
export { default as HubSidebar } from './components/HubSidebar';
export type { HubSidebarProps } from './components/HubSidebar';

export { default as ContainerQServer } from './components/QServer/ContainerQServer';
export type { ContainerQServerProps } from './components/QServer/ContainerQServer';

export { default as CameraContainer } from './components/Camera/CameraContainer';
export type { CameraContainerProps } from './components/Camera/CameraContainer';

export { default as CameraCanvas } from './components/Camera/CameraCanvas';
export type { CameraCanvasProps } from './components/Camera/CameraCanvas';

export { default as Widget } from './components/Widget';
export type { WidgetProps } from './components/Widget';

export { default as PlotlyHeatmap } from './components/PlotlyHeatmap';
export type { PlotlyHeatmapProps } from './components/PlotlyHeatmap';

export { default as PlotlyScatter } from './components/PlotlyScatter';
export type { PlotlyScatterProps } from './components/PlotlyScatter';

export { default as DeviceControllerBox } from './components/DeviceControllerBox';
export type { DeviceControllerBoxProps } from './components/DeviceControllerBox';

export { default as Paper } from './components/Paper';
export type { PaperProps } from './components/Paper';

export { default as Bento } from './components/Bento';
export type { BentoProps } from './components/Bento';

export { default as TableDeviceController } from './components/TableDeviceController';
export type { TableDeviceControllerProps } from './components/TableDeviceController';

export { default as Header } from './components/Header';
export type { HeaderProps } from './components/Header';

export { default as Main } from './components/Main';

export { default as Sidebar } from './components/Sidebar';

export { default as SidebarItem } from './components/SidebarItem';

export { default as IFrame } from './components/IFrame';
export type { IFrameProps } from './components/IFrame';

export { default as GoogleDoc } from './components/GoogleDoc';
export type { doc as GoogleDocType } from './components/GoogleDoc';

export { default as Shutter } from './components/Shutter';

export { default as ButtonIconOnly } from './components/ButtonIconOnly';

export { default as InputCheckBox } from './components/InputCheckBox';

export { default as InputStringBoxRounded } from './components/InputStringBoxRounded';

export { default as InputEnumBoxRounded } from './components/InputEnumBoxRounded';

export { default as InputSliderRange } from './components/InputSliderRange';

export { default as InputNumber } from './components/InputNumber';

export { default as SelectDropdown } from './components/SelectDropdown';

export { default as DeviceControllerBoxSimple } from './components/DeviceControllerBoxSimple';

export { default as SignalMonitorPlotDevice } from './components/SignalMonitorPlotDevice';
export type { SignalMonitorPlotDeviceProps } from './components/SignalMonitorPlotDevice';

export { default as SignalMonitorPlotOphyd } from './components/SignalMonitorPlotOphyd';
export type { SignalMonitorPlotOphydProps } from './components/SignalMonitorPlotOphyd';

export { default as SignalMonitorPlotPV } from './components/SignalMonitorPlotPV';
export type { SignalMonitorPlotPVProps } from './components/SignalMonitorPlotPV';

export { default as ControllerAbsoluteMove } from './components/ControllerAbsoluteMove';
export type { ControllerAbsoluteMoveProps } from './components/ControllerAbsoluteMove';

export { default as ControllerRelativeMove } from './components/ControllerRelativeMove';
export type { ControllerRelativeMoveProps } from './components/ControllerRelativeMove';

export { default as PlotlyHeatmapTiled } from './components/PlotlyHeatmapTiled';

export { default as BeamVisSynoptic } from './components/BeamVisSynoptic';

export { default as ComponentViewer } from './features/ComponentViewer/ComponentViewer';
export type { ComponentViewerProps } from './features/ComponentViewer/ComponentViewer';
export { default as ComponentViewerExampleSim } from './features/ComponentViewer/ComponentViewerExampleSim';
export { default as ComponentViewerExampleReal } from './features/ComponentViewer/ComponentViewerExampleReal';

// TABS
export { TabsGroup } from './components/Tabs/TabsGroup';
export { TabsList } from './components/Tabs/TabsList';
export { TabsPanel } from './components/Tabs/TabsPanel';
export { Tab } from './components/Tabs/Tab';

// BEAM ENERGY
export { default as BeamEnergyPV } from './components/BeamEnergy/BeamEnergyPV';
export type { BeamEnergyProps } from './components/BeamEnergy/BeamEnergyPV';

export { default as BeamEnergyOphyd } from './components/BeamEnergy/BeamEnergyOphyd';
export type { BeamEnergyOphydProps } from './components/BeamEnergy/BeamEnergyOphyd';

export { default as BeamEnergyTitleIcon } from './components/BeamEnergy/BeamEnergyTitleIcon';
export type { BeamEnergyTitleIconProps } from './components/BeamEnergy/BeamEnergyTitleIcon';

export { default as BeamEnergyIconWithValue } from './components/BeamEnergy/BeamEnergyIconWithValue';
export type { BeamEnergyIconWithValueProps } from './components/BeamEnergy/BeamEnergyIconWithValue';

export { default as BeamEnergyAbout } from './components/BeamEnergy/BeamEnergyAbout';
export { default as BeamEnergyController } from './components/BeamEnergy/BeamEnergyController';
export { default as BeamEnergyCurrentValue } from './components/BeamEnergy/BeamEnergyCurrentValue';
export { default as BeamEnergyHeader } from './components/BeamEnergy/BeamEnergyHeader';
export { default as BeamEnergyPlot } from './components/BeamEnergy/BeamEnergyPlot';

// HEXAPOD
export { default as Hexapod } from './components/Hexapod/Hexapod';
export { default as HexapodAbout } from './components/Hexapod/HexapodAbout';
export type { HexapodAboutProps } from './components/Hexapod/HexapodAbout';
export { default as HexapodController } from './components/Hexapod/HexapodController';
export { default as HexapodHeader } from './components/Hexapod/HexapodHeader';
export { default as HexapodPlot } from './components/Hexapod/HexapodPlot';

// HISTOGRAM
export { default as Histogram } from './components/Histogram/Histogram';
export { default as HistogramDeviceController } from './components/Histogram/HistogramDeviceController';
export { default as HistogramPlot } from './components/Histogram/HistogramPlot';
export { default as HistogramPlotSettings } from './components/Histogram/HistogramPlotSettings';

// EXPERIMENT
export { default as ExperimentHistory } from './components/Experiment/ExperimentHistory';
export { default as ExperimentAngleScan } from './components/Experiment/ExperimentAngleScan';
export { default as ExperimentEnergyScan } from './components/Experiment/ExperimentEnergyScan';
export { default as ExperimentExecutePlanButton } from './components/Experiment/ExperimentExecutePlanButton';
export { default as ExperimentExecutePlanButtonGeneric } from './components/Experiment/ExperimentExecutePlanButtonGeneric';
export { default as ExperimentPlanSettings } from './components/Experiment/ExperimentPlanSettings';

// TILED COMPONENTS
export { default as TiledScatterPlot } from './components/Tiled/TiledScatterPlot';
export { default as TiledWriterScatterPlot } from './components/Tiled/TiledWriterScatterPlot';
export { default as TiledWriterDetImageHeatmap } from './components/Tiled/TiledWriterDetImageHeatmap';

// CAMERA (additional)
export { default as CameraCanvasFeatures } from './components/Camera/CameraCanvasFeatures';
export type { CameraCanvasFeaturesProps } from './components/Camera/CameraCanvasFeatures';
export { default as TIFFCanvas } from './components/Camera/TIFFCanvas';
export type { TIFFCanvasProps } from './components/Camera/TIFFCanvas';
export { default as TIFFContainer } from './components/Camera/TIFFContainer';
export type { TIFFContainerProps } from './components/Camera/TIFFContainer';
export { default as CameraControlPanel } from './components/Camera/CameraControlPanel';
export { default as CameraSettings } from './components/Camera/CameraSettings';
export { default as CameraCustomSetup } from './components/Camera/CameraCustomSetup';
export { default as CameraInputGroup } from './components/Camera/InputGroup';
export { default as CameraInputField } from './components/Camera/InputField';

// REACT EDM
export { default as ReactEDM } from './components/ReactEDM/ReactEDM';
export type { ReactEDMProps } from './components/ReactEDM/ReactEDM';

// QSERVER (additional)
export { default as QueueServer } from './components/QServer/QueueServer';
export type { QueueServerProps } from './components/QServer/QueueServer';

//HOOKS
export { default as useOphydSocket } from './api/ophyd/useOphydSocket';
export { default as useOphydPVSocket } from './api/ophyd/useOphydPVSocket';
export { default as useOphydDeviceSocket } from './api/ophyd/useOphydDeviceSocket';
export { default as useSimOphydPVSocket } from './api/ophyd/useSimOphydPVSocket';
export { useTiledMostRecentDetImage } from './components/Tiled/hooks/useTiledMostRecentDetImage';

// OPHYD TYPES
export * as OphydDeviceSocketTypes from './api/ophyd/ophydDeviceSocketTypes';
export * as OphydPVSocketTypes from './api/ophyd/ophydPVSocketTypes';
export {
    ophydSocketTIFFPath,
    ophydSocketCameraPath,
    ophydSocketDevicePath,
    ophydSocketPVPath,
} from './api/ophyd/socketPaths';

// QSERVER API
export { createQServerApiClient } from './api/qServer/client';
export type { QServerApiConfig } from './api/qServer/client';

export * as QServerRequests from './api/qServer/requests';

export {
    useQueueQuery,
    useQueueHistoryQuery,
    useStatusQuery,
    usePlansAllowedQuery,
    useDevicesAllowedQuery,
    useQueueItemQuery,
    useRunsActiveQuery,
    useAddQueueItemMutation,
    useExecuteQueueItemMutation,
    useRemoveQueueItemMutation,
    useOpenEnvironmentMutation,
    useStartREMutation,
    usePauseREMutation,
    useResumeREMutation,
    useAbortREMutation,
} from './api/qServer/hooks';

export type {
    GetStatusResponse,
    GetQueueResponse,
    GetHistoryResponse,
    GetPlansAllowedResponse,
    GetDevicesAllowedResponse,
    GetQueueItemResponse,
    GetRunsActiveResponse,
    PostItemAddResponse,
    PostItemExecuteResponse,
    PostItemRemoveResponse,
    PostEnvironmentOpenResponse,
    PostREResponse,
    BaseQueueItem,
    QueueItem,
    FailedQueueItem,
    RunningQueueItem,
    HistoryItem,
    ArbitraryKwargs,
    MetadataKwarg,
    AddQueueItemBody,
    ExecuteQueueItemBody,
    RemoveQueueItemBody,
    RunsActiveListItem,
    Component,
    Device as QServerDevice,
    Parameter,
    Plan,
    Result,
} from './api/qServer/types';

//TYPES
export type { RouteItem } from './types/navigationRouterTypes';
export type { Device, Devices } from './types/deviceControllerTypes';

//CONTEXT PROVIDERS
export { FinchConfigProvider, useOptionalFinchConfig } from './app/FinchConfigProvider';

// Tiled API namespace - groups all Tiled functionality under a clear namespace
import * as TiledAPI from '@blueskyproject/tiled';

export const Tiled = {
    // Path management
    setInitialPath: TiledAPI.setInitialPath,
    getInitialPath: TiledAPI.getInitialPath,

    // Authentication and server configuration
    setAuthErrorCallback: TiledAPI.setAuthErrorCallback,
    getDefaultUrl: TiledAPI.getDefaultTiledUrl,
    setBearerToken: TiledAPI.setBearerToken,
    getServerInfo: TiledAPI.getServerInfo,
    loginWithPassword: TiledAPI.loginUserWithNamePassword,

    // Search and data retrieval
    getSearchResults: TiledAPI.getSearchResults,
    getSearchResultsBySpecs: TiledAPI.getSearchResultsBySpecs,
    getItemMetadata: TiledAPI.getItemMetadata,
    getBlueskyPlanMetadata: TiledAPI.getBlueskyPlanMetadata,
    getFirstSearchWithApiKey: TiledAPI.getFirstSearchWithApiKey,
    getTableDataAsJson: TiledAPI.getTableDataAsJson,
    getTableDataAsSequence: TiledAPI.getTableDataAsSequence,
    getStructuredArrayData: TiledAPI.getStructuredArrayData,
    getXArrayData: TiledAPI.getXArrayData,

    // Comprehensive search functions
    searchBySpecs: TiledAPI.searchBySpecs,
    searchByFulltext: TiledAPI.searchByFulltext,
    searchByMetadataEquals: TiledAPI.searchByMetadataEquals,
    searchByMetadataComparison: TiledAPI.searchByMetadataComparison,
    searchByRegex: TiledAPI.searchByRegex,
    searchByStructureFamily: TiledAPI.searchByStructureFamily,

    // Image handling
    generateFullImagePngPath: TiledAPI.generateFullImagePngPath,
    getAuthenticatedImage: TiledAPI.getAuthenticatedImage,

    // Configuration and state management
    setReverseSort: TiledAPI.setReverseSort,
    resetGlobalState: TiledAPI.resetGlobalState,

    // Type guards
    isArrayStructure: TiledAPI.isArrayStructure,
    isTableStructure: TiledAPI.isTableStructure,
    isContainerStructure: TiledAPI.isContainerStructure,
};

export type { FinchConfig } from './app/FinchConfigProvider';

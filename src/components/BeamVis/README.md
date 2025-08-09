# BeamVis

A lightweight control and visualization prototype for beamlines built with **React, TypeScript, and Three.js**. 🚀

BeamVis provides operators with a 2D synoptic view and a corresponding 3D context of the beamline. Both views are tied to live EPICS Process Variables (PVs) via a custom WebSocket hook (`useOphydSocket`) for real-time state and position updates.

> **Scope:** This document contains guides for both end-users and developers.

---

## Key Dependencies

This project relies on a few core technologies to function:

* **React:** Powers the user interface and component architecture.
* **Three.js:** Renders the entire 3D scene.
* **d3-shape:** Used to generate the SVG paths for the 2D synoptic view's beam path.
* **OphydSocket (Backend):** This application is a client for an expected WebSocket server backend that provides EPICS PV data.

---

##  Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# 4. Open the application in your browser
# It will be running on http://localhost:5173 (Vite's default)
```

### Connectivity

For this prototype, the WebSocket URL is **hardcoded**. To connect to your beamline's control system, you'll need to edit the source code directly.

**File to Edit:** `src/components/BeamVis/About.tsx`

```tsx
// src/components/BeamVis/About.tsx

const pvList = useMemo(() => [
  'IOC:m1.VAL', 'IOC:m2.VAL', 'IOC:m3.VAL',
  'bl531_xps2:sample_x_mm', 'bl531_xps2:sample_y_mm',
  'bl531_xps2:sample_x_mm.RBV', 'bl531_xps2:sample_y_mm.RBV',
  'IOC:m6.VAL', 'IOC:m7.VAL'
], []);

const { devices, handleSetValueRequest } =
    useOphydSocket('ws://192.168.10.155:8002/ophydSocket', pvList);
```

* **Change the Endpoint:** Edit the URL string in the `useOphydSocket` hook call.
* **Update PVs:** Add or remove PV strings from the `pvList` array to change which signals the application subscribes to.

---

## User Guide

The user interface is split into two main panels: a 2D **Synoptic View** on the left and a 3D **BeamVis View** on the right, which contains the 3D scene and the control panel.

### Synoptic View

The 2D Synoptic View provides a simplified schematic of the beamline components.

* **Real-time Status:** Component icons change color to reflect their live status (e.g., "ok", "moving", "disconnected"). The `sample-mount` node will flash a "moving" color when its position is being changed from the control panel, synchronized with the ghosting effect in the 3D view.
* **Component Details:** Clicking on the `sample-mount` node opens a popover. Inside the popover, you can click buttons to view the raw data object for its associated X and Y position PVs, streamed directly from the control system.



### 3D View & Controls

The 3D view renders a dynamic model of the beamline. The camera automatically follows the sample stage's position.

* **Context Cues:** Dashed, colored lines represent the axes of motion (X, Y, Z) for the primary stage. Hovering over a "jog" button in the control panel will animate the corresponding axis line in the 3D scene.
* **Motion Ghosting:** When a move is initiated on a stage, a green wireframe "ghost" of the stage appears at its starting position and remains until the motion is complete, providing a clear visual reference for the travel path.
* **Controls:** The control panel allows for direct manipulation of beamline components. You can:
    * **Jog:** Move a stage by a defined step size along an axis.
    * **Move:** Send a stage to an absolute target position.
    * **Rotate:** Adjust the sample rotation angle.

---

## Developer Guide

### Architecture & Data Flow

The application uses a clear, top-down, one-way data flow:

1.  **`About.tsx` (Entry Point):** The `useOphydSocket` hook connects to the WebSocket server and subscribes to the PVs defined in `pvList`. It receives live data into a `devices` object. It also manages the global `motionState`.
2.  **`BeamlineContainer.tsx` (Controller):** This component receives the `devices` object and the `motionState` as props. Its primary job is to map the live values from the `devices` object to the static `sceneConfig` of the selected beamline. This creates a new, dynamic configuration on every data update.
3.  **`ThreeScene.tsx` (Renderer):** Receives the final, dynamic `sceneConfig` as a prop. It then iterates through this config, updates the positions, rotations, and other properties of the corresponding Three.js objects in the 3D scene, and renders the result.

This unidirectional flow makes the application predictable and easier to debug. To trace data, always start where it enters (`About.tsx`) and follow it down through the component tree.

### Key Files

* `About.tsx`: The main entry point. Initializes `useOphydSocket`, manages `motionState`, and renders the two main UI panels.
* `BeamVisSynoptic.tsx`: Renders the 2D synoptic view using data from `Synoptic_Config.ts`.
* `Synoptic_Config.ts`: Defines the `nodes` and `edges` for the 2D synoptic layout.
* `BeamlineContainer.tsx`: The core controller for the 3D view. **This is where live PV data is translated into 3D object positions and rotations**.
* `ThreeScene.tsx`: The React component that manages all Three.js rendering.
* `ThreeScene/factories/index.ts`: The main factory module that calls specific functions to create 3D objects based on type.
* `ControlPanel.tsx`: Renders the UI controls and emits events to `BeamlineContainer`.
* `hooks/useOphydSocket.ts`: The custom hook that handles the WebSocket connection.

### The `BeamlineContainer`: The 3D Scene Controller

The `BeamlineContainer.tsx` component is the most critical piece of the visualization logic. It acts as the central hub that connects the raw control system data, user input, and the final 3D rendering. It has two main responsibilities:

**1. Translating Live Data into 3D Positions (Read Path)**

The component receives the live `devices` object from the `useOphydSocket` hook. Inside a `useMemo` block, it creates the final `configs` prop for the `ThreeScene`. It does this by iterating through the static `sceneConfig` of the selected beamline and injecting the live PV values into the `transform` properties of the appropriate components.

```tsx
// Inside BeamlineContainer.tsx
const configs: ComponentConfig[] = useMemo(() => {
  // ...
  currentConfigs = currentConfigs.map(cfg => {
    switch (cfg.id) {
      // ...
      case 'horizontalStage':
        return {
          ...cfg,
          transform: {
            ...cfg.transform,
            position: [
              // Map the live PV value to the X position of the 3D object
              Number(devices['bl531_xps2:sample_x_mm.RBV']?.value ?? cfg.transform.position[0]),
              // ... other axes
            ]
          }
        };
      // ...
    }
  });
  return currentConfigs;
}, [/* dependencies */]);
```
This `configs` array, now containing real-time positions, is passed to `ThreeScene`, which then updates the 3D objects.

**2. Handling User Input to Control Devices (Write Path)**

The `ControlPanel` is given handler functions from `BeamlineContainer`, such as `handleStageXChange`. When a user clicks a button to move a motor, this function is called. It performs two actions:

1.  **Initiates Ghosting:** It calls `initiateMove()`, which updates the global `motionState`. This tells `ThreeScene` to render a "ghost" of the object at its starting position and tells `BeamVisSynoptic` to show the "moving" status.
2.  **Sends the Command:** It calls `handleSetValueRequest()`, which sends a command with the new target value to the control system via the WebSocket.

```tsx
// Inside BeamlineContainer.tsx
const handleStageXChange = (val: number) => {
  // 1. Find the current object's config to get its start position
  const currentConfig = configs.find(c => c.id === 'horizontalStage');
  if (currentConfig) {
    const startPos = new THREE.Vector3().fromArray(currentConfig.transform.position);
    // Trigger the ghosting effect
    initiateMove(currentConfig.synopticId || currentConfig.id, startPos);
  }
  // 2. Send the new value to the control system
  handleSetValueRequest('bl531_xps2:sample_x_mm', val);
};
```

### The `ThreeScene`: The 3D Rendering Engine

The `ThreeScene.tsx` component is a self-contained React component dedicated solely to rendering the 3D world with Three.js. It is designed to be a "dumb" component that simply visualizes the data it is given.

* **Initialization:** Inside a `useEffect` hook with an empty dependency array (`[]`), the component runs its setup logic **once**. This includes creating the `THREE.Scene`, camera, `WebGLRenderer`, lights, ground plane, and post-processing effects like bloom. This ensures that the core 3D environment is not wastefully recreated on every React render.
* **Config-Driven Scene Building:** During initialization, it takes the `sceneConfig` prop and uses the `createObjectFromConfig` factory function to build the entire scene graph. It iterates through the config, creates the corresponding `THREE.Object3D` for each item, and parents them correctly.
* **Animation Loop:** The component starts a classic `requestAnimationFrame` loop (`animate` function). This loop is responsible for:
    * Rendering the scene on every frame.
    * Updating object positions with a smooth `lerp` (linear interpolation) to prevent visual jittering as new data arrives.
    * Handling continuous animations, like the "marching ants" effect on the highlighted axis lines.
    * Updating the camera position to follow the main sample stage.

### The `ComponentConfig` Object

This is the most important data structure for defining 3D objects. It's the "API" for creating items in a beamline's `sceneConfig`.

| Property       | Type                      | Description                                                                                             |
| -------------- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `id`           | `string`                  | **Required.** A unique identifier for the object within the scene (e.g., 'sample', 'detector').          |
| `type`         | `string`                  | **Required.** Determines which factory function to use (e.g., 'stage', 'sample', 'motor').             |
| `transform`    | `object`                  | **Required.** Contains `position`, `rotation`, and optional `scale` arrays for the object.              |
| `parentId`     | `string`                  | Optional. The `id` of another component to use as this object's parent in the scene graph hierarchy.      |
| `synopticId`   | `string`                  | Optional. The `id` of the corresponding node in the 2D `Synoptic_Config.ts` to link motion state.       |
| `geometry`     | `object`                  | Optional. Dimensions for the object's geometry (e.g., `{width, height, depth}` or `{radius}`).       |
| `meshType`     | `string`                  | For `type: 'sample'`, specifies the mesh to load (e.g., `'cube'`, `'cylinder'`, `'fbx'`, `'obj'`). |
| `inversions`   | `object`                  | Optional. For stages, an object like `{ x: -1 }` to flip the direction of control panel jogs and 3D motion. |
| `visible`      | `boolean`                 | Optional. Sets the initial visibility of the object. Defaults to `true`.                                |

### Editing the Synoptic Configuration

The 2D view is defined in `src/components/BeamVis/Synoptic_Config.ts`.

**Node & Edge Types**

```ts
// Synoptic_Config.ts
export interface Point { x: number; y: number; }

export interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  status: keyof typeof statusColor;
  icon?: string; // Icon filename in /src/components/BeamVis/assets/
}

export interface Edge {
  from: string; // id of the starting Node
  to: string;   // id of the ending Node
  orthogonalVia?: Point[]; // Waypoints for creating right-angle paths
}
```

* To **add a node**, add a new object to the `nodes` array with a unique `id`, and update the `edges` array to connect it.
* To **create a right-angle "snake" beam**, define an edge with an `orthogonalVia` array of points. The renderer uses D3's `curveStepAfter` for these edges.

### Synoptic Legend

The `Legend.tsx` component renders the key for the synoptic view's status colors. It is a simple component that maps the keys from the `statusColor` object (defined in `Synoptic_Config.ts`) to human-readable labels. This ensures that the legend is always in sync with the available statuses in the configuration file.

### Styling & CSS

This `BeamVis` component is part of the larger `finch` component library. As such, it does not contain its own all-encompassing stylesheet. Much of the styling for layout and typography is inherited from the parent project's global CSS.

For example, the CSS classes referenced in `About.tsx` (`main-container`, `synoptic-panel`, `beamvis-container`) and on synoptic nodes (`synoptic-node`) are defined in a shared stylesheet within the `finch` repository, not within the `BeamVis` directory itself.

### Creating a New Beamline Configuration

A "beamline" is a preset collection of 3D objects and control layouts.

**1. Define the Beamline**

In `src/components/BeamVis/beam_configs.ts`, create a new exported constant that adheres to the `BeamlineDefinition` interface.

```ts
// beam_configs.ts
import { BeamlineDefinition, ComponentConfig } from '../types';

export const myNewBeamline: BeamlineDefinition = {
  name: 'My New Beamline',
  sceneConfig: [
    // Array of ComponentConfig objects for the 3D scene
    {
      id: 'sample',
      type: 'sample',
      parentId: 'horizontalStage', // Nests this object under another
      transform: { position: [0, 0.2, 0], rotation: [0, 0, 0] },
      meshType: 'cylinder', // 'cube', 'cylinder', 'fbx', or 'obj'
      synopticId: 'sample-mount' // Links this 3D object to a synoptic node
    },
    // ... more components
  ],
  controlLayout: {
    // Defines which controls appear in the ControlPanel
    stages: [{ id: 'horizontalStage', type: 'xyz' }]
  },
};
```

**2. Register the Beamline**

In the same file (`beam_configs.ts`), add your new definition to the `beamlineDefinitions` export.

```ts
export const beamlineDefinitions = { bl531, myNewBeamline } as const;
```

The application will now show "My New Beamline" in the beamline selection dropdown.

### Adding a New 3D Object Type

To add a new, reusable 3D object (e.g., a "Slit Assembly"), follow these steps.

**1. Create the Factory Function**

In the `src/components/BeamVis/components/ThreeScene/factories/` directory, create a new file (e.g., `createSlit.ts`). This function should accept a config object and return a `THREE.Object3D`.

```ts
// factories/createSlit.ts
import * as THREE from 'three';
import { SlitConfig } from '../../../types/ComponentConfig'; // Define this type

export function createSlit(cfg: SlitConfig): THREE.Object3D {
  const group = new THREE.Group();
  // ... build your Three.js mesh(es)
  const geom = new THREE.BoxGeometry(0.1, 0.5, 0.5);
  const mat = new THREE.MeshPhongMaterial({ color: '#cccccc' });
  group.add(new THREE.Mesh(geom, mat));
  group.name = cfg.id;
  return group;
}
```

**2. Register in the Main Factory**

Open `src/components/BeamVis/components/ThreeScene/factories/index.ts` and integrate your new factory.

```ts
// factories/index.ts
import { createSlit } from './createSlit'; // 1. Import it

export function createObjectFromConfig(cfg: ComponentConfig, shared: SharedResources): THREE.Object3D | null {
  switch (cfg.type) {
    // ... other cases
    case 'slit': // 2. Add a new case
      return createSlit(cfg);
    default:
      console.warn(`Unrecognized component type: ${cfg.type}`);
      return null;
  }
}
```

**3. Use it in a Beamline Definition**

You can now use `type: 'slit'` in any `sceneConfig` within `beam_configs.ts`.

---

## Future Improvements

### Transition to a Component-Centric 3D View

The current model of selecting a full "beamline" from a dropdown is a holdover from the initial prototype. The long-term vision is to make the 3D view a dynamic "inspector" for individual components selected from the synoptic graph.

* **The Vision:** Instead of loading a static, predefined scene, the 3D panel will display a detailed model of a *single component* on demand.
* **Proposed Workflow:**
    1.  A user clicks a node in the synoptic view (e.g., the "M101 Toroidal Mirror").
    2.  A popover appears with a "3D View" button.
    3.  Clicking this button updates the state in `BeamlineContainer`, which then passes a new, minimal `sceneConfig` to `ThreeScene` containing only the selected component and perhaps a floor plane for context.
* **User-Defined Configurations:** To make this truly scalable, the system could support user-defined synoptic layouts (e.g., loaded from a JSON file). This file would map each synoptic node to a specific 3D model in an asset library. When a user clicks "3D View", the application would use this mapping to find and load the correct model. This removes the need for hardcoded `beamlineDefinitions` and empowers users to build their own layouts.

### Refactor: Dynamic Control Panels

A significant area for future work is the `ControlPanel.tsx` component.

* **Current State:** The control panel is currently monolithic. Its UI is hardcoded with specific controls (e.g., X and Y jog buttons) that are tightly coupled to the initial `bl531` beamline configuration.
* **The Problem:** This approach does not scale. As new beamlines are added with different components (e.g., goniometers, multi-axis stages, detectors with different settings), the control panel will need to display a different set of controls for each one.
* **Proposed Solution:** The `ControlPanel` should be refactored to be data-driven. The `controlLayout` object, which is already part of each `BeamlineDefinition`, should be used to dynamically generate the required UI modules.
    * For example, `ControlPanel.tsx` could map over the `controlLayout.stages` array.
    * For each entry, it could render a specific control module (e.g., `<XYZStageControls />`, `<RotationControls />`) based on the `type` property (`'xyz'`, `'rotation'`, etc.).
    * This would make the control panel modular and automatically adaptable to any beamline configuration, fulfilling the original intent of the `controlLayout` property.

### Decouple Control Handlers from PVs

* **Current State:** In `BeamlineContainer.tsx`, handler functions like `handleStageXChange` contain hardcoded PV strings (e.g., `'bl531_xps2:sample_x_mm'`).
* **The Problem:** This tight coupling means that controlling a new stage requires writing a completely new handler function. The logic is not reusable.
* **Proposed Solution:** The handler functions should be made generic. Instead of a hardcoded string, they should dynamically look up the correct PV to control based on the component's configuration. For example, the `ComponentConfig` for a stage could be extended to include a `pvs` object: `pvs: { x: 'some_motor:x.VAL', y: 'some_motor:y.VAL' }`. The generic `handleStageMove(axis, value)` function could then find the correct PV from this object and send the command. This would make the control logic as scalable as the rendering logic.

### Dynamic Synoptic Statuses

* **Current State:** The synoptic view defines statuses for `'ok'`, `'moving'`, and `'disconnected'`. However, only the `'moving'` status is truly dynamic, as it is driven by the `motionState` prop from `About.tsx`. The other statuses are currently static and hardcoded in the `Synoptic_Config.ts` file.
* **The Problem:** The view does not yet reflect real-time connection issues or other errors from the control system. A component will always show as `'ok'` unless it is actively moving.
* **Proposed Solution:** The logic for determining a node's status needs to be expanded. This would likely involve:
    1. Subscribing to additional PVs that represent component health or connection status.
    2. In a component like `BeamlineContainer` or `BeamVisSynoptic`, creating a function that determines the status for each node based on a priority (e.g., if a component is disconnected, show `'disconnected'` even if it is also moving).
    3. Passing this dynamically-determined status to the `BeamVisSynoptic` component, rather than relying on the hardcoded value.

### Other Improvements

* **Environment-driven configuration** for the WebSocket URL.
* **Schema validation** for incoming WebSocket messages.
* **Storybook integration** for isolated component development.
* **Keyboard hotkeys** for jogging motors and camera presets.
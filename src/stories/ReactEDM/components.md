# Hierarchy of Components

## Component Structure
- ReactEDM
   - PresentationLayer
   - ReactEDMTabs
      - UIView
         - UICanvas
           - StyleRender
              - Text
              - Rectangle
           - DeviceRender
              - InputText
              - InputNumber
              - TextUpdate
              - InputEnum
              - Button
              - RelatedDisp
                 - UIView
           - CompositeDeviceRenderer
              - UICanvas

# What They Do

### ReactEDM 
- Loads UI files from local storage based on tab data. 
- Renders PresentationLayer if it doesn't have tab data and no props. 
- Renders CSIControllerTabs if tab data or props are given.

### ReactEDMTabs
- Uses useTabsLocalStorage to generate tabs from local storage data. 
- Uses useTabsLocalStorage to save tab data to local storage as it changes. 
- Defines function for adding tabs. 
- Defines function for removing tabs. 
- Returns tabs with UIView.

### PresentationLayer
- Gets macros from user via a form component.

### UIView
- Gets clean UI data from the UI file and gets devices (from Ophyd WS) via useUIData util. 
- Presents UICanvas wrapped by ScalableContainer for resizability.

### UICanvas
- Maps through UI data to render StyleRender, DeviceRender and CompositeDeviceRenderer.

### StyleRender
- Renders a widget that doesn't need any EPICS PV. Takes in UI entry and renders Text or Rectangle.

### DeviceRender
- Takes in UI entry and renders InputText, InputNumber, TextUpdate, InputEnum, Button, or RelatedDisp.

### InputText
- Widget for text input.

### InputNumber
- Widget for number input.

### TextUpdate
- Widget for readback values.

### InputEnum
- Widget for menu (dropdown).

### Button
- Widget for button.

### Related Disp
- Widget for related displays (opens a new window).

### CompositeDeviceRenderer
- Widget for composite/group, renders a UICanvas.
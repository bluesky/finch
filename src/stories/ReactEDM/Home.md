# ReactEDM

ReactEDM, or React Extensible Dispaly Manager, is a react component for displaying control screens in the browser. Currently, it supports the BOB file format from [CSS Phoebus](https://controlssoftware.sns.ornl.gov/css_phoebus/) and ADL files from [MEDM](https://epics.anl.gov/extensions/medm/index.php).

## Vocab
**Entry**: The entry data structure, as defined in [Entry Data Structure](?path=/docs/general-components-reactedm-developer-notes-entry-data-structure--docs)  
**Widget**: An individual component, such as text, or a button   
**EPICS**: Experimental Physics and Industrial Control System  
**PV**: Process variable; a value recieved from an IOC via EPICS

## How this works

UI files are taken from github (see Q&A to see where to link the github) and parsed via the useUIData util file. This is done in the UIView component, and the clean UIData (in the format of the [Entry Data Structure](?path=/docs/general-components-reactedm-developer-notes-entry-data-structure--docs)) is given to UICanvas, where each widget is rendered based off of each entry.

## Q&A

### How do I change the github repo where UI files are fetched?

It is under `ReactEDM/utils/useUIData.ts` in this line:

```
const UIContent = await fetchFile(fileName, "nicholasmanha", `AD_${fileType.toUpperCase()}_files`);
```

The first argument is the file to be retrieved, the second argument is the name of the owner of the github repo, and the third argument is the name of the repo itself.

### Difference between a style widget and a device widget?

A style widget is a widget that doesn't directly depend on a PV. Examples of this are simple shapes, like rectangles, the display widget, and the text widget (the text widget can technically reference a PV via dynamic attributes [see [Entry Data Structure](?path=/docs/general-components-reactedm-developer-notes-entry-data-structure--docs) for more info] although it doesn't directly need a PV to operate correctly)

A device widget is, you guessed it, a widget that is dependent on a PV. (Like a readback value)

### How would I go about supporting a new widget?

First, you need to make your widget in the widgets folder. This component should receive only the specific data it needs to function, not raw EPICS objects. It should not perform any data processing or extraction. For example, when creating a button widget, don't pass the entire EPICS button object as a prop. Instead, extract the necessary attributes from that object beforehand and pass only those specific values to the component.

Next, determine if your new widget is a [style widget or a device widget](#difference-between-a-style-widget-and-a-device-widget). Style widgets go in `ReactEDM/StyleRender` & device widgets go in `ReactEDM/DeviceRender`. To add a new widget, create a case for it in the appropriate switch statement and return your component. If your widget is a style widget, unfortunately you'll have to additionally add a case in `ReactEDM/UICanvas` so that it properly goes to StyleRender for your var_type.

Finally, if your widget needs any additional parameters, make sure to add them to `ReactEDM/types/UIEntry`.

### How would I go about supporting a new file format?

First, you need to write a parser for it in the utils folder. The final format the parser should output should be the [Entry Data Structure](?path=/docs/general-components-reactedm-developer-notes-entry-data-structure--docs). Next, in order to actually get these files, you need to add the case for your file extension to use your parser in `ReactEDM/utils/useUIData.ts`:

```javascript
switch (fileType.toLowerCase()) {
  case "bob":
    parsedData = parseXMLToEntries(UIContent);
    break;
  case "adl":
    parsedData = ADLParser(parseCustomFormat(UIContent));
    break;
  default:
    parsedData = [];
    break;
}
```
Optionally, you may need to change the github repo from which your fiels are being fetched, refer to [How do I change the github repo where UI files are fetched?](#how-do-i-change-the-github-repo-where-ui-files-are-fetched)
import { Entry } from "../types/UIEntry";

export function parseXMLToEntries(xmlString: string): Entry[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const entries: Entry[] = [];

    // Parse the display element itself
    const displayElement = xmlDoc.querySelector('display');
    if (displayElement) {
        const displayEntry: Entry = {
            var_type: "display",
            location: {
                x: parseInt(getElementText(displayElement, 'x') || '0'),
                y: parseInt(getElementText(displayElement, 'y') || '0')
            },
            size: {
                width: parseInt(getElementText(displayElement, 'width') || '0'),
                height: parseInt(getElementText(displayElement, 'height') || '-1')
            },
            name: "display"
        };
        entries.push(displayEntry);
    }

    // Parse all top-level widgets
    const topLevelWidgets = xmlDoc.querySelectorAll('display > widget');
    topLevelWidgets.forEach(widget => {
        const type = widget.getAttribute('type');
        if (!type) return;

        const entry = parseWidget(widget, type, 0, 0); // Pass 0,0 as parent offset for top-level widgets
        if (entry) {
            entries.push(entry);
        }
    });

    return entries;
}

function parseWidget(widget: Element, type: string, parentX: number = 0, parentY: number = 0): Entry | null {
    const name = getElementText(widget, 'name') || '';
    const x = parseInt(getElementText(widget, 'x') || '0');
    const y = parseInt(getElementText(widget, 'y') || '0');
    const width = parseInt(getElementText(widget, 'width') || '100');
    const height = parseInt(getElementText(widget, 'height') || '20');

    // For child widgets, add parent coordinates to get absolute position
    const absoluteX = x + parentX;
    const absoluteY = y + parentY;

    const baseEntry = {
        location: { x: absoluteX, y: absoluteY },
        size: { width, height }
    };

    switch (type) {
        case 'rectangle':
            return {
                var_type: "rectangle",
                ...baseEntry,
                name: "rectangle"
            };

        case 'group':
            // Parse child widgets
            const childWidgets = Array.from(widget.children).filter(child =>
                child.tagName === 'widget'
            );

            const children: Entry[] = [];
            childWidgets.forEach(childWidget => {
                const childType = childWidget.getAttribute('type');
                if (childType) {
                    // Check if child has its own x/y coordinates
                    const childX = getElementText(childWidget as Element, 'x');
                    const childY = getElementText(childWidget as Element, 'y');

                    // If child doesn't have x/y, set them to 0 (not parent coordinates)
                    if (!childX) {
                        const xElement = (childWidget as Element).ownerDocument.createElement('x');
                        xElement.textContent = '0'; // Changed from x.toString() to '0'
                        (childWidget as Element).appendChild(xElement);
                    }
                    if (!childY) {
                        const yElement = (childWidget as Element).ownerDocument.createElement('y');
                        yElement.textContent = '0'; // Changed from y.toString() to '0'
                        (childWidget as Element).appendChild(yElement);
                    }

                    // Pass the current widget's absolute position as parent offset for children
                    const childEntry = parseWidget(childWidget as Element, childType, absoluteX, absoluteY);
                    if (childEntry) {
                        children.push(childEntry);
                    }
                }
            });

            return {
                var_type: "composite",
                ...baseEntry,
                name: "",
                children: children
            };

        case 'embedded':
            const file = getElementText(widget, 'file') || '';
            return {
                var_type: "composite",
                ...baseEntry,
                name: "",
                comp_file: file
            };

        case 'label':
            const text = getElementText(widget, 'text') || '';
            const horizontalAlignment = getElementText(widget, 'horizontal_alignment');

            const labelEntry: Entry = {
                var_type: "text",
                ...baseEntry,
                name: text
            };

            // Map horizontal alignment values
            if (horizontalAlignment === '1') {
                labelEntry.align = "horiz. centered";
            } else if (horizontalAlignment === '2') {
                labelEntry.align = "horiz. right";
            }

            // Handle rules for dynamic attributes
            const rule = widget.querySelector('rule');
            if (rule) {
                const ruleName = rule.getAttribute('name');
                const pvName = getElementText(rule, 'pv_name');

                if (ruleName && pvName) {
                    // Map rule names to vis values and set appropriate calc values
                    if (ruleName === 'vis_if_zero') {
                        labelEntry.dynamic_attribute = {
                            vis: "if zero",
                            calc: "0", // Default calc value
                            chan: pvName
                        };
                    } else if (ruleName === 'vis_if_not_zero') {
                        labelEntry.dynamic_attribute = {
                            vis: "if not zero",
                            calc: "0",
                            chan: pvName
                        };
                    }
                }
            }

            return labelEntry;

        case 'textupdate':
            const pvName = getElementText(widget, 'pv_name') || '';
            return {
                var_type: "update",
                ...baseEntry,
                name: pvName
            };
        case 'combo':
            const comboPvName = getElementText(widget, 'pv_name') || '';
            return {
                var_type: "menu",
                ...baseEntry,
                name: comboPvName
            };
        case 'action_button':
            const buttonPvName = getElementText(widget, 'pv_name') || '';
            const buttonText = getElementText(widget, 'text') || '';

            // Check if this has open_display actions (related display) or write_pv actions (button)
            const openDisplayActions = widget.querySelectorAll('action[type="open_display"]');
            const writePvAction = widget.querySelector('action[type="write_pv"]');

            if (openDisplayActions.length > 0) {
                // This is a related display
                const displays: { label: string; file: string; args: Record<string, string> }[] = [];

                openDisplayActions.forEach(action => {
                    const description = getElementText(action, 'description') || '';
                    const file = getElementText(action, 'file') || '';

                    // Convert .opi extension to .adl
                    // const adlFile = file.replace(/\.opi$/, '.adl');

                    // Extract macros
                    const args: Record<string, string> = {
                        "P": "$(P)" // Default P macro
                    };

                    const macrosElement = action.querySelector('macros');
                    if (macrosElement) {
                        Array.from(macrosElement.children).forEach(macro => {
                            const key = macro.tagName;
                            const value = macro.textContent?.trim() || '';
                            args[key] = value;
                        });
                    }

                    displays.push({
                        label: description,
                        file: file,
                        args: args
                    });
                });

                const relatedDisplayEntry: any = {
                    var_type: "related display",
                    ...baseEntry,
                    name: "related display",
                    display: displays
                };

                // Add label if button has text
                if (buttonText) {
                    relatedDisplayEntry.label = buttonText;
                }

                return relatedDisplayEntry;
            } else if (writePvAction) {
                // This is a regular button
                const pressMsg = getElementText(writePvAction, 'value') || '';

                return {
                    var_type: "button",
                    ...baseEntry,
                    name: buttonPvName,
                    label: buttonText,
                    press_msg: pressMsg
                };
            }

            // Fallback for unknown action types
            return {
                var_type: "button",
                ...baseEntry,
                name: buttonPvName || "action_button",
                label: buttonText
            };
        case 'textentry':
            const entryPvName = getElementText(widget, 'pv_name') || '';
            const format = getElementText(widget, 'format');

            const entryEntry: Entry = {
                var_type: "entry",
                ...baseEntry,
                name: entryPvName
            };

            // Map format values - format "6" appears to be string format
            if (format === '6') {
                entryEntry.format = "string";
            }

            return entryEntry;
        default:
            // For unknown widget types, create a generic entry
            return {
                var_type: type,
                ...baseEntry,
                name: name
            };
    }
}

function getElementText(parent: Element, tagName: string): string | null {
    // Use '> tagName' to only select direct children
    const element = parent.querySelector(`:scope > ${tagName}`);
    return element ? element.textContent?.trim() || null : null;
}
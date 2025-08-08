import { Entry } from "../types/UIEntry";

export function ADLParser(config: any[]): Entry[] {
    const entries: Entry[] = [];
    config.forEach((item: any) => {
        const itemType = Object.keys(item)[0];

        switch (itemType) {
            case "text entry": {
                const textEntry = item["text entry"];
                const text_entry: Entry = {
                    var_type: "entry",
                    location: { x: textEntry.object.x, y: textEntry.object.y },
                    size: { width: textEntry.object.width, height: textEntry.object.height },
                    name: textEntry.control.chan
                };
                if (textEntry["format"]) {
                    text_entry.format = textEntry["format"];
                }
                entries.push(text_entry);
                break;
            }

            case "text update": {
                const textUpdate = item["text update"];
                entries.push({
                    var_type: "update",
                    location: { x: textUpdate.object.x, y: textUpdate.object.y },
                    size: { width: textUpdate.object.width, height: textUpdate.object.height },
                    name: textUpdate.monitor.chan
                });
                break;
            }

            case "text": {
                const text = item["text"];
                const txt: Entry = {
                    var_type: "text",
                    location: { x: text.object.x, y: text.object.y },
                    size: { width: text.object.width, height: text.object.height },
                    name: text.textix
                };
                if(text["align"]) {
                    txt.align = text["align"]
                }
                if (text["dynamic attribute"]) {
                    txt.dynamic_attribute = text["dynamic attribute"]
                }

                entries.push(txt);
                break;
            }

            case "rectangle":{
                const rect = item["rectangle"];
                entries.push({
                    var_type: "rectangle",
                    location: { x: rect.object.x, y: rect.object.y },
                    size: { width: rect.object.width, height: rect.object.height },
                    name: "rectangle"
                });
                break;
            }

            case "display": {
                const text = item["display"];
                entries.push({
                    var_type: "display",
                    location: { x: text.object.x, y: text.object.y },
                    size: { width: text.object.width, height: text.object.height },
                    name: "display"
                });
                break;
            }

            case "menu": {
                const menu = item["menu"];
                entries.push({
                    var_type: "menu",
                    location: { x: menu.object.x, y: menu.object.y },
                    size: { width: menu.object.width, height: menu.object.height },
                    name: menu.control.chan
                });
                break;
            }

            case "message button": {
                const btn = item["message button"];
                entries.push({
                    var_type: "button",
                    location: { x: btn.object.x, y: btn.object.y },
                    size: { width: btn.object.width, height: btn.object.height },
                    name: btn.control.chan,
                    label: btn.label,
                    press_msg: btn.press_msg
                });
                break;
            }

            case "related display": {
                const rel = item["related display"];
                const relDisplay: Entry = {
                    var_type: "related display",
                    location: { x: rel.object.x, y: rel.object.y },
                    size: { width: rel.object.width, height: rel.object.height },
                    name: "",
                };
                if (rel.label) {
                    relDisplay.label = rel.label;
                }
                const displayEntries = [];
                for (const key in rel) {
                    if (key.startsWith("display")) {
                        const displayItem = rel[key];
                        displayEntries.push({
                            label: displayItem.label || "",
                            file: displayItem.name || "",
                            args: displayItem.args || ""
                        });
                    }
                }

                if (displayEntries.length > 0) {
                    relDisplay.display = displayEntries;
                }
                entries.push(relDisplay);
                break;
            }

            case "composite": {
                const comp = item["composite"];
                const compositeEntry: Entry = {
                    var_type: "composite",
                    location: { x: comp.object.x, y: comp.object.y },
                    size: { width: comp.object.width, height: comp.object.height },
                    name: comp["composite name"],
                };
                if (comp["composite file"]) {
                    compositeEntry.comp_file = comp["composite file"];
                }
                if (comp.children) {
                    compositeEntry.children = ADLParser(comp.children);
                }
                entries.push(compositeEntry);
                break;
            }

            // No default case needed as we only want to process known types
        }
    });

    return entries;
}
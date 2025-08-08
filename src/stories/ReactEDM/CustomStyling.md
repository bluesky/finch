ReactEDM supports simple custom styling via TailWind classes. Define custom variants in `ReactEDM/styles.json` in this simple data structure:

```javascript
{
    "variants": {
        "variant1": {
            "button": [
                "bg-[#00B5E2]"
            ],
            "related_disp": [
                "bg-[#00B5E2]"
            ],
            "input_num": [
                "bg-[#C0F0FF] rounded-[0.15em]"
            ],
            "input_enum": [
                "bg-white",
                "text-center"
            ],
            "input_text": [
                "bg-white",
                "rounded-[0.15em]"
            ],
            "text_update": [
                "text-[#006BA6]"
            ],
            "text": [
                "text-black"
            ],
            "rectangle": [
                "border-[#B1B3B3] border-[0.07em]"
            ],
            "display": [
                "bg-[#E9E9E9]"
            ]
        }
    }
}
```

To make a new variant, simply add a new variant in the `variants` object, and for each widget, add whatever tailwind classes you like. These can be entered on the same line or added individually as separate array elements.

## Note: Use `em` units exclusively for all custom styling. This ensures the component can be easily resized when applied.
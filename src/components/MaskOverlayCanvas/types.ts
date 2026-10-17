/** Shared types for {@link MaskOverlayCanvas} and its sub-components. */

/** A segmentation class: which label value it corresponds to, and how it should be drawn. */
export type MaskClass = {
    /** Integer value in `labels` (or `MaskLayer.classId`) that this class represents. `0` is background by convention. */
    id: number;
    /** Human-readable name shown in the legend and the hover tooltip. Defaults to `Class {id}`. */
    label?: string;
    /** Hex color. Defaults to an entry from `CLASS_PALETTE` chosen by position. */
    color?: string;
    /** Whether the class is drawn. Setting this on any class makes visibility a controlled prop. */
    visible?: boolean;
    /** Per-class opacity multiplier, 0–1, applied on top of the global `maskOpacity`. Defaults to `1`. */
    opacity?: number;
};

/** A single-class binary mask, as an alternative to a combined label array. */
export type MaskLayer = {
    /** The class this mask belongs to; matched against `MaskClass.id`. */
    classId: number;
    /** Flat row-major `height × width` array. Any non-zero entry is treated as set. */
    data: ArrayLike<number>;
};

/** What sits under the pointer, reported by `onHover` and `onClick`. */
export type MaskPickInfo = {
    /** X coordinate in image pixel space. */
    x: number;
    /** Y coordinate in image pixel space. */
    y: number;
    /** Class id under the pointer, or `null` over background or outside any mask. */
    classId: number | null;
    /** Label of that class, when one is defined. */
    label?: string;
};

/** A {@link MaskClass} with every optional field filled in. Produced internally before rasterizing. */
export type ResolvedMaskClass = Required<Omit<MaskClass, 'label'>> & { label: string };

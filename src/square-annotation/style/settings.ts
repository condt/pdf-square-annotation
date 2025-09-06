/**
 * 矩形の最小サイズ
 */
export const SQUARE_MIN_SIZE = 10;
export const RESIZE_HANDLER_SIZE = "10px";
export const RESIZE_HANDLER_POS = "-3px";
export const RESIZE_HANDLER_BACK_COLOR = "#4dbadb";

/** unused */
export const RESIZE_HANDLER_BORDER = "3px solid #3274BA";

/**
 * マウスカーソルのスタイル
 */
export const COURSOR_STYLE = {
    AUTO: "auto",
    CAN_CREATE: "crosshair",
    RESIZABLE: "none",
    SELECTABLE: "default",
    MOVABLE: "move",
};

export const CUSTOM_ANNOTATION_CLASSES = ["square-annotation"];
export const CUSTOM_ANNOTATION_CLASSES2 = ["square-annotation"] as const;
export type CustomAnnotationClass = (typeof CUSTOM_ANNOTATION_CLASSES2)[number];

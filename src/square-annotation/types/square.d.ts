import { SupportStyle } from "../style/square-style.js";

export type Mode = "preview" | "edit";

/**
 * * "ready": 作成と選択が可能な状態(選択しないとresize、移動、削除はできない)
 * * "select-square": 矩形を選択して編集モードになっている状態(作成も可)
 */
export type EditingState =
    | "ready"
    | "select-square"
    | "resize-ready"
    | "move-ready"
    | "create-dragging"
    | "resize-dragging"
    | "move-dragging";

export type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type Square = string | HTMLElement;

export type StackOperation = "create" | "modify" | "delete";

export interface ExportData {
    squares: ExportSquareData[];
}

export interface SquareData extends SquareBase {
    /** square要素のid */
    id: string;
}

export interface ExportSquareData extends SquareBase {
    /** square要素のid */
    id: number;
}

export interface SquareBase {
    /** page番号 */
    pageNumber: number;
    /** スタイルなどのプロパティ */
    props?: SquareProps;
}

/**
 * 座標とサイズは全てpercent表示
 */
export interface SquareProps {
    x: number;
    y: number;
    width: number;
    height: number;
    style: SupportStyle;
}

export interface SquareOperation extends SquareData {
    operation: StackOperation;
}

export interface UndoStackTask {
    stackId: number;
    squares: SquareOperation[];
}

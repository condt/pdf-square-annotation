import { getSquareElement } from "../util";
import { SQUARE_BACK_COLOR, SQUARE_LOCKED_BACK_COLOR, SQUARE_SELECTED_BORDER } from "./settings";

/**
 * 矩形の状態
 */
export type SquareState = "normal" | "locked";

export const SUPPORT_STYLE = ["border", "backgroundColor"] as const;
export type SupportStyleKey = (typeof SUPPORT_STYLE)[number];

export type SupportStyle = {
    [key in SupportStyleKey]?: string;
};

/**
 * デフォルトの矩形のスタイル
 */
const DEFAULT_STYLE: SupportStyle = {
    border: null,
    backgroundColor: SQUARE_BACK_COLOR,
};

/**
 * 選択中の矩形のスタイル
 */
const SELECT_STYLE: SupportStyle = {
    border: SQUARE_SELECTED_BORDER,
};

/**
 * lockされている矩形のスタイル
 */
const LOCKED_STYLE: SupportStyle = {
    border: null,
    backgroundColor: SQUARE_LOCKED_BACK_COLOR,
};

/**
 * ## 指定stateのstyle propsを返す
 * プロパティがない場合は既存値を返す  \
 * そのためstyleを指定しなければ全プロパティをデフォルト値で上書きする
 */
const getStyle = (state: SquareState, style?: SupportStyle): SupportStyle => {
    if (style == null) {
        if (state === "normal") return { ...DEFAULT_STYLE };
        if (state === "locked") return { ...LOCKED_STYLE };
    }

    const values = {};
    for (const propName of SUPPORT_STYLE) {
        if (Object.hasOwn(style, propName)) {
            values[propName] = style[propName];
        } else {
            // デフォルトを適用
            if (state === "normal") values[propName] = DEFAULT_STYLE[propName];
            if (state === "locked") values[propName] = LOCKED_STYLE[propName];
        }
    }
    return values as SupportStyle;
};

/**
 * 矩形スタイルを設定する
 */
export const setSquareStyle = (square: string | HTMLElement, state: SquareState, isSelected = false) => {
    const { squareElement } = getSquareElement(square);
    if (squareElement == null) {
        return;
    }
    const style = getStyle(state);
    __setSquareStyle(squareElement, style);
    if (isSelected) {
        __setSquareStyle(squareElement, SELECT_STYLE);
    }
};

/**
 * 選択状態の矩形スタイルを設定する
 */
export const setSelectSquareStyle = (square: string | HTMLElement) => {
    const { squareElement } = getSquareElement(square);
    if (squareElement == null) {
        return;
    }

    __setSquareStyle(squareElement, SELECT_STYLE);
};

/**
 * 矩形スタイルを設定する
 */
const __setSquareStyle = (squareElement: HTMLElement, style: SupportStyle) => {
    if (squareElement == null) {
        return;
    }
    // set style
    for (const [key, value] of Object.entries(style)) {
        squareElement.style[key] = value;
    }
};

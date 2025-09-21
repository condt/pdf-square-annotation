import { Context } from "@/utils/context";
import { getSquareElement } from "../util";

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
 * ## 指定stateのstyle propsを返す
 * プロパティがない場合は既存値を返す  \
 * そのためstyleを指定しなければ全プロパティをデフォルト値で上書きする
 */
const getStyle = (state: SquareState, style?: SupportStyle): SupportStyle => {
    const config = Context.config.getConfig();

    if (style == null) {
        if (state === "normal") return { ...config.squareAnnotation.normalStyle };
        if (state === "locked") return { ...config.squareAnnotation.lockedStyle };
    }

    const values = {};
    for (const propName of SUPPORT_STYLE) {
        if (Object.hasOwn(style, propName)) {
            values[propName] = style[propName];
        } else {
            // デフォルトを適用
            if (state === "normal") values[propName] = config.squareAnnotation.normalStyle[propName];
            if (state === "locked") values[propName] = config.squareAnnotation.lockedStyle[propName];
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
    console.log("style: ", style);
    __setSquareStyle(squareElement, style);
    if (isSelected) {
        const config = Context.config.getConfig();
        console.log("config.squareAnnotation.selectedStyle: ", config.squareAnnotation.selectedStyle);
        __setSquareStyle(squareElement, config.squareAnnotation.selectedStyle);
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

    const config = Context.config.getConfig();
    __setSquareStyle(squareElement, config.squareAnnotation.selectedStyle);
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

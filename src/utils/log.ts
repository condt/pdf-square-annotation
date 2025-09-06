/* eslint-disable no-console */
import { Context } from "./context.js";

const hasColorChecker = (text: string | any) => {
    if (typeof text !== "string") return false;
    let color = null;
    let backColor = null;
    const texts = text.split(";");
    texts.forEach((t) => {
        const tt = t.trim().replace(" ", "");
        if (tt.startsWith("color:")) {
            color = tt.split("color:")[1];
        } else if (tt.startsWith("background-color:")) {
            backColor = tt.split("background-color:")[1];
        }
    });
    if (color != null || backColor != null) {
        // どちらかでも指定されている場合、colorありとする
        return true;
    }
    return false;
};

/**
 * debug時のみ出力する
 */
const debug = (...contents: any[]) => {
    if (Context.isDebug()) {
        // debug時だけログ出力する
        if (contents.length > 1) {
            const hasColor = hasColorChecker(contents[contents.length - 1]);
            if (hasColor) {
                // 色つき
                const lines = contents.map((c, i) => {
                    if (i === contents.length - 1) {
                        // 末尾
                        return c;
                    }
                    // 末尾以外
                    return `%c` + c;
                });
                console.trace(...lines);
                return;
            }
        }
        console.trace(...contents);
    }
};

/**
 * 常に出力する
 */
const info = (...contents: any[]) => {
    console.log(...contents);
};

/**
 * 常に出力する
 */
const warn = (...contents: any[]) => {
    console.warn(...contents);
};

/**
 * 常に出力する
 */
const error = (...contents: any[]) => {
    console.error(...contents);
};

export const log = {
    debug,
    info,
    warn,
    error,
};

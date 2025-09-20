import { SquareState } from "@/square-annotation/style/square-style";
import { SquareProps } from "@/square-annotation/types/square";

type DispatchType = "change-square" | "dblclick-square" | "mousedown-square";
type ChangeSquareType = "create" | "delete" | "resize" | "move";
type ChangeSquareTrigger = "operation" | "undo" | "redo";

type DispatchDetail<T> = T extends "change-square"
    ? ChangeSquareEvent
    : T extends "dblclick-square"
      ? DoubleClickSquareEvent
      : T extends "mousedown-square"
        ? MouseDownSquareEvent
        : {};

export interface ChangeSquareEvent {
    type: ChangeSquareType;
    trigger: ChangeSquareTrigger;
    id: number;
    pageNumber: number;
    props?: SquareProps;
}

export interface DoubleClickSquareEvent {
    id: number;
    state: SquareState;
}

export interface MouseDownSquareEvent {
    id: number;
    state: SquareState;
}

/**
 * parentにeventを送信する
 */
const dispatchEvent = <T extends DispatchType>(type: T, detail: DispatchDetail<T>) => {
    const event = new CustomEvent(type, {
        cancelable: true,
        bubbles: true,
        detail,
    });
    window.parent.dispatchEvent(event);
};

const deepCopy = (data: any) => {
    return JSON.parse(JSON.stringify(data));
};

type ContentType = "application/json" | "text/plain";

/**
 * 指定した内容をファイルとしてダウンロードする
 */
const download = (content: object | string, filename: string, type: ContentType) => {
    const c = typeof content === "string" ? content : JSON.stringify(content);
    const blob = new Blob([c], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
};

/**
 * ファイルを選択する
 */
const selectFile = async (accept: string = "*") => {
    return new Promise<string>((resolve, reject) => {
        const i = <HTMLInputElement>document.createElement("input");
        i.setAttribute("type", "file");
        i.setAttribute("accept", accept);
        i.click();
        i.onchange = async (e: any) => {
            const files = e.target.files as FileList;
            if (files.length === 0) {
                reject("cancel");
                return;
            }
            const file = files[0];
            const text = await file.text();
            resolve(text);
        };
        i.oncancel = () => {
            reject("cancel");
        };
    });
};

export const utils = {
    dispatchEvent,
    deepCopy,
    download,
    selectFile,
};

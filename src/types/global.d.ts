import { SquareData } from "../square-annotation/types/square.js";
import { AppConfigType } from "./app-config.js";

export {};

declare global {
    /**
     * CSS Properties
     */
    type CSSStyle = Partial<CSSStyleDeclaration>;
}

/**
 * public API
 */
declare global {
    /**
     * ## アプリ設定を指定する
     * iframeのクエリパラメータに`config=true`を指定すると有効になる
     */
    function setAppConfig(config: AppConfigType): void;

    /**
     * ## PDFファイルを開く
     * @returns 読み込みが完了したら解決する
     */
    function openPdf(data: Blob | string): Promise<void>;

    /**
     * ## アノテーションを描画する
     */
    function setAnnotations(data: SquareData[]): void;

    function undo(): void;
    function redo(): void;
}

import { ExportData } from "../square-annotation/types/square.js";
import { AppConfigType } from "./app-config.js";
import { LockAnnotationsArgs } from "./lock.js";

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
    function setAnnotations(data: ExportData): void;

    /**
     * ## アノテーションを出力する
     */
    function getAnnotations(): ExportData;

    function undo(): void;
    function redo(): void;

    /**
     * 矩形データをJSONファイルとしてダウンロードする
     */
    function exportAnnotations(): void;

    /**
     * ファイルを選択して矩形データをインポートする
     */
    function importAnnotations(): void;

    /**
     * 矩形の新規作成を禁止する
     */
    function disallowCreateNew(): void;

    /**
     * 矩形の新規作成を許可する
     */
    function allowCreateNew(): void;

    /**
     * 指定したアノテーションをlock状態にする
     */
    function lockAnnotations(args: LockAnnotationsArgs): void;
}

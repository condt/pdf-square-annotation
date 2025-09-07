import { App } from "./app/app.js";
import { AppConfig } from "./app/config.js";
import { PDFManager } from "./app/pdf-manager.js";
import { SquareAnnotation } from "./square-annotation/core.js";
import { Context } from "./utils/context.js";
import { log } from "./utils/log.js";
import { AppQueryParameters } from "./utils/parameters.js";

import type { ExportData } from "./square-annotation/types/square.js";
import type { AppConfigType } from "./types/app-config.js";

Context.params = new AppQueryParameters();
Context.config = new AppConfig();
Context.app = new App();

/**
 * API: PDFの読み込むが完了したらPromiseが完了する
 */
window.openPdf = async (data: Blob | string) => {
    return await Context.app.open(data);
};

/**
 * API: アプリ設定を更新する
 */
window.setAppConfig = (config: AppConfigType) => {
    Context.config.setConfig(config);
    log.debug("set config: ", Context.config.config);
};

// @ts-ignore API
window.startEdit = () => {
    Context.squareAnnotation.setEditMode();
};

// @ts-ignore API
window.startPreview = () => {
    Context.squareAnnotation.setPreviewMode();
};

window.undo = () => {
    Context.squareAnnotation.undo();
};

window.redo = () => {
    Context.squareAnnotation.redo();
};

window.getAnnotations = () => {
    return Context.squareAnnotation.getAnnotations();
};

/**
 * API: アノテーションを描画する
 */
window.setAnnotations = (data: ExportData) => {
    Context.squareAnnotation.setAnnotations(data);
};

/**
 * 矩形データをJSONファイルとしてダウンロードする
 */
window.exportAnnotations = () => {
    Context.squareAnnotation.downloadData();
};

/**
 * ファイルを選択して矩形データをインポートする
 */
window.importAnnotations = async () => {
    await Context.squareAnnotation.importData();
};

window.addEventListener("webviewerloaded", async (event: any) => {
    log.debug("webviewerloaded");

    const contentWindow = event?.detail?.source;
    const doc = contentWindow.document;
    const PDFViewerApplication = contentWindow.PDFViewerApplication;
    const pdfjsLib = contentWindow.pdfjsLib;
    await PDFViewerApplication.initializedPromise;

    // 初期化完了を待つ
    const pdfjs = await PDFViewerApplication.pdfLoadingTask.promise;
    Context.app.successOpen();

    // ページがレンダリングされた時に各ページごとに実行される
    // 一度レンダリングしたページでも離れてdestroyされると、再度スクロール時にレンダリングされる
    PDFViewerApplication.eventBus.on(
        "annotationeditorlayerrendered",
        async (event: { pageNumber: number; source: any }) => {
            log.debug(`annotationeditorlayerrendered..... ${event.pageNumber}`, event);

            // レンダリングする
            Context.squareAnnotation.onRenderEvent(event.pageNumber, event.source);
        }
    );

    Context.document = doc;
    Context.window = contentWindow;
    Context.PDFViewerApplication = PDFViewerApplication;
    Context.pdfjs = pdfjs;
    Context.pdfjsLib = pdfjsLib;
    Context.pagesCount = PDFViewerApplication.pagesCount;

    Context.pdfManager = new PDFManager();
    Context.squareAnnotation = new SquareAnnotation();

    log.debug("初期化完了");
});

import { SquareAnnotation } from "../square-annotation/core.js";
import { PDFManager } from "../app/pdf-manager.js";
import { App } from "../app/app.js";
import { AppQueryParameters } from "./parameters.js";
import { AppConfig } from "../app/config.js";

export class Context {
    /** PDF.jsのwindow */
    static window: Window;
    /** PDF.jsのdocument */
    static document: Document;
    static PDFViewerApplication: any;
    static pdfjs: any;
    static pdfjsLib: any;

    static pagesCount: number;

    static debug = null;

    static pdfManager: PDFManager = null;
    static squareAnnotation: SquareAnnotation = null;

    static app: App;
    static params: AppQueryParameters;
    static config: AppConfig;

    static isDebug() {
        if (Context.debug == null) {
            if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
                Context.debug = true;
            } else {
                if (Context.params == null) throw "params is null.";
                Context.debug = Context.params.debug;
            }
        }
        return Context.debug;
    }
}

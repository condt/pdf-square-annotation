import { Context } from "../utils/context.js";
import { log } from "../utils/log.js";
import { EditStateManager } from "./edit-state-manager.js";
import { COURSOR_STYLE } from "./style/settings.js";
import { changeToolbarSelected } from "./style/toolbar.js";

import type { Mode, SquareData, SquareProps, UndoStackTask } from "./types/square.js";

export abstract class SquareAnnotationBase {
    static stackId = 1;

    editStateManager: EditStateManager;

    /** stackの現在位置 */
    stackIndex = -1;

    mode: Mode = "preview";

    /** 初期化時の最新の全矩形の座標・スタイルなどの情報 */
    protected initialSquares: SquareData[] = [];

    /** 最新の全矩形の座標・スタイルなどの情報 */
    protected currentSquares: SquareData[] = [];

    /** undo stacks */
    undoStack: UndoStackTask[] = [];

    constructor() {
        this.editStateManager = new EditStateManager();
    }

    /**
     * モードを切り替える
     */
    toggleMode() {
        if (this.mode === "edit") {
            // previewモードにする
            this.setPreviewMode();
        } else if (this.mode === "preview") {
            // 編集モードにする
            this.setEditMode();
        }
    }

    setEditMode() {
        if (this.mode === "edit") return;
        const currentMode = this.mode;

        try {
            this.mode = "edit";

            // NOTE: ここでreadyにするので、ダブルクリックで編集モードにした場合はsetEditMode実行後にsetSelectStateする
            this.editStateManager.setReadyState();

            this.renderAllPages();
            this.setSquareDoubleClick();
        } catch (err) {
            // エラー時はモードを戻す
            this.mode = currentMode;
            log.error(err);
            log.error("restore mode: ", currentMode);
        }

        // change toolbar button style
        changeToolbarSelected(this.mode);
    }

    setPreviewMode() {
        if (this.mode === "preview") return;
        const currentMode = this.mode;

        try {
            this.mode = "preview";
            this.unselectSquare(this.editStateManager.selectSquareId);

            this.renderAllPages();
            this.setSquareDoubleClick();
        } catch (err) {
            // エラー時はモードを戻す
            this.mode = currentMode;
            log.error(err);
            log.error("restore mode: ", currentMode);
        }

        // change toolbar button style
        changeToolbarSelected(this.mode);
    }

    renderAllPages() {
        // レイヤーを更新
        Context.pdfManager.getPages().forEach((page) => {
            log.debug(`==render page: ${page.getAttribute("data-page-number")}==`);
            this.renderAnnotationLayer(Context.pdfManager.getAnnotationLayer(page));
            this.renderTextLayer(Context.pdfManager.getTextLayer(page));
        });

        // 矩形を更新
        this.currentSquares.forEach((square) => this.renderSquare(square));
    }

    /**
     * スクロール時や拡大率変更時に描画を行う
     */
    onRenderEvent(pageNumber: number, source?: { annotationLayer: { div: HTMLElement } }) {
        const page = Context.pdfManager.getPage(pageNumber);
        const annotationLayer: HTMLElement = Context.pdfManager.getAnnotationLayer(page);
        const textLayer: HTMLElement = Context.pdfManager.getTextLayer(page);
        if (annotationLayer == null) {
            log.debug(`P${pageNumber} annotation layer is null`, "color: yellow");
            return;
        }
        if (textLayer == null) {
            log.debug(`P${pageNumber} text layer is null`, "color: yellow");
            return;
        }

        // 消えている矩形を追加
        const pageSquares = this.getSquares(pageNumber);
        const pageSquareElems = annotationLayer.querySelectorAll(".square-annotation");
        if (pageSquares.length > 0 && pageSquareElems.length === 0) {
            // スクロールで矩形が消えていたら再描画する
            log.debug("描画します: ", pageNumber);
            pageSquares.forEach((square) => {
                const squareElement = this.createSquareSection(square.id, annotationLayer, square.props);
                if (this.editStateManager.isSelect(square.id)) {
                    // 再描画した矩形が選択状態の場合は選択状態スタイルにする
                    this.selectSquare(squareElement);
                }
            });
        }

        // 矩形を描画
        this.renderPageSquares(pageNumber);

        // レイヤーを描画
        this.renderAnnotationLayer(annotationLayer);
        this.renderTextLayer(textLayer);
    }

    /**
     * 指定ページの矩形のクリックイベントを有効/無効にする
     */
    protected renderPageSquares(pageNumber: number) {
        this.getSquares(pageNumber).forEach((square) => this.renderSquare(square));
    }

    /**
     * 矩形のクリックイベントを有効/無効にする
     */
    protected renderSquare(square: SquareData) {
        const squareElement = Context.document.getElementById(square.id);
        if (squareElement == null) {
            log.debug(`square element not found: ${square.id}`);
            return;
        }

        this.setSquareEvent(squareElement);
    }

    /**
     * 指定ページのAnnotationLayerを描画する
     */
    protected renderAnnotationLayer(layer: HTMLElement) {
        if (layer == null) {
            log.debug(`annotation layer not found`);
            return;
        }

        layer.style.display = "flex !important";
        layer.style.width = "100%";
        layer.style.height = "100%";
        layer.removeAttribute("hidden");

        // FIX: リンククリック時に矩形作成がおかしくなるのを修正
        this.setAnnotationLayerPropagation(layer);

        if (this.mode === "edit") {
            // ====================編集モード====================
            layer.style.cursor = this.editStateManager.allowCreateNew ? COURSOR_STYLE.CAN_CREATE : null;
            layer.style.pointerEvents = "auto";
            this.enableEditSquare(layer);
        } else {
            // ====================プレビューモード====================
            layer.style.cursor = null;
            layer.style.pointerEvents = "none";
            layer.onmousedown = null;
            layer.onmousemove = null;
            layer.onmouseup = null;
            layer.onmouseleave = null;
        }
    }

    /**
     * 指定ページのTextLayerを描画する
     */
    protected renderTextLayer(layer: HTMLElement) {
        if (layer == null) {
            log.debug(`text layer not found`);
            return;
        }

        if (this.mode === "edit") {
            // ====================編集モード====================
            layer.style.pointerEvents = "none";
        } else {
            // ====================プレビューモード====================
            layer.style.pointerEvents = "auto";
        }
    }

    /**
     * 指定ページの矩形を全て取得する
     */
    protected getSquares(pageNumber: number) {
        return this.currentSquares.filter((s) => s.pageNumber === pageNumber);
    }

    /**
     * for debug
     */
    showCurrentSquares() {
        log.debug("==currentSquares==");
        log.debug(this.currentSquares);
        log.debug("==undoStack==");
        log.debug(this.undoStack);
    }

    /**
     * 矩形の作成、リサイズを可能にする
     */
    abstract enableEditSquare(layer: HTMLElement): void;

    /**
     * ダブルクリックで矩形編集モードに入れるようにする
     */
    abstract setSquareDoubleClick(): void;

    /**
     * ### 矩形を要素を新しく作成する
     * クリックイベントも設定する
     */
    abstract createSquareSection(id: string, annotationLayer: HTMLElement, style?: SquareProps): HTMLElement;

    /**
     * リンクなどのクリック時にはアノテーションレイヤークリックイベントを発火しないようにする
     */
    abstract setAnnotationLayerPropagation(layer: HTMLElement): void;

    /**
     * 矩形のクリックイベントを設定する
     */
    abstract setSquareEvent(square: HTMLElement): void;

    /**
     * ### 矩形を選択状態にする
     * 実行前に選択可能か判定すること
     */
    abstract selectSquare(square: string | HTMLElement): void;

    /**
     * 選択状態をクリアする
     */
    abstract unselectSquare(id: string): void;
}

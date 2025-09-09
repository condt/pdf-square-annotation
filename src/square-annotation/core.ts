import { Context } from "../utils/context.js";
import { log } from "../utils/log.js";
import { utils } from "../utils/util.js";
import { SquareAnnotationBase } from "./base.js";
import { layerEvent } from "./layer-event.js";
import { resizeHandlerEvent } from "./resize-handler-event.js";
import { squareEvent } from "./square-event.js";
import {
    COURSOR_STYLE,
    CUSTOM_ANNOTATION_CLASSES,
    RESIZE_HANDLER_BACK_COLOR,
    RESIZE_HANDLER_POS,
    RESIZE_HANDLER_SIZE,
} from "./style/settings.js";
import { getSupportStyles } from "./style/square-style.js";
import { DELETE_SVG } from "./style/svg/delete.js";
import { generator, getAllSquares, getNumberId, setPercentStyle } from "./util.js";

import { checkImportData, createCurrentData, createExportData } from "./io.js";
import type { ExportData, Position, SquareData, SquareOperation, SquareProps, StackOperation } from "./types/square.js";

export class SquareAnnotation extends SquareAnnotationBase {
    /**
     * 矩形の作成、リサイズを可能にする
     */
    enableEditSquare(layer: HTMLElement) {
        // 矩形描画開始
        layer.onmousedown = layerEvent.mouseDown(this);

        // ドラッグで矩形描画サイズ変更
        layer.onmousemove = layerEvent.mouseMove(this);

        // 矩形描画終了
        layer.onmouseup = layerEvent.mouseUp(this);

        // 範囲外に出た場合は描画終了
        layer.onmouseleave = layerEvent.mouseLeave(this);
    }

    removeResizeHandler() {
        const remove = (e: HTMLElement) => {
            if (e != null) e.remove();
        };
        remove(Context.document.getElementById(this.getSquareHandlerId("top-left")));
        remove(Context.document.getElementById(this.getSquareHandlerId("top-right")));
        remove(Context.document.getElementById(this.getSquareHandlerId("bottom-left")));
        remove(Context.document.getElementById(this.getSquareHandlerId("bottom-right")));
    }

    /**
     * 削除アイコンを消す
     */
    removeDeleteIcon() {
        const elem = Context.document.getElementById("square-delete-icon");
        if (elem != null) elem.remove();
    }

    /**
     * 矩形にresize handlerを付与する
     */
    drawResizeHandler(id: string) {
        log.debug("draw resize handler", id);

        const squareElement = Context.document.getElementById(id);

        this.removeResizeHandler();

        // resize handler作成
        this.createDragHandlerElement(squareElement, "top-left");
        this.createDragHandlerElement(squareElement, "top-right");
        this.createDragHandlerElement(squareElement, "bottom-left");
        this.createDragHandlerElement(squareElement, "bottom-right");

        this.removeDeleteIcon();

        // 削除アイコン作成
        this.createDeleteIcon(squareElement);
    }

    /**
     * resize handlerを作成してsquareに付与する
     */
    private createDragHandlerElement(square: HTMLElement, position: Position) {
        const handler = Context.document.createElement("div");
        const id = this.getSquareHandlerId(position);
        handler.id = id;
        handler.style.position = "absolute";
        handler.style.zIndex = "10000000";
        handler.style.width = RESIZE_HANDLER_SIZE;
        handler.style.height = RESIZE_HANDLER_SIZE;

        if (position === "top-left") {
            // handler.style.borderLeft = RESIZE_HANDLER_BORDER;
            // handler.style.borderTop = RESIZE_HANDLER_BORDER;
            handler.style.backgroundColor = RESIZE_HANDLER_BACK_COLOR;
            handler.style.left = RESIZE_HANDLER_POS;
            handler.style.top = RESIZE_HANDLER_POS;
            handler.style.cursor = "nw-resize";
        } else if (position === "bottom-left") {
            // handler.style.borderLeft = RESIZE_HANDLER_BORDER;
            // handler.style.borderBottom = RESIZE_HANDLER_BORDER;
            handler.style.backgroundColor = RESIZE_HANDLER_BACK_COLOR;
            handler.style.left = RESIZE_HANDLER_POS;
            handler.style.bottom = RESIZE_HANDLER_POS;
            handler.style.cursor = "sw-resize";
        } else if (position === "top-right") {
            // handler.style.borderRight = RESIZE_HANDLER_BORDER;
            // handler.style.borderTop = RESIZE_HANDLER_BORDER;
            handler.style.backgroundColor = RESIZE_HANDLER_BACK_COLOR;
            handler.style.right = RESIZE_HANDLER_POS;
            handler.style.top = RESIZE_HANDLER_POS;
            handler.style.cursor = "ne-resize";
        } else if (position === "bottom-right") {
            // handler.style.borderRight = RESIZE_HANDLER_BORDER;
            // handler.style.borderBottom = RESIZE_HANDLER_BORDER;
            handler.style.backgroundColor = RESIZE_HANDLER_BACK_COLOR;
            handler.style.right = RESIZE_HANDLER_POS;
            handler.style.bottom = RESIZE_HANDLER_POS;
            handler.style.cursor = "se-resize";
        }

        // mousedownイベントを設定
        handler.onmousedown = resizeHandlerEvent.mouseDown(this, id, square.style.width, square.style.height);

        square.appendChild(handler);
        return handler;
    }

    /**
     * 矩形削除アイコンを表示する
     */
    private createDeleteIcon(square: HTMLElement) {
        const deleteIcon = Context.document.createElement("div");
        deleteIcon.id = "square-delete-icon";
        deleteIcon.style.cursor = "pointer";
        deleteIcon.style.position = "absolute";
        deleteIcon.style.zIndex = "10000000";
        deleteIcon.style.right = "-30px";
        deleteIcon.style.top = "0px";
        deleteIcon.style.width = "20px";
        deleteIcon.style.height = "24px";
        deleteIcon.style.backgroundColor = "#000";
        deleteIcon.title = "矩形を削除します";

        deleteIcon.onclick = (e: MouseEvent) => {
            // 矩形の削除
            e.stopPropagation();
            this.deleteSquare(square.id);
        };

        deleteIcon.onmousedown = (e: MouseEvent) => {
            // resize, moveが発火しないようにする
            e.stopPropagation();
        };

        const svg = Context.document.createElement("svg");
        svg.innerHTML = DELETE_SVG;
        deleteIcon.appendChild(svg);

        square.appendChild(deleteIcon);
    }

    private getSquareHandlerId(position: Position) {
        return `square-handler-${position}`;
    }

    /**
     * 矩形アノテーションを削除する
     */
    private deleteSquare(id: string) {
        const square = Context.document.getElementById(id);
        if (square == null) {
            log.error(`delete annotation not found: ${id}`);
            return;
        }

        const pageNumber = Context.pdfManager.getPageNumber(square);

        // add undo stack
        this.addUndoStack(square, "delete");

        if (this.editStateManager.isSelect(id)) {
            // 選択中の矩形を削除する場合は選択状態をキャンセルする
            this.editStateManager.setReadyState();
        }

        // undo stackを更新してから消す必要がある
        square.remove();
        this.removeResizeHandler();
        this.removeDeleteIcon();

        // dispatch to parent
        utils.dispatchEvent("change-square", {
            type: "delete",
            trigger: "operation",
            id: getNumberId(square.id),
            pageNumber,
        });
    }

    /**
     * ダブルクリックで矩形編集モードに入れるようにする
     */
    setSquareDoubleClick() {
        if (this.mode === "edit") {
            // ====================編集モード====================
            Context.window.ondblclick = null;
        } else if (this.mode === "preview") {
            // ====================プレビューモード====================
            Context.window.ondblclick = (e: MouseEvent) => {
                const wx = e.pageX;
                const wy = e.pageY;
                for (const el of getAllSquares()) {
                    const { x, y, width, height } = el.getBoundingClientRect();
                    if (wx >= x && wx <= x + width) {
                        if (wy >= y && wy <= y + height) {
                            e.stopPropagation();
                            log.debug(`${el.id}を選択しました`, el);

                            // 矩形選択状態にする
                            const stateChanged = this.editStateManager.setSelectState(el.id);
                            if (stateChanged) {
                                // 編集モードにする
                                this.setEditMode();
                                // draw resize handler
                                this.drawResizeHandler(el.id);
                                return;
                            }
                        }
                    }
                }
            };
        }
    }

    /**
     * ## 操作結果をundo stackに追加する
     * * current dataも更新する
     * * 矩形の座標とsizeをpercent指定にする
     */
    addUndoStack(squareSection: HTMLElement, operation: StackOperation): SquareData | null {
        const pageNumber = Context.pdfManager.getPageNumber(squareSection);

        // stackに追加
        if (operation === "create" || operation === "modify") {
            // percent指定にする
            const { xScale, yScale, widthScale, heightScale } = setPercentStyle(squareSection);

            // styleを取得
            const style = getSupportStyles(squareSection);

            // 登録・更新する用のプロパティを作成(別オブジェクトとして保持するために2つ作成する)
            const square = {
                id: squareSection.id,
                pageNumber,
                props: {
                    x: xScale,
                    y: yScale,
                    width: widthScale,
                    height: heightScale,
                    style,
                },
            };

            if (this.stackIndex < this.undoStack.length - 1) {
                // undo中に操作された場合は現在位置以降の操作は消す
                this.undoStack.splice(this.stackIndex + 1);
            }

            // update current squares
            this.updateCurrentSquares(operation, utils.deepCopy(square));

            // add undo stack
            this.undoStack.push({
                stackId: SquareAnnotation.stackId,
                squares: [
                    {
                        operation,
                        ...square,
                    },
                ],
            });

            SquareAnnotation.stackId++;
            this.stackIndex++;

            return square;
        } else if (operation === "delete") {
            if (this.stackIndex < this.undoStack.length - 1) {
                // undo中に操作された場合は現在位置以降の操作は消す
                this.undoStack.splice(this.stackIndex + 1);
            }

            // update current squares
            this.deleteCurrentSquare(squareSection.id);

            // add undo stack
            this.undoStack.push({
                stackId: SquareAnnotation.stackId,
                squares: [{ operation: "delete", pageNumber, id: squareSection.id }],
            });
        }
        SquareAnnotation.stackId++;
        this.stackIndex++;
    }

    /**
     * 作成か更新時にcurrent squaresを更新する
     */
    private updateCurrentSquares(operation: StackOperation, square: SquareData) {
        if (operation === "create") {
            // 追加
            this.currentSquares.push(square);
        } else if (operation === "modify") {
            // 更新
            const modifyTarget = this.currentSquares.find((s) => s.id === square.id);
            if (modifyTarget == null) {
                log.error(`modify current squares error: ${square.id}`);
                return;
            }
            modifyTarget.props = square.props;
        }
    }

    /**
     * current squaresの対象のsquareを削除する
     */
    private deleteCurrentSquare(id: string) {
        const index = this.currentSquares.findIndex((s) => s.id === id);
        if (index < 0) {
            log.error(`delete current squares error: ${id}`);
            return;
        }
        this.currentSquares.splice(index, 1);
    }

    undo() {
        if (this.stackIndex < 0) {
            log.info("undo stack is empty.");
            return;
        }

        const currentStack = this.undoStack[this.stackIndex];
        for (const currentSquare of currentStack.squares) {
            if (currentSquare.operation === "create") {
                // createなら消す
                this.refreshTargetSquare(currentSquare.id, currentSquare.props, "delete", "undo");

                // update current data
                this.deleteCurrentSquare(currentSquare.id);

                // dispatch to parent
                utils.dispatchEvent("change-square", {
                    type: "delete",
                    trigger: "operation",
                    id: getNumberId(currentSquare.id),
                    pageNumber: currentSquare.pageNumber,
                });
            } else {
                // modify or deleteは直近データで復元する
                const latestSquare = this.getLatestUndo(currentSquare.id);
                if (latestSquare == null) {
                    log.error("latestSquare is null: ", currentSquare.id);
                    continue;
                }

                if (currentSquare.operation === "modify") {
                    // undo modify
                    this.refreshTargetSquare(
                        Context.document.getElementById(currentSquare.id),
                        latestSquare.props,
                        "modify",
                        "undo"
                    );

                    // update current data
                    this.updateCurrentSquares("modify", this.copySquareData(latestSquare));
                } else if (currentSquare.operation === "delete") {
                    // undo delete: restore
                    const annotationLayer = Context.pdfManager.getAnnotationLayer(latestSquare.pageNumber);
                    this.createSquareSection(latestSquare.id, annotationLayer, latestSquare.props);

                    // update current data
                    const copied: SquareData = this.copySquareData(latestSquare);
                    this.updateCurrentSquares("create", copied);

                    // dispatch to parent
                    utils.dispatchEvent("change-square", {
                        type: "create",
                        trigger: "operation",
                        id: getNumberId(currentSquare.id),
                        pageNumber: currentSquare.pageNumber,
                        props: copied.props,
                    });
                }
            }
        }

        this.stackIndex--;
    }

    /**
     * 直近データを返す
     */
    private getLatestUndo(id: string): SquareData {
        if (this.stackIndex === 0) {
            // 初期データから返す
            return this.getSquareDataFromFirst(id);
        }

        // get latest square (今の位置が-2から始める)
        for (let i = this.stackIndex - 1; i >= 0; i--) {
            const prevStack = this.undoStack[i];
            const prevSquare = prevStack.squares.find((s) => s.id === id);
            if (prevSquare != null) return this.copySquareData(prevSquare);
        }

        // undoStackにない場合は初期データから返す
        return this.getSquareDataFromFirst(id);
    }

    /**
     * 初期データから取得する
     */
    private getSquareDataFromFirst(id: string): SquareData {
        for (const square of this.initialSquares) {
            if (square.id === id) {
                return square;
            }
        }
        return null;
    }

    /**
     * ### 対象の矩形をundo/redoする
     * * 削除時はHTMLElementではなくstring idを渡す
     * * HTMLElementを渡す場合はidを指定したものを渡す
     */
    private refreshTargetSquare(
        targetElem: HTMLElement | string,
        square: SquareProps,
        operation: "modify" | "delete",
        ur: "undo" | "redo"
    ) {
        if (typeof targetElem === "string") {
            if (operation === "delete" && this.editStateManager.isSelect(targetElem)) {
                // 選択中を削除する場合はreadyに戻す
                this.editStateManager.setReadyState();
            }
            targetElem = Context.document.getElementById(targetElem);
        }
        if (targetElem == null) {
            log.debug(`refreshTargetSquare: ${ur} target element is null.`, "color: yellow");
            return;
        }
        if (operation === "delete") {
            targetElem.remove();
            return;
        }
        if (operation === "modify") {
            targetElem.style.left = `${square.x * 100}%`;
            targetElem.style.top = `${square.y * 100}%`;
            targetElem.style.width = `${square.width * 100}%`;
            targetElem.style.height = `${square.height * 100}%`;

            // set style
            for (const [key, value] of Object.entries(square.style)) {
                targetElem.style[key] = value;
            }
        }
    }

    /**
     * redoする
     */
    redo() {
        if (this.undoStack.length - 1 === this.stackIndex) {
            log.info("undo stack is latest.");
            return;
        }

        const nextStack = this.undoStack[this.stackIndex + 1];
        for (const square of nextStack.squares) {
            if (square.operation === "create") {
                const annotationLayer = Context.pdfManager.getAnnotationLayer(square.pageNumber);
                const section = this.createSquareSection(square.id, annotationLayer, square.props);
                this.updateCurrentSquares("create", this.copySquareData(square));
                log.debug("create section: ", section);

                // dispatch to parent
                utils.dispatchEvent("change-square", {
                    type: "create",
                    trigger: "operation",
                    id: getNumberId(square.id),
                    pageNumber: square.pageNumber,
                    props: square.props,
                });
            } else if (square.operation === "modify") {
                this.refreshTargetSquare(Context.document.getElementById(square.id), square.props, "modify", "redo");
            } else if (square.operation === "delete") {
                this.refreshTargetSquare(square.id, square.props, "delete", "redo");

                // dispatch to parent
                utils.dispatchEvent("change-square", {
                    type: "delete",
                    trigger: "operation",
                    id: getNumberId(square.id),
                    pageNumber: square.pageNumber,
                    props: square.props,
                });
            }
        }

        this.stackIndex++;
    }

    /**
     * undo stackなどからsquare dataを生成する
     */
    private copySquareData(square: SquareData | SquareOperation): SquareData {
        const data: SquareOperation = utils.deepCopy(square);
        if (Object.hasOwn(data, "operation")) {
            // 余計なプロパティを消す
            delete data.operation;
        }
        return data;
    }

    /**
     * ### 矩形を要素を新しく作成する
     * クリックイベントも設定する
     */
    createSquareSection(id: string, annotationLayer: HTMLElement, style?: SquareProps) {
        if (Context.document.getElementById(id) != null) {
            log.warn(`${id}の矩形は存在します`);
            return;
        }
        if (annotationLayer == null) {
            log.debug("annotationLayer is null.", "color: yellow");
            return;
        }

        const section = Context.document.createElement("section");
        section.id = id;
        section.classList.add("square-annotation");
        section.style.position = "absolute";

        // 他のアノテーションよりダブルクリックを優先する
        section.style.zIndex = generator.squareZindex.nextIndex();

        if (style != null) {
            section.style.left = `${style.x * 100}%`;
            section.style.top = `${style.y * 100}%`;
            section.style.right = null;
            section.style.bottom = null;
            section.style.width = `${style.width * 100}%`;
            section.style.height = `${style.height * 100}%`;

            // set style
            for (const [key, value] of Object.entries(style.style)) {
                section.style[key] = value;
            }
        }

        // add click edit event
        this.setSquareEvent(section);

        // append
        annotationLayer.appendChild(section);

        if (this.editStateManager.isSelect(id)) {
            // draw resize handler
            this.drawResizeHandler(id);
        }

        return section;
    }

    /**
     * 矩形を選択する
     */
    selectSquare(squareId: string) {
        // 選択状態にする
        const stateChanged = this.editStateManager.setSelectState(squareId);
        if (stateChanged) {
            // 矩形にresize handlerを追加する
            this.drawResizeHandler(squareId);
        }
    }

    /**
     * 矩形のクリックイベントを設定する
     */
    setSquareEvent(square: HTMLElement) {
        if (this.mode === "edit") {
            // ====================編集モード====================
            square.style.cursor = COURSOR_STYLE.MOVABLE;
            square.style.pointerEvents = null;

            // mousedown時のイベント設定
            square.onmousedown = squareEvent.mouseDown(this, square.id);

            // シングルクリック時のイベント設定
            square.onclick = squareEvent.click();
        } else {
            // ====================プレビューモード====================
            square.style.cursor = null;
            square.style.pointerEvents = "none";
            square.onmousedown = null;
            square.onclick = null;
        }
    }

    /**
     * 編集モードでリンクなどをクリックした際はアノテーションレイヤークリックイベントを発火しないようにする
     */
    setAnnotationLayerPropagation(layer: HTMLElement) {
        for (const child of layer.children) {
            // 矩形などオリジナルのアノテーションかどうかをチェック
            const isCustomAnnotation = Array.from(child.classList).some((c) => CUSTOM_ANNOTATION_CLASSES.includes(c));
            if (!isCustomAnnotation) {
                if (this.mode === "edit") {
                    // ====================編集モード====================
                    // 編集モード時は、リンクなどオリジナル以外のアノテーションはクリックイベントを消す
                    (child as HTMLElement).style.pointerEvents = "none";
                } else {
                    // ====================プレビューモード====================
                    (child as HTMLElement).style.pointerEvents = "auto";
                }
            }
        }
    }

    /**
     * 矩形アノテーションデータを出力する
     */
    getAnnotations(): ExportData {
        return createExportData(this.currentSquares);
    }

    /**
     * 矩形アノテーションデータを描画する
     */
    setAnnotations(data: ExportData) {
        const squares = createCurrentData(data);
        checkImportData(squares, Context.pagesCount);

        // 既存矩形の削除
        getAllSquares().forEach((square) => square.remove());

        // reset undo stack
        this.undoStack = [];
        this.stackIndex = -1;
        SquareAnnotationBase.stackId = 1;

        // 次の矩形idをimport dataから決める
        generator.squareId.updateNextId(data.squares.map((s) => s.id));

        this.initialSquares = squares;
        this.currentSquares = utils.deepCopy(squares);

        this.editStateManager.setReadyState();

        // 描画
        for (let page = 1; page <= Context.pagesCount; page++) {
            this.onRenderEvent(page);
        }

        this.setSquareDoubleClick();
    }

    /**
     * 矩形データをJSONファイルとしてダウンロードする
     */
    downloadData() {
        utils.download(this.getAnnotations(), "annotations.json", "application/json");
    }

    /**
     * ファイルを選択して矩形データをインポートする
     */
    async importData() {
        const data = await utils.selectFile(".json");
        this.setAnnotations(JSON.parse(data));
    }
}

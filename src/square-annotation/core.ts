import { AnnotationContext } from "@/utils/context/annotation.js";
import { Context } from "../utils/context.js";
import { log } from "../utils/log.js";
import { utils } from "../utils/util.js";
import { SquareAnnotationBase } from "./base.js";
import { checkImportData, createCurrentData, createExportData } from "./io.js";
import { layerEvent } from "./layer-event.js";
import { resizeHandlerEvent } from "./resize-handler-event.js";
import { squareEvent } from "./square-event.js";
import { COURSOR_STYLE, CUSTOM_ANNOTATION_CLASSES } from "./style/settings.js";
import { setSelectSquareStyle, setSquareStyle } from "./style/square-style.js";
import { DELETE_SVG } from "./style/svg/delete.js";
import {
    generator,
    getAllSquares,
    getNumberId,
    getSquareElement,
    getSquareState,
    getStrId,
    setPercentStyle,
} from "./util.js";

import type { LockAnnotationsArgs } from "@/types/lock.js";
import { changeUndoRedoButtonStyle } from "./style/toolbar.js";
import type {
    ExportData,
    Position,
    Square,
    SquareData,
    SquareOperation,
    SquareProps,
    StackOperation,
} from "./types/square.js";

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

    /**
     * 矩形にresize handlerを付与する
     */
    drawResizeHandler(squareElement: HTMLElement) {
        this.removeResizeHandler();

        // resize handler作成
        this.createDragHandlerElement(squareElement, "top-left");
        this.createDragHandlerElement(squareElement, "top-right");
        this.createDragHandlerElement(squareElement, "bottom-left");
        this.createDragHandlerElement(squareElement, "bottom-right");
    }

    /**
     * resize handlerを作成してsquareに付与する
     */
    private createDragHandlerElement(square: HTMLElement, position: Position) {
        const config = Context.config.getConfig();
        const backgroundColor = config.squareAnnotation.resizeHandlerStyle.backgroundColor;
        const borderRadius = config.squareAnnotation.resizeHandlerStyle.borderRadius;
        const size = config.squareAnnotation.resizeHandlerStyle.size;
        const positionPixel = config.squareAnnotation.resizeHandlerStyle.position;

        const handler = Context.document.createElement("div");
        const id = this.getSquareHandlerId(position);
        handler.id = id;
        handler.style.position = "absolute";
        handler.style.zIndex = "10000000";
        handler.style.width = size;
        handler.style.height = size;
        handler.style.backgroundColor = backgroundColor;
        handler.style.borderRadius = borderRadius;

        if (position === "top-left") {
            // handler.style.borderLeft = RESIZE_HANDLER_BORDER;
            // handler.style.borderTop = RESIZE_HANDLER_BORDER;
            handler.style.left = positionPixel;
            handler.style.top = positionPixel;
            handler.style.cursor = "nw-resize";
        } else if (position === "bottom-left") {
            // handler.style.borderLeft = RESIZE_HANDLER_BORDER;
            // handler.style.borderBottom = RESIZE_HANDLER_BORDER;
            handler.style.left = positionPixel;
            handler.style.bottom = positionPixel;
            handler.style.cursor = "sw-resize";
        } else if (position === "top-right") {
            // handler.style.borderRight = RESIZE_HANDLER_BORDER;
            // handler.style.borderTop = RESIZE_HANDLER_BORDER;
            handler.style.right = positionPixel;
            handler.style.top = positionPixel;
            handler.style.cursor = "ne-resize";
        } else if (position === "bottom-right") {
            // handler.style.borderRight = RESIZE_HANDLER_BORDER;
            // handler.style.borderBottom = RESIZE_HANDLER_BORDER;
            handler.style.right = positionPixel;
            handler.style.bottom = positionPixel;
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
        this.removeDeleteIcon();

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
            this.deleteSquare(square);
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
    private deleteSquare(id: Square) {
        const { squareElement, squareId } = getSquareElement(id);
        if (squareElement == null) {
            log.error(`delete annotation not found: ${id}`);
            return;
        }

        const pageNumber = Context.pdfManager.getPageNumber(squareElement);

        // add undo stack
        this.addUndoStack(squareElement, "delete");

        // undo stackを更新してから消す必要がある
        // NOTE: selectIdを使うのでstateをreadyにする前に実行する
        this.deleteSquareElement(squareElement);

        if (this.editStateManager.isSelect(squareId)) {
            // 選択中の矩形を削除する場合は選択状態をキャンセルする
            this.editStateManager.setReadyState();
        }

        // dispatch to parent
        utils.dispatchEvent("change-square", {
            type: "delete",
            trigger: "operation",
            id: getNumberId(squareId),
            pageNumber,
        });
    }

    /**
     * ダブルクリックで矩形編集モードに入れるようにする
     */
    setSquareDoubleClick() {
        // MARK: setSquareDoubleClick 矩形ののダブルクリック
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

                            const isLocked = AnnotationContext.isLocked(el.id);

                            // dispatch to parent
                            utils.dispatchEvent("dblclick-square", {
                                id: getNumberId(el.id),
                                state: isLocked ? "locked" : "normal",
                            });
                            return;

                            // ダブルクリックで編集モードにする処理
                            // if (this.editStateManager.canSelectSquare(el.id)) {
                            //     // 編集モードにする
                            //     this.setEditMode();
                            //     // 選択状態にする
                            //     this.selectSquare(el.id);
                            //     return;
                            // }
                        }
                    }
                }
            };
        }
    }

    clearUndoStack() {
        this.undoStack = [];
        this.stackIndex = -1;
        SquareAnnotationBase.stackId = 1;

        // redoボタンの活性・非活性を更新する
        this.refreshUndoRedoButton();
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

            // 登録・更新する用のプロパティを作成(別オブジェクトとして保持するために2つ作成する)
            const square = {
                id: squareSection.id,
                pageNumber,
                props: {
                    x: xScale,
                    y: yScale,
                    width: widthScale,
                    height: heightScale,
                },
            };
            const undoStackSquare = utils.deepCopy(square);

            if (this.stackIndex < this.undoStack.length - 1) {
                // undo中に操作された場合は現在位置以降の操作は消す
                this.undoStack.splice(this.stackIndex + 1);
            }

            // update current squares
            this.updateCurrentSquares(operation, square);

            // add undo stack
            this.undoStack.push({
                stackId: SquareAnnotation.stackId,
                squares: [
                    {
                        operation,
                        ...undoStackSquare,
                    },
                ],
            });

            SquareAnnotation.stackId++;
            this.stackIndex++;

            // redoボタンの活性・非活性を更新する
            this.refreshUndoRedoButton();

            return utils.deepCopy(square);
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

        // redoボタンの活性・非活性を更新する
        this.refreshUndoRedoButton();
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

    /**
     * undo/redoボタンの活性・非活性を更新する
     */
    private refreshUndoRedoButton() {
        let undoEnable = false;
        let redoEnable = false;
        if (this.undoStack.length > 0) {
            if (this.stackIndex >= 0) {
                undoEnable = true;
            }
            if (this.stackIndex < this.undoStack.length - 1) {
                redoEnable = true;
            }
        }
        changeUndoRedoButtonStyle(undoEnable, redoEnable);
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
                    trigger: "undo",
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
                        trigger: "undo",
                        id: getNumberId(currentSquare.id),
                        pageNumber: currentSquare.pageNumber,
                        props: copied.props,
                    });
                }
            }
        }

        this.stackIndex--;

        // redoボタンの活性・非活性を更新する
        this.refreshUndoRedoButton();
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
        props: SquareProps,
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
            targetElem.style.left = `${props.x * 100}%`;
            targetElem.style.top = `${props.y * 100}%`;
            targetElem.style.width = `${props.width * 100}%`;
            targetElem.style.height = `${props.height * 100}%`;
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
                    trigger: "redo",
                    id: getNumberId(square.id),
                    pageNumber: square.pageNumber,
                    props: square.props,
                });
            } else if (square.operation === "modify") {
                this.refreshTargetSquare(Context.document.getElementById(square.id), square.props, "modify", "redo");
                this.updateCurrentSquares("modify", this.copySquareData(square));
            } else if (square.operation === "delete") {
                this.refreshTargetSquare(square.id, square.props, "delete", "redo");

                // update current data
                this.deleteCurrentSquare(square.id);

                // dispatch to parent
                utils.dispatchEvent("change-square", {
                    type: "delete",
                    trigger: "redo",
                    id: getNumberId(square.id),
                    pageNumber: square.pageNumber,
                    props: square.props,
                });
            }
        }

        this.stackIndex++;

        // redoボタンの活性・非活性を更新する
        this.refreshUndoRedoButton();
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
     * * 座標、スタイルを設定する
     * * クリックイベントも設定する
     * * 矩形作成の開始時はpropsを渡さない(呼び出し元で座標を設定する)
     */
    createSquareSection(id: string, annotationLayer: HTMLElement, props?: SquareProps) {
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

        if (props != null) {
            section.style.left = `${props.x * 100}%`;
            section.style.top = `${props.y * 100}%`;
            section.style.right = null;
            section.style.bottom = null;
            section.style.width = `${props.width * 100}%`;
            section.style.height = `${props.height * 100}%`;
        }

        // set style
        setSquareStyle(section, getSquareState(id));

        // add click edit event
        this.setSquareEvent(section);

        // append
        annotationLayer.appendChild(section);

        return section;
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
        this.clearUndoStack();

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

    /**
     * 指定したアノテーションをlock状態にする
     */
    lockAnnotations(args: LockAnnotationsArgs) {
        AnnotationContext.lockAnnotationIds = args.annotationIds
            .map((id) => getStrId(id))
            .filter((id) => {
                // 存在する矩形だけlockする
                return this.currentSquares.some((square) => square.id === id);
            });
        this.setAllSquaresStyle();
    }

    setAllSquaresStyle() {
        // 全矩形のスタイル設定
        this.currentSquares.forEach((square) => {
            this.setSquareStyleWithState(square.id);
        });
    }

    /**
     * 矩形状態を変更する
     */
    private setSquareStyleWithState(id: string) {
        const state = getSquareState(id);
        if (state === "locked") {
            // locked状態に変更
            if (this.editStateManager.isSelect(id)) {
                // 選択中がlockされた場合は選択を解除する
                this.unselectSquare(id);
            }
            setSquareStyle(id, "locked");
        } else if (state === "normal") {
            // 通常状態に変更
            setSquareStyle(id, "normal");
        }

        if (this.editStateManager.isSelect(id)) {
            // 選択状態スタイルを適用
            setSelectSquareStyle(id);
        }
    }

    /**
     * ### 矩形を選択状態にする
     * 実行前に選択可能か判定すること
     */
    selectSquare(square: string | HTMLElement) {
        // MARK: selectSquare2 矩形を選択
        const squareElement = typeof square === "string" ? Context.document.getElementById(square) : square;
        const id = typeof square === "string" ? square : squareElement.id;

        const preSquareId = this.editStateManager.selectSquareId;
        if (preSquareId != null && preSquareId !== id) {
            // 選択が変わった場合、元々選択していた矩形のスタイルを戻す
            this.clearSelectStyle(preSquareId);
        }

        // 矩形を選択状態のスタイルにする
        setSelectSquareStyle(squareElement);

        // 矩形にresize handlerを追加する
        this.drawResizeHandler(squareElement);

        // 削除アイコン作成
        this.createDeleteIcon(squareElement);

        // 選択状態にする
        this.editStateManager.setSelectState(id);
    }

    /**
     * ### 矩形の選択状態を解除する
     */
    unselectSquare(id: string) {
        if (id == null) return;
        // 描画更新
        this.clearSelectStyle(id);
        this.removeResizeHandler();
        this.removeDeleteIcon();
        // stateをreadyに戻す
        this.editStateManager.setReadyState();
    }

    /**
     * ### 矩形要素を削除する
     */
    private deleteSquareElement(square: Square) {
        const { squareElement, squareId } = getSquareElement(square);
        if (this.editStateManager.isSelect(squareId)) {
            this.removeResizeHandler();
            this.removeDeleteIcon();
        }
        squareElement.remove();
    }

    /**
     * ### 矩形の選択スタイルをクリアする
     */
    private clearSelectStyle(squareId: string) {
        if (squareId == null) return;

        // 選択状態スタイルを消す
        setSquareStyle(squareId, getSquareState(squareId), false);
    }

    private removeResizeHandler() {
        // remove resize handler
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
    private removeDeleteIcon() {
        const elem = Context.document.getElementById("square-delete-icon");
        if (elem != null) elem.remove();
    }

    /**
     * 矩形の新規作成を許可する
     */
    allowCreateNew() {
        this.editStateManager.allowCreateNew = true;
        Context.pdfManager.getPages().forEach((page) => {
            const layer = Context.pdfManager.getAnnotationLayer(page);
            if (layer != null) {
                layer.style.cursor = COURSOR_STYLE.CAN_CREATE;
            }
        });
    }

    /**
     * 矩形の新規作成を禁止する
     */
    disallowCreateNew() {
        this.editStateManager.allowCreateNew = false;
        Context.pdfManager.getPages().forEach((page) => {
            const layer = Context.pdfManager.getAnnotationLayer(page);
            if (layer != null) {
                layer.style.cursor = null;
            }
        });
    }
}

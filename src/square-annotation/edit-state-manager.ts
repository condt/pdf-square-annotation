import { SQUARE_MIN_SIZE } from "@/square-annotation/style/settings.js";
import { AnnotationContext } from "@/utils/context/annotation.js";
import { Context } from "../utils/context.js";
import { log } from "../utils/log.js";
import { EditingState } from "./types/square.js";

export class EditStateManager {
    private _state: EditingState = "ready";

    /**
     * falseなら矩形の新規作成不可
     */
    allowCreateNew = true;

    /**
     * layerのmousedownを発火させないためのフラグ
     */
    layerMouseDownPropagation = false;

    /**
     * 現在選択中の矩形要素
     */
    selectSquareId: string = null;

    private draggingResizeHandlerId: string = null;
    private resizeStartSquareWidth = null;
    private resizeStartSquareHeight = null;
    private resizeStartSquareX = 0;
    private resizeStartSquareY = 0;

    private draggingMoveSquareId = null;

    private createStartX = 0;
    private createStartY = 0;
    creatingSquareElement = null;

    private moveStartX = 0;
    private moveStartY = 0;

    constructor() {}

    /**
     * 矩形の作成をキャンセルする
     */
    cancelCreate() {
        log.debug("cancel create.", "color: #555; background-color: yellow");
        this.creatingSquareElement.remove();
        if (this.selectSquareId == null) {
            this.setReadyState();
        } else {
            // 選択中に作成した場合は選択中に戻す
            this.restoreSelectState();
        }
    }

    /**
     * 矩形のリサイズをキャンセルする
     */
    cancelResize() {
        if (this.isResizing()) {
            const resizeSquare = Context.document.getElementById(this.selectSquareId);
            if (resizeSquare != null) {
                resizeSquare.style.width = this.resizeStartSquareWidth;
                resizeSquare.style.height = this.resizeStartSquareHeight;
            }
            // 選択中に戻す
            this.restoreSelectState();
        }
    }

    /**
     * ## 初期値で初期化する
     * 選択中矩形idだけは初期化しない
     */
    private initParams() {
        // for select
        this.draggingResizeHandlerId = null;

        // for create
        this.createStartX = 0;
        this.createStartY = 0;
        this.creatingSquareElement = null;

        // for move
        this.moveStartX = 0;
        this.moveStartY = 0;
        this.draggingMoveSquareId = null;
    }

    setReadyState() {
        this.initParams();
        this.selectSquareId = null;
        this._state = "ready";
    }

    get state() {
        return this._state;
    }

    /**
     * ### resize move完了時, create resizeキャンセル時に実行する
     * 上記状態は"select-square"状態じゃないけどselectSquareIdは設定されている状態  \
     * ※createの完了時は普通にsetSelectStateで選択する  \
     * ※moveのキャンセルはない(マウスが範囲外に出たらその時点でmove完了になる)
     */
    restoreSelectState() {
        if (this.selectSquareId == null) {
            throw "selectSquareId is null: 矩形選択状態で実行してください";
        } else {
            // 選択状態にする
            this.initParams();
            this._state = "select-square";
        }
    }

    /**
     * ### 選択可能ならtrueを返す
     * lockedのみ判定する  \
     * 既に選択状態かどうかは判定しない
     */
    canSelectSquare(selectId: string) {
        if (AnnotationContext.isLocked(selectId)) {
            // lockされている矩形は選択不可
            return false;
        }

        return true;
    }

    /**
     * ### 矩形選択状態にする
     * **実行前に選択できるかcanSelectSquareでチェックすること**
     */
    setSelectState(newSelectSquareId: string) {
        this.initParams();
        this.selectSquareId = newSelectSquareId;
        this._state = "select-square";
    }

    /**
     *
     * @param createSquare 作成する矩形要素
     * @param createStartX layer MouseEventのoffsetX
     * @param createStartY layer MouseEventのoffsetY
     */
    setCreateState(createSquare: HTMLElement, createStartX: number, createStartY: number) {
        log.debug("start create");

        createSquare.style.width = "0px";
        createSquare.style.height = "0px";
        createSquare.style.left = `${createStartX}px`;
        createSquare.style.top = `${createStartY}px`;

        // NOTE: これがないと縮小時に挙動がおかしくなる
        createSquare.style.pointerEvents = "none";

        this.initParams();
        this.createStartX = createStartX;
        this.createStartY = createStartY;
        this.creatingSquareElement = createSquare;
        this._state = "create-dragging";
    }

    setResizeReadyState(
        resizeHandlerId: string,
        squareWidth: string,
        squareHeight: string,
        resizeStartX: number,
        resizeStartY: number
    ) {
        this.initParams();
        this.draggingResizeHandlerId = resizeHandlerId;
        this.resizeStartSquareWidth = squareWidth;
        this.resizeStartSquareHeight = squareHeight;
        this.resizeStartSquareX = resizeStartX;
        this.resizeStartSquareY = resizeStartY;
        this._state = "resize-ready";
    }

    setMoveReadyState(moveSquareId: string, startX: number, startY: number) {
        log.debug("start move.");

        // TODO: NonNull check (throw error)
        this.initParams();
        this.draggingMoveSquareId = moveSquareId;
        this.moveStartX = startX;
        this.moveStartY = startY;
        this._state = "move-ready";
    }

    /**
     * ドラッグで矩形作成中のイベント
     */
    createDragging(currentX: number, currentY: number) {
        const width = currentX - this.createStartX;
        const height = currentY - this.createStartY;

        // 小さすぎる場合は描画しない
        if (width <= 5 || height <= 5) return;

        this.creatingSquareElement.style.width = `${width}px`;
        this.creatingSquareElement.style.height = `${height}px`;
    }

    resizeDragging(layerOffsetX: number, layerOffsetY: number) {
        const resizeSquare = Context.document.getElementById(this.selectSquareId);
        let width = 0;
        let height = 0;
        if (this.draggingResizeHandlerId === "square-handler-bottom-right") {
            // 右下クリック時のresize(左上起点)
            width = layerOffsetX - this.resizeStartSquareX;
            height = layerOffsetY - this.resizeStartSquareY;
        } else if (this.draggingResizeHandlerId === "square-handler-top-left") {
            // 左上クリック時のresize(右下起点)
            width = this.resizeStartSquareX - layerOffsetX;
            height = this.resizeStartSquareY - layerOffsetY;
        } else if (this.draggingResizeHandlerId === "square-handler-top-right") {
            // 右上クリック時のresize(左下起点)
            width = layerOffsetX - this.resizeStartSquareX;
            height = this.resizeStartSquareY - layerOffsetY;
        } else if (this.draggingResizeHandlerId === "square-handler-bottom-left") {
            // 左下クリック時のresize(右上起点)
            width = this.resizeStartSquareX - layerOffsetX;
            height = layerOffsetY - this.resizeStartSquareY;
        }

        if (width < SQUARE_MIN_SIZE || height < SQUARE_MIN_SIZE) {
            // 小さすぎるサイズにはresize不可
            return;
        }

        // resize
        resizeSquare.style.width = `${width}px`;
        resizeSquare.style.height = `${height}px`;
        this._state = "resize-dragging";
    }

    moveDragging(layerOffsetX: number, layerOffsetY: number) {
        const square = Context.document.getElementById(this.draggingMoveSquareId);
        square.style.left = `${layerOffsetX - this.moveStartX}px`;
        square.style.top = `${layerOffsetY - this.moveStartY}px`;
        this._state = "move-dragging";
    }

    /**
     * 現在選択中の矩形要素を返す
     */
    getSelectingSquare(): HTMLElement {
        const square = Context.document.getElementById(this.selectSquareId);
        if (square == null) {
            throw `select square not found, id=${this.selectSquareId}`;
        }
        return square;
    }

    /**
     * 現在選択中の矩形ならtrueを返す
     */
    isSelect(squareId: string) {
        return this.selectSquareId === squareId;
    }

    isResizing() {
        return this.state === "resize-dragging" || this.state === "resize-ready";
    }

    isMoving() {
        return this.state === "move-dragging" || this.state === "move-ready";
    }

    /**
     * 矩形の新規作成が可能な状態ならtrueを返す
     */
    canCreate() {
        const stateOk = this.state === "ready" || this.state === "select-square";
        const allowCreate = this.allowCreateNew;
        return stateOk && allowCreate;
    }

    /**
     * 矩形の移動が可能な状態ならtrueを返す
     */
    canMove() {
        return this.state === "ready" || this.state === "select-square";
    }
}

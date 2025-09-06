import { log } from "../utils/log.js";
import { SquareAnnotation } from "./core.js";
import { SQUARE_MIN_SIZE } from "./style/settings.js";
import { changeSquarePointerEvents, generator } from "./util.js";

const mouseDown = (that: SquareAnnotation) => {
    const stateManager = that.editStateManager;

    return (e: MouseEvent) => {
        log.debug("layer mousedown");

        // ドラッグ時に他の矩形の上をカーソル表示させる
        changeSquarePointerEvents("none");

        if (stateManager.canCreate()) {
            // 矩形作成開始
            const annotationLayer = e.target as HTMLElement;
            const id = generator.squareId.nextId();
            const createSquare = that.createSquareSection(id, annotationLayer);

            // stateを矩形作成中にする
            stateManager.setCreateState(createSquare, e.offsetX, e.offsetY);
        }
    };
};

const mouseMove = (that: SquareAnnotation) => {
    const stateManager = that.editStateManager;

    return (e: MouseEvent) => {
        if (stateManager.state === "create-dragging") {
            // 作成する
            stateManager.createDragging(e.offsetX, e.offsetY);
        } else if (stateManager.isResizing()) {
            // リサイズする
            stateManager.resizeDragging(e.offsetX, e.offsetY);
        } else if (stateManager.isMoving()) {
            // 移動する
            stateManager.moveDragging(e.offsetX, e.offsetY);
        }
    };
};

const mouseUp = (that: SquareAnnotation) => {
    const stateManager = that.editStateManager;

    return (e: MouseEvent) => {
        log.debug("layer mouseup");

        // 矩形のクリックイベントを有効にする
        changeSquarePointerEvents("auto");

        // ====================作成中====================
        if (stateManager.state === "create-dragging") {
            log.debug("finish create dragging: ", e);

            // 作成完了
            completeCreate(that);
        } // ====================リサイズ中====================
        else if (stateManager.isResizing()) {
            completeResize(that);
        } // ====================移動中====================
        else if (stateManager.isMoving()) {
            // 移動を完了する
            completeMove(that);
        }
    };
};

const mouseLeave = (that: SquareAnnotation) => {
    const stateManager = that.editStateManager;

    return (e: MouseEvent) => {
        log.debug("layer mouseleave");

        // 矩形のクリックイベントを有効にする
        changeSquarePointerEvents("auto");

        // ====================作成中====================
        if (stateManager.state === "create-dragging") {
            // pageの範囲外に出たら作成完了
            log.debug("finish create dragging: ", e);

            // 作成
            completeCreate(that);
        } // ====================リサイズ中====================
        else if (stateManager.isResizing()) {
            // 元のサイズに戻す
            stateManager.cancelResize();
        } // ====================移動中====================
        else if (stateManager.isMoving()) {
            // 移動を完了する
            completeMove(that);
        }
    };
};

/**
 * 作成を完了する
 */
const completeCreate = (that: SquareAnnotation) => {
    const stateManager = that.editStateManager;

    // 小さすぎる場合は描画しない
    const { width, height, x, y } = stateManager.creatingSquareElement.getBoundingClientRect();
    // TODO: set MIN SIZE
    if (width < SQUARE_MIN_SIZE || height < SQUARE_MIN_SIZE) {
        stateManager.cancelCreate();
        return false;
    }

    log.debug("complete create");

    // percent指定にしてundo stackに追加
    that.addUndoStack(stateManager.creatingSquareElement, "create");

    // 選択状態にする
    that.selectSquare(stateManager.creatingSquareElement.id);

    return true;
};

/**
 * リサイズを完了する
 */
const completeResize = (that: SquareAnnotation) => {
    const stateManager = that.editStateManager;

    log.debug(`complete resize`);

    if (stateManager.state === "resize-dragging") {
        // サイズを変更した場合のみundo stackに追加
        // percent指定にしてundo stackに追加
        that.addUndoStack(stateManager.getSelectingSquare(), "modify");
    }

    // 選択状態に戻す
    stateManager.setSelectState(null);
};

/**
 * 移動を完了する
 */
const completeMove = (that: SquareAnnotation) => {
    const stateManager = that.editStateManager;

    log.debug(`complete move`);

    if (stateManager.state === "move-dragging") {
        // 動かした場合のみundo stackに追加
        // percent指定にしてundo stackに追加
        that.addUndoStack(stateManager.getSelectingSquare(), "modify");
    }

    // 選択状態に戻す
    stateManager.setSelectState(null);
};

export const layerEvent = {
    mouseDown,
    mouseMove,
    mouseUp,
    mouseLeave,
};

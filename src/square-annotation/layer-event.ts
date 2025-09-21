import { utils } from "@/utils/util.js";
import { log } from "../utils/log.js";
import { SquareAnnotation } from "./core.js";
import { SQUARE_MIN_SIZE } from "./style/settings.js";
import { SquareData } from "./types/square.js";
import { changeSquarePointerEvents, generator, getNumberId } from "./util.js";

const mouseDown = (that: SquareAnnotation) => {
    const stateManager = that.editStateManager;

    return (e: MouseEvent) => {
        if (stateManager.layerMouseDownPropagation) {
            // layerイベントを発火させない場合(lockedをmousedownした場合)
            stateManager.layerMouseDownPropagation = false;
            return;
        }

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
    // MARK: completeCreate 矩形の作成完了
    const stateManager = that.editStateManager;

    // 小さすぎる場合は描画しない
    const { width, height, x, y } = stateManager.creatingSquareElement.getBoundingClientRect();
    if (width < SQUARE_MIN_SIZE || height < SQUARE_MIN_SIZE) {
        stateManager.cancelCreate();
        return false;
    }

    log.debug("complete create");

    // percent指定にしてundo stackに追加
    const square = that.addUndoStack(stateManager.creatingSquareElement, "create");

    // 選択状態にする
    that.selectSquare(stateManager.creatingSquareElement.id);

    // dispatch to parent
    utils.dispatchEvent("change-square", {
        type: "create",
        trigger: "operation",
        id: getNumberId(square.id),
        pageNumber: square.pageNumber,
        props: square.props,
    });

    return true;
};

/**
 * リサイズを完了する
 */
const completeResize = (that: SquareAnnotation) => {
    const stateManager = that.editStateManager;

    log.debug(`complete resize`);

    let square: SquareData = null;
    if (stateManager.state === "resize-dragging") {
        // サイズを変更した場合のみ実行
        // percent指定にしてundo stackに追加
        square = that.addUndoStack(stateManager.getSelectingSquare(), "modify");
    }

    // 選択状態に戻す
    stateManager.restoreSelectState();

    if (square != null) {
        // NOTE: 現時点ではresizeはdispatchしない(createとdeleteのみdispatchする)
        // dispatch to parent
        // utils.dispatchEvent("change-square", {
        //     type: "resize",
        //     trigger: "operation",
        //     id: getNumberId(square.id),
        //     pageNumber: square.pageNumber,
        //     props: square.props,
        // });
    }
};

/**
 * 移動を完了する
 */
const completeMove = (that: SquareAnnotation) => {
    const stateManager = that.editStateManager;

    log.debug(`complete move`);

    let square: SquareData = null;
    if (stateManager.state === "move-dragging") {
        // 動かした場合のみundo stackに追加
        // percent指定にしてundo stackに追加
        square = that.addUndoStack(stateManager.getSelectingSquare(), "modify");
    }

    // 選択状態に戻す
    stateManager.restoreSelectState();

    if (square != null) {
        // NOTE: 現時点ではmoveはdispatchしない(createとdeleteのみdispatchする)
        // dispatch to parent
        // utils.dispatchEvent("change-square", {
        //     type: "move",
        //     trigger: "operation",
        //     id: getNumberId(square.id),
        //     pageNumber: square.pageNumber,
        //     props: square.props,
        // });
    }
};

export const layerEvent = {
    mouseDown,
    mouseMove,
    mouseUp,
    mouseLeave,
};

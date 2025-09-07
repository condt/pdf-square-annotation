import { log } from "../utils/log.js";
import { SquareAnnotation } from "./core.js";

/**
 * 矩形のmousedown処理
 */
const mouseDown = (that: SquareAnnotation, squareId: string) => {
    const stateManager = that.editStateManager;

    return (e: MouseEvent) => {
        // select or ready時のみ処理する
        if (stateManager.canCreate()) {
            if (!stateManager.isSelect(squareId)) {
                // 選択状態にする
                that.selectSquare(squareId);
            }

            // 矩形作成禁止stateを設定する
            stateManager.setMoveReadyState(squareId, e.offsetX, e.offsetY);
        }
    };
};

/**
 * 矩形のクリック処理
 */
const click = () => {
    return (e: MouseEvent) => {
        // layerにmousedownを伝播させない
        e.stopPropagation();
    };
};

export const squareEvent = {
    mouseDown,
    click,
};

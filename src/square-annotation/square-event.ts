import { utils } from "@/utils/util.js";
import { log } from "../utils/log.js";
import { SquareAnnotation } from "./core.js";
import { getNumberId } from "./util.js";

/**
 * 矩形のmousedown処理
 */
const mouseDown = (that: SquareAnnotation, squareId: string) => {
    const stateManager = that.editStateManager;

    return (e: MouseEvent) => {
        // 矩形移動の開始
        if (stateManager.canMove()) {
            if (stateManager.canSelectSquare(squareId)) {
                // 選択状態にする
                that.selectSquare(squareId);

                // moving stateを設定する(矩形作成も禁止される)
                stateManager.setMoveReadyState(squareId, e.offsetX, e.offsetY);

                // dispatch to parent
                utils.dispatchEvent("mousedown-square", {
                    id: getNumberId(squareId),
                    state: "normal",
                });
            } else {
                // lockedの場合はlayerのmousedownを発火させないようにする(矩形の新規作成を防止)
                stateManager.layerMouseDownPropagation = true;
            }
        }
    };
};

/**
 * 矩形のクリック処理
 */
const click = () => {
    return (e: MouseEvent) => {
        // NOTE: このイベントは`pointer-events: none`で発火してなさそう
        // layerにmousedownを伝播させない
        e.stopPropagation();
    };
};

export const squareEvent = {
    mouseDown,
    click,
};

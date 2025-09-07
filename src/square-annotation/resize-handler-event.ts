import { log } from "../utils/log.js";
import { SquareAnnotation } from "./core.js";

/**
 * 四隅のresize handlerのmousedown処理
 */
const mouseDown = (that: SquareAnnotation, resizeHandlerId: string, squareWidth: string, squareHeight: string) => {
    const stateManager = that.editStateManager;

    return (e: MouseEvent) => {
        const resizeSquare = stateManager.getSelectingSquare();
        const layer = resizeSquare.parentElement;
        const { x, y, width, height, right, bottom } = resizeSquare.getBoundingClientRect();
        const { x: lx, y: ly, width: lw, height: lh } = layer.getBoundingClientRect();
        const leftX = x - lx;
        const topY = y - ly;
        // xではなく相対値であるlwを使わなくてはならない
        const rightX = lw - leftX - width;
        const bottomY = lh - topY - height;

        let resizeStartX = 0;
        let resizeStartY = 0;

        if (resizeHandlerId === "square-handler-bottom-right") {
            // 右下クリック時(左上起点)
            resizeSquare.style.left = `${leftX}px`;
            resizeSquare.style.top = `${topY}px`;
            resizeSquare.style.right = null;
            resizeSquare.style.bottom = null;
            // 左上からの相対座標で左上を指定する
            resizeStartX = leftX;
            resizeStartY = topY;
        } else if (resizeHandlerId === "square-handler-top-left") {
            // 左上クリック時(右下起点)
            resizeSquare.style.left = null;
            resizeSquare.style.top = null;
            resizeSquare.style.right = `${rightX}px`;
            resizeSquare.style.bottom = `${bottomY}px`;
            // 左上からの相対座標で右下を指定する
            resizeStartX = leftX + width;
            resizeStartY = topY + height;
        } else if (resizeHandlerId === "square-handler-top-right") {
            // 右上クリック時(左下起点)
            resizeSquare.style.left = `${leftX}px`;
            resizeSquare.style.top = null;
            resizeSquare.style.right = null;
            resizeSquare.style.bottom = `${bottomY}px`;
            // 左上からの相対座標で左下を指定する
            resizeStartX = leftX;
            resizeStartY = topY + height;
        } else if (resizeHandlerId === "square-handler-bottom-left") {
            // 左下クリック時(右上起点)
            resizeSquare.style.left = null;
            resizeSquare.style.top = `${topY}px`;
            resizeSquare.style.right = `${rightX}px`;
            resizeSquare.style.bottom = null;
            // 左上からの相対座標で右上を指定する
            resizeStartX = leftX + width;
            resizeStartY = topY;
        }

        stateManager.setResizeReadyState(resizeHandlerId, squareWidth, squareHeight, resizeStartX, resizeStartY);
    };
};

export const resizeHandlerEvent = {
    mouseDown,
};

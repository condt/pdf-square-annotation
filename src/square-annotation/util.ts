import { Context } from "../utils/context.js";
import { log } from "../utils/log.js";

/**
 * ### 矩形の表示をpercent指定に変更する
 * ※拡大率変更に対応するため必要
 */
export const setPercentStyle = (squareSection: HTMLElement) => {
    if (squareSection == null) {
        // unreachable
        log.warn(`set percent style square is null.`);
        return;
    }
    const { width, height, x, y } = squareSection.getBoundingClientRect();
    const parent = squareSection.parentElement;
    const { width: pw, height: ph, x: px, y: py } = parent.getBoundingClientRect();
    const widthScale = width / pw;
    const heightScale = height / ph;
    const xDiff = x - px;
    const yDiff = y - py;
    const xScale = xDiff / pw;
    const yScale = yDiff / ph;

    // percentに変換
    squareSection.style.width = `${widthScale * 100}%`;
    squareSection.style.height = `${heightScale * 100}%`;
    squareSection.style.left = `${xScale * 100}%`;
    squareSection.style.top = `${yScale * 100}%`;
    squareSection.style.right = null;
    squareSection.style.bottom = null;

    return { xScale, yScale, widthScale, heightScale };
};

/**
 * 全ての矩形要素を取得する
 */
export const getAllSquares = (): HTMLElement[] => {
    const elmes: HTMLElement[] = Array.from(Context.document.querySelectorAll(".square-annotation"));
    return elmes.filter((s) => s != null);
};

/**
 * 矩形のマウスイベントを有効/無効にする
 */
export const changeSquarePointerEvents = (state: "none" | "auto") => {
    getAllSquares().forEach((elem) => {
        elem.style.pointerEvents = state;
    });
};

class Generator {
    constructor(private _value: number = 0) {}

    /**
     * return next value
     */
    next() {
        this._value++;
        return this._value;
    }

    /**
     * overwrite current value
     */
    set value(value: number) {
        this._value = value;
    }
}

class SquareIdGenerator extends Generator {
    nextId() {
        const id = this.next();
        return `square-annotation-${id}`;
    }

    /**
     * 矩形idを更新する
     */
    updateNextId(ids: number[]) {
        const maxId = Math.max(...ids) + 1;

        // update
        generator.squareId.value = maxId;
    }

    /**
     * 矩形idを更新する
     */
    updateNextId2(elemIds: string[]) {
        let maxId = 0;
        elemIds.forEach((elemId) => {
            const splits = elemId.split("-");
            const ends = splits[splits.length - 1];
            const id = parseInt(ends);
            if (isNaN(id)) {
                log.error(`updateNextId: ${elemId} is invalid.`);
                return;
            }
            if (id > maxId) {
                maxId = id;
            }
        });

        // update
        generator.squareId.value = maxId;
    }
}

class SquareZindexGenerator extends Generator {
    nextIndex() {
        const id = this.next();
        return String(id);
    }
}

export const generator = {
    squareId: new SquareIdGenerator(0),
    squareZindex: new SquareZindexGenerator(100000),
};

import { Context } from "../utils/context.js";
import { log } from "../utils/log.js";
import { ID_PREFIX } from "./style/settings.js";

/**
 * ## 要素idから数値のidを取得する
 * @example "square-annotation-1" -> 1
 */
export const getNumberId = (id: string) => {
    const i = parseInt(id.replace(ID_PREFIX, ""));
    if (isNaN(i)) {
        throw `getId: ${id} is invalid.`;
    }
    return i;
};

/**
 * ## 数値のidから要素idを返す
 * @example 1 -> "square-annotation-1"
 */
export const getStrId = (id: number) => {
    return `${ID_PREFIX}${id}`;
};

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
        return getStrId(id);
    }

    /**
     * 矩形idを更新する
     */
    updateNextId(ids: number[]) {
        const maxId = Math.max(...ids) + 1;

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

import { ExportData, ExportSquareData, SquareData, SquareProps } from "@/square-annotation/types/square";
import { SupportStyle } from "./style/square-style";
import { SQUARE_BACK_COLOR } from "./style/settings";
import { getNumberId, getStrId } from "./util";

export const checkImportData = (squares: SquareData[], pagesCount: number) => {
    squares.forEach((s) => {
        if (s.pageNumber < 1 || pagesCount < s.pageNumber) {
            throw "無効なアノテーション情報です";
        }
    });
};

/**
 * 内部データをexport形式に変換する
 */
export const createCurrentData = (exportData: ExportData): SquareData[] => {
    return toCurrentData(exportData.squares);
};

/**
 * exportデータを内部データ形式に変換する
 */
const toCurrentData = (squares: ExportSquareData[]): SquareData[] => {
    return squares.map((s) => ({
        ...s,
        id: getStrId(s.id),
    }));
};

/**
 * ## 矩形データからexport dataを作成する
 * deep copyする
 */
export const createExportData = (squares: SquareData[]): ExportData => {
    return {
        squares: toExportSquares(squares),
    };
};

const toExportSquares = (squares: SquareData[]): ExportSquareData[] => {
    return squares.map((d) => ({
        id: getNumberId(d.id),
        pageNumber: d.pageNumber,
        props: getStyleProps(d.props),
    }));
};

const getStyleProps = (props?: SquareProps): SquareProps => {
    return {
        x: props?.x ?? 0,
        y: props?.y ?? 0,
        width: props?.width ?? 0,
        height: props?.height ?? 0,
        style: getSupportStyle(props?.style),
    };
};

const getSupportStyle = (style?: SupportStyle): SupportStyle => {
    return {
        backgroundColor: style?.backgroundColor ?? SQUARE_BACK_COLOR,
        border: style?.border ?? null,
    };
};

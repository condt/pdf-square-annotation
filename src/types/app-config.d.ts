/**
 * アプリ設定
 */
export interface AppConfigType {
    toolbar?: {
        exportButton?: boolean;
        importButton?: boolean;
    };
    squareAnnotation?: {
        SquareStyle?: {
            border?: string;
            backgroundColor?: string;
        };
        handlerStyle?: {
            backgroundColor?: string;
        };
    };
}

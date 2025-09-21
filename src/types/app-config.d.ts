/**
 * アプリ設定
 */
export interface AppConfigType {
    toolbar?: {
        exportButton?: boolean;
        importButton?: boolean;
    };
    squareAnnotation?: {
        normalStyle?: {
            border?: string;
            backgroundColor?: string;
        };
        lockedStyle?: {
            border?: string;
            backgroundColor?: string;
        };
        selectedStyle?: {
            border?: string;
        };
        resizeHandlerStyle?: {
            backgroundColor?: string;
            borderRadius?: string;
            size?: string;
            position?: string;
        };
    };
}

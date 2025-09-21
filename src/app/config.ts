import { toggleToolbarButton } from "@/square-annotation/style/toolbar.js";
import { AppConfigType } from "../types/app-config.js";
import {
    RESIZE_HANDLER_BACK_COLOR,
    RESIZE_HANDLER_BORDER_RADIUS,
    RESIZE_HANDLER_POS,
    RESIZE_HANDLER_SIZE,
    SQUARE_BACK_COLOR,
    SQUARE_LOCKED_BACK_COLOR,
    SQUARE_SELECTED_BORDER,
} from "@/square-annotation/style/settings.js";

/**
 * デフォルトの設定値
 */
const DEFAULT_CONFIG: AppConfigType = {
    toolbar: {
        exportButton: true,
        importButton: true,
    },
    squareAnnotation: {
        normalStyle: {
            backgroundColor: SQUARE_BACK_COLOR,
            border: null,
        },
        lockedStyle: {
            backgroundColor: SQUARE_LOCKED_BACK_COLOR,
            border: null,
        },
        selectedStyle: {
            border: SQUARE_SELECTED_BORDER,
        },
        resizeHandlerStyle: {
            backgroundColor: RESIZE_HANDLER_BACK_COLOR,
            borderRadius: RESIZE_HANDLER_BORDER_RADIUS,
            size: RESIZE_HANDLER_SIZE,
            position: RESIZE_HANDLER_POS,
        },
    },
};

export class AppConfig {
    private config: AppConfigType = DEFAULT_CONFIG;

    constructor() {}

    getConfig() {
        return this.config;
    }

    setConfig(config: AppConfigType) {
        this.mergeConfig(config);
        toggleToolbarButton({
            exportButton: this.config.toolbar.exportButton,
            importButton: this.config.toolbar.importButton,
        });
    }

    /**
     * デフォルト値と渡された値をmergeする
     */
    private mergeConfig(newConfig: AppConfigType) {
        newConfig.squareAnnotation ??= {};

        newConfig.toolbar ??= {};
        newConfig.toolbar.exportButton ??= this.config.toolbar.exportButton;
        newConfig.toolbar.importButton ??= this.config.toolbar.importButton;

        newConfig.squareAnnotation.normalStyle ??= {};
        newConfig.squareAnnotation.normalStyle.backgroundColor ??=
            this.config.squareAnnotation.normalStyle.backgroundColor;
        newConfig.squareAnnotation.normalStyle.border ??= this.config.squareAnnotation.normalStyle.border;

        newConfig.squareAnnotation.lockedStyle ??= {};
        newConfig.squareAnnotation.lockedStyle.backgroundColor ??=
            this.config.squareAnnotation.lockedStyle.backgroundColor;
        newConfig.squareAnnotation.lockedStyle.border ??= this.config.squareAnnotation.lockedStyle.border;

        newConfig.squareAnnotation.selectedStyle ??= {};
        newConfig.squareAnnotation.selectedStyle.border ??= this.config.squareAnnotation.selectedStyle.border;

        newConfig.squareAnnotation.resizeHandlerStyle ??= {};
        newConfig.squareAnnotation.resizeHandlerStyle.backgroundColor ??=
            this.config.squareAnnotation.resizeHandlerStyle.backgroundColor;
        newConfig.squareAnnotation.resizeHandlerStyle.borderRadius ??=
            this.config.squareAnnotation.resizeHandlerStyle.borderRadius;
        newConfig.squareAnnotation.resizeHandlerStyle.size ??= this.config.squareAnnotation.resizeHandlerStyle.size;
        newConfig.squareAnnotation.resizeHandlerStyle.position ??=
            this.config.squareAnnotation.resizeHandlerStyle.position;

        this.config = newConfig;
    }
}

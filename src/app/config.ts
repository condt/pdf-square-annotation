import { toggleToolbarButton } from "@/square-annotation/style/toolbar.js";
import { AppConfigType } from "../types/app-config.js";

/**
 * デフォルトの設定値
 */
const DEFAULT_CONFIG: AppConfigType = {
    toolbar: {
        exportButton: true,
        importButton: true,
    },
    squareAnnotation: {
        SquareStyle: {
            backgroundColor: "rgba(0,255,0,0.3)",
            border: null,
        },
        handlerStyle: {
            backgroundColor: "rgba(0,0,200,1)",
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

        newConfig.squareAnnotation.SquareStyle ??= {};
        newConfig.squareAnnotation.SquareStyle.backgroundColor ??=
            this.config.squareAnnotation.SquareStyle.backgroundColor;
        newConfig.squareAnnotation.SquareStyle.border ??= this.config.squareAnnotation.SquareStyle.border;

        newConfig.squareAnnotation.handlerStyle ??= {};
        newConfig.squareAnnotation.handlerStyle.backgroundColor ??=
            this.config.squareAnnotation.handlerStyle.backgroundColor;

        this.config = newConfig;
    }
}

import { AppConfigType } from "../types/app-config.js";

/**
 * デフォルトの設定値
 */
const DEFAULT_CONFIG: AppConfigType = {
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
    config: AppConfigType = DEFAULT_CONFIG;

    constructor() {}

    setConfig(config: AppConfigType) {
        this.mergeConfig(config);
    }

    /**
     * デフォルト値と渡された値をmergeする
     */
    private mergeConfig(newConfig: AppConfigType) {
        newConfig.squareAnnotation ??= {};

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

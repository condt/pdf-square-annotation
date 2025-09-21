import { Mode } from "@/square-annotation/types/square";

/**
 * modeによってtoolbarのスタイルを変える
 */
export const changeToolbarSelected = (currentMode: Mode) => {
    document.querySelectorAll(".mode-button").forEach((button) => {
        button.classList.remove("selected");
    });

    if (currentMode === "edit") {
        const elem = document.getElementById("edit-square-button");
        elem.classList.add("selected");
    } else if (currentMode === "preview") {
        const elem = document.getElementById("preview-button");
        elem.classList.add("selected");
    }
};

/**
 * undo/redoボタンの活性・非活性を設定する
 */
export const changeUndoRedoButtonStyle = (undoEnabled?: boolean, redoEnabled?: boolean) => {
    if (undoEnabled != null) {
        setButtonEnabledStyle(<HTMLElement>document.querySelector(".undo-button"), undoEnabled);
    }
    if (redoEnabled != null) {
        setButtonEnabledStyle(<HTMLElement>document.querySelector(".redo-button"), redoEnabled);
    }
};

const setButtonEnabledStyle = (elem: HTMLElement, enabled: boolean) => {
    if (enabled) {
        elem.classList.remove("disable");
        elem.querySelector("svg").style.fill = "rgb(227, 227, 227)";
    } else {
        elem.classList.add("disable");
        elem.querySelector("svg").style.fill = "rgb(170, 170, 170)";
    }
};

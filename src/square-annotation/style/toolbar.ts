import { Mode } from "@/square-annotation/types/square";

/**
 * toolbarのスタイルを変える
 */
export const changeSelected = (currentMode: Mode) => {
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

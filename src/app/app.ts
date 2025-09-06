import { Task } from "../utils/task.js";

export class App {
    private openState = new Task<void>();

    constructor() {}

    async open(data: Blob | string) {
        const iframe = <HTMLIFrameElement>document.createElement("iframe");
        iframe.id = "pdfjs";
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.style.border = "none";

        if (typeof data === "string") {
            // URL指定の場合
            iframe.src = data;
        } else {
            // URL以外の場合
            const pdfUrl = URL.createObjectURL(data);
            iframe.src = `../pdfjs/web/viewer.html?file=${pdfUrl}`;
        }

        const container = document.getElementById("pdfjs-container");
        container.appendChild(iframe);

        // 初期化完了まで待つ
        return await this.openState.wait();
    }

    /**
     * PDFを開いたら呼ぶ
     */
    successOpen() {
        this.openState.success();
    }
}

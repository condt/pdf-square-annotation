type ContentType = "application/json" | "text/plain";

const deepCopy = (data: any) => {
    return JSON.parse(JSON.stringify(data));
};

/**
 * 指定した内容をファイルとしてダウンロードする
 */
const download = (content: object | string, filename: string, type: ContentType) => {
    const c = typeof content === "string" ? content : JSON.stringify(content);
    const blob = new Blob([c], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
};

/**
 * ファイルを選択する
 */
const selectFile = async (accept: string = "*") => {
    return new Promise<any>((resolve, reject) => {
        const i = <HTMLInputElement>document.createElement("input");
        i.setAttribute("type", "file");
        i.setAttribute("accept", accept);
        i.click();
        i.onchange = async (e: any) => {
            const files = e.target.files as FileList;
            if (files.length === 0) {
                reject("cancel");
                return;
            }
            const file = files[0];
            const text = await file.text();
            resolve(JSON.parse(text));
        };
        i.oncancel = () => {
            reject("cancel");
        };
    });
};

export const utils = {
    deepCopy,
    download,
    selectFile,
};

import { Context } from "../utils/context.js";
import { log } from "../utils/log.js";

export class PDFManager {
    constructor() {}

    /**
     * Pageを全て取得する
     */
    async getPagesAsync() {
        const pages = [];
        for (let i = 1; i <= Context.pagesCount; i++) {
            const page = await this.getPageAsync(i);
            if (page != null) pages.push(page);
        }
        return pages;
    }

    /**
     * Pageを取得する
     */
    async getPageAsync(pageNumber: number) {
        return await Context.pdfjs.getPage(pageNumber);
    }

    /**
     * Page要素を全て取得する
     */
    getPages() {
        const pages: HTMLElement[] = [];
        for (let pageNumber = 1; pageNumber <= Context.pagesCount; pageNumber++) {
            const pageElement: HTMLElement = Context.document.querySelector(
                `div.page[data-page-number="${pageNumber}"]`
            );
            if (pageElement == null) {
                log.error(`page element not found: ${pageNumber}`);
                continue;
            }
            pages.push(pageElement);
        }
        return pages;
    }

    /**
     * Page要素を取得する
     */
    getPage(pageNumber: number): HTMLElement {
        return Context.document.querySelector(`div.page[data-page-number="${pageNumber}"]`);
    }

    /**
     * アノテーション要素からページ要素を取得する
     */
    private getPageElement(annotation: HTMLElement) {
        return annotation.parentElement.parentElement;
    }

    /**
     * アノテーション要素からページ番号を取得する
     */
    getPageNumber(annotation: HTMLElement) {
        const page = this.getPageElement(annotation);
        const pageNumber = parseInt(page.getAttribute("data-page-number"));
        if (isNaN(pageNumber)) {
            throw `[getPageNumber()] invalid annotation: ${annotation}`;
        }
        return pageNumber;
    }

    /**
     * 指定したページのAnnotationLayerを返す
     */
    getAnnotationLayer(page: number | HTMLElement): HTMLElement {
        const pageElement = typeof page === "number" ? this.getPage(page) : page;
        if (pageElement == null) {
            throw `page ${page} not found.`;
        }

        const layer = pageElement.querySelector(".annotationLayer") as HTMLElement;
        if (layer == null) {
            log.debug(`annotation layer ${page} not found.`);
            return null;
        }

        return layer;
    }

    /**
     * 指定したページのTextLayerを返す
     */
    getTextLayer(page: number | HTMLElement): HTMLElement {
        const pageElement = typeof page === "number" ? this.getPage(page) : page;
        if (pageElement == null) {
            throw `page ${page} not found.`;
        }

        const layer = pageElement.querySelector(".textLayer") as HTMLElement;
        if (layer == null) {
            log.debug(`text layer ${page} not found.`);
            return null;
        }

        return layer;
    }
}

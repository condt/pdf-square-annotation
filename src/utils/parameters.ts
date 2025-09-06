/**
 * URLのクエリパラメータを扱うクラス
 */
class QueryParameters {
    private params: URLSearchParams = null;

    /**
     * @param url window.hrefを渡す
     */
    constructor(url?: string) {
        const href = url ?? window.location.href;
        const query = href.replace(window.location.origin + window.location.pathname, "");
        this.params = new URLSearchParams(query);
    }

    get(name: string, defaultValue: string = null): string {
        const v = this.params.get(name);
        if (v == null) {
            return defaultValue;
        }
        return v;
    }
}

/**
 * アプリケーションのクエリパラメータを扱うクラス
 */
export class AppQueryParameters {
    debug: boolean = false;

    constructor() {
        const params = new QueryParameters();
        this.debug = !!params.get("debug");
    }
}

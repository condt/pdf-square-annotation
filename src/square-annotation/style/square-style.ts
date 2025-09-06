export const SUPPORT_STYLE = ["border", "backgroundColor"] as const;
export type SupportStyleKey = (typeof SUPPORT_STYLE)[number];

export type SupportStyle = {
    [key in SupportStyleKey]: string;
};

/**
 * 矩形のサポートされているスタイルを取得する
 */
export const getSupportStyles = (element: HTMLElement): SupportStyle => {
    const values = {};
    for (const propName of SUPPORT_STYLE) {
        values[propName] = element.style[propName];
    }
    return values as SupportStyle;
};

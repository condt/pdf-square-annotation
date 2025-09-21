export class AnnotationContext {
    static lockAnnotationIds: string[] = [];

    /**
     * lockされている矩形ならtrueを返す
     */
    static isLocked(id: string) {
        return AnnotationContext.lockAnnotationIds.some((i) => i === id);
    }

    private constructor() {}
}

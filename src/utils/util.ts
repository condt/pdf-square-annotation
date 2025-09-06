const deepCopy = (data: any) => {
    return JSON.parse(JSON.stringify(data));
};

export const utils = {
    deepCopy,
};

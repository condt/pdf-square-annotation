const getPDFUrl = () => {
    if (window.location.protocol.startsWith("https")) {
        // GitHub Pages: require repository name
        return "/pdf-square-annotation/pdfjs/web/compressed.tracemonkey-pldi-09.pdf";
    } else {
        // local
        return "/pdfjs/web/compressed.tracemonkey-pldi-09.pdf";
    }
};

window.init = async () => {
    const iframe = document.getElementById("pdfjs");

    // set config (optional)
    // iframe.contentWindow.setAppConfig(config);

    // fetch PDF
    const response = await fetch(getPDFUrl());
    const bin = await response.blob();

    // open PDF
    await iframe.contentWindow.openPdf(bin);
};

const config = {
    squareAnnotation: {
        SquareStyle: {
            backgroundColor: "rgba(255,0,0,0.5)",
            border: "1px solid rgba(0,0,255,1)",
        },
        handlerStyle: {
            backgroundColor: "rgba(0,0,0,1)",
        },
    },
};

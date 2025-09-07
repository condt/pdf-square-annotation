window.init = async () => {
    const iframe = document.getElementById("pdfjs");

    // set config (optional)
    // iframe.contentWindow.setAppConfig(config);

    // fetch PDF
    const response = await fetch("/example/compressed.tracemonkey-pldi-09.pdf");
    const bin = await response.blob();

    // open PDF
    await iframe.contentWindow.openPdf(bin);

    console.log("Initialization complete!");
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

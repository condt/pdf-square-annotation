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

// 作成・削除時に発火するイベント
window.addEventListener("change-square", (e) => {
    console.log("==change-square==");
    console.log(e.type);
    console.log(e.detail);
});

// preview modeで矩形ダブルクリック時に発火するイベント
window.addEventListener("dblclick-square", (e) => {
    console.log("==dblclick-square==");
    console.log(e.type);
    console.log(e.detail);
});

// edit modeで矩形mousedown時に発火するイベント
window.addEventListener("mousedown-square", (e) => {
    console.log("==mousedown-square==");
    console.log(e.type);
    console.log(e.detail);
});

window.lockAnnotations = () => {
    const iframe = document.getElementById("pdfjs");
    iframe.contentWindow.lockAnnotations({ annotationIds: [1, 2, 4] });
};

window.unlockAnnotations = () => {
    const iframe = document.getElementById("pdfjs");
    iframe.contentWindow.lockAnnotations({ annotationIds: [] });
};

window.clearUndoStack = () => {
    const iframe = document.getElementById("pdfjs");
    iframe.contentWindow.clearUndoStack();
};

window.allowCreateNew = () => {
    const iframe = document.getElementById("pdfjs");
    iframe.contentWindow.allowCreateNew();
};

window.disallowCreateNew = () => {
    const iframe = document.getElementById("pdfjs");
    iframe.contentWindow.disallowCreateNew();
};

window.setAppConfig = () => {
    const iframe = document.getElementById("pdfjs");
    iframe.contentWindow.setAppConfig(config);
};

window.showCurrentSquares = () => {
    const iframe = document.getElementById("pdfjs");
    iframe.contentWindow.showCurrentSquares();
};

const config = {
    toolbar: {
        exportButton: true,
        importButton: true,
    },
    squareAnnotation: {
        normalStyle: {
            border: "1px solid rgba(0,0,255,1)",
            backgroundColor: "#fff",
        },
        lockedStyle: {
            border: "3px solid #333",
            backgroundColor: "red",
        },
        selectedStyle: {
            backgroundColor: "rgba(0,180,0,0.8)",
            border: "1px solid rgba(255,0,0,1)",
        },
        resizeHandlerStyle: {
            backgroundColor: "#000",
            borderRadius: "10px",
            position: "-3px",
        },
    },
};

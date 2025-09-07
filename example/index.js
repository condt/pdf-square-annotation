const data = [
    {
        id: 1,
        pageNumber: 12,
        props: {
            x: 0.49019607843137253,
            y: 0.23011363636363635,
            width: 0.24142156862745098,
            height: 0.14962121212121213,
            style: {
                border: "2px solid blue",
                backgroundColor: "rgba(255, 0, 50, 0.3)",
            },
        },
    },
    {
        id: 2,
        pageNumber: 12,
        props: {
            x: 0.09068627450980392,
            y: 0.054924242424242424,
            width: 0.1948529411764706,
            height: 0.13920454545454544,
            style: {
                border: "2px solid blue",
                backgroundColor: "rgba(255, 0, 50, 0.3)",
            },
        },
    },
    {
        id: 3,
        pageNumber: 12,
        props: {
            x: 0.5073529411764706,
            y: 0.07765151515151515,
            width: 0.3946078431372549,
            height: 0.10416666666666667,
            style: {
                border: "2px solid blue",
                backgroundColor: "rgba(255, 0, 50, 0.3)",
            },
        },
    },
    {
        id: 4,
        pageNumber: 1,
        props: {
            x: 0.11274509803921569,
            y: 0.08522727272727272,
            width: 0.8259803921568627,
            height: 0.07291666666666667,
            style: {
                border: "2px solid blue",
                backgroundColor: "rgba(255, 0, 50, 0.3)",
            },
        },
    },
    {
        id: 5,
        pageNumber: 1,
        props: {
            x: 0.13848039215686275,
            y: 0.23958333333333334,
            width: 0.7536764705882353,
            height: 0.13068181818181818,
            style: {
                border: "2px solid blue",
                backgroundColor: "rgba(255, 0, 50, 0.3)",
            },
        },
    },
    {
        id: 6,
        pageNumber: 1,
        props: {
            x: 0.05759803921568627,
            y: 0.41571969696969696,
            width: 0.4338235294117647,
            height: 0.11742424242424243,
            style: {
                border: "2px solid blue",
                backgroundColor: "rgba(255, 0, 50, 0.3)",
            },
        },
    },
    {
        id: 7,
        pageNumber: 2,
        props: {
            x: 0.07230392156862746,
            y: 0.07481060606060606,
            width: 0.4215686274509804,
            height: 0.10795454545454546,
            style: {
                border: "2px solid blue",
                backgroundColor: "rgba(255, 0, 50, 0.3)",
            },
        },
    },
    {
        id: 8,
        pageNumber: 10,
        props: {
            x: 0.5098039215686274,
            y: 0.08522727272727272,
            width: 0.4166666666666667,
            height: 0.2840909090909091,
            style: {
                border: "2px solid blue",
                backgroundColor: "rgba(255, 0, 50, 0.3)",
            },
        },
    },
    {
        id: 9,
        pageNumber: 11,
        props: {
            x: 0.08088235294117647,
            y: 0.08428030303030302,
            width: 0.8333333333333334,
            height: 0.3409090909090909,
            style: {
                border: "2px solid blue",
                backgroundColor: "rgba(255, 0, 50, 0.3)",
            },
        },
    },
    {
        id: 10,
        pageNumber: 11,
        props: {
            x: 0.06985294117647059,
            y: 0.6193181818181818,
            width: 0.4522058823529412,
            height: 0.11742424242424243,
            style: {
                border: "2px solid blue",
                backgroundColor: "rgba(255, 0, 50, 0.3)",
            },
        },
    },
    {
        id: 11,
        pageNumber: 11,
        props: {
            x: 0.5036764705882353,
            y: 0.7623106060606061,
            width: 0.41911764705882354,
            height: 0.08996212121212122,
            style: {
                border: "2px solid blue",
                backgroundColor: "rgba(255, 0, 50, 0.3)",
            },
        },
    },
];

const config = {
    squareAnnotation: {
        SquareStyle: {
            backgroundColor: "rgba(255,0,0,0.5)",
            border: "1px solid #555",
        },
        handlerStyle: {
            backgroundColor: "rgba(0,0,0,1)",
        },
    },
};

window.init = async () => {
    const iframe = document.getElementById("pdfjs");

    // set config (optional)
    iframe.contentWindow.setAppConfig(config);

    // fetch PDF
    const response = await fetch("/example/compressed.tracemonkey-pldi-09.pdf");
    const bin = await response.blob();

    // open PDF
    await iframe.contentWindow.openPdf(bin);

    console.log("Initialization complete!");
};

window.importData = () => {
    const iframe = document.getElementById("pdfjs");
    // dataをimportする
    iframe.contentWindow.setAnnotations(data);
};

window.clickPreview = () => {
    const iframe = document.getElementById("pdfjs");
    iframe.contentWindow.startPreview();
    document.getElementById("button1").classList.add("selected");
    document.getElementById("button2").classList.remove("selected");
};

window.clickEdit = () => {
    const iframe = document.getElementById("pdfjs");
    iframe.contentWindow.startEdit();
    document.getElementById("button1").classList.remove("selected");
    document.getElementById("button2").classList.add("selected");
};

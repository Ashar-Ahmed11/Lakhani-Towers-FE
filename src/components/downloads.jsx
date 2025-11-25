import React from "react";
import Noc from "./downloadables/NOC.pdf";
import purchaseOfFlatNoC from "./downloadables/purchaseOfFlatNoc.pdf";
import saleOfFlatNoC from "./downloadables/saleOfFlatNOC.pdf";

const Downloads = () => {
    const files = [
        { title: "No Objection Certificate (NOC)", url: Noc },
        { title: "Purchase of Flat NOC", url: purchaseOfFlatNoC },
        { title: "Sale of Flat NOC", url: saleOfFlatNoC },
    ];

    return (
        <div className="container py-4">
            <h1 className="display-4 mb-4" style={{ fontWeight: 900 }}>
                Downloads
            </h1>

            {files.map((file, index) => (
                <div
                    key={index}
                    className="card mb-3 shadow-sm border-0"
                    style={{ borderRadius: "12px" }}
                >
                    <div className="row g-0 align-items-center">
                        <div className="col-md-9 p-4">
                            <h5 className="card-title mb-1" style={{ fontWeight: 700 }}>
                                {file.title}
                            </h5>
                            <p className="text-muted mb-0">
                                Click the button to download the PDF document.
                            </p>
                        </div>

                        <div className="col-md-3 text-end p-4">
                            <a
                                href={file.url}
                                download
                                className="btn btn-dark px-4 py-2"
                                style={{ fontWeight: 600 }}
                            >
                                Download
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Downloads;

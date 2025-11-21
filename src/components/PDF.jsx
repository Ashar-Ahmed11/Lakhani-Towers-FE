import { useContext, useEffect } from 'react';
import AppContext from './context/appContext';
import { Resolution } from 'react-to-pdf';
import { useParams } from "react-router-dom";
import { usePDF } from 'react-to-pdf';
import { Helmet } from 'react-helmet-async';

function Pdf() {
  const context = useContext(AppContext);
  const { pdfData, getTransactionById } = context;
  const { id } = useParams();

  const { toPDF, targetRef } = usePDF({
    filename: pdfData?.pdfName || "Transaction",
    resolution: Resolution.HIGH
  });

  useEffect(() => {
    const fetchFunc = async () => {
      await getTransactionById(id);
    }
    fetchFunc();
  }, [id]);

  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=1024" />
      </Helmet>

      <div className="container text-center">
        <button
          className="btn btn-outline-primary my-4"
          onClick={() => toPDF()}
        >
          Download PDF
        </button>
      </div>

      <div
        ref={targetRef}
        style={{
          maxWidth: "793px", // A4 width
          minHeight: "1122px", // A4 height
          margin: "0 auto",
          background: "#fff",
          color: "#000",
          padding: "20px"
        }}
        className="shadow-lg rounded"
      >
        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="fw-bold h3 pt-2">Lakhani Towers</h1>
          <p>Garden East, Karach, Sindh, Pakistan</p>
          <p style={{ fontSize: "13px" }}>Ph: 0312-9071455, 0330-6033470</p>
        </div>

        <div className="d-flex justify-content-end px-1">
          <p style={{ fontSize: "13px" }} className="mb-1">
            <strong>Date:</strong>{" "}
            {pdfData?.date ? new Date(pdfData.date).toLocaleDateString() : ""}
          </p>
        </div>

        {/* User & Granter Info */}
        <div className="row mb-2 g-3">
          <div className="col-12 col-md-6 border p-2 rounded-3" style={pdfData.transactionType === "cash" ? { width: "100%" } : {}}>
            <h5 className="fw-bold">User Details</h5>
            <p><strong>Name:</strong> {pdfData?.fullName}</p>
            <p><strong>Phone:</strong> {pdfData?.contactNumber}</p>
            {pdfData.transactionType === "instalments" && <p><strong>CNIC:</strong> {pdfData?.cnicNumber}</p>}
            <p><strong>Address:</strong> {pdfData?.address}</p>
          </div>

          {pdfData.transactionType === "instalments" && (
            <div className="col-12 col-md-6 border p-3 rounded-3">
              <h5 className="fw-bold">Guarantor Details</h5>
              <p><strong>Name:</strong> {pdfData?.granterFullName}</p>
              <p><strong>Phone:</strong> {pdfData?.granterContactNumber}</p>
              <p><strong>CNIC:</strong> {pdfData?.granterCnicNumber}</p>
              <p><strong>Address:</strong> {pdfData?.granterAddress}</p>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="pt-2 pb-2">
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Type</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {pdfData?.productType ? (
                <tr>
                  <td>{pdfData.productType.productName}</td>
                  <td>{pdfData.productType.productType}</td>
                  <td>
                    {pdfData.transactionType === "cash"
                      ? `${pdfData.cashPrice} PKR`
                      : `${pdfData.installmentPrice} PKR `}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    No product information available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* IMEI for Mobiles */}
        {pdfData?.productType?.productType === "mobile" && (
          <div>
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th scope="col">IMEI Number 1</th>
                  <th scope="col">IMEI Number 2</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{pdfData.productType.mobileIMEI1}</td>
                  <td>{pdfData.productType.mobileIMEI2}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Installment Table (compact only for instalments) */}
        {pdfData.transactionType === "instalments" && (
          <div className="py-2">
            <table className="table table-bordered table-sm instalment-table">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Installment Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {pdfData.installments && pdfData.installments.length > 0 ? (
                  pdfData.installments.map((inst, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                       <td>
        {inst.amount
          ? Number(inst.amount).toLocaleString("en-PK", {
              style: "currency",
              currency: "PKR",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          : "0.00 PKR"}
      </td>
                      <td>{inst.status}</td>
                      <td>
                        {inst.date
                          ? new Date(inst.date).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No installments available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes & Price Summary */}
        {pdfData.transactionType === "instalments" && (
          <div className="row">
            <div className="col-6">
              <h5 className="fw-bold mb-2">Notes</h5>
              <p style={{ fontSize: "12px" }} className="opacity-75">
                1. Kamran mobile zone & electronics is not responsible in case of PTA claim and mobile warranty claim.
              </p>
              <p style={{ fontSize: "12px" }} className="opacity-75">
                2. Companies claim centres will be responsible for any issue.
              </p>
              <p style={{ fontSize: "12px" }} className="opacity-75">
                3. Items once sold cannot be taken back.
              </p>
            </div>
            <div className="col-6 p-1">
              <div className="h-100 p-3 border border-dark rounded-4 flex-column d-flex justify-content-center">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Cash price</span>
                  <span>{pdfData?.cashPrice?.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Installment price</span>
                  <span>{pdfData?.installmentPrice?.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Advance</span>
                  <span>{pdfData?.advanceInstalment?.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Remaining Balance</span>
                  <span>
                    {pdfData?.installments
                      ?.filter(ins => ins.status !== "Paid")
                      .reduce((acc, ins) => acc + ins.amount, 0)
                      .toLocaleString("en-PK", { style: "currency", currency: "PKR" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {pdfData.transactionType === "cash" && (
          <>
            <div className="row">
              <div className="col-6"></div>
              <div className="col-6 p-1">
                <div className="h-100 p-3 border border-dark rounded-4 flex-column d-flex justify-content-center">
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Sub Total</span>
                    <span>{pdfData?.cashPrice?.toLocaleString("en")} PKR</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold h3">{pdfData?.cashPrice?.toLocaleString("en")} PKR</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h5 className="fw-bold mb-2">Notes</h5>
              <p className="opacity-75">
                1. Kamran mobile zone & electronics is not responsible in case of PTA claim and mobile warranty claim.
              </p>
              <p className="opacity-75">
                2. Companies claim centres will be responsible for any issue.
              </p>
              <p className="opacity-75">
                3. Items once sold cannot be taken back.
              </p>
            </div>
          </>
        )}
      </div>

      {/* ✅ Only apply compact style if instalments */}
      {pdfData?.transactionType === "instalments" && (
        <style>
          {`
            .instalment-table th, 
            .instalment-table td {
              padding: 2px 4px !important;
              font-size: 11px !important;
              line-height: 1.1 !important;
            }
            .instalment-table th {
              font-size: 12px !important;
            }
          `}
        </style>
      )}
    </>
  );
}

export default Pdf;

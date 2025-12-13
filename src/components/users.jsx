import React, { useState, useEffect, useContext } from "react";
import AppContext from "./context/appContext";
import { Link, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Users = () => {
  const {
    getTransactions,
    getCashTransactions,
    getInstalmentTransactions,
    getAllPendingDueTransactions,
    getPendingInstalmentTransactions,
    getFullyPaidInstalmentTransactions,
    getDueInstalmentTransactions,
  } = useContext(AppContext);

  const { filter: routeFilter, subfilter } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(routeFilter || "all");
  const [subFilter, setSubFilter] = useState(subfilter || "all");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [startDate, setStartDate] = useState(null); // ✅ for start date
  const [endDate, setEndDate] = useState(null);     // ✅ for end date

  const fetchData = async (main, sub) => {
    setLoading(true);
    let data = [];

    if (main === "all") {
      data = await getTransactions();
    } else if (main === "cash") {
      data = await getCashTransactions();
    } else if (main === "instalments") {
      if (sub === "all") {
        data = await getAllPendingDueTransactions();
      } else if (sub === "pending") {
        data = await getPendingInstalmentTransactions();
      } else if (sub === "fully-paid") {
        data = await getFullyPaidInstalmentTransactions();
      } else if (sub === "due") {
        data = await getDueInstalmentTransactions();
      }
    }

    setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (routeFilter) setFilter(routeFilter);
    if (subfilter) setSubFilter(subfilter);
  }, [routeFilter, subfilter]);

  useEffect(() => {
    fetchData(filter, subFilter);
  }, [filter, subFilter]);

  // ✅ Combined filtering logic (search + date range)
  const filteredTransactions = transactions.filter((txn) => {
    const fullNameMatch = txn.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

    const txnDate = new Date(txn.date);
    const startMatch = startDate ? txnDate >= new Date(startDate.setHours(0, 0, 0, 0)) : true;
    const endMatch = endDate ? txnDate <= new Date(endDate.setHours(23, 59, 59, 999)) : true;

    return fullNameMatch && startMatch && endMatch;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="px-5">Users</h1>
        <div>
          <Link to="/dashboard/recycle">
            <button type="button" className="btn btn-outline-danger mx-2">
              Recycle
            </button>
          </Link>
        </div>
      </div>

      {/* ✅ Search bar */}
      <div className="d-flex p-4">
        <input
          type="text"
          placeholder="Search Transaction by User Full Name"
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ✅ Date Range Filter */}
      <div className="d-flex p-3">
        <div className="px-2 mb-2">
          <DatePicker
            className="form-control"
            placeholderText="Start Date"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yy"
            maxDate={endDate || new Date()}
          />
        </div>
        <div className="px-2 mb-2">
          <DatePicker
            className="form-control"
            placeholderText="End Date"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd/MM/yy"
            minDate={startDate}
            maxDate={new Date()}
          />
        </div>
        {/* Optional: Clear Filters */}
        {(startDate || endDate) && (
          <button
            className="btn btn-outline-secondary mx-2 mb-2"
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ✅ Main Filters */}
      <div className="d-flex justify-content-center my-3 flex-wrap">
        <Link to="/dashboard/users/all">
          <button
            className={`btn mx-2 ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
        </Link>

        <Link to="/dashboard/users/cash">
          <button
            className={`btn mx-2 ${filter === "cash" ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setFilter("cash")}
          >
            Cash
          </button>
        </Link>

        <Link to="/dashboard/users/instalments/all">
          <button
            className={`btn mx-2 ${filter === "instalments" ? "btn-warning" : "btn-outline-warning"}`}
            onClick={() => setFilter("instalments")}
          >
            Instalments
          </button>
        </Link>
      </div>

      {/* ✅ Sub Filters */}
      {filter === "instalments" && (
        <div className="d-flex justify-content-center my-2 flex-wrap">
          <Link to="/dashboard/users/instalments/all">
            <button
              className={`btn mx-2 ${subFilter === "all" ? "btn-secondary" : "btn-outline-secondary"}`}
              onClick={() => setSubFilter("all")}
            >
              All Instalments
            </button>
          </Link>

          <Link to="/dashboard/users/instalments/pending">
            <button
              className={`btn mx-2 ${subFilter === "pending" ? "btn-info" : "btn-outline-info"}`}
              onClick={() => setSubFilter("pending")}
            >
              Pending
            </button>
          </Link>

          <Link to="/dashboard/users/instalments/fully-paid">
            <button
              className={`btn mx-2 ${subFilter === "fully-paid" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setSubFilter("fully-paid")}
            >
              Fully Paid
            </button>
          </Link>

          <Link to="/dashboard/users/instalments/due">
            <button
              className={`btn mx-2 ${subFilter === "due" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => setSubFilter("due")}
            >
              Due
            </button>
          </Link>
        </div>
      )}

      {/* ✅ Content */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="container-fluid p-4">
          {filteredTransactions.length === 0 ? (
            <p>No transactions available</p>
          ) : (
            filteredTransactions
              .slice()
              .reverse()
              .map((txn, idx) => (
                <div key={txn._id || idx} className="card mb-3 rounded-4 shadow-sm position-relative">
                  {/* ✅ Badge color */}
                  {txn.transactionType === "instalments" && (() => {
                    let badgeClass = "bg-primary";
                    const hasDue = txn.installments.some((ins) => ins.status === "Due");
                    const allPaid = txn.installments.every((ins) => ins.status === "Paid");
                    if (allPaid) badgeClass = "bg-success";
                    else if (hasDue) badgeClass = "bg-danger";
                    return (
                      <span
                        className={`position-absolute top-0 p-3 start-0 translate-middle badge border border-light rounded-circle ${badgeClass}`}
                      >
                        <span className="visually-hidden">Status Badge</span>
                      </span>
                    );
                  })()}

                  <div className="row g-0 d-flex align-items-center">
                    <div className="col-md-11">
                      <Link
                        to={`/dashboard/update-transactions/${txn._id}`}
                        className="text-decoration-none text-dark"
                      >
                        <div className="card-body mx-2">
                          <h5 className="card-title">{txn.fullName}</h5>
                          <div className="d-flex flex-column">
                            <span>Payment Method: <b>{txn.transactionType}</b></span>
                            <span>Amount: <b>PKR {txn.installmentPrice || txn.cashPrice}</b></span>
                          </div>
                          <p className="card-text">
                            <small className="text-body-secondary">
                              Date {new Date(txn.date).toLocaleDateString("en-GB")}
                            </small>
                          </p>
                        </div>
                      </Link>
                    </div>

                    {txn.transactionType === "instalments" && (
                      <div className="col-md-1 d-flex justify-content-end" style={{ color: "orange" }}>
                        <p className="m-4 fw-bold">
                          {(() => {
                            const remaining = txn.installments
                              .filter((ins) => ins.status !== "Paid")
                              .reduce((acc, ins) => acc + ins.amount, 0);

                            return remaining === 0 ? (
                              <span className="text-success fw-bold">Paid</span>
                            ) : (
                              <span>
                                {remaining.toLocaleString("en-PK", {
                                  style: "currency",
                                  currency: "PKR",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            );
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default Users;

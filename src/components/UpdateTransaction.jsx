import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppContext from "./context/appContext";
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
const UpdateTransaction = () => {
  const { id } = useParams(); // ✅ get transaction id from URL
  const history = useHistory()
  const { products, deleteTransaction, getTransactionById, updateTransaction } = useContext(AppContext);
  const [startDate, setStartDate] = useState(new Date());

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [mobileCost, setMobileCost] = useState(null);
  const [modal, setModal] = useState(false)
  const [instalments, setInstalments] = useState([]);
  const [instalmentDuration, setInstalmentDuration] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products || []);
  const [ProductType, setProductType] = useState({});
  const [ProductName, setProductName] = useState(null);
  const [DeviceCash, setDeviceCash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [advanceInstalment, setAdvanceInstalment] = useState(null);
  const [ProductDetails, setProductDetails] = useState(null);
  const [recycle, setRecycle] = useState(false);
  const [Product, setProduct] = useState(null);
  const [txn, setTxn] = useState({});

  // User Info
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    contactNumber: "",
    cnicNumber: "",
    address: "",
    image: null,
  });

  // Granter Info
  const [granterInfo, setGranterInfo] = useState({
    fullName: "",
    contactNumber: "",
    cnicNumber: "",
    address: "",
    image: null,
  });

  const instalmentArray = Array(12).fill();

  // ✅ fetch transaction details on mount
  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const txn = await getTransactionById(id);
      setAdvanceInstalment(txn.advanceInstalment)
      setTxn(txn)

      console.log("Transaction fetched:", txn);

      if (txn) {
        // Prefill user info
        setUserInfo({
          fullName: txn.fullName || "",
          contactNumber: txn.contactNumber || "",
          cnicNumber: txn.cnicNumber || "",
          address: txn.address || "",
          image: txn.image || null,
        });

        // Prefill granter info
        setGranterInfo({
          fullName: txn.granterFullName || "",
          contactNumber: txn.granterContactNumber || "",
          cnicNumber: txn.granterCnicNumber || "",
          address: txn.granterAddress || "",
          image: txn.granterImage || null,
        });

        // Prefill product & payment info
        setProductType(txn.productType);
        setProduct(txn.productType);
        setStartDate(txn.date)
        setPaymentMethod(txn.transactionType || "cash");
        setInstalments(txn.installments || []);
        setDeviceCash(txn.cashPrice || null);
        setMobileCost(txn.installmentPrice || null);
        setInstalmentDuration(txn.installments?.length || 12);
        setProductDetails(txn.productDetails || null);
      }
    } catch (err) {
      console.error("Error fetching transaction:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {


    fetchTransaction();
  }, [id]);

  // Create instalments dynamically
  const createInstalment = (value, insDuration) => {
    const subCost = Number(value || 0) - Number(advanceInstalment || 0);
    const newCost = subCost / insDuration;

    let arr = [];
    let startDate = new Date();

    for (let index = 0; index < insDuration; index++) {
      let dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + (index + 1)); // month 1 = next month

      arr.push({
        amount: newCost,
        status: "Pending",
        date: dueDate,   // ✅ add date
      });
    }

    setInstalments(arr);
    setInstalmentDuration(insDuration);
  };



  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = products.filter(
      (product) =>
        product.productName.toLowerCase().includes(query.toLowerCase()) ||
        product.wholesalerName.toLowerCase().includes(query.toLowerCase()) ||
        product.productType.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };


  // Cloudinary upload (user + granter)
  const cloudinaryImgUpload = async (file, setter, fieldName) => {
    if (!file) return;
    setLoading(true);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "for_mobile");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dqu8eh3hz/image/upload`,
        { method: "POST", body: data }
      );

      const uploaded = await res.json();
      if (uploaded.secure_url) {
        setter((prev) => ({
          ...prev,
          [fieldName]: uploaded.secure_url,
        }));
      } else {
        console.error("Upload failed:", uploaded);
        alert("Image upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Cloudinary error:", err);
      alert("Something went wrong while uploading.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      cloudinaryImgUpload(files[0], setUserInfo, "image");
    } else {
      setUserInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  useEffect(() => {
    if (mobileCost > 0 && advanceInstalment !== null && instalments.length === 0) {
      createInstalment(mobileCost, instalmentDuration);
    }
  }, [advanceInstalment, mobileCost, instalmentDuration]);


  const handleGranterChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      cloudinaryImgUpload(files[0], setGranterInfo, "image");
    } else {
      setGranterInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdate = async (forceRecycle) => {
    setLoading(true);
    const transactionObject = {
      ...userInfo,
      granterFullName: granterInfo.fullName,
      granterContactNumber: granterInfo.contactNumber,
      granterCnicNumber: granterInfo.cnicNumber,
      granterAddress: granterInfo.address,
      granterImage: granterInfo.image,
      productType: Product,
      productDetails: ProductDetails,
      advanceInstalment: advanceInstalment,
      transactionType: paymentMethod,
      installments: paymentMethod === "instalments" ? instalments : [],
      cashPrice: DeviceCash,
      installmentPrice: mobileCost,
      recycled: forceRecycle,
      date: startDate,
    };

    console.log("Transaction Object:", transactionObject);

    //  createTransaction(transactionObject);
    await updateTransaction(id, transactionObject)
    await fetchTransaction()
    setLoading(false);
  };

  //     const handleUpdate = ()=>{
  //   }

  const convertData = (isoDate) => {
    const date = new Date(isoDate);
    return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear()
  }

  return (
    <div>
      <h1 className="px-4">Update Transaction</h1>

      {loading ? <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div> :
        <>
          <div className="container-fluid p-4">
            <h3 className='py-4'>User Information</h3>
            <input name="fullName" value={userInfo.fullName} onChange={handleUserChange} type="text" placeholder='Full Name' className="my-2 form-control" />
            <input name="contactNumber" value={userInfo.contactNumber} onChange={handleUserChange} type="tel" placeholder='Contact Number' className="my-2 form-control" />
            {txn.transactionType == "instalments" && <input name="cnicNumber" value={userInfo.cnicNumber} onChange={handleUserChange} type="tel" placeholder='CNIC Number' className="my-2 form-control" />}
            <input name="address" value={userInfo.address} onChange={handleUserChange} type="text" placeholder='Address' className="my-2 form-control" />
            <div className="input-group mb-3">
              <input name="image" onChange={handleUserChange} type="file" className="form-control" />
              <label className="input-group-text">User Image</label>
            </div>
            {userInfo.image && (
              <img src={userInfo.image} alt="User" style={{ maxWidth: "150px", borderRadius: "8px" }} />
            )}

            {txn.transactionType == "instalments" && <>
              <h3 className='py-4'>Guarantor Information</h3>
              <input name="fullName" value={granterInfo.fullName} onChange={handleGranterChange} type="text" placeholder='Full Name' className="my-2 form-control" />
              <input name="contactNumber" value={granterInfo.contactNumber} onChange={handleGranterChange} type="tel" placeholder='Contact Number' className="my-2 form-control" />
              <input name="cnicNumber" value={granterInfo.cnicNumber} onChange={handleGranterChange} type="tel" placeholder='CNIC Number' className="my-2 form-control" />
              <input name="address" value={granterInfo.address} onChange={handleGranterChange} type="text" placeholder='Address' className="my-2 form-control" />
              <div className="input-group mb-3">
                <input name="image" onChange={handleGranterChange} type="file" className="form-control" />
                <label className="input-group-text">Guarantor Image</label>
              </div>
              {granterInfo.image && (
                <img src={granterInfo.image} alt="Granter" style={{ maxWidth: "150px", borderRadius: "8px" }} />
              )}
            </>}

            <h3 className='py-4'>Product Type</h3>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="form-control my-2"
            />     {/* Optional search box – uncomment if you still want search */}

            {searchQuery.trim() && filteredProducts.length > 0 && (
              <ul className="list-group my-2">
                {filteredProducts.map(product => (
                  <li
                    key={product._id}
                    className={`list-group-item ${ProductType === product._id ? 'active' : ''}`}
                    onClick={() => { setProductName(product.productName); setProduct(product); handleSearch("") }}
                    style={{ cursor: "pointer" }}
                  >
                    {product.productName} - {product.wholesalerName} ({product.productType}) <br /> Date: {convertData(product.date)}

                  </li>
                ))}
              </ul>
            )}

            {Product && (
              <div className="list-group my-2">
                <div
                  className="list-group-item active d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer" }}
                >
                  <Link target="_blank" style={{textDecoration:"none",color:"white"}} to={`/dashboard/update-products/${Product._id}`}><span>
                    Product Name: <b>{Product.productName}</b> <br />
                    Wholesale Price: {Product.wholesalePrice.toLocaleString("en-US")} <br />
                    Wholesaler Name: {Product.wholesalerName} <br />
                    Date: {convertData(Product.date)}
                  </span>
                  </Link>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => { setProduct(null); }} // your close handler
                    style={{ filter: "invert(38%) sepia(89%) saturate(7500%) hue-rotate(0deg) brightness(90%) contrast(120%)" }}
                  ></button>
                </div>
              </div>
            )}




            <h3 className='py-4'>{ProductName ? ProductName : "Product"} Information</h3>
            {paymentMethod === "instalments" && <input
              onChange={({ target: { value } }) => {
                setMobileCost(value);
                createInstalment(value, 12);
                if (value == 0) setInstalments([]);
              }}
              value={mobileCost || ""}
              disabled={true}
              type="number"
              placeholder="Instalment Price"
              className="my-2 form-control"
            />}

            <input
              onChange={({ target: { value } }) => setDeviceCash(value)}
              disabled={true}
              value={DeviceCash || ""}
              type="number"
              placeholder="Cash Price"
              className="my-2 form-control"
            />
            <textarea
              name="productDescription"
              placeholder="Product Details"
              className="form-control"
              value={ProductDetails || ""}

              onChange={({ target: { value } }) => { setProductDetails(value) }}
            // required
            />

            {/* <h3 className='py-4'>Payment Method</h3>
            <div className="d-flex">
              <button
                disabled={mobileCost <= 0 || loading}
                onClick={() => setPaymentMethod("instalments")}
                className={`btn ${paymentMethod === "instalments" ? "btn-primary" : "btn-outline-primary"} mx-2`}
              >
                Instalment
              </button>
              <button
                disabled={DeviceCash <= 0 || loading}
                onClick={() => setPaymentMethod("cash")}
                className={`btn ${paymentMethod === "cash" ? "btn-primary" : "btn-outline-primary"} mx-2`}
              >
                Cash
              </button>
            </div> */}

            {paymentMethod === "instalments" && <>
              <h3 className='py-4'>Instalments Advance</h3>
              <input
                onChange={({ target: { value } }) => {
                  setAdvanceInstalment(Number(value));

                  if (mobileCost > 0) {
                    createInstalment(mobileCost, instalmentDuration);
                  }
                }}
                value={advanceInstalment || ""}
                disabled={true}
                type="number"
                placeholder="Advance Inputs"
                className="my-2 form-control"
              /></>}

            {paymentMethod === "instalments" && mobileCost > 0 && (
              <>
                <h3 className="py-4">Instalment Duration</h3>
                <div className="py-2">
                  <button
                    className="btn btn-primary m-2"
                    disabled
                  >
                    {instalmentDuration + 1} Months
                  </button>
                </div>
              </>
            )}


            <div className="py-4">
              {(paymentMethod === "instalments" && mobileCost > 0) &&
                instalments.map((e, i) => {
                  const dueDateStr = new Date(e.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });

                  return (
                    <>
                      <div className="card rounded-3 my-3 p-2">
                        <div key={i} className="d-flex align-items-center w-100 mb-2 flex-md-row flex-column">
                          {/* Index */}
                          <span className="px-2 fw-bold d-block d-md-none">{i + 1} Month</span>
                          <span className="px-1 fw-bold d-none d-md-block">{i + 1}</span>

                          {/* Amount input */}
                          <input
                            type="number"
                            step="0.01"
                            value={e.amount === "" ? "" : e.amount}
                            disabled={e.status === "Paid"} // ✅ Disable when Paid
                            onChange={(event) => {
                              const rawValue = event.target.value;

                              setInstalments((prev) => {
                                const updated = prev.map((it) => ({ ...it }));
                                const oldValue = parseFloat(updated[i].amount) || 0;

                                if (rawValue === "") {
                                  updated[i].amount = "";
                                  return updated;
                                }

                                const value = parseFloat(rawValue);
                                if (!Number.isFinite(value)) return prev;

                                const diff = value - oldValue;
                                updated[i].amount = Number(value.toFixed(2));

                                const adjustableIndexes = updated
                                  .map((inst, idx) => ({ ...inst, idx }))
                                  .filter(
                                    (inst) =>
                                      inst.idx !== i &&
                                      (inst.status === "Pending" || inst.status === "Due")
                                  )
                                  .map((inst) => inst.idx);

                                const others = adjustableIndexes.length;
                                if (others === 0) return updated;

                                const prevAdjustableSum = adjustableIndexes.reduce(
                                  (s, idx) => s + (parseFloat(prev[idx].amount) || 0),
                                  0
                                );

                                const adjust = -diff / others;
                                adjustableIndexes.forEach((idx) => {
                                  const base = parseFloat(prev[idx].amount) || 0;
                                  updated[idx].amount = Number((base + adjust).toFixed(2));
                                });

                                const newAdjustableSum = adjustableIndexes.reduce(
                                  (s, idx) => s + (parseFloat(updated[idx].amount) || 0),
                                  0
                                );
                                const intendedNewAdjustableSum = prevAdjustableSum - diff;
                                const roundingCorrection = Number(
                                  (intendedNewAdjustableSum - newAdjustableSum).toFixed(2)
                                );

                                if (roundingCorrection !== 0 && adjustableIndexes.length > 0) {
                                  const lastIdx = adjustableIndexes[adjustableIndexes.length - 1];
                                  updated[lastIdx].amount = Number(
                                    (
                                      (parseFloat(updated[lastIdx].amount) || 0) + roundingCorrection
                                    ).toFixed(2)
                                  );
                                }

                                return updated;
                              });
                            }}
                            className="my-2 form-control w-100 w-md-auto"
                          />

                          {/* Date Picker */}
                          <DatePicker
                            selected={e.date ? new Date(e.date) : null}
                            onChange={(date) => {
                              const updated = [...instalments];
                              updated[i].date = date;
                              setInstalments(updated);
                            }}
                            disabled={e.status === "Paid"} // ✅ Disable when Paid
                            dateFormat="dd/MM/yy"
                            className="form-control mx-1 bg-light w-100 w-md-auto my-1 my-md-0"
                            placeholderText="Select due date"
                          />


                          {/* Status toggle */}
                          <div className="d-flex mx-2">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...instalments];
                                updated[i].status =
                                  updated[i].status === "Paid" ? "Pending" : "Paid";
                                setInstalments(updated);
                              }}
                              className={`btn mx-1 my-1 my-md-0 ${e.status === "Paid" ? "btn-success" : "btn-outline-success"
                                }`}
                            >
                              {e.status === "Paid" ? "Paid" : "Paid"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...instalments];
                                if (updated[i].status === "Pending") {
                                  updated[i].status = "Due";
                                } else if (updated[i].status === "Due") {
                                  updated[i].status = "Pending";
                                }
                                setInstalments(updated);
                              }}
                              disabled={e.status === "Paid"} // ✅ Disable if Paid
                              className={`btn mx-1 my-1 my-md-0 ${e.status === "Paid"
                                ? "btn-success"
                                : e.status === "Due"
                                  ? "btn-danger"
                                  : "btn-outline-secondary"
                                }`}
                            >
                              Due
                            </button>
                          </div>
                        </div>

                        {/* ✅ Status text below row */}
                        <div className="mb-3 ">
                          <span
                            className={`fw-bold ${e.status === "Paid" ? "text-success" : "text-warning"
                              }`}
                          >
                            Status: {e.status}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })}
            </div>

            <div>
              <h4>Date</h4>
              <DatePicker dateFormat="dd/MM/yy" className='form-control' selected={startDate} onChange={(date) => setStartDate(date)} />
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-outline-primary"
                disabled={loading}
                onClick={() => {
                  setModal(true);
                  history.push(`/pdf/${id}`);
                }}
              >
                Create Quotation
              </button>

              <button
                type="button"
                className="btn btn-outline-danger mx-2"
                disabled={loading}
                onClick={() => setModal(true)}
              >
                Delete Transaction
              </button>
              <button
                onClick={() => { handleUpdate(false) }}
                className="btn btn-outline-success"
                disabled={loading}
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : "Update Transaction"}
              </button>
            </div>
          </div>
          {modal && (
            <div
              className="modal fade show"
              tabIndex="-1"
              style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Delete</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setModal(false)}
                    />
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to delete this product?</p>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={async () => {
                        setModal(false);
                        // await deleteTransaction(id)
                        setRecycle(true)
                        await handleUpdate(true)
                        history.push("/dashboard/users/all")
                        //   setNotify(true)

                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      }
    </div>
  )
};

export default UpdateTransaction;

import React from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useLocation
} from "react-router-dom";
import { useContext, useEffect, useState } from 'react';
import AppContext from './context/appContext';

const AdminLinks = ({mobile}) => {
        const location = useLocation();
        const { customHeaders, getCustomHeaders, getAdminMe } = useContext(AppContext);
        const [me, setMe] = useState(null);

        useEffect(() => { getCustomHeaders(); }, [getCustomHeaders]);
        useEffect(() => { (async()=> setMe(await getAdminMe()))(); }, [getAdminMe]);
    
    return (
        <>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
               
                    to="/dashboard"
                    className={`customlinks nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Home</span>
                </Link>
            </li>
            {me?.email === 'admin@lakhanitowers.com' && (
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
                    to="/dashboard/managers"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/managers") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-people"></i>{" "}
                    <span className="ms-1 text-light">Managers</span>
                </Link>
            </li>
            )}
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
                    to="/dashboard/loans"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/loans") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Loans</span>
                </Link>
            </li>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
                    to="/dashboard/shops"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/shops") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Shops</span>
                </Link>
            </li>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
                    to="/dashboard/shops-maintenance"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/shops-maintenance") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Shops Maintanance</span>
                </Link>
            </li>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
                    to="/dashboard/all-incomings"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/all-incomings") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">All Incomings</span>
                </Link>
            </li>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
                    to="/dashboard/all-expenses"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/all-expenses") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">All Expenses</span>
                </Link>
            </li>

            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
              
                    to="/dashboard/flats"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/flats") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Flat</span>
                </Link>
            </li>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
              
                    to="/dashboard/users"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/users") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Users</span>
                </Link>
            </li>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
              
                    to="/dashboard/employees"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/employees") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Employee</span>
                </Link>
            </li>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
              
                    to="/dashboard/downloads"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/downloads") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Downloads</span>
                </Link>
            </li>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
              
                    to="/dashboard/salaries"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/salaries") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Salaries</span>
                </Link>
            </li>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
              
                    to="/dashboard/maintenance"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/maintenance") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Maintanance</span>
                </Link>
            </li>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
              
                    to="/dashboard/custom-headers"
                    className={`customlinks nav-link ${location.pathname === "/dashboard/custom-headers" ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Custom Headers</span>
                </Link>
            </li>

            {customHeaders?.map((h) => (
                <li key={h._id} data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                    <Link
                        to={`/dashboard/custom-headers/${h._id}`}
                        className={`customlinks nav-link ${location.pathname.startsWith(`/dashboard/custom-headers/${h._id}`) ? "active" : ""}`}
                    >
                        <i className="fs-4 bi-house"></i>{" "}
                        <span className="ms-1 text-light">{h.headerName}</span>
                    </Link>
                </li>
            ))}
            
     
        </>
    )
}

export default AdminLinks
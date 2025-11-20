import React from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useLocation
} from "react-router-dom";
import { useContext, useEffect } from 'react';
import AppContext from './context/appContext';

const AdminLinks = ({mobile}) => {
        const location = useLocation();
        const { customHeaders, getCustomHeaders } = useContext(AppContext);

        useEffect(() => { getCustomHeaders(); }, [getCustomHeaders]);
    
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
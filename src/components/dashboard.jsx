import React, { useEffect } from "react";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useLocation
} from "react-router-dom";

import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

import AdminLinks from "./adminLinks";
import Home from "./home";
import UsersPage from "./users/UsersPage";
import CreateUser from "./users/CreateUser";
import EditUser from "./users/EditUser";
import EmployeesPage from "./employees/EmployeesPage";
import CreateEmployee from "./employees/CreateEmployee";
import EditEmployee from "./employees/EditEmployee";
import FlatsPage from "./flats/FlatsPage";
import CreateFlat from "./flats/CreateFlat";
import EditFlat from "./flats/EditFlat";
import CreateCustomHeader from "./customHeaders/CreateCustomHeader";
import CustomHeaderPage from "./customHeaders/CustomHeaderPage";
import CustomHeadersPage from "./customHeaders/CustomHeadersPage";
import EditCustomHeader from "./customHeaders/EditCustomHeader";
import CreateCustomHeaderRecord from "./customHeaders/CreateCustomHeaderRecord";
import EditCustomHeaderRecord from "./customHeaders/EditCustomHeaderRecord";
import AllIncomings from "./customHeaders/AllIncomings";
import AllExpenses from "./customHeaders/AllExpenses";
import SalariesPage from "./salaries/SalariesPage";
import CreateSalary from "./salaries/CreateSalary";
import EditSalary from "./salaries/EditSalary";
import MaintenancePage from "./maintenance/MaintenancePage";
import CreateMaintenance from "./maintenance/CreateMaintenance";
import EditMaintenance from "./maintenance/EditMaintenance";
import Downloads from "./downloads";
import LoansPage from "./loans/LoansPage";
import CreateLoan from "./loans/CreateLoan";
import EditLoan from "./loans/EditLoan";
import ShopsPage from "./shops/ShopsPage";
import CreateShop from "./shops/CreateShop";
import EditShop from "./shops/EditShop";
import ShopMaintenancePage from "./shopMaintenance/ShopMaintenancePage";
import CreateShopMaintenance from "./shopMaintenance/CreateShopMaintenance";
import EditShopMaintenance from "./shopMaintenance/EditShopMaintenance";
import ManagersPage from "./managers/ManagersPage";
import CreateManager from "./managers/CreateManager";
import EditManager from "./managers/EditManager";
import SubHeadersPage from "./subHeaders/SubHeadersPage";
import CreateSubHeader from "./subHeaders/CreateSubHeader";
import EditSubHeader from "./subHeaders/EditSubHeader";
import TransferOwnership from "./TransferOwnership";
import PayMaintenance from "./pay/PayMaintenance";
import Pay from "./pay/Pay";
import PayShopMaintenance from "./pay/PayShopMaintenance";
import PaySalaries from "./pay/PaySalaries";
import PayElectricityBill from "./pay/PayElectricityBill";
import PayMisc from "./pay/PayMisc";
import ReceiveEvents from "./pay/ReceiveEvents";
import Expenses from "./expenses/Expenses";
import Incomings from "./incomings/Incomings";
import ElectricityBillsPage from "./electricity/ElectricityBillsPage";
import CreateElectricityBill from "./electricity/CreateElectricityBill";
import EditElectricityBill from "./electricity/EditElectricityBill";
import MiscExpensesPage from "./misc/MiscExpensesPage";
import CreateMiscExpense from "./misc/CreateMiscExpense";
import EditMiscExpense from "./misc/EditMiscExpense";
import EventsPage from "./events/EventsPage";
import CreateEvent from "./events/CreateEvent";
import EditEvent from "./events/EditEvent";
import ReceiptsPage from "./receipts/ReceiptsPage";

// import { useEffect } from "react";
const Dashboard = () => {
    const location = useLocation();

    const history = useHistory()

    const handleLogout = () => {
        localStorage.removeItem('auth-token');
        history.push('/admin');
    }


    useEffect(() => {
        const token = localStorage.getItem('auth-token');
        if (!token) history.push('/admin');
    }, [history]);
   



    return (
        <div>
            {/* Navbar for mobile */}
            <nav className="navbar navbar-dark bg-secondary d-md-none">
                <div className="container-fluid">
                    <button
                        className="btn btn-outline-light"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#mobileSidebar"
                        aria-controls="mobileSidebar"
                    >
                        ☰ Menu
                    </button>

                    <div className="dropdown">
                        <a
                            href="#"
                            className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                            id="dropdownUser1"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <div className="position-relative">
                                <img
                                    src="https://png.pngtree.com/png-vector/20220529/ourmid/pngtree-black-user-icon-flat-and-simple-vector-people-avatar-icon-vector-png-image_46750236.jpg"
                                    alt="profile"
                                    width="30"
                                    height="30"
                                    className="rounded-circle"
                                />
                                <span class="position-absolute top-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle">
                                    <span class="visually-hidden">New alerts</span>
                                </span>
                            </div>
                            <span className="d-sm-inline mx-1">Admin</span>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end text-small shadow">
                            <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container-fluid">
                <div className="row flex-nowrap">
                    {/* Sidebar for larger screens */}
                    <div style={{ position: "sticky", height: "100vh", top: 0 }} className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-secondary d-none d-md-block">
                        <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100" style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '260px', overflowY: 'auto' }}>
                            <a
                                href="/dashboard/"
                                className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none"
                            >
                                <span className="fs-5 d-none d-sm-inline">Menu</span>
                            </a>
                            <ul
                                className="nav w-100 nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
                                id="menu"
                            >
                                <AdminLinks />
                            </ul>
                            <hr />
                            <div className="dropdown pb-4">
                                <a
                                    href="#"
                                    className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                                    id="dropdownUser1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <div className="position-relative">
                                        <img
                                            src="https://png.pngtree.com/png-vector/20220529/ourmid/pngtree-black-user-icon-flat-and-simple-vector-people-avatar-icon-vector-png-image_46750236.jpg"
                                            alt="profile"
                                            width="30"
                                            height="30"
                                            className="rounded-circle"
                                        />
                                        <span class="position-absolute top-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle">
                                            <span class="visually-hidden">New alerts</span>
                                        </span>
                                    </div>
                                    <span className="d-none d-sm-inline mx-1">Admin</span>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
                                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Offcanvas Sidebar for Mobile */}
                    <div
                        className="offcanvas offcanvas-start bg-secondary text-white"
                        id="mobileSidebar"
                        aria-labelledby="mobileSidebarLabel"
                    >
                        <div className="offcanvas-header">
                            <h5 className="offcanvas-title" id="mobileSidebarLabel">
                                Menu
                            </h5>
                            <button
                                type="button"
                                className="btn-close text-reset"
                                data-bs-dismiss="offcanvas"
                                aria-label="Close"
                                style={{ filter: "invert(1)", opacity: 1 }}
                            ></button>
                        </div>
                        <div className="offcanvas-body">
                            <ul className="nav nav-pills flex-column">

                                <AdminLinks mobile={true} />
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                 <div className="col py-3">
                 
                        <Switch>
                            <Route exact path="/dashboard/">
                            <Home/>
                            </Route>
                        </Switch>
                        <Switch>
                            <Route exact path="/dashboard/users" component={UsersPage} />
                            <Route exact path="/dashboard/create-user" component={CreateUser} />
                            <Route exact path="/dashboard/edit-user/:id" component={EditUser} />

                            <Route exact path="/dashboard/create-custom-header" component={CreateCustomHeader} />
                            <Route exact path="/dashboard/custom-headers" component={CustomHeadersPage} />
                            <Route exact path="/dashboard/custom-headers/:id" component={CustomHeaderPage} />
                            <Route exact path="/dashboard/edit-custom-header/:id" component={EditCustomHeader} />
                            <Route exact path="/dashboard/custom-headers/:id/create-record" component={CreateCustomHeaderRecord} />
                            <Route exact path="/dashboard/custom-headers/:id/edit-record/:recordId" component={EditCustomHeaderRecord} />
                            <Route exact path="/dashboard/all-incomings" component={AllIncomings} />
                            <Route exact path="/dashboard/all-expenses" component={AllExpenses} />
                            <Route exact path="/dashboard/sub-headers" component={SubHeadersPage} />
                            <Route exact path="/dashboard/create-sub-header" component={CreateSubHeader} />
                            <Route exact path="/dashboard/edit-sub-header/:id" component={EditSubHeader} />

                            <Route exact path="/dashboard/transaction">
                                <h1 className="text-center">Transaction</h1>
                            </Route>
                            <Route exact path="/dashboard/downloads" component={Downloads} />
                            <Route exact path="/dashboard/transfer-ownership" component={TransferOwnership} />
                            <Route exact path="/dashboard/pay" component={Pay} />
                            <Route exact path="/dashboard/pay-maintenance" component={PayMaintenance} />
                            <Route exact path="/dashboard/pay-shop-maintenance" component={PayShopMaintenance} />
                            <Route exact path="/dashboard/pay-salaries" component={PaySalaries} />
                            <Route exact path="/dashboard/pay-electricity-bill" component={PayElectricityBill} />
                            <Route exact path="/dashboard/pay-misc" component={PayMisc} />
                            <Route exact path="/dashboard/receive-events" component={ReceiveEvents} />

                            
                            <Route exact path="/dashboard/expenses" component={Expenses} />
                            <Route exact path="/dashboard/electricity-bills" component={ElectricityBillsPage} />
                            <Route exact path="/dashboard/create-electricity-bill" component={CreateElectricityBill} />
                            <Route exact path="/dashboard/edit-electricity-bill/:id" component={EditElectricityBill} />
                            <Route exact path="/dashboard/misc-expenses" component={MiscExpensesPage} />
                            <Route exact path="/dashboard/create-misc-expense" component={CreateMiscExpense} />
                            <Route exact path="/dashboard/edit-misc-expense/:id" component={EditMiscExpense} />
                            <Route exact path="/dashboard/incomings" component={Incomings} />
                            <Route exact path="/dashboard/events" component={EventsPage} />
                            <Route exact path="/dashboard/create-event" component={CreateEvent} />
                            <Route exact path="/dashboard/edit-event/:id" component={EditEvent} />
                            <Route exact path="/dashboard/receipts" component={ReceiptsPage} />
                            <Route exact path="/dashboard/flats" component={FlatsPage} />
                            <Route exact path="/dashboard/create-flat" component={CreateFlat} />
                            <Route exact path="/dashboard/edit-flat/:id" component={EditFlat} />
                            <Route exact path="/dashboard/employees" component={EmployeesPage} />
                            <Route exact path="/dashboard/create-employee" component={CreateEmployee} />
                            <Route exact path="/dashboard/edit-employee/:id" component={EditEmployee} />
                            <Route exact path="/dashboard/salaries" component={SalariesPage} />
                            <Route exact path="/dashboard/create-salary" component={CreateSalary} />
                            <Route exact path="/dashboard/edit-salary/:id" component={EditSalary} />

                            <Route exact path="/dashboard/maintenance" component={MaintenancePage} />
                            <Route exact path="/dashboard/create-maintenance" component={CreateMaintenance} />
                            <Route exact path="/dashboard/edit-maintenance/:id" component={EditMaintenance} />

                            <Route exact path="/dashboard/loans" component={LoansPage} />
                            <Route exact path="/dashboard/create-loan" component={CreateLoan} />
                            <Route exact path="/dashboard/edit-loan/:id" component={EditLoan} />

                            <Route exact path="/dashboard/shops" component={ShopsPage} />
                            <Route exact path="/dashboard/create-shop" component={CreateShop} />
                            <Route exact path="/dashboard/edit-shop/:id" component={EditShop} />

                            <Route exact path="/dashboard/shops-maintenance" component={ShopMaintenancePage} />
                            <Route exact path="/dashboard/create-shop-maintenance" component={CreateShopMaintenance} />
                            <Route exact path="/dashboard/edit-shop-maintenance/:id" component={EditShopMaintenance} />

                            <Route exact path="/dashboard/managers" component={ManagersPage} />
                            <Route exact path="/dashboard/create-manager" component={CreateManager} />
                            <Route exact path="/dashboard/edit-manager/:id" component={EditManager} />
                        </Switch>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default Dashboard;



// <Route path="/dashboard/user-dashboard/staking">
// <Staking/>

// </Route>
// <Route path="/dashboard/user-dashboard/transfer">
// <Transfer/>

// </Route>
// <Route path="/dashboard/user-dashboard/referrals">
// {/* <h1>hellworld</h1> */}
// <Referrals/>

// </Route>
// <Route path="/dashboard/user-dashboard/withdraw">
// <Withdraw/>

// </Route>
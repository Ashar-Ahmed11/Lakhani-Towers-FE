import logo from './logo.svg';
import './App.css';
import { useContext } from 'react';
import AppContext from './components/context/appContext';
import { Switch, Route, Link, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import Admin from './components/admin';
import Dashboard from './components/dashboard';
import CHRecordPDF from './components/customHeaders/CustomHeaderRecordPDF';
import SalaryPDF from './components/salaries/SalaryPDF';
import MaintenancePDF from './components/maintenance/MaintenancePDF';
import AllIncomingsPDF from './components/customHeaders/AllIncomingsPDF';
import AllExpensesPDF from './components/customHeaders/AllExpensesPDF';
import SalariesListPDF from './components/salaries/SalariesListPDF';
import MaintenanceListPDF from './components/maintenance/MaintenanceListPDF';
import ShopMaintenanceListPDF from './components/shopMaintenance/ShopMaintenanceListPDF';
import LoansListPDF from './components/loans/LoansListPDF';
import CustomHeaderListPDF from './components/customHeaders/CustomHeaderListPDF';
import LoanPDF from './components/loans/LoanPDF';
import ShopMaintenancePDF from './components/shopMaintenance/ShopMaintenancePDF';
import DashboardPDF from './components/dashboard/DashboardPDF';
import PayMaintenancePDF from './components/pay/PayMaintenancePDF';
import PayShopMaintenancePDF from './components/pay/PayShopMaintenancePDF';
import PaySalariesPDF from './components/pay/PaySalariesPDF';
import FlatsListPDF from './components/flats/FlatsListPDF';
import ShopsListPDF from './components/shops/ShopsListPDF';
import EmployeesListPDF from './components/employees/EmployeesListPDF';

function App() {
  const context = useContext(AppContext)
  const { helloworld } = context
  console.log(helloworld);
  const history = useHistory()

  return (
    <>

     
      <div>


        <Switch>


          <Route path="/" exact>
           {()=>{
            history.push('/dashboard')
            return(
              null
            )
           }}
          </Route>

          <Route path="/dashboard"  >
            <Dashboard />
          </Route>

          <Route path="/pdf/custom-headers/:id/record/:recordId" exact>
            <CHRecordPDF />
          </Route>
          <Route path="/pdf/salaries/:id" exact>
            <SalaryPDF />
          </Route>
          <Route path="/pdf/maintenance/:id" exact>
            <MaintenancePDF />
          </Route>
          <Route path="/pdf/all-incomings" exact>
            <AllIncomingsPDF />
          </Route>
          <Route path="/pdf/all-expenses" exact>
            <AllExpensesPDF />
          </Route>
          <Route path="/pdf/salaries" exact>
            <SalariesListPDF />
          </Route>
          <Route path="/pdf/maintenances" exact>
            <MaintenanceListPDF />
          </Route>
          <Route path="/pdf/shops-maintenance" exact>
            <ShopMaintenanceListPDF />
          </Route>
          <Route path="/pdf/shop-maintenance/:id" exact>
            <ShopMaintenancePDF />
          </Route>
          <Route path="/pdf/dashboard" exact>
            <DashboardPDF />
          </Route>
          <Route path="/pdf/pay-maintenance" exact>
            <PayMaintenancePDF />
          </Route>
          <Route path="/pdf/pay-shop-maintenance" exact>
            <PayShopMaintenancePDF />
          </Route>
          <Route path="/pdf/pay-salaries" exact>
            <PaySalariesPDF />
          </Route>
          <Route path="/pdf/flats-list" exact>
            <FlatsListPDF />
          </Route>
          <Route path="/pdf/shops-list" exact>
            <ShopsListPDF />
          </Route>
          <Route path="/pdf/employees-list" exact>
            <EmployeesListPDF />
          </Route>
          <Route path="/pdf/loans" exact>
            <LoansListPDF />
          </Route>
          <Route path="/pdf/custom-headers/:id" exact>
            <CustomHeaderListPDF />
          </Route>
          <Route path="/pdf/loans/:id" exact>
            <LoanPDF />
          </Route>

          <Route path="/admin" exact>
            <Admin />
          </Route>
          <Route path="/about" exact>
            <h1 className="text-center">About Component</h1>
          </Route>
          <Route path="/users" exact>
            <h1 className="text-center">Users Component</h1>
          </Route>
        </Switch>
      </div>

    </>

  );
}

export default App;

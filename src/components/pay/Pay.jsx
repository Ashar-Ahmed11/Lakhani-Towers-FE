import React from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const Card = ({ title, desc, to, icon, variant }) => {
  const history = useHistory();
  const bg = variant ? `bg-${variant}` : 'bg-primary';
  return (
    <div className="col-12 col-md-6 col-xl-4">
      <div
        className={`card border-0 ${bg} text-white shadow-sm rounded-4`}
        style={{ cursor:'pointer', transition:'transform .15s ease, box-shadow .15s ease' }}
        onClick={()=>history.push(to)}
        onMouseEnter={(e)=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.classList.add('shadow'); }}
        onMouseLeave={(e)=>{ e.currentTarget.style.transform='none'; e.currentTarget.classList.remove('shadow'); }}
      >
        <div className="card-body d-flex align-items-center gap-3">
          <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width:56, height:56 }}>
            <i className={`fs-3 ${icon||'bi-cash'}`}></i>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0">{title}</h5>
              <i className="bi bi-arrow-right-short fs-3"></i>
            </div>
            {desc ? <div className="small text-white-50 mt-1">{desc}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const Pay = () => {
  return (
    <div className="container py-3">
      <div className="d-flex align-items-end justify-content-between">
        <div>
          <h1 className="display-5 mb-0" style={{ fontWeight: 900 }}>Pay</h1>
          <div className="text-muted">Choose what you want to pay</div>
        </div>
      </div>
      <div className="row g-3 mt-3">
        <Card title="Pay Maintenance" desc="Flats: Outstandings, Other, Monthly" to="/dashboard/pay-maintenance" icon="bi-house" variant="primary" />
        <Card title="Pay Shop Maintenance" desc="Shops: Outstandings, Other, Monthly" to="/dashboard/pay-shop-maintenance" icon="bi-shop" variant="info" />
        <Card title="Pay Salaries" desc="Employees: Payables, Monthly, Loan" to="/dashboard/pay-salaries" icon="bi-people" variant="warning" />
      </div>
    </div>
  );
};

export default Pay;



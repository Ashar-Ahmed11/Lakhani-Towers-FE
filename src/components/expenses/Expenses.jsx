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
            <i className={`fs-3 ${icon||'fa fa-file-text-o'}`}></i>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0">{title}</h5>
              <i className="fa fa-angle-right fs-3"></i>
            </div>
            {desc ? <div className="small text-white-50 mt-1">{desc}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const Expenses = () => {
  return (
    <div className="container py-3">
      <div className="d-flex align-items-end justify-content-between">
        <div>
          <h1 className="display-5 mb-0" style={{ fontWeight: 900 }}>Expenses</h1>
          <div className="text-muted">Choose an expense category</div>
        </div>
      </div>
      <div className="row g-3 mt-3">
        <Card title="KE Electricity Bill" desc="Manage electricity bills" to="/dashboard/electricity-bills" icon="fa fa-bolt" variant="danger" />
        <Card title="Miscellaneous Expense" desc="Other expenses" to="/dashboard/misc-expenses" icon="fa fa-file-text-o" variant="secondary" />
      </div>
    </div>
  );
};

export default Expenses;



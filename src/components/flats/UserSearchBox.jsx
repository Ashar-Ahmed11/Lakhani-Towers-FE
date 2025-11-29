import React from 'react';

const UserSearchBox = ({ value, onChange, results, onPick, disabled }) => {
  return (
    <div className="my-2">
      <input
        type="text"
        className="form-control"
        placeholder="Search users..."
        value={value}
        onChange={(e)=>{ if(disabled) return; onChange(e.target.value) }}
        disabled={!!disabled}
      />
      {value?.trim() && (results?.length || 0) > 0 && (
        <ul className="list-group my-2">
          {results.map(u => (
            <li key={u._id} className="list-group-item" style={{cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .6 : 1}} onClick={()=>{ if(disabled) return; onPick(u) }}>
              {u.userName} - {u.userMobile}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearchBox;



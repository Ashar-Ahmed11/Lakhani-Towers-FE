import React from 'react';

const UserSearchBox = ({ value, onChange, results, onPick }) => {
  return (
    <div className="my-2">
      <input
        type="text"
        className="form-control"
        placeholder="Search users..."
        value={value}
        onChange={(e)=>onChange(e.target.value)}
      />
      {value?.trim() && (results?.length || 0) > 0 && (
        <ul className="list-group my-2">
          {results.map(u => (
            <li key={u._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>onPick(u)}>
              {u.userName} - {u.userMobile}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearchBox;



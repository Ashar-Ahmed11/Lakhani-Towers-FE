import React, { useState } from "react";

const VariantsManager = ({variants, setVariants}) => {
 
//   console.log(variants);
  
  const handleChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setVariants([...variants, { variant: "", price: "" }]);
  };

  const handleDelete = (e, index) => {
    e.preventDefault();
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  return (
    <div className=" my-4">
      {/* <h5 className="mb-3">Product Variants</h5> */}

      {variants.map((variant, index) => (
        <div
          key={index}
          className="d-flex align-items-center gap-2 mb-2 border rounded p-2"
        >
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            value={variant.variant}
            onChange={(e) =>
              handleChange(index, "variant", e.target.value)
            }
          />
          <input
            type="text"
            className="form-control"
            placeholder="Number"
            value={variant.price}
            onChange={(e) =>
              handleChange(index, "price", e.target.value)
            }
          />
          <span
            className="badge bg-danger p-2"
            style={{ cursor: "pointer" }}
            onClick={(e) => handleDelete(e, index)}
          >
            ✕
          </span>
        </div>
      ))}

      <button className="btn  mt-2" onClick={(e) => handleAdd(e)}>
        + Add Variant
      </button>
    </div>
  );
};

export default VariantsManager;

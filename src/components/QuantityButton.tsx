import React, { useState } from "react";

interface QuantityButtonProps {
  className: string;
}

const QuantityButton = ({ className }: QuantityButtonProps) => {
  const [quant, setQuant] = useState(0);

  const addQuant = () => {
    setQuant(quant + 1);
  };

  const subQuant = () => {
    setQuant(quant - 1);
  };

  return (
    <div className={className}>
      {quant > 0 ? (
        <div className="menu-item-button-row">
          <button className="menu-item-button sub" onClick={subQuant}>
            -
          </button>
          <span className="menu-item-text">{quant}</span>
          <button className="menu-item-button plus" onClick={addQuant}>
            +
          </button>
        </div>
      ) : (
        <button className="menu-item-button" onClick={addQuant}>
          Add
        </button>
      )}
    </div>
  );
};

export default QuantityButton;

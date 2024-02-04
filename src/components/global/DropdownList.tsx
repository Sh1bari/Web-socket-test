import React from "react";
import Dropdown from "react-bootstrap/Dropdown";

interface DropdownListProps {
  selectedValue: string;
  options: string[];
  onSelect: (value: string) => void;
}

const DropdownList: React.FC<DropdownListProps> = ({
  selectedValue,
  options,
  onSelect,
}) => {
  const handleMouseEnter = (event: React.MouseEvent<HTMLLIElement>) => {
    if (selectedValue !== event.currentTarget.innerText) {
      event.currentTarget.style.backgroundColor = "#e0e0e0";
    }
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLLIElement>) => {
    if (selectedValue !== event.currentTarget.innerText) {
      event.currentTarget.style.backgroundColor = "transparent";
    }
  };

  return (
    <Dropdown style={{ width: "100%" }}>
      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
        {selectedValue}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: "100%" }}>
        {options.map((option) => (
          <Dropdown.Item
            key={option}
            active={selectedValue === option}
            onClick={() => onSelect(option)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              color: selectedValue === option ? "white" : "black",
              backgroundColor: selectedValue === option ? "#007bff" : "transparent",
              transition: "background-color 0.3s",
            }}
          >
            {option}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DropdownList;

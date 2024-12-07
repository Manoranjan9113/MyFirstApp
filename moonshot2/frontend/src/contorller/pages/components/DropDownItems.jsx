import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DropDownItems = ({ filters, setFilters }) => {
  const handleReset = () => {
    setFilters({
      gender: "",
      age: "",
      startDate: new Date("2022-10-04"),
      endDate: new Date("2022-10-29"),
    });
  };

  return (
    <div className="filters d-flex justify-content-center align-items-center mt-3">
      {/* Gender Dropdown */}
      <label>Gender:</label>
      <select
        value={filters.gender}
        onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
      >
        <option value="">All</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      {/* Age Dropdown */}
      <label>Age:</label>
      <select
        value={filters.age}
        onChange={(e) => setFilters({ ...filters, age: e.target.value })}
      >
        <option value="">All</option>
        <option value="15-25">15-25</option>
        <option value=">25">25</option>
      </select>

      {/* Start Date Picker */}
      <label>Start Date:</label>
      <DatePicker
        selected={filters.startDate}
        onChange={(date) => setFilters({ ...filters, startDate: date })}
        dateFormat="yyyy-MM-dd"
      />

      {/* End Date Picker */}
      <label>End Date:</label>
      <DatePicker
        selected={filters.endDate}
        onChange={(date) => setFilters({ ...filters, endDate: date })}
        dateFormat="yyyy-MM-dd"
      />

      {/* Reset Button */}
      <button className="btn btn-secondary mx-3" onClick={handleReset}>Reset</button>
    </div>
  );
};

export default DropDownItems;

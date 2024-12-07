import React, { useState, useEffect } from "react";
import Axios from "axios";
import DropDownItems from "./components/DropDownItems";
import Chart from "./components/Chart";
import { useNavigate, useLocation } from "react-router-dom";
import { setCookie, getCookie } from "./utils/cookies";
import "./style.css";
import UrlLoginPage from "./UrlLogin";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Initialize state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filters, setFilters] = useState({
    gender: queryParams.get("gender") || getCookie("gender") || "",
    age: queryParams.get("age") || getCookie("age") || "",
    startDate: queryParams.get("startDate")
      ? new Date(queryParams.get("startDate"))
      : getCookie("startDate")
      ? new Date(getCookie("startDate"))
      : new Date("2022-10-04"),
    endDate: queryParams.get("endDate")
      ? new Date(queryParams.get("endDate"))
      : getCookie("endDate")
      ? new Date(getCookie("endDate"))
      : new Date("2022-10-29"),
  });
  const [selectedFeature, setSelectedFeature] = useState(
    queryParams.get("selectedFeature") || null
  );
  const [data, setData] = useState([]);

  // Verify token on page load
  useEffect(() => {
    const token = getCookie("token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    Axios.get("http://localhost:3001/verifyToken", {
      params: { token },
    })
      .then(() => {
        setIsAuthenticated(true);
      })    
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  // Sync cookies and URL whenever filters or selectedFeature change
  useEffect(() => {
    // Update cookies
    setCookie("gender", filters.gender);
    setCookie("age", filters.age);
    setCookie("startDate", filters.startDate.toISOString());
    setCookie("endDate", filters.endDate.toISOString());

    // Update URL query parameters
    const params = new URLSearchParams({
      gender: filters.gender,
      age: filters.age,
      startDate: filters.startDate.toISOString().split("T")[0],
      endDate: filters.endDate.toISOString().split("T")[0],
    });
    if (selectedFeature) params.set("selectedFeature", selectedFeature);
    navigate(`?${params.toString()}`, { replace: true });
  }, [filters, selectedFeature, navigate]);

  // Fetch data from backend whenever filters change
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const response = await Axios.get("http://localhost:3001/getChartData", {
          params: {
            gender: filters.gender,
            age: filters.age,
            startDate: filters.startDate.toISOString().split("T")[0],
            endDate: filters.endDate.toISOString().split("T")[0],
            token: getCookie("token"),
          },
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, [filters, isAuthenticated]);

  // Logout handler
  const handleLogout = () => {
    const allCookies = document.cookie.split("; ");
    for (const cookie of allCookies) {
      const [name] = cookie.split("=");
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    navigate("/"); // Redirect to login page
  };

  // Render the login page if not authenticated
  if (!isAuthenticated) {
    return <UrlLoginPage />;
  }

  // Render the dashboard if authenticated
  return (
    <div>
      {/* Logout Button */}
      <div className="d-flex justify-content-end m-3">
        <button className="btn btn-danger" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {/* Filters */}
      <DropDownItems filters={filters} setFilters={setFilters} />

      {/* Charts */}
      <Chart
        data={data}
        selectedFeature={selectedFeature}
        setSelectedFeature={setSelectedFeature}
      />
    </div>
  );
};

export default Dashboard;

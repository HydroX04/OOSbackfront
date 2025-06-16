import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaBell } from 'react-icons/fa';


import coffeeImage from "../../assets/coffee.jpg";
import "../admin2/dashboard.css";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faMoneyBillWave,
  faChartLine,
  faShoppingCart,
  faClock,
  faArrowTrendUp,
  faArrowTrendDown,
  faCheckCircle,
  faCog,
  faClipboardCheck
} from '@fortawesome/free-solid-svg-icons';

const data = [
  {
    title: "Sample Data 1",
    current: 100,
    previous: 90,
    format: "number",
    icon: faMoneyBillWave,
    type: "sample1"
  },
  {
    title: "Sample Data 2",
    current: 200,
    previous: 180,
    format: "number",
    icon: faChartLine,
    type: "sample2"
  }
];

const formatValue = (value, format) => {
  return format === "currency"
    ? `₱${value.toLocaleString()}`
    : value.toLocaleString();
};

const Report = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="dashboard">
      <main className="dashboard-main">
        <header className="header">
          <div className="header-left">
            <h2 className="page-title">Reports</h2>
          </div>

          <div className="header-right">
            <div className="header-date">{new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}</div>
            <div className="header-profile">
              <div className="profile-pic" />
              <div className="profile-info">
                <div className="profile-role">Hi! I'm Admin</div>
                <div className="profile-name">Lim Alcovendas</div>
              </div>
              <div className="dropdown-icon" onClick={toggleDropdown}>
                <FaChevronDown />
              </div>
              <div className="bell-icon">
                <FaBell className="bell-outline" />
              </div>
              {isDropdownOpen && (
                <div className="profile-dropdown">
                  <ul>
                    <li>Edit Profile</li>
                    <li onClick={() => { localStorage.removeItem("access_token"); window.location.href = "/login"; }} style={{ cursor: "pointer" }}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="dashboard-contents">
          <div className="dashboard-cards" style={{ display: 'flex', gap: '20px', flexWrap: 'nowrap' }}>
            {data.map((card, index) => {
              const { current, previous } = card;
              const diff = current - previous;
              const percent = previous !== 0 ? (diff / previous) * 100 : 0;
              const isImproved = current > previous;
              const hasChange = current !== previous;

              return (
                <div key={index} className={`card ${card.type}`} style={{ flex: 1 }}>
                  <div className="card-text">
                    <div className="card-title">{card.title}</div>
                    <div className="card-details">
                      <div className="card-value">{formatValue(current, card.format)}</div>
                      {hasChange && (
                        <div className={`card-percent ${isImproved ? 'green' : 'red'}`}>
                          <FontAwesomeIcon icon={isImproved ? faArrowTrendUp : faArrowTrendDown} />
                          &nbsp;&nbsp;&nbsp;{Math.abs(percent).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-icon">
                    <FontAwesomeIcon icon={card.icon} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional content can be added here */}

        </div>
      </main>
    </div>
  );
};

export default Report;

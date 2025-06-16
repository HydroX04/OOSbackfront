import React, { useState, useEffect } from "react";
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
import { FaChevronDown, FaBell } from "react-icons/fa";

library.add(faMoneyBillWave, faChartLine, faShoppingCart, faClock, faArrowTrendUp, faArrowTrendDown, faCheckCircle, faCog, faClipboardCheck);

const revenueData = [
  { name: 'Jan', income: 5000, expense: 3000 },
  { name: 'Feb', income: 14000, expense: 10000 },
  { name: 'Mar', income: 15000, expense: 12000 },
  { name: 'Apr', income: 11000, expense: 9000 },
  { name: 'May', income: 13000, expense: 7000 },
  { name: 'June', income: 18000, expense: 10000 },
  { name: 'July', income: 18000, expense: 13000 },
];

const salesData = [
  { name: 'Mon', sales: 60 },
  { name: 'Tue', sales: 95 },
  { name: 'Wed', sales: 70 },
  { name: 'Thu', sales: 25 },
  { name: 'Fri', sales: 60 },
  { name: 'Sat', sales: 68 },
  { name: 'Sun', sales: 63 },
];

const currentDate = new Date().toLocaleString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

const userRole = "Admin";
const userName = "Lim Alcovendas";

const data = [
  {
    title: "Today's Sales",
    current: 28123,
    previous: 25000,
    format: "currency",
    icon: faMoneyBillWave,
    type: "sales"
  },
  {
    title: "Total Orders",
    current: 18003,
    previous: 17000,
    format: "currency",
    icon: faChartLine,
    type: "revenue"
  },
  {
    title: "Today's Orders",
    current: 45,
    previous: 50,
    format: "number",
    icon: faShoppingCart,
    type: "orders"
  },
  {
    title: "Pending Orders",
    current: 5,
    previous: 5 ,
    format: "number",
    icon: faClock,
    type: "pendings"
  },
  {
    title: "Delivered Orders",
    current: 5,
    previous: 5,
    format: "number",
    icon: faCheckCircle,
    type: "deliveredOrders"
  },
  {
    title: "In Preparation",
    current: 8,
    previous: 6,
    format: "number",
    icon: faCog,
    type: "inPreparation"
  },
  {
    title: "Confirmed Orders",
    current: 20,
    previous: 18,
    format: "number",
    icon: faClipboardCheck,
    type: "confirmedOrders"
  }
];

const formatValue = (value, format) => {
  return format === "currency"
    ? `₱${value.toLocaleString()}`
    : value.toLocaleString();
};

const Dashboard = () => {
  const [revenueFilter, setRevenueFilter] = useState("Monthly");
  const [salesFilter, setSalesFilter] = useState("Monthly");
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token"); // Correct key
    console.log("Access Token:", token);
  }, []);
  
  return (
    <div className="dashboard">
      <main className="dashboard-main">
        <header className="header">
          <div className="header-left">
            <h2 className="page-title">Dashboard</h2>
          </div>

          <div className="header-right">
            <div className="header-date">{currentDate}</div>
            <div className="header-profile">
              <div className="profile-pic" />
              <div className="profile-info">
                <div className="profile-role">Hi! I'm {userRole}</div>
                <div className="profile-name">{userName}</div>
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

          <div className="dashboard-charts">
            <div className="chart-box">
              <div className="chart-header">
                <span>Total Orders</span>
                <select
                  className="chart-dropdown"
                  value={revenueFilter}
                  onChange={(e) => setRevenueFilter(e.target.value)}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#00b4d8" />
                  <Line type="monotone" dataKey="expense" stroke="#ff4d6d" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <div className="chart-header">
                <span>Sales</span>
                <select
                  className="chart-dropdown"
                  value={salesFilter}
                  onChange={(e) => setSalesFilter(e.target.value)}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#00b4d8"
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* New cards below the graphs */}
          <div className="dashboard-extra-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div className="chart-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', padding: '20px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '5px' }}>Recent Orders</div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>Latest orders from customers</div>
              {/* Additional content for recent orders can be added here */}
              <div style={{ width: '100%', marginTop: '10px' }}>
                <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '10px', marginBottom: '10px', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '700' }}>#1001</div>
                    <div style={{
                      fontWeight: '600',
                      color: '#d39e00',
                      backgroundColor: '#fff3cd',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      minWidth: '70px',
                      textAlign: 'center'
                    }}>
                      pending
                    </div>
                  </div>
                  <div style={{ fontSize: '16px', marginTop: '5px' }}>John Customer</div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>10:32 PM • pickup • $10.75</div>
                </div>
                <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '10px', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '700' }}>#1002</div>
                    <div style={{
                      fontWeight: '600',
                      color: '#d39e00',
                      backgroundColor: '#fff3cd',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      minWidth: '70px',
                      textAlign: 'center'
                    }}>
                      pending
                    </div>
                  </div>
                  <div style={{ fontSize: '16px', marginTop: '5px' }}>lim Customer</div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>10:32 PM • pickup • $10.75</div>
                </div>
                <button style={{ marginTop: '15px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  View More
                </button>
              </div>
            </div>
            <div className="chart-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', padding: '20px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '5px' }}>Popular Items</div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>Best selling menu items</div>
              {/* Additional content for popular items can be added here */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '10px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        fontWeight: '700', 
                        color: '#007bff', 
                        backgroundColor: '#d0e7ff', 
                        borderRadius: '50%', 
                        width: '30px', 
                        height: '30px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        fontSize: '16px'
                      }}>#1</div>
                      <img src={coffeeImage} alt="Spanish Coffee" style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div style={{ fontSize: '16px' }}>Spanish Coffee</div>
                    </div>
                    <div style={{ justifySelf: 'end', width: '100px', height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: '95%', height: '100%', backgroundColor: '#007bff' }}></div>
                      <div style={{ position: 'absolute', top: '-18px', right: '0', fontSize: '12px', fontWeight: '600', color: '#007bff' }}>95%</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '10px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        fontWeight: '700', 
                        color: '#6f42c1', 
                        backgroundColor: '#e0d7ff', 
                        borderRadius: '50%', 
                        width: '30px', 
                        height: '30px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        fontSize: '16px'
                      }}>#2</div>
                      <img src={coffeeImage} alt="Caramel Macchiato" style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div style={{ fontSize: '16px' }}>Caramel Macchiato</div>
                    </div>
                    <div style={{ justifySelf: 'end', width: '100px', height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: '85%', height: '100%', backgroundColor: '#6f42c1' }}></div>
                      <div style={{ position: 'absolute', top: '-18px', right: '0', fontSize: '12px', fontWeight: '600', color: '#6f42c1' }}>85%</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '10px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        fontWeight: '700', 
                        color: '#fd7e14', 
                        backgroundColor: '#fff4e5', 
                        borderRadius: '50%', 
                        width: '30px', 
                        height: '30px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        fontSize: '16px'
                      }}>#3</div>
                      <img src={coffeeImage} alt="Mocha Latte" style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div style={{ fontSize: '16px' }}>Mocha Latte</div>
                    </div>
                    <div style={{ justifySelf: 'end', width: '100px', height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: '75%', height: '100%', backgroundColor: '#fd7e14' }}></div>
                      <div style={{ position: 'absolute', top: '-18px', right: '0', fontSize: '12px', fontWeight: '600', color: '#fd7e14' }}>75%</div>
                    </div>
                  </div>
<button style={{ width: '120px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  View More
                </button>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

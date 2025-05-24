import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Form } from "react-bootstrap";
import { CartFill, BellFill, PersonFill, Search, EyeFill, PencilFill, TrashFill } from "react-bootstrap-icons";
import { FaChevronDown, FaBell } from "react-icons/fa";
import "../admin2/manageorder.css";

const ManageOrders = () => {
  const userRole = "Admin";
  const userName = "Lim Alcovendas";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const currentDateFormatted = currentDate.toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric",
  });

  // Sample order data
  const orders = [
    { id: 1, customer: "Maria Santos", total: 1250.75, status: "completed", date: "2023-05-15" },
    { id: 2, customer: "Juan Dela Cruz", total: 899.50, status: "processing", date: "2023-05-16" },
    { id: 3, customer: "Anna Reyes", total: 2450.00, status: "pending", date: "2023-05-16" },
    { id: 4, customer: "Carlos Gomez", total: 575.25, status: "cancelled", date: "2023-05-17" },
    { id: 5, customer: "Liza Soberano", total: 3200.00, status: "completed", date: "2023-05-18" },
  ];

  const filteredOrders = orders.filter(order => 
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="status-badge status-pending">Pending</span>;
      case 'processing':
        return <span className="status-badge status-processing">Processing</span>;
      case 'completed':
        return <span className="status-badge status-completed">Completed</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
<div className="d-flex" style={{ height: "100vh", backgroundColor: "#edf7f9" }}>
  <Container fluid className="p-4 main-content" style={{ marginLeft: "0px", width: "calc(100% - 0px)" }}>
          <header className="manage-header">
            <div className="header-left">
              <h2 className="page-title">Products</h2>
            </div>
            <div className="header-right">
              <div className="header-date">{currentDateFormatted}</div>
            <div className="header-profile">
                <div className="profile-pic"></div>
                <div className="profile-info">
                  <div className="profile-role">Hi! I'm {userRole}</div>
                  <div className="profile-name">{userName}</div>
                </div>
                <div className="dropdown-icon" onClick={() => setDropdownOpen(!dropdownOpen)}><FaChevronDown /></div>
                <div className="bell-icon"><FaBell className="bell-outline" /></div>
                {dropdownOpen && (
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
        
        {/* Orders Table */}
        <div className="table-container" style={{ paddingLeft: 0 }}>
          <div className="table-header d-flex justify-content-between align-items-center">
  <h5 style={{ color: "#4a9ba5", margin: 0, marginLeft: "10" }}>Recent Orders</h5>
  <div className="position-relative" style={{ width: "300px" }}>
    <Search className="position-absolute" style={{ top: "10px", left: "12px", color: "#6c757d" }} />
    <Form.Control 
      type="text" 
      placeholder="Search orders..." 
      className="search-input ps-4" 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
</div>
          
          <Table className="orders-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>₱{order.total.toFixed(2)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <button className="action-btn view" title="View">
                      <EyeFill />
                    </button>
                    <button className="action-btn edit" title="Edit">
                      <PencilFill />
                    </button>
                    <button className="action-btn delete" title="Delete">
                      <TrashFill />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Container>
    </div>
  );
};

export default ManageOrders;
  import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { FaChevronDown, FaBell, FaBoxOpen, FaCheckCircle, FaSpinner, FaTruck, FaFilter, FaClock, FaUser, FaPhone, FaMapMarkerAlt, FaBox, FaTimesCircle, FaTruckPickup, FaTruckMoving, FaUndo } from "react-icons/fa";
import { Card, Form } from "react-bootstrap";
import riderImage from "../../assets/rider.jpg";
import "./deliverymanagement.css";

function DeliveryManagement() {
  const userRole = "Admin";
  const userName = "Lim Alcovendas";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [riderFilter, setRiderFilter] = useState("all");

  const [orders, setOrders] = useState([
    {
      id: "ORD001",
      status: "Ready for Pickup",
      currentStatus: "pending",
      orderedAt: "10:22 PM",
      customerName: "John Smith",
      phone: "+1-555-1001",
      address: "123 Main St, Downtown, City 12345",
      items: [
        { name: "Cappuccino (Large)", quantity: 2, price: 11.00 },
        { name: "Blueberry Muffin", quantity: 1, price: 3.25 }
      ],
      total: 14.25,
      assignedRider: ""
    },
    {
      id: "ORD002",
      status: "Preparing",
      currentStatus: "pending",
      orderedAt: "11:15 AM",
      customerName: "Jane Doe",
      phone: "+1-555-2002",
      address: "456 Oak St, Uptown, City 67890",
      items: [
        { name: "Latte (Medium)", quantity: 1, price: 4.50 },
        { name: "Chocolate Croissant", quantity: 2, price: 5.00 }
      ],
      total: 9.50,
      assignedRider: ""
    },
    {
      id: "ORD003",
      status: "In Progress",
      currentStatus: "pending",
      orderedAt: "9:45 AM",
      customerName: "Alice Johnson",
      phone: "+1-555-3003",
      address: "789 Pine St, Midtown, City 54321",
      items: [
        { name: "Espresso", quantity: 3, price: 9.00 },
        { name: "Blueberry Scone", quantity: 1, price: 3.00 }
      ],
      total: 12.00,
      assignedRider: ""
    }
  ]);

  const riders = {
    rider1: {
      name: "Rider 1",
      phone: "+1-555-1111",
      activeOrders: 3,
      imageUrl: "https://via.placeholder.com/50"
    },
    rider2: {
      name: "Rider 2",
      phone: "+1-555-2222",
      activeOrders: 2,
      imageUrl: "https://via.placeholder.com/50"
    },
    rider3: {
      name: "Rider 3",
      phone: "+1-555-3333",
      activeOrders: 1,
      imageUrl: "https://via.placeholder.com/50"
    },
    rider4: {
      name: "Rider 4",
      phone: "+1-555-4444",
      activeOrders: 0,
      imageUrl: "https://via.placeholder.com/50"
    },
    rider5: {
      name: "Rider 5",
      phone: "+1-555-5555",
      activeOrders: 0,
      imageUrl: "https://via.placeholder.com/50"
    },
    rider6: {
      name: "Rider 6",
      phone: "+1-555-6666",
      activeOrders: 0,
      imageUrl: "https://via.placeholder.com/50"
    }
  };

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

  const handleRiderChange = (orderId, newRider) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, assignedRider: newRider } : order
      )
    );
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, currentStatus: newStatus } : order
      )
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return { color: "#d39e00", backgroundColor: "#fff3cd" };
      case "confirmed":
        return { color: "#198754", backgroundColor: "#d1e7dd" };
      case "preparing":
        return { color: "#2980b9", backgroundColor: "#cfe2ff" };
      case "readyToPickup":
        return { color: "#8e44ad", backgroundColor: "#e5dbff" };
      case "pickedUp":
        return { color: "#0d6efd", backgroundColor: "#cfe2ff" };
      case "inTransit":
        return { color: "#6610f2", backgroundColor: "#e5dbff" };
      case "delivered":
        return { color: "#198754", backgroundColor: "#d1e7dd" };
      case "cancelled":
        return { color: "#dc3545", backgroundColor: "#f8d7da" };
      case "returned":
        return { color: "#fd7e14", backgroundColor: "#ffe5d0" };
      default:
        return { color: "black", backgroundColor: "transparent" };
    }
  };

  return (
    <div className="d-flex" style={{ height: "100vh", backgroundColor: "#edf7f9" }}>
      <Container fluid className="p-4 main-content" style={{ marginLeft: "0px", width: "calc(100% - 0px)" }}>
        <header className="manage-header">
          <div className="header-left">
            <h2 className="page-title">Delivery Management</h2>
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
        <div className="status-labels" style={{ display: "flex", justifyContent: "space-around", marginTop: "10px", marginBottom: "20px", gap: "15px", flexWrap: "wrap" }}>
          <Card style={{ flex: "1", minWidth: "150px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <FaClock color="#d39e00" size={32} />
            <span style={{ fontSize: "1rem", fontWeight: "400" }}>Pending</span>
            <span style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "center" }}>5 orders</span>
          </Card>
          <Card style={{ flex: "1", minWidth: "150px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <FaCheckCircle color="#198754" size={32} />
            <span style={{ fontSize: "1rem", fontWeight: "400" }}>Confirmed</span>
            <span style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "center" }}>3 orders</span>
          </Card>
          <Card style={{ flex: "1", minWidth: "150px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <FaSpinner color="#2980b9" size={32} />
            <span style={{ fontSize: "1rem", fontWeight: "400" }}>Preparing</span>
            <span style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "center" }}>7 orders</span>
          </Card>
          <Card style={{ flex: "1", minWidth: "150px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <FaTruckPickup color="#0d6efd" size={32} />
            <span style={{ fontSize: "1rem", fontWeight: "400" }}>Picked up</span>
            <span style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "center" }}>4 orders</span>
          </Card>
          <Card style={{ flex: "1", minWidth: "150px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <FaTruckMoving color="#6610f2" size={32} />
            <span style={{ fontSize: "1rem", fontWeight: "400" }}>In transit</span>
            <span style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "center" }}>5 orders</span>
          </Card>
          <Card style={{ flex: "1", minWidth: "150px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <FaTruck color="#198754" size={32} />
            <span style={{ fontSize: "1rem", fontWeight: "400" }}>Delivered</span>
            <span style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "center" }}>7 orders</span>
          </Card>
          <Card style={{ flex: "1", minWidth: "150px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <FaUndo color="#fd7e14" size={32} />
            <span style={{ fontSize: "1rem", fontWeight: "400" }}>Cancelled/Returned</span>
            <span style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "center" }}>3 orders</span>
          </Card>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px", marginTop: "20px", backgroundColor: "transparent", padding: "10px", borderRadius: "8px" }}>
          <div style={{ fontWeight: "600", fontSize: "1rem" }}>
            Orders 6 of 6
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <FaFilter size={20} />
            <span>Filter:</span>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "300px", marginLeft: "8px" }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="pickedUp">Picked Up</option>
              <option value="inTransit">In transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Cancelled/Returned</option>
            </Form.Select>
            <Form.Select
              value={riderFilter}
              onChange={(e) => setRiderFilter(e.target.value)}
              style={{ width: "300px", marginLeft: "8px" }}
            >
              <option value="all">All Riders</option>
              <option value="rider1">Rider 1</option>
              <option value="rider2">Rider 2</option>
              <option value="rider3">Rider 3</option>
              <option value="rider4">Rider 4</option>
              <option value="rider5">Rider 5</option>
              <option value="rider6">Rider 6</option>
            </Form.Select>
          </div>
        </div>
        {(() => {
          const filteredOrders = orders
            .filter(order => (statusFilter === "all" || order.currentStatus === statusFilter))
            .filter(order => (riderFilter === "all" || order.assignedRider === riderFilter));
          return (
            <div style={{
              display: "flex",
              gap: "20px",
              marginTop: "20px",
              justifyContent: filteredOrders.length === 1 ? "flex-start" : "flex-start",
              flexWrap: "wrap",
              alignItems: "flex-start",
              width: "100%"
            }}>
              {filteredOrders.map((order, idx) => (
                <Card key={idx} style={{ padding: "20px", textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-start", width: "300px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <h5 style={{ color: "#4b929d" }}>Order #{order.id}</h5>
                    <p style={{
                      fontWeight: "600",
                      marginBottom: "5px",
                      color: getStatusStyle(order.currentStatus).color,
                      backgroundColor: getStatusStyle(order.currentStatus).backgroundColor,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      minWidth: "110px",
                      textAlign: "center"
                    }}>
                      {{
                        pending: "Pending",
                        confirmed: "Confirmed",
                        preparing: "Preparing",
                        readyToPickup: "Ready to Pickup",
                        pickedUp: "Picked Up",
                        inTransit: "In transit",
                        delivered: "Delivered",
                        cancelled: "Cancelled",
                        returned: "Cancelled/Returned"
                      }[order.currentStatus] || order.currentStatus}
                    </p>
                  </div>
                  <p style={{ marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", color: "gray" }}><FaClock color="#4b929d" /> Ordered at {order.orderedAt}</p>
                  <p style={{ marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", color: "black" }}><FaUser color="#4b929d" /> {order.customerName}</p>
                  <p style={{ marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", color: "black" }}><FaPhone color="#4b929d" /> {order.phone.replace(/^\+1-/, "63")}</p>
                  <p style={{ marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", color: "black" }}><FaMapMarkerAlt color="#4b929d" /> {order.address}</p>
                  <p style={{ fontWeight: "600", marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", color: "black" }}><FaBox color="#4b929d" /> Items ({order.items.length})</p>
                  {order.items.map((item, i) => (
                    <p key={i} style={{ marginBottom: "3px", alignSelf: "flex-start", color: "black", display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span style={{ marginLeft: "auto" }}>₱{item.price.toFixed(2)}</span>
                    </p>
                  ))}
                  <hr style={{ alignSelf: "stretch" }} />
                  <p style={{ fontWeight: "600", marginBottom: "0", alignSelf: "flex-start", color: "black", display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Total</span>
                    <span style={{ marginLeft: "auto" }}>₱{order.total.toFixed(2)}</span>
                  </p>
                  {!order.assignedRider && (
                    <p style={{ backgroundColor: "#fff3cd", padding: "8px", borderRadius: "4px", marginTop: "10px", color: "#856404", width: "100%" }}>
                      Note: Please call when arrived
                    </p>
                  )}
                  {order.assignedRider && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", width: "100%", backgroundColor: "#f0f0f0", padding: "10px", borderRadius: "6px" }}>
                      <img src={riderImage} alt={riders[order.assignedRider].name} style={{ width: "50px", height: "50px", borderRadius: "50%" }} />
                      <div>
                        <div style={{ fontWeight: "600" }}>{riders[order.assignedRider].name}</div>
                        <div>{riders[order.assignedRider].phone}</div>
                        <div>Active Orders: {riders[order.assignedRider].activeOrders}</div>
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: "10px", width: "100%" }}>
                    <label htmlFor={`assignRider-${order.id}`} style={{ fontWeight: "600", marginBottom: "5px", display: "block" }}>Assign Rider</label>
                    <Form.Select
                      id={`assignRider-${order.id}`}
                      value={order.assignedRider || ""}
                      onChange={(e) => handleRiderChange(order.id, e.target.value)}
                    >
                      <option value="">Select Rider</option>
                      <option value="rider1">Rider 1</option>
                      <option value="rider2">Rider 2</option>
                      <option value="rider3">Rider 3</option>
                      <option value="rider4">Rider 4</option>
                      <option value="rider5">Rider 5</option>
                      <option value="rider6">Rider 6</option>
                    </Form.Select>
                    <label htmlFor={`orderStatus-${order.id}`} style={{ fontWeight: "600", marginBottom: "5px", display: "block", marginTop: "10px" }}>Order Status</label>
                    <Form.Select
                      id={`orderStatus-${order.id}`}
                      value={order.currentStatus || ""}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="pickedUp">Picked Up</option>
                      <option value="inTransit">In transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="returned">Cancelled/Returned</option>
                    </Form.Select>
                  </div>
                </Card>
              ))}
            </div>
          );
        })()}
      </Container>
    </div>
  );
}

export default DeliveryManagement;
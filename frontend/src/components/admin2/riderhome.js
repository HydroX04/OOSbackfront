import React, { useState, useEffect } from 'react';
import { FaBoxOpen, FaCheckCircle, FaDollarSign, FaBell, FaBars, FaClock, FaUser, FaPhone, FaMapMarkerAlt, FaBox } from "react-icons/fa";
import { Container, Card, Tabs, Tab, Form } from "react-bootstrap";
import riderImage from "../../assets/rider.jpg";
import "../admin2/manageorder.css";
import "./riderhome.css";

function RiderHome() {
  const [orders, setOrders] = useState([]);
  const [selectedRider, setSelectedRider] = useState("rider1");
  const [tabKey, setTabKey] = useState('active');

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

  const handleStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, currentStatus: newStatus } : order
    );
    
    setOrders(updatedOrders);
    localStorage.setItem('deliveryOrders', JSON.stringify(updatedOrders));
  };

  useEffect(() => {
    const loadOrdersFromStorage = () => {
      const savedOrders = localStorage.getItem('deliveryOrders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        setOrders([]);
      }
    };

    loadOrdersFromStorage();

    const handleStorageChange = (e) => {
      if (e.key === 'deliveryOrders') {
        loadOrdersFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <>
      <Container fluid className="riderhome-container" style={{ backgroundColor: "#a3d3d8", borderRadius: "8px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <img src={riderImage} alt="Rider" style={{ width: "60px", height: "60px", borderRadius: "50%", marginTop: "1.5rem" }} />
            <span style={{ color: "#4b929d", fontWeight: "600", fontSize: "1.2rem", marginTop: "1.5rem" }}>Rider 1</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "24px", color: "#4b929d", cursor: "pointer" }}>
            <FaBell />
            <FaBars />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", gap: "20px", flexWrap: "wrap" }}>
          <Card style={{ flex: "1", minWidth: "150px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", backgroundColor: "white", color: "#4b929d", borderRadius: "8px" }}>
            <FaBoxOpen size={32} color="#964b00" />
            <span style={{ fontSize: "1rem", fontWeight: "400" }}>Active Orders</span>
            <span style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "center" }}>
              {orders.filter(order => order.assignedRider === "rider1" &&
                !["delivered", "cancelled", "returned"].includes(order.currentStatus)).length} orders
            </span>
          </Card>
          <Card style={{ flex: "1", minWidth: "150px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", backgroundColor: "white", color: "#4b929d", borderRadius: "8px" }}>
            <FaCheckCircle size={32} color="#198754" />
            <span style={{ fontSize: "1rem", fontWeight: "400" }}>Completed</span>
            <span style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "center" }}>
              {orders.filter(order => order.assignedRider === "rider1" && order.currentStatus === "delivered").length} orders
            </span>
          </Card>
          <Card style={{ flex: "1", minWidth: "150px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", backgroundColor: "white", color: "#4b929d", borderRadius: "8px" }}>
            <FaDollarSign size={32} color="#fd7e14" />
            <span style={{ fontSize: "1rem", fontWeight: "400" }}>Earnings</span>
            <span style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "center" }}>
              ₱{orders.filter(order => order.assignedRider === "rider1" && order.currentStatus === "delivered")
                .reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
            </span>
          </Card>
        </div>
      </Container>
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
        <Tabs
          id="riderhome-tabs"
          activeKey={tabKey}
          onSelect={(k) => setTabKey(k)}
          className="mb-3"
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <Tab eventKey="active" title="Active Deliveries" tabClassName="rider-tab" style={{ textAlign: "center" }}>
            <div style={{
              display: "flex",
              gap: "20px",
              marginTop: "20px",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              alignItems: "flex-start",
              width: "100%"
            }}>
              {orders
                .filter(order => order.assignedRider === "rider1")
                .filter(order => !["delivered", "cancelled", "returned"].includes(order.currentStatus))
                .map((order, idx) => (
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
                    <p style={{ marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", color: "gray" }}>
                      <FaClock color="#4b929d" /> Ordered at {order.orderedAt}
                    </p>
                    <p style={{ marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", color: "black" }}>
                      <FaUser color="#4b929d" /> {order.customerName}
                    </p>
                    <p style={{ marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", color: "black" }}>
                      <FaPhone color="#4b929d" /> {order.phone.replace(/^\+1-/, "63")}
                    </p>
                    <p style={{ marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", color: "black" }}>
                      <FaMapMarkerAlt color="#4b929d" /> {order.address}
                    </p>
                    <p style={{ fontWeight: "600", marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", color: "black" }}>
                      <FaBox color="#4b929d" /> Items ({order.items?.length || 0})
                    </p>
                    {order.items?.map((item, i) => (
                      <p key={i} style={{ marginBottom: "3px", alignSelf: "flex-start", color: "black", display: "flex", justifyContent: "space-between", width: "100%" }}>
                        <span>{item.quantity}x {item.name}</span>
                        <span style={{ marginLeft: "auto" }}>₱{item.price.toFixed(2)}</span>
                      </p>
                    ))}
                    <hr style={{ alignSelf: "stretch" }} />
                    <p style={{ fontWeight: "600", marginBottom: "0", alignSelf: "flex-start", color: "black", display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <span>Total</span>
                      <span style={{ marginLeft: "auto" }}>₱{order.total?.toFixed(2) || "0.00"}</span>
                    </p>
                    <div style={{ marginTop: "10px", width: "100%" }}>
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
          </Tab>
          <Tab eventKey="completed" title="Completed" tabClassName="rider-tab" style={{ textAlign: "center" }}>
            {/* Content for Completed can be added here */}
          </Tab>
        </Tabs>
      </div>
    </>
  );
}

export default RiderHome;

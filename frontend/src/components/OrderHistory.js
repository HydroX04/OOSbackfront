import React, { useState } from 'react';
import { Table, Form, Modal, Button } from 'react-bootstrap';
import { EyeFill, XCircle } from 'react-bootstrap-icons';
import './OrderHistory.css'; // Custom styles for OrderHistory component

const OrderHistory = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [ordersData, setOrdersData] = useState({
    pending: [
      {
        id: 1,
        date: '2023-05-01',
        total: 25.99,
        items: 3,
        status: 'pending',
        orderType: 'Delivery',
        products: [
          { id: 101, name: 'Product A', quantity: 1, price: 10.0, image: 'placeholder' },
          { id: 102, name: 'Product B', quantity: 2, price: 7.995, image: 'placeholder' },
        ],
      },
      {
        id: 2,
        date: '2023-05-03',
        total: 42.5,
        items: 5,
        status: 'pending',
        orderType: 'Pickup',
        products: [
          { id: 103, name: 'Product C', quantity: 3, price: 8.5, image: 'placeholder' },
          { id: 104, name: 'Product D', quantity: 2, price: 8.75, image: 'placeholder' },
        ],
      },
    ],
    completed: [
      {
        id: 3,
        date: '2023-04-15',
        total: 18.75,
        items: 2,
        status: 'completed',
        orderType: 'Delivery',
        products: [{ id: 105, name: 'Product E', quantity: 2, price: 9.375, image: 'placeholder' }],
      },
      {
        id: 4,
        date: '2023-04-20',
        total: 65.3,
        items: 7,
        status: 'completed',
        orderType: 'Pickup',
        products: [
          { id: 106, name: 'Product F', quantity: 4, price: 10.0, image: 'placeholder' },
          { id: 107, name: 'Product G', quantity: 3, price: 11.1, image: 'placeholder' },
        ],
      },
    ],
    cancelled: [
      {
        id: 5,
        date: '2023-04-10',
        total: 32.45,
        items: 4,
        status: 'cancelled',
        orderType: 'Delivery',
        products: [{ id: 108, name: 'Product H', quantity: 4, price: 8.1125, image: 'placeholder' }],
      },
    ],
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const filteredOrders = (orders) => {
    return orders.filter(
      (order) =>
        order.id.toString().includes(searchTerm) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge status-pending">Processing</span>;
      case 'completed':
        return <span className="status-badge status-completed">Completed</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const handleCancelClick = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (orderToCancel) {
      // Remove order from pending and add to cancelled
      setOrdersData((prevData) => {
        const newPending = prevData.pending.filter((o) => o.id !== orderToCancel.id);
        const newCancelled = [...prevData.cancelled, { ...orderToCancel, status: 'cancelled' }];
        return { ...prevData, pending: newPending, cancelled: newCancelled };
      });
      setShowCancelModal(false);
      setOrderToCancel(null);
    }
  };

  const handleCloseModal = () => {
    setShowCancelModal(false);
    setOrderToCancel(null);
  };

  const renderTable = (orders) => {
    if (orders.length === 0) {
      return <div className="orderhistory-no-orders">No orders found</div>;
    }

    return (
      <Table className="orders-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Order Type</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders(orders).map((order) => (
            <React.Fragment key={order.id}>
              {order.products.map((product, index) => (
                <tr key={product.id}>
                  {index === 0 && (
                    <>
                      <td rowSpan={order.products.length}>{order.id}</td>
                      <td rowSpan={order.products.length}>{order.orderType}</td>
                    </>
                  )}
                  <td>
                    {/* Placeholder for product image */}
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#ccc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                        fontSize: '12px',
                        borderRadius: '4px',
                      }}
                    >
                      Image
                    </div>
                    <div>{product.name}</div>
                  </td>
                  <td>{product.quantity}</td>
                  <td>₱{product.price.toFixed(2)}</td>
                  <td>₱{(product.price * product.quantity).toFixed(2)}</td>
                  {index === 0 && <td rowSpan={order.products.length}>{getStatusBadge(order.status)}</td>}
                  {index === 0 && (
                    <td rowSpan={order.products.length}>
                      <button className="action-btn view" title="View">
                        <EyeFill />
                      </button>
                      {activeTab === 'pending' && (
                      <button
                        className="action-btn cancel"
                        title="Cancel Order"
                        onClick={() => handleCancelClick(order)}
                        style={{ marginLeft: '8px', color: 'red' }}
                      >
                        <XCircle />
                      </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <div className="ordertable-container">
      <div className="table-header">
        <h5 style={{ color: '#4a9ba5' }}>Order History</h5>
        <Form.Control
          type="text"
          placeholder="Search..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ul className="orderhistory-tabs nav nav-tabs">
        <li className="nav-item">
          <button
            className={`orderhistory-tab nav-link ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
            style={activeTab === 'pending' ? { backgroundColor: '#4B929D', color: 'white' } : { color: 'black' }}
          >
            Pending Orders
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`orderhistory-tab nav-link ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
            style={activeTab === 'completed' ? { backgroundColor: '#4B929D', color: 'white' } : { color: 'black' }}
          >
            Completed
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`orderhistory-tab nav-link ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
            style={activeTab === 'cancelled' ? { backgroundColor: '#4B929D', color: 'white' } : { color: 'black' }}
          >
            Cancelled
          </button>
        </li>
      </ul>

      <div className="orderhistory-tab-content tab-content p-3 border border-top-0 rounded-bottom">
        {activeTab === 'pending' && renderTable(ordersData.pending)}
        {activeTab === 'completed' && renderTable(ordersData.completed)}
        {activeTab === 'cancelled' && renderTable(ordersData.cancelled)}
      </div>

      <Modal show={showCancelModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel order #{orderToCancel ? orderToCancel.id : ''}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            No
          </Button>
          <Button variant="danger" onClick={handleConfirmCancel}>
            Yes, Cancel Order
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderHistory;

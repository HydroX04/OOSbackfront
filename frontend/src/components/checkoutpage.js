import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CheckoutPage = () => {
  const location = useLocation();
  const { cartItems = [], orderType = 'Pick Up', paymentMethod = 'Cash' } = location.state || {};

  const [userData, setUserData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    blockStreetSubdivision: '',
    city: '',
    province: '',
    landmark: '',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('http://localhost:4000/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error('Failed to fetch user profile:', response.statusText);
          return;
        }

        const data = await response.json();
        setUserData({
          firstName: data.firstName || '',
          middleName: data.middleName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          blockStreetSubdivision: (data.block || '') + ' ' + (data.street || '') + ' ' + (data.subdivision || ''),
          city: data.city || '',
          province: data.province || '',
          landmark: data.landmark || '',
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.ProductPrice * item.quantity, 0);
    const deliveryFee = orderType === 'Delivery' ? 50 : 0;
    return subtotal + deliveryFee;
  };

  return (
    <div className="container py-5" style={{ minHeight: '100vh', marginTop: '100px' }}>
      <div className="bg-white p-4 rounded">
        <h2 className="mb-4" style={{ color: '#4B929D', textAlign: 'left' }}>Checkout</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Size</th>
              <th>Type</th>
              <th>Sugar Level</th>
              <th>Add-ons</th>
              <th>Delivery Method</th>
              <th>Payment Method</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.length === 0 ? (
              <tr><td colSpan="8" className="text-center">No items in cart.</td></tr>
            ) : (
              cartItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.ProductName}</td>
                  <td>{item.size || '-'}</td>
                  <td>{item.type || '-'}</td>
                  <td>{item.sugarLevel || '-'}</td>
                  <td>{item.addOns?.join(', ') || '-'}</td>
                  <td>{orderType}</td>
                  <td>{paymentMethod}</td>
                  <td>₱{(item.ProductPrice * item.quantity).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="7" style={{ textAlign: 'right', fontWeight: 'bold' }}>Delivery Fee:</td>
              <td>₱{orderType === 'Delivery' ? '50.00' : '0.00'}</td>
            </tr>
            <tr>
              <td colSpan="7" style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total:</td>
              <td>₱{calculateTotal().toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-4 p-3 bg-white rounded">
          <h2 className="mb-4" style={{ color: '#4B929D', textAlign: 'left' }}>Delivery Information</h2>
          <h6 style={{ color: '#4B929D', textAlign: 'left' }}>All fields are required</h6>
          <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
            <div style={{ flex: 1, color: '#4B929D', textAlign: 'left', marginBottom: '5px' }}>First Name <span style={{ color: 'red' }}>*</span></div>
            <div style={{ flex: 1, color: '#4B929D', textAlign: 'left', marginBottom: '5px' }}>Middle Name </div>
            <div style={{ flex: 1, color: '#4B929D', textAlign: 'left', marginBottom: '5px' }}>Last Name <span style={{ color: 'red' }}>*</span></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input type="text" placeholder="First Name" style={{ flex: 1, padding: '8px' }} defaultValue={userData.firstName} />
            <input type="text" placeholder="Middle Name" style={{ flex: 1, padding: '8px' }} defaultValue={userData.middleName} />
            <input type="text" placeholder="Last Name" style={{ flex: 1, padding: '8px' }} defaultValue={userData.lastName} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1, color: '#4B929D', textAlign: 'left',marginTop: '10px' }}>Block, Street, Subdivision <span style={{ color: 'red' }}>*</span></div>
            <div style={{ flex: 1, color: '#4B929D', textAlign: 'left',marginTop: '10px'  }}>City <span style={{ color: 'red' }}>*</span></div>
            <div style={{ flex: 1, color: '#4B929D', textAlign: 'left', marginTop: '10px'}}>Province <span style={{ color: 'red' }}>*</span></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input type="text" placeholder="Block, Street, Subdivision" style={{ flex: 1, padding: '8px' }} defaultValue={userData.blockStreetSubdivision || ''} />
          <input type="text" placeholder="City" style={{ flex: 1, padding: '8px' }} defaultValue={userData.city || ''} />
          <input type="text" placeholder="Province" style={{ flex: 1, padding: '8px' }} defaultValue={userData.province || ''} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1, color: '#4B929D', textAlign: 'left', marginTop: '10px' }}>Landmark <span style={{ color: 'red' }}>*</span></div>
            <div style={{ flex: 1, color: '#4B929D', textAlign: 'left', marginTop: '10px' }}>Email Address <span style={{ color: 'red' }}>*</span></div>
            <div style={{ flex: 1, color: '#4B929D', textAlign: 'left', marginTop: '10px' }}>Phone Number <span style={{ color: 'red' }}>*</span></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input type="text" placeholder="Landmark" style={{ flex: 1, padding: '8px' }} defaultValue={userData.landmark} />
            <input type="email" placeholder="Email Address" style={{ flex: 1, padding: '8px' }} defaultValue={userData.email} />
            <input type="text" placeholder="Phone Number" style={{ flex: 1, padding: '8px' }} defaultValue={userData.phone} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label htmlFor="deliveryNotes" style={{ color: '#4B929D', display: 'block', marginBottom: '5px' }}>Delivery Notes</label>
            <textarea
              id="deliveryNotes"
              placeholder="Enter delivery notes here..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                borderColor: '#ced4da',
                borderRadius: '25px',
                outlineColor: '#ced4da',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ backgroundColor: '#4B929D', borderColor: '#4B929D', padding: '10px 20px' }}
            >
              Place Order
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

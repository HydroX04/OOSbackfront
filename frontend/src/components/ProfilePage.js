import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProfilePage.css';

const ProfilePage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const blockStreetSubdivision = form.blockStreetSubdivision.value.trim();
    const city = form.city.value.trim();
    const province = form.province.value.trim();
    const landmark = form.landmark.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const birthday = form.birthday.value.trim();

    if (!username || !firstName || !lastName || !blockStreetSubdivision || !city || !province || !landmark || !email || !phone || !birthday) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Additional validation can be added here if needed

    toast.success('Changes saved successfully!');
  };

  return (
    <div className="profile-container d-flex g-0">
      <div className="profile-picture-card card">
        <h3>Profile Picture</h3>
        <div className="profile-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80"
            alt="Coffee"
            className="profile-image"
          />
        </div>
        <p className="image-info">JPG or PNG no larger than 5 MB</p>
        <input
          type="file"
          id="fileInput"
          accept="image/png, image/jpeg"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              // For now, just log the file name
              console.log('Selected file:', file.name);
              // You can add image preview or upload logic here
            }
          }}
        />
        <button
          className="profile-btn upload-btn"
          onClick={() => document.getElementById('fileInput').click()}
        >
          Upload new image
        </button>
      </div>

      <div className="account-details-card card">
        <h3>Account Details</h3>
        <form className="account-form" onSubmit={handleSubmit}>
          <label htmlFor="username" className="form-label">
            Username (how your name will appear to other users on the site)
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="username"
            className="form-input"
          />

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="First name"
            className="form-input"
          />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Last name"
            className="form-input"
          />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="blockStreetSubdivision" className="form-label">Block, Street, Subdivision *</label>
              <input
                type="text"
                id="blockStreetSubdivision"
                name="blockStreetSubdivision"
                placeholder="Block, Street, Subdivision"
                className="form-input block-street-subdivision-input"
              />
            </div>
          </div>

          <div className="form-row city-province-row">
            <div className="form-group city-group">
              <label htmlFor="city" className="form-label">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="City"
                className="form-input"
              />
            </div>
            <div className="form-group province-group">
              <label htmlFor="province" className="form-label">Province *</label>
              <input
                type="text"
                id="province"
                name="province"
                placeholder="Province"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="landmark" className="form-label">Landmark *</label>
              <input
                type="text"
                id="landmark"
                name="landmark"
                placeholder="Landmark"
                className="form-input"
              />
            </div>
          </div>

          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="name@example.com"
            className="form-input"
          />

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="+63"
            defaultValue="+63"
            maxLength={13}
            pattern="^\+63\d{10}$"
            title="Phone number must start with +63 followed by 10 digits"
            className="form-input"
          />
            </div>
            <div className="form-group">
              <label htmlFor="birthday" className="form-label">Birthday</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            placeholder="Birthday"
            className="form-input"
          />
            </div>
          </div>

          <button type="submit" className="profile-btn save-btn">Save changes</button>
        </form>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default ProfilePage;

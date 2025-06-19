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

    // Basic sanitation already done by trim()

    // Check for empty required fields
    if (!username || !firstName || !lastName || !blockStreetSubdivision || !city || !province || !landmark || !email || !phone || !birthday) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Validation regex patterns
    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    const namePattern = /^[a-zA-Z\s'-]+$/;
    const blockStreetSubdivisionPattern = /^[a-zA-Z0-9\s',.-]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+63\d{10}$/;

    if (!usernamePattern.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores.');
      return;
    }

    if (!namePattern.test(firstName)) {
      toast.error('First name can only contain letters, spaces, apostrophes, and hyphens.');
      return;
    }

    if (!namePattern.test(lastName)) {
      toast.error('Last name can only contain letters, spaces, apostrophes, and hyphens.');
      return;
    }

    if (!blockStreetSubdivisionPattern.test(blockStreetSubdivision)) {
      toast.error('Block, Street, Subdivision can only contain letters, numbers, spaces, apostrophes, commas, periods, and hyphens.');
      return;
    }

    if (!namePattern.test(city)) {
      toast.error('City can only contain letters, spaces, apostrophes, and hyphens.');
      return;
    }

    if (!namePattern.test(province)) {
      toast.error('Province can only contain letters, spaces, apostrophes, and hyphens.');
      return;
    }

    if (!namePattern.test(landmark)) {
      toast.error('Landmark can only contain letters, spaces, apostrophes, and hyphens.');
      return;
    }

    if (!emailPattern.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!phonePattern.test(phone)) {
      toast.error('Phone number must start with +63 followed by 10 digits.');
      return;
    }

    // Validate birthday is a valid date and not in the future
    const birthdayDate = new Date(birthday);
    const today = new Date();
    if (isNaN(birthdayDate.getTime())) {
      toast.error('Please enter a valid birthday.');
      return;
    }
    if (birthdayDate > today) {
      toast.error('Birthday cannot be in the future.');
      return;
    }

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
            Username <span style={{color: 'red'}}>*</span> 
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
              <label htmlFor="firstName" className="form-label">First name <span style={{color: 'red'}}>*</span></label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="First name"
            className="form-input"
          />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last name <span style={{color: 'red'}}>*</span></label>
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
              <label htmlFor="blockStreetSubdivision" className="form-label">Block, Street, Subdivision <span style={{color: 'red'}}>*</span></label>
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
              <label htmlFor="city" className="form-label">City <span style={{color: 'red'}}>*</span></label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="City"
                className="form-input"
              />
            </div>
            <div className="form-group province-group">
              <label htmlFor="province" className="form-label">Province <span style={{color: 'red'}}>*</span></label>
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
              <label htmlFor="landmark" className="form-label">Landmark <span style={{color: 'red'}}>*</span></label>
              <input
                type="text"
                id="landmark"
                name="landmark"
                placeholder="Landmark"
                className="form-input"
              />
            </div>
          </div>

          <label htmlFor="email" className="form-label">Email address <span style={{color: 'red'}}>*</span></label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="name@example.com"
            className="form-input"
          />

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone number <span style={{color: 'red'}}>*</span></label>
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
              <label htmlFor="birthday" className="form-label">Birthday <span style={{color: 'red'}}>*</span></label>
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

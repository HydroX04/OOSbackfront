import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppHeader from './components/header';
import Home from './components/Home';
import LoginPage from './components/login';
import Signup from './components/signup';
import ForgotPassword from './components/forgotpassword'; 
import Menu from './components/menulanding';
import About from './components/aboutus';  
import Services from './components/services'; 
import Menus from './components/menu';
import Footer from './components/footer';
import Cart from './components/cart';
import Dashboard from './components/admin/dashboard';
import ManageOrders from './components/admin/manageorders';
import Sidebar from './components/admin/sidebar';
import ProfilePage from './components/ProfilePage';
import ProfileSidebar from './components/ProfileSidebar';
import OrderHistory from './components/OrderHistory';
import Notification from './components/Notification';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

// Admin Layout Component
const AdminLayout = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Outlet /> {/* This is where child routes will render */}
      </div>
    </div>
  );
};

// Profile Layout Component
const ProfileLayout = () => {
  return (
    <div className="d-flex">
      <ProfileSidebar />
      <div className="flex-grow-1">
        <Outlet /> {/* This is where ProfilePage or nested routes will render */}
      </div>
    </div>
  );
};

function MainApp() {
  const location = useLocation();
  const hideHeaderFooterPaths = ['/login', '/signup', '/forgot-password', '/admin', '/admin/*'];
  const shouldHideHeaderFooter = hideHeaderFooterPaths.some(path => 
    location.pathname.startsWith(path)
  );
  
  return (
    <div className='App'>
      {!shouldHideHeaderFooter && !location.pathname.startsWith('/admin') && (
        <header id='header'>
          <AppHeader />
        </header>
      )}
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Home />
              <Menu />
              <About />
              <Services />  
            </>
          } />
          
          <Route path="/menu" element={<Menus />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route element={<ProfileLayout />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/orderhistory" element={<OrderHistory />} />
            <Route path="/profile/notification" element={<Notification />} />
          </Route>
          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/manageorders" element={<ManageOrders />} />
          </Route>
        </Routes>
      </main>
      {!shouldHideHeaderFooter && !location.pathname.startsWith('/admin') && <Footer />}
    </div>
  );
}

export default App;

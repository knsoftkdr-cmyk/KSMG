import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Industries from './pages/Industries.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import AddProduct from './pages/AddProduct.jsx';
import Quote from './pages/Quote.jsx';
import Enquiries from './pages/Enquiries.jsx';
import Info from './pages/Info.jsx';
import ContentPage from './pages/ContentPage.jsx';
import IndustryDetail from './pages/IndustryDetail.jsx';
import DesignStudio from './pages/DesignStudio.jsx';
import DesignStudio3D from './pages/DesignStudio3D.jsx';
import Login from './pages/Login.jsx';
import Staff from './pages/Staff.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MyRequests from './pages/MyRequests.jsx';
import RequireRole from './components/RequireRole.jsx';
import { CONTENT } from './data/content.js';

// App only wires routes. Add a new page = new file in pages/ + one line here.
export default function App() {
  return (
    <>
       <a href="#main" className="skip" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to main content</a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/industries/:slug" element={<IndustryDetail />} />
          {Object.keys(CONTENT).map(k => <Route key={k} path={`/${k}`} element={<ContentPage slug={k} />} />)}
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/design-studio" element={<DesignStudio />} />
          <Route path="/design-studio-3d" element={<DesignStudio3D />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/add-product" element={<RequireRole roles={['product_manager', 'super_admin']}><AddProduct /></RequireRole>} />
          <Route path="/admin/edit-product/:id" element={<RequireRole roles={['product_manager', 'super_admin']}><AddProduct /></RequireRole>} />
          <Route path="/admin/enquiries" element={<RequireRole roles={['sales', 'super_admin']}><Enquiries /></RequireRole>} />
          <Route path="/admin/dashboard" element={<RequireRole roles={['sales', 'super_admin']}><Dashboard /></RequireRole>} />
          <Route path="/admin/staff" element={<RequireRole roles={['super_admin']}><Staff /></RequireRole>} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/contact" element={<Info kind="contact" />} />
          <Route path="*" element={<Info kind="404" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

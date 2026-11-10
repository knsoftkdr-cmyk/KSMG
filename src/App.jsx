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
import { CONTENT } from './data/content.js';

// App only wires routes. Add a new page = new file in pages/ + one line here.
export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/industries/:slug" element={<IndustryDetail />} />
          {Object.keys(CONTENT).map(k => <Route key={k} path={`/${k}`} element={<ContentPage slug={k} />} />)}
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/design-studio" element={<DesignStudio />} />
          <Route path="/admin/add-product" element={<AddProduct />} />
          <Route path="/admin/edit-product/:id" element={<AddProduct />} />
          <Route path="/admin/enquiries" element={<Enquiries />} />
          <Route path="/about" element={<Info kind="about" />} />
          <Route path="/contact" element={<Info kind="contact" />} />
          <Route path="*" element={<Info kind="404" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

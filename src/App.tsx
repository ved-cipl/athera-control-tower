import { HashRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './state/store';
import ControlTower from './pages/ControlTower';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Inventory from './pages/Inventory';
import CustomerService from './pages/CustomerService';
import Reconciliation from './pages/Reconciliation';
import Audit from './pages/Audit';

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<ControlTower />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/customer-service" element={<CustomerService />} />
          <Route path="/reconciliation" element={<Reconciliation />} />
          <Route path="/audit" element={<Audit />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}

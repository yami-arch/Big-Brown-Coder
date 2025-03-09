import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import Dashboard from './pages/Dashboard.jsx'
import FinancialSentimentDashboard from './pages/FinancialSentimentDashboard';
import Site from './pages/Site.jsx'
import StockDashboard from './pages/StockDashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path='/' element={<App/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/news' element={<FinancialSentimentDashboard/>}/>
        <Route path='/site' element={<Site/>}/>
        <Route path="/stockdashboard/:symbol" element={<StockDashboard />} />
      </Routes>
    </Router>
  </StrictMode>
)

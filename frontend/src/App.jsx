import { BrowserRouter, Route, Routes } from 'react-router-dom'
import DashboardLayout from './Components/DashboardLayout'
import Home from './Pages/Home'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<DashboardLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

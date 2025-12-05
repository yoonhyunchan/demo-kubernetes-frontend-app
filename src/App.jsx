import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import S3Page from './pages/S3Page'
import RDSPage from './pages/RDSPage'
import EC2Page from './pages/EC2Page'
import LambdaPage from './pages/LambdaPage'
import CloudWatchPage from './pages/CloudWatchPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/s3" element={isAuthenticated ? <S3Page /> : <Navigate to="/login" />} />
        <Route path="/rds" element={isAuthenticated ? <RDSPage /> : <Navigate to="/login" />} />
        <Route path="/ec2" element={isAuthenticated ? <EC2Page /> : <Navigate to="/login" />} />
        <Route path="/lambda" element={isAuthenticated ? <LambdaPage /> : <Navigate to="/login" />} />
        <Route path="/cloudwatch" element={isAuthenticated ? <CloudWatchPage /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App

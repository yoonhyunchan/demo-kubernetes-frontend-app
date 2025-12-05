import { Link, useNavigate } from 'react-router-dom'
import { Database, HardDrive, Server, Zap, Activity, LogOut } from 'lucide-react'

const Layout = ({ children }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const navItems = [
    { path: '/s3', icon: HardDrive, label: 'S3' },
    { path: '/rds', icon: Database, label: 'RDS' },
    { path: '/ec2', icon: Server, label: 'EC2' },
    { path: '/lambda', icon: Zap, label: 'Lambda' },
    { path: '/cloudwatch', icon: Activity, label: 'CloudWatch' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-2xl font-bold text-white">
                AWS Test Platform
              </Link>
              <div className="hidden md:flex space-x-4">
                {navItems.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition"
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition"
            >
              <LogOut size={18} />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout

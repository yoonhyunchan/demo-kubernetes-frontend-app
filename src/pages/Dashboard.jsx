import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Database, HardDrive, Server, Zap, Activity } from 'lucide-react'

const Dashboard = () => {
  const services = [
    { name: 'S3', icon: HardDrive, path: '/s3', color: 'from-green-500 to-emerald-600', desc: '파일 스토리지 관리' },
    { name: 'RDS', icon: Database, path: '/rds', color: 'from-blue-500 to-cyan-600', desc: '데이터베이스 관리' },
    { name: 'EC2', icon: Server, path: '/ec2', color: 'from-orange-500 to-red-600', desc: '인스턴스 관리' },
    { name: 'Lambda', icon: Zap, path: '/lambda', color: 'from-yellow-500 to-orange-600', desc: '서버리스 함수' },
    { name: 'CloudWatch', icon: Activity, path: '/cloudwatch', color: 'from-purple-500 to-pink-600', desc: '로그 & 모니터링' }
  ]

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">대시보드</h1>
          <p className="text-gray-300">AWS 서비스를 테스트하세요</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ name, icon: Icon, path, color, desc }) => (
            <Link
              key={name}
              to={path}
              className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition hover:scale-105 hover:shadow-2xl"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                <Icon size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
              <p className="text-gray-300">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard

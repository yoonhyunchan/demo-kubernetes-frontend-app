import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { rdsAPI } from '../services/api'
import { Play, RefreshCw } from 'lucide-react'

const RDSPage = () => {
  const [instances, setInstances] = useState([])
  const [selectedInstance, setSelectedInstance] = useState('')
  const [query, setQuery] = useState('SELECT 1')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadInstances()
  }, [])

  const loadInstances = async () => {
    try {
      const response = await rdsAPI.listInstances()
      setInstances(response.data.instances)
    } catch (error) {
      console.error('인스턴스 로드 실패:', error)
    }
  }

  const handleTestConnection = async () => {
    if (!selectedInstance) return
    setLoading(true)
    try {
      const response = await rdsAPI.testConnection(selectedInstance)
      setResult({ success: true, message: '연결 성공!' })
    } catch (error) {
      setResult({ success: false, message: '연결 실패' })
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteQuery = async () => {
    if (!selectedInstance || !query) return
    setLoading(true)
    try {
      const response = await rdsAPI.executeQuery(selectedInstance, query)
      setResult({ success: true, data: response.data })
    } catch (error) {
      setResult({ success: false, message: error.response?.data?.detail || '쿼리 실행 실패' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-white">RDS Database</h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-4 mb-6">
            <select
              value={selectedInstance}
              onChange={(e) => setSelectedInstance(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">인스턴스 선택</option>
              {instances.map((instance) => (
                <option key={instance.id} value={instance.id}>{instance.id}</option>
              ))}
            </select>
            <button
              onClick={loadInstances}
              className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              <RefreshCw size={20} className="text-white" />
            </button>
            <button
              onClick={handleTestConnection}
              disabled={!selectedInstance || loading}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-white"
            >
              연결 테스트
            </button>
          </div>

          {selectedInstance && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">SQL 쿼리</label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  placeholder="SELECT * FROM table"
                />
              </div>
              <button
                onClick={handleExecuteQuery}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <Play size={18} className="text-white" />
                <span className="text-white">실행</span>
              </button>

              {result && (
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <pre className="text-white text-sm overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default RDSPage

import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { lambdaAPI } from '../services/api'
import { Play, FileText, RefreshCw } from 'lucide-react'

const LambdaPage = () => {
  const [functions, setFunctions] = useState([])
  const [selectedFunction, setSelectedFunction] = useState('')
  const [payload, setPayload] = useState('{}')
  const [result, setResult] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFunctions()
  }, [])

  const loadFunctions = async () => {
    try {
      const response = await lambdaAPI.listFunctions()
      setFunctions(response.data.functions)
    } catch (error) {
      console.error('함수 로드 실패:', error)
    }
  }

  const handleInvoke = async () => {
    if (!selectedFunction) return
    setLoading(true)
    try {
      const response = await lambdaAPI.invokeFunction(selectedFunction, JSON.parse(payload))
      setResult(response.data)
    } catch (error) {
      setResult({ error: error.response?.data?.detail || '실행 실패' })
    } finally {
      setLoading(false)
    }
  }

  const handleGetLogs = async () => {
    if (!selectedFunction) return
    try {
      const response = await lambdaAPI.getLogs(selectedFunction)
      setLogs(response.data.logs)
    } catch (error) {
      console.error('로그 로드 실패:', error)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-white">Lambda Functions</h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-4 mb-6">
            <select
              value={selectedFunction}
              onChange={(e) => setSelectedFunction(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">함수 선택</option>
              {functions.map((func) => (
                <option key={func.name} value={func.name}>{func.name}</option>
              ))}
            </select>
            <button
              onClick={loadFunctions}
              className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              <RefreshCw size={20} className="text-white" />
            </button>
          </div>

          {selectedFunction && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Payload (JSON)</label>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleInvoke}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Play size={18} className="text-white" />
                  <span className="text-white">실행</span>
                </button>
                <button
                  onClick={handleGetLogs}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  <FileText size={18} className="text-white" />
                  <span className="text-white">로그 보기</span>
                </button>
              </div>

              {result && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">실행 결과</h3>
                  <pre className="text-gray-300 text-sm overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}

              {logs.length > 0 && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">로그</h3>
                  <div className="space-y-1">
                    {logs.map((log, idx) => (
                      <p key={idx} className="text-gray-300 text-sm font-mono">{log}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default LambdaPage

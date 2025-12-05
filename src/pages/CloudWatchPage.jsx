import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { cloudwatchAPI } from '../services/api'
import { RefreshCw } from 'lucide-react'

const CloudWatchPage = () => {
  const [logGroups, setLogGroups] = useState([])
  const [selectedLogGroup, setSelectedLogGroup] = useState('')
  const [logStreams, setLogStreams] = useState([])
  const [selectedLogStream, setSelectedLogStream] = useState('')
  const [logEvents, setLogEvents] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadLogGroups()
  }, [])

  const loadLogGroups = async () => {
    try {
      const response = await cloudwatchAPI.getLogGroups()
      setLogGroups(response.data.log_groups)
    } catch (error) {
      console.error('로그 그룹 로드 실패:', error)
    }
  }

  const loadLogStreams = async (logGroup) => {
    setLoading(true)
    try {
      const response = await cloudwatchAPI.getLogStreams(logGroup)
      setLogStreams(response.data.log_streams)
    } catch (error) {
      console.error('로그 스트림 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLogEvents = async (logGroup, logStream) => {
    setLoading(true)
    try {
      const response = await cloudwatchAPI.getLogEvents(logGroup, logStream)
      setLogEvents(response.data.events)
    } catch (error) {
      console.error('로그 이벤트 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogGroupChange = (logGroup) => {
    setSelectedLogGroup(logGroup)
    setSelectedLogStream('')
    setLogEvents([])
    loadLogStreams(logGroup)
  }

  const handleLogStreamChange = (logStream) => {
    setSelectedLogStream(logStream)
    loadLogEvents(selectedLogGroup, logStream)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-white">CloudWatch Logs</h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">로그 그룹</label>
              <div className="flex space-x-2">
                <select
                  value={selectedLogGroup}
                  onChange={(e) => handleLogGroupChange(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">선택</option>
                  {logGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <button
                  onClick={loadLogGroups}
                  className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                >
                  <RefreshCw size={20} className="text-white" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">로그 스트림</label>
              <select
                value={selectedLogStream}
                onChange={(e) => handleLogStreamChange(e.target.value)}
                disabled={!selectedLogGroup}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                <option value="">선택</option>
                {logStreams.map((stream) => (
                  <option key={stream} value={stream}>{stream}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-300">로딩 중...</p>
          ) : logEvents.length > 0 ? (
            <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-auto">
              {logEvents.map((event, idx) => (
                <div key={idx} className="mb-2 border-b border-white/10 pb-2">
                  <p className="text-gray-400 text-xs">{new Date(event.timestamp).toLocaleString()}</p>
                  <p className="text-gray-200 text-sm font-mono">{event.message}</p>
                </div>
              ))}
            </div>
          ) : selectedLogStream ? (
            <p className="text-gray-400">로그가 없습니다</p>
          ) : null}
        </div>
      </div>
    </Layout>
  )
}

export default CloudWatchPage

import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { ec2API } from '../services/api'
import { Play, Square, RefreshCw } from 'lucide-react'

const EC2Page = () => {
  const [instances, setInstances] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadInstances()
  }, [])

  const loadInstances = async () => {
    setLoading(true)
    try {
      const response = await ec2API.listInstances()
      setInstances(response.data.instances)
    } catch (error) {
      console.error('인스턴스 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async (instanceId) => {
    try {
      await ec2API.startInstance(instanceId)
      loadInstances()
    } catch (error) {
      console.error('시작 실패:', error)
    }
  }

  const handleStop = async (instanceId) => {
    try {
      await ec2API.stopInstance(instanceId)
      loadInstances()
    } catch (error) {
      console.error('중지 실패:', error)
    }
  }

  const getStatusColor = (state) => {
    const colors = {
      running: 'bg-green-500',
      stopped: 'bg-red-500',
      pending: 'bg-yellow-500',
      stopping: 'bg-orange-500'
    }
    return colors[state] || 'bg-gray-500'
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">EC2 Instances</h1>
          <button
            onClick={loadInstances}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
          >
            <RefreshCw size={18} className="text-white" />
            <span className="text-white">새로고침</span>
          </button>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          {loading ? (
            <p className="text-gray-300">로딩 중...</p>
          ) : (
            <div className="space-y-4">
              {instances.map((instance) => (
                <div key={instance.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(instance.state)}`} />
                    <div>
                      <p className="text-white font-semibold">{instance.id}</p>
                      <p className="text-gray-400 text-sm">{instance.type} - {instance.state}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStart(instance.id)}
                      disabled={instance.state === 'running'}
                      className="p-2 bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <Play size={16} className="text-white" />
                    </button>
                    <button
                      onClick={() => handleStop(instance.id)}
                      disabled={instance.state === 'stopped'}
                      className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      <Square size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default EC2Page

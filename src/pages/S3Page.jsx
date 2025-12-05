import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { s3API } from '../services/api'
import { Upload, Trash2, RefreshCw } from 'lucide-react'

const S3Page = () => {
  const [buckets, setBuckets] = useState([])
  const [selectedBucket, setSelectedBucket] = useState('')
  const [objects, setObjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)

  useEffect(() => {
    loadBuckets()
  }, [])

  const loadBuckets = async () => {
    try {
      const response = await s3API.listBuckets()
      setBuckets(response.data.buckets)
    } catch (error) {
      console.error('버킷 로드 실패:', error)
    }
  }

  const loadObjects = async (bucket) => {
    setLoading(true)
    try {
      const response = await s3API.listObjects(bucket)
      setObjects(response.data.objects)
    } catch (error) {
      console.error('객체 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBucketChange = (bucket) => {
    setSelectedBucket(bucket)
    loadObjects(bucket)
  }

  const handleUpload = async () => {
    if (!file || !selectedBucket) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      await s3API.uploadFile(selectedBucket, formData)
      setFile(null)
      loadObjects(selectedBucket)
    } catch (error) {
      console.error('업로드 실패:', error)
    }
  }

  const handleDelete = async (key) => {
    try {
      await s3API.deleteObject(selectedBucket, key)
      loadObjects(selectedBucket)
    } catch (error) {
      console.error('삭제 실패:', error)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-white">S3 Storage</h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-4 mb-6">
            <select
              value={selectedBucket}
              onChange={(e) => handleBucketChange(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">버킷 선택</option>
              {buckets.map((bucket) => (
                <option key={bucket} value={bucket}>{bucket}</option>
              ))}
            </select>
            <button
              onClick={loadBuckets}
              className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              <RefreshCw size={20} className="text-white" />
            </button>
          </div>

          {selectedBucket && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="flex-1 text-white"
                />
                <button
                  onClick={handleUpload}
                  disabled={!file}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Upload size={18} className="text-white" />
                  <span className="text-white">업로드</span>
                </button>
              </div>

              <div className="space-y-2">
                {loading ? (
                  <p className="text-gray-300">로딩 중...</p>
                ) : (
                  objects.map((obj) => (
                    <div key={obj.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <span className="text-white">{obj.key}</span>
                      <button
                        onClick={() => handleDelete(obj.key)}
                        className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default S3Page

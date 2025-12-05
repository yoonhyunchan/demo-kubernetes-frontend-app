import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: (credentials) => {
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  logout: () => api.post('/auth/logout')
}

export const s3API = {
  listBuckets: () => api.get('/s3/buckets'),
  listObjects: (bucket) => api.get(`/s3/buckets/${bucket}/objects`),
  uploadFile: (bucket, formData) => api.post(`/s3/buckets/${bucket}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteObject: (bucket, key) => api.delete(`/s3/buckets/${bucket}/objects/${key}`)
}

export const rdsAPI = {
  listInstances: () => api.get('/rds/instances'),
  testConnection: (instanceId) => api.post(`/rds/instances/${instanceId}/test`),
  executeQuery: (instanceId, query) => api.post(`/rds/instances/${instanceId}/query`, { query })
}

export const ec2API = {
  listInstances: () => api.get('/ec2/instances'),
  startInstance: (instanceId) => api.post(`/ec2/instances/${instanceId}/start`),
  stopInstance: (instanceId) => api.post(`/ec2/instances/${instanceId}/stop`),
  getInstanceStatus: (instanceId) => api.get(`/ec2/instances/${instanceId}/status`)
}

export const lambdaAPI = {
  listFunctions: () => api.get('/lambda/functions'),
  invokeFunction: (functionName, payload) => api.post(`/lambda/functions/${functionName}/invoke`, { payload }),
  getLogs: (functionName) => api.get(`/lambda/functions/${functionName}/logs`)
}

export const cloudwatchAPI = {
  getLogGroups: () => api.get('/cloudwatch/log-groups'),
  getLogStreams: (logGroup) => api.get(`/cloudwatch/log-groups/${encodeURIComponent(logGroup)}/streams`),
  getLogEvents: (logGroup, logStream) => api.get(`/cloudwatch/log-groups/${encodeURIComponent(logGroup)}/streams/${encodeURIComponent(logStream)}/events`),
  getMetrics: (namespace) => api.get(`/cloudwatch/metrics/${namespace}`)
}

export default api

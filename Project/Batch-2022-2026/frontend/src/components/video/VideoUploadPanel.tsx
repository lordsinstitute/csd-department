'use client'

import { Upload, Video, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface VideoUploadPanelProps {
  onVideoUploaded: (info: any) => void
}

export function VideoUploadPanel({ onVideoUploaded }: VideoUploadPanelProps) {

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const MAX_FILE_SIZE = 500 * 1024 * 1024

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {

    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // File validation
    const allowedTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/x-matroska'
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid video format. Use MP4, AVI, MOV, or MKV.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum allowed size is 500MB.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {

      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      xhr.open('POST', 'http://localhost:8000/api/video/upload')

      xhr.upload.onprogress = (event) => {

        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percent)
        }

      }

      xhr.onload = () => {

        if (xhr.status === 200) {

          const data = JSON.parse(xhr.responseText)

          console.log('✅ Video uploaded:', data)

          onVideoUploaded(data)

        } else {

          setError('Upload failed. Please try again.')

        }

        setIsUploading(false)

      }

      xhr.onerror = () => {
        setError('Network error during upload.')
        setIsUploading(false)
      }

      xhr.send(formData)

    } catch (err) {

      console.error('Upload error:', err)
      setError('Unexpected upload error')
      setIsUploading(false)

    }

  }

  return (

    <div className="glass rounded-xl p-8 border-2 border-cyan-500/30">

      <div className="text-center">

        <Video className="w-24 h-24 mx-auto text-cyan-400 mb-4"/>

        <h2 className="text-3xl font-bold text-white mb-2">
          Upload Traffic Video
        </h2>

        <p className="text-gray-400 mb-6">
          Upload a traffic video for AI-powered analysis with YOLOv8
        </p>

        {/* Upload Button */}

        <label className="block max-w-md mx-auto">

          <input
            type="file"
            accept="video/mp4,video/avi,video/mov,video/mkv"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />

          <div className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg cursor-pointer flex items-center justify-center gap-3 transition">

            <Upload className="w-6 h-6"/>

            <span>
              {isUploading ? 'Uploading...' : 'Select Video File'}
            </span>

          </div>

        </label>

        {/* Progress */}

        {isUploading && (

          <div className="mt-5 max-w-md mx-auto">

            <div className="w-full bg-gray-700 rounded-full h-2">

              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />

            </div>

            <p className="text-sm text-gray-400 mt-2">
              Uploading... {uploadProgress}%
            </p>

          </div>

        )}

        {/* Error */}

        {error && (

          <div className="mt-4 flex items-center justify-center gap-2 text-red-400">

            <AlertCircle className="w-4 h-4"/>
            <span>{error}</span>

          </div>

        )}

        {/* Info */}

        <div className="mt-6 text-sm text-gray-500">

          <p>Supported formats: MP4, AVI, MOV, MKV</p>
          <p>Maximum file size: 500MB</p>

        </div>

        {/* Features */}

        <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">

          <Feature icon="🎯" title="YOLOv8 Detection"/>
          <Feature icon="🔍" title="Vehicle Tracking"/>
          <Feature icon="📊" title="Live Analytics"/>

        </div>

      </div>

    </div>

  )
}

function Feature({ icon, title }: any) {

  return (

    <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700">

      <div className="text-2xl mb-2">{icon}</div>

      <div className="text-sm font-semibold text-gray-300">
        {title}
      </div>

    </div>

  )

}
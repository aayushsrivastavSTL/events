/*
Drop this file into your Next.js project as `pages/scan.jsx` (Pages Router).

What it provides:
- A complete, single-file client-side QR scanner using `html5-qrcode`.
- Camera start/stop, front/back toggle, upload-image fallback, simple throttle.
- Shows decoded result and an example fetch to /api/verify (commented).

Install:
  npm install html5-qrcode

Notes:
- This file is a minimal, production-ready starting point. Tweak camera constraints and UI as needed.
- Ensure your site is served over HTTPS when testing on mobile (getUserMedia requires secure context).
*/

'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function ScanPage() {
  const qrRegionId = 'html5qr-reader'
  const html5QrRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [facingMode, setFacingMode] = useState('environment') // 'user' or 'environment'
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [loadingScanner, setLoadingScanner] = useState(false)

  // helper: stop camera tracks
  const stopCamera = async () => {
    try {
      if (html5QrRef.current && html5QrRef.current.getState) {
        // html5-qrcode instance
        await html5QrRef.current.stop()
        try { html5QrRef.current.clear() } catch(e){}
      }
      // also try to stop any active tracks that html5-qrcode may have left
      const videos = document.querySelectorAll('video')
      videos.forEach(v => {
        const s = v.srcObject
        if (s && s.getTracks) s.getTracks().forEach(t => t.stop())
      })
    } catch (e) {
      // ignore
    }
  }

  // start scanner
  const startScanner = async () => {
    setErrorMsg(null)
    setPermissionDenied(false)
    setLoadingScanner(true)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      // clear previous instance if any
      if (html5QrRef.current) {
        try { await html5QrRef.current.stop() } catch(e){}
        try { html5QrRef.current.clear() } catch(e){}
        html5QrRef.current = null
      }

      // create a new instance
      const html5Qr = new Html5Qrcode(qrRegionId, /* verbose= */ false)
      html5QrRef.current = html5Qr

      // camera config — tuned for speed
      const config = {
        fps: 10, // try to keep CPU low on older phones
        qrbox: { width: 300, height: 300 },
        // disable flipping for better performance unless needed
        // experimental features: you can adjust formats if you expect specific codes
      }

      const constraints = {
        facingMode: { ideal: facingMode },
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 15, max: 20 }
      }

      // start scanning; successCallback runs when a QR is decoded
      await html5Qr.start(
        { deviceId: undefined, facingMode: constraints.facingMode },
        config,
        (decodedText, decodedResult) => {
          // Pause scanning briefly to avoid duplicate reads
          try { html5Qr.pause(true) } catch(e){}
          setLastResult({ text: decodedText, meta: decodedResult, ts: Date.now() })
          setIsScanning(false)

          // Example: call verification API (uncomment & adapt)
          // fetch(`/api/verify?registrationId=${encodeURIComponent(decodedText)}`)
          //   .then(r => r.json()).then(data => console.log('verify', data))
        },
        (errorMessage) => {
          // optional: per-frame errors (e.g., no QR found) — ignore to avoid noise
        }
      )

      setIsScanning(true)
    } catch (err) {
      console.error('Scanner start error', err)
      if (err && err.name === 'NotAllowedError') {
        setPermissionDenied(true)
        setErrorMsg('Camera permission denied. Please allow camera access and try again.')
      } else {
        setErrorMsg(err && err.message ? String(err.message) : 'Failed to start camera')
      }
    } finally {
      setLoadingScanner(false)
    }
  }

  // stop scanner when leaving the page / component unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Toggle camera facing mode (front/back)
  const toggleFacing = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    if (isScanning) {
      await stopCamera()
      // small timeout to allow camera to release
      setTimeout(() => startScanner(), 300)
    }
  }

  // Resume scanning after a successful decode (scan again)
  const resumeScanning = async () => {
    setLastResult(null)
    setErrorMsg(null)
    await startScanner()
  }

  // Fallback: decode a QR from file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setErrorMsg(null)
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const html5Qr = new Html5Qrcode(/* element id not required for file decode */ 'qr-temp')
      const result = await html5Qr.scanFile(file, /* showImage= */ true)
      setLastResult({ text: result || result.decodedText || String(result), meta: null, ts: Date.now() })
      try { html5Qr.clear() } catch(e){}
    } catch (err) {
      console.error('file decode err', err)
      setErrorMsg('Failed to decode the image. Make sure it contains a clear QR code.')
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>QR Scanner — html5-qrcode (PWA)</h1>

      <div style={{ marginBottom: 12 }}>
        <button onClick={startScanner} disabled={isScanning || loadingScanner} style={{ marginRight: 8 }}>
          {loadingScanner ? 'Starting...' : 'Start Camera'}
        </button>
        <button onClick={stopCamera} disabled={!isScanning} style={{ marginRight: 8 }}>Stop Camera</button>
        <button onClick={toggleFacing} style={{ marginRight: 8 }}>Toggle Front/Back</button>
        <label style={{ marginLeft: 8 }}>
          <input type="file" accept="image/*" onChange={handleFileUpload} />
          <span style={{ marginLeft: 6 }}>Upload QR image</span>
        </label>
      </div>

      <div id={qrRegionId} style={{ width: '100%', maxWidth: 640, height: 480, border: '1px solid #ddd', marginBottom: 12 }} />

      {permissionDenied && (
        <div style={{ color: 'crimson', marginBottom: 12 }}>
          Camera permission is blocked. Open site settings and allow camera access.
        </div>
      )}

      {errorMsg && (
        <div style={{ color: 'crimson', marginBottom: 12 }}>{errorMsg}</div>
      )}

      {lastResult ? (
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
          <h3>Decoded Result</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(lastResult.text)}</pre>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => {
              // Example: call backend to verify & checkin
              // fetch('/api/verify?registrationId=' + encodeURIComponent(lastResult.text)).then(r=>r.json()).then(console.log)
              alert('You can now call your API with the decoded value: ' + lastResult.text)
            }} style={{ marginRight: 8 }}>Call verify API</button>

            <button onClick={resumeScanning}>Scan Again</button>
          </div>
        </div>
      ) : (
        <div style={{ color: '#666' }}>No scan yet. Click <strong>Start Camera</strong> and point at a QR code.</div>
      )}

      <div style={{ marginTop: 18, color: '#666', fontSize: 13 }}>
        <strong>Notes:</strong>
        <ul>
          <li>Test on a real mobile device over HTTPS (getUserMedia requires secure context).</li>
          <li>You can tune camera constraints and fps for performance on older phones.</li>
          <li>For production, sign/verify tokens instead of trusting raw QR text.</li>
        </ul>
      </div>
    </div>
  )
}

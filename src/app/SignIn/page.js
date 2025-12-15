// components/QRScanner.jsx
'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode' // lazy import forced later

export default function QRScanner({ onDetected }){
  const elRef = useRef(null)
  const [scanner, setScanner] = useState(null)

  useEffect(()=>{
    let html5Qr = null
    let mounted = true
    (async ()=>{
      const { Html5Qrcode } = await import('html5-qrcode')
      if(!mounted) return
      html5Qr = new Html5Qrcode("qr-reader")
      setScanner(html5Qr)
      const config = { fps: 10, qrbox: { width: 300, height: 200 } }
      try {
        await html5Qr.start(
          { facingMode: { exact: "environment" } }, // fallback if not available
          config,
          (decodedText) => { onDetected(decodedText); html5Qr.pause(true) }, // pause on detection
          (error) => { /* optional per-frame error */ }
        )
      } catch(err) {
        console.error('QR start error', err)
      }
    })()

    return ()=>{
      mounted = false
      if(html5Qr){
        html5Qr.stop().catch(()=>{})
        html5Qr.clear().catch(()=>{})
      }
    }
  },[onDetected])

  return <div id="qr-reader" ref={elRef} style={{ width: '100%', maxWidth: 600, margin: '0 auto' }} />
}

import React, { useState, useRef, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ───── Icons ───── */
const CameraIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="4" y="12" width="40" height="28" rx="4" stroke="#6b7280" strokeWidth="2.5"/><circle cx="24" cy="26" r="8" stroke="#6b7280" strokeWidth="2.5"/><path d="M16 12l2-4h12l2 4" stroke="#6b7280" strokeWidth="2.5" strokeLinejoin="round"/></svg>
);
const LocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
);

/* ───── Pose Guide SVG ───── */
const PoseGuide = () => (
  <svg width="100%" viewBox="0 0 680 660" style={{maxWidth:'480px',margin:'0 auto',display:'block'}}>
    <rect x="40" y="10" width="600" height="32" rx="8" fill="#16a34a" opacity="0.12"/>
    <text x="340" y="31" textAnchor="middle" fontSize="13" fontWeight="500" fill="#16a34a" fontFamily="inherit">Correct photo — follow this pose</text>
    <ellipse cx="340" cy="105" rx="28" ry="34" fill="#D4A574" stroke="#B8956A" strokeWidth="0.8"/>
    <path d="M312 95 Q314 72 340 68 Q366 72 368 95" fill="#2C1810"/>
    <ellipse cx="340" cy="78" rx="30" ry="16" fill="#2C1810"/>
    <circle cx="330" cy="104" r="2" fill="#5C3D2E"/><circle cx="350" cy="104" r="2" fill="#5C3D2E"/>
    <path d="M335 116 Q340 120 345 116" fill="none" stroke="#5C3D2E" strokeWidth="1"/>
    <rect x="258" y="138" width="28" height="62" rx="6" fill="#F5E6D3" stroke="#E8D5C0" strokeWidth="0.5"/>
    <rect x="394" y="138" width="28" height="62" rx="6" fill="#F5E6D3" stroke="#E8D5C0" strokeWidth="0.5"/>
    <path d="M292 138 L292 262 L388 262 L388 138 L368 132 L312 132 Z" fill="#2979FF" stroke="#1565C0" strokeWidth="1"/>
    <line x1="340" y1="134" x2="340" y2="260" stroke="#1565C0" strokeWidth="1.5"/>
    <circle cx="363" cy="175" r="16" fill="#1A237E" opacity="0.8"/>
    <text x="363" y="179" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">Jio</text>
    <path d="M266 184 Q274 200 300 216" fill="none" stroke="#D4A574" strokeWidth="12" strokeLinecap="round"/>
    <path d="M414 184 Q406 200 380 216" fill="none" stroke="#D4A574" strokeWidth="12" strokeLinecap="round"/>
    <rect x="296" y="208" width="88" height="108" rx="3" fill="#1A3FA0" stroke="#0D2B7A" strokeWidth="0.8"/>
    <rect x="302" y="214" width="76" height="10" rx="2" fill="#E53935" opacity="0.8"/>
    <text x="340" y="222" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="700">EXCLUSIVE OFFER</text>
    <text x="340" y="240" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">Join Jio</text>
    <rect x="304" y="248" width="72" height="14" rx="2" fill="#FF8F00" opacity="0.7"/>
    <text x="340" y="258" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="600">Watch Cricket FREE</text>
    <rect x="304" y="268" width="72" height="14" rx="2" fill="#C62828" opacity="0.6"/>
    <text x="340" y="278" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="600">Unlimited 5G</text>
    <circle cx="374" cy="218" r="6" fill="#E53935"/>
    <text x="374" y="221" textAnchor="middle" fontSize="4.5" fill="white" fontWeight="700">Jio</text>
    <rect x="296" y="208" width="88" height="108" rx="3" fill="white" opacity="0.05"/>
    <rect x="312" y="310" width="22" height="60" rx="4" fill="#1A1A2E"/>
    <rect x="346" y="310" width="22" height="60" rx="4" fill="#1A1A2E"/>
    <rect x="308" y="364" width="30" height="10" rx="4" fill="#333"/>
    <rect x="342" y="364" width="30" height="10" rx="4" fill="#333"/>
    <line x1="208" y1="82" x2="304" y2="95" stroke="#16a34a" strokeWidth="1" markerEnd="url(#ag)"/>
    <rect x="76" y="68" width="132" height="28" rx="8" fill="#16a34a" opacity="0.1" stroke="#16a34a" strokeWidth="0.5"/>
    <text x="142" y="86" textAnchor="middle" fontSize="11" fontWeight="500" fill="#16a34a">1 person, front-facing</text>
    <line x1="464" y1="178" x2="392" y2="178" stroke="#2979FF" strokeWidth="1" markerEnd="url(#ag)"/>
    <rect x="468" y="162" width="130" height="32" rx="8" fill="#2979FF" opacity="0.1" stroke="#2979FF" strokeWidth="0.5"/>
    <text x="533" y="177" textAnchor="middle" fontSize="11" fontWeight="500" fill="#1565C0">Blue Jio vest</text>
    <text x="533" y="190" textAnchor="middle" fontSize="10" fill="#1565C0" opacity="0.7">worn on body</text>
    <line x1="464" y1="225" x2="424" y2="210" stroke="#8D6E63" strokeWidth="1" markerEnd="url(#ag)"/>
    <rect x="468" y="212" width="148" height="26" rx="8" fill="#8D6E63" opacity="0.1" stroke="#8D6E63" strokeWidth="0.5"/>
    <text x="542" y="229" textAnchor="middle" fontSize="11" fontWeight="500" fill="#5D4037">Inner sleeves visible</text>
    <line x1="208" y1="260" x2="294" y2="260" stroke="#E65100" strokeWidth="1" markerEnd="url(#ag)"/>
    <rect x="62" y="246" width="146" height="28" rx="8" fill="#E65100" opacity="0.1" stroke="#E65100" strokeWidth="0.5"/>
    <text x="135" y="264" textAnchor="middle" fontSize="11" fontWeight="500" fill="#E65100">Jio paper held visibly</text>
    <defs><marker id="ag" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></marker></defs>
    <line x1="60" y1="396" x2="620" y2="396" stroke="#e5e7eb" strokeWidth="0.5"/>
    <rect x="40" y="410" width="600" height="32" rx="8" fill="#dc2626" opacity="0.12"/>
    <text x="340" y="431" textAnchor="middle" fontSize="13" fontWeight="500" fill="#dc2626">Common mistakes — avoid these</text>
    <g transform="translate(55, 458)"><rect width="125" height="90" rx="8" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5"/><circle cx="62" cy="26" r="9" fill="#D4A574"/><rect x="42" y="38" width="40" height="30" rx="3" fill="#C62828"/><text x="62" y="53" textAnchor="middle" fontSize="6" fill="white" fontWeight="600">NOT Jio</text><line x1="18" y1="8" x2="107" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/><line x1="107" y1="8" x2="18" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/><text x="62" y="86" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">Wrong vest color</text></g>
    <g transform="translate(200, 458)"><rect width="125" height="90" rx="8" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5"/><circle cx="62" cy="26" r="9" fill="#D4A574"/><rect x="42" y="38" width="40" height="30" rx="3" fill="#2979FF"/><rect x="54" y="46" width="16" height="22" rx="2" fill="#333"/><rect x="56" y="48" width="12" height="16" rx="1" fill="#4FC3F7"/><line x1="18" y1="8" x2="107" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/><line x1="107" y1="8" x2="18" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/><text x="62" y="86" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">Phone, not paper</text></g>
    <g transform="translate(345, 458)"><rect width="125" height="90" rx="8" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5"/><circle cx="40" cy="26" r="8" fill="#D4A574"/><circle cx="84" cy="26" r="8" fill="#D4A574"/><rect x="26" y="38" width="28" height="26" rx="3" fill="#2979FF"/><rect x="70" y="38" width="28" height="26" rx="3" fill="#555"/><line x1="18" y1="8" x2="107" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/><line x1="107" y1="8" x2="18" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/><text x="62" y="86" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">Multiple people</text></g>
    <g transform="translate(490, 458)"><rect width="125" height="90" rx="8" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5"/><circle cx="62" cy="26" r="9" fill="#D4A574"/><rect x="42" y="38" width="40" height="30" rx="3" fill="#2979FF"/><text x="62" y="53" textAnchor="middle" fontSize="7" fill="white" fontWeight="600">Jio</text><line x1="18" y1="8" x2="107" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/><line x1="107" y1="8" x2="18" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/><text x="62" y="86" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">No paper held</text></g>
    <rect x="60" y="572" width="560" height="44" rx="10" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5"/>
    <text x="340" y="590" textAnchor="middle" fontSize="12" fontWeight="500" fill="#374151">Stand front-facing in a well-lit area, vest on, paper in hands</text>
    <text x="340" y="606" textAnchor="middle" fontSize="10" fill="#6b7280">No phones • No group photos • No mirror selfies</text>
  </svg>
);

/* ───── Smart retake guidance builder ───── */
function buildGuidance(result) {
  const tips = [];
  if (!result.has_jio_jacket)
    tips.push('Wear the blue Jio jacket with the Jio logo clearly visible');
  if (!result.has_laminated_jio_promotional_paper)
    tips.push('Hold the Jio promotional paper in front of you (not a phone)');
  if (!result.is_female)
    tips.push('Ensure only the female JSS is in the photo');
  if (result.review_required && tips.length === 0)
    tips.push('Stand in a well-lit area, face the camera, and ensure only one person is in the frame');
  return tips;
}

/* ───── PRM ID validation ───── */
function isValidPRM(value) {
  return /^\d{9}$/.test(value);
}

function App() {
  const [prmId, setPrmId] = useState('');
  const [prmError, setPrmError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle');  // idle | loading | success | retake | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('pending'); // pending | acquired | denied | unavailable
  const fileRef = useRef(null);

  // Request location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocStatus('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setLocStatus('acquired');
      },
      () => setLocStatus('denied'),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  const handlePrmChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPrmId(val);
    if (val.length > 0 && val.length < 9) setPrmError('PRM ID must be exactly 9 digits');
    else setPrmError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { setErrorMsg('Please upload a JPEG, PNG, or WebP image.'); setStatus('error'); return; }
    if (file.size > 10 * 1024 * 1024) { setErrorMsg('Image is too large. Maximum 10 MB.'); setStatus('error'); return; }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setStatus('idle');
    setErrorMsg('');
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!isValidPRM(prmId)) { setPrmError('PRM ID must be exactly 9 digits'); return; }
    if (!photo) { setErrorMsg('Please upload a photo.'); setStatus('error'); return; }

    // Re-request location if not yet acquired
    if (locStatus !== 'acquired' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    setStatus('loading');
    setErrorMsg('');
    setResult(null);

    const formData = new FormData();
    formData.append('prm_id', prmId);
    formData.append('photo', photo);
    if (location) {
      formData.append('latitude', location.lat.toFixed(6));
      formData.append('longitude', location.lng.toFixed(6));
      formData.append('location_accuracy', Math.round(location.accuracy).toString());
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      const resp = await fetch(`${API_URL}/api/analyze`, { method: 'POST', body: formData, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `Server error (${resp.status})`);
      }
      const data = await resp.json();
      setResult(data);

      // Decide: success (all good) or retake (something wrong)
      const allPass = data.is_female && data.has_jio_jacket && data.has_laminated_jio_promotional_paper && !data.review_required;
      setStatus(allPass ? 'success' : 'retake');
    } catch (err) {
      const msg = err.name === 'AbortError'
        ? 'Server is taking too long. Please try again in 30 seconds.'
        : (err.message || 'Something went wrong. Please try again.');
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setPrmId('');
    setPrmError('');
    setPhoto(null);
    setPreview(null);
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleRetake = () => {
    setPhoto(null);
    setPreview(null);
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
    if (fileRef.current) fileRef.current.value = '';
    // Keep prmId so they don't have to re-enter
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoRow}>
            <div style={styles.logoBadge}>JSS</div>
            <div>
              <h1 style={styles.title}>Smart JSS Readiness Checker</h1>
              <p style={styles.subtitle}>Field Compliance Verification</p>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Pose Guide - always visible when not in success/retake state */}
        {(status === 'idle' || status === 'loading' || status === 'error') && (
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>📸 How to take the correct photo</h2>
            <PoseGuide />
            <div style={{marginTop:'14px', padding:'10px 12px', background:'#f0fdf4', borderRadius:'10px', fontSize:'12px', color:'#16a34a', fontWeight:500, textAlign:'center', lineHeight:1.5}}>
              ✅ 1 person &nbsp;•&nbsp; Blue Jio vest on body &nbsp;•&nbsp; Jio paper in hands &nbsp;•&nbsp; Well-lit &nbsp;•&nbsp; No phones
            </div>
          </section>
        )}

        {/* Upload Form */}
        {(status === 'idle' || status === 'loading' || status === 'error') && (
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Upload Your Photo</h2>

            {/* Location status */}
            <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px', fontSize:'12px'}}>
              {locStatus === 'acquired' ? (
                <><LocIcon /><span style={{color:'#16a34a'}}>Location captured</span></>
              ) : locStatus === 'denied' ? (
                <span style={{color:'#f59e0b'}}>⚠ Location access denied — please enable in browser settings</span>
              ) : locStatus === 'unavailable' ? (
                <span style={{color:'#9ca3af'}}>Location not available</span>
              ) : (
                <span style={{color:'#6b7280'}}>Requesting location...</span>
              )}
            </div>

            {/* PRM ID - 9 digits only */}
            <label style={styles.label}>PRM ID <span style={{color:'#dc2626'}}>*</span></label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{9}"
              placeholder="Enter 9-digit PRM ID"
              value={prmId}
              onChange={handlePrmChange}
              style={{
                ...styles.input,
                borderColor: prmError ? '#dc2626' : '#d1d5db',
              }}
              maxLength={9}
              disabled={status === 'loading'}
            />
            {prmError && <p style={{margin:'4px 0 0', fontSize:'12px', color:'#dc2626'}}>{prmError}</p>}
            {prmId.length === 9 && !prmError && <p style={{margin:'4px 0 0', fontSize:'12px', color:'#16a34a'}}>✓ Valid PRM ID</p>}

            {/* Photo Upload */}
            <label style={styles.label}>Photo <span style={{color:'#dc2626'}}>*</span></label>
            <div
              style={{
                ...styles.dropZone,
                borderColor: preview ? '#0a3d91' : '#d1d5db',
                background: preview ? '#f0f7ff' : '#fafafa',
              }}
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" style={styles.previewImg} />
              ) : (
                <div style={styles.dropContent}>
                  <CameraIcon />
                  <p style={{margin:'8px 0 0', color:'#6b7280', fontSize:'14px'}}>Tap to take or upload photo</p>
                  <p style={{margin:'4px 0 0', color:'#9ca3af', fontSize:'12px'}}>JPEG, PNG, WebP · Max 10 MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handlePhotoChange} style={{display:'none'}} />
            </div>
            {preview && (
              <button style={styles.changeBtn} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>Change Photo</button>
            )}

            {status === 'error' && (
              <div style={styles.errorBox}><span style={{fontSize:'16px'}}>⚠️</span> {errorMsg}</div>
            )}

            <button
              onClick={handleSubmit}
              disabled={status === 'loading' || !isValidPRM(prmId) || !photo}
              style={{
                ...styles.submitBtn,
                opacity: (status === 'loading' || !isValidPRM(prmId) || !photo) ? 0.6 : 1,
                cursor: (status === 'loading' || !isValidPRM(prmId) || !photo) ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'loading' ? (
                <span style={styles.loadingText}><span style={styles.spinner}></span>Submitting... Please wait</span>
              ) : 'Submit Photo'}
            </button>

            {status === 'loading' && (
              <p style={styles.loadingHint}>This may take 10–30 seconds. Please do not close the page.</p>
            )}
          </section>
        )}

        {/* SUCCESS: Photo accepted */}
        {status === 'success' && result && (
          <section style={styles.card}>
            <div style={{textAlign:'center', padding:'20px 0'}}>
              <div style={{fontSize:'56px', marginBottom:'12px'}}>✅</div>
              <h2 style={{fontSize:'20px', fontWeight:700, color:'#16a34a', margin:'0 0 8px'}}>Photo Recorded Successfully</h2>
              <p style={{fontSize:'14px', color:'#6b7280', margin:'0 0 4px'}}>PRM ID: {result.prm_id}</p>
              <p style={{fontSize:'13px', color:'#9ca3af', margin:0}}>{result.timestamp}</p>
            </div>
            <button onClick={handleReset} style={styles.newBtn}>Submit Another Photo</button>
          </section>
        )}

        {/* RETAKE: Something was wrong — show guidance without scores */}
        {status === 'retake' && result && (
          <section style={styles.card}>
            <div style={{textAlign:'center', padding:'12px 0 16px'}}>
              <div style={{fontSize:'48px', marginBottom:'8px'}}>📸</div>
              <h2 style={{fontSize:'18px', fontWeight:700, color:'#b45309', margin:'0 0 6px'}}>Please Retake Your Photo</h2>
              <p style={{fontSize:'13px', color:'#6b7280', margin:0}}>Your photo has been saved, but it may not meet the requirements. Please try again following the guidelines below.</p>
            </div>

            <div style={{background:'#fffbeb', borderRadius:'12px', padding:'14px', marginBottom:'16px', border:'1px solid #fde68a'}}>
              <p style={{fontSize:'13px', fontWeight:600, color:'#92400e', margin:'0 0 8px'}}>Please ensure:</p>
              <ul style={{margin:0, paddingLeft:'18px', fontSize:'13px', lineHeight:1.8, color:'#78350f'}}>
                {buildGuidance(result).map((tip, i) => <li key={i}>{tip}</li>)}
                <li>Stand front-facing in a well-lit area</li>
                <li>Only one person should be in the photo</li>
              </ul>
            </div>

            <p style={{fontSize:'11px', color:'#9ca3af', textAlign:'center', margin:'0 0 12px'}}>
              PRM ID: {result.prm_id} • {result.timestamp}
            </p>

            <button onClick={handleRetake} style={{...styles.submitBtn, background:'linear-gradient(135deg, #b45309 0%, #d97706 100%)'}}>
              Retake Photo
            </button>
            <button onClick={handleReset} style={{...styles.newBtn, marginTop:'10px'}}>
              Start Over
            </button>
          </section>
        )}
      </main>

      <footer style={styles.footer}>Smart JSS Readiness Checker v5.0</footer>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  wrapper: { fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", minHeight: '100vh', background: '#f3f4f6', display: 'flex', flexDirection: 'column', margin: 0, padding: 0, WebkitFontSmoothing: 'antialiased' },
  header: { background: 'linear-gradient(135deg, #0a3d91 0%, #1e5bb5 100%)', padding: '0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' },
  headerInner: { maxWidth: '480px', margin: '0 auto', padding: '16px 20px' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoBadge: { width: '42px', height: '42px', borderRadius: '10px', background: '#ffffff', color: '#0a3d91', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '1px', flexShrink: 0 },
  title: { margin: 0, fontSize: '17px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 },
  subtitle: { margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: 400 },
  main: { maxWidth: '480px', margin: '0 auto', padding: '16px', width: '100%', boxSizing: 'border-box', flex: 1 },
  card: { background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: '16px', fontWeight: 700, color: '#1f2937', margin: '0 0 16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px', marginTop: '14px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '16px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', letterSpacing: '2px' },
  dropZone: { border: '2px dashed #d1d5db', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dropContent: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  previewImg: { maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain' },
  changeBtn: { marginTop: '8px', padding: '6px 14px', fontSize: '12px', color: '#0a3d91', background: '#e8f0fe', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' },
  errorBox: { marginTop: '12px', padding: '12px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' },
  submitBtn: { marginTop: '20px', width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0a3d91 0%, #1e5bb5 100%)', color: '#ffffff', fontSize: '15px', fontWeight: 700, fontFamily: 'inherit', letterSpacing: '0.3px' },
  loadingText: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  spinner: { display: 'inline-block', width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  loadingHint: { textAlign: 'center', fontSize: '12px', color: '#6b7280', marginTop: '10px' },
  newBtn: { marginTop: '16px', width: '100%', padding: '13px', borderRadius: '12px', border: '2px solid #0a3d91', background: '#ffffff', color: '#0a3d91', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  footer: { textAlign: 'center', padding: '16px', fontSize: '11px', color: '#9ca3af', borderTop: '1px solid #e5e7eb', background: '#ffffff' },
};

export default App;

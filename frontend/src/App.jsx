import React, { useState, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ───── Inline SVG Icons ───── */
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#16a34a"/><path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const CrossIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#dc2626"/><path d="M7 7l6 6M13 7l-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
);
const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#f59e0b"/><path d="M10 6v5M10 13.5v.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
);
const CameraIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="4" y="12" width="40" height="28" rx="4" stroke="#6b7280" strokeWidth="2.5"/><circle cx="24" cy="26" r="8" stroke="#6b7280" strokeWidth="2.5"/><path d="M16 12l2-4h12l2 4" stroke="#6b7280" strokeWidth="2.5" strokeLinejoin="round"/></svg>
);

function App() {
  const [prmId, setPrmId] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Please upload a JPEG, PNG, or WebP image.');
      setStatus('error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image is too large. Maximum 10 MB.');
      setStatus('error');
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setStatus('idle');
    setErrorMsg('');
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!prmId.trim()) { setErrorMsg('Please enter your PRM ID.'); setStatus('error'); return; }
    if (!photo) { setErrorMsg('Please upload a photo.'); setStatus('error'); return; }

    setStatus('loading');
    setErrorMsg('');
    setResult(null);

    const formData = new FormData();
    formData.append('prm_id', prmId.trim());
    formData.append('photo', photo);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      const resp = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `Server error (${resp.status})`);
      }
      const data = await resp.json();
      setResult(data);
      setStatus('success');
    } catch (err) {
      const msg = err.name === 'AbortError'
        ? 'Server is taking too long. It may be waking up from sleep — please try again in 30 seconds.'
        : (err.message || 'Something went wrong. Please try again.');
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setPrmId('');
    setPhoto(null);
    setPreview(null);
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const passAll = result && result.is_female && result.has_jio_jacket && result.has_laminated_jio_promotional_paper && !result.review_required;

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
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>📸 Photo Guidelines</h2>
          <div style={styles.guideGrid}>
            <div style={styles.guideDo}>
              <div style={styles.guideBadge}>✅ DO THIS</div>
              <ul style={styles.guideList}>
                <li>Stand facing the camera, upper body clearly visible</li>
                <li>Wear the blue Jio jacket (on your body)</li>
                <li>Hold the laminated Jio offer paper in front</li>
                <li>Take photo in a well-lit area</li>
                <li>Only one person in the frame</li>
              </ul>
            </div>
            <div style={styles.guideAvoid}>
              <div style={{...styles.guideBadge, background: '#fef2f2', color: '#dc2626'}}>❌ AVOID</div>
              <ul style={styles.guideList}>
                <li>Jacket on table/hanger/floor</li>
                <li>Holding the wrong paper or white pages</li>
                <li>Group or crowd photos</li>
                <li>Mirror selfies</li>
                <li>Dark, blurry, or overexposed photos</li>
              </ul>
            </div>
          </div>
        </section>

        {status !== 'success' && (
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Upload Your Photo</h2>
            <label style={styles.label}>PRM ID <span style={{color:'#dc2626'}}>*</span></label>
            <input
              type="text"
              placeholder="Enter your PRM ID"
              value={prmId}
              onChange={(e) => setPrmId(e.target.value)}
              style={styles.input}
              maxLength={50}
              disabled={status === 'loading'}
            />
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
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handlePhotoChange}
                style={{display:'none'}}
              />
            </div>
            {preview && (
              <button
                style={styles.changeBtn}
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              >
                Change Photo
              </button>
            )}
            {status === 'error' && (
              <div style={styles.errorBox}>
                <span style={{fontSize:'16px'}}>⚠️</span> {errorMsg}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={status === 'loading' || !prmId.trim() || !photo}
              style={{
                ...styles.submitBtn,
                opacity: (status === 'loading' || !prmId.trim() || !photo) ? 0.6 : 1,
                cursor: (status === 'loading' || !prmId.trim() || !photo) ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'loading' ? (
                <span style={styles.loadingText}>
                  <span style={styles.spinner}></span>
                  Analyzing... Please wait
                </span>
              ) : (
                'Submit for Analysis'
              )}
            </button>
            {status === 'loading' && (
              <p style={styles.loadingHint}>
                Analysis takes 5–15 seconds. First request after idle may take up to 60 seconds while the server warms up. Please do not close the page.
              </p>
            )}
          </section>
        )}

        {status === 'success' && result && (
          <section style={styles.card}>
            <div style={{
              ...styles.statusBanner,
              background: passAll ? '#f0fdf4' : result.review_required ? '#fffbeb' : '#fef2f2',
              borderColor: passAll ? '#16a34a' : result.review_required ? '#f59e0b' : '#dc2626',
            }}>
              <span style={{fontSize:'28px'}}>
                {passAll ? '✅' : result.review_required ? '⚠️' : '❌'}
              </span>
              <div>
                <strong style={{fontSize:'16px', color: passAll ? '#16a34a' : result.review_required ? '#b45309' : '#dc2626'}}>
                  {passAll ? 'ALL CHECKS PASSED' : result.review_required ? 'REVIEW REQUIRED' : 'CHECKS FAILED'}
                </strong>
                {result.review_reason && (
                  <p style={{margin:'4px 0 0', fontSize:'13px', color:'#6b7280'}}>{result.review_reason}</p>
                )}
              </div>
            </div>
            <div style={styles.checkGrid}>
              <CheckRow label="Female" pass={result.is_female} confidence={result.female_confidence} />
              <CheckRow label="Jio Jacket Worn" pass={result.has_jio_jacket} confidence={result.jacket_confidence} />
              <CheckRow label="Correct Jio Paper" pass={result.has_laminated_jio_promotional_paper} confidence={result.paper_confidence} />
            </div>
            <div style={styles.detailsSection}>
              <h3 style={{fontSize:'14px', fontWeight:600, color:'#374151', margin:'0 0 8px'}}>Submission Details</h3>
              <DetailRow label="PRM ID" value={result.prm_id} />
              <DetailRow label="Filename" value={result.filename} />
              <DetailRow label="Timestamp" value={result.timestamp} />
              <DetailRow label="Image Size" value={`${result.image_width} × ${result.image_height}`} />
              <DetailRow label="Review Required" value={result.review_required ? 'Yes' : 'No'} highlight={result.review_required} />
              <DetailRow label="Sheet Status" value={result.google_sheet_row_status} />
              {result.drive_file_url && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Drive Link</span>
                  <a href={result.drive_file_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                    Open in Drive ↗
                  </a>
                </div>
              )}
            </div>
            <button onClick={handleReset} style={styles.newBtn}>
              Submit Another Photo
            </button>
          </section>
        )}
      </main>

      <footer style={styles.footer}>
        Smart JSS Readiness Checker v2.0
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function CheckRow({ label, pass, confidence }) {
  const pct = Math.round((confidence || 0) * 100);
  return (
    <div style={styles.checkRow}>
      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
        {pass ? <CheckIcon /> : <CrossIcon />}
        <span style={{fontWeight:500, color:'#1f2937'}}>{label}</span>
      </div>
      <div style={styles.confBar}>
        <div style={{
          ...styles.confFill,
          width: `${pct}%`,
          background: pct >= 70 ? '#16a34a' : pct >= 50 ? '#f59e0b' : '#dc2626',
        }} />
        <span style={styles.confText}>{pct}%</span>
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={{
        ...styles.detailValue,
        color: highlight ? '#dc2626' : '#1f2937',
        fontWeight: highlight ? 600 : 400,
      }}>{value || '—'}</span>
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
  guideGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  guideDo: { background: '#f0fdf4', borderRadius: '10px', padding: '12px' },
  guideAvoid: { background: '#fef2f2', borderRadius: '10px', padding: '12px' },
  guideBadge: { display: 'inline-block', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#dcfce7', color: '#16a34a', marginBottom: '8px', letterSpacing: '0.5px' },
  guideList: { margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: 1.6, color: '#374151' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px', marginTop: '14px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '15px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  dropZone: { border: '2px dashed #d1d5db', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dropContent: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  previewImg: { maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain' },
  changeBtn: { marginTop: '8px', padding: '6px 14px', fontSize: '12px', color: '#0a3d91', background: '#e8f0fe', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' },
  errorBox: { marginTop: '12px', padding: '12px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' },
  submitBtn: { marginTop: '20px', width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0a3d91 0%, #1e5bb5 100%)', color: '#ffffff', fontSize: '15px', fontWeight: 700, fontFamily: 'inherit', letterSpacing: '0.3px' },
  loadingText: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  spinner: { display: 'inline-block', width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  loadingHint: { textAlign: 'center', fontSize: '12px', color: '#6b7280', marginTop: '10px' },
  statusBanner: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', border: '1.5px solid', marginBottom: '16px' },
  checkGrid: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' },
  checkRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f9fafb', borderRadius: '10px' },
  confBar: { width: '80px', height: '8px', background: '#e5e7eb', borderRadius: '4px', position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' },
  confFill: { height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' },
  confText: { fontSize: '11px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap', position: 'absolute', right: '-36px' },
  detailsSection: { borderTop: '1px solid #f3f4f6', paddingTop: '14px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', borderBottom: '1px solid #f9fafb' },
  detailLabel: { color: '#6b7280', fontWeight: 500 },
  detailValue: { color: '#1f2937', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' },
  link: { color: '#0a3d91', fontWeight: 600, textDecoration: 'none', fontSize: '13px' },
  newBtn: { marginTop: '16px', width: '100%', padding: '13px', borderRadius: '12px', border: '2px solid #0a3d91', background: '#ffffff', color: '#0a3d91', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  footer: { textAlign: 'center', padding: '16px', fontSize: '11px', color: '#9ca3af', borderTop: '1px solid #e5e7eb', background: '#ffffff' },
};

export default App;

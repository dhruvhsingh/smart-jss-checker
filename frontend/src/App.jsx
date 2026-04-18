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

/* ───── Pose Guide SVG Illustration ───── */
const PoseGuide = () => (
  <svg width="100%" viewBox="0 0 680 660" style={{maxWidth:'480px',margin:'0 auto',display:'block'}}>
    {/* CORRECT header */}
    <rect x="40" y="10" width="600" height="32" rx="8" fill="#16a34a" opacity="0.12"/>
    <text x="340" y="31" textAnchor="middle" fontSize="13" fontWeight="500" fill="#16a34a" fontFamily="inherit">Correct photo — follow this pose</text>

    {/* Head */}
    <ellipse cx="340" cy="105" rx="28" ry="34" fill="#D4A574" stroke="#B8956A" strokeWidth="0.8"/>
    <path d="M312 95 Q314 72 340 68 Q366 72 368 95" fill="#2C1810"/>
    <ellipse cx="340" cy="78" rx="30" ry="16" fill="#2C1810"/>
    <circle cx="330" cy="104" r="2" fill="#5C3D2E"/>
    <circle cx="350" cy="104" r="2" fill="#5C3D2E"/>
    <path d="M335 116 Q340 120 345 116" fill="none" stroke="#5C3D2E" strokeWidth="1"/>

    {/* Inner shirt sleeves */}
    <rect x="258" y="138" width="28" height="62" rx="6" fill="#F5E6D3" stroke="#E8D5C0" strokeWidth="0.5"/>
    <rect x="394" y="138" width="28" height="62" rx="6" fill="#F5E6D3" stroke="#E8D5C0" strokeWidth="0.5"/>

    {/* Blue Jio Vest */}
    <path d="M292 138 L292 262 L388 262 L388 138 L368 132 L312 132 Z" fill="#2979FF" stroke="#1565C0" strokeWidth="1"/>
    <line x1="340" y1="134" x2="340" y2="260" stroke="#1565C0" strokeWidth="1.5"/>
    <circle cx="363" cy="175" r="16" fill="#1A237E" opacity="0.8"/>
    <text x="363" y="179" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">Jio</text>

    {/* Arms holding paper - raised to chest level */}
    <path d="M266 184 Q274 200 300 216" fill="none" stroke="#D4A574" strokeWidth="12" strokeLinecap="round"/>
    <path d="M414 184 Q406 200 380 216" fill="none" stroke="#D4A574" strokeWidth="12" strokeLinecap="round"/>

    {/* Promotional Paper - held in front of torso */}
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

    {/* Legs - visible below paper */}
    <rect x="312" y="310" width="22" height="60" rx="4" fill="#1A1A2E"/>
    <rect x="346" y="310" width="22" height="60" rx="4" fill="#1A1A2E"/>
    <rect x="308" y="364" width="30" height="10" rx="4" fill="#333"/>
    <rect x="342" y="364" width="30" height="10" rx="4" fill="#333"/>

    {/* Annotation: single person */}
    <line x1="208" y1="82" x2="304" y2="95" stroke="#16a34a" strokeWidth="1" markerEnd="url(#ag)"/>
    <rect x="76" y="68" width="132" height="28" rx="8" fill="#16a34a" opacity="0.1" stroke="#16a34a" strokeWidth="0.5"/>
    <text x="142" y="86" textAnchor="middle" fontSize="11" fontWeight="500" fill="#16a34a">1 person, front-facing</text>

    {/* Annotation: blue vest */}
    <line x1="464" y1="178" x2="392" y2="178" stroke="#2979FF" strokeWidth="1" markerEnd="url(#ag)"/>
    <rect x="468" y="162" width="130" height="32" rx="8" fill="#2979FF" opacity="0.1" stroke="#2979FF" strokeWidth="0.5"/>
    <text x="533" y="177" textAnchor="middle" fontSize="11" fontWeight="500" fill="#1565C0">Blue Jio vest</text>
    <text x="533" y="190" textAnchor="middle" fontSize="10" fill="#1565C0" opacity="0.7">worn on body</text>

    {/* Annotation: inner sleeves */}
    <line x1="464" y1="225" x2="424" y2="210" stroke="#8D6E63" strokeWidth="1" markerEnd="url(#ag)"/>
    <rect x="468" y="212" width="148" height="26" rx="8" fill="#8D6E63" opacity="0.1" stroke="#8D6E63" strokeWidth="0.5"/>
    <text x="542" y="229" textAnchor="middle" fontSize="11" fontWeight="500" fill="#5D4037">Inner sleeves visible</text>

    {/* Annotation: paper held */}
    <line x1="208" y1="260" x2="294" y2="260" stroke="#E65100" strokeWidth="1" markerEnd="url(#ag)"/>
    <rect x="62" y="246" width="146" height="28" rx="8" fill="#E65100" opacity="0.1" stroke="#E65100" strokeWidth="0.5"/>
    <text x="135" y="264" textAnchor="middle" fontSize="11" fontWeight="500" fill="#E65100">Jio paper held visibly</text>

    {/* Arrow marker */}
    <defs><marker id="ag" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></marker></defs>

    {/* Divider */}
    <line x1="60" y1="396" x2="620" y2="396" stroke="#e5e7eb" strokeWidth="0.5"/>

    {/* WRONG header */}
    <rect x="40" y="410" width="600" height="32" rx="8" fill="#dc2626" opacity="0.12"/>
    <text x="340" y="431" textAnchor="middle" fontSize="13" fontWeight="500" fill="#dc2626">Common mistakes — avoid these</text>

    {/* Mistake 1: Wrong vest color */}
    <g transform="translate(55, 458)">
      <rect width="125" height="90" rx="8" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5"/>
      <circle cx="62" cy="26" r="9" fill="#D4A574"/>
      <rect x="42" y="38" width="40" height="30" rx="3" fill="#C62828"/>
      <text x="62" y="53" textAnchor="middle" fontSize="6" fill="white" fontWeight="600">NOT Jio</text>
      <line x1="18" y1="8" x2="107" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
      <line x1="107" y1="8" x2="18" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
      <text x="62" y="86" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">Wrong vest color</text>
    </g>

    {/* Mistake 2: Phone not paper */}
    <g transform="translate(200, 458)">
      <rect width="125" height="90" rx="8" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5"/>
      <circle cx="62" cy="26" r="9" fill="#D4A574"/>
      <rect x="42" y="38" width="40" height="30" rx="3" fill="#2979FF"/>
      <rect x="54" y="46" width="16" height="22" rx="2" fill="#333"/>
      <rect x="56" y="48" width="12" height="16" rx="1" fill="#4FC3F7"/>
      <line x1="18" y1="8" x2="107" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
      <line x1="107" y1="8" x2="18" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
      <text x="62" y="86" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">Phone, not paper</text>
    </g>

    {/* Mistake 3: Multiple people */}
    <g transform="translate(345, 458)">
      <rect width="125" height="90" rx="8" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5"/>
      <circle cx="40" cy="26" r="8" fill="#D4A574"/>
      <circle cx="84" cy="26" r="8" fill="#D4A574"/>
      <rect x="26" y="38" width="28" height="26" rx="3" fill="#2979FF"/>
      <rect x="70" y="38" width="28" height="26" rx="3" fill="#555"/>
      <line x1="18" y1="8" x2="107" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
      <line x1="107" y1="8" x2="18" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
      <text x="62" y="86" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">Multiple people</text>
    </g>

    {/* Mistake 4: No paper */}
    <g transform="translate(490, 458)">
      <rect width="125" height="90" rx="8" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5"/>
      <circle cx="62" cy="26" r="9" fill="#D4A574"/>
      <rect x="42" y="38" width="40" height="30" rx="3" fill="#2979FF"/>
      <text x="62" y="53" textAnchor="middle" fontSize="7" fill="white" fontWeight="600">Jio</text>
      <line x1="18" y1="8" x2="107" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
      <line x1="107" y1="8" x2="18" y2="82" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
      <text x="62" y="86" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">No paper held</text>
    </g>

    {/* Bottom tip */}
    <rect x="60" y="572" width="560" height="44" rx="10" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5"/>
    <text x="340" y="590" textAnchor="middle" fontSize="12" fontWeight="500" fill="#374151">Stand front-facing in a well-lit area, vest on, paper in hands</text>
    <text x="340" y="606" textAnchor="middle" fontSize="10" fill="#6b7280">No phones • No group photos • No mirror selfies</text>
  </svg>
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
          <h2 style={styles.cardTitle}>📸 How to take the correct photo</h2>
          <PoseGuide />
          <div style={{marginTop:'14px', padding:'10px 12px', background:'#f0fdf4', borderRadius:'10px', fontSize:'12px', color:'#16a34a', fontWeight:500, textAlign:'center', lineHeight:1.5}}>
            ✅ 1 person &nbsp;•&nbsp; Blue Jio vest on body &nbsp;•&nbsp; Jio paper in hands &nbsp;•&nbsp; Well-lit &nbsp;•&nbsp; No phones
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

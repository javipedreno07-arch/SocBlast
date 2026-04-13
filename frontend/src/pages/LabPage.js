{/* LABS */}
<div style={{ padding:'100px 60px', backgroundColor:CARD, borderTop:`1px solid ${BD}` }}>
  <div style={{ maxWidth:'1140px', margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', alignItems:'center', gap:'80px' }}>
    <div>
      <p style={{ fontSize:'11px', color:'#10b981', letterSpacing:'3px', fontWeight:700, marginBottom:'16px' }}>LABS</p>
      <h2 style={{ fontSize:'clamp(26px,3.2vw,42px)', fontWeight:800, letterSpacing:'-1.2px', color:T1, lineHeight:1.1, marginBottom:'18px' }}>
        {es?'Investigación forense\nlibre y evaluada.':'Free forensic\ninvestigation. Evaluated.'}
      </h2>
      <p style={{ fontSize:'15px', color:T2, lineHeight:1.8, marginBottom:'28px' }}>
        {es?'Sin tiempo límite. Explora el SIEM, investiga logs, mapea la red y entrega tu informe. La IA evalúa la profundidad de tu análisis, no la velocidad.':'No time limit. Explore the SIEM, investigate logs, map the network and submit your report. AI evaluates depth, not speed.'}
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'28px' }}>
        {[
          {icon:'🖥️', label:es?'SIEM simulado':'Simulated SIEM',      desc:es?'Queries tipo Splunk reales':'Real Splunk-style queries'},
          {icon:'📋', label:'Log Explorer',                           desc:es?'Todos los eventos del entorno':'All environment events'},
          {icon:'🌐', label:es?'Mapa de red':'Network Map',           desc:es?'Hosts y conexiones visuales':'Visual hosts and connections'},
          {icon:'📝', label:es?'Ticket system':'Ticket system',       desc:es?'Documenta y entrega':'Document and submit'},
        ].map((item,i)=>(
          <div key={i} style={{ padding:'14px', borderRadius:'12px', backgroundColor:'#f8fafc', border:`1px solid ${BD}`, display:'flex', gap:'10px', alignItems:'flex-start' }}>
            <span style={{ fontSize:'20px' }}>{item.icon}</span>
            <div>
              <p style={{ fontSize:'13px', fontWeight:700, color:T1, marginBottom:'2px' }}>{item.label}</p>
              <p style={{ fontSize:'12px', color:T3 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding:'14px 18px', borderRadius:'12px', backgroundColor:'#f0fdf4', border:'1px solid #bbf7d0', marginBottom:'24px' }}>
        <p style={{ fontSize:'13px', color:'#15803d', lineHeight:1.6 }}>
          💡 <strong>{es?'Diferencia clave:':'Key difference:'}</strong> {es?'Las sesiones puntúan velocidad. Los labs puntúan profundidad. Son habilidades distintas.':'Sessions score speed. Labs score depth. Different skills.'}
        </p>
      </div>
      <button className="btn-primary" onClick={()=>navigate('/register')} style={{ padding:'12px 28px', borderRadius:'100px', background:`linear-gradient(135deg,#059669,#10b981)`, border:'none', color:'#fff', fontWeight:600, fontSize:'14px', cursor:'pointer', boxShadow:'0 4px 16px rgba(16,185,129,0.3)' }}>
        {es?'Acceder al laboratorio →':'Access the lab →'}
      </button>
    </div>

    {/* Mockup lab */}
    <div style={{ borderRadius:'16px', overflow:'hidden', border:`1px solid ${BD}`, boxShadow:'0 8px 32px rgba(0,0,0,0.07)' }}>
      <div style={{ backgroundColor:'#f8fafc', padding:'11px 16px', borderBottom:`1px solid ${BD}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:'5px' }}>
          {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{ width:'9px', height:'9px', borderRadius:'50%', backgroundColor:c }}/>)}
        </div>
        <span style={{ fontSize:'11px', color:'#10b981', letterSpacing:'1.5px', fontWeight:700 }}>SIEM — Operación NightHawk</span>
        <span style={{ fontSize:'11px', color:T3 }}>🔬 LAB</span>
      </div>
      <div style={{ backgroundColor:'#0f172a', padding:'20px', fontFamily:"'Fira Code',monospace", fontSize:'12px' }}>
        <p style={{ color:'#64748b', marginBottom:'8px' }}>siem&gt; index=windows EventID=4688</p>
        <div style={{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'12px', marginBottom:'12px', border:'1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color:'#94a3b8', marginBottom:'4px' }}>02:31:52 host=SRV-DC01 process=<span style={{ color:'#fb923c' }}>cmd.exe</span> parent=svchost.exe</p>
          <p style={{ color:'#94a3b8', marginBottom:'4px' }}>02:32:01 host=SRV-DC01 process=<span style={{ color:'#fb923c' }}>powershell.exe</span> parent=cmd.exe</p>
          <p style={{ color:'#f87171', marginBottom:'0' }}>02:32:15 host=SRV-DC01 process=<span style={{ color:'#f87171', fontWeight:700 }}>mimikatz.exe</span> parent=powershell.exe ⚠</p>
        </div>
        <p style={{ color:'#64748b', marginBottom:'8px' }}>siem&gt; index=dns</p>
        <div style={{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'12px', border:'1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color:'#f87171' }}>02:33:45 query=<span style={{ color:'#f87171', fontWeight:700 }}>c2.nighthawk-ops.ru</span> → 185.220.101.45 ⚠</p>
          <p style={{ color:'#f87171' }}>02:34:01 query=<span style={{ color:'#f87171', fontWeight:700 }}>exfil.nighthawk-ops.ru</span> → 185.220.101.45 ⚠</p>
        </div>
        <div style={{ marginTop:'12px', padding:'10px 12px', borderRadius:'8px', backgroundColor:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.15)' }}>
          <p style={{ color:'#34d399', fontSize:'11px' }}>📝 Nota añadida: "mimikatz detectado en DC — credential dumping activo"</p>
        </div>
      </div>
    </div>
  </div>
</div>
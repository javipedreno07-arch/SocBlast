import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ── COLORES — mismo sistema que el dashboard ──────────────────────────────────
const BG   = '#f0f4ff';
const CARD = '#ffffff';
const CARD2= '#f8fafc';
const BD   = '#e8eaf0';
const BD2  = '#c7d2fe';
const T1   = '#0f172a';
const T2   = '#475569';
const T3   = '#94a3b8';
const ACC  = '#4f46e5';
const GREEN= '#059669';
const RED  = '#ef4444';
const GOLD = '#d97706';

const LESSON_IMAGES = {
  '1-1':'SOC security operations center monitors screens',
  '1-2':'OSI model network layers diagram',
  '1-3':'Windows event log viewer security',
  '1-4':'cybersecurity analyst workstation SIEM dashboard',
  '1-5':'brute force attack login attempt server',
  '2-1':'Splunk SIEM dashboard security events',
  '2-2':'MITRE ATT&CK framework matrix',
  '2-3':'threat intelligence IOC indicators compromise',
  '2-4':'phishing email malware attachment analysis',
  '3-1':'incident response NIST cybersecurity framework',
  '3-2':'cybersecurity incident severity triage',
  '3-3':'ransomware attack network response',
  '4-1':'threat hunting analyst logs dark screen',
  '4-2':'network anomaly detection suspicious activity',
  '5-1':'digital forensics computer evidence analysis',
  '5-2':'malware analysis reverse engineering',
  '6-1':'network IDS IPS firewall traffic analysis',
  '6-2':'DNS tunneling network traffic wireshark',
  '7-1':'AWS cloud security dashboard IAM',
  '7-2':'cloud security breach AWS compromised account',
  '8-1':'Python scripting automation cybersecurity terminal',
  '9-1':'malware static dynamic analysis sandbox',
  '10-1':'penetration testing nmap reconnaissance hacking',
  '11-1':'SOC analyst alert fatigue multiple screens',
  '12-1':'SOC certification exam professional analyst',
};

const COLORES_SECCION = [
  { bg:'rgba(79,70,229,0.05)',  border:'rgba(79,70,229,0.18)',  accent:'#4f46e5' },
  { bg:'rgba(5,150,105,0.05)', border:'rgba(5,150,105,0.18)',  accent:'#059669' },
  { bg:'rgba(217,119,6,0.05)', border:'rgba(217,119,6,0.18)',  accent:'#d97706' },
  { bg:'rgba(124,58,237,0.05)',border:'rgba(124,58,237,0.18)', accent:'#7c3aed' },
  { bg:'rgba(239,68,68,0.05)', border:'rgba(239,68,68,0.18)',  accent:'#ef4444' },
];

const parsearTeoria = (texto) => {
  const lineas = texto.split('\n');
  const bloques = [];
  let actual = null;
  let colorIdx = 0;
  const push = () => { if (actual) { bloques.push(actual); actual = null; } };
  for (const raw of lineas) {
    const l = raw.trim();
    if (!l) { push(); continue; }
    if (/^[A-ZÁÉÍÓÚÑ\s\d]+[—:]/.test(l) && l === l.toUpperCase().replace(/[—:.\-]/g,'').trim() + l.slice(l.replace(/[—:.\-]/g,'').trim().length)) {
      push();
      const titulo = l.split(/[—:]/)[0].trim();
      const sub    = l.includes('—') ? l.split('—')[1].trim() : '';
      actual = { tipo:'seccion', titulo, sub, items:[], color:COLORES_SECCION[colorIdx++ % COLORES_SECCION.length] };
      continue;
    }
    const esTituloMayus = l.length < 80 && l === l.toUpperCase() && /[A-Z]/.test(l) && !l.startsWith('━');
    if (esTituloMayus) {
      push();
      actual = { tipo:'seccion', titulo:l.replace(/[—:]+$/, '').trim(), sub:'', items:[], color:COLORES_SECCION[colorIdx++ % COLORES_SECCION.length] };
      continue;
    }
    if (/^[━─=]{3,}/.test(l)) { push(); actual = { tipo:'separador' }; push(); continue; }
    if (l.startsWith('index=') || l.startsWith('nmap') || l.startsWith('import ') || l.startsWith('def ') || l.startsWith('with ') || l.startsWith('for ') || /^\w+ = /.test(l)) {
      if (actual?.tipo !== 'codigo') { push(); actual = { tipo:'codigo', lineas:[] }; }
      actual.lineas.push(l); continue;
    }
    if (/^[-•·]\s/.test(l) || /^\d+\.\s/.test(l) || /^[🔴🟠🟡🟢✓✗⚠T]/.test(l)) {
      const texto = l.replace(/^[-•·]\s*/, '').replace(/^\d+\.\s*/, '');
      if (actual?.tipo === 'seccion') { actual.items.push(texto); continue; }
      if (actual?.tipo !== 'lista') { push(); actual = { tipo:'lista', items:[], color:COLORES_SECCION[colorIdx % COLORES_SECCION.length] }; }
      actual.items.push(texto); continue;
    }
    if (actual?.tipo === 'codigo') { actual.lineas.push(l); continue; }
    if (!actual) { actual = { tipo:'parrafo', texto:l }; }
    else if (actual.tipo === 'parrafo') { actual.texto += ' ' + l; }
    else { push(); actual = { tipo:'parrafo', texto:l }; }
  }
  push();
  return bloques;
};

const TeoriaVisual = ({ texto }) => {
  const bloques = parsearTeoria(texto);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
      {bloques.map((b, i) => {
        if (b.tipo === 'parrafo') return (
          <p key={i} style={{ fontSize:'15px', color:T2, lineHeight:1.85, letterSpacing:'0.01em' }}>{b.texto}</p>
        );
        if (b.tipo === 'seccion') return (
          <div key={i} style={{ borderRadius:'12px', backgroundColor:b.color.bg, border:`1px solid ${b.color.border}`, overflow:'hidden' }}>
            <div style={{ padding:'10px 16px', borderBottom:b.items.length?`1px solid ${b.color.border}`:undefined, display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'3px', height:'14px', borderRadius:'2px', backgroundColor:b.color.accent, flexShrink:0 }}/>
              <span style={{ fontSize:'11px', fontWeight:700, color:b.color.accent, letterSpacing:'1.5px', fontFamily:'monospace' }}>{b.titulo}</span>
              {b.sub && <span style={{ fontSize:'12px', color:T3 }}>— {b.sub}</span>}
            </div>
            {b.items.length > 0 && (
              <div style={{ padding:'10px 16px', display:'flex', flexDirection:'column', gap:'6px' }}>
                {b.items.map((item, j) => {
                  const esAlerta = /^[🔴🟠🟡🟢]/.test(item);
                  const colorItem = item.startsWith('🔴')?RED:item.startsWith('🟢')?GREEN:item.startsWith('🟠')?'#f97316':item.startsWith('🟡')?GOLD:T2;
                  return (
                    <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:'8px', padding:esAlerta?'6px 10px':'0', borderRadius:esAlerta?'7px':undefined, backgroundColor:esAlerta?`${colorItem}08`:undefined, border:esAlerta?`1px solid ${colorItem}20`:undefined }}>
                      {!esAlerta && <div style={{ width:'4px', height:'4px', borderRadius:'50%', backgroundColor:b.color.accent, marginTop:'9px', flexShrink:0 }}/>}
                      <span style={{ fontSize:'14px', color:colorItem, lineHeight:1.7 }}>{item}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
        if (b.tipo === 'lista') return (
          <div key={i} style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
            {b.items.map((item, j) => {
              const esAlerta = /^[🔴🟠🟡🟢]/.test(item);
              const colorItem = item.startsWith('🔴')?RED:item.startsWith('🟢')?GREEN:item.startsWith('🟠')?'#f97316':item.startsWith('🟡')?GOLD:T2;
              return (
                <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:'8px', padding:'8px 12px', borderRadius:'8px', backgroundColor:esAlerta?`${colorItem}06`:CARD2, border:`1px solid ${esAlerta?colorItem+'15':BD}` }}>
                  {!esAlerta && <div style={{ width:'4px', height:'4px', borderRadius:'50%', backgroundColor:ACC, marginTop:'9px', flexShrink:0 }}/>}
                  <span style={{ fontSize:'14px', color:colorItem, lineHeight:1.7 }}>{item}</span>
                </div>
              );
            })}
          </div>
        );
        if (b.tipo === 'codigo') return (
          <div key={i} style={{ borderRadius:'10px', backgroundColor:'#0f172a', border:`1px solid #1e293b`, overflow:'hidden' }}>
            <div style={{ padding:'6px 14px', backgroundColor:'rgba(79,70,229,0.08)', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'6px' }}>
              {['#ef4444','#f59e0b','#22c55e'].map((c,k) => <div key={k} style={{ width:'8px', height:'8px', borderRadius:'50%', backgroundColor:c+'aa' }}/>)}
            </div>
            <div style={{ padding:'14px 16px' }}>
              {b.lineas.map((linea, j) => (
                <div key={j} style={{ fontSize:'12px', color:linea.includes('==')||linea.includes('✓')?'#22d3a0':linea.startsWith('#')?'#64748b':'#a5b4fc', fontFamily:'monospace', lineHeight:1.8 }}>
                  {linea}
                </div>
              ))}
            </div>
          </div>
        );
        return null;
      })}
    </div>
  );
};

const LeccionImagen = ({ query }) => {
  const [src, setSrc] = useState(null);
  useEffect(() => { if (query) setSrc(`https://source.unsplash.com/900x380/?${encodeURIComponent(query)}`); }, [query]);
  if (!src) return null;
  return (
    <div style={{ borderRadius:'14px', overflow:'hidden', marginBottom:'24px', border:`1px solid ${BD}`, height:'180px', position:'relative' }}>
      <img src={src} alt={query} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.8) saturate(0.85)' }}/>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 60%)' }}/>
      <div style={{ position:'absolute', bottom:'10px', left:'14px' }}>
        <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.6)', fontFamily:'monospace' }}>{query}</span>
      </div>
    </div>
  );
};

const Navbar = ({ titulo, back, right, onLogoClick }) => (
  <nav style={{ position:'sticky', top:0, zIndex:50, height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', backgroundColor:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${BD}`, boxShadow:'0 1px 12px rgba(0,0,0,0.06)' }}>
    <div style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }} onClick={onLogoClick}>
      <img src="/logosoc.png" alt="SocBlast" style={{ height:'28px' }}/>
      <span style={{ fontSize:'15px', fontWeight:800, color:T1 }}>Soc<span style={{ color:ACC }}>Blast</span></span>
    </div>
    {titulo && <span style={{ fontSize:'13px', fontWeight:500, color:T2, maxWidth:'360px', textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{titulo}</span>}
    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
      {right && <span style={{ fontSize:'11px', color:GREEN, fontFamily:'monospace', fontWeight:700, padding:'3px 10px', borderRadius:'6px', backgroundColor:'rgba(5,150,105,0.08)', border:'1px solid rgba(5,150,105,0.2)' }}>{right}</span>}
      {back && <button onClick={back} style={{ padding:'5px 14px', borderRadius:'8px', background:'none', border:`1px solid ${BD}`, color:T2, fontSize:'12px', cursor:'pointer' }}>← Volver</button>}
    </div>
  </nav>
);
const MODULOS = [
  {
    id:1, num:'01', titulo:'Fundamentos de Ciberseguridad y SOC',
    descripcion:'Triada CIA, tipos de ataques, actores de amenaza y el rol del SOC',
    color:'#4f46e5', colorRgb:'79,70,229', icono:'🛡️', xp:200,
    certificado:'Analista SOC — Fundamentos',
    lecciones:[
      {
        id:1, titulo:'Introducción a la Ciberseguridad', xp:35,
        teoria:`La ciberseguridad protege sistemas, redes y datos frente a ataques digitales.

TRIADA CIA — EL NÚCLEO DE TODA LA SEGURIDAD:
- Confidencialidad — Solo los autorizados acceden a la información
- Integridad — La información no se altera sin autorización
- Disponibilidad — Los sistemas están accesibles cuando se necesitan

TIPOS DE ATAQUES MÁS COMUNES:
- Malware — Software malicioso (virus, ransomware, trojan, spyware)
- Phishing — Suplantación de identidad para robar credenciales
- DDoS — Saturar un servicio con tráfico masivo hasta tumbarlo
- Man-in-the-Middle — Interceptar comunicaciones entre dos partes
- SQL Injection — Manipular consultas a bases de datos

ACTORES DE AMENAZA:
- Script Kiddies — Sin conocimiento avanzado, usan herramientas ajenas
- Hacktivistas — Motivación ideológica o política
- Ciberdelincuentes — Motivación económica (ransomware, fraude)
- APT — Estados nación, ataques muy sofisticados y persistentes
- Insider Threat — Empleados maliciosos o negligentes`,
        preguntas:[
          {pregunta:'¿Qué significa la "I" en la triada CIA?',opciones:['Identidad','Integridad','Intrusión','Inteligencia'],correcta:1},
          {pregunta:'¿Qué tipo de ataque satura un servicio con tráfico masivo?',opciones:['Phishing','SQL Injection','DDoS','Ransomware'],correcta:2},
          {pregunta:'¿Qué es un APT?',opciones:['Un tipo de malware','Ataque avanzado y persistente, generalmente estatal','Una herramienta de defensa','Un protocolo de red'],correcta:1},
          {pregunta:'¿Cuál es la motivación principal de los ciberdelincuentes?',opciones:['Ideológica','Técnica','Económica','Social'],correcta:2},
          {pregunta:'¿Qué garantiza la Disponibilidad en CIA?',opciones:['Que los datos no se alteran','Que solo los autorizados acceden','Que los sistemas estén accesibles cuando se necesitan','Que se cifran las comunicaciones'],correcta:2},
        ]
      },
      {
        id:2, titulo:'Redes para SOC — Fundamentos críticos', xp:40,
        teoria:`Las redes son el campo de batalla del analista SOC. Debes dominarlas.

MODELO OSI — 7 CAPAS QUE DEBES MEMORIZAR:
- Física — Cables y señales eléctricas
- Enlace — Direcciones MAC, switches
- Red — Direcciones IP, enrutamiento
- Transporte — TCP/UDP, puertos
- Sesión — Gestión de sesiones
- Presentación — Cifrado y formato
- Aplicación — HTTP, DNS, FTP, SMB

PROTOCOLOS CLAVE EN SOC:
- HTTP/HTTPS (80/443) — Tráfico web
- DNS (53) — Resolución de nombres, muy abusado por atacantes
- SMB (445) — Compartir archivos Windows, objetivo frecuente
- RDP (3389) — Escritorio remoto, vector de ataque habitual
- SSH (22) — Acceso remoto seguro
- FTP (21) — Transferencia de archivos sin cifrado

CONCEPTOS ESENCIALES:
- IPs privadas: 192.168.x.x · 10.x.x.x · 172.16-31.x.x
- TCP — Fiable, usa 3-way handshake, confirma entrega
- UDP — Rápido, sin confirmación, usado en DNS y streaming`,
        preguntas:[
          {pregunta:'¿En qué capa OSI opera el protocolo IP?',opciones:['Capa 2 — Enlace','Capa 3 — Red','Capa 4 — Transporte','Capa 7 — Aplicación'],correcta:1},
          {pregunta:'¿Qué puerto usa SMB?',opciones:['80','443','445','3389'],correcta:2},
          {pregunta:'¿Cuál es la diferencia entre TCP y UDP?',opciones:['TCP es más rápido','UDP es fiable, TCP no','TCP es fiable con confirmación, UDP es rápido sin ella','Son idénticos'],correcta:2},
          {pregunta:'¿Qué rango de IPs es privado?',opciones:['8.8.8.8','192.168.1.1','142.250.0.1','1.1.1.1'],correcta:1},
          {pregunta:'El protocolo DNS opera en el puerto...',opciones:['80','443','53','22'],correcta:2},
        ]
      },
      {
        id:3, titulo:'Logs y Eventos — El lenguaje del SOC', xp:35,
        teoria:`Los logs son la evidencia de todo lo que ocurre en un sistema.

TIPOS DE LOGS:
- Logs de sistema — Arranque, errores, inicio/cierre de sesión
- Logs de red — Tráfico, conexiones, reglas de firewall
- Logs de aplicación — Errores de app, accesos web, API calls
- Logs de seguridad — Autenticación, cambios de privilegios

WINDOWS EVENT IDS CRÍTICOS — MEMORÍZALOS:
- 4624 — Inicio de sesión EXITOSO
- 4625 — Inicio de sesión FALLIDO (muchos = brute force)
- 4648 — Login con credenciales explícitas (sospechoso)
- 4688 — Proceso creado (detectar malware)
- 4698 — Tarea programada creada (persistencia)
- 4720 — Cuenta de usuario creada
- 7045 — Servicio instalado (puede ser malware)

¿QUÉ ES UN SIEM?
Security Information and Event Management — centraliza logs de toda la infraestructura, correlaciona eventos y genera alertas automáticas. Ejemplos reales: Splunk, IBM QRadar, Microsoft Sentinel`,
        ejercicio:{
          tipo:'clasificar',
          instruccion:'Asocia cada Windows Event ID con su significado',
          items:[
            {texto:'Event ID 4625',categoria:'Login fallido'},
            {texto:'Event ID 4688',categoria:'Proceso creado'},
            {texto:'Event ID 4720',categoria:'Cuenta creada'},
            {texto:'Event ID 4698',categoria:'Tarea programada'},
            {texto:'Event ID 4624',categoria:'Login exitoso'},
            {texto:'Event ID 7045',categoria:'Servicio instalado'},
          ],
          categorias:['Login fallido','Proceso creado','Cuenta creada','Tarea programada','Login exitoso','Servicio instalado']
        }
      },
      {
        id:4, titulo:'El SOC — Roles, flujo y herramientas', xp:40,
        teoria:`El SOC es el centro neurálgico de la seguridad. Opera 24/7.

ROLES EN EL SOC:
- L1 Triage — Monitoriza alertas, clasifica incidentes, escala si es necesario
- L2 Investigación — Analiza incidentes en profundidad, correlaciona eventos
- L3 Threat Hunting — Busca amenazas activamente, respuesta avanzada
- SOC Manager — Coordina el equipo y reporta a dirección

FLUJO DE TRABAJO TÍPICO:
- Alerta generada por SIEM o EDR
- L1 clasifica: ¿falso positivo o incidente real?
- Si real, escala a L2 con todo el contexto
- L2 investiga: logs, IOCs, impacto en el negocio
- L3 coordina la respuesta y contención
- Documentación y lecciones aprendidas

HERRAMIENTAS CORE DEL SOC:
- SIEM (Splunk, Sentinel) — Correlación de eventos y alertas
- EDR (CrowdStrike, SentinelOne) — Protección de endpoints
- SOAR — Automatización de respuestas repetitivas
- Threat Intel Platforms — IOCs, CVEs, TTPs
- Ticketing (ServiceNow, Jira) — Gestión y trazabilidad`,
        preguntas:[
          {pregunta:'¿Qué rol hace el triage inicial de alertas?',opciones:['L3','L2','L1','SOC Manager'],correcta:2},
          {pregunta:'¿Qué herramienta automatiza respuestas en un SOC?',opciones:['SIEM','EDR','SOAR','Firewall'],correcta:2},
          {pregunta:'Un analista L2 principalmente...',opciones:['Monitoriza alertas básicas','Investiga incidentes en profundidad','Desarrolla software','Gestiona switches de red'],correcta:1},
          {pregunta:'¿Cuál es el primer paso cuando se genera una alerta?',opciones:['Contener el incidente','Clasificar si es falso positivo o real','Apagar el servidor','Notificar a prensa'],correcta:1},
          {pregunta:'CrowdStrike es un ejemplo de...',opciones:['SIEM','Firewall','EDR','SOAR'],correcta:2},
        ]
      },
      {
        id:5, titulo:'CASO PRÁCTICO — Primer incidente SOC', xp:50,
        teoria:`CASO REAL: Detección de acceso no autorizado al Domain Controller

Son las 3:17 AM. El SIEM genera una alerta crítica:

ALERTA CRÍTICA ACTIVA:
- Source IP: 185.234.219.56 (Geoloc: Rusia)
- Target: CORP-DC01 (Domain Controller)
- Events: 847 x EventID 4625 en 4 minutos
- Seguido: 1 x EventID 4624 (login EXITOSO)
- Usuario comprometido: administrator

ANÁLISIS PASO A PASO:
- 847 intentos fallidos — Brute Force attack confirmado
- Login exitoso después — Credenciales comprometidas
- Target = Domain Controller — CRÍTICO (controla toda la red)
- IP origen externa de Rusia — No es usuario legítimo
- Hora = 3:17 AM — Fuera de horario laboral normal

RESPUESTA CORRECTA EN ORDEN:
- AISLAR inmediatamente CORP-DC01 de la red
- RESETEAR credenciales del usuario administrator
- REVISAR qué hizo el atacante tras el login exitoso
- ESCALAR a L2/L3 y notificar al CISO
- PRESERVAR todos los logs para análisis forense
- BUSCAR movimiento lateral (acceso a otros sistemas)

Un Domain Controller comprometido equivale a toda la empresa comprometida.`,
        ejercicio:{
          tipo:'caso_practico',
          instruccion:'Analiza el incidente y responde correctamente',
          preguntas:[
            {pregunta:'847 eventos ID 4625 seguidos de 1 evento ID 4624. ¿Qué tipo de ataque es?',opciones:['Phishing','Brute Force exitoso','DDoS','SQL Injection'],correcta:1},
            {pregunta:'¿Cuál es la PRIMERA acción que debes tomar?',opciones:['Enviar email al usuario','Aislar el Domain Controller de la red','Esperar al turno de mañana','Ignorar — puede ser falso positivo'],correcta:1},
            {pregunta:'¿Por qué un Domain Controller comprometido es crítico?',opciones:['Porque es caro','Controla toda la autenticación de la empresa','Porque tiene muchos logs','Es difícil de reinstalar'],correcta:1},
            {pregunta:'IP externa + hora 3:17 AM + Domain Controller. ¿Es sospechoso?',opciones:['No, los admins trabajan de noche','Sí — IP externa + hora inusual + DC = muy sospechoso','No hay suficiente información','Depende del país'],correcta:1},
          ]
        }
      },
    ]
  },
  {
    id:2, num:'02', titulo:'Detección y Análisis de Amenazas',
    descripcion:'SIEM avanzado, MITRE ATT&CK, Threat Intelligence y análisis de logs real',
    color:'#7c3aed', colorRgb:'124,58,237', icono:'🔍', xp:250,
    certificado:'Analista SOC — Detección',
    lecciones:[
      {id:1,titulo:'SIEM — El cerebro del SOC',xp:45,teoria:`El SIEM es la herramienta central del analista. Sin SIEM no hay SOC.\n\nFUNCIONES PRINCIPALES:\n- Recopilar y normalizar logs de toda la infraestructura\n- Correlacionar eventos de múltiples fuentes\n- Generar alertas basadas en reglas y umbrales\n- Dashboards, reportes y retención de evidencias\n\nQUERIES EN SPLUNK:\nindex=windows EventID=4625 | stats count by src_ip\nindex=firewall action=blocked | top src_ip\nindex=web status=200 | timechart count by uri\n\nTIPOS DE ALERTAS — DEBES CONOCERLOS:\n- True Positive (TP) — Alerta real, incidente confirmado\n- False Positive (FP) — Alerta falsa, actividad legítima\n- True Negative (TN) — Sin alerta y sin incidente (correcto)\n- False Negative (FN) — Sin alerta pero HAY incidente (peligroso)\n\nCORRELACIÓN — EL PODER REAL DEL SIEM:\nRegla: más de 100 EventID 4625 en 5 min desde la misma IP es CRÍTICO: Brute Force`,
        preguntas:[
          {pregunta:'¿Qué es un False Negative en SIEM?',opciones:['Una alerta falsa','Incidente real sin alerta — el más peligroso','Una alerta correcta','Un log sin datos'],correcta:1},
          {pregunta:'La query Splunk "stats count by src_ip" sirve para...',opciones:['Ver tráfico web','Contar eventos agrupados por IP origen','Buscar malware','Listar usuarios'],correcta:1},
          {pregunta:'¿Qué hace el SIEM con logs de distintas fuentes?',opciones:['Los elimina','Los normaliza y correlaciona','Los cifra','Los ignora'],correcta:1},
          {pregunta:'True Positive significa...',opciones:['Falsa alarma','Alerta real con incidente confirmado','Sistema sin amenazas','Log sin anomalías'],correcta:1},
          {pregunta:'Una buena regla SIEM para detectar brute force sería...',opciones:['1 login fallido = alerta','Más de 100 logins fallidos en 5 min desde la misma IP','Cualquier login = alerta','Logins de lunes a viernes = alerta'],correcta:1},
        ]
      },
      {id:2,titulo:'MITRE ATT&CK Framework',xp:45,teoria:`MITRE ATT&CK es la biblia del analista SOC. Documenta tácticas y técnicas reales de atacantes.\n\nESTRUCTURA DEL FRAMEWORK:\n- Tácticas — El QUÉ quiere el atacante\n- Técnicas — El CÓMO lo consigue\n- Sub-técnicas — Variantes específicas de cada técnica\n\nTÁCTICAS PRINCIPALES:\n- Reconnaissance, Initial Access, Execution, Persistence\n- Privilege Escalation, Defense Evasion, Credential Access\n- Discovery, Lateral Movement, Collection, Exfiltration, C2, Impact\n\nTÉCNICAS MÁS VISTAS EN SOC:\n- T1566 — Phishing (Initial Access)\n- T1059 — Command and Scripting Interpreter (Execution)\n- T1078 — Valid Accounts (Persistence + Privilege Escalation)\n- T1027 — Obfuscated Files (Defense Evasion)\n- T1110 — Brute Force (Credential Access)\n- T1021 — Remote Services (Lateral Movement)\n- T1486 — Data Encrypted for Impact (Ransomware)`,
        ejercicio:{tipo:'clasificar',instruccion:'Asocia cada técnica MITRE con su táctica correcta',items:[{texto:'T1566 — Email con adjunto malicioso',categoria:'Initial Access'},{texto:'T1110 — Fuerza bruta contra RDP',categoria:'Credential Access'},{texto:'T1021 — Uso de RDP para moverse entre sistemas',categoria:'Lateral Movement'},{texto:'T1078 — Usar credenciales robadas',categoria:'Persistence'},{texto:'T1059 — Ejecutar PowerShell',categoria:'Execution'},{texto:'T1027 — Ofuscar código malicioso',categoria:'Defense Evasion'}],categorias:['Initial Access','Credential Access','Lateral Movement','Persistence','Execution','Defense Evasion']}
      },
      {id:3,titulo:'Threat Intelligence — IOCs y OSINT',xp:40,teoria:`La Threat Intelligence te permite conocer al enemigo antes de que ataque.\n\nIOCS (INDICATORS OF COMPROMISE):\n- IPs maliciosas — Servidores C2, Tor exit nodes\n- Dominios — phishing.evil.com, dominios de C2\n- Hashes de ficheros — MD5/SHA256 de malware conocido\n- URLs — Links de phishing y exploits\n- Email addresses — Remitentes de campañas de phishing\n\nHERRAMIENTAS OSINT ESENCIALES:\n- VirusTotal (virustotal.com) — Analizar hashes, IPs y dominios\n- AbuseIPDB (abuseipdb.com) — Score de reputación de IPs\n- Shodan (shodan.io) — Dispositivos expuestos en internet\n- MalwareBazaar — Base de datos de muestras de malware\n- URLscan.io — Análisis visual de URLs sospechosas\n\nPROCESO DE ENRIQUECIMIENTO DE ALERTAS:\n- Busca la IP en AbuseIPDB — ¿reportada como maliciosa?\n- Busca en VirusTotal — ¿asociada a malware conocido?\n- Busca en Shodan — ¿qué servicios expone en internet?\n- Con ese contexto tu alerta pasa de "puede ser" a "confirmado"`,
        preguntas:[
          {pregunta:'¿Qué es un IOC?',opciones:['Un tipo de malware','Indicador de Compromiso — evidencia de actividad maliciosa','Una herramienta SIEM','Un protocolo de red'],correcta:1},
          {pregunta:'Para verificar si una IP es maliciosa usarías...',opciones:['Google','AbuseIPDB o VirusTotal','Shodan únicamente','El SIEM directamente'],correcta:1},
          {pregunta:'¿Qué muestra Shodan?',opciones:['Malware conocido','Dispositivos y servicios expuestos en internet','Logs de Windows','URLs de phishing'],correcta:1},
          {pregunta:'Un hash SHA256 de archivo sospechoso lo analizarías en...',opciones:['AbuseIPDB','VirusTotal','Shodan','URLscan'],correcta:1},
          {pregunta:'El enriquecimiento de alertas sirve para...',opciones:['Eliminar alertas','Añadir contexto para confirmar si una alerta es real','Crear nuevas reglas SIEM','Formatear logs'],correcta:1},
        ]
      },
      {id:4,titulo:'CASO PRÁCTICO — Phishing con malware',xp:60,teoria:`CASO REAL: Campaña de phishing con RAT\n\nCRONOLOGÍA DEL ATAQUE:\n- 09:23 — Usuario de RRHH reporta email sospechoso\n- 09:31 — EDR: outlook.exe lanza cmd.exe (anómalo)\n- 09:31 — EDR: conexión saliente a 45.33.32.156:4444\n- 09:45 — SIEM correlaciona: mismo patrón en 3 máquinas más\n\nEMAIL RECIBIDO:\n- De: rrhh-nominas@empresa-corp.com (DOMINIO FALSO)\n- Asunto: Nómina revisada — firma urgente\n- Adjunto: nomina_revision.pdf.exe — MALWARE\n\nANÁLISIS TÉCNICO:\n- outlook.exe lanzando cmd.exe — macro o ejecutable en adjunto\n- Puerto 4444 — típico de Metasploit reverse shell (C2)\n- IP 45.33.32.156 — VirusTotal: C2 de RAT conocido\n- 4 máquinas afectadas — movimiento lateral activo\n- Todas las víctimas en RRHH — spearphishing dirigido\n\nTÉCNICAS MITRE IDENTIFICADAS:\n- T1566.001 — Spearphishing Attachment (Initial Access)\n- T1059.003 — Windows Command Shell (Execution)\n- T1071 — Application Layer Protocol C2\n- T1570 — Lateral Tool Transfer (Lateral Movement)`,
        ejercicio:{tipo:'caso_practico',instruccion:'Analiza el caso de phishing y decide',preguntas:[{pregunta:'¿Qué indica que outlook.exe lance cmd.exe?',opciones:['Comportamiento normal de Outlook','Ejecución de macro o ejecutable malicioso desde el email','Actualización del sistema','Error de configuración'],correcta:1},{pregunta:'¿Qué es una conexión al puerto 4444?',opciones:['Tráfico web normal','DNS lookup','Probable reverse shell hacia servidor C2','Actualización de Windows'],correcta:2},{pregunta:'Con 4 máquinas afectadas, ¿qué táctica MITRE está ocurriendo?',opciones:['Initial Access','Exfiltration','Lateral Movement','Reconnaissance'],correcta:2},{pregunta:'¿Cuál debe ser la primera acción de contención?',opciones:['Avisar al usuario por email','Aislar las 4 máquinas afectadas de la red inmediatamente','Reinstalar Windows','Esperar a tener más datos'],correcta:1}]}
      },
    ]
  },
  {
    id:3, num:'03', titulo:'Respuesta a Incidentes',
    descripcion:'Ciclo NIST, severidad, contención y caso completo de ransomware',
    color:'#ef4444', colorRgb:'239,68,68', icono:'🚨', xp:280,
    certificado:'Analista SOC — Incident Response',
    lecciones:[
      {id:1,titulo:'Ciclo de Respuesta NIST SP 800-61',xp:40,teoria:`El NIST SP 800-61 es el estándar de referencia para respuesta a incidentes.\n\nFASE 1 — PREPARACIÓN:\n- Políticas y procedimientos documentados\n- Herramientas instaladas y configuradas\n- Equipo entrenado y con roles asignados\n- Playbooks por tipo de incidente\n\nFASE 2 — DETECCIÓN Y ANÁLISIS:\n- Identificar el incidente (SIEM, EDR, reporte de usuario)\n- Clasificar severidad (Crítica, Alta, Media, Baja)\n- Documentar todo desde el primer momento\n- Determinar alcance e impacto en el negocio\n\nFASE 3 — CONTENCIÓN:\n- Corto plazo: Aislar sistemas afectados ahora\n- Largo plazo: Parches, cambio de credenciales\n- CRÍTICO: Preservar evidencias antes de actuar\n\nFASE 4 — ERRADICACIÓN:\n- Eliminar el malware y todos los backdoors\n- Parchear las vulnerabilidades explotadas\n- Revisar otros sistemas potencialmente afectados\n\nFASE 5 — RECUPERACIÓN:\n- Restaurar desde backup limpio y verificado\n- Monitorización intensiva post-restauración\n- Validar que la amenaza está completamente eliminada\n\nFASE 6 — LECCIONES APRENDIDAS:\n- Post-mortem: ¿Qué falló? ¿Cómo mejorar?\n- Actualizar playbooks con lo aprendido\n- Mejorar reglas de detección en SIEM`,
        ejercicio:{tipo:'ordenar',instruccion:'Ordena correctamente las fases del ciclo NIST',fases:['Contención','Detección y Análisis','Recuperación','Preparación','Lecciones Aprendidas','Erradicación'],orden_correcto:['Preparación','Detección y Análisis','Contención','Erradicación','Recuperación','Lecciones Aprendidas']}
      },
      {id:2,titulo:'Clasificación y severidad de incidentes',xp:35,teoria:`Clasificar correctamente es una de las habilidades más críticas del analista L1.\n\nNIVELES DE SEVERIDAD:\n- 🔴 CRÍTICO — Impacto inmediato en el negocio. Ransomware activo, DC comprometido. Respuesta menor de 15 minutos.\n- 🟠 ALTO — Riesgo significativo que puede escalar. Malware detectado, cuentas privilegiadas. Respuesta menor de 1 hora.\n- 🟡 MEDIO — Impacto limitado. Malware en endpoint aislado. Respuesta menor de 4 horas.\n- 🟢 BAJO — Poco impacto. Escaneo de puertos bloqueado. Respuesta menor de 24 horas.\n\nFACTORES PARA CLASIFICAR:\n- ¿Qué sistemas están afectados? DC mayor que servidor mayor que endpoint\n- ¿Hay datos sensibles en riesgo?\n- ¿El ataque está activo o ya fue contenido?\n- ¿Cuántos usuarios y sistemas están afectados?\n- ¿Hay impacto en la operativa del negocio?`,
        preguntas:[
          {pregunta:'Ransomware activo en 50 sistemas. ¿Qué severidad?',opciones:['Baja','Media','Alta','Crítica'],correcta:3},
          {pregunta:'Escaneo de puertos bloqueado por firewall. ¿Severidad?',opciones:['Crítica','Alta','Baja','Media'],correcta:2},
          {pregunta:'¿Cuál es el tiempo máximo de respuesta para un incidente CRÍTICO?',opciones:['24 horas','4 horas','1 hora','15 minutos'],correcta:3},
          {pregunta:'Un Domain Controller comprometido se clasifica como...',opciones:['Medio','Bajo','Crítico','Alto'],correcta:2},
          {pregunta:'¿Qué factor NO influye en la severidad?',opciones:['Sistemas afectados','Datos en riesgo','Color del servidor','Si el ataque está activo'],correcta:2},
        ]
      },
      {id:3,titulo:'CASO — Respuesta completa a Ransomware',xp:70,teoria:`CASO REAL: Ataque de ransomware tipo WannaCry\n\nCRONOLOGÍA DEL INCIDENTE:\n- 08:20 — Phishing ejecutado por usuario de contabilidad\n- 08:22 — Descarga de payload desde 91.108.4.55\n- 08:23 — Explota MS17-010 (EternalBlue) via SMB 445\n- 08:25 — Propagación automática a 12 equipos de la red\n- 08:47 — Primera alerta en SIEM (27 minutos después)\n\nSEÑALES DETECTADAS:\n- Usuario contabilidad: mis archivos tienen extensión .encrypted\n- EDR: svchost_update.exe cifrando archivos masivamente\n- SIEM: EventID 7045 en 12 equipos (servicio malicioso instalado)\n- Red: tráfico SMB masivo interno en puerto 445\n\nRESPUESTA EJECUTADA:\n- 08:50 — Segmentar red, aislar 12 equipos afectados\n- 09:30 — Identificar y eliminar payload\n- 12:00 — Restaurar desde backup del domingo`,
        ejercicio:{tipo:'caso_practico',instruccion:'Responde sobre la gestión del ransomware',preguntas:[{pregunta:'El ransomware se propaga via SMB 445 explotando MS17-010. ¿Qué contención es más urgente?',opciones:['Apagar todos los servidores','Segmentar la red y bloquear tráfico SMB interno','Formatear un equipo','Llamar al fabricante del antivirus'],correcta:1},{pregunta:'27 minutos entre el phishing y la primera alerta. ¿Qué problema revela?',opciones:['El SIEM funciona perfectamente','Gap de detección — el EDR no detectó el payload inicial','Es un tiempo excelente','Los usuarios deben reportar más rápido'],correcta:1},{pregunta:'¿Por qué NO apagar inmediatamente los equipos cifrados?',opciones:['Porque tardan en encender','Pueden contener evidencias forenses en RAM','Pueden seguir trabajando','Por política de empresa'],correcta:1},{pregunta:'Tras la recuperación, ¿qué es lo primero?',opciones:['Celebrarlo','Monitorización intensiva + parchear MS17-010 en toda la red','Restaurar solo los equipos afectados','Nada más'],correcta:1}]}
      },
    ]
  },
  {id:4,num:'04',titulo:'Threat Hunting',descripcion:'Búsqueda proactiva de amenazas que evaden las defensas automatizadas',color:'#d97706',colorRgb:'217,119,6',icono:'🎯',xp:260,certificado:'Threat Hunter Certificado',lecciones:[{id:1,titulo:'¿Qué es el Threat Hunting?',xp:40,teoria:`El Threat Hunting es la búsqueda proactiva de amenazas que han evadido las defensas automatizadas.\n\nDETECCIÓN REACTIVA VS THREAT HUNTING:\n- Reactiva — Esperas a que el SIEM o EDR genere una alerta\n- Hunting — Buscas activamente sin esperar alertas\n\n¿POR QUÉ ES NECESARIO?\nLos atacantes avanzados (APT) pueden permanecer meses en una red sin generar ninguna alerta. El dwell time medio es de 24 días.\n\nPROCESO DE THREAT HUNTING:\n- HIPÓTESIS — Creo que hay un atacante usando PowerShell para moverse lateralmente\n- INVESTIGACIÓN — Busco en logs PowerShell ejecutándose de forma inusual\n- ANÁLISIS — Evalúo los resultados encontrados\n- RESPUESTA — Si encuentro algo, inicio el proceso de IR\n- MEJORA — Si no encuentro nada, mejoro las detecciones del SIEM`,preguntas:[{pregunta:'¿Cuál es la diferencia clave entre detección reactiva y hunting?',opciones:['No hay diferencia','Detección reactiva espera alertas; hunting busca activamente','Hunting es más lento','La detección reactiva es más efectiva'],correcta:1},{pregunta:'¿Cuánto tiempo puede pasar un APT sin detectarse (dwell time medio)?',opciones:['1 hora','1 día','24 días','1 año'],correcta:2},{pregunta:'El primer paso del proceso de hunting es...',opciones:['Analizar logs','Formular una hipótesis','Instalar herramientas','Escalar al CISO'],correcta:1},{pregunta:'¿Qué indica un dwell time largo en una red?',opciones:['Buena seguridad','El atacante ha pasado mucho tiempo sin ser detectado','Muchas alertas generadas','Red de alta disponibilidad'],correcta:1}]},{id:2,titulo:'CASO — Hunting de cuenta comprometida',xp:60,teoria:`CASO HUNTING: Detectar cuenta administrativa comprometida\n\nHIPÓTESIS: Un atacante usa credenciales válidas para moverse lateralmente fuera del horario laboral.\n\nQUERY SIEM PARA PROBAR LA HIPÓTESIS:\nindex=windows EventID=4624 LogonType=3\n| eval hour=strftime(_time,"%H")\n| where hour<6 OR hour>22\n| stats count by user, src_ip, dest\n| where count > 3\n\nRESULTADOS SOSPECHOSOS:\n- Usuario: svc_backup (cuenta de servicio)\n- Horario: 02:14 a 04:37 AM\n- IPs origen: 5 IPs internas diferentes\n- Destinos: file-server-01, dc-01, hr-server\n- Total logins: 47 en 2 horas\n\nCONCLUSIÓN: Cuenta de servicio comprometida.`,ejercicio:{tipo:'caso_practico',instruccion:'Analiza el caso de hunting',preguntas:[{pregunta:'svc_backup hace 47 logins interactivos de noche. ¿Es normal?',opciones:['Sí, las cuentas de servicio trabajan de noche','No, las cuentas de servicio nunca deben hacer logins interactivos','Depende de la empresa','Sí si hay backups programados'],correcta:1},{pregunta:'¿Qué indica el acceso a DC + HR server desde una cuenta de backup?',opciones:['Backup normal de esos servidores','Reconocimiento y probable exfiltración de datos sensibles','Mantenimiento programado','Error de configuración'],correcta:1},{pregunta:'¿Por qué el atacante actúa de noche?',opciones:['Por el huso horario','Menor vigilancia y menor probabilidad de detección','Los sistemas van más rápido de noche','Por costumbre'],correcta:1},{pregunta:'Esta actividad no generó alertas automáticas porque...',opciones:['El SIEM está roto','Usa credenciales válidas — técnica living-off-the-land','Los logs se perdieron','El firewall la bloqueó'],correcta:1}]}}]},
  {id:5,num:'05',titulo:'Forense Digital',descripcion:'Adquisición de evidencias, análisis de disco, memoria RAM y timeline',color:'#0891b2',colorRgb:'8,145,178',icono:'🔬',xp:290,certificado:'Analista Forense Digital',lecciones:[{id:1,titulo:'Fundamentos del Forense Digital',xp:45,teoria:`El forense digital investiga qué pasó, cómo pasó y quién lo hizo.\n\nPRINCIPIOS FUNDAMENTALES:\n- Preservación — Nunca alterar la evidencia original\n- Cadena de custodia — Documentar quién maneja qué y cuándo\n- Integridad — Verificar con hashes (MD5/SHA256) que nada cambió\n- Reproducibilidad — El análisis debe poder repetirse\n\nORDEN DE VOLATILIDAD — RECOPILAR DE MÁS A MENOS VOLÁTIL:\n- Registros CPU y caché\n- Memoria RAM (se pierde al apagar el equipo)\n- Tráfico de red activo en ese momento\n- Disco duro y SSD\n- Logs del sistema operativo\n- Backups externos\n\nARTEFACTOS CLAVE EN WINDOWS:\n- Prefetch — Lista de programas ejecutados recientemente\n- Registry — Configuración del sistema y autorun de malware\n- $MFT — Master File Table (todos los archivos del disco)\n- Event Logs — Historial de actividad del sistema\n- Browser History — Historial de navegación web`,preguntas:[{pregunta:'¿Por qué recopilar la RAM antes que el disco duro?',opciones:['El disco es más grande','La RAM es más volátil — su contenido se pierde al apagar','La RAM es más fácil de analizar','Por protocolo estándar'],correcta:1},{pregunta:'¿Para qué se usan los hashes MD5/SHA256 en forense?',opciones:['Para cifrar evidencias','Para verificar que la evidencia no ha sido alterada','Para comprimir archivos','Para acelerar el análisis'],correcta:1},{pregunta:'¿Qué artefacto Windows revela programas ejecutados recientemente?',opciones:['Registry','Prefetch','$MFT','LNK files'],correcta:1},{pregunta:'La cadena de custodia en forense sirve para...',opciones:['Organizar archivos','Documentar quién maneja las evidencias y cuándo','Cifrar datos sensibles','Crear backups automáticos'],correcta:1}]},{id:2,titulo:'CASO — Investigar una infección por malware',xp:65,teoria:`CASO FORENSE: Investigar RAT en equipo directivo\n\nMEMORY DUMP:\n- Proceso activo: svchost_update.exe (PID 4821)\n- Conexión activa: 185.234.219.56:4444 (C2)\n- Strings en memoria: keylogger, upload_data, screenshot\n\nPREFETCH:\n- svchost_update.exe ejecutado 14 veces en 3 días\n- Primera ejecución: martes 14:23:07\n\nREGISTRY (clave de autorun):\nHKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\nWindowsUpdate = C:\\Users\\director\\AppData\\Roaming\\svchost_update.exe\n\nEVENT LOGS:\n- EventID 4688: svchost_update.exe creado POR outlook.exe\n- EventID 4698: Tarea programada SysUpdate creada (martes 14:23)\n\nCONCLUSIÓN: Phishing, ejecución de RAT, persistencia via registro y tarea, keylogger activo, exfiltración durante 3 días.`,ejercicio:{tipo:'caso_practico',instruccion:'Responde sobre el análisis forense',preguntas:[{pregunta:'svchost_update.exe fue creado por outlook.exe (EventID 4688). ¿Qué indica?',opciones:['Actualización normal de Windows','El malware se ejecutó desde un adjunto de email (phishing)','Error del sistema operativo','Instalación de software legítimo'],correcta:1},{pregunta:'La clave de registro en CurrentVersion\\Run indica...',opciones:['Que el programa se ejecuta manualmente','Persistencia — el malware arranca automáticamente al iniciar sesión','Un error de Windows','Software legítimo de inicio'],correcta:1},{pregunta:'¿Qué revela la conexión activa a 185.234.219.56:4444?',opciones:['Actualización de Windows','Comunicación activa con servidor C2','Backup en la nube','Sincronización de email'],correcta:1},{pregunta:'El malware lleva 3 días activo con keylogger. ¿Cuál es el riesgo principal?',opciones:['Que el equipo vaya lento','Que haya capturado y exfiltrado credenciales y datos sensibles durante 3 días','Que ocupe espacio en disco','Que cambie el fondo de pantalla'],correcta:1}]}}]},
  {id:6,num:'06',titulo:'Seguridad en Redes Avanzada',descripcion:'IDS/IPS, análisis de tráfico, DNS tunneling y detección de C2',color:'#059669',colorRgb:'5,150,105',icono:'🌐',xp:280,certificado:'Network Security Analyst',lecciones:[{id:1,titulo:'IDS, IPS y análisis de tráfico',xp:45,teoria:`La seguridad de red es la segunda línea de defensa crítica.\n\nIDS — INTRUSION DETECTION SYSTEM:\n- Monitoriza el tráfico y genera alertas de actividad sospechosa\n- NO bloquea — solo detecta y avisa\n- Tipos: NIDS (monitoriza la red) y HIDS (monitoriza el host)\n\nIPS — INTRUSION PREVENTION SYSTEM:\n- Monitoriza el tráfico y bloquea el tráfico malicioso\n- Se despliega inline en el flujo de tráfico\n- Puede generar falsos positivos que interrumpan el servicio\n\nFILTROS ÚTILES EN WIRESHARK:\n- ip.src == 192.168.1.100 — Tráfico desde IP específica\n- tcp.port == 4444 — Puerto C2 típico de Metasploit\n- dns — Ver todas las consultas DNS realizadas\n- http.request.method == POST — Posible exfiltración via HTTP\n\nSEÑALES DE TRÁFICO MALICIOSO:\n- 🔴 Conexiones a puertos altos inusuales (1234, 4444, 9999)\n- 🔴 Beacon traffic — conexiones regulares cada X segundos exactos\n- 🔴 DNS queries con subdominios muy largos\n- 🔴 Volumen anómalo de datos saliendo de la red`,preguntas:[{pregunta:'¿Cuál es la diferencia entre IDS e IPS?',opciones:['Son lo mismo','IDS detecta y alerta; IPS detecta y bloquea','IPS detecta, IDS bloquea','IDS es tecnología más nueva'],correcta:1},{pregunta:'Tráfico que se conecta al exterior cada 30 segundos exactos. ¿Qué indica?',opciones:['Sincronización de hora NTP','Beacon traffic — probable comunicación con C2','Backup automático','Actualización de antivirus'],correcta:1},{pregunta:'¿Qué son las DGA (Domain Generation Algorithms)?',opciones:['Herramientas de DNS','Malware que genera dominios aleatorios para C2','Protocolo de seguridad','Tipo de firewall avanzado'],correcta:1},{pregunta:'Filtro Wireshark "tcp.port == 4444" sirve para...',opciones:['Ver tráfico web','Ver tráfico en puerto 4444 — típico de reverse shells','Filtrar consultas DNS','Ver emails en texto plano'],correcta:1}]},{id:2,titulo:'CASO — Detectar exfiltración via DNS',xp:65,teoria:`CASO REAL: DNS Tunneling para exfiltrar datos\n\nANOMALÍAS DETECTADAS EN LOGS DNS:\n- 09:14:23 — dGhpcyBpcyBzZWNyZXQgZGF0YQ.evil-corp.xyz\n- 09:14:24 — c2Vuc2l0aXZlIGluZm9ybWF0aW9u.evil-corp.xyz\n- 847 queries al mismo dominio en 3 minutos\n\nSEÑALES DE ALERTA:\n- Subdominio con más de 50 caracteres — datos en Base64\n- 847 queries en 3 minutos — volumen anómalo\n- Dominio evil-corp.xyz no está en whitelist corporativa\n- Todas las queries desde DESKTOP-HR-02\n\nCONCLUSIÓN: Exfiltración activa via DNS tunneling desde equipo de RRHH.`,ejercicio:{tipo:'caso_practico',instruccion:'Analiza el caso de DNS tunneling',preguntas:[{pregunta:'847 consultas DNS al mismo dominio en 3 minutos. ¿Qué indica?',opciones:['Navegación web normal','DNS Tunneling — datos exfiltrados codificados en consultas DNS','Caché DNS llena','Problema de conectividad'],correcta:1},{pregunta:'Los subdominios tienen más de 50 caracteres en Base64. ¿Por qué?',opciones:['Nombres de dominio largos son normales','Los datos robados se codifican en Base64 dentro del subdominio','Error de configuración DNS','Política de naming corporativa'],correcta:1},{pregunta:'¿Cómo detendrías esta exfiltración inmediatamente?',opciones:['Reiniciar el servidor DNS','Bloquear evil-corp.xyz en el firewall y aislar DESKTOP-HR-02','Limpiar la caché DNS','Desactivar DNS en toda la red'],correcta:1},{pregunta:'¿Qué control preventivo hubiera detectado esto antes?',opciones:['Antivirus actualizado','DNS filtering con whitelist de dominios aprobados','Firewall de aplicación web','VPN obligatoria para todos'],correcta:1}]}}]},
  {id:7,num:'07',titulo:'Cloud Security',descripcion:'AWS/Azure, logs cloud, IAM, ataques y detección en entornos cloud',color:'#3b82f6',colorRgb:'59,130,246',icono:'☁️',xp:300,certificado:'Cloud Security Analyst',lecciones:[{id:1,titulo:'Fundamentos de seguridad cloud',xp:50,teoria:`El cloud ha transformado el SOC. Los ataques y defensas son diferentes.\n\nMODELO DE RESPONSABILIDAD COMPARTIDA:\n- Cloud Provider — Seguridad DE la infraestructura física\n- Cliente — Seguridad EN la infraestructura (datos, configs, accesos)\n\nLOGS ESENCIALES EN AWS:\n- CloudTrail — Registra todas las llamadas a la API (quién hizo qué)\n- VPC Flow Logs — Todo el tráfico de red\n- GuardDuty — Detección automática de amenazas\n\nIAM — IDENTITY AND ACCESS MANAGEMENT:\n- Principio de mínimo privilegio — Solo los permisos necesarios\n- MFA obligatorio para todas las cuentas privilegiadas\n- Revisar y rotar credenciales periódicamente\n\nATAQUES CLOUD MÁS FRECUENTES:\n- Credential stuffing — Robo de credenciales de consola cloud\n- Misconfigured S3 buckets — Datos públicos por error de configuración\n- IAM privilege escalation — Escalar permisos via roles mal configurados\n- Cryptojacking — Usar recursos comprometidos para minar criptomonedas`,preguntas:[{pregunta:'¿Qué servicio AWS registra todas las llamadas a la API?',opciones:['VPC Flow Logs','CloudTrail','S3','EC2'],correcta:1},{pregunta:'¿Qué es el principio de mínimo privilegio en IAM?',opciones:['Dar acceso admin a todos','Dar solo los permisos mínimos necesarios para cada rol','No usar contraseñas','Usar un solo usuario para todo'],correcta:1},{pregunta:'¿Qué es el cryptojacking en cloud?',opciones:['Robo de criptomonedas','Usar recursos cloud comprometidos para minar criptomonedas','Ataque de DDoS','Phishing en cloud'],correcta:1},{pregunta:'Un bucket S3 con acceso público contiene datos de clientes. ¿Qué fallo es?',opciones:['Fallo del proveedor cloud','Misconfiguration — responsabilidad del cliente','Ataque de hackers externos','Error de red'],correcta:1}]},{id:2,titulo:'CASO — Escalada de privilegios en AWS',xp:70,teoria:`CASO REAL: Cuenta AWS comprometida y cryptojacking\n\nALERTA GUARDDUTY:\n- UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B\n- Usuario IAM: dev-user-03\n- IP origen: 185.220.101.45 (Tor Exit Node)\n- Hora: 03:42 AM\n\nACCIONES POST-LOGIN (CloudTrail):\n- 03:42 — ConsoleLogin exitoso\n- 03:43 — ListRoles (reconocimiento)\n- 03:44 — AttachUserPolicy — AdministratorAccess (ESCALADA)\n- 03:45 — CreateUser backup-admin (backdoor)\n- 03:47 — RunInstances x50 EC2 (cryptojacking)`,ejercicio:{tipo:'caso_practico',instruccion:'Analiza el compromiso de AWS',preguntas:[{pregunta:'AttachUserPolicy:AdministratorAccess. ¿Qué intenta el atacante?',opciones:['Auditar la cuenta','Escalar privilegios para tener acceso total a AWS','Crear backups de seguridad','Revisar la facturación'],correcta:1},{pregunta:'¿Por qué crea el usuario backup-admin?',opciones:['Para hacer backups reales','Backdoor — si revocan al usuario original, mantiene acceso','Es una cuenta de servicio necesaria','Por política de AWS'],correcta:1},{pregunta:'Primera acción de respuesta ante este incidente...',opciones:['Esperar confirmación','Deshabilitar dev-user-03 y backup-admin + revocar todas las access keys','Revisar las instancias EC2 lanzadas','Contactar a AWS Support primero'],correcta:1},{pregunta:'¿Qué control preventivo hubiera evitado la escalada?',opciones:['MFA en el login','SCPs limitando AttachUserPolicy a roles específicos','CloudTrail activo','VPN obligatoria'],correcta:1}]}}]},
  {id:8,num:'08',titulo:'Automatización y Scripting',descripcion:'Python para SOC, automatización de tareas repetitivas y SOAR',color:'#f97316',colorRgb:'249,115,22',icono:'⚙️',xp:280,certificado:'SOC Automation Specialist',lecciones:[{id:1,titulo:'Python para analistas SOC',xp:50,teoria:`Python es la herramienta de automatización del analista moderno.\n\nCASOS DE USO REALES EN SOC:\n- Parsear y analizar miles de logs automáticamente\n- Buscar IOCs automáticamente en VirusTotal y AbuseIPDB\n- Generar reportes de incidentes en formato estándar\n- Enriquecer alertas del SIEM con Threat Intelligence\n- Automatizar respuestas repetitivas (SOAR casero)\n\nSCRIPT REAL — VERIFICAR REPUTACIÓN DE IPS:\nimport requests\n\ndef check_ip_reputation(ip):\n    url = "https://api.abuseipdb.com/api/v2/check"\n    headers = {"Key": "TU_API_KEY", "Accept": "application/json"}\n    params = {"ipAddress": ip, "maxAgeInDays": 90}\n    r = requests.get(url, headers=headers, params=params)\n    return r.json()["data"]["abuseConfidenceScore"]\n\nwith open("failed_logins.txt") as f:\n    ips = [line.split()[0] for line in f]\n\nfor ip in set(ips):\n    score = check_ip_reputation(ip)\n    if score > 50:\n        print(f"ALERTA IP maliciosa: {ip} — Score: {score}")`,preguntas:[{pregunta:'¿Para qué usarías Python en un SOC?',opciones:['Crear aplicaciones web','Automatizar análisis de logs, IOC lookup y reportes','Diseñar interfaces gráficas','Gestionar bases de datos SQL'],correcta:1},{pregunta:'¿Qué permite la API de AbuseIPDB?',opciones:['Bloquear IPs automáticamente','Consultar reputación y score de abuso de una IP','Escanear puertos remotos','Ver logs de Windows directamente'],correcta:1},{pregunta:'SOAR significa...',opciones:['Security Orchestration Automation and Response','System Operations and Reporting','Security Online Alert Response','Standard Operations Automation Rule'],correcta:0},{pregunta:'"re.findall(ip_pattern, log_text)" en Python sirve para...',opciones:['Borrar IPs del log','Extraer todas las IPs que coincidan con el patrón','Bloquear las IPs encontradas','Contar el número de logs'],correcta:1}]}]},
  {id:9,num:'09',titulo:'Análisis de Malware',descripcion:'Análisis estático y dinámico, sandbox, comportamiento e IOCs de malware',color:'#dc2626',colorRgb:'220,38,38',icono:'🦠',xp:290,certificado:'Malware Analyst',lecciones:[{id:1,titulo:'Análisis estático vs dinámico',xp:55,teoria:`El análisis de malware determina exactamente qué hace un archivo malicioso.\n\nANÁLISIS ESTÁTICO — SIN EJECUTAR EL MALWARE:\n- Calcular hash SHA256 y buscar en VirusTotal\n- Strings — Extraer texto legible: URLs, IPs, mensajes de error\n- PE Headers — Metadatos del ejecutable Windows\n- Imports — Funciones de Windows que usa el malware\n\nFUNCIONES WINDOWS MÁS SOSPECHOSAS:\n- 🔴 CreateRemoteThread — Inyección de código en otros procesos\n- 🔴 VirtualAllocEx — Reserva memoria en proceso ajeno\n- 🔴 WriteProcessMemory — Escribe código en proceso ajeno\n- 🔴 RegSetValueEx — Modifica registro (persistencia)\n- 🔴 WinExec o CreateProcess — Ejecuta comandos del sistema\n\nANÁLISIS DINÁMICO — EJECUTAR EN SANDBOX:\n- Sandbox: Any.run, Cuckoo Sandbox, Joe Sandbox\n- Se observa el comportamiento real en tiempo de ejecución\n- Se capturan procesos creados, conexiones de red, cambios de registro`,preguntas:[{pregunta:'¿Qué es el análisis estático de malware?',opciones:['Ejecutar el malware en entorno controlado','Analizar el archivo sin ejecutarlo','Analizar el tráfico de red del malware','Estudiar el código fuente'],correcta:1},{pregunta:'La función Windows "CreateRemoteThread" indica...',opciones:['Creación de hilos normales de ejecución','Posible inyección de código en otro proceso','Conexión a internet','Creación de archivos en disco'],correcta:1},{pregunta:'¿Qué herramienta usarías para análisis dinámico automatizado?',opciones:['VirusTotal para análisis estático','Sandbox (Any.run, Cuckoo)','Wireshark exclusivamente','Splunk SIEM'],correcta:1},{pregunta:'Un malware que se inyecta en svchost.exe está usando...',opciones:['Persistencia de registro','Process Injection para ocultarse en proceso legítimo','DNS Tunneling','Phishing'],correcta:1}]}]},
  {id:10,num:'10',titulo:'Red Team Basics',descripcion:'Piensa como atacante para defender mejor: Kill Chain, Nmap, reconocimiento',color:'#7c3aed',colorRgb:'124,58,237',icono:'⚔️',xp:310,certificado:'Red Team Awareness',lecciones:[{id:1,titulo:'La Cyber Kill Chain — Mentalidad del atacante',xp:55,teoria:`Un buen defensor debe entender cómo piensa y actúa el atacante.\n\nCYBER KILL CHAIN — LAS 7 FASES DE UN ATAQUE:\n- RECONOCIMIENTO — Recopilar información del objetivo\n- WEAPONIZATION — Preparar el arma de ataque\n- DELIVERY — Entregar el arma al objetivo (phishing, USB)\n- EXPLOITATION — Explotar la vulnerabilidad\n- INSTALLATION — Instalar persistencia (RAT, backdoor)\n- COMMAND AND CONTROL — Establecer canal de comunicación remota\n- ACTIONS ON OBJECTIVES — Ejecutar el objetivo final\n\nHERRAMIENTAS DE RECONOCIMIENTO:\n- Nmap — Escaneo de puertos y detección de servicios\n- Shodan — Encontrar dispositivos expuestos en internet\n- TheHarvester — Emails, subdominios e IPs de un dominio\n\nEJEMPLO NMAP:\nnmap -sV -O 192.168.1.0/24`,preguntas:[{pregunta:'¿Cuál es la fase "Delivery" en la Kill Chain?',opciones:['Preparar el malware','Establecer canal C2','Entregar el arma al objetivo (phishing, USB)','Robar datos finales'],correcta:2},{pregunta:'Nmap se usa principalmente para...',opciones:['Análisis de malware','Escaneo de puertos y detección de servicios','Análisis forense de disco','Gestión de logs SIEM'],correcta:1},{pregunta:'¿Para qué sirve el reconocimiento pasivo?',opciones:['Explotar vulnerabilidades directamente','Recopilar información sin interactuar directamente con el objetivo','Instalar backdoors en el sistema','Crear exploits personalizados'],correcta:1},{pregunta:'La fase C2 (Command and Control) permite al atacante...',opciones:['Entrar al sistema por primera vez','Controlar el malware instalado de forma remota','Cifrar todos los datos del objetivo','Hacer el reconocimiento inicial'],correcta:1}]}]},
  {id:11,num:'11',titulo:'Gestión de Alertas y Fatiga SOC',descripcion:'Alert fatigue, priorización inteligente y optimización de reglas SIEM',color:'#d97706',colorRgb:'217,119,6',icono:'🧠',xp:240,certificado:'SOC Operations Expert',lecciones:[{id:1,titulo:'Alert Fatigue — El mayor enemigo del SOC',xp:50,teoria:`La fatiga de alertas es uno de los problemas más críticos y subestimados en los SOC modernos.\n\nEL PROBLEMA EN NÚMEROS:\n- Un SOC medio recibe más de 10.000 alertas diarias\n- El 45% son falsos positivos según estudios del sector\n- Los analistas se vuelven insensibles y empiezan a ignorar alertas\n\nCAUSAS PRINCIPALES:\n- Reglas SIEM demasiado amplias o mal calibradas\n- Demasiadas herramientas generando alertas duplicadas\n- Sin contextualización ni priorización automática\n\nSOLUCIONES PROBADAS:\n\nTUNING DE REGLAS SIEM:\n- Antes: 1 login fallido = alerta (miles de alertas diarias)\n- Después: más de 20 logins fallidos en 1 minuto = alerta (señal real)\n\nAUTOMATIZACIÓN CON SOAR:\n- Enriquecer alertas automáticamente con Threat Intelligence\n- Cerrar automáticamente FPs conocidos y documentados\n- Solo escalar al analista lo que realmente necesita análisis humano`,preguntas:[{pregunta:'¿Qué porcentaje aproximado de alertas SOC son falsos positivos?',opciones:['5%','15%','45%','80%'],correcta:2},{pregunta:'La alert fatigue provoca que los analistas...',opciones:['Trabajen más eficientemente','Se vuelvan insensibles e ignoren alertas reales','Detecten más incidentes','Reduzcan el tiempo de respuesta'],correcta:1},{pregunta:'¿Qué es el tuning de reglas SIEM?',opciones:['Actualizar el software del SIEM','Ajustar umbrales y condiciones para reducir falsos positivos','Añadir más reglas de detección','Eliminar todas las reglas existentes'],correcta:1},{pregunta:'Una whitelist en SIEM sirve para...',opciones:['Bloquear IPs maliciosas conocidas','Excluir comportamientos legítimos conocidos de las alertas','Aumentar el número de alertas','Crear nuevas reglas de detección'],correcta:1}]}]},
  {id:12,num:'12',titulo:'Certificación Final SOC',descripcion:'Simulación completa: 10 alertas simultáneas, tiempo limitado, evaluación total',color:'#059669',colorRgb:'5,150,105',icono:'🏆',xp:500,certificado:'SOC Analyst Profesional — Certificado',lecciones:[{id:1,titulo:'Simulacro Final — Gestión de incidente múltiple',xp:500,teoria:`SIMULACRO FINAL: Eres el analista de guardia. Son las 23:47. Se disparan 10 alertas.\n\nUSA TODO LO APRENDIDO EN LOS 11 MÓDULOS ANTERIORES.\n\nALERTAS ACTIVAS EN ESTE MOMENTO:\n- 1. CRÍTICA — 1847 EventID 4625 hacia CORP-DC01 desde 185.220.101.45\n- 2. CRÍTICA — EDR: svchost.exe lanza cmd.exe lanza powershell -enc base64\n- 3. ALTA — DNS: 847 queries a random-xyz.evil en 3 minutos\n- 4. ALTA — Nuevo usuario admin creado: backup_svc\n- 5. MEDIA — 50 instancias EC2 lanzadas en AWS a las 23:45\n- 6. MEDIA — RDP desde IP de Tor hacia servidor de contabilidad\n- 7. BAJA — Escaneo de puertos desde 10.0.0.45 (interno)\n- 8. BAJA — 3 intentos fallidos VPN (usuario: jgarcia)\n- 9. INFO — Antivirus actualizado en 200 equipos\n- 10. INFO — Certificado SSL caducado en web corporativa`,ejercicio:{tipo:'caso_practico',instruccion:'Simulacro final — gestiona las 10 alertas correctamente',preguntas:[{pregunta:'¿Cuál es la PRIMERA alerta que debes investigar?',opciones:['Certificado SSL caducado','Antivirus actualizado en 200 equipos','1847 logins fallidos en el Domain Controller','3 intentos fallidos de VPN'],correcta:2},{pregunta:'Alertas 1 (brute force DC) + 2 (powershell malicioso) + 4 (nuevo admin). Probablemente son...',opciones:['Tres incidentes completamente independientes','Un único ataque coordinado en progreso activo','Falsos positivos de mantenimiento','Pruebas del equipo de desarrollo'],correcta:1},{pregunta:'Alerta 9: antivirus actualizado en 200 equipos. ¿Qué haces?',opciones:['Investigar urgentemente','Escalar al CISO inmediatamente','Cerrar como informativa — actividad legítima programada','Aislar los 200 equipos preventivamente'],correcta:2},{pregunta:'Alertas 3 (DNS tunneling) + 5 (50 EC2 en AWS) pueden indicar...',opciones:['Mantenimiento normal de infraestructura','Exfiltración activa + cryptojacking — atacante con acceso a red y cloud','Actualizaciones programadas del equipo de sistemas','Pruebas de carga del equipo de desarrollo'],correcta:1},{pregunta:'Primera acción con alerta 2 (powershell -enc base64)...',opciones:['Ignorar — PowerShell es normal en Windows','Decodificar el Base64, aislar el equipo e investigar el proceso padre','Reiniciar el equipo afectado','Actualizar el antivirus en ese equipo'],correcta:1}]}}]},
];

const CURSOS = [
  {id:1,titulo:'SOC Fundamentals',subtitulo:'De cero a analista L1',descripcion:'Aprende los fundamentos de ciberseguridad, redes, logs, el rol del SOC y cómo responder a tus primeros incidentes reales.',color:'#4f46e5',colorRgb:'79,70,229',icono:'🛡️',moduloIds:[1,2,3,4],nivel:'Principiante',duracion:'~8 horas',certificado:'SOC Fundamentals Certificate'},
  {id:2,titulo:'Detection & Analysis',subtitulo:'Detecta y analiza amenazas reales',descripcion:'Domina el forense digital, seguridad en redes, cloud security y la automatización con Python para operar como analista L2.',color:'#7c3aed',colorRgb:'124,58,237',icono:'🔍',moduloIds:[5,6,7,8],nivel:'Intermedio',duracion:'~10 horas',certificado:'Detection & Analysis Certificate'},
  {id:3,titulo:'Advanced SOC Operations',subtitulo:'Nivel profesional L2/L3',descripcion:'Análisis de malware, red team awareness, gestión de fatiga de alertas y el simulacro final de certificación profesional.',color:'#ef4444',colorRgb:'239,68,68',icono:'⚔️',moduloIds:[9,10,11,12],nivel:'Avanzado',duracion:'~12 horas',certificado:'Advanced SOC Operations Certificate'},
];
export default function TrainingPage() {
  const navigate = useNavigate();
  const [vista, setVista]               = useState('cursos');
  const [cursoActivo, setCursoActivo]   = useState(null);
  const [moduloActivo, setModuloActivo] = useState(null);
  const [leccionActiva, setLeccionActiva] = useState(null);
  const [fase, setFase]                 = useState('teoria');
  const [respuestasTest, setRespuestasTest]   = useState({});
  const [testEnviado, setTestEnviado]         = useState(false);
  const [ordenActual, setOrdenActual]         = useState([]);
  const [clasificaciones, setClasificaciones] = useState({});
  const [completadas, setCompletadas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('socblast_training_completadas') || '[]'); } catch { return []; }
  });
  const [certificados, setCertificados] = useState(() => {
    try { return JSON.parse(localStorage.getItem('socblast_certificados_modulos') || '[]'); } catch { return []; }
  });
  const [mostrarCert, setMostrarCert] = useState(null);

  const saveCompletadas  = arr => { setCompletadas(arr);  localStorage.setItem('socblast_training_completadas', JSON.stringify(arr)); };
  const saveCertificados = arr => { setCertificados(arr); localStorage.setItem('socblast_certificados_modulos', JSON.stringify(arr)); };

  const iniciarLeccion = l => {
    setLeccionActiva(l); setFase('teoria');
    setRespuestasTest({}); setTestEnviado(false); setClasificaciones({});
    if (l.ejercicio?.tipo === 'ordenar') setOrdenActual([...l.ejercicio.fases].sort(() => Math.random() - 0.5));
    setVista('leccion');
  };

  const calcularNota = () => {
    const pregs = leccionActiva?.preguntas || leccionActiva?.ejercicio?.preguntas;
    if (pregs) {
      let c = 0; pregs.forEach((p,i) => { if (respuestasTest[i] === p.correcta) c++; });
      return Math.round((c / pregs.length) * 100);
    }
    if (leccionActiva?.ejercicio?.tipo === 'clasificar') {
      let c = 0; leccionActiva.ejercicio.items.forEach(it => { if (clasificaciones[it.texto] === it.categoria) c++; });
      return Math.round((c / leccionActiva.ejercicio.items.length) * 100);
    }
    if (leccionActiva?.ejercicio?.tipo === 'ordenar') {
      let c = 0; ordenActual.forEach((f,i) => { if (f === leccionActiva.ejercicio.orden_correcto[i]) c++; });
      return Math.round((c / ordenActual.length) * 100);
    }
    return 0;
  };

  const completarLeccion = () => {
    const key = `${moduloActivo.id}-${leccionActiva.id}`;
    const nuevas = completadas.includes(key) ? completadas : [...completadas, key];
    saveCompletadas(nuevas);
    const todas = moduloActivo.lecciones.map(l => `${moduloActivo.id}-${l.id}`);
    if (todas.every(k => nuevas.includes(k)) && !certificados.find(c => c.moduloId === moduloActivo.id)) {
      const cert = { moduloId:moduloActivo.id, titulo:moduloActivo.certificado, modulo:moduloActivo.titulo, fecha:new Date().toLocaleDateString('es-ES'), color:moduloActivo.color };
      saveCertificados([...certificados, cert]);
      setMostrarCert(cert);
    } else { setVista('modulos'); }
  };

  const moverFase = (i, dir) => {
    const n = [...ordenActual]; const t = i+dir;
    if (t<0||t>=n.length) return;
    [n[i],n[t]]=[n[t],n[i]]; setOrdenActual(n);
  };

  const nota = calcularNota();
  const leccionesCompletadasModulo = mod => mod.lecciones.filter(l => completadas.includes(`${mod.id}-${l.id}`)).length;
  const moduloCompleto = mod => mod.lecciones.length > 0 && leccionesCompletadasModulo(mod) === mod.lecciones.length;
  const cursoDesbloqueado = curso => curso.id === 1 || (() => {
    const prev = CURSOS[curso.id-2];
    return prev.moduloIds.every(mId => moduloCompleto(MODULOS.find(m => m.id === mId)));
  })();
  const progresoCurso = curso => {
    const mods = curso.moduloIds.map(id => MODULOS.find(m => m.id === id));
    const total = mods.reduce((acc,m) => acc+m.lecciones.length, 0);
    const hechas = mods.reduce((acc,m) => acc+leccionesCompletadasModulo(m), 0);
    return total>0 ? Math.round((hechas/total)*100) : 0;
  };
  const leccionesTotales = MODULOS.reduce((acc,m) => acc+m.lecciones.length, 0);
  const leccionesComp    = completadas.length;

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
    @keyframes certIn{from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp 0.3s ease forwards;}
    .card-hover:hover{transform:translateY(-4px)!important;box-shadow:0 16px 40px rgba(0,0,0,0.12)!important;}
    .lesson-row:hover{background:#eef2ff!important;border-color:#c7d2fe!important;}
    .opt-btn:hover{border-color:#a5b4fc!important;background:#eef2ff!important;}
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    *{transition:transform .18s ease,box-shadow .18s ease,border-color .14s ease,background .14s ease,color .14s ease;}
    ::-webkit-scrollbar{width:5px;}
    ::-webkit-scrollbar-track{background:#f1f5f9;}
    ::-webkit-scrollbar-thumb{background:#c7d2fe;border-radius:3px;}
  `;

  // ── CERTIFICADO MODAL ──────────────────────────────────────────────────────
  if (mostrarCert) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)', display:'flex', alignItems:'center', justifyContent:'center', padding:'28px', fontFamily:"'Inter',system-ui,sans-serif" }}>
        <div style={{ maxWidth:'500px', width:'100%', animation:'certIn .4s ease forwards' }}>
          <div style={{ padding:'48px 40px', borderRadius:'20px', backgroundColor:CARD, border:`1px solid rgba(217,119,6,0.25)`, textAlign:'center', position:'relative', overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.12)' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg,transparent,${GOLD},transparent)` }}/>
            <div style={{ width:'56px', height:'56px', borderRadius:'50%', backgroundColor:'rgba(217,119,6,0.08)', border:'1px solid rgba(217,119,6,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:'24px' }}>🏅</div>
            <p style={{ fontSize:'10px', color:GOLD, fontFamily:'monospace', fontWeight:700, letterSpacing:'3px', marginBottom:'14px' }}>CERTIFICADO DE COMPLETACIÓN</p>
            <h1 style={{ fontSize:'22px', fontWeight:800, color:T1, marginBottom:'8px', letterSpacing:'-0.3px', lineHeight:1.3 }}>{mostrarCert.titulo}</h1>
            <p style={{ fontSize:'14px', color:T2, marginBottom:'4px' }}>{mostrarCert.modulo}</p>
            <p style={{ fontSize:'11px', color:T3, fontFamily:'monospace', marginBottom:'28px' }}>SocBlast · {mostrarCert.fecha}</p>
            <div style={{ width:'100%', height:'1px', backgroundColor:BD, marginBottom:'22px' }}/>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => { setMostrarCert(null); setVista('modulos'); }} style={{ flex:1, padding:'13px', borderRadius:'10px', backgroundColor:ACC, border:'none', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>Continuar →</button>
              <button onClick={() => { setMostrarCert(null); navigate('/perfil'); }} style={{ flex:1, padding:'13px', borderRadius:'10px', backgroundColor:CARD2, border:`1px solid ${BD}`, color:T2, fontSize:'14px', cursor:'pointer' }}>Ver en perfil</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── LECCIÓN ────────────────────────────────────────────────────────────────
  if (vista === 'leccion') {
    const tieneCaso       = leccionActiva?.ejercicio?.tipo === 'caso_practico';
    const tieneOrdenar    = leccionActiva?.ejercicio?.tipo === 'ordenar';
    const tieneClasificar = leccionActiva?.ejercicio?.tipo === 'clasificar';
    const tieneTest       = !!leccionActiva?.preguntas?.length;
    const pregsPractica   = leccionActiva?.preguntas || leccionActiva?.ejercicio?.preguntas || [];
    const imgQuery        = LESSON_IMAGES[`${moduloActivo?.id}-${leccionActiva?.id}`];
    const modColor        = moduloActivo?.color || ACC;

    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)', fontFamily:"'Inter',system-ui,sans-serif" }}>
          <Navbar titulo={leccionActiva.titulo} back={() => { setVista('modulos'); setLeccionActiva(null); }} right={`+${leccionActiva.xp} XP`} onLogoClick={() => navigate('/')}/>
          <div style={{ maxWidth:'760px', margin:'0 auto', padding:'32px 40px 80px' }}>

            {/* Tabs */}
            <div style={{ display:'flex', gap:'4px', marginBottom:'28px', padding:'4px', backgroundColor:CARD, borderRadius:'12px', border:`1px solid ${BD}`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              {['teoria','practica'].map(f => (
                <div key={f} onClick={() => f==='teoria' && setFase('teoria')}
                  style={{ flex:1, padding:'9px', borderRadius:'9px', textAlign:'center', fontSize:'11px', fontWeight:700, letterSpacing:'1.5px', fontFamily:'monospace', cursor:'pointer', backgroundColor:fase===f?ACC:'transparent', color:fase===f?'#fff':T3, border:'none', transition:'all .15s' }}>
                  {f==='teoria' ? (fase==='practica'?'✓ TEORÍA':'TEORÍA') : (tieneCaso?'CASO PRÁCTICO':'PRÁCTICA')}
                </div>
              ))}
            </div>

            {/* TEORÍA */}
            {fase==='teoria' && (
              <div className="fade-up">
                {imgQuery && <LeccionImagen query={imgQuery}/>}
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'22px' }}>
                  <div style={{ width:'3px', height:'24px', borderRadius:'2px', backgroundColor:modColor }}/>
                  <h2 style={{ fontSize:'20px', fontWeight:800, color:T1, letterSpacing:'-0.4px' }}>{leccionActiva.titulo}</h2>
                </div>
                <div style={{ marginBottom:'24px' }}>
                  <TeoriaVisual texto={leccionActiva.teoria}/>
                </div>
                <button onClick={() => setFase('practica')}
                  style={{ width:'100%', padding:'15px', borderRadius:'12px', background:`linear-gradient(135deg,${modColor},${modColor}cc)`, border:'none', color:'#fff', fontWeight:700, fontSize:'15px', cursor:'pointer', boxShadow:`0 4px 16px ${modColor}30` }}>
                  {tieneCaso ? 'Ir al Caso Práctico →' : 'Ir a la Práctica →'}
                </button>
              </div>
            )}

            {/* PRÁCTICA */}
            {fase==='practica' && (
              <div className="fade-up">
                <div style={{ padding:'14px 18px', borderRadius:'11px', backgroundColor:CARD2, border:`1px solid ${BD}`, marginBottom:'22px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'9px', backgroundColor:tieneCaso?'rgba(239,68,68,0.08)':'rgba(79,70,229,0.08)', border:`1px solid ${tieneCaso?'rgba(239,68,68,0.2)':'rgba(79,70,229,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>
                    {tieneCaso?'⚡':'📝'}
                  </div>
                  <div>
                    <p style={{ fontSize:'11px', fontWeight:700, color:T1, marginBottom:'2px', fontFamily:'monospace', letterSpacing:'1px' }}>
                      {tieneCaso?'CASO PRÁCTICO — TOMA DE DECISIONES':'TEST DE CONOCIMIENTOS'}
                    </p>
                    <p style={{ fontSize:'11px', color:T3, fontFamily:'monospace' }}>{pregsPractica.length} {tieneCaso?'escenarios':'preguntas'} · Mínimo 60% para superar</p>
                  </div>
                </div>

                {/* Test / Caso */}
                {(tieneTest || tieneCaso) && (
                  <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
                    {pregsPractica.map((p,i) => (
                      <div key={i} style={{ borderRadius:'13px', backgroundColor:CARD, border:`1px solid ${BD}`, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
                        {tieneCaso && <div style={{ height:'2px', background:`linear-gradient(90deg,${RED}55,transparent)` }}/>}
                        <div style={{ padding:'18px 20px' }}>
                          <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'14px' }}>
                            <div style={{ width:'24px', height:'24px', borderRadius:'7px', backgroundColor:'rgba(79,70,229,0.08)', border:'1px solid rgba(79,70,229,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <span style={{ fontSize:'10px', fontWeight:700, color:ACC, fontFamily:'monospace' }}>{i+1}</span>
                            </div>
                            <p style={{ fontSize:'14px', color:T1, fontWeight:500, lineHeight:1.65 }}>{p.pregunta}</p>
                          </div>
                          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                            {p.opciones.map((op,j) => {
                              let bg=CARD2, border=BD, color=T2, icon=null;
                              if (testEnviado) {
                                if (j===p.correcta)             { bg='rgba(5,150,105,0.06)'; border='rgba(5,150,105,0.25)'; color=GREEN; icon='✓'; }
                                else if (respuestasTest[i]===j) { bg='rgba(239,68,68,0.06)'; border='rgba(239,68,68,0.2)';  color=RED;   icon='✗'; }
                              } else if (respuestasTest[i]===j) { bg='rgba(79,70,229,0.06)'; border='rgba(79,70,229,0.3)'; color=ACC; }
                              return (
                                <button key={j} className="opt-btn" onClick={() => !testEnviado && setRespuestasTest(p=>({...p,[i]:j}))}
                                  style={{ padding:'10px 14px', borderRadius:'9px', backgroundColor:bg, border:`1px solid ${border}`, color, fontSize:'13px', cursor:testEnviado?'default':'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'10px' }}>
                                  <div style={{ width:'18px', height:'18px', borderRadius:'50%', border:`1.5px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'10px', fontWeight:700, color }}>
                                    {icon || String.fromCharCode(65+j)}
                                  </div>
                                  {op}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Clasificar */}
                {tieneClasificar && (
                  <>
                    <div style={{ padding:'10px 14px', borderRadius:'9px', backgroundColor:'rgba(79,70,229,0.05)', border:'1px solid rgba(79,70,229,0.15)', marginBottom:'14px' }}>
                      <p style={{ fontSize:'11px', color:ACC, fontFamily:'monospace', fontWeight:700, letterSpacing:'1.5px' }}>CLASIFICAR — {leccionActiva.ejercicio.instruccion?.toUpperCase()}</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
                      {leccionActiva.ejercicio.items.map((item,i) => {
                        const ok   = testEnviado && clasificaciones[item.texto]===item.categoria;
                        const fail = testEnviado && clasificaciones[item.texto] && clasificaciones[item.texto]!==item.categoria;
                        return (
                          <div key={i} style={{ padding:'14px 16px', borderRadius:'11px', backgroundColor:ok?'rgba(5,150,105,0.05)':fail?'rgba(239,68,68,0.05)':CARD, border:`1px solid ${ok?'rgba(5,150,105,0.2)':fail?'rgba(239,68,68,0.15)':BD}`, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                            <p style={{ fontSize:'13px', color:T1, marginBottom:'8px', fontWeight:500 }}>{item.texto}</p>
                            {testEnviado
                              ? <p style={{ fontSize:'12px', color:ok?GREEN:RED, fontFamily:'monospace' }}>{ok?`✓ ${item.categoria}`:`✗ Tu: ${clasificaciones[item.texto]||'—'} · Correcto: ${item.categoria}`}</p>
                              : <select value={clasificaciones[item.texto]||''} onChange={e=>setClasificaciones(p=>({...p,[item.texto]:e.target.value}))}
                                  style={{ width:'100%', padding:'7px 10px', borderRadius:'8px', backgroundColor:CARD2, border:`1px solid ${BD}`, color:T1, fontSize:'12px', outline:'none', fontFamily:'monospace' }}>
                                  <option value=''>Selecciona categoría...</option>
                                  {leccionActiva.ejercicio.categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            }
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Ordenar */}
                {tieneOrdenar && (
                  <>
                    <div style={{ padding:'10px 14px', borderRadius:'9px', backgroundColor:'rgba(217,119,6,0.05)', border:'1px solid rgba(217,119,6,0.15)', marginBottom:'14px' }}>
                      <p style={{ fontSize:'11px', color:GOLD, fontFamily:'monospace', fontWeight:700, letterSpacing:'1.5px' }}>ORDENAR — {leccionActiva.ejercicio.instruccion?.toUpperCase()}</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'16px' }}>
                      {ordenActual.map((f,i) => {
                        const ok = testEnviado && f===leccionActiva.ejercicio.orden_correcto[i];
                        return (
                          <div key={f} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', borderRadius:'10px', backgroundColor:testEnviado?(ok?'rgba(5,150,105,0.05)':'rgba(239,68,68,0.05)'):CARD, border:`1px solid ${testEnviado?(ok?'rgba(5,150,105,0.18)':'rgba(239,68,68,0.12)'):BD}`, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                            <div style={{ width:'24px', height:'24px', borderRadius:'7px', backgroundColor:testEnviado?(ok?'rgba(5,150,105,0.1)':'rgba(239,68,68,0.1)'):'rgba(79,70,229,0.08)', border:`1px solid ${testEnviado?(ok?GREEN:RED):ACC}28`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <span style={{ fontSize:'10px', fontWeight:700, color:testEnviado?(ok?GREEN:RED):ACC, fontFamily:'monospace' }}>{i+1}</span>
                            </div>
                            <span style={{ fontSize:'13px', color:T1, flex:1 }}>{f}</span>
                            {!testEnviado && (
                              <div style={{ display:'flex', gap:'4px' }}>
                                {[['↑',-1],['↓',1]].map(([label,dir]) => (
                                  <button key={label} onClick={() => moverFase(i,dir)} style={{ padding:'3px 8px', borderRadius:'6px', backgroundColor:CARD2, border:`1px solid ${BD}`, color:T3, fontSize:'12px', cursor:'pointer' }}>{label}</button>
                                ))}
                              </div>
                            )}
                            {testEnviado && !ok && <span style={{ fontSize:'10px', color:T3, fontFamily:'monospace' }}>→ {leccionActiva.ejercicio.orden_correcto[i]}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Resultado */}
                {!testEnviado
                  ? <button onClick={() => setTestEnviado(true)}
                      style={{ width:'100%', padding:'15px', borderRadius:'12px', background:`linear-gradient(135deg,${ACC},#6366f1)`, border:'none', color:'#fff', fontWeight:700, fontSize:'15px', cursor:'pointer', boxShadow:'0 4px 16px rgba(79,70,229,0.3)' }}>
                      Enviar respuestas
                    </button>
                  : <>
                      <div style={{ padding:'20px 24px', borderRadius:'13px', backgroundColor:nota>=60?'rgba(5,150,105,0.05)':'rgba(239,68,68,0.05)', border:`1px solid ${nota>=60?'rgba(5,150,105,0.2)':'rgba(239,68,68,0.15)'}`, marginBottom:'12px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div>
                          <p style={{ fontSize:'40px', fontWeight:900, color:nota>=60?GREEN:RED, lineHeight:1, fontFamily:'monospace' }}>{nota}%</p>
                          <p style={{ fontSize:'12px', color:T3, marginTop:'4px', fontFamily:'monospace' }}>{nota>=60?'Lección superada ✓':'Mínimo 60% requerido'}</p>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <p style={{ fontSize:'20px', fontWeight:700, color:nota>=60?GREEN:T3, fontFamily:'monospace' }}>+{nota>=60?leccionActiva.xp:0}</p>
                          <p style={{ fontSize:'11px', color:T3 }}>XP</p>
                        </div>
                      </div>
                      {nota>=60
                        ? <button onClick={completarLeccion} style={{ width:'100%', padding:'15px', borderRadius:'12px', backgroundColor:'rgba(5,150,105,0.08)', border:'1px solid rgba(5,150,105,0.25)', color:GREEN, fontWeight:700, fontSize:'15px', cursor:'pointer' }}>
                            Completar lección (+{leccionActiva.xp} XP) →
                          </button>
                        : <button onClick={() => { setTestEnviado(false); setRespuestasTest({}); setClasificaciones({}); if (tieneOrdenar) setOrdenActual([...leccionActiva.ejercicio.fases].sort(()=>Math.random()-.5)); setFase('teoria'); }}
                            style={{ width:'100%', padding:'15px', borderRadius:'12px', backgroundColor:CARD2, border:`1px solid ${BD}`, color:T2, fontWeight:600, fontSize:'15px', cursor:'pointer' }}>
                            Revisar teoría e intentar de nuevo
                          </button>
                      }
                    </>
                }
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── MÓDULOS ────────────────────────────────────────────────────────────────
  if (vista==='modulos' && cursoActivo) {
    const modsCurso = cursoActivo.moduloIds.map(id => MODULOS.find(m => m.id === id));
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)', fontFamily:"'Inter',system-ui,sans-serif" }}>
          <Navbar titulo={cursoActivo.titulo} back={() => { setVista('cursos'); setCursoActivo(null); }} right={`+${modsCurso.reduce((acc,m)=>acc+m.xp,0)} XP`} onLogoClick={() => navigate('/')}/>
          <div style={{ maxWidth:'960px', margin:'0 auto', padding:'32px 40px 80px' }}>

            {/* Header curso */}
            <div style={{ padding:'22px 28px', borderRadius:'16px', backgroundColor:CARD, border:`1px solid ${BD}`, marginBottom:'22px', position:'relative', overflow:'hidden', boxShadow:'0 4px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg,transparent,${cursoActivo.color},transparent)` }}/>
              <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'12px', backgroundColor:`rgba(${cursoActivo.colorRgb},0.08)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', border:`1px solid rgba(${cursoActivo.colorRgb},0.15)` }}>{cursoActivo.icono}</div>
                <div style={{ flex:1 }}>
                  <h2 style={{ fontSize:'19px', fontWeight:800, color:T1, marginBottom:'3px', letterSpacing:'-0.3px' }}>{cursoActivo.titulo}</h2>
                  <p style={{ fontSize:'13px', color:T3 }}>{cursoActivo.descripcion}</p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:'28px', fontWeight:900, color:cursoActivo.color, lineHeight:1, fontFamily:'monospace' }}>{progresoCurso(cursoActivo)}%</p>
                  <p style={{ fontSize:'11px', color:T3 }}>completado</p>
                </div>
              </div>
            </div>

            {/* Grid módulos */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'22px' }}>
              {modsCurso.map(mod => {
                const lComp   = leccionesCompletadasModulo(mod);
                const total   = mod.lecciones.length;
                const completo= moduloCompleto(mod);
                const certObt = certificados.find(c => c.moduloId === mod.id);
                const pct     = total>0?(lComp/total)*100:0;
                return (
                  <div key={mod.id} className="card-hover" onClick={() => setModuloActivo(moduloActivo?.id===mod.id?null:mod)}
                    style={{ padding:'20px', borderRadius:'14px', backgroundColor:CARD, border:completo?'1px solid rgba(5,150,105,0.2)':`1px solid rgba(${mod.colorRgb},0.15)`, cursor:'pointer', position:'relative', overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:completo?`linear-gradient(90deg,transparent,${GREEN}55,transparent)`:`linear-gradient(90deg,transparent,${mod.color}45,transparent)` }}/>
                    <div style={{ position:'absolute', left:0, top:'3px', bottom:0, width:'3px', backgroundColor:BD }}>
                      <div style={{ position:'absolute', top:0, left:0, width:'100%', height:`${pct}%`, backgroundColor:completo?GREEN:mod.color }}/>
                    </div>
                    <div style={{ paddingLeft:'10px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                        <span style={{ fontSize:'10px', color:mod.color, fontFamily:'monospace', fontWeight:700, letterSpacing:'1px' }}>MÓD {mod.num}</span>
                        <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>
                          {certObt && <span style={{ fontSize:'12px' }}>🏅</span>}
                          <span style={{ fontSize:'10px', padding:'2px 7px', borderRadius:'5px', fontFamily:'monospace', fontWeight:700, backgroundColor:completo?'rgba(5,150,105,0.07)':`rgba(${mod.colorRgb},0.07)`, color:completo?GREEN:mod.color, border:`1px solid ${completo?'rgba(5,150,105,0.18)':`rgba(${mod.colorRgb},0.18)`}` }}>
                            {completo?'DONE':'OPEN'}
                          </span>
                        </div>
                      </div>
                      <h3 style={{ fontSize:'14px', fontWeight:700, color:T1, marginBottom:'4px', lineHeight:1.4 }}>{mod.titulo}</h3>
                      <p style={{ fontSize:'12px', color:T3, marginBottom:'12px', lineHeight:1.6 }}>{mod.descripcion}</p>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:'11px', color:completo?GREEN:mod.color, fontFamily:'monospace', fontWeight:600 }}>+{mod.xp} XP</span>
                        <span style={{ fontSize:'10px', color:T3, fontFamily:'monospace' }}>{lComp}/{total} lecciones</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lista lecciones */}
            {moduloActivo && cursoActivo.moduloIds.includes(moduloActivo.id) && (
              <div style={{ padding:'20px 24px', borderRadius:'15px', backgroundColor:CARD, border:`1px solid rgba(${moduloActivo.colorRgb},0.15)`, position:'relative', overflow:'hidden', boxShadow:'0 4px 16px rgba(0,0,0,0.06)' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg,transparent,${moduloActivo.color},transparent)` }}/>
                <div style={{ marginBottom:'16px' }}>
                  <h3 style={{ fontSize:'15px', fontWeight:700, color:T1, marginBottom:'2px' }}>{moduloActivo.titulo}</h3>
                  <p style={{ fontSize:'11px', color:T3, fontFamily:'monospace' }}>{moduloActivo.certificado}</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                  {moduloActivo.lecciones.map(leccion => {
                    const done  = completadas.includes(`${moduloActivo.id}-${leccion.id}`);
                    const esCaso= leccion.ejercicio?.tipo==='caso_practico';
                    return (
                      <div key={leccion.id} className="lesson-row" onClick={() => iniciarLeccion(leccion)}
                        style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', borderRadius:'10px', backgroundColor:done?'rgba(5,150,105,0.04)':CARD2, border:done?'1px solid rgba(5,150,105,0.12)':`1px solid ${BD}`, cursor:'pointer', position:'relative', overflow:'hidden' }}>
                        {done && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px', backgroundColor:GREEN }}/>}
                        <div style={{ width:'32px', height:'32px', borderRadius:'8px', backgroundColor:done?'rgba(5,150,105,0.07)':`rgba(${moduloActivo.colorRgb},0.07)`, border:`1px solid ${done?'rgba(5,150,105,0.15)':`rgba(${moduloActivo.colorRgb},0.15)`}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <span style={{ fontSize:'11px', fontWeight:700, color:done?GREEN:moduloActivo.color, fontFamily:'monospace' }}>{done?'✓':leccion.id}</span>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'1px' }}>
                            <p style={{ fontSize:'13px', color:done?GREEN:T1, fontWeight:500 }}>{leccion.titulo}</p>
                            {esCaso && <span style={{ fontSize:'9px', padding:'2px 6px', borderRadius:'4px', backgroundColor:'rgba(239,68,68,0.07)', color:RED, border:'1px solid rgba(239,68,68,0.15)', fontFamily:'monospace', fontWeight:700, letterSpacing:'1px' }}>CASO</span>}
                          </div>
                          <p style={{ fontSize:'10px', color:T3, fontFamily:'monospace' }}>+{leccion.xp} XP</p>
                        </div>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── VISTA PRINCIPAL — CURSOS ───────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)', fontFamily:"'Inter',system-ui,sans-serif" }}>
        <nav style={{ position:'sticky', top:0, zIndex:50, height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', backgroundColor:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${BD}`, boxShadow:'0 1px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }} onClick={() => navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{ height:'28px' }}/>
            <span style={{ fontSize:'15px', fontWeight:800, color:T1 }}>Soc<span style={{ color:ACC }}>Blast</span></span>
          </div>
          <div style={{ display:'flex', gap:'2px' }}>
            {[{label:'← Dashboard',path:'/dashboard'},{label:'Ranking',path:'/ranking'},{label:'Perfil',path:'/perfil'}].map((item,i) => (
              <button key={i} className="nav-btn" onClick={() => navigate(item.path)} style={{ padding:'5px 12px', borderRadius:'7px', background:'none', border:'none', color:T2, fontSize:'13px', cursor:'pointer' }}>{item.label}</button>
            ))}
          </div>
          <span style={{ fontSize:'11px', color:GREEN, fontFamily:'monospace', fontWeight:600, padding:'3px 10px', borderRadius:'6px', backgroundColor:'rgba(5,150,105,0.07)', border:'1px solid rgba(5,150,105,0.15)' }}>
            {leccionesComp}/{leccionesTotales} · {certificados.length} certs
          </span>
        </nav>

        <div style={{ maxWidth:'1080px', margin:'0 auto', padding:'44px 40px 80px' }}>
          <div style={{ marginBottom:'40px' }}>
            <p style={{ fontSize:'11px', color:T3, fontFamily:'monospace', fontWeight:700, letterSpacing:'2.5px', marginBottom:'8px' }}>CENTRO DE FORMACIÓN SOC</p>
            <h1 style={{ fontSize:'34px', fontWeight:900, color:T1, letterSpacing:'-1.2px', marginBottom:'8px', lineHeight:1.1 }}>
              SOC Training<br/><span style={{ color:ACC }}>Platform</span>
            </h1>
            <p style={{ fontSize:'14px', color:T3, marginBottom:'20px' }}>3 cursos · {MODULOS.length} módulos · {MODULOS.reduce((acc,m)=>acc+m.xp,0)} XP disponibles</p>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', maxWidth:'480px' }}>
              <div style={{ flex:1, height:'6px', borderRadius:'3px', backgroundColor:BD, overflow:'hidden' }}>
                <div style={{ width:`${leccionesTotales>0?(leccionesComp/leccionesTotales)*100:0}%`, height:'100%', borderRadius:'3px', background:`linear-gradient(90deg,${ACC},${GREEN})` }}/>
              </div>
              <span style={{ fontSize:'12px', color:T3, fontFamily:'monospace', flexShrink:0 }}>{Math.round(leccionesTotales>0?(leccionesComp/leccionesTotales)*100:0)}%</span>
            </div>
          </div>

          {certificados.length > 0 && (
            <div style={{ padding:'16px 20px', borderRadius:'13px', backgroundColor:CARD, border:'1px solid rgba(217,119,6,0.15)', marginBottom:'28px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize:'10px', color:GOLD, fontFamily:'monospace', fontWeight:700, letterSpacing:'2px', marginBottom:'10px' }}>CERTIFICADOS OBTENIDOS</p>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {certificados.map((cert,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'5px 12px', borderRadius:'8px', backgroundColor:'rgba(217,119,6,0.06)', border:'1px solid rgba(217,119,6,0.15)' }}>
                    <span style={{ fontSize:'12px' }}>🏅</span>
                    <span style={{ fontSize:'11px', color:GOLD, fontWeight:600, fontFamily:'monospace' }}>{cert.titulo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
            {CURSOS.map(curso => {
              const desbloqueado = cursoDesbloqueado(curso);
              const progreso     = progresoCurso(curso);
              const completo     = progreso===100;
              return (
                <div key={curso.id} className={desbloqueado?'card-hover':''}
                  onClick={() => { if (!desbloqueado) return; setCursoActivo(curso); setModuloActivo(null); setVista('modulos'); }}
                  style={{ borderRadius:'16px', backgroundColor:CARD, border:!desbloqueado?`1px solid ${BD}`:completo?'1px solid rgba(5,150,105,0.2)':`1px solid rgba(${curso.colorRgb},0.18)`, cursor:desbloqueado?'pointer':'not-allowed', opacity:desbloqueado?1:.35, position:'relative', overflow:'hidden', boxShadow:desbloqueado?'0 4px 20px rgba(0,0,0,0.08)':'none' }}>

                  <div style={{ height:'110px', background:desbloqueado?`linear-gradient(135deg,rgba(${curso.colorRgb},0.1) 0%,rgba(${curso.colorRgb},0.03) 100%)`:CARD2, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:desbloqueado?`linear-gradient(90deg,transparent,${curso.color},transparent)`:undefined }}/>
                    <div style={{ width:'56px', height:'56px', borderRadius:'14px', backgroundColor:desbloqueado?`rgba(${curso.colorRgb},0.1)`:CARD2, border:`1px solid rgba(${curso.colorRgb},0.15)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>{curso.icono}</div>
                    <div style={{ position:'absolute', top:'10px', right:'12px' }}>
                      <span style={{ fontSize:'10px', padding:'2px 7px', borderRadius:'5px', fontFamily:'monospace', fontWeight:700, backgroundColor:!desbloqueado?CARD2:completo?'rgba(5,150,105,0.08)':`rgba(${curso.colorRgb},0.08)`, color:!desbloqueado?T3:completo?GREEN:curso.color, border:`1px solid ${!desbloqueado?BD:completo?'rgba(5,150,105,0.2)':`rgba(${curso.colorRgb},0.2)`}` }}>
                        {!desbloqueado?'LOCKED':completo?'DONE':'OPEN'}
                      </span>
                    </div>
                    <div style={{ position:'absolute', bottom:'10px', left:'12px' }}>
                      <span style={{ fontSize:'10px', padding:'2px 7px', borderRadius:'5px', backgroundColor:'rgba(0,0,0,0.05)', color:T3, fontFamily:'monospace', border:`1px solid ${BD}` }}>{curso.nivel}</span>
                    </div>
                  </div>

                  <div style={{ padding:'18px 20px 22px' }}>
                    <p style={{ fontSize:'10px', color:curso.color, fontFamily:'monospace', fontWeight:700, letterSpacing:'1.5px', marginBottom:'5px' }}>CURSO {String(curso.id).padStart(2,'0')}</p>
                    <h3 style={{ fontSize:'17px', fontWeight:800, color:T1, marginBottom:'3px', letterSpacing:'-0.3px', lineHeight:1.2 }}>{curso.titulo}</h3>
                    <p style={{ fontSize:'12px', color:curso.color, marginBottom:'8px', fontStyle:'italic' }}>{curso.subtitulo}</p>
                    <p style={{ fontSize:'12px', color:T3, marginBottom:'16px', lineHeight:1.65 }}>{curso.descripcion}</p>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'14px' }}>
                      {[{label:'Módulos',value:curso.moduloIds.length},{label:'Duración',value:curso.duracion}].map((s,i) => (
                        <div key={i} style={{ padding:'8px 10px', borderRadius:'8px', backgroundColor:CARD2, border:`1px solid ${BD}`, textAlign:'center' }}>
                          <p style={{ fontSize:'10px', color:T3, fontFamily:'monospace', marginBottom:'2px' }}>{s.label}</p>
                          <p style={{ fontSize:'12px', fontWeight:700, color:T2, fontFamily:'monospace' }}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom:'12px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                        <span style={{ fontSize:'11px', color:T3, fontFamily:'monospace' }}>Progreso</span>
                        <span style={{ fontSize:'11px', color:completo?GREEN:curso.color, fontFamily:'monospace', fontWeight:700 }}>{progreso}%</span>
                      </div>
                      <div style={{ height:'4px', borderRadius:'2px', backgroundColor:BD, overflow:'hidden' }}>
                        <div style={{ width:`${progreso}%`, height:'100%', borderRadius:'2px', backgroundColor:completo?GREEN:curso.color }}/>
                      </div>
                    </div>

                    {desbloqueado && (
                      <div style={{ display:'flex', alignItems:'center', gap:'4px', color:curso.color, fontSize:'12px', fontWeight:700, fontFamily:'monospace' }}>
                        <span>{completo?'Ver certificados':'Comenzar curso'}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
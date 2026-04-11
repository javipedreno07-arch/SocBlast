import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const BG    = '#060810';
const CARD  = 'rgba(10,18,35,0.95)';
const CARD2 = 'rgba(6,12,24,0.9)';
const BD    = '#0F2040';
const BD2   = '#1A3060';
const T1    = '#F0F4FF';
const T2    = '#8BA4CC';
const T3    = '#3A5478';
const ACC   = '#3B7BF5';
const GREEN = '#22D3A0';
const RED   = '#F05070';
const GOLD  = '#F0B429';

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
  { bg:'rgba(59,123,245,0.07)',  border:'rgba(59,123,245,0.22)',  accent:'#3B7BF5' },
  { bg:'rgba(34,211,160,0.06)',  border:'rgba(34,211,160,0.18)',  accent:'#22D3A0' },
  { bg:'rgba(240,180,41,0.06)',  border:'rgba(240,180,41,0.18)',  accent:'#F0B429' },
  { bg:'rgba(167,100,245,0.06)', border:'rgba(167,100,245,0.18)', accent:'#A764F5' },
  { bg:'rgba(240,80,112,0.06)',  border:'rgba(240,80,112,0.18)',  accent:'#F05070' },
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

    if (/^[━─=]{3,}/.test(l)) {
      push();
      actual = { tipo:'separador' };
      push();
      continue;
    }

    if (l.startsWith('index=') || l.startsWith('nmap') || l.startsWith('import ') || l.startsWith('def ') || l.startsWith('with ') || l.startsWith('for ') || /^\w+ = /.test(l)) {
      if (actual?.tipo !== 'codigo') { push(); actual = { tipo:'codigo', lineas:[] }; }
      actual.lineas.push(l);
      continue;
    }

    if (/^[-•·]\s/.test(l) || /^\d+\.\s/.test(l) || /^[🔴🟠🟡🟢✓✗⚠T]/.test(l)) {
      const texto = l.replace(/^[-•·]\s*/, '').replace(/^\d+\.\s*/, '');
      if (actual?.tipo === 'seccion') { actual.items.push(texto); continue; }
      if (actual?.tipo !== 'lista') { push(); actual = { tipo:'lista', items:[], color:COLORES_SECCION[colorIdx % COLORES_SECCION.length] }; }
      actual.items.push(texto);
      continue;
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
    <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
      {bloques.map((b, i) => {
        if (b.tipo === 'parrafo') return (
          <p key={i} style={{ fontSize:'15px', color:T2, lineHeight:1.9, letterSpacing:'0.01em' }}>{b.texto}</p>
        );

        if (b.tipo === 'seccion') return (
          <div key={i} style={{ borderRadius:'12px', backgroundColor:b.color.bg, border:`1px solid ${b.color.border}`, overflow:'hidden' }}>
            <div style={{ padding:'11px 18px', borderBottom:b.items.length?`1px solid ${b.color.border}`:undefined, display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'3px', height:'16px', borderRadius:'2px', backgroundColor:b.color.accent, flexShrink:0 }}/>
              <span style={{ fontSize:'11px', fontWeight:700, color:b.color.accent, letterSpacing:'1.8px', fontFamily:"'Courier New',monospace" }}>{b.titulo}</span>
              {b.sub && <span style={{ fontSize:'12px', color:T3 }}>— {b.sub}</span>}
            </div>
            {b.items.length > 0 && (
              <div style={{ padding:'12px 18px', display:'flex', flexDirection:'column', gap:'7px' }}>
                {b.items.map((item, j) => {
                  const esAlerta = /^[🔴🟠🟡🟢]/.test(item);
                  const colorItem = item.startsWith('🔴')?RED:item.startsWith('🟢')?GREEN:item.startsWith('🟠')?'#F97316':item.startsWith('🟡')?GOLD:T2;
                  return (
                    <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:esAlerta?'7px 12px':'0', borderRadius:esAlerta?'7px':undefined, backgroundColor:esAlerta?`${colorItem}08`:undefined, border:esAlerta?`1px solid ${colorItem}20`:undefined }}>
                      {!esAlerta && <div style={{ width:'4px', height:'4px', borderRadius:'50%', backgroundColor:b.color.accent, marginTop:'9px', flexShrink:0 }}/>}
                      <span style={{ fontSize:'14px', color:colorItem, lineHeight:1.75 }}>{item}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

        if (b.tipo === 'lista') return (
          <div key={i} style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {b.items.map((item, j) => {
              const esAlerta = /^[🔴🟠🟡🟢]/.test(item);
              const colorItem = item.startsWith('🔴')?RED:item.startsWith('🟢')?GREEN:item.startsWith('🟠')?'#F97316':item.startsWith('🟡')?GOLD:T2;
              return (
                <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'8px 14px', borderRadius:'8px', backgroundColor:esAlerta?`${colorItem}07`:'rgba(10,18,35,0.5)', border:`1px solid ${esAlerta?colorItem+'18':BD}` }}>
                  {!esAlerta && <div style={{ width:'4px', height:'4px', borderRadius:'50%', backgroundColor:ACC, marginTop:'9px', flexShrink:0 }}/>}
                  <span style={{ fontSize:'14px', color:colorItem, lineHeight:1.75 }}>{item}</span>
                </div>
              );
            })}
          </div>
        );

        if (b.tipo === 'codigo') return (
          <div key={i} style={{ borderRadius:'10px', backgroundColor:'rgba(0,4,12,0.95)', border:`1px solid ${BD2}`, overflow:'hidden' }}>
            <div style={{ padding:'6px 14px', backgroundColor:'rgba(59,123,245,0.06)', borderBottom:`1px solid ${BD}`, display:'flex', alignItems:'center', gap:'7px' }}>
              {['#F05070','#F0B429','#22D3A0'].map((c,k) => <div key={k} style={{ width:'8px', height:'8px', borderRadius:'50%', backgroundColor:c+'99' }}/>)}
            </div>
            <div style={{ padding:'14px 18px' }}>
              {b.lineas.map((linea, j) => (
                <div key={j} style={{ fontSize:'13px', color:linea.startsWith('━')||linea.startsWith('─')?T3:linea.includes('==') || linea.includes('✓')?GREEN:linea.startsWith('#')?T3:ACC, fontFamily:"'Courier New',monospace", lineHeight:1.85 }}>
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
    <div style={{ borderRadius:'14px', overflow:'hidden', marginBottom:'28px', border:`1px solid ${BD2}`, position:'relative', height:'200px' }}>
      <img src={src} alt={query} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.65) saturate(0.75)' }}/>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(6,8,16,0.9) 0%, transparent 55%)' }}/>
      <div style={{ position:'absolute', bottom:'12px', left:'16px' }}>
        <span style={{ fontSize:'11px', color:T3, fontFamily:"'Courier New',monospace" }}>{query}</span>
      </div>
    </div>
  );
};

const Navbar = ({ titulo, back, right, onLogoClick }) => (
  <nav style={{ position:'sticky', top:0, zIndex:50, height:'62px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 44px', backgroundColor:'rgba(6,8,16,0.97)', backdropFilter:'blur(24px)', borderBottom:`1px solid ${BD}` }}>
    <div style={{ display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }} onClick={onLogoClick}>
      <img src="/logosoc.png" alt="SocBlast" style={{ height:'28px' }}/>
      <span style={{ fontSize:'15px', fontWeight:800, color:T1, letterSpacing:'-0.3px' }}>Soc<span style={{ color:ACC }}>Blast</span></span>
    </div>
    {titulo && <span style={{ fontSize:'13px', fontWeight:500, color:T2, maxWidth:'360px', textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{titulo}</span>}
    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
      {right && <span style={{ fontSize:'11px', color:GREEN, fontFamily:"'Courier New',monospace", fontWeight:700, padding:'4px 10px', borderRadius:'6px', backgroundColor:'rgba(34,211,160,0.07)', border:'1px solid rgba(34,211,160,0.18)' }}>{right}</span>}
      {back && <button onClick={back} style={{ padding:'6px 16px', borderRadius:'8px', background:'none', border:`1px solid ${BD2}`, color:T2, fontSize:'12px', cursor:'pointer' }}>← Volver</button>}
    </div>
  </nav>
);
const MODULOS = [
  {
    id:1, num:'01', titulo:'Fundamentos de Ciberseguridad y SOC',
    descripcion:'Triada CIA, tipos de ataques, actores de amenaza y el rol del SOC',
    color:'#2564F1', colorRgb:'37,100,241', icono:'🛡️', xp:200,
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
    color:'#7C3AED', colorRgb:'124,58,237', icono:'🔍', xp:250,
    certificado:'Analista SOC — Detección',
    lecciones:[
      {
        id:1, titulo:'SIEM — El cerebro del SOC', xp:45,
        teoria:`El SIEM es la herramienta central del analista. Sin SIEM no hay SOC.

FUNCIONES PRINCIPALES:
- Recopilar y normalizar logs de toda la infraestructura
- Correlacionar eventos de múltiples fuentes
- Generar alertas basadas en reglas y umbrales
- Dashboards, reportes y retención de evidencias

QUERIES EN SPLUNK:
index=windows EventID=4625 | stats count by src_ip
index=firewall action=blocked | top src_ip
index=web status=200 | timechart count by uri

TIPOS DE ALERTAS — DEBES CONOCERLOS:
- True Positive (TP) — Alerta real, incidente confirmado
- False Positive (FP) — Alerta falsa, actividad legítima
- True Negative (TN) — Sin alerta y sin incidente (correcto)
- False Negative (FN) — Sin alerta pero HAY incidente (peligroso)

CORRELACIÓN — EL PODER REAL DEL SIEM:
Regla: más de 100 EventID 4625 en 5 min desde la misma IP es CRÍTICO: Brute Force`,
        preguntas:[
          {pregunta:'¿Qué es un False Negative en SIEM?',opciones:['Una alerta falsa','Incidente real sin alerta — el más peligroso','Una alerta correcta','Un log sin datos'],correcta:1},
          {pregunta:'La query Splunk "stats count by src_ip" sirve para...',opciones:['Ver tráfico web','Contar eventos agrupados por IP origen','Buscar malware','Listar usuarios'],correcta:1},
          {pregunta:'¿Qué hace el SIEM con logs de distintas fuentes?',opciones:['Los elimina','Los normaliza y correlaciona','Los cifra','Los ignora'],correcta:1},
          {pregunta:'True Positive significa...',opciones:['Falsa alarma','Alerta real con incidente confirmado','Sistema sin amenazas','Log sin anomalías'],correcta:1},
          {pregunta:'Una buena regla SIEM para detectar brute force sería...',opciones:['1 login fallido = alerta','Más de 100 logins fallidos en 5 min desde la misma IP','Cualquier login = alerta','Logins de lunes a viernes = alerta'],correcta:1},
        ]
      },
      {
        id:2, titulo:'MITRE ATT&CK Framework', xp:45,
        teoria:`MITRE ATT&CK es la biblia del analista SOC. Documenta tácticas y técnicas reales de atacantes.

ESTRUCTURA DEL FRAMEWORK:
- Tácticas — El QUÉ quiere el atacante
- Técnicas — El CÓMO lo consigue
- Sub-técnicas — Variantes específicas de cada técnica

TÁCTICAS PRINCIPALES:
- Reconnaissance, Initial Access, Execution, Persistence
- Privilege Escalation, Defense Evasion, Credential Access
- Discovery, Lateral Movement, Collection, Exfiltration, C2, Impact

TÉCNICAS MÁS VISTAS EN SOC:
- T1566 — Phishing (Initial Access)
- T1059 — Command and Scripting Interpreter (Execution)
- T1078 — Valid Accounts (Persistence + Privilege Escalation)
- T1027 — Obfuscated Files (Defense Evasion)
- T1110 — Brute Force (Credential Access)
- T1021 — Remote Services (Lateral Movement)
- T1486 — Data Encrypted for Impact (Ransomware)

CÓMO USARLO EN SOC:
- Ves PowerShell malicioso en una alerta — T1059.001
- Buscas en ATT&CK las técnicas relacionadas
- Identificas en qué fase del ataque estás
- Aplicas las mitigaciones recomendadas`,
        ejercicio:{
          tipo:'clasificar',
          instruccion:'Asocia cada técnica MITRE con su táctica correcta',
          items:[
            {texto:'T1566 — Email con adjunto malicioso',categoria:'Initial Access'},
            {texto:'T1110 — Fuerza bruta contra RDP',categoria:'Credential Access'},
            {texto:'T1021 — Uso de RDP para moverse entre sistemas',categoria:'Lateral Movement'},
            {texto:'T1078 — Usar credenciales robadas',categoria:'Persistence'},
            {texto:'T1059 — Ejecutar PowerShell',categoria:'Execution'},
            {texto:'T1027 — Ofuscar código malicioso',categoria:'Defense Evasion'},
          ],
          categorias:['Initial Access','Credential Access','Lateral Movement','Persistence','Execution','Defense Evasion']
        }
      },
      {
        id:3, titulo:'Threat Intelligence — IOCs y OSINT', xp:40,
        teoria:`La Threat Intelligence te permite conocer al enemigo antes de que ataque.

IOCS (INDICATORS OF COMPROMISE):
- IPs maliciosas — Servidores C2, Tor exit nodes
- Dominios — phishing.evil.com, dominios de C2
- Hashes de ficheros — MD5/SHA256 de malware conocido
- URLs — Links de phishing y exploits
- Email addresses — Remitentes de campañas de phishing

HERRAMIENTAS OSINT ESENCIALES:
- VirusTotal (virustotal.com) — Analizar hashes, IPs y dominios
- AbuseIPDB (abuseipdb.com) — Score de reputación de IPs
- Shodan (shodan.io) — Dispositivos expuestos en internet
- MalwareBazaar — Base de datos de muestras de malware
- URLscan.io — Análisis visual de URLs sospechosas

PROCESO DE ENRIQUECIMIENTO DE ALERTAS:
- Busca la IP en AbuseIPDB — ¿reportada como maliciosa?
- Busca en VirusTotal — ¿asociada a malware conocido?
- Busca en Shodan — ¿qué servicios expone en internet?
- Con ese contexto tu alerta pasa de "puede ser" a "confirmado"

Este proceso se llama ENRIQUECIMIENTO y diferencia a un L1 de un L2.`,
        preguntas:[
          {pregunta:'¿Qué es un IOC?',opciones:['Un tipo de malware','Indicador de Compromiso — evidencia de actividad maliciosa','Una herramienta SIEM','Un protocolo de red'],correcta:1},
          {pregunta:'Para verificar si una IP es maliciosa usarías...',opciones:['Google','AbuseIPDB o VirusTotal','Shodan únicamente','El SIEM directamente'],correcta:1},
          {pregunta:'¿Qué muestra Shodan?',opciones:['Malware conocido','Dispositivos y servicios expuestos en internet','Logs de Windows','URLs de phishing'],correcta:1},
          {pregunta:'Un hash SHA256 de archivo sospechoso lo analizarías en...',opciones:['AbuseIPDB','VirusTotal','Shodan','URLscan'],correcta:1},
          {pregunta:'El enriquecimiento de alertas sirve para...',opciones:['Eliminar alertas','Añadir contexto para confirmar si una alerta es real','Crear nuevas reglas SIEM','Formatear logs'],correcta:1},
        ]
      },
      {
        id:4, titulo:'CASO PRÁCTICO — Phishing con malware', xp:60,
        teoria:`CASO REAL: Campaña de phishing con RAT

CRONOLOGÍA DEL ATAQUE:
- 09:23 — Usuario de RRHH reporta email sospechoso
- 09:31 — EDR: outlook.exe lanza cmd.exe (anómalo)
- 09:31 — EDR: conexión saliente a 45.33.32.156:4444
- 09:45 — SIEM correlaciona: mismo patrón en 3 máquinas más

EMAIL RECIBIDO:
- De: rrhh-nominas@empresa-corp.com (DOMINIO FALSO)
- Asunto: Nómina revisada — firma urgente
- Adjunto: nomina_revision.pdf.exe — MALWARE

ANÁLISIS TÉCNICO:
- outlook.exe lanzando cmd.exe — macro o ejecutable en adjunto
- Puerto 4444 — típico de Metasploit reverse shell (C2)
- IP 45.33.32.156 — VirusTotal: C2 de RAT conocido
- 4 máquinas afectadas — movimiento lateral activo
- Todas las víctimas en RRHH — spearphishing dirigido

TÉCNICAS MITRE IDENTIFICADAS:
- T1566.001 — Spearphishing Attachment (Initial Access)
- T1059.003 — Windows Command Shell (Execution)
- T1071 — Application Layer Protocol C2
- T1570 — Lateral Tool Transfer (Lateral Movement)`,
        ejercicio:{
          tipo:'caso_practico',
          instruccion:'Analiza el caso de phishing y decide',
          preguntas:[
            {pregunta:'¿Qué indica que outlook.exe lance cmd.exe?',opciones:['Comportamiento normal de Outlook','Ejecución de macro o ejecutable malicioso desde el email','Actualización del sistema','Error de configuración'],correcta:1},
            {pregunta:'¿Qué es una conexión al puerto 4444?',opciones:['Tráfico web normal','DNS lookup','Probable reverse shell hacia servidor C2','Actualización de Windows'],correcta:2},
            {pregunta:'Con 4 máquinas afectadas, ¿qué táctica MITRE está ocurriendo?',opciones:['Initial Access','Exfiltration','Lateral Movement','Reconnaissance'],correcta:2},
            {pregunta:'¿Cuál debe ser la primera acción de contención?',opciones:['Avisar al usuario por email','Aislar las 4 máquinas afectadas de la red inmediatamente','Reinstalar Windows','Esperar a tener más datos'],correcta:1},
          ]
        }
      },
    ]
  },
  {
    id:3, num:'03', titulo:'Respuesta a Incidentes',
    descripcion:'Ciclo NIST, severidad, contención y caso completo de ransomware',
    color:'#EF4444', colorRgb:'239,68,68', icono:'🚨', xp:280,
    certificado:'Analista SOC — Incident Response',
    lecciones:[
      {
        id:1, titulo:'Ciclo de Respuesta NIST SP 800-61', xp:40,
        teoria:`El NIST SP 800-61 es el estándar de referencia para respuesta a incidentes.

FASE 1 — PREPARACIÓN:
- Políticas y procedimientos documentados
- Herramientas instaladas y configuradas
- Equipo entrenado y con roles asignados
- Playbooks por tipo de incidente

FASE 2 — DETECCIÓN Y ANÁLISIS:
- Identificar el incidente (SIEM, EDR, reporte de usuario)
- Clasificar severidad (Crítica, Alta, Media, Baja)
- Documentar todo desde el primer momento
- Determinar alcance e impacto en el negocio

FASE 3 — CONTENCIÓN:
- Corto plazo: Aislar sistemas afectados ahora
- Largo plazo: Parches, cambio de credenciales
- CRÍTICO: Preservar evidencias antes de actuar

FASE 4 — ERRADICACIÓN:
- Eliminar el malware y todos los backdoors
- Parchear las vulnerabilidades explotadas
- Revisar otros sistemas potencialmente afectados

FASE 5 — RECUPERACIÓN:
- Restaurar desde backup limpio y verificado
- Monitorización intensiva post-restauración
- Validar que la amenaza está completamente eliminada

FASE 6 — LECCIONES APRENDIDAS:
- Post-mortem: ¿Qué falló? ¿Cómo mejorar?
- Actualizar playbooks con lo aprendido
- Mejorar reglas de detección en SIEM`,
        ejercicio:{
          tipo:'ordenar',
          instruccion:'Ordena correctamente las fases del ciclo NIST',
          fases:['Contención','Detección y Análisis','Recuperación','Preparación','Lecciones Aprendidas','Erradicación'],
          orden_correcto:['Preparación','Detección y Análisis','Contención','Erradicación','Recuperación','Lecciones Aprendidas']
        }
      },
      {
        id:2, titulo:'Clasificación y severidad de incidentes', xp:35,
        teoria:`Clasificar correctamente es una de las habilidades más críticas del analista L1.

NIVELES DE SEVERIDAD:
- 🔴 CRÍTICO — Impacto inmediato en el negocio. Ransomware activo, DC comprometido. Respuesta menor de 15 minutos.
- 🟠 ALTO — Riesgo significativo que puede escalar. Malware detectado, cuentas privilegiadas. Respuesta menor de 1 hora.
- 🟡 MEDIO — Impacto limitado. Malware en endpoint aislado. Respuesta menor de 4 horas.
- 🟢 BAJO — Poco impacto. Escaneo de puertos bloqueado. Respuesta menor de 24 horas.

FACTORES PARA CLASIFICAR:
- ¿Qué sistemas están afectados? DC mayor que servidor mayor que endpoint
- ¿Hay datos sensibles en riesgo?
- ¿El ataque está activo o ya fue contenido?
- ¿Cuántos usuarios y sistemas están afectados?
- ¿Hay impacto en la operativa del negocio?`,
        preguntas:[
          {pregunta:'Ransomware activo en 50 sistemas. ¿Qué severidad?',opciones:['Baja','Media','Alta','Crítica'],correcta:3},
          {pregunta:'Escaneo de puertos bloqueado por firewall. ¿Severidad?',opciones:['Crítica','Alta','Baja','Media'],correcta:2},
          {pregunta:'¿Cuál es el tiempo máximo de respuesta para un incidente CRÍTICO?',opciones:['24 horas','4 horas','1 hora','15 minutos'],correcta:3},
          {pregunta:'Un Domain Controller comprometido se clasifica como...',opciones:['Medio','Bajo','Crítico','Alto'],correcta:2},
          {pregunta:'¿Qué factor NO influye en la severidad?',opciones:['Sistemas afectados','Datos en riesgo','Color del servidor','Si el ataque está activo'],correcta:2},
        ]
      },
      {
        id:3, titulo:'CASO — Respuesta completa a Ransomware', xp:70,
        teoria:`CASO REAL: Ataque de ransomware tipo WannaCry

CRONOLOGÍA DEL INCIDENTE:
- 08:20 — Phishing ejecutado por usuario de contabilidad
- 08:22 — Descarga de payload desde 91.108.4.55
- 08:23 — Explota MS17-010 (EternalBlue) via SMB 445
- 08:25 — Propagación automática a 12 equipos de la red
- 08:47 — Primera alerta en SIEM (27 minutos después)

SEÑALES DETECTADAS:
- Usuario contabilidad: mis archivos tienen extensión .encrypted
- EDR: svchost_update.exe cifrando archivos masivamente
- SIEM: EventID 7045 en 12 equipos (servicio malicioso instalado)
- Red: tráfico SMB masivo interno en puerto 445

TÉCNICAS MITRE:
- T1566.001 — Phishing Attachment (Initial Access)
- T1210 — Exploitation of Remote Services (Lateral Movement)
- T1486 — Data Encrypted for Impact

RESPUESTA EJECUTADA:
- 08:50 — Segmentar red, aislar 12 equipos afectados
- 09:30 — Identificar y eliminar payload
- 12:00 — Restaurar desde backup del domingo
- Semana siguiente — Parchear MS17-010 en toda la red

Coste total: 4 horas de downtime y 4 horas de datos perdidos.`,
        ejercicio:{
          tipo:'caso_practico',
          instruccion:'Responde sobre la gestión del ransomware',
          preguntas:[
            {pregunta:'El ransomware se propaga via SMB 445 explotando MS17-010. ¿Qué contención es más urgente?',opciones:['Apagar todos los servidores','Segmentar la red y bloquear tráfico SMB interno','Formatear un equipo','Llamar al fabricante del antivirus'],correcta:1},
            {pregunta:'27 minutos entre el phishing y la primera alerta. ¿Qué problema revela?',opciones:['El SIEM funciona perfectamente','Gap de detección — el EDR no detectó el payload inicial','Es un tiempo excelente','Los usuarios deben reportar más rápido'],correcta:1},
            {pregunta:'¿Por qué NO apagar inmediatamente los equipos cifrados?',opciones:['Porque tardan en encender','Pueden contener evidencias forenses en RAM','Pueden seguir trabajando','Por política de empresa'],correcta:1},
            {pregunta:'Tras la recuperación, ¿qué es lo primero?',opciones:['Celebrarlo','Monitorización intensiva + parchear MS17-010 en toda la red','Restaurar solo los equipos afectados','Nada más'],correcta:1},
          ]
        }
      },
    ]
  },
  {
    id:4, num:'04', titulo:'Threat Hunting',
    descripcion:'Búsqueda proactiva de amenazas que evaden las defensas automatizadas',
    color:'#F59E0B', colorRgb:'245,158,11', icono:'🎯', xp:260,
    certificado:'Threat Hunter Certificado',
    lecciones:[
      {
        id:1, titulo:'¿Qué es el Threat Hunting?', xp:40,
        teoria:`El Threat Hunting es la búsqueda proactiva de amenazas que han evadido las defensas automatizadas.

DETECCIÓN REACTIVA VS THREAT HUNTING:
- Reactiva — Esperas a que el SIEM o EDR genere una alerta
- Hunting — Buscas activamente sin esperar alertas

¿POR QUÉ ES NECESARIO?
Los atacantes avanzados (APT) pueden permanecer meses en una red sin generar ninguna alerta. El dwell time medio es de 24 días.

PROCESO DE THREAT HUNTING:
- HIPÓTESIS — Creo que hay un atacante usando PowerShell para moverse lateralmente
- INVESTIGACIÓN — Busco en logs PowerShell ejecutándose de forma inusual
- ANÁLISIS — Evalúo los resultados encontrados
- RESPUESTA — Si encuentro algo, inicio el proceso de IR
- MEJORA — Si no encuentro nada, mejoro las detecciones del SIEM

FUENTES DE HIPÓTESIS:
- Nuevas técnicas publicadas en MITRE ATT&CK
- Threat Intelligence (nuevo malware o grupo APT activo)
- Anomalías detectadas en datos históricos
- Cambios en el comportamiento de la red`,
        preguntas:[
          {pregunta:'¿Cuál es la diferencia clave entre detección reactiva y hunting?',opciones:['No hay diferencia','Detección reactiva espera alertas; hunting busca activamente','Hunting es más lento','La detección reactiva es más efectiva'],correcta:1},
          {pregunta:'¿Cuánto tiempo puede pasar un APT sin detectarse (dwell time medio)?',opciones:['1 hora','1 día','24 días','1 año'],correcta:2},
          {pregunta:'El primer paso del proceso de hunting es...',opciones:['Analizar logs','Formular una hipótesis','Instalar herramientas','Escalar al CISO'],correcta:1},
          {pregunta:'¿Qué indica un dwell time largo en una red?',opciones:['Buena seguridad','El atacante ha pasado mucho tiempo sin ser detectado','Muchas alertas generadas','Red de alta disponibilidad'],correcta:1},
        ]
      },
      {
        id:2, titulo:'CASO — Hunting de cuenta comprometida', xp:60,
        teoria:`CASO HUNTING: Detectar cuenta administrativa comprometida

HIPÓTESIS: Un atacante usa credenciales válidas para moverse lateralmente fuera del horario laboral.

QUERY SIEM PARA PROBAR LA HIPÓTESIS:
index=windows EventID=4624 LogonType=3
| eval hour=strftime(_time,"%H")
| where hour<6 OR hour>22
| stats count by user, src_ip, dest
| where count > 3

RESULTADOS SOSPECHOSOS:
- Usuario: svc_backup (cuenta de servicio)
- Horario: 02:14 a 04:37 AM
- IPs origen: 5 IPs internas diferentes
- Destinos: file-server-01, dc-01, hr-server
- Total logins: 47 en 2 horas

ANÁLISIS:
- svc_backup NO debe hacer logins interactivos nunca
- Acceso a DC y HR server — reconocimiento y posible exfiltración
- 5 IPs de origen — movimiento entre equipos
- Horario nocturno — menor vigilancia

CONCLUSIÓN: Cuenta de servicio comprometida.

TÉCNICAS MITRE:
- T1078.002 — Domain Accounts (Persistence)
- T1021.002 — SMB/Windows Admin Shares (Lateral Movement)`,
        ejercicio:{
          tipo:'caso_practico',
          instruccion:'Analiza el caso de hunting',
          preguntas:[
            {pregunta:'svc_backup hace 47 logins interactivos de noche. ¿Es normal?',opciones:['Sí, las cuentas de servicio trabajan de noche','No, las cuentas de servicio nunca deben hacer logins interactivos','Depende de la empresa','Sí si hay backups programados'],correcta:1},
            {pregunta:'¿Qué indica el acceso a DC + HR server desde una cuenta de backup?',opciones:['Backup normal de esos servidores','Reconocimiento y probable exfiltración de datos sensibles','Mantenimiento programado','Error de configuración'],correcta:1},
            {pregunta:'¿Por qué el atacante actúa de noche?',opciones:['Por el huso horario','Menor vigilancia y menor probabilidad de detección','Los sistemas van más rápido de noche','Por costumbre'],correcta:1},
            {pregunta:'Esta actividad no generó alertas automáticas porque...',opciones:['El SIEM está roto','Usa credenciales válidas — técnica living-off-the-land','Los logs se perdieron','El firewall la bloqueó'],correcta:1},
          ]
        }
      },
    ]
  },
  {
    id:5, num:'05', titulo:'Forense Digital',
    descripcion:'Adquisición de evidencias, análisis de disco, memoria RAM y timeline',
    color:'#06B6D4', colorRgb:'6,182,212', icono:'🔬', xp:290,
    certificado:'Analista Forense Digital',
    lecciones:[
      {
        id:1, titulo:'Fundamentos del Forense Digital', xp:45,
        teoria:`El forense digital investiga qué pasó, cómo pasó y quién lo hizo.

PRINCIPIOS FUNDAMENTALES:
- Preservación — Nunca alterar la evidencia original
- Cadena de custodia — Documentar quién maneja qué y cuándo
- Integridad — Verificar con hashes (MD5/SHA256) que nada cambió
- Reproducibilidad — El análisis debe poder repetirse

ORDEN DE VOLATILIDAD — RECOPILAR DE MÁS A MENOS VOLÁTIL:
- Registros CPU y caché
- Memoria RAM (se pierde al apagar el equipo)
- Tráfico de red activo en ese momento
- Disco duro y SSD
- Logs del sistema operativo
- Backups externos

ARTEFACTOS CLAVE EN WINDOWS:
- Prefetch — Lista de programas ejecutados recientemente
- Registry — Configuración del sistema y autorun de malware
- $MFT — Master File Table (todos los archivos del disco)
- Event Logs — Historial de actividad del sistema
- Browser History — Historial de navegación web
- LNK files — Accesos directos que revelan archivos accedidos`,
        preguntas:[
          {pregunta:'¿Por qué recopilar la RAM antes que el disco duro?',opciones:['El disco es más grande','La RAM es más volátil — su contenido se pierde al apagar','La RAM es más fácil de analizar','Por protocolo estándar'],correcta:1},
          {pregunta:'¿Para qué se usan los hashes MD5/SHA256 en forense?',opciones:['Para cifrar evidencias','Para verificar que la evidencia no ha sido alterada','Para comprimir archivos','Para acelerar el análisis'],correcta:1},
          {pregunta:'¿Qué artefacto Windows revela programas ejecutados recientemente?',opciones:['Registry','Prefetch','$MFT','LNK files'],correcta:1},
          {pregunta:'La cadena de custodia en forense sirve para...',opciones:['Organizar archivos','Documentar quién maneja las evidencias y cuándo','Cifrar datos sensibles','Crear backups automáticos'],correcta:1},
        ]
      },
      {
        id:2, titulo:'CASO — Investigar una infección por malware', xp:65,
        teoria:`CASO FORENSE: Investigar RAT en equipo directivo

ARTEFACTOS RECOPILADOS Y ANALIZADOS:

MEMORY DUMP:
- Proceso activo: svchost_update.exe (PID 4821)
- Conexión activa: 185.234.219.56:4444 (C2)
- Strings en memoria: keylogger, upload_data, screenshot

PREFETCH:
- svchost_update.exe ejecutado 14 veces en 3 días
- Primera ejecución: martes 14:23:07

REGISTRY (clave de autorun):
HKCU\Software\Microsoft\Windows\CurrentVersion\Run
WindowsUpdate = C:\Users\director\AppData\Roaming\svchost_update.exe

EVENT LOGS:
- EventID 4688: svchost_update.exe creado POR outlook.exe
- EventID 4698: Tarea programada SysUpdate creada (martes 14:23)

CONCLUSIÓN: Phishing, ejecución de RAT, persistencia via registro y tarea, keylogger activo, exfiltración durante 3 días.`,
        ejercicio:{
          tipo:'caso_practico',
          instruccion:'Responde sobre el análisis forense',
          preguntas:[
            {pregunta:'svchost_update.exe fue creado por outlook.exe (EventID 4688). ¿Qué indica?',opciones:['Actualización normal de Windows','El malware se ejecutó desde un adjunto de email (phishing)','Error del sistema operativo','Instalación de software legítimo'],correcta:1},
            {pregunta:'La clave de registro en CurrentVersion\\Run indica...',opciones:['Que el programa se ejecuta manualmente','Persistencia — el malware arranca automáticamente al iniciar sesión','Un error de Windows','Software legítimo de inicio'],correcta:1},
            {pregunta:'¿Qué revela la conexión activa a 185.234.219.56:4444?',opciones:['Actualización de Windows','Comunicación activa con servidor C2','Backup en la nube','Sincronización de email'],correcta:1},
            {pregunta:'El malware lleva 3 días activo con keylogger. ¿Cuál es el riesgo principal?',opciones:['Que el equipo vaya lento','Que haya capturado y exfiltrado credenciales y datos sensibles durante 3 días','Que ocupe espacio en disco','Que cambie el fondo de pantalla'],correcta:1},
          ]
        }
      },
    ]
  },
  {
    id:6, num:'06', titulo:'Seguridad en Redes Avanzada',
    descripcion:'IDS/IPS, análisis de tráfico, DNS tunneling y detección de C2',
    color:'#10B981', colorRgb:'16,185,129', icono:'🌐', xp:280,
    certificado:'Network Security Analyst',
    lecciones:[
      {
        id:1, titulo:'IDS, IPS y análisis de tráfico', xp:45,
        teoria:`La seguridad de red es la segunda línea de defensa crítica.

IDS — INTRUSION DETECTION SYSTEM:
- Monitoriza el tráfico y genera alertas de actividad sospechosa
- NO bloquea — solo detecta y avisa
- Tipos: NIDS (monitoriza la red) y HIDS (monitoriza el host)

IPS — INTRUSION PREVENTION SYSTEM:
- Monitoriza el tráfico y bloquea el tráfico malicioso
- Se despliega inline en el flujo de tráfico
- Puede generar falsos positivos que interrumpan el servicio

FILTROS ÚTILES EN WIRESHARK:
- ip.src == 192.168.1.100 — Tráfico desde IP específica
- tcp.port == 4444 — Puerto C2 típico de Metasploit
- dns — Ver todas las consultas DNS realizadas
- http.request.method == POST — Posible exfiltración via HTTP

SEÑALES DE TRÁFICO MALICIOSO:
- 🔴 Conexiones a puertos altos inusuales (1234, 4444, 9999)
- 🔴 Beacon traffic — conexiones regulares cada X segundos exactos
- 🔴 DNS queries con subdominios muy largos
- 🔴 Volumen anómalo de datos saliendo de la red
- 🔴 Protocolos en puertos incorrectos`,
        preguntas:[
          {pregunta:'¿Cuál es la diferencia entre IDS e IPS?',opciones:['Son lo mismo','IDS detecta y alerta; IPS detecta y bloquea','IPS detecta, IDS bloquea','IDS es tecnología más nueva'],correcta:1},
          {pregunta:'Tráfico que se conecta al exterior cada 30 segundos exactos. ¿Qué indica?',opciones:['Sincronización de hora NTP','Beacon traffic — probable comunicación con C2','Backup automático','Actualización de antivirus'],correcta:1},
          {pregunta:'¿Qué son las DGA (Domain Generation Algorithms)?',opciones:['Herramientas de DNS','Malware que genera dominios aleatorios para C2','Protocolo de seguridad','Tipo de firewall avanzado'],correcta:1},
          {pregunta:'Filtro Wireshark "tcp.port == 4444" sirve para...',opciones:['Ver tráfico web','Ver tráfico en puerto 4444 — típico de reverse shells','Filtrar consultas DNS','Ver emails en texto plano'],correcta:1},
        ]
      },
      {
        id:2, titulo:'CASO — Detectar exfiltración via DNS', xp:65,
        teoria:`CASO REAL: DNS Tunneling para exfiltrar datos

DNS TUNNELING: Los datos robados se codifican en Base64 y se incrustan en subdominios de consultas DNS.

ANOMALÍAS DETECTADAS EN LOGS DNS:
- 09:14:23 — dGhpcyBpcyBzZWNyZXQgZGF0YQ.evil-corp.xyz
- 09:14:24 — c2Vuc2l0aXZlIGluZm9ybWF0aW9u.evil-corp.xyz
- 09:14:25 — cGFzc3dvcmRzIGFuZCBrZXlz.evil-corp.xyz
- 847 queries al mismo dominio en 3 minutos

SEÑALES DE ALERTA:
- Subdominio con más de 50 caracteres — datos en Base64
- 847 queries en 3 minutos — volumen anómalo
- Dominio evil-corp.xyz no está en whitelist corporativa
- Todas las queries desde DESKTOP-HR-02

DECODIFICANDO BASE64:
- dGhpcyBpcyBzZWNyZXQgZGF0YQ == this is secret data
- cGFzc3dvcmRzIGFuZCBrZXlz == passwords and keys

CONCLUSIÓN: Exfiltración activa via DNS tunneling desde equipo de RRHH.`,
        ejercicio:{
          tipo:'caso_practico',
          instruccion:'Analiza el caso de DNS tunneling',
          preguntas:[
            {pregunta:'847 consultas DNS al mismo dominio en 3 minutos. ¿Qué indica?',opciones:['Navegación web normal','DNS Tunneling — datos exfiltrados codificados en consultas DNS','Caché DNS llena','Problema de conectividad'],correcta:1},
            {pregunta:'Los subdominios tienen más de 50 caracteres en Base64. ¿Por qué?',opciones:['Nombres de dominio largos son normales','Los datos robados se codifican en Base64 dentro del subdominio','Error de configuración DNS','Política de naming corporativa'],correcta:1},
            {pregunta:'¿Cómo detendrías esta exfiltración inmediatamente?',opciones:['Reiniciar el servidor DNS','Bloquear evil-corp.xyz en el firewall y aislar DESKTOP-HR-02','Limpiar la caché DNS','Desactivar DNS en toda la red'],correcta:1},
            {pregunta:'¿Qué control preventivo hubiera detectado esto antes?',opciones:['Antivirus actualizado','DNS filtering con whitelist de dominios aprobados','Firewall de aplicación web','VPN obligatoria para todos'],correcta:1},
          ]
        }
      },
    ]
  },
  {
    id:7, num:'07', titulo:'Cloud Security',
    descripcion:'AWS/Azure, logs cloud, IAM, ataques y detección en entornos cloud',
    color:'#3B82F6', colorRgb:'59,130,246', icono:'☁️', xp:300,
    certificado:'Cloud Security Analyst',
    lecciones:[
      {
        id:1, titulo:'Fundamentos de seguridad cloud', xp:50,
        teoria:`El cloud ha transformado el SOC. Los ataques y defensas son diferentes.

MODELO DE RESPONSABILIDAD COMPARTIDA:
- Cloud Provider — Seguridad DE la infraestructura física
- Cliente — Seguridad EN la infraestructura (datos, configs, accesos)

LOGS ESENCIALES EN AWS:
- CloudTrail — Registra todas las llamadas a la API (quién hizo qué)
- VPC Flow Logs — Todo el tráfico de red
- GuardDuty — Detección automática de amenazas

LOGS ESENCIALES EN AZURE:
- Azure Monitor / Log Analytics — Logs centralizados
- Azure AD Sign-In Logs — Autenticación de usuarios
- Microsoft Defender for Cloud — Alertas de seguridad

IAM — IDENTITY AND ACCESS MANAGEMENT:
- Principio de mínimo privilegio — Solo los permisos necesarios
- MFA obligatorio para todas las cuentas privilegiadas
- Revisar y rotar credenciales periódicamente

ATAQUES CLOUD MÁS FRECUENTES:
- Credential stuffing — Robo de credenciales de consola cloud
- Misconfigured S3 buckets — Datos públicos por error de configuración
- IAM privilege escalation — Escalar permisos via roles mal configurados
- Cryptojacking — Usar recursos comprometidos para minar criptomonedas`,
        preguntas:[
          {pregunta:'¿Qué servicio AWS registra todas las llamadas a la API?',opciones:['VPC Flow Logs','CloudTrail','S3','EC2'],correcta:1},
          {pregunta:'¿Qué es el principio de mínimo privilegio en IAM?',opciones:['Dar acceso admin a todos','Dar solo los permisos mínimos necesarios para cada rol','No usar contraseñas','Usar un solo usuario para todo'],correcta:1},
          {pregunta:'¿Qué es el cryptojacking en cloud?',opciones:['Robo de criptomonedas','Usar recursos cloud comprometidos para minar criptomonedas','Ataque de DDoS','Phishing en cloud'],correcta:1},
          {pregunta:'Un bucket S3 con acceso público contiene datos de clientes. ¿Qué fallo es?',opciones:['Fallo del proveedor cloud','Misconfiguration — responsabilidad del cliente','Ataque de hackers externos','Error de red'],correcta:1},
        ]
      },
      {
        id:2, titulo:'CASO — Escalada de privilegios en AWS', xp:70,
        teoria:`CASO REAL: Cuenta AWS comprometida y cryptojacking

ALERTA GUARDDUTY:
- UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B
- Usuario IAM: dev-user-03
- IP origen: 185.220.101.45 (Tor Exit Node)
- Hora: 03:42 AM

ACCIONES POST-LOGIN (CloudTrail):
- 03:42 — ConsoleLogin exitoso
- 03:43 — ListRoles (reconocimiento de permisos disponibles)
- 03:44 — AttachUserPolicy — AdministratorAccess (ESCALADA)
- 03:45 — CreateUser backup-admin (backdoor creado)
- 03:46 — CreateAccessKey para backup-admin
- 03:47 — RunInstances x50 EC2 (cryptojacking iniciado)

ANÁLISIS:
- Tor — anonimización intencional
- ListRoles primero — reconocimiento típico post-compromiso
- AttachUserPolicy:AdministratorAccess — escalada de privilegios
- CreateUser backup-admin — backdoor persistente
- 50 EC2 instances — miles de euros por hora en cryptojacking`,
        ejercicio:{
          tipo:'caso_practico',
          instruccion:'Analiza el compromiso de AWS',
          preguntas:[
            {pregunta:'AttachUserPolicy:AdministratorAccess. ¿Qué intenta el atacante?',opciones:['Auditar la cuenta','Escalar privilegios para tener acceso total a AWS','Crear backups de seguridad','Revisar la facturación'],correcta:1},
            {pregunta:'¿Por qué crea el usuario backup-admin?',opciones:['Para hacer backups reales','Backdoor — si revocan al usuario original, mantiene acceso','Es una cuenta de servicio necesaria','Por política de AWS'],correcta:1},
            {pregunta:'Primera acción de respuesta ante este incidente...',opciones:['Esperar confirmación','Deshabilitar dev-user-03 y backup-admin + revocar todas las access keys','Revisar las instancias EC2 lanzadas','Contactar a AWS Support primero'],correcta:1},
            {pregunta:'¿Qué control preventivo hubiera evitado la escalada?',opciones:['MFA en el login','SCPs limitando AttachUserPolicy a roles específicos','CloudTrail activo','VPN obligatoria'],correcta:1},
          ]
        }
      },
    ]
  },
  {
    id:8, num:'08', titulo:'Automatización y Scripting',
    descripcion:'Python para SOC, automatización de tareas repetitivas y SOAR',
    color:'#F97316', colorRgb:'249,115,22', icono:'🤖', xp:280,
    certificado:'SOC Automation Specialist',
    lecciones:[
      {
        id:1, titulo:'Python para analistas SOC', xp:50,
        teoria:`Python es la herramienta de automatización del analista moderno.

CASOS DE USO REALES EN SOC:
- Parsear y analizar miles de logs automáticamente
- Buscar IOCs automáticamente en VirusTotal y AbuseIPDB
- Generar reportes de incidentes en formato estándar
- Enriquecer alertas del SIEM con Threat Intelligence
- Automatizar respuestas repetitivas (SOAR casero)

SCRIPT REAL — VERIFICAR REPUTACIÓN DE IPS:
import requests

def check_ip_reputation(ip):
    url = "https://api.abuseipdb.com/api/v2/check"
    headers = {"Key": "TU_API_KEY", "Accept": "application/json"}
    params = {"ipAddress": ip, "maxAgeInDays": 90}
    r = requests.get(url, headers=headers, params=params)
    return r.json()["data"]["abuseConfidenceScore"]

with open("failed_logins.txt") as f:
    ips = [line.split()[0] for line in f]

for ip in set(ips):
    score = check_ip_reputation(ip)
    if score > 50:
        print(f"ALERTA IP maliciosa: {ip} — Score: {score}")

REGEX PARA EXTRAER IOCS:
import re
ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
hash_pattern = r'\b[a-fA-F0-9]{64}\b'
ips_encontradas = re.findall(ip_pattern, texto_del_log)`,
        preguntas:[
          {pregunta:'¿Para qué usarías Python en un SOC?',opciones:['Crear aplicaciones web','Automatizar análisis de logs, IOC lookup y reportes','Diseñar interfaces gráficas','Gestionar bases de datos SQL'],correcta:1},
          {pregunta:'¿Qué permite la API de AbuseIPDB?',opciones:['Bloquear IPs automáticamente','Consultar reputación y score de abuso de una IP','Escanear puertos remotos','Ver logs de Windows directamente'],correcta:1},
          {pregunta:'SOAR significa...',opciones:['Security Orchestration Automation and Response','System Operations and Reporting','Security Online Alert Response','Standard Operations Automation Rule'],correcta:0},
          {pregunta:'"re.findall(ip_pattern, log_text)" en Python sirve para...',opciones:['Borrar IPs del log','Extraer todas las IPs que coincidan con el patrón','Bloquear las IPs encontradas','Contar el número de logs'],correcta:1},
        ]
      },
    ]
  },
  {
    id:9, num:'09', titulo:'Análisis de Malware',
    descripcion:'Análisis estático y dinámico, sandbox, comportamiento e IOCs de malware',
    color:'#DC2626', colorRgb:'220,38,38', icono:'🦠', xp:290,
    certificado:'Malware Analyst',
    lecciones:[
      {
        id:1, titulo:'Análisis estático vs dinámico', xp:55,
        teoria:`El análisis de malware determina exactamente qué hace un archivo malicioso.

ANÁLISIS ESTÁTICO — SIN EJECUTAR EL MALWARE:
- Calcular hash SHA256 y buscar en VirusTotal
- Strings — Extraer texto legible: URLs, IPs, mensajes de error
- PE Headers — Metadatos del ejecutable Windows
- Imports — Funciones de Windows que usa el malware
- Detección de packers u ofuscación

FUNCIONES WINDOWS MÁS SOSPECHOSAS:
- 🔴 CreateRemoteThread — Inyección de código en otros procesos
- 🔴 VirtualAllocEx — Reserva memoria en proceso ajeno
- 🔴 WriteProcessMemory — Escribe código en proceso ajeno
- 🔴 RegSetValueEx — Modifica registro (persistencia)
- 🔴 WinExec o CreateProcess — Ejecuta comandos del sistema
- 🔴 InternetOpen o Connect — Conexiones de red (C2)

ANÁLISIS DINÁMICO — EJECUTAR EN SANDBOX:
- Sandbox: Any.run, Cuckoo Sandbox, Joe Sandbox
- Se observa el comportamiento real en tiempo de ejecución
- Se capturan procesos creados, conexiones de red, cambios de registro

INDICADORES DE COMPORTAMIENTO MALICIOSO:
- Se copia a sí mismo en múltiples ubicaciones del disco
- Se inyecta en procesos legítimos (svchost.exe, explorer.exe)
- Realiza conexiones a IPs o dominios externos desconocidos
- Modifica claves de autorun en el registro de Windows
- Cifra archivos del usuario (ransomware)`,
        preguntas:[
          {pregunta:'¿Qué es el análisis estático de malware?',opciones:['Ejecutar el malware en entorno controlado','Analizar el archivo sin ejecutarlo','Analizar el tráfico de red del malware','Estudiar el código fuente'],correcta:1},
          {pregunta:'La función Windows "CreateRemoteThread" indica...',opciones:['Creación de hilos normales de ejecución','Posible inyección de código en otro proceso','Conexión a internet','Creación de archivos en disco'],correcta:1},
          {pregunta:'¿Qué herramienta usarías para análisis dinámico automatizado?',opciones:['VirusTotal para análisis estático','Sandbox (Any.run, Cuckoo)','Wireshark exclusivamente','Splunk SIEM'],correcta:1},
          {pregunta:'Un malware que se inyecta en svchost.exe está usando...',opciones:['Persistencia de registro','Process Injection para ocultarse en proceso legítimo','DNS Tunneling','Phishing'],correcta:1},
        ]
      },
    ]
  },
  {
    id:10, num:'10', titulo:'Red Team Basics',
    descripcion:'Piensa como atacante para defender mejor: Kill Chain, Nmap, reconocimiento',
    color:'#A78BFA', colorRgb:'167,139,250', icono:'⚔️', xp:310,
    certificado:'Red Team Awareness',
    lecciones:[
      {
        id:1, titulo:'La Cyber Kill Chain — Mentalidad del atacante', xp:55,
        teoria:`Un buen defensor debe entender cómo piensa y actúa el atacante.

CYBER KILL CHAIN — LAS 7 FASES DE UN ATAQUE:
- RECONOCIMIENTO — Recopilar información del objetivo (LinkedIn, Shodan, WHOIS)
- WEAPONIZATION — Preparar el arma de ataque (crear malware, exploit)
- DELIVERY — Entregar el arma al objetivo (phishing, USB malicioso)
- EXPLOITATION — Explotar la vulnerabilidad (RCE, buffer overflow)
- INSTALLATION — Instalar persistencia (RAT, backdoor, rootkit)
- COMMAND AND CONTROL — Establecer canal de comunicación remota
- ACTIONS ON OBJECTIVES — Ejecutar el objetivo final (robar datos, cifrar)

HERRAMIENTAS DE RECONOCIMIENTO:
- Nmap — Escaneo de puertos y detección de servicios
- Shodan — Encontrar dispositivos expuestos en internet
- TheHarvester — Emails, subdominios e IPs de un dominio

EJEMPLO NMAP:
nmap -sV -O 192.168.1.0/24`,
        preguntas:[
          {pregunta:'¿Cuál es la fase "Delivery" en la Kill Chain?',opciones:['Preparar el malware','Establecer canal C2','Entregar el arma al objetivo (phishing, USB)','Robar datos finales'],correcta:2},
          {pregunta:'Nmap se usa principalmente para...',opciones:['Análisis de malware','Escaneo de puertos y detección de servicios','Análisis forense de disco','Gestión de logs SIEM'],correcta:1},
          {pregunta:'¿Para qué sirve el reconocimiento pasivo?',opciones:['Explotar vulnerabilidades directamente','Recopilar información sin interactuar directamente con el objetivo','Instalar backdoors en el sistema','Crear exploits personalizados'],correcta:1},
          {pregunta:'La fase C2 (Command and Control) permite al atacante...',opciones:['Entrar al sistema por primera vez','Controlar el malware instalado de forma remota','Cifrar todos los datos del objetivo','Hacer el reconocimiento inicial'],correcta:1},
        ]
      },
    ]
  },
  {
    id:11, num:'11', titulo:'Gestión de Alertas y Fatiga SOC',
    descripcion:'Alert fatigue, priorización inteligente y optimización de reglas SIEM',
    color:'#F59E0B', colorRgb:'245,158,11', icono:'🧠', xp:240,
    certificado:'SOC Operations Expert',
    lecciones:[
      {
        id:1, titulo:'Alert Fatigue — El mayor enemigo del SOC', xp:50,
        teoria:`La fatiga de alertas es uno de los problemas más críticos y subestimados en los SOC modernos.

EL PROBLEMA EN NÚMEROS:
- Un SOC medio recibe más de 10.000 alertas diarias
- El 45% son falsos positivos según estudios del sector
- Los analistas se vuelven insensibles y empiezan a ignorar alertas
- Resultado: incidentes reales no detectados a tiempo

CAUSAS PRINCIPALES:
- Reglas SIEM demasiado amplias o mal calibradas
- Demasiadas herramientas generando alertas duplicadas
- Sin contextualización ni priorización automática
- Falta de tuning periódico de las reglas existentes

SOLUCIONES PROBADAS:

TUNING DE REGLAS SIEM:
- Antes: 1 login fallido = alerta (miles de alertas diarias)
- Después: más de 20 logins fallidos en 1 minuto = alerta (señal real)

PRIORIZACIÓN INTELIGENTE:
- Login fallido en endpoint usuario = baja prioridad
- Login fallido en Domain Controller = alta prioridad

REDUCIR FALSOS POSITIVOS:
- Whitelists de IPs, usuarios y comportamientos legítimos conocidos
- Correlación de múltiples eventos antes de generar la alerta

AUTOMATIZACIÓN CON SOAR:
- Enriquecer alertas automáticamente con Threat Intelligence
- Cerrar automáticamente FPs conocidos y documentados
- Solo escalar al analista lo que realmente necesita análisis humano`,
        preguntas:[
          {pregunta:'¿Qué porcentaje aproximado de alertas SOC son falsos positivos?',opciones:['5%','15%','45%','80%'],correcta:2},
          {pregunta:'La alert fatigue provoca que los analistas...',opciones:['Trabajen más eficientemente','Se vuelvan insensibles e ignoren alertas reales','Detecten más incidentes','Reduzcan el tiempo de respuesta'],correcta:1},
          {pregunta:'¿Qué es el tuning de reglas SIEM?',opciones:['Actualizar el software del SIEM','Ajustar umbrales y condiciones para reducir falsos positivos','Añadir más reglas de detección','Eliminar todas las reglas existentes'],correcta:1},
          {pregunta:'Una whitelist en SIEM sirve para...',opciones:['Bloquear IPs maliciosas conocidas','Excluir comportamientos legítimos conocidos de las alertas','Aumentar el número de alertas','Crear nuevas reglas de detección'],correcta:1},
        ]
      },
    ]
  },
  {
    id:12, num:'12', titulo:'Certificación Final SOC',
    descripcion:'Simulación completa: 10 alertas simultáneas, tiempo limitado, evaluación total',
    color:'#4ADE80', colorRgb:'74,222,128', icono:'🏆', xp:500,
    certificado:'SOC Analyst Profesional — Certificado',
    lecciones:[
      {
        id:1, titulo:'Simulacro Final — Gestión de incidente múltiple', xp:500,
        teoria:`SIMULACRO FINAL: Eres el analista de guardia. Son las 23:47. Se disparan 10 alertas.

USA TODO LO APRENDIDO EN LOS 11 MÓDULOS ANTERIORES.

ALERTAS ACTIVAS EN ESTE MOMENTO:
- 1. CRÍTICA — 1847 EventID 4625 hacia CORP-DC01 desde 185.220.101.45
- 2. CRÍTICA — EDR: svchost.exe lanza cmd.exe lanza powershell -enc base64
- 3. ALTA — DNS: 847 queries a random-xyz.evil en 3 minutos
- 4. ALTA — Nuevo usuario admin creado: backup_svc
- 5. MEDIA — 50 instancias EC2 lanzadas en AWS a las 23:45
- 6. MEDIA — RDP desde IP de Tor hacia servidor de contabilidad
- 7. BAJA — Escaneo de puertos desde 10.0.0.45 (interno)
- 8. BAJA — 3 intentos fallidos VPN (usuario: jgarcia)
- 9. INFO — Antivirus actualizado en 200 equipos
- 10. INFO — Certificado SSL caducado en web corporativa

CLAVES PARA RESOLVERLO:
- Prioriza por impacto real en el negocio
- Correlaciona: alertas 1, 2 y 4 pueden ser el mismo ataque
- Distingue incidentes reales de ruido operativo
- Las alertas INFO no requieren investigación inmediata
- El DC comprometido es siempre máxima prioridad`,
        ejercicio:{
          tipo:'caso_practico',
          instruccion:'Simulacro final — gestiona las 10 alertas correctamente',
          preguntas:[
            {pregunta:'¿Cuál es la PRIMERA alerta que debes investigar?',opciones:['Certificado SSL caducado','Antivirus actualizado en 200 equipos','1847 logins fallidos en el Domain Controller','3 intentos fallidos de VPN'],correcta:2},
            {pregunta:'Alertas 1 (brute force DC) + 2 (powershell malicioso) + 4 (nuevo admin). Probablemente son...',opciones:['Tres incidentes completamente independientes','Un único ataque coordinado en progreso activo','Falsos positivos de mantenimiento','Pruebas del equipo de desarrollo'],correcta:1},
            {pregunta:'Alerta 9: antivirus actualizado en 200 equipos. ¿Qué haces?',opciones:['Investigar urgentemente','Escalar al CISO inmediatamente','Cerrar como informativa — actividad legítima programada','Aislar los 200 equipos preventivamente'],correcta:2},
            {pregunta:'Alertas 3 (DNS tunneling) + 5 (50 EC2 en AWS) pueden indicar...',opciones:['Mantenimiento normal de infraestructura','Exfiltración activa + cryptojacking — atacante con acceso a red y cloud','Actualizaciones programadas del equipo de sistemas','Pruebas de carga del equipo de desarrollo'],correcta:1},
            {pregunta:'Primera acción con alerta 2 (powershell -enc base64)...',opciones:['Ignorar — PowerShell es normal en Windows','Decodificar el Base64, aislar el equipo e investigar el proceso padre','Reiniciar el equipo afectado','Actualizar el antivirus en ese equipo'],correcta:1},
          ]
        }
      },
    ]
  },
];

const CURSOS = [
  {
    id:1, titulo:'SOC Fundamentals', subtitulo:'De cero a analista L1',
    descripcion:'Aprende los fundamentos de ciberseguridad, redes, logs, el rol del SOC y cómo responder a tus primeros incidentes reales.',
    color:'#2564F1', colorRgb:'37,100,241', icono:'🛡️',
    moduloIds:[1,2,3,4], nivel:'Principiante', duracion:'~8 horas',
    certificado:'SOC Fundamentals Certificate',
  },
  {
    id:2, titulo:'Detection & Analysis', subtitulo:'Detecta y analiza amenazas reales',
    descripcion:'Domina el forense digital, seguridad en redes, cloud security y la automatización con Python para operar como analista L2.',
    color:'#7C3AED', colorRgb:'124,58,237', icono:'🔍',
    moduloIds:[5,6,7,8], nivel:'Intermedio', duracion:'~10 horas',
    certificado:'Detection & Analysis Certificate',
  },
  {
    id:3, titulo:'Advanced SOC Operations', subtitulo:'Nivel profesional L2/L3',
    descripcion:'Análisis de malware, red team awareness, gestión de fatiga de alertas y el simulacro final de certificación profesional.',
    color:'#EF4444', colorRgb:'239,68,68', icono:'⚔️',
    moduloIds:[9,10,11,12], nivel:'Avanzado', duracion:'~12 horas',
    certificado:'Advanced SOC Operations Certificate',
  },
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

  const saveCompletadas  = arr => { setCompletadas(arr);  localStorage.setItem('socblast_training_completadas',  JSON.stringify(arr)); };
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
    .fade-up{animation:fadeUp 0.35s ease forwards;}
    .card-hover:hover{transform:translateY(-4px)!important;box-shadow:0 20px 56px rgba(0,0,0,.7)!important;}
    .lesson-row:hover{background:rgba(59,123,245,0.04)!important;border-color:rgba(59,123,245,0.22)!important;}
    .opt-btn:hover{border-color:rgba(59,123,245,0.38)!important;}
    .nav-btn:hover{color:${T1}!important;}
    *{transition:transform .18s ease,box-shadow .18s ease,border-color .14s ease,background .14s ease,color .14s ease;}
    ::-webkit-scrollbar{width:5px;}
    ::-webkit-scrollbar-track{background:${BG};}
    ::-webkit-scrollbar-thumb{background:${BD2};border-radius:3px;}
  `;

  // ── CERTIFICADO MODAL ──────────────────────────────────────────────────────
  if (mostrarCert) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', backgroundColor:BG, display:'flex', alignItems:'center', justifyContent:'center', padding:'28px', fontFamily:"system-ui,sans-serif" }}>
        <div style={{ maxWidth:'520px', width:'100%', animation:'certIn .45s ease forwards' }}>
          <div style={{ padding:'52px 44px', borderRadius:'20px', backgroundColor:CARD, border:`1px solid rgba(240,180,41,0.28)`, textAlign:'center', position:'relative', overflow:'hidden', boxShadow:`0 0 80px rgba(240,180,41,0.07), 0 40px 80px rgba(0,0,0,0.6)` }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,transparent,${GOLD},transparent)` }}/>
            {/* Esquinas decorativas */}
            {[{top:'18px',left:'18px',bt:'1px',bl:'1px'},{top:'18px',right:'18px',bt:'1px',br:'1px'},{bottom:'18px',left:'18px',bb:'1px',bl:'1px'},{bottom:'18px',right:'18px',bb:'1px',br:'1px'}].map((s,i)=>(
              <div key={i} style={{ position:'absolute', width:'18px', height:'18px', ...Object.fromEntries(Object.entries(s).filter(([k])=>!['bt','bl','br','bb'].includes(k)).map(([k,v])=>[k,v])), borderTop:s.bt?`1px solid rgba(240,180,41,0.35)`:undefined, borderBottom:s.bb?`1px solid rgba(240,180,41,0.35)`:undefined, borderLeft:s.bl?`1px solid rgba(240,180,41,0.35)`:undefined, borderRight:s.br?`1px solid rgba(240,180,41,0.35)`:undefined }}/>
            ))}
            <div style={{ width:'60px', height:'60px', borderRadius:'50%', backgroundColor:'rgba(240,180,41,0.09)', border:`1px solid rgba(240,180,41,0.25)`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 22px', fontSize:'26px' }}>🏅</div>
            <p style={{ fontSize:'10px', color:GOLD, fontFamily:"'Courier New',monospace", fontWeight:700, letterSpacing:'4px', marginBottom:'14px' }}>CERTIFICADO DE COMPLETACIÓN</p>
            <h1 style={{ fontSize:'24px', fontWeight:700, color:T1, marginBottom:'8px', letterSpacing:'-0.3px', lineHeight:1.3 }}>{mostrarCert.titulo}</h1>
            <p style={{ fontSize:'14px', color:T3, marginBottom:'5px' }}>{mostrarCert.modulo}</p>
            <p style={{ fontSize:'11px', color:T3, fontFamily:"'Courier New',monospace", marginBottom:'30px' }}>SocBlast · {mostrarCert.fecha}</p>
            <div style={{ width:'100%', height:'1px', backgroundColor:BD, marginBottom:'26px' }}/>
            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={() => { setMostrarCert(null); setVista('modulos'); }} style={{ flex:1, padding:'13px', borderRadius:'10px', backgroundColor:ACC, border:'none', color:T1, fontWeight:600, fontSize:'14px', cursor:'pointer' }}>Continuar →</button>
              <button onClick={() => { setMostrarCert(null); navigate('/perfil'); }} style={{ flex:1, padding:'13px', borderRadius:'10px', backgroundColor:'transparent', border:`1px solid ${BD2}`, color:T2, fontSize:'14px', cursor:'pointer' }}>Ver en perfil</button>
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
        <div style={{ minHeight:'100vh', backgroundColor:BG, fontFamily:"system-ui,sans-serif", color:T1 }}>
          <Navbar titulo={leccionActiva.titulo} back={() => { setVista('modulos'); setLeccionActiva(null); }} right={`+${leccionActiva.xp} XP`} onLogoClick={() => navigate('/')}/>
          <div style={{ maxWidth:'780px', margin:'0 auto', padding:'36px 40px 80px' }}>

            {/* Tabs */}
            <div style={{ display:'flex', gap:'4px', marginBottom:'32px', padding:'4px', backgroundColor:'rgba(10,18,35,0.8)', borderRadius:'12px', border:`1px solid ${BD}` }}>
              {['teoria','practica'].map(f => (
                <div key={f} onClick={() => f==='teoria' && setFase('teoria')}
                  style={{ flex:1, padding:'10px', borderRadius:'9px', textAlign:'center', fontSize:'11px', fontWeight:700, letterSpacing:'2px', fontFamily:"'Courier New',monospace", cursor:'pointer', backgroundColor:fase===f?CARD:'transparent', color:fase===f?T1:T3, border:fase===f?`1px solid ${BD2}`:'1px solid transparent', boxShadow:fase===f?'0 2px 10px rgba(0,0,0,0.4)':'none' }}>
                  {f==='teoria' ? (fase==='practica'?'✓ TEORÍA':'TEORÍA') : (tieneCaso?'CASO PRÁCTICO':'PRÁCTICA')}
                </div>
              ))}
            </div>

            {/* TEORÍA */}
            {fase==='teoria' && (
              <div className="fade-up">
                {imgQuery && <LeccionImagen query={imgQuery}/>}
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px' }}>
                  <div style={{ width:'3px', height:'26px', borderRadius:'2px', backgroundColor:modColor }}/>
                  <h2 style={{ fontSize:'21px', fontWeight:700, color:T1, letterSpacing:'-0.4px' }}>{leccionActiva.titulo}</h2>
                </div>
                <div style={{ marginBottom:'28px' }}>
                  <TeoriaVisual texto={leccionActiva.teoria}/>
                </div>
                <button onClick={() => setFase('practica')}
                  style={{ width:'100%', padding:'17px', borderRadius:'12px', background:`linear-gradient(135deg,${modColor}dd,${modColor}88)`, border:'none', color:T1, fontWeight:700, fontSize:'15px', cursor:'pointer', letterSpacing:'0.3px', boxShadow:`0 4px 20px ${modColor}25` }}>
                  {tieneCaso ? 'Ir al Caso Práctico →' : 'Ir a la Práctica →'}
                </button>
              </div>
            )}

            {/* PRÁCTICA */}
            {fase==='practica' && (
              <div className="fade-up">
                <div style={{ padding:'16px 20px', borderRadius:'11px', backgroundColor:`${modColor}08`, border:`1px solid ${modColor}18`, marginBottom:'24px', display:'flex', alignItems:'center', gap:'13px' }}>
                  <div style={{ width:'38px', height:'38px', borderRadius:'9px', backgroundColor:`${modColor}13`, border:`1px solid ${modColor}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>
                    {tieneCaso?'⚡':'📝'}
                  </div>
                  <div>
                    <p style={{ fontSize:'12px', fontWeight:700, color:T1, marginBottom:'2px', fontFamily:"'Courier New',monospace", letterSpacing:'1px' }}>
                      {tieneCaso?'CASO PRÁCTICO — TOMA DE DECISIONES REAL':'TEST DE CONOCIMIENTOS'}
                    </p>
                    <p style={{ fontSize:'11px', color:T3, fontFamily:"'Courier New',monospace" }}>
                      {pregsPractica.length} {tieneCaso?'escenarios':'preguntas'} · Mínimo 60% para superar
                    </p>
                  </div>
                </div>

                {/* Test / Caso */}
                {(tieneTest || tieneCaso) && (
                  <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'18px' }}>
                    {pregsPractica.map((p,i) => (
                      <div key={i} style={{ borderRadius:'13px', backgroundColor:CARD, border:`1px solid ${BD}`, overflow:'hidden' }}>
                        {tieneCaso && <div style={{ height:'2px', background:`linear-gradient(90deg,${RED}55,transparent)` }}/>}
                        <div style={{ padding:'20px 22px' }}>
                          <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', marginBottom:'16px' }}>
                            <div style={{ width:'26px', height:'26px', borderRadius:'7px', backgroundColor:`${ACC}10`, border:`1px solid ${ACC}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <span style={{ fontSize:'11px', fontWeight:700, color:ACC, fontFamily:"'Courier New',monospace" }}>{i+1}</span>
                            </div>
                            <p style={{ fontSize:'15px', color:T1, fontWeight:500, lineHeight:1.65 }}>{p.pregunta}</p>
                          </div>
                          <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                            {p.opciones.map((op,j) => {
                              let bg='rgba(6,12,24,0.8)', border=BD, color=T2, icon=null;
                              if (testEnviado) {
                                if (j===p.correcta)            { bg='rgba(34,211,160,0.06)'; border='rgba(34,211,160,0.28)'; color=GREEN; icon='✓'; }
                                else if (respuestasTest[i]===j){ bg='rgba(240,80,112,0.06)'; border='rgba(240,80,112,0.22)'; color=RED;   icon='✗'; }
                              } else if (respuestasTest[i]===j){ bg=`${ACC}0e`; border=`${ACC}38`; color=T1; }
                              return (
                                <button key={j} className="opt-btn" onClick={() => !testEnviado && setRespuestasTest(p=>({...p,[i]:j}))}
                                  style={{ padding:'12px 16px', borderRadius:'9px', backgroundColor:bg, border:`1px solid ${border}`, color, fontSize:'14px', cursor:testEnviado?'default':'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'11px' }}>
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
                    <div style={{ padding:'12px 16px', borderRadius:'9px', backgroundColor:`${ACC}07`, border:`1px solid ${ACC}18`, marginBottom:'16px' }}>
                      <p style={{ fontSize:'11px', color:ACC, fontFamily:"'Courier New',monospace", fontWeight:700, letterSpacing:'1.5px' }}>CLASIFICAR — {leccionActiva.ejercicio.instruccion?.toUpperCase()}</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'9px', marginBottom:'18px' }}>
                      {leccionActiva.ejercicio.items.map((item,i) => {
                        const ok   = testEnviado && clasificaciones[item.texto]===item.categoria;
                        const fail = testEnviado && clasificaciones[item.texto] && clasificaciones[item.texto]!==item.categoria;
                        return (
                          <div key={i} style={{ padding:'15px 18px', borderRadius:'11px', backgroundColor:ok?'rgba(34,211,160,0.05)':fail?'rgba(240,80,112,0.05)':CARD, border:`1px solid ${ok?'rgba(34,211,160,0.22)':fail?'rgba(240,80,112,0.18)':BD}` }}>
                            <p style={{ fontSize:'14px', color:T1, marginBottom:'10px' }}>{item.texto}</p>
                            {testEnviado
                              ? <p style={{ fontSize:'12px', color:ok?GREEN:RED, fontFamily:"'Courier New',monospace" }}>{ok?`✓ ${item.categoria}`:`✗ Tu respuesta: ${clasificaciones[item.texto]||'—'} · Correcto: ${item.categoria}`}</p>
                              : <select value={clasificaciones[item.texto]||''} onChange={e=>setClasificaciones(p=>({...p,[item.texto]:e.target.value}))}
                                  style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', backgroundColor:'rgba(6,12,24,0.9)', border:`1px solid ${BD2}`, color:T2, fontSize:'13px', outline:'none', fontFamily:"'Courier New',monospace" }}>
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
                    <div style={{ padding:'12px 16px', borderRadius:'9px', backgroundColor:`${GOLD}07`, border:`1px solid ${GOLD}18`, marginBottom:'16px' }}>
                      <p style={{ fontSize:'11px', color:GOLD, fontFamily:"'Courier New',monospace", fontWeight:700, letterSpacing:'1.5px' }}>ORDENAR — {leccionActiva.ejercicio.instruccion?.toUpperCase()}</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'7px', marginBottom:'18px' }}>
                      {ordenActual.map((f,i) => {
                        const ok = testEnviado && f===leccionActiva.ejercicio.orden_correcto[i];
                        return (
                          <div key={f} style={{ display:'flex', alignItems:'center', gap:'11px', padding:'13px 16px', borderRadius:'10px', backgroundColor:testEnviado?(ok?'rgba(34,211,160,0.05)':'rgba(240,80,112,0.05)'):CARD, border:`1px solid ${testEnviado?(ok?'rgba(34,211,160,0.2)':'rgba(240,80,112,0.14)'):BD}` }}>
                            <div style={{ width:'26px', height:'26px', borderRadius:'7px', backgroundColor:`${testEnviado?(ok?GREEN:RED):ACC}12`, border:`1px solid ${testEnviado?(ok?GREEN:RED):ACC}28`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <span style={{ fontSize:'11px', fontWeight:700, color:testEnviado?(ok?GREEN:RED):ACC, fontFamily:"'Courier New',monospace" }}>{i+1}</span>
                            </div>
                            <span style={{ fontSize:'14px', color:T1, flex:1 }}>{f}</span>
                            {!testEnviado && (
                              <div style={{ display:'flex', gap:'4px' }}>
                                {[['↑',-1],['↓',1]].map(([label,dir]) => (
                                  <button key={label} onClick={() => moverFase(i,dir)} style={{ padding:'4px 9px', borderRadius:'6px', backgroundColor:'rgba(6,12,24,0.8)', border:`1px solid ${BD2}`, color:T3, fontSize:'13px', cursor:'pointer' }}>{label}</button>
                                ))}
                              </div>
                            )}
                            {testEnviado && !ok && <span style={{ fontSize:'11px', color:T3, fontFamily:"'Courier New',monospace" }}>→ {leccionActiva.ejercicio.orden_correcto[i]}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Resultado */}
                {!testEnviado
                  ? <button onClick={() => setTestEnviado(true)}
                      style={{ width:'100%', padding:'17px', borderRadius:'12px', background:`linear-gradient(135deg,${ACC},#2050c8)`, border:'none', color:T1, fontWeight:700, fontSize:'15px', cursor:'pointer', boxShadow:`0 4px 20px rgba(59,123,245,0.28)` }}>
                      Enviar respuestas
                    </button>
                  : <>
                      <div style={{ padding:'22px 26px', borderRadius:'13px', backgroundColor:nota>=60?'rgba(34,211,160,0.05)':'rgba(240,80,112,0.05)', border:`1px solid ${nota>=60?'rgba(34,211,160,0.2)':'rgba(240,80,112,0.18)'}`, marginBottom:'13px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div>
                          <p style={{ fontSize:'42px', fontWeight:800, color:nota>=60?GREEN:RED, lineHeight:1, fontFamily:"'Courier New',monospace" }}>{nota}%</p>
                          <p style={{ fontSize:'12px', color:T3, marginTop:'5px', fontFamily:"'Courier New',monospace" }}>{nota>=60?'Lección superada':'Mínimo 60% requerido'}</p>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <p style={{ fontSize:'20px', fontWeight:700, color:nota>=60?GREEN:T3, fontFamily:"'Courier New',monospace" }}>+{nota>=60?leccionActiva.xp:0}</p>
                          <p style={{ fontSize:'11px', color:T3, fontFamily:"'Courier New',monospace" }}>XP</p>
                        </div>
                      </div>
                      {nota>=60
                        ? <button onClick={completarLeccion} style={{ width:'100%', padding:'17px', borderRadius:'12px', backgroundColor:'rgba(34,211,160,0.1)', border:'1px solid rgba(34,211,160,0.28)', color:GREEN, fontWeight:700, fontSize:'15px', cursor:'pointer' }}>
                            Completar lección (+{leccionActiva.xp} XP) →
                          </button>
                        : <button onClick={() => { setTestEnviado(false); setRespuestasTest({}); setClasificaciones({}); if (tieneOrdenar) setOrdenActual([...leccionActiva.ejercicio.fases].sort(()=>Math.random()-.5)); setFase('teoria'); }}
                            style={{ width:'100%', padding:'17px', borderRadius:'12px', backgroundColor:'transparent', border:`1px solid ${BD2}`, color:T2, fontWeight:600, fontSize:'15px', cursor:'pointer' }}>
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
        <div style={{ minHeight:'100vh', backgroundColor:BG, fontFamily:"system-ui,sans-serif", color:T1 }}>
          <Navbar titulo={cursoActivo.titulo} back={() => { setVista('cursos'); setCursoActivo(null); }} right={`+${modsCurso.reduce((acc,m)=>acc+m.xp,0)} XP`} onLogoClick={() => navigate('/')}/>
          <div style={{ maxWidth:'960px', margin:'0 auto', padding:'36px 40px 80px' }}>

            {/* Header curso */}
            <div style={{ padding:'26px 30px', borderRadius:'16px', background:`linear-gradient(135deg,rgba(${cursoActivo.colorRgb||'59,123,245'},.07) 0%,rgba(${cursoActivo.colorRgb||'59,123,245'},.02) 100%)`, border:`1px solid rgba(${cursoActivo.colorRgb||'59,123,245'},.18)`, marginBottom:'26px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,transparent,${cursoActivo.color},transparent)` }}/>
              <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                <span style={{ fontSize:'34px' }}>{cursoActivo.icono}</span>
                <div style={{ flex:1 }}>
                  <h2 style={{ fontSize:'21px', fontWeight:700, color:T1, marginBottom:'4px', letterSpacing:'-0.3px' }}>{cursoActivo.titulo}</h2>
                  <p style={{ fontSize:'13px', color:T3 }}>{cursoActivo.descripcion}</p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:'30px', fontWeight:800, color:cursoActivo.color, lineHeight:1, fontFamily:"'Courier New',monospace" }}>{progresoCurso(cursoActivo)}%</p>
                  <p style={{ fontSize:'11px', color:T3, fontFamily:"'Courier New',monospace" }}>completado</p>
                </div>
              </div>
            </div>

            {/* Grid módulos */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'13px', marginBottom:'26px' }}>
              {modsCurso.map(mod => {
                const lComp   = leccionesCompletadasModulo(mod);
                const total   = mod.lecciones.length;
                const completo= moduloCompleto(mod);
                const certObt = certificados.find(c => c.moduloId === mod.id);
                const pct     = total>0?(lComp/total)*100:0;
                return (
                  <div key={mod.id} className="card-hover" onClick={() => setModuloActivo(moduloActivo?.id===mod.id?null:mod)}
                    style={{ padding:'22px', borderRadius:'13px', backgroundColor:CARD, border:completo?`1px solid rgba(34,211,160,0.18)`:`1px solid rgba(${mod.colorRgb||'59,123,245'},.15)`, cursor:'pointer', position:'relative', overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.4)' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:completo?`linear-gradient(90deg,transparent,${GREEN}55,transparent)`:`linear-gradient(90deg,transparent,${mod.color}45,transparent)` }}/>
                    <div style={{ position:'absolute', left:0, top:'2px', bottom:0, width:'3px', backgroundColor:BD }}>
                      <div style={{ position:'absolute', top:0, left:0, width:'100%', height:`${pct}%`, backgroundColor:completo?GREEN:mod.color }}/>
                    </div>
                    <div style={{ paddingLeft:'10px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                        <span style={{ fontSize:'11px', color:mod.color, fontFamily:"'Courier New',monospace", fontWeight:700, letterSpacing:'1px' }}>MÓD {mod.num}</span>
                        <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                          {certObt && <span style={{ fontSize:'13px' }}>🏅</span>}
                          <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'5px', fontFamily:"'Courier New',monospace", fontWeight:700, backgroundColor:completo?'rgba(34,211,160,0.07)':`rgba(${mod.colorRgb||'59,123,245'},.07)`, color:completo?GREEN:mod.color, border:`1px solid ${completo?'rgba(34,211,160,0.18)':`rgba(${mod.colorRgb||'59,123,245'},.18)`}` }}>
                            {completo?'DONE':'OPEN'}
                          </span>
                        </div>
                      </div>
                      <h3 style={{ fontSize:'15px', fontWeight:600, color:T1, marginBottom:'5px', lineHeight:1.4, letterSpacing:'-0.2px' }}>{mod.titulo}</h3>
                      <p style={{ fontSize:'12px', color:T3, marginBottom:'14px', lineHeight:1.6 }}>{mod.descripcion}</p>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:'12px', color:completo?GREEN:mod.color, fontFamily:"'Courier New',monospace", fontWeight:600 }}>+{mod.xp} XP</span>
                        <span style={{ fontSize:'11px', color:T3, fontFamily:"'Courier New',monospace" }}>{lComp}/{total} lecciones</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lista lecciones */}
            {moduloActivo && cursoActivo.moduloIds.includes(moduloActivo.id) && (
              <div style={{ padding:'22px 26px', borderRadius:'15px', backgroundColor:CARD, border:`1px solid rgba(${moduloActivo.colorRgb||'59,123,245'},.18)`, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,transparent,${moduloActivo.color},transparent)` }}/>
                <div style={{ marginBottom:'18px' }}>
                  <h3 style={{ fontSize:'16px', fontWeight:700, color:T1, marginBottom:'3px', letterSpacing:'-0.2px' }}>{moduloActivo.titulo}</h3>
                  <p style={{ fontSize:'11px', color:T3, fontFamily:"'Courier New',monospace" }}>{moduloActivo.certificado}</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {moduloActivo.lecciones.map(leccion => {
                    const done  = completadas.includes(`${moduloActivo.id}-${leccion.id}`);
                    const esCaso= leccion.ejercicio?.tipo==='caso_practico';
                    return (
                      <div key={leccion.id} className="lesson-row" onClick={() => iniciarLeccion(leccion)}
                        style={{ display:'flex', alignItems:'center', gap:'13px', padding:'13px 16px', borderRadius:'10px', backgroundColor:done?'rgba(34,211,160,0.03)':CARD2, border:done?'1px solid rgba(34,211,160,0.13)':`1px solid ${BD}`, cursor:'pointer', position:'relative', overflow:'hidden' }}>
                        {done && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px', backgroundColor:GREEN }}/>}
                        <div style={{ width:'34px', height:'34px', borderRadius:'8px', backgroundColor:done?'rgba(34,211,160,0.07)':`rgba(${moduloActivo.colorRgb||'59,123,245'},.07)`, border:`1px solid ${done?'rgba(34,211,160,0.18)':`rgba(${moduloActivo.colorRgb||'59,123,245'},.18)`}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <span style={{ fontSize:'12px', fontWeight:700, color:done?GREEN:moduloActivo.color, fontFamily:"'Courier New',monospace" }}>{done?'✓':leccion.id}</span>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'2px' }}>
                            <p style={{ fontSize:'14px', color:done?GREEN:T1, fontWeight:500 }}>{leccion.titulo}</p>
                            {esCaso && <span style={{ fontSize:'9px', padding:'2px 6px', borderRadius:'4px', backgroundColor:'rgba(240,80,112,0.07)', color:RED, border:'1px solid rgba(240,80,112,0.18)', fontFamily:"'Courier New',monospace", fontWeight:700, letterSpacing:'1px' }}>CASO</span>}
                          </div>
                          <p style={{ fontSize:'11px', color:T3, fontFamily:"'Courier New',monospace" }}>+{leccion.xp} XP</p>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
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
      <div style={{ minHeight:'100vh', backgroundColor:BG, fontFamily:"system-ui,sans-serif", color:T1 }}>
        <nav style={{ position:'sticky', top:0, zIndex:50, height:'62px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 44px', backgroundColor:'rgba(6,8,16,0.97)', backdropFilter:'blur(24px)', borderBottom:`1px solid ${BD}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }} onClick={() => navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{ height:'28px' }}/>
            <span style={{ fontSize:'15px', fontWeight:800, color:T1, letterSpacing:'-0.3px' }}>Soc<span style={{ color:ACC }}>Blast</span></span>
          </div>
          <div style={{ display:'flex', gap:'2px' }}>
            {[{label:'← Dashboard',path:'/dashboard'},{label:'Ranking',path:'/ranking'},{label:'Perfil',path:'/perfil'}].map((item,i) => (
              <button key={i} className="nav-btn" onClick={() => navigate(item.path)} style={{ padding:'6px 14px', borderRadius:'8px', background:'none', border:'none', color:T2, fontSize:'13px', cursor:'pointer' }}>{item.label}</button>
            ))}
          </div>
          <span style={{ fontSize:'11px', color:GREEN, fontFamily:"'Courier New',monospace", fontWeight:600, padding:'4px 10px', borderRadius:'6px', backgroundColor:'rgba(34,211,160,0.06)', border:'1px solid rgba(34,211,160,0.14)' }}>
            {leccionesComp}/{leccionesTotales} · {certificados.length} certs
          </span>
        </nav>

        <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'48px 44px 80px' }}>
          <div style={{ marginBottom:'48px' }}>
            <p style={{ fontSize:'11px', color:T3, fontFamily:"'Courier New',monospace", fontWeight:700, letterSpacing:'3px', marginBottom:'10px' }}>CENTRO DE FORMACIÓN SOC</p>
            <h1 style={{ fontSize:'38px', fontWeight:800, color:T1, letterSpacing:'-1.5px', marginBottom:'10px', lineHeight:1.1 }}>
              SOC Training<br/><span style={{ color:ACC }}>Platform</span>
            </h1>
            <p style={{ fontSize:'14px', color:T3, marginBottom:'22px' }}>3 cursos · {MODULOS.length} módulos · {MODULOS.reduce((acc,m)=>acc+m.xp,0)} XP disponibles</p>
            <div style={{ display:'flex', alignItems:'center', gap:'14px', maxWidth:'540px' }}>
              <div style={{ flex:1, height:'5px', borderRadius:'3px', backgroundColor:BD, overflow:'hidden' }}>
                <div style={{ width:`${leccionesTotales>0?(leccionesComp/leccionesTotales)*100:0}%`, height:'100%', borderRadius:'3px', background:`linear-gradient(90deg,${ACC},${GREEN})` }}/>
              </div>
              <span style={{ fontSize:'12px', color:T3, fontFamily:"'Courier New',monospace", flexShrink:0 }}>
                {Math.round(leccionesTotales>0?(leccionesComp/leccionesTotales)*100:0)}%
              </span>
            </div>
          </div>

          {certificados.length > 0 && (
            <div style={{ padding:'18px 22px', borderRadius:'13px', backgroundColor:CARD, border:`1px solid rgba(240,180,41,0.13)`, marginBottom:'32px' }}>
              <p style={{ fontSize:'10px', color:GOLD, fontFamily:"'Courier New',monospace", fontWeight:700, letterSpacing:'2px', marginBottom:'12px' }}>CERTIFICADOS OBTENIDOS</p>
              <div style={{ display:'flex', gap:'9px', flexWrap:'wrap' }}>
                {certificados.map((cert,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'6px 13px', borderRadius:'8px', backgroundColor:'rgba(240,180,41,0.06)', border:`1px solid rgba(240,180,41,0.18)` }}>
                    <span style={{ fontSize:'13px' }}>🏅</span>
                    <span style={{ fontSize:'12px', color:GOLD, fontWeight:600, fontFamily:"'Courier New',monospace" }}>{cert.titulo}</span>
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
                  style={{ borderRadius:'17px', backgroundColor:CARD, border:!desbloqueado?`1px solid ${BD}`:completo?`1px solid rgba(34,211,160,0.22)`:`1px solid rgba(${curso.colorRgb||'59,123,245'},.2)`, cursor:desbloqueado?'pointer':'not-allowed', opacity:desbloqueado?1:.28, position:'relative', overflow:'hidden', boxShadow:desbloqueado?'0 6px 28px rgba(0,0,0,0.45)':'none' }}>

                  <div style={{ height:'124px', background:desbloqueado?`linear-gradient(135deg,rgba(${curso.colorRgb||'59,123,245'},.22) 0%,rgba(${curso.colorRgb||'59,123,245'},.05) 100%)`:'rgba(10,18,35,0.5)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                    <span style={{ fontSize:'50px' }}>{curso.icono}</span>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:desbloqueado?`linear-gradient(90deg,transparent,${curso.color},transparent)`:undefined }}/>
                    <div style={{ position:'absolute', top:'11px', right:'13px' }}>
                      <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'5px', fontFamily:"'Courier New',monospace", fontWeight:700, letterSpacing:'0.5px', backgroundColor:!desbloqueado?'rgba(10,18,35,0.8)':completo?'rgba(34,211,160,0.09)':`rgba(${curso.colorRgb||'59,123,245'},.09)`, color:!desbloqueado?T3:completo?GREEN:curso.color, border:`1px solid ${!desbloqueado?BD:completo?'rgba(34,211,160,0.22)':`rgba(${curso.colorRgb||'59,123,245'},.22)`}` }}>
                        {!desbloqueado?'LOCKED':completo?'DONE':'OPEN'}
                      </span>
                    </div>
                    <div style={{ position:'absolute', bottom:'11px', left:'15px' }}>
                      <span style={{ fontSize:'10px', padding:'2px 7px', borderRadius:'5px', backgroundColor:'rgba(6,8,16,0.7)', color:T3, fontFamily:"'Courier New',monospace", border:`1px solid ${BD}` }}>{curso.nivel}</span>
                    </div>
                  </div>

                  <div style={{ padding:'20px 22px 24px' }}>
                    <p style={{ fontSize:'10px', color:curso.color, fontFamily:"'Courier New',monospace", fontWeight:700, letterSpacing:'2px', marginBottom:'7px' }}>CURSO {String(curso.id).padStart(2,'0')}</p>
                    <h3 style={{ fontSize:'19px', fontWeight:700, color:T1, marginBottom:'4px', letterSpacing:'-0.3px', lineHeight:1.2 }}>{curso.titulo}</h3>
                    <p style={{ fontSize:'12px', color:curso.color, marginBottom:'9px', fontStyle:'italic' }}>{curso.subtitulo}</p>
                    <p style={{ fontSize:'13px', color:T3, marginBottom:'18px', lineHeight:1.7 }}>{curso.descripcion}</p>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'7px', marginBottom:'16px' }}>
                      {[{label:'Módulos',value:curso.moduloIds.length},{label:'Duración',value:curso.duracion}].map((s,i) => (
                        <div key={i} style={{ padding:'9px 11px', borderRadius:'8px', backgroundColor:'rgba(6,12,24,0.8)', border:`1px solid ${BD}`, textAlign:'center' }}>
                          <p style={{ fontSize:'10px', color:T3, fontFamily:"'Courier New',monospace", marginBottom:'3px' }}>{s.label}</p>
                          <p style={{ fontSize:'13px', fontWeight:700, color:T2, fontFamily:"'Courier New',monospace" }}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom:'14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                        <span style={{ fontSize:'11px', color:T3, fontFamily:"'Courier New',monospace" }}>Progreso</span>
                        <span style={{ fontSize:'11px', color:completo?GREEN:curso.color, fontFamily:"'Courier New',monospace", fontWeight:700 }}>{progreso}%</span>
                      </div>
                      <div style={{ height:'4px', borderRadius:'2px', backgroundColor:BD, overflow:'hidden' }}>
                        <div style={{ width:`${progreso}%`, height:'100%', borderRadius:'2px', backgroundColor:completo?GREEN:curso.color }}/>
                      </div>
                    </div>

                    {desbloqueado && (
                      <div style={{ display:'flex', alignItems:'center', gap:'5px', color:curso.color, fontSize:'12px', fontWeight:700, fontFamily:"'Courier New',monospace" }}>
                        <span>{completo?'Ver certificados':'Comenzar curso'}</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
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
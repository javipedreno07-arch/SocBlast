const LS_AVATAR = 'socblast_avatar';
const defaultAv = {base:'analista', skin:'light', hat:'none', acc:'none', bg:'clean'};

const BASES_R = {
  analista: {color:'#3b82f6'},
  hacker:   {color:'#059669'},
  agente:   {color:'#1f2937'},
  soldado:  {color:'#4b5320'},
  legend:   {color:'#8b5cf6'},
};

const MiniAvatar = ({avatarData, size=36}) => {
  const av = {...defaultAv, ...(avatarData||{})};
  const base = BASES_R[av.base] || BASES_R.analista;
  const skinColors = {light:'#FDBCB4',medium:'#C68642',tan:'#8D7355',dark:'#4a2912',pale:'#F5DEB3'};
  const hairColors = {light:'#2C1810',medium:'#0f0f0f',tan:'#2c1810',dark:'#1a0a00',pale:'#4a3728'};
  const skin = skinColors[av.skin]||'#FDBCB4';
  const hair = hairColors[av.skin]||'#2C1810';
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{borderRadius:'50%',display:'block',flexShrink:0}}>
      <rect x="0" y="0" width="80" height="80" rx="40" fill="#eef2ff"/>
      {/* Simple cartoon face */}
      <rect x="20" y="68" width="40" height="20" rx="6" fill={base.color}/>
      <rect x="34" y="60" width="12" height="10" fill={skin}/>
      <ellipse cx="40" cy="46" rx="18" ry="20" fill={skin}/>
      <ellipse cx="40" cy="30" rx="18" ry="9" fill={hair}/>
      <rect x="22" y="30" width="36" height="10" rx="3" fill={hair}/>
      <ellipse cx="34" cy="46" rx="3.5" ry="4" fill="#fff"/>
      <ellipse cx="46" cy="46" rx="3.5" ry="4" fill="#fff"/>
      <circle cx="35" cy="47" r="2" fill="#1a1a2e"/>
      <circle cx="47" cy="47" r="2" fill="#1a1a2e"/>
      <path d="M36 56 Q40 60 44 56" stroke="#c0726a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="40" cy="40" r="39" fill="none" stroke={base.color} strokeWidth="2" opacity="0.4"/>
    </svg>
  );
};

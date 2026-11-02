import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, ArrowRight, Banknote, CarFront, Check, ClipboardCheck, ClipboardList, FileBarChart2, FilePlus2, LogOut, Search, Settings, ShieldCheck, UserRoundCog, Users, X, type LucideIcon } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

type Vehicle = { plate: string; make: string; model: string; year: number; color?: string; owner: string; driver: string; taxDue: number; district: string; category: string; legalStatus?: string };
type VehicleOccurrence = { id: string; plate: string; vehicleLabel?: string; owner?: string; recordCategory?: string; eventType: string; resultingStatus: string; reason: string; authority?: string; processNumber?: string; location?: string; date: string; notes?: string };
type OwnershipTransfer = { id: string; plate: string; vehicleLabel?: string; previousOwner: string; previousDocument?: string; newOwner: string; newDocument?: string; newDriver?: string; district?: string; transferDate: string; reason: string; notes?: string };
type Driver = { id: string; name: string; document: string; documentFile?: { name: string; dataUrl: string }; license: string; category: string; phone: string; district: string; status: string };
type Fine = { id: string; plate: string; driver: string; infraction: string; amount: number; date: string; status: 'Pendente' | 'Pago' };
type InfractionTypeItem = { id: string; name: string; amount: number; severity: string; description?: string };
type Inspection = { id: string; plate: string; reason: string; office: string; date: string; status: string };

const seedVehicles: Vehicle[] = [
  { plate:'GB-24-BC',make:'Toyota',model:'Corolla',year:2018,color:'Prata',owner:'Mamadu Embaló',driver:'Mamadu Embaló',taxDue:41500,district:'Bissau',category:'Ligeiro particular' },
  { plate:'GB-19-AA',make:'Suzuki',model:'Carry',year:2020,color:'Branco',owner:'Adama Baldé',driver:'Bacar Camará',taxDue:0,district:'Bafatá',category:'Transporte misto' },
  { plate:'GB-22-CD',make:'Mercedes-Benz',model:'Sprinter',year:2017,color:'Azul',owner:'Transportes Cacheu',driver:'Ibraima Sanhá',taxDue:83000,district:'Cacheu',category:'Transporte colectivo' },
  { plate:'GB-23-FA',make:'Honda',model:'Wave',year:2022,color:'Vermelho',owner:'Naima Mané',driver:'Naima Mané',taxDue:0,district:'Gabú',category:'Motociclo' },
];
const seedOwnershipTransfers: OwnershipTransfer[] = [
  {id:'TRF-2026-0001',plate:'GB-24-BC',vehicleLabel:'Toyota Corolla (2018)',previousOwner:'Suleimane Djassi',previousDocument:'000841920',newOwner:'Mamadu Embaló',newDocument:'000000001',newDriver:'Mamadu Embaló',district:'Bissau',transferDate:'2026-03-14',reason:'Compra e venda',notes:'Contrato de compra e venda reconhecido em cartório · Processo n.º 104/2026'},
  {id:'TRF-2026-0002',plate:'GB-19-AA',vehicleLabel:'Suzuki Carry (2020)',previousOwner:'Comercial Bafatá Lda',previousDocument:'500192837',newOwner:'Adama Baldé',newDocument:'000492811',newDriver:'Bacar Camará',district:'Bafatá',transferDate:'2026-06-22',reason:'Compra e venda',notes:'Transferência de titularidade na delegação regional de Bafatá'},
];
const seedVehicleOccurrences: VehicleOccurrence[] = [
  {id:'OCO-2026-0001',plate:'GB-22-CD',vehicleLabel:'Mercedes-Benz Sprinter (2017) · Azul',owner:'Transportes Cacheu',recordCategory:'Ocorrência Policial / Fiscalização',eventType:'Apreensão de Veículo',resultingStatus:'Apreendido',reason:'Circulação com imposto em dívida e falta de inspeção técnica obrigatória',authority:'Brigada de Trânsito · Cacheu',processNumber:'AUTO-APR-2026/089',location:'Parque de Apreensões da Delegação Regional de Cacheu',date:'2026-09-25',notes:'Viatura retida até regularização fiscal e vistoria técnica.'},
  {id:'OCO-2026-0002',plate:'GB-19-AA',vehicleLabel:'Suzuki Carry (2020) · Branco',owner:'Adama Baldé',recordCategory:'Ocorrência Policial / Fiscalização',eventType:'Recuperação / Restituição',resultingStatus:'Recuperado',reason:'Veículo localizado após participação de furto e restituído ao legítimo proprietário',authority:'Polícia de Ordem Pública · Bafatá',processNumber:'BO-REC-2026/142',location:'Comissariado Regional de Bafatá',date:'2026-10-04',notes:'Auto de entrega e termo de restituição assinados pelo proprietário.'},
];
const seedDrivers: Driver[] = [
  {id:'D-001',name:'Mamadu Embaló',document:'000000001',license:'GB-C-10294',category:'Ligeiros',phone:'+245 955 100 201',district:'Bissau',status:'Ativo'},
  {id:'D-002',name:'Bacar Camará',document:'000000002',license:'GB-C-08142',category:'Ligeiros e mercadorias',phone:'+245 966 200 142',district:'Bafatá',status:'Ativo'},
  {id:'D-003',name:'Ibraima Sanhá',document:'000000003',license:'GB-D-07331',category:'Pesados',phone:'+245 955 300 733',district:'Cacheu',status:'Ativo'},
  {id:'D-004',name:'Naima Mané',document:'000000004',license:'GB-A-11620',category:'Motociclos',phone:'+245 966 400 620',district:'Gabú',status:'Ativo'},
];
const seedFines: Fine[] = [
  {id:'GB-2026-0014',plate:'GB-24-BC',driver:'Mamadu Embaló',infraction:'Documentação em falta',amount:25000,date:'2026-09-18',status:'Pendente'},
  {id:'GB-2026-0015',plate:'GB-24-BC',driver:'Mamadu Embaló',infraction:'Estacionamento irregular',amount:10000,date:'2026-09-20',status:'Pendente'},
  {id:'GB-2026-0016',plate:'GB-22-CD',driver:'Ibraima Sanhá',infraction:'Documentação em falta',amount:35000,date:'2026-09-21',status:'Pendente'},
];
const seedInfractionTypes: InfractionTypeItem[] = [
  {id:'INF-001',name:'Documentação em falta',amount:25000,severity:'Grave',description:'Condução sem documentos obrigatórios do veículo ou condutor'},
  {id:'INF-002',name:'Estacionamento irregular',amount:10000,severity:'Leve',description:'Estacionamento em local proibido ou passeio público'},
  {id:'INF-003',name:'Excesso de velocidade',amount:35000,severity:'Gravíssima',description:'Velocidade superior ao limite regulamentar da via'},
  {id:'INF-004',name:'Condução sem carta de condução',amount:50000,severity:'Gravíssima',description:'Condutor não habilitado para a categoria do veículo'},
  {id:'INF-005',name:'Falta de inspeção periódica',amount:20000,severity:'Média',description:'Inspeção técnica veicular vencida ou inexistente'},
];
const seedInspections: Inspection[] = [
  {id:'ITV-0061',plate:'GB-24-BC',reason:'Inspeção periódica',office:'Bissau',date:'2026-10-28',status:'Agendada'},
  {id:'ITV-0062',plate:'GB-22-CD',reason:'Verificação de segurança',office:'Cacheu',date:'2026-10-30',status:'Agendada'},
];

function useSaved<T>(key:string, initial:T) {
  const [data,setData] = useState<T>(()=>{try {const value=localStorage.getItem(`sigetran:${key}`);return value?JSON.parse(value) as T:initial;}catch{return initial;}});
  useEffect(() => { let active = true; api.get<T>(`/state/${key}`).then(res => { if (active && res.data !== undefined) { setData(res.data); try { localStorage.setItem(`sigetran:${key}`, JSON.stringify(res.data)); } catch { /* ignore */ } } }).catch(() => { /* fallback */ }); return () => { active = false; }; }, [key]);
  return [data,(next:T|((prev:T)=>T))=>{setData(prev=>{const value=typeof next==='function'?(next as (prev:T)=>T)(prev):next;try{localStorage.setItem(`sigetran:${key}`,JSON.stringify(value));}catch{/* storage unavailable */}api.put(`/state/${key}`,value).catch(()=>{/* ignore */});return value;});}] as const;
}

const menu:{path:string;label:string;icon:LucideIcon}[]=[
  {path:'/dashboard',label:'Painel de gestão',icon:Activity},{path:'/vehicles',label:'Veículos e matrículas',icon:CarFront},{path:'/ownership-transfers',label:'Transferência e histórico',icon:ArrowRight},{path:'/vehicle-occurrences',label:'Apreensões, roubos e baixas',icon:ShieldCheck},{path:'/drivers',label:'Condutores e cartas',icon:Users},{path:'/plate-check',label:'Consulta de matrícula',icon:Search},{path:'/circulation-tax',label:'Imposto de Circulação',icon:Banknote},{path:'/fines',label:'Multas e infrações',icon:ClipboardList},{path:'/infraction-types',label:'Tabela de infrações',icon:AlertTriangle},{path:'/inspections',label:'Inspeções veiculares',icon:ClipboardCheck},{path:'/reports',label:'Relatórios nacionais',icon:FileBarChart2},{path:'/users',label:'Utilizadores',icon:UserRoundCog},{path:'/settings',label:'Configuração',icon:Settings},
];
const inputClass='w-full border border-[#d5d1c2] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/15';
const primaryClass='inline-flex items-center justify-center gap-2 bg-[#006B35] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00552b] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryClass='inline-flex items-center justify-center gap-2 border border-[#cfcbbc] bg-white px-4 py-2.5 text-sm font-semibold text-[#26372b] hover:bg-[#f3f1e8]';
const currency=(value:number)=>`${value.toLocaleString('fr-FR')} XOF`;

function Shell({children}:{children:ReactNode}) {
  const {pathname}=useLocation();
  const navigate=useNavigate();const logout=useAuthStore(state=>state.logout);
  return <div className="min-h-screen bg-[#f4f3ed] text-[#202820]"><div className="flex h-1.5"><div className="w-1/3 bg-[#CE1126]"/><div className="w-1/3 bg-[#FCD116]"/><div className="w-1/3 bg-[#009E49]"/></div>
    <div className="border-b border-[#dcd9cc] bg-[#eeede5] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-[#4b5549] md:px-8">República da Guiné-Bissau <span className="mx-2 text-[#CE1126]">|</span> Serviço Público Digital <span className="float-right hidden font-normal tracking-normal sm:block">Ambiente de demonstração</span></div>
    <div className="lg:flex"><aside className="w-full bg-[#173d2b] text-white lg:min-h-[calc(100vh-29px)] lg:w-[264px]"><div className="border-b border-white/15 px-5 py-6"><div className="flex items-center gap-3"><div className="relative grid h-12 w-12 place-items-center border border-[#FCD116]/60 bg-[#214c36] text-sm font-black tracking-wider text-[#FCD116]"><span className="absolute inset-1 border border-[#FCD116]/30"/>GB</div><div><b className="block text-[13px] uppercase tracking-[.1em]">Ministério dos<br/>Transportes</b><span className="mt-1 block text-[10px] uppercase tracking-[.14em] text-[#bdcdbf]">Administração Nacional</span></div></div><div className="mt-5 border-l-2 border-[#FCD116] pl-3"><div className="text-[10px] uppercase tracking-[.14em] text-[#bdcdbf]">Plataforma</div><div className="mt-0.5 font-semibold tracking-wide">SIGETRAN</div></div></div>
      <div className="px-4 pt-5 text-[10px] font-semibold uppercase tracking-[.17em] text-[#9fb7a4]">Gestão e serviços</div><nav className="grid grid-cols-2 gap-1 p-3 sm:grid-cols-3 lg:block lg:space-y-1">{menu.map((item,index)=><Link key={item.path} to={item.path} className={`relative flex min-w-0 items-center gap-2 px-2 py-3 text-[12px] transition lg:gap-3 lg:px-3 lg:text-[13px] ${pathname===item.path?'bg-[#f4f3ed] font-semibold text-[#173d2b]':'text-[#d8e2d9] hover:bg-white/10 hover:text-white'}`}>{pathname===item.path&&<span className="absolute bottom-0 left-0 top-0 w-[3px] bg-[#FCD116]"/>}<item.icon size={17} className="shrink-0"/><span className="leading-4">{item.label}</span>{index===3&&<span className="ml-auto hidden rounded bg-[#FCD116]/20 px-1.5 py-0.5 text-[9px] uppercase text-[#FCD116] lg:inline">rápido</span>}</Link>)}</nav>
      <div className="mx-4 my-5 hidden border-t border-white/15 pt-4 text-[11px] leading-5 text-[#c4d2c6] md:block"><div className="mb-2 flex items-center gap-2 font-semibold uppercase tracking-wider text-[#FCD116]"><ShieldCheck size={14}/> Ambiente demonstrativo</div>Dados e pagamentos simulados, armazenados apenas neste navegador.</div><div className="hidden border-t border-white/15 px-5 py-4 text-[10px] text-[#9fb7a4] md:block">Bissau · Guiné-Bissau<br/>SIGETRAN · Versão de demonstração</div>
    </aside><main className="min-w-0 flex-1"><header className="flex min-h-[76px] items-center justify-between border-b border-[#dcd9cc] bg-white px-5 md:px-9"><div><div className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#52644f]">Sistema Integrado de Gestão de Trânsito</div><div className="mt-1 text-xs text-[#737a70]">Ministério dos Transportes <span className="mx-1">/</span> Administração Central</div></div><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><div className="text-xs font-semibold">Administrador do sistema</div><div className="text-[10px] text-[#737a70]">Direção Nacional · Bissau</div></div><div className="hidden h-9 w-9 place-items-center border border-[#d5d1c2] bg-[#f4f3ed] text-xs font-bold text-[#173d2b] sm:grid">AD</div><button title="Sair do sistema" onClick={()=>{logout();navigate('/');}} className="flex items-center gap-2 border border-[#d5d1c2] px-3 py-2 text-xs font-semibold hover:bg-[#f4f3ed]"><LogOut size={15}/>Sair</button></div></header><div className="mx-auto max-w-[1500px] p-5 md:p-9">{children}<p className="mt-10 border-t border-[#d8d5c9] pt-4 text-[11px] text-[#72776e]">SIGETRAN · Protótipo sem backend · Valores em Franco CFA (XOF) · Regras e tabelas legais carecem de validação oficial.</p></div></main></div>
  </div>;
}
function Title({eyebrow,title,description,icon:Icon}:{eyebrow:string;title:string;description:string;icon:LucideIcon}){return <div className="mb-7 flex items-start gap-4 border-b border-[#d8d5c9] pb-5"><div className="grid h-12 w-12 shrink-0 place-items-center border border-[#d5d1c2] bg-white text-[#009E49]"><Icon size={22}/></div><div><div className="text-[10px] font-bold uppercase tracking-[.17em] text-[#836300]">{eyebrow}</div><h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#1c3024] md:text-[30px]">{title}</h1><p className="mt-1 text-sm text-[#697168]">{description}</p></div></div>;}
function Stat({label,value,detail,icon:Icon}:{label:string;value:string;detail:string;icon:LucideIcon}){return <div className="border border-[#dcd9cc] border-t-[3px] border-t-[#009E49] bg-white p-5"><div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[.08em] text-[#697168]"><span>{label}</span><Icon size={18} className="text-[#009E49]"/></div><div className="mt-3 font-serif text-[30px] font-bold text-[#1c3024]">{value}</div><div className="mt-1 text-xs text-[#737a70]">{detail}</div></div>;}
function Status({value}:{value:string}){const positive=['Em dia','Pago','Concluída','Ativo','Regular','Recuperado'].includes(value);const cancelled=['Cancelado / Baixa Definitiva','Baixa Definitiva','Cancelamento de Matrícula'].includes(value);return <span className={`inline-flex whitespace-nowrap border px-2 py-1 text-[11px] font-semibold ${positive?'border-[#009E49]/30 bg-[#009E49]/10 text-[#006B35]':cancelled?'border-[#4b5549]/40 bg-[#4b5549]/15 text-[#202820]':'border-[#CE1126]/25 bg-[#CE1126]/10 text-[#9f1a2b]'}`}>{value}</span>;}
function Field({label,name,type='text',required=true,defaultValue,placeholder}:{label:string;name:string;type?:string;required?:boolean;defaultValue?:string;placeholder?:string}){return <label className="block text-xs font-semibold text-[#4b5549]">{label}<input className={`mt-1.5 ${inputClass}`} type={type} name={name} required={required} defaultValue={defaultValue} placeholder={placeholder}/></label>;}
function Panel({title,children,action}:{title:string;children:ReactNode;action?:ReactNode}){return <section className="border border-[#dcd9cc] bg-white p-5"><div className="mb-4 flex items-center justify-between border-b border-[#e9e6dc] pb-3"><h2 className="font-serif text-lg font-bold text-[#1c3024]">{title}</h2>{action}</div>{children}</section>;}
function Drawer({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){const [visible,setVisible]=useState(false);useEffect(()=>{const frame=requestAnimationFrame(()=>setVisible(true));return()=>cancelAnimationFrame(frame);},[]);const close=()=>{setVisible(false);window.setTimeout(onClose,250);};useEffect(()=>{const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape')close();};window.addEventListener('keydown',onKeyDown);window.addEventListener('sigetran:drawer-close',close);return()=>{window.removeEventListener('keydown',onKeyDown);window.removeEventListener('sigetran:drawer-close',close);};},[]);return <div className="fixed inset-0 z-50 flex justify-end" role="presentation"><button aria-label="Fechar painel" onClick={close} className={`absolute inset-0 bg-[#10251a]/55 transition-opacity duration-300 ease-out motion-reduce:transition-none ${visible?'opacity-100':'opacity-0'}`}/><section role="dialog" aria-modal="true" aria-label={title} className={`relative flex h-full w-full max-w-2xl flex-col border-l-4 border-[#CE1126] bg-[#f8f7f2] shadow-2xl transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${visible?'translate-x-0 opacity-100':'translate-x-full opacity-0'}`}><header className="flex items-center justify-between border-b border-[#dcd9cc] bg-white px-5 py-4"><div><div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#836300]">Novo registo</div><h2 className="mt-1 font-serif text-xl font-bold text-[#1c3024]">{title}</h2></div><button type="button" onClick={close} aria-label="Fechar" className="grid h-10 w-10 place-items-center border border-[#d5d1c2] text-[#26372b] hover:bg-[#f3f1e8]"><X size={18}/></button></header><div className="flex-1 overflow-y-auto p-5">{children}</div></section></div>;}

export function TransportDashboard(){
  const [vehicles]=useSaved('vehicles',seedVehicles); const [drivers]=useSaved('drivers',seedDrivers); const [fines]=useSaved('fines',seedFines); const [inspections]=useSaved('inspections',seedInspections);
  const pending=fines.filter(f=>f.status==='Pendente').length; const debts=vehicles.filter(v=>v.taxDue>0).length;
  const districts=Array.from(new Set(vehicles.map(v=>v.district))).map(name=>({name,count:vehicles.filter(v=>v.district===name).length})).sort((a,b)=>b.count-a.count);
  const recent=[...fines.map(f=>({id:f.id,title:`Auto ${f.id}`,detail:`${f.infraction} · ${f.plate}`,date:f.date,status:f.status})),...inspections.map(i=>({id:i.id,title:`Inspeção ${i.plate}`,detail:`${i.reason} · ${i.office}`,date:i.date,status:i.status}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  return <Shell><div className="mb-6 border-l-4 border-[#CE1126] bg-[#173d2b] px-5 py-5 text-white md:flex md:items-center md:justify-between md:px-7"><div><div className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#FCD116]">Sala de situação · Bissau</div><h1 className="mt-1 font-serif text-2xl font-bold md:text-[32px]">Gestão Nacional de Trânsito</h1><p className="mt-1 text-sm text-[#d0ddd2]">Resumo administrativo da rede de transportes terrestres</p></div><div className="mt-4 border-t border-white/15 pt-3 text-xs text-[#d0ddd2] md:mt-0 md:border-l md:border-t-0 md:pl-5 md:pt-0"><div className="uppercase tracking-wider text-[#FCD116]">Estado do sistema</div><div className="mt-1 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#009E49]"/> Demonstração local</div></div></div>
    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#70766c]"><span className="h-px w-5 bg-[#FCD116]"/> Indicadores da administração</div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Veículos registados" value={vehicles.length.toLocaleString('pt-PT')} detail="Base de matrícula local" icon={CarFront}/><Stat label="Veículos com imposto" value={debts.toLocaleString('pt-PT')} detail="Débitos em demonstração" icon={Banknote}/><Stat label="Autos pendentes" value={pending.toLocaleString('pt-PT')} detail="Aguardando regularização" icon={AlertTriangle}/><Stat label="Condutores" value={drivers.length.toLocaleString('pt-PT')} detail="Registos na base local" icon={Users}/></div>
    <div className="mt-7 grid gap-5 xl:grid-cols-3"><div className="space-y-5"><Panel title="Ações rápidas"><div className="grid gap-2"><Quick to="/vehicles" icon={FilePlus2} label="Registar veículo"/><Quick to="/drivers" icon={Users} label="Cadastrar condutor"/><Quick to="/fines" icon={ClipboardList} label="Registar infração"/><Quick to="/circulation-tax" icon={Banknote} label="Regularizar imposto"/><Quick to="/inspections" icon={ClipboardCheck} label="Agendar inspeção"/></div></Panel><div className="border-l-2 border-[#FCD116] bg-[#f5f2e7] p-4 text-xs leading-5 text-[#4c5145]"><b>Enquadramento fiscal</b><br/>O sistema usa a designação “Imposto de Circulação”. Valores no protótipo não são liquidação oficial.</div></div><Panel title="Atividade recente" action={<Link to="/reports" className="text-xs font-bold text-[#006B35]">Ver relatórios →</Link>}><div className="divide-y divide-[#f0eee7]">{recent.map(item=><div key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><div className="text-sm font-semibold">{item.title}</div><div className="mt-1 truncate text-xs text-[#737a70]">{item.detail}</div><div className="mt-1 text-[10px] text-[#737a70]">{item.date}</div></div><Status value={item.status}/></div>)}</div></Panel></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-2"><Panel title="Veículos por delegação"><div className="space-y-4">{districts.map(row=><div key={row.name}><div className="mb-1 flex justify-between text-xs"><span>{row.name}</span><b>{row.count}</b></div><div className="h-2 bg-[#eeede5]"><div className="h-full bg-[#009E49]" style={{width:`${Math.max(8,row.count/Math.max(1,vehicles.length)*100)}%`}}/></div></div>)}</div></Panel><Panel title="Registos para acompanhamento" action={<Link to="/plate-check" className="text-xs font-bold uppercase tracking-wider text-[#006B35]">Consultar matrícula →</Link>}><VehicleTable rows={vehicles.slice(0,5)}/></Panel></div>
  </Shell>;
}

function VehicleTable({rows,onEdit,onDelete}:{rows:Vehicle[];onEdit?:(vehicle:Vehicle)=>void;onDelete?:(plate:string)=>void}){const hasActions=Boolean(onEdit||onDelete);return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-[#e9e6dc] text-[10px] uppercase tracking-wider text-[#737a70]"><tr>{['Matrícula','Veículo','Cor','Titular / condutor','Distrito','Situação legal','Imposto',...(hasActions?['Ações']:[])].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr></thead><tbody>{rows.map(v=><tr key={v.plate} className="border-b border-[#f0eee7]"><td className="whitespace-nowrap px-3 py-3 font-semibold">{v.plate}</td><td className="whitespace-nowrap px-3 py-3">{v.make} {v.model}<span className="block text-[11px] text-[#737a70]">{v.year} · {v.category}</span></td><td className="whitespace-nowrap px-3 py-3"><span className="inline-flex items-center gap-1.5 border border-[#d5d1c2] bg-[#f8f7f2] px-2 py-0.5 text-xs font-medium text-[#26372b]">{v.color||'Branco'}</span></td><td className="whitespace-nowrap px-3 py-3">{v.owner}<span className="block text-[11px] text-[#737a70]">Condutor: {v.driver||'Não associado'}</span></td><td className="px-3 py-3">{v.district}</td><td className="px-3 py-3"><Status value={v.legalStatus||'Regular'}/></td><td className="px-3 py-3"><Status value={v.taxDue?'Em dívida':'Em dia'}/></td>{hasActions&&<td className="whitespace-nowrap px-3 py-3"><div className="flex items-center gap-3">{onEdit&&<button type="button" onClick={()=>onEdit(v)} className="text-xs font-semibold text-[#006B35] hover:underline">Alterar características</button>}{onDelete&&<button type="button" onClick={()=>onDelete(v.plate)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Remover</button>}</div></td>}</tr>)}</tbody></table></div>;}
function Quick({to,icon:Icon,label}:{to:string;icon:LucideIcon;label:string}){return <Link to={to} className="flex items-center gap-3 border border-[#e2dfd4] px-3 py-2.5 text-sm font-medium hover:border-[#009E49] hover:bg-[#009E49]/5"><Icon size={17} className="text-[#006B35]"/>{label}<ArrowRight size={14} className="ml-auto text-[#737a70]"/></Link>;}

export function PlateCheck(){const [vehicles]=useSaved('vehicles',seedVehicles);const [fines]=useSaved('fines',seedFines);const [transfers]=useSaved('ownership-transfers',seedOwnershipTransfers);const [occurrences]=useSaved('vehicle-occurrences',seedVehicleOccurrences);const [plate,setPlate]=useState('');const [searched,setSearched]=useState('');const result=useMemo(()=>vehicles.find(v=>v.plate.replace(/[^a-z0-9]/gi,'').toUpperCase()===searched.replace(/[^a-z0-9]/gi,'').toUpperCase()),[vehicles,searched]);const plateHistory=useMemo(()=>result?transfers.filter(t=>t.plate.toUpperCase()===result.plate.toUpperCase()):[],[transfers,result]);const plateOccurrences=useMemo(()=>result?occurrences.filter(o=>o.plate.toUpperCase()===result.plate.toUpperCase()):[],[occurrences,result]);return <Shell><Title eyebrow="Consulta pública / fiscalização" title="Verificar situação por matrícula" description="Consulte os débitos do veículo, apreensões, roubos, baixas definitivas e o histórico de proprietários." icon={Search}/><form onSubmit={e=>{e.preventDefault();setSearched(plate);}} className="flex max-w-2xl flex-col gap-3 border border-[#dcd9cc] bg-white p-5 sm:flex-row"><label className="sr-only" htmlFor="plate">Matrícula</label><input id="plate" value={plate} onChange={e=>setPlate(e.target.value.toUpperCase())} placeholder="Ex.: GB-24-BC" className={`${inputClass} min-w-0 flex-1 font-semibold uppercase tracking-wider`}/><button className={primaryClass}><Search size={16}/> Consultar</button></form>{searched&&<div className="mt-6 max-w-3xl border border-[#dcd9cc] bg-white p-5">{result?<><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-[10px] uppercase tracking-wider text-[#737a70]">Matrícula consultada</div><h2 className="mt-1 text-xl font-bold">{result.plate} · {result.make} {result.model}</h2></div><div className="flex items-center gap-2"><Status value={result.legalStatus||'Regular'}/><Status value={result.taxDue||fines.some(f=>f.plate===result.plate&&f.status==='Pendente')?'Com pendência':'Regular'}/></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Info label="Proprietário atual" value={result.owner}/><Info label="Condutor associado" value={result.driver||'Sem condutor associado'}/><Info label="Cor / Ano / Categoria" value={`${result.color||'Branco'} · ${result.year} · ${result.category}`}/><Info label="Situação legal / operacional" value={result.legalStatus||'Regular'}/><Info label="Distrito" value={result.district}/><Info label="Imposto de Circulação" value={result.taxDue?`${currency(result.taxDue)} em dívida`:'Sem dívida'}/><Info label="Multas pendentes do veículo/condutor" value={currency(fines.filter(f=>f.status==='Pendente'&&(f.plate===result.plate||f.driver===result.driver)).reduce((sum,f)=>sum+f.amount,0))}/></div>{plateOccurrences.length>0&&<div className="mt-5 border-t border-[#e9e6dc] pt-4"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#9f1a2b]">Ocorrências, apreensões, roubos e baixas ({plateOccurrences.length})</div><div className="space-y-2">{plateOccurrences.map(o=><div key={o.id} className="border border-[#e9e6dc] bg-[#f8f7f2] p-3 text-xs"><div className="flex justify-between font-semibold text-[#1c3024]"><span>{o.eventType} → <Status value={o.resultingStatus}/></span><span className="text-[#737a70]">{o.date}</span></div><div className="mt-1 text-[#697168]">{o.reason}{o.processNumber?` · Proc./Auto: ${o.processNumber}`:''}{o.authority?` · ${o.authority}`:''}</div></div>)}</div></div>}{plateHistory.length>0&&<div className="mt-5 border-t border-[#e9e6dc] pt-4"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#4b5549]">Histórico de proprietários ({plateHistory.length})</div><div className="space-y-2">{plateHistory.map(h=><div key={h.id} className="border border-[#e9e6dc] bg-[#f8f7f2] p-3 text-xs"><div className="flex justify-between font-semibold text-[#1c3024]"><span>{h.previousOwner} → {h.newOwner}</span><span className="text-[#737a70]">{h.transferDate}</span></div><div className="mt-1 text-[#697168]">{h.reason}{h.notes?` · ${h.notes}`:''}</div></div>)}</div></div>}<div className="mt-4 flex items-start gap-2 border-l-2 border-[#FCD116] bg-[#f5f2e7] p-3 text-xs leading-5"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#006B35]"/>Os dados de ocorrências, baixas e histórico de titularidade permanecem arquivados no banco de dados para consultas futuras.</div></>:<div className="flex items-center gap-3 text-sm"><AlertTriangle className="text-[#CE1126]"/> Matrícula não encontrada na base local.</div>}</div>}</Shell>;}
function Info({label,value}:{label:string;value:string}){return <div><div className="text-xs text-[#737a70]">{label}</div><div className="mt-1 font-medium">{value}</div></div>;}

export function VehicleRegistry(){const [vehicles,setVehicles]=useSaved('vehicles',seedVehicles);const [drivers]=useSaved('drivers',seedDrivers);const [open,setOpen]=useState(false);const [editing,setEditing]=useState<Vehicle|null>(null);const [error,setError]=useState('');const [successMsg,setSuccessMsg]=useState('');const [query,setQuery]=useState('');const visibleVehicles=vehicles.filter(v=>[v.plate,v.owner,v.driver,v.make,v.model,v.color||''].join(' ').toLowerCase().includes(query.toLowerCase()));async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const formEl=e.currentTarget;const form=new FormData(formEl);const payload:Vehicle={plate:editing?editing.plate:String(form.get('plate')).toUpperCase().trim(),make:String(form.get('make')).trim(),model:String(form.get('model')).trim(),year:Number(form.get('year')),color:String(form.get('color')||'Branco').trim()||'Branco',owner:String(form.get('owner')).trim(),driver:String(form.get('driver')||''),taxDue:editing?editing.taxDue:0,district:String(form.get('district')).trim(),category:String(form.get('category')).trim()};try{setError('');setSuccessMsg('');if(editing){const res=await api.put<Vehicle>(`/vehicles/${encodeURIComponent(editing.plate)}`,payload);setVehicles(rows=>rows.map(v=>v.plate===editing.plate?res.data:v));setSuccessMsg(`Características do veículo ${editing.plate} alteradas com sucesso!`);}else{const res=await api.post<Vehicle>('/vehicles',payload);setVehicles([...vehicles,res.data]);setSuccessMsg(`Veículo ${res.data.plate} cadastrado com sucesso!`);}formEl.reset();setEditing(null);window.dispatchEvent(new Event('sigetran:drawer-close'));}catch(err:any){setError(err?.response?.data?.error||'Não foi possível guardar os dados do veículo.');}}function startCreate(){setEditing(null);setError('');setSuccessMsg('');setOpen(true);}function startEdit(vehicle:Vehicle){setEditing(vehicle);setError('');setSuccessMsg('');setOpen(true);}async function handleDelete(plate:string){if(!window.confirm(`Deseja realmente remover o veículo ${plate}?`))return;try{await api.delete(`/vehicles/${encodeURIComponent(plate)}`);}catch{/* ignore */}setVehicles(rows=>rows.filter(v=>v.plate!==plate));}
  return <Shell><Title eyebrow="Registo nacional" title="Veículos e matrículas" description="Cadastro da frota, alteração de características do veículo, cor, titulares e condutores associados." icon={CarFront}/><div className="mb-4 flex flex-wrap justify-end gap-2"><Link to="/vehicle-occurrences" className={secondaryClass}><ShieldCheck size={16}/> Apreensões, roubos e baixa definitiva</Link><Link to="/ownership-transfers" className={secondaryClass}><ArrowRight size={16}/> Transferência e histórico de proprietários</Link><button onClick={()=>{if(open){setOpen(false);setEditing(null);}else{startCreate();}}} className={primaryClass}><FilePlus2 size={16}/> {open?'Fechar formulário':'Novo registo de veículo'}</button></div>{successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}{open&&<Drawer title={editing?`Alterar características · ${editing.plate}`:'Dados do veículo'} onClose={()=>{setOpen(false);setEditing(null);}}><form key={editing?.plate||'new'} onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><label className="block text-xs font-semibold text-[#4b5549]">Matrícula<input className={`mt-1.5 ${inputClass} ${editing?'bg-[#eeede5] font-semibold text-[#4b5549]':''}`} type="text" name="plate" required defaultValue={editing?.plate} readOnly={Boolean(editing)} placeholder="GB-24-XY"/></label><Field label="Marca" name="make" defaultValue={editing?.make}/><Field label="Modelo" name="model" defaultValue={editing?.model}/><Field label="Ano" name="year" type="number" defaultValue={editing?String(editing.year):undefined}/><Field label="Cor" name="color" defaultValue={editing?.color||'Branco'} placeholder="Ex.: Branco, Prata, Preto, Azul"/><Field label="Proprietário" name="owner" defaultValue={editing?.owner}/><label className="block text-xs font-semibold text-[#4b5549]">Condutor principal (opcional)<select name="driver" defaultValue={editing?.driver||''} className={`mt-1.5 ${inputClass}`}><option value="">Sem condutor associado</option>{drivers.map(d=><option key={d.id} value={d.name}>{d.name} · {d.license}</option>)}</select></label><Field label="Categoria" name="category" defaultValue={editing?.category} placeholder="Ligeiro / motociclo / colectivo"/><Field label="Distrito" name="district" defaultValue={editing?.district}/><div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3"><button className={primaryClass}>{editing?'Guardar alterações de características':'Guardar no registo'}</button>{editing&&<button type="button" onClick={()=>{setEditing(null);window.dispatchEvent(new Event('sigetran:drawer-close'));}} className={secondaryClass}>Cancelar</button>}</div></form>{error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}</Drawer>}<div className="mt-5 border border-[#dcd9cc] bg-white p-4"><label className="mb-4 flex max-w-md items-center gap-2 border border-[#d5d1c2] px-3"><Search size={16} className="text-[#737a70]"/><input aria-label="Pesquisar veículos" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pesquisar matrícula, cor, titular ou modelo" className="w-full py-2.5 text-sm outline-none"/></label><VehicleTable rows={visibleVehicles} onEdit={startEdit} onDelete={handleDelete}/></div></Shell>;
}

export function OwnershipTransferAndHistory(){
  const [vehicles,setVehicles]=useSaved('vehicles',seedVehicles);
  const [drivers]=useSaved('drivers',seedDrivers);
  const [transfers,setTransfers]=useSaved('ownership-transfers',seedOwnershipTransfers);
  const [open,setOpen]=useState(false);
  const [plateQuery,setPlateQuery]=useState('');
  const [showSuggestions,setShowSuggestions]=useState(false);
  const [searchFilter,setSearchFilter]=useState('');
  const [plateFilter,setPlateFilter]=useState('');
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');

  const matchedVehicles=useMemo(()=>{
    const q=plateQuery.trim().toLowerCase();
    return q?vehicles.filter(v=>v.plate.toLowerCase().includes(q)||v.owner.toLowerCase().includes(q)||`${v.make} ${v.model}`.toLowerCase().includes(q)):vehicles;
  },[vehicles,plateQuery]);

  const selectedVehicle=useMemo(()=>vehicles.find(v=>v.plate.toUpperCase()===plateQuery.trim().toUpperCase()),[vehicles,plateQuery]);

  const filteredTransfers=useMemo(()=>{
    return transfers.filter(t=>{
      if(plateFilter&&t.plate.toUpperCase()!==plateFilter.toUpperCase())return false;
      if(!searchFilter.trim())return true;
      const q=searchFilter.toLowerCase();
      return [t.id,t.plate,t.vehicleLabel,t.previousOwner,t.previousDocument,t.newOwner,t.newDocument,t.reason,t.notes,t.district].join(' ').toLowerCase().includes(q);
    });
  },[transfers,plateFilter,searchFilter]);

  async function submitTransfer(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const vehicle=selectedVehicle||vehicles.find(v=>v.plate.toUpperCase()===String(f.get('plate')||'').trim().toUpperCase());
    if(!vehicle){
      setError('Selecione um veículo válido pela matrícula.');
      return;
    }
    const newOwner=String(f.get('newOwner')||'').trim();
    if(newOwner.toLowerCase()===vehicle.owner.trim().toLowerCase()){
      setError('O novo proprietário deve ser diferente do proprietário atual.');
      return;
    }
    const payload={
      plate:vehicle.plate,
      previousDocument:String(f.get('previousDocument')||'').trim(),
      newOwner,
      newDocument:String(f.get('newDocument')||'').trim(),
      newDriver:String(f.get('newDriver')||newOwner).trim(),
      district:String(f.get('district')||vehicle.district).trim(),
      transferDate:String(f.get('transferDate')||new Date().toISOString().slice(0,10)),
      reason:String(f.get('reason')||'Compra e venda'),
      notes:String(f.get('notes')||'').trim(),
    };
    try{
      setError('');
      const res=await api.post<{transfer:OwnershipTransfer;vehicle:Vehicle}>('/ownership-transfers',payload);
      setTransfers([res.data.transfer,...transfers]);
      setVehicles(rows=>rows.map(v=>v.plate===res.data.vehicle.plate?res.data.vehicle:v));
      setSuccessMsg(`Transferência do veículo ${vehicle.plate} concluída: ${res.data.transfer.previousOwner} → ${res.data.transfer.newOwner}. Registo guardado no histórico.`);
      setPlateQuery('');
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível concluir a transferência de propriedade.');
    }
  }

  return <Shell>
    <Title eyebrow="Titularidade e arquivo histórico" title="Transferência de propriedade e Histórico de proprietários" description="Realize a transferência de titularidade de veículos e consulte todo o histórico de antigos e atuais proprietários." icon={CarFront}/>
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Transferências registadas" value={String(transfers.length)} detail="Histórico permanente no banco procon" icon={ClipboardList}/>
      <Stat label="Veículos com histórico" value={String(new Set(transfers.map(t=>t.plate)).size)} detail="Matrículas com cadeia de domínio" icon={CarFront}/>
      <Stat label="Última movimentação" value={transfers[0]?.transferDate||'—'} detail={transfers[0]?`${transfers[0].plate} · ${transfers[0].newOwner}`:'Sem transferências'} icon={Users}/>
    </div>
    {successMsg&&<div role="status" className="mb-4 border border-[#009E49]/30 bg-[#009E49]/10 p-3 text-sm text-[#006B35]">{successMsg}</div>}
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 border border-[#d5d1c2] bg-white px-3">
          <Search size={16} className="text-[#737a70]"/>
          <input aria-label="Pesquisar no histórico" value={searchFilter} onChange={e=>setSearchFilter(e.target.value)} placeholder="Pesquisar matrícula, ex-proprietário, atual ou documento" className="w-72 py-2.5 text-sm outline-none"/>
        </label>
        <select aria-label="Filtrar por veículo" value={plateFilter} onChange={e=>setPlateFilter(e.target.value)} className="border border-[#d5d1c2] bg-white px-3 py-2.5 text-sm outline-none">
          <option value="">Todas as matrículas</option>
          {vehicles.map(v=><option key={v.plate} value={v.plate}>{v.plate} · Atual: {v.owner}</option>)}
        </select>
      </div>
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Realizar transferência de propriedade'}</button>
    </div>

    {open&&<Drawer title="Transferência de propriedade de veículo" onClose={()=>{setOpen(false);setError('');}}>
      <form onSubmit={submitTransfer} className="grid gap-3 sm:grid-cols-2">
        <div className="relative sm:col-span-2">
          <label className="block text-xs font-semibold text-[#4b5549]">Veículo (Digite a matrícula ou nome do titular atual)
            <input name="plate" value={plateQuery} onFocus={()=>setShowSuggestions(true)} onBlur={()=>setTimeout(()=>setShowSuggestions(false),180)} onChange={e=>{setPlateQuery(e.target.value.toUpperCase());setShowSuggestions(true);setError('');}} placeholder="Ex.: GB-24-BC" autoComplete="off" required className={`mt-1.5 ${inputClass}`}/>
          </label>
          {showSuggestions&&matchedVehicles.length>0&&<ul role="listbox" className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto border border-[#dcd9cc] bg-white shadow-lg">
            {matchedVehicles.map(v=><li key={v.plate} role="option" aria-selected={selectedVehicle?.plate===v.plate} onMouseDown={e=>{e.preventDefault();setPlateQuery(v.plate);setShowSuggestions(false);setError('');}} className="cursor-pointer border-b border-[#f0eee7] px-3 py-2 text-xs last:border-b-0 hover:bg-[#009E49]/10">
              <div className="flex items-center justify-between font-bold text-[#1c3024]"><span>{v.plate}</span><span className="text-[10px] font-normal text-[#737a70]">{v.make} {v.model} ({v.year})</span></div>
              <div className="mt-0.5 text-[11px] text-[#006B35]">Proprietário atual: <b>{v.owner}</b> · Distrito: {v.district}</div>
            </li>)}
          </ul>}
        </div>

        <label className="block text-xs font-semibold text-[#4b5549]">Proprietário atual (Transmitente)
          <input value={selectedVehicle?selectedVehicle.owner:'Selecione um veículo acima'} readOnly className={`mt-1.5 ${inputClass} bg-[#f4f3ed] font-semibold text-[#1c3024]`}/>
        </label>
        <Field label="Documento / NIF do transmitente (opcional)" name="previousDocument" required={false} placeholder="Ex.: 000000001"/>

        <Field label="Novo proprietário (Adquirente)" name="newOwner" placeholder="Nome completo ou entidade"/>
        <Field label="Documento / NIF do novo proprietário" name="newDocument" placeholder="N.º de identificação ou NIF"/>

        <label className="block text-xs font-semibold text-[#4b5549]">Novo condutor associado (opcional)
          <select name="newDriver" className={`mt-1.5 ${inputClass}`}>
            <option value="">Usar o novo proprietário como condutor</option>
            {drivers.map(d=><option key={d.id} value={d.name}>{d.name} · {d.license}</option>)}
          </select>
        </label>
        <Field label="Distrito de registo" name="district" defaultValue={selectedVehicle?.district||'Bissau'} placeholder="Ex.: Bissau"/>

        <label className="block text-xs font-semibold text-[#4b5549]">Motivo / Natureza da transferência
          <select name="reason" className={`mt-1.5 ${inputClass}`}>
            <option value="Compra e venda">Compra e venda</option>
            <option value="Doação">Doação</option>
            <option value="Sucessão / Herança">Sucessão / Herança</option>
            <option value="Transferência institucional">Transferência institucional</option>
          </select>
        </label>
        <Field label="Data da transferência" name="transferDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>

        <div className="sm:col-span-2">
          <Field label="Observações / N.º do processo ou reconhecimento notarial (opcional)" name="notes" required={false} placeholder="Ex.: Contrato de compra e venda reconhecido · Processo n.º 210/2026"/>
        </div>

        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Confirmar transferência e arquivar histórico</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
      <p className="mt-3 text-[11px] text-[#737a70]">Ao confirmar, o titular atual passa a constar no histórico permanente de proprietários (<code>historico_proprietarios</code>) e o veículo passa para o nome do novo proprietário.</p>
    </Drawer>}

    <div className="mt-5 overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <div className="mb-3 flex items-center justify-between border-b border-[#e9e6dc] pb-3">
        <h2 className="font-serif text-lg font-bold text-[#1c3024]">Registo Histórico de Proprietários</h2>
        <span className="text-xs text-[#737a70]">{filteredTransfers.length} registo(s) encontrado(s)</span>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Ref.ª','Data','Matrícula / Veículo','Proprietário Anterior (Transmitente)','Novo Proprietário (Adquirente)','Natureza / Observações','Distrito'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filteredTransfers.map(t=><tr key={t.id} className="border-b border-[#f0eee7]">
            <td className="whitespace-nowrap px-3 py-3 font-mono text-xs">{t.id}</td>
            <td className="whitespace-nowrap px-3 py-3">{t.transferDate}</td>
            <td className="whitespace-nowrap px-3 py-3 font-semibold">{t.plate}<span className="block text-[11px] font-normal text-[#737a70]">{t.vehicleLabel||'—'}</span></td>
            <td className="px-3 py-3"><span className="font-medium text-[#9f1a2b]">{t.previousOwner}</span>{t.previousDocument&&<span className="block text-[11px] text-[#737a70]">Doc.: {t.previousDocument}</span>}</td>
            <td className="px-3 py-3"><span className="font-semibold text-[#006B35]">{t.newOwner}</span>{t.newDocument&&<span className="block text-[11px] text-[#737a70]">Doc.: {t.newDocument}</span>}</td>
            <td className="px-3 py-3"><span className="font-medium">{t.reason}</span>{t.notes&&<span className="block text-[11px] text-[#737a70]">{t.notes}</span>}</td>
            <td className="px-3 py-3">{t.district||'—'}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function VehicleLegalStatusAndWriteOff(){
  const [vehicles,setVehicles]=useSaved('vehicles',seedVehicles);
  const [occurrences,setOccurrences]=useSaved('vehicle-occurrences',seedVehicleOccurrences);
  const [drawerMode,setDrawerMode]=useState<'occurrence'|'writeoff'|null>(null);
  const [plateQuery,setPlateQuery]=useState('');
  const [showSuggestions,setShowSuggestions]=useState(false);
  const [tabFilter,setTabFilter]=useState<'all'|'occurrence'|'writeoff'>('all');
  const [searchFilter,setSearchFilter]=useState('');
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');

  const matchedVehicles=useMemo(()=>{
    const q=plateQuery.trim().toLowerCase();
    return q?vehicles.filter(v=>v.plate.toLowerCase().includes(q)||v.owner.toLowerCase().includes(q)||`${v.make} ${v.model}`.toLowerCase().includes(q)):vehicles;
  },[vehicles,plateQuery]);

  const selectedVehicle=useMemo(()=>vehicles.find(v=>v.plate.toUpperCase()===plateQuery.trim().toUpperCase()),[vehicles,plateQuery]);

  const filteredOccurrences=useMemo(()=>{
    return occurrences.filter(o=>{
      if(tabFilter==='occurrence'&&o.recordCategory==='Cancelamento e Baixa Definitiva')return false;
      if(tabFilter==='writeoff'&&o.recordCategory!=='Cancelamento e Baixa Definitiva')return false;
      if(!searchFilter.trim())return true;
      const q=searchFilter.toLowerCase();
      return [o.id,o.plate,o.vehicleLabel||'',o.owner||'',o.eventType,o.resultingStatus,o.reason,o.authority||'',o.processNumber||'',o.location||''].join(' ').toLowerCase().includes(q);
    });
  },[occurrences,tabFilter,searchFilter]);

  const seizedCount=vehicles.filter(v=>v.legalStatus==='Apreendido').length;
  const stolenCount=vehicles.filter(v=>v.legalStatus==='Roubado / Furtado').length;
  const recoveredCount=vehicles.filter(v=>v.legalStatus==='Recuperado').length;
  const writtenOffCount=vehicles.filter(v=>v.legalStatus==='Cancelado / Baixa Definitiva').length;

  async function submitForm(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const vehicle=selectedVehicle||vehicles.find(v=>v.plate.toUpperCase()===String(f.get('plate')||'').trim().toUpperCase());
    if(!vehicle){
      setError('Selecione um veículo válido da lista sugestiva.');
      return;
    }
    const eventType=String(f.get('eventType')||'').trim();
    const isWriteOff=drawerMode==='writeoff'||eventType==='Cancelamento de Matrícula'||eventType==='Baixa Definitiva';
    const statusMap:Record<string,string>={
      'Apreensão de Veículo':'Apreendido',
      'Roubo / Furto':'Roubado / Furtado',
      'Recuperação / Restituição':'Recuperado',
      'Liberação / Regularização':'Regular',
      'Cancelamento de Matrícula':'Cancelado / Baixa Definitiva',
      'Baixa Definitiva':'Cancelado / Baixa Definitiva',
    };
    const payload={
      plate:vehicle.plate,
      recordCategory:isWriteOff?'Cancelamento e Baixa Definitiva':'Ocorrência Policial / Fiscalização',
      eventType,
      resultingStatus:statusMap[eventType]||'Apreendido',
      reason:String(f.get('reason')||'').trim(),
      authority:String(f.get('authority')||'').trim(),
      processNumber:String(f.get('processNumber')||'').trim(),
      location:String(f.get('location')||'').trim(),
      date:String(f.get('date')||new Date().toISOString().slice(0,10)),
      notes:String(f.get('notes')||'').trim(),
    };
    try{
      setError('');
      setSuccessMsg('');
      const res=await api.post<{occurrence:VehicleOccurrence;vehicle:Vehicle}>('/vehicle-occurrences',payload);
      setOccurrences([res.data.occurrence,...occurrences]);
      setVehicles(rows=>rows.map(v=>v.plate===res.data.vehicle.plate?res.data.vehicle:v));
      setSuccessMsg(`${res.data.occurrence.eventType} registado com sucesso para ${res.data.vehicle.plate} (Situação atual: ${res.data.vehicle.legalStatus}).`);
      setPlateQuery('');
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível guardar o registo.');
    }
  }

  async function handleDelete(id:string){
    if(!window.confirm(`Deseja remover o registo ${id} do histórico?`))return;
    try{await api.delete(`/vehicle-occurrences/${encodeURIComponent(id)}`);}catch{/* ignore */}
    setOccurrences(rows=>rows.filter(r=>r.id!==id));
  }

  return <Shell>
    <Title eyebrow="Controlo legal e operacional da frota" title="Apreensões, roubos, recuperações e baixa definitiva" description="Registe ocorrências de veículos apreendidos, roubados ou recuperados, bem como processos de cancelamento de matrícula e baixa definitiva." icon={ShieldCheck}/>

    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Veículos apreendidos" value={String(seizedCount)} detail="Retidos em parque / fiscalização" icon={AlertTriangle}/>
      <Stat label="Veículos roubados / furtados" value={String(stolenCount)} detail="Alerta ativo na base nacional" icon={ShieldCheck}/>
      <Stat label="Veículos recuperados" value={String(recoveredCount)} detail="Localizados / restituídos" icon={Check}/>
      <Stat label="Cancelamento e baixa definitiva" value={String(writtenOffCount)} detail="Matrículas canceladas / sucata" icon={CarFront}/>
    </div>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]">
      <span><Check size={16} className="mr-2 inline"/>{successMsg}</span>
      <button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button>
    </div>}

    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex border border-[#d5d1c2] bg-white p-0.5 text-xs font-semibold">
          <button type="button" onClick={()=>setTabFilter('all')} className={`px-3 py-2 ${tabFilter==='all'?'bg-[#173d2b] text-white':'text-[#4b5549] hover:bg-[#f4f3ed]'}`}>Todos ({occurrences.length})</button>
          <button type="button" onClick={()=>setTabFilter('occurrence')} className={`px-3 py-2 ${tabFilter==='occurrence'?'bg-[#173d2b] text-white':'text-[#4b5549] hover:bg-[#f4f3ed]'}`}>Apreendidos, Roubados e Recuperados</button>
          <button type="button" onClick={()=>setTabFilter('writeoff')} className={`px-3 py-2 ${tabFilter==='writeoff'?'bg-[#173d2b] text-white':'text-[#4b5549] hover:bg-[#f4f3ed]'}`}>Cancelamento e Baixa Definitiva</button>
        </div>
        <label className="flex items-center gap-2 border border-[#d5d1c2] bg-white px-3">
          <Search size={16} className="text-[#737a70]"/>
          <input aria-label="Pesquisar ocorrências" value={searchFilter} onChange={e=>setSearchFilter(e.target.value)} placeholder="Pesquisar matrícula, auto, motivo ou órgão" className="w-64 py-2 text-sm outline-none"/>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={()=>{setDrawerMode('occurrence');setError('');setPlateQuery('');}} className={primaryClass}><AlertTriangle size={16}/> Registar apreensão / roubo / recuperação</button>
        <button type="button" onClick={()=>{setDrawerMode('writeoff');setError('');setPlateQuery('');}} className="inline-flex items-center justify-center gap-2 bg-[#9f1a2b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7f1422]"><FilePlus2 size={16}/> Cancelamento / Baixa definitiva</button>
      </div>
    </div>

    {drawerMode&&<Drawer title={drawerMode==='writeoff'?'Cancelamento de matrícula e baixa definitiva':'Registo de apreensão, roubo ou recuperação'} onClose={()=>{setDrawerMode(null);setError('');}}>
      <form key={drawerMode} onSubmit={submitForm} className="grid gap-3 sm:grid-cols-2">
        <div className="relative sm:col-span-2">
          <label className="block text-xs font-semibold text-[#4b5549]">Veículo (Digite a matrícula ou nome do proprietário)
            <input name="plate" value={plateQuery} onFocus={()=>setShowSuggestions(true)} onBlur={()=>setTimeout(()=>setShowSuggestions(false),180)} onChange={e=>{setPlateQuery(e.target.value.toUpperCase());setShowSuggestions(true);setError('');}} placeholder="Ex.: GB-24-BC" autoComplete="off" required className={`mt-1.5 ${inputClass}`}/>
          </label>
          {showSuggestions&&matchedVehicles.length>0&&<ul role="listbox" className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto border border-[#dcd9cc] bg-white shadow-lg">
            {matchedVehicles.map(v=><li key={v.plate} role="option" aria-selected={selectedVehicle?.plate===v.plate} onMouseDown={e=>{e.preventDefault();setPlateQuery(v.plate);setShowSuggestions(false);setError('');}} className="cursor-pointer border-b border-[#f0eee7] px-3 py-2 text-xs last:border-b-0 hover:bg-[#009E49]/10">
              <div className="flex items-center justify-between font-bold text-[#1c3024]"><span>{v.plate} · {v.make} {v.model} ({v.year})</span><span className="text-[10px] font-normal text-[#737a70]">Cor: {v.color||'Branco'}</span></div>
              <div className="mt-0.5 flex items-center justify-between text-[11px] text-[#006B35]"><span>Proprietário: <b>{v.owner}</b></span><span>Situação atual: <b>{v.legalStatus||'Regular'}</b></span></div>
            </li>)}
          </ul>}
        </div>

        <label className="block text-xs font-semibold text-[#4b5549]">Titular e situação atual
          <input value={selectedVehicle?`${selectedVehicle.owner} · Situação: ${selectedVehicle.legalStatus||'Regular'}`:'Selecione um veículo acima'} readOnly className={`mt-1.5 ${inputClass} bg-[#f4f3ed] font-semibold text-[#1c3024]`}/>
        </label>

        {drawerMode==='occurrence'?<label className="block text-xs font-semibold text-[#4b5549]">Tipo de ocorrência
          <select name="eventType" className={`mt-1.5 ${inputClass}`}>
            <option value="Apreensão de Veículo">Apreensão de Veículo (Passa para Apreendido)</option>
            <option value="Roubo / Furto">Roubo / Furto (Passa para Roubado / Furtado)</option>
            <option value="Recuperação / Restituição">Recuperação / Restituição (Passa para Recuperado)</option>
            <option value="Liberação / Regularização">Liberação / Regularização (Restaura para Regular)</option>
          </select>
        </label>:<label className="block text-xs font-semibold text-[#4b5549]">Natureza do ato definitivo
          <select name="eventType" className={`mt-1.5 ${inputClass}`}>
            <option value="Baixa Definitiva">Baixa Definitiva do Veículo</option>
            <option value="Cancelamento de Matrícula">Cancelamento de Matrícula</option>
          </select>
        </label>}

        {drawerMode==='occurrence'?<Field label="Motivo da apreensão, roubo ou recuperação" name="reason" placeholder="Ex.: Infração grave / Furto participado / Localizado pela Polícia"/>:<label className="block text-xs font-semibold text-[#4b5549]">Motivo do cancelamento / baixa definitiva
          <select name="reason" className={`mt-1.5 ${inputClass}`}>
            <option value="Fim de vida útil / Sucata / Desmantelamento">Fim de vida útil / Sucata / Desmantelamento</option>
            <option value="Sinistro com perda total irrecuperável">Sinistro com perda total irrecuperável</option>
            <option value="Exportação definitiva para outro país">Exportação definitiva para outro país</option>
            <option value="Cancelamento administrativo ou ordem judicial">Cancelamento administrativo ou ordem judicial</option>
            <option value="Duplicidade ou vício insanável de registo">Duplicidade ou vício insanável de registo</option>
          </select>
        </label>}

        <Field label="Autoridade / Órgão responsável" name="authority" defaultValue={drawerMode==='writeoff'?'Direção Geral de Viação e Transportes Terrestres':'Brigada de Trânsito / Polícia de Ordem Pública'}/>
        <Field label={drawerMode==='writeoff'?'N.º do processo / certidão de baixa':'N.º do auto de apreensão / boletim de ocorrência'} name="processNumber" required={false} placeholder={drawerMode==='writeoff'?'Ex.: PROC-BXA-2026/041':'Ex.: AUTO-APR-2026/112'}/>
        <Field label={drawerMode==='writeoff'?'Delegação / Local de entrega das chapas':'Local da ocorrência / Parque de apreensão'} name="location" required={false} defaultValue={selectedVehicle?.district||'Bissau'} placeholder="Ex.: Parque Nacional de Apreensões · Bissau"/>
        <Field label="Data do registo" name="date" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>

        <div className="sm:col-span-2">
          <Field label="Observações complementares (opcional)" name="notes" required={false} placeholder={drawerMode==='writeoff'?'Ex.: Chapas de matrícula recolhidas e inutilizadas nos termos legais':'Ex.: Documento único retido; aguarda vistoria ou restituição'}/>
        </div>

        <div className="sm:col-span-2 flex items-end gap-2 pt-2">
          <button className={drawerMode==='writeoff'?'inline-flex items-center justify-center gap-2 bg-[#9f1a2b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7f1422]':primaryClass}>
            {drawerMode==='writeoff'?'Confirmar cancelamento / baixa definitiva':'Registar ocorrência e atualizar veículo'}
          </button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="mt-5 overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <div className="mb-3 flex items-center justify-between border-b border-[#e9e6dc] pb-3">
        <h2 className="font-serif text-lg font-bold text-[#1c3024]">Registo Nacional de Ocorrências, Apreensões, Roubos e Baixas Definitivas</h2>
        <span className="text-xs text-[#737a70]">{filteredOccurrences.length} registo(s)</span>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Ref.ª','Data','Matrícula / Veículo','Tipo de Evento','Situação Resultante','Motivo / Processo','Órgão / Local','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filteredOccurrences.map(o=><tr key={o.id} className="border-b border-[#f0eee7]">
            <td className="whitespace-nowrap px-3 py-3 font-mono text-xs">{o.id}</td>
            <td className="whitespace-nowrap px-3 py-3">{o.date}</td>
            <td className="whitespace-nowrap px-3 py-3 font-semibold">{o.plate}<span className="block text-[11px] font-normal text-[#737a70]">{o.vehicleLabel||'—'} · {o.owner||'—'}</span></td>
            <td className="whitespace-nowrap px-3 py-3 font-medium">{o.eventType}<span className="block text-[10px] uppercase tracking-wider text-[#737a70]">{o.recordCategory}</span></td>
            <td className="whitespace-nowrap px-3 py-3"><Status value={o.resultingStatus}/></td>
            <td className="px-3 py-3"><span className="font-medium">{o.reason}</span>{o.processNumber&&<span className="block text-[11px] text-[#006B35]">Proc./Auto: {o.processNumber}</span>}{o.notes&&<span className="block text-[11px] text-[#737a70]">{o.notes}</span>}</td>
            <td className="px-3 py-3 text-xs">{o.authority||'—'}{o.location&&<span className="block text-[11px] text-[#737a70]">{o.location}</span>}</td>
            <td className="whitespace-nowrap px-3 py-3"><button type="button" onClick={()=>handleDelete(o.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Remover</button></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function DriverRegistry(){const [drivers,setDrivers]=useSaved('drivers',seedDrivers);const [open,setOpen]=useState(false);const [editing,setEditing]=useState<Driver|null>(null);const [documentError,setDocumentError]=useState('');function openCreate(){setEditing(null);setDocumentError('');setOpen(true);}function openEdit(driver:Driver){setEditing(driver);setDocumentError('');setOpen(true);}function closeDrawer(){setOpen(false);setEditing(null);setDocumentError('');}async function handleDelete(id:string){try{await api.delete(`/drivers/${encodeURIComponent(id)}`);}catch{/* ignore */}setDrivers(rows=>rows.filter(d=>d.id!==id));}async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget;const f=new FormData(form);const file=f.get('documentFile') as File|null;if(file&&file.size>1_000_000){setDocumentError('O ficheiro deve ter no máximo 1 MB para armazenamento local.');return;}try{let docFile=editing?.documentFile;if(file&&file.size>0){const dataUrl=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Não foi possível ler o documento.'));reader.readAsDataURL(file);});docFile={name:file.name,dataUrl};}const payload={id:editing?editing.id:`D-${String(Date.now()).slice(-5)}`,name:String(f.get('name')),document:String(f.get('document')),license:String(f.get('license')),category:String(f.get('category')),phone:String(f.get('phone')),district:String(f.get('district')),status:String(f.get('status')||editing?.status||'Ativo'),documentFile:docFile};if(editing){const res=await api.put<Driver>(`/drivers/${encodeURIComponent(editing.id)}`,payload);setDrivers(rows=>rows.map(d=>d.id===editing.id?res.data:d));}else{const res=await api.post<Driver>('/drivers',payload);setDrivers([res.data,...drivers]);}form.reset();setDocumentError('');window.dispatchEvent(new Event('sigetran:drawer-close'));}catch(err:any){setDocumentError(err?.response?.data?.error||'Não foi possível guardar os dados do condutor.');}}
  return <Shell><Title eyebrow="Registo nacional" title="Condutores e cartas" description="Cadastro de titulares, habilitações, contacto e delegação de registo." icon={Users}/><div className="mb-4 flex justify-end"><button onClick={()=>open?closeDrawer():openCreate()} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Cadastrar condutor'}</button></div>{open&&<Drawer title={editing?`Editar condutor (${editing.id})`:'Identificação do condutor'} onClose={closeDrawer}><form key={editing?.id||'new'} onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Field label="Nome completo" name="name" defaultValue={editing?.name}/><Field label="N.º de identificação" name="document" defaultValue={editing?.document}/><Field label="N.º da carta" name="license" defaultValue={editing?.license}/><Field label="Categorias habilitadas" name="category" defaultValue={editing?.category}/><Field label="Telefone" name="phone" defaultValue={editing?.phone}/><Field label="Distrito" name="district" defaultValue={editing?.district}/><label className="block text-xs font-semibold text-[#4b5549]">Estado<select name="status" defaultValue={editing?.status||'Ativo'} className={`mt-1.5 ${inputClass}`}><option value="Ativo">Ativo</option><option value="Suspenso">Suspenso</option><option value="Inativo">Inativo</option></select></label><label className="block text-xs font-semibold text-[#4b5549]">Documento comprobatório (PDF ou imagem){editing?' (opcional)':''}<input type="file" name="documentFile" accept=".pdf,.jpg,.jpeg,.png" required={!editing} className={`mt-1.5 ${inputClass} file:mr-3 file:border-0 file:bg-[#173d2b] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white`}/></label><p className="text-[11px] leading-4 text-[#737a70] sm:col-span-2 lg:col-span-3">Ficheiro até 1 MB. {editing?'Deixe em branco para manter o documento atual.':'O campo “N.º de identificação” continua a registar o número do documento.'}</p>{documentError&&<p role="alert" className="text-sm text-[#9f1a2b] sm:col-span-2 lg:col-span-3">{documentError}</p>}<div className="flex items-end"><button className={primaryClass}>{editing?'Salvar alterações':'Guardar condutor'}</button></div></form></Drawer>}<div className="mt-5 overflow-x-auto border border-[#dcd9cc] bg-white p-4"><table className="w-full text-left text-sm"><thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]"><tr>{['Código','Condutor','Identificação','Documento','Carta / categorias','Contacto','Distrito','Estado','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr></thead><tbody>{drivers.map(d=><tr key={d.id} className="border-b border-[#f0eee7]"><td className="px-3 py-3">{d.id}</td><td className="whitespace-nowrap px-3 py-3 font-semibold">{d.name}</td><td className="px-3 py-3">{d.document}</td><td className="px-3 py-3">{d.documentFile?<a href={d.documentFile.dataUrl} download={d.documentFile.name} className="font-semibold text-[#006B35] underline">{d.documentFile.name}</a>:'—'}</td><td className="px-3 py-3">{d.license}<span className="block text-[11px] text-[#737a70]">{d.category}</span></td><td className="px-3 py-3">{d.phone}</td><td className="px-3 py-3">{d.district}</td><td className="px-3 py-3"><Status value={d.status}/></td><td className="whitespace-nowrap px-3 py-3"><div className="flex items-center gap-3"><button type="button" onClick={()=>openEdit(d)} className="text-xs font-semibold text-[#006B35] hover:underline">Editar</button><button type="button" onClick={()=>handleDelete(d.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Excluir</button></div></td></tr>)}</tbody></table></div></Shell>;
}

export function CirculationTax(){const [vehicles,setVehicles]=useSaved('vehicles',seedVehicles);const [message,setMessage]=useState('');function pay(plate:string){setVehicles(rows=>rows.map(v=>v.plate===plate?{...v,taxDue:0}:v));setMessage(`Pagamento de demonstração registado para ${plate}.`);}return <Shell><Title eyebrow="Receita e regularização" title="Imposto de Circulação" description="Acompanhe obrigações simuladas por matrícula e registe pagamentos de demonstração." icon={Banknote}/><div className="mb-5 border-l-2 border-[#FCD116] bg-[#f5f2e7] p-4 text-sm leading-6"><b>Nomenclatura local:</b> Imposto de Circulação de Veículos, Motocicletas e Embarcações. A incidência depende da categoria; o valor anual divulgado para viaturas particulares foi 41.500 XOF. Esta tela não calcula imposto legal nem substitui uma guia da DGCI.</div>{message&&<div role="status" className="mb-4 border border-[#009E49]/30 bg-[#009E49]/10 p-3 text-sm text-[#006B35]">{message}</div>}<div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4"><table className="w-full text-left text-sm"><thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]"><tr>{['Matrícula','Titular','Categoria','Período','Valor demonstrativo','Estado','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr></thead><tbody>{vehicles.map(v=><tr key={v.plate} className="border-b border-[#f0eee7]"><td className="px-3 py-3 font-semibold">{v.plate}</td><td className="px-3 py-3">{v.owner}</td><td className="px-3 py-3">{v.category}</td><td className="px-3 py-3">2026</td><td className="px-3 py-3">{currency(v.taxDue)}</td><td className="px-3 py-3"><Status value={v.taxDue?'Pendente':'Pago'}/></td><td className="px-3 py-3"><button onClick={()=>pay(v.plate)} disabled={!v.taxDue} className={secondaryClass}><Check size={14}/> Simular pagamento</button></td></tr>)}</tbody></table></div></Shell>;}

export function FineManagement(){const [vehicles]=useSaved('vehicles',seedVehicles);const [fines,setFines]=useSaved('fines',seedFines);const [infractionTypes]=useSaved('infraction-types',seedInfractionTypes);const [open,setOpen]=useState(false);const [plateQuery,setPlateQuery]=useState('');const [showSuggestions,setShowSuggestions]=useState(false);const [selectedInfraction,setSelectedInfraction]=useState('');const [fineAmount,setFineAmount]=useState('');const [fineError,setFineError]=useState('');useEffect(()=>{if(open&&!selectedInfraction&&infractionTypes.length>0){setSelectedInfraction(infractionTypes[0].name);setFineAmount(String(infractionTypes[0].amount));}},[open,selectedInfraction,infractionTypes]);function handleInfractionChange(name:string){setSelectedInfraction(name);const found=infractionTypes.find(it=>it.name===name);if(found){setFineAmount(String(found.amount));}}const matchedVehicles=useMemo(()=>{const q=plateQuery.trim().toLowerCase();return q?vehicles.filter(v=>v.plate.toLowerCase().includes(q)||v.owner.toLowerCase().includes(q)||(v.driver||'').toLowerCase().includes(q)):vehicles;},[vehicles,plateQuery]);const selectedVehicle=useMemo(()=>vehicles.find(v=>v.plate.toUpperCase()===plateQuery.trim().toUpperCase()),[vehicles,plateQuery]);async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const formEl=e.currentTarget;const f=new FormData(formEl);const vehicle=selectedVehicle||vehicles.find(v=>v.plate.toUpperCase()===String(f.get('plate')||'').trim().toUpperCase());if(!vehicle){setFineError('Selecione um veículo válido da lista sugestiva.');return;}try{setFineError('');const payload={id:`GB-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,plate:vehicle.plate,driver:vehicle.driver||vehicle.owner,infraction:selectedInfraction||String(f.get('infraction')),amount:Number(fineAmount||f.get('amount')),date:String(f.get('date')),status:'Pendente' as const};const res=await api.post<Fine>('/fines',payload);setFines([res.data,...fines]);setPlateQuery('');formEl.reset();window.dispatchEvent(new Event('sigetran:drawer-close'));}catch(err:any){setFineError(err?.response?.data?.error||'Não foi possível emitir o auto de infração.');}}async function payFine(id:string){try{await api.put(`/fines/${encodeURIComponent(id)}`,{status:'Pago'});}catch{/* ignore */}setFines(rows=>rows.map(row=>row.id===id?{...row,status:'Pago'}:row));}
  return <Shell><Title eyebrow="Fiscalização rodoviária" title="Multas e infrações" description="Emita autos simulados, vincule matrícula e condutor, e acompanhe pagamentos." icon={ClipboardList}/><div className="mb-4 flex flex-wrap justify-end gap-2"><Link to="/infraction-types" className={secondaryClass}><AlertTriangle size={16}/> Tabela de infrações e preços</Link><button onClick={()=>{const next=!open;setOpen(next);setFineError('');if(next&&infractionTypes.length>0){setSelectedInfraction(infractionTypes[0].name);setFineAmount(String(infractionTypes[0].amount));}}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Registar auto de infração'}</button></div>{open&&<Drawer title="Novo auto de infração" onClose={()=>{setOpen(false);setFineError('');}}><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="relative"><label className="block text-xs font-semibold">Veículo<input name="plate" value={plateQuery} onFocus={()=>setShowSuggestions(true)} onBlur={()=>setTimeout(()=>setShowSuggestions(false),180)} onChange={e=>{setPlateQuery(e.target.value.toUpperCase());setShowSuggestions(true);setFineError('');}} placeholder="Digite a placa (ex.: GB-24-BC)" autoComplete="off" required className={`mt-1.5 ${inputClass}`}/></label>{selectedVehicle&&<div className="mt-1 text-[11px] font-semibold text-[#006B35]">Dono: {selectedVehicle.owner}{selectedVehicle.driver&&selectedVehicle.driver!==selectedVehicle.owner?` · Condutor: ${selectedVehicle.driver}`:''}</div>}{showSuggestions&&matchedVehicles.length>0&&<ul role="listbox" className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto border border-[#dcd9cc] bg-white shadow-lg">{matchedVehicles.map(v=><li key={v.plate} role="option" aria-selected={selectedVehicle?.plate===v.plate} onMouseDown={e=>{e.preventDefault();setPlateQuery(v.plate);setShowSuggestions(false);setFineError('');}} className="cursor-pointer border-b border-[#f0eee7] px-3 py-2 text-xs last:border-b-0 hover:bg-[#009E49]/10"><div className="flex items-center justify-between font-bold text-[#1c3024]"><span>{v.plate}</span><span className="text-[10px] font-normal text-[#737a70]">{v.make} {v.model}</span></div><div className="mt-0.5 text-[11px] text-[#006B35]">Dono: <b>{v.owner}</b></div></li>)}</ul>}</div><label className="block text-xs font-semibold">Infração<select name="infraction" value={selectedInfraction} onChange={e=>handleInfractionChange(e.target.value)} className={`mt-1.5 ${inputClass}`}>{infractionTypes.map(it=><option key={it.id} value={it.name}>{it.name} ({currency(it.amount)})</option>)}</select></label><label className="block text-xs font-semibold text-[#4b5549]">Valor (XOF)<input name="amount" type="number" required value={fineAmount} onChange={e=>setFineAmount(e.target.value)} className={`mt-1.5 ${inputClass}`}/></label><Field label="Data" name="date" type="date" defaultValue={new Date().toISOString().slice(0,10)}/><div className="flex items-end"><button className={primaryClass}>Emitir auto</button></div></form>{fineError&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{fineError}</p>}<p className="mt-3 text-[11px] text-[#7a4c00]">O valor é preenchido automaticamente de acordo com a infração selecionada. Pode gerir as infrações e preços em <Link to="/infraction-types" className="font-semibold underline">Tabela de infrações</Link>.</p></Drawer>}<div className="mt-5 overflow-x-auto border border-[#dcd9cc] bg-white p-4"><table className="w-full text-left text-sm"><thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]"><tr>{['N.º do auto','Data','Matrícula','Condutor','Infração','Valor','Estado','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr></thead><tbody>{fines.map(f=><tr key={f.id} className="border-b border-[#f0eee7]"><td className="px-3 py-3">{f.id}</td><td className="px-3 py-3">{f.date}</td><td className="px-3 py-3 font-semibold">{f.plate}</td><td className="px-3 py-3">{f.driver||'—'}</td><td className="px-3 py-3">{f.infraction}</td><td className="px-3 py-3">{currency(f.amount)}</td><td className="px-3 py-3"><Status value={f.status}/></td><td className="px-3 py-3"><button disabled={f.status==='Pago'} onClick={()=>payFine(f.id)} className={secondaryClass}>Registar pagamento</button></td></tr>)}</tbody></table></div></Shell>;}

export function InfractionCatalog(){
  const [items,setItems]=useSaved('infraction-types',seedInfractionTypes);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<InfractionTypeItem|null>(null);
  const [error,setError]=useState('');
  function openCreate(){setEditing(null);setError('');setOpen(true);}
  function openEdit(item:InfractionTypeItem){setEditing(item);setError('');setOpen(true);}
  function closeDrawer(){setOpen(false);setEditing(null);setError('');}
  async function handleDelete(id:string){try{await api.delete(`/infraction-types/${encodeURIComponent(id)}`);}catch{/* ignore */}setItems(rows=>rows.filter(r=>r.id!==id));}
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const payload={
      id:editing?editing.id:`INF-${String(Date.now()).slice(-4)}`,
      name:String(f.get('name')).trim(),
      amount:Number(f.get('amount')),
      severity:String(f.get('severity')||'Média'),
      description:String(f.get('description')||'').trim(),
    };
    try{
      setError('');
      if(editing){
        const res=await api.put<InfractionTypeItem>(`/infraction-types/${encodeURIComponent(editing.id)}`,payload);
        setItems(rows=>rows.map(r=>r.id===editing.id?res.data:r));
      }else{
        const res=await api.post<InfractionTypeItem>('/infraction-types',payload);
        setItems([...items,res.data]);
      }
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível guardar a infração.');
    }
  }
  return <Shell><Title eyebrow="Enquadramento e coimas" title="Tabela de infrações e preços" description="Cadastre as infrações rodoviárias e os respetivos valores (XOF) para preenchimento automático na emissão de multas." icon={AlertTriangle}/><div className="mb-4 flex flex-wrap justify-end gap-2"><Link to="/fines" className={secondaryClass}><ClipboardList size={16}/> Ir para Multas e infrações</Link><button onClick={()=>open?closeDrawer():openCreate()} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Cadastrar infração'}</button></div>{open&&<Drawer title={editing?`Editar infração (${editing.id})`:'Nova infração e preço'} onClose={closeDrawer}><form key={editing?.id||'new'} onSubmit={submit} className="grid gap-3 sm:grid-cols-2"><Field label="Descrição da infração" name="name" defaultValue={editing?.name} placeholder="Ex.: Excesso de velocidade"/><Field label="Preço / Valor (XOF)" name="amount" type="number" defaultValue={editing?String(editing.amount):''} placeholder="Ex.: 35000"/><label className="block text-xs font-semibold text-[#4b5549]">Gravidade<select name="severity" defaultValue={editing?.severity||'Média'} className={`mt-1.5 ${inputClass}`}><option value="Leve">Leve</option><option value="Média">Média</option><option value="Grave">Grave</option><option value="Gravíssima">Gravíssima</option></select></label><Field label="Observação / enquadramento (opcional)" name="description" required={false} defaultValue={editing?.description} placeholder="Ex.: Artigo do código da estrada"/><div className="sm:col-span-2 flex items-end"><button className={primaryClass}>{editing?'Salvar alterações':'Guardar infração'}</button></div></form>{error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}</Drawer>}<div className="mt-5 overflow-x-auto border border-[#dcd9cc] bg-white p-4"><table className="w-full text-left text-sm"><thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]"><tr>{['Código','Infração','Gravidade','Observação','Preço (XOF)','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr></thead><tbody>{items.map(it=><tr key={it.id} className="border-b border-[#f0eee7]"><td className="px-3 py-3">{it.id}</td><td className="whitespace-nowrap px-3 py-3 font-semibold">{it.name}</td><td className="px-3 py-3"><Status value={it.severity}/></td><td className="px-3 py-3 text-xs text-[#737a70]">{it.description||'—'}</td><td className="whitespace-nowrap px-3 py-3 font-bold text-[#006B35]">{currency(it.amount)}</td><td className="whitespace-nowrap px-3 py-3"><div className="flex items-center gap-3"><button type="button" onClick={()=>openEdit(it)} className="text-xs font-semibold text-[#006B35] hover:underline">Editar</button><button type="button" onClick={()=>handleDelete(it.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Excluir</button></div></td></tr>)}</tbody></table></div></Shell>;
}

export function InspectionManagement(){const [vehicles]=useSaved('vehicles',seedVehicles);const [rows,setRows]=useSaved('inspections',seedInspections);const [open,setOpen]=useState(false);function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);setRows([{id:`ITV-${String(Date.now()).slice(-5)}`,plate:String(f.get('plate')),reason:String(f.get('reason')),office:String(f.get('office')),date:String(f.get('date')),status:'Agendada'},...rows]);e.currentTarget.reset();window.dispatchEvent(new Event('sigetran:drawer-close'));}
  return <Shell><Title eyebrow="Segurança rodoviária" title="Inspeções veiculares" description="Agenda de verificações e histórico de inspeção da frota registada." icon={ClipboardCheck}/><div className="mb-4 flex justify-end"><button onClick={()=>setOpen(!open)} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Agendar inspeção'}</button></div>{open&&<Drawer title="Agendamento de inspeção" onClose={()=>setOpen(false)}><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="block text-xs font-semibold">Matrícula<select name="plate" className={`mt-1.5 ${inputClass}`}>{vehicles.map(v=><option key={v.plate}>{v.plate}</option>)}</select></label><Field label="Tipo de inspeção" name="reason" defaultValue="Inspeção periódica"/><Field label="Delegação" name="office"/><Field label="Data" name="date" type="date"/><div className="flex items-end"><button className={primaryClass}>Confirmar agenda</button></div></form></Drawer>}<div className="mt-5 overflow-x-auto border border-[#dcd9cc] bg-white p-4"><table className="w-full text-left text-sm"><thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]"><tr>{['Referência','Matrícula','Tipo','Delegação','Data','Estado','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-b border-[#f0eee7]"><td className="px-3 py-3">{row.id}</td><td className="px-3 py-3 font-semibold">{row.plate}</td><td className="px-3 py-3">{row.reason}</td><td className="px-3 py-3">{row.office}</td><td className="px-3 py-3">{row.date}</td><td className="px-3 py-3"><Status value={row.status}/></td><td className="px-3 py-3"><button disabled={row.status==='Concluída'} onClick={()=>setRows(items=>items.map(item=>item.id===row.id?{...item,status:'Concluída'}:item))} className={secondaryClass}>Concluir</button></td></tr>)}</tbody></table></div></Shell>;}

export function ReportsManagement(){const [vehicles]=useSaved('vehicles',seedVehicles);const [drivers]=useSaved('drivers',seedDrivers);const [fines]=useSaved('fines',seedFines);const [inspections]=useSaved('inspections',seedInspections);const districts=useMemo(()=>Array.from(new Set(vehicles.map(v=>v.district))),[vehicles]);return <Shell><Title eyebrow="Informação de gestão" title="Relatórios nacionais" description="Indicadores consolidados a partir dos registos locais deste navegador." icon={FileBarChart2}/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Frota registada" value={String(vehicles.length)} detail="Veículos cadastrados" icon={CarFront}/><Stat label="Condutores ativos" value={String(drivers.filter(d=>d.status==='Ativo').length)} detail="Habilitações registadas" icon={Users}/><Stat label="Autos emitidos" value={String(fines.length)} detail={`${fines.filter(f=>f.status==='Pago').length} com pagamento registado`} icon={ClipboardList}/><Stat label="Inspeções na agenda" value={String(inspections.length)} detail="Registos de demonstração" icon={ClipboardCheck}/></div><Panel title="Distribuição por delegação"><div className="space-y-4">{districts.map(district=>{const count=vehicles.filter(v=>v.district===district).length;return <div key={district}><div className="mb-1 flex justify-between text-sm"><span>{district}</span><b>{count} veículo(s)</b></div><div className="h-2 bg-[#eeede5]"><div className="h-full bg-[#009E49]" style={{width:`${Math.max(8,count/vehicles.length*100)}%`}}/></div></div>})}</div><button onClick={()=>window.print()} className={`${secondaryClass} mt-5`}>Imprimir relatório</button></Panel></Shell>;}

export function SystemAdministration({settings=false}:{settings?:boolean}){
  const [users,setUsers]=useSaved('users',[{name:'Administrador do sistema',email:'admin@sigetran.gov.gw',role:'Administrador',office:'Direção Nacional',status:'Ativo'},{name:'Agente de trânsito',email:'agente@sigetran.gov.gw',role:'Fiscalização',office:'Bissau',status:'Ativo'}]);
  const [config,setConfig]=useSaved('config',{institution:'Ministério dos Transportes · Guiné-Bissau',system:'SIGETRAN',currency:'Franco CFA (XOF)',office:'Bissau'});
  const [saved,setSaved]=useState(false);const [open,setOpen]=useState(false);
  if(settings)return <Shell><Title eyebrow="Administração central" title="Configuração do sistema" description="Preferências locais do protótipo e parâmetros de apresentação institucional." icon={Settings}/><Panel title="Identificação institucional"><form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);setConfig({institution:String(f.get('institution')),system:String(f.get('system')),currency:String(f.get('currency')),office:String(f.get('office'))});setSaved(true);}} className="grid max-w-3xl gap-4 sm:grid-cols-2"><Field label="Instituição" name="institution" defaultValue={config.institution}/><Field label="Nome do sistema" name="system" defaultValue={config.system}/><Field label="Moeda de apresentação" name="currency" defaultValue={config.currency}/><Field label="Delegação padrão" name="office" defaultValue={config.office}/><div className="sm:col-span-2"><button className={primaryClass}>Guardar preferências</button>{saved&&<span className="ml-3 text-sm text-[#006B35]">Preferências guardadas neste navegador.</span>}</div></form></Panel><div className="mt-5 border-l-2 border-[#FCD116] bg-[#f5f2e7] p-4 text-sm leading-6">As taxas, infrações, sanções e prazos não são configuráveis aqui. Devem ser introduzidos somente após validação com os diplomas e tabelas oficiais aplicáveis.</div></Shell>;
  function createUser(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);setUsers([{name:String(f.get('name')),email:String(f.get('email')),role:String(f.get('role')),office:String(f.get('office')),status:'Ativo'},...users]);e.currentTarget.reset();window.dispatchEvent(new Event('sigetran:drawer-close'));}
  return <Shell><Title eyebrow="Administração central" title="Utilizadores e perfis" description="Registe os perfis de demonstração e a respetiva delegação de serviço." icon={UserRoundCog}/><div className="mb-4 flex justify-end"><button onClick={()=>setOpen(!open)} className={primaryClass}><UserRoundCog size={16}/>{open?'Fechar formulário':'Adicionar utilizador'}</button></div>{open&&<Drawer title="Novo utilizador" onClose={()=>setOpen(false)}><form onSubmit={createUser} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Field label="Nome" name="name"/><Field label="Email" name="email" type="email"/><label className="block text-xs font-semibold">Perfil<select name="role" className={`mt-1.5 ${inputClass}`}><option>Atendimento</option><option>Fiscalização</option><option>Registo de veículos</option><option>Administrador</option></select></label><Field label="Delegação" name="office"/><div className="flex items-end"><button className={primaryClass}>Guardar utilizador</button></div></form><p className="mt-3 text-xs text-[#737a70]">Acesso de demonstração local; este registo não cria uma conta real.</p></Drawer>}<div className="mt-5 overflow-x-auto border border-[#dcd9cc] bg-white p-4"><table className="w-full text-left text-sm"><thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]"><tr>{['Utilizador','Email','Perfil','Delegação','Estado'].map(x=><th key={x} className="px-3 py-3">{x}</th>)}</tr></thead><tbody>{users.map(u=><tr key={u.email} className="border-b border-[#f0eee7]"><td className="px-3 py-3 font-semibold">{u.name}</td><td className="px-3 py-3">{u.email}</td><td className="px-3 py-3">{u.role}</td><td className="px-3 py-3">{u.office}</td><td className="px-3 py-3"><Status value={u.status}/></td></tr>)}</tbody></table></div></Shell>;
}

export function TransportLanding(){return <div className="min-h-screen bg-[#173d2b] text-white"><div className="flex h-1.5"><div className="w-1/3 bg-[#CE1126]"/><div className="w-1/3 bg-[#FCD116]"/><div className="w-1/3 bg-[#009E49]"/></div><header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center border border-[#FCD116]/60 text-sm font-black text-[#FCD116]">GB</div><div><b className="tracking-wider">SIGETRAN</b><div className="text-xs text-[#c4d2c6]">Ministério dos Transportes · Guiné-Bissau</div></div></div><Link to="/login" className="border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10">Acesso institucional</Link></header><main className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 md:grid-cols-2 md:py-24"><div><div className="mb-4 inline-flex items-center gap-2 border border-[#FCD116]/40 bg-white/5 px-3 py-1.5 text-xs text-[#FCD116]"><ShieldCheck size={14}/> Portal de serviços · Demonstração</div><h1 className="font-serif text-4xl font-bold leading-tight md:text-6xl">Trânsito e transportes da Guiné-Bissau.</h1><p className="mt-5 max-w-xl leading-7 text-[#d8e2d9]">Uma plataforma integrada para matrícula de veículos, registo de condutores, imposto de circulação e fiscalização rodoviária.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/plate-check" className="flex items-center gap-2 bg-[#009E49] px-5 py-3 font-semibold text-white hover:bg-[#008440]"><Search size={18}/> Consultar matrícula</Link><Link to="/login" className="flex items-center gap-2 border border-white/35 px-5 py-3 font-semibold hover:bg-white/10">Entrar na gestão <ArrowRight size={17}/></Link></div><p className="mt-6 text-xs text-[#c4d2c6]">Protótipo com dados fictícios. Não processa pagamentos nem consultas oficiais.</p></div><div className="border border-white/15 bg-black/10 p-6"><div className="mb-5 flex items-center justify-between"><div><div className="font-serif text-lg font-bold">Serviços digitais</div><div className="text-xs text-[#c4d2c6]">Acesso rápido ao cidadão</div></div><span className="border border-[#FCD116]/40 px-2.5 py-1 text-[10px] uppercase text-[#FCD116]">Demonstração</span></div><div className="grid gap-3 sm:grid-cols-2">{[{label:'Consulta por matrícula',icon:Search,path:'/plate-check'},{label:'Cadastro de veículos',icon:CarFront,path:'/login'},{label:'Imposto de Circulação',icon:Banknote,path:'/login'},{label:'Multas e infrações',icon:ClipboardList,path:'/login'}].map(({label,icon:Icon,path})=><Link to={path} key={label} className="border border-white/10 bg-[#173d2b] p-4 hover:border-[#FCD116]/60"><Icon className="mb-4 text-[#FCD116]" size={21}/><div className="text-sm font-medium">{label}</div><div className="mt-2 text-xs text-[#c4d2c6]">Aceder ao serviço <ArrowRight className="ml-1 inline" size={13}/></div></Link>)}</div></div></main><footer className="border-t border-white/15 px-6 py-5 text-center text-xs text-[#c4d2c6]">Ministério dos Transportes · República da Guiné-Bissau · Plataforma demonstrativa</footer></div>;}

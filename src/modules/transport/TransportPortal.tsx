import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, AlertOctagon, AlertTriangle, ArrowRight, Banknote, Building2, Camera, CarFront, Check, ClipboardCheck, ClipboardList, Coins, FileBarChart2, FilePlus2, FileText, FileWarning, Fuel, Gauge, LogOut, MapPin, Printer, QrCode, Search, Settings, ShieldAlert, ShieldCheck, Siren, UserRoundCog, Users, UserX, Wrench, X, type LucideIcon } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

type Vehicle = { plate: string; make: string; model: string; year: number; color?: string; owner: string; driver: string; taxDue: number; district: string; category: string; legalStatus?: string };
type VehicleOccurrence = { id: string; plate: string; vehicleLabel?: string; owner?: string; recordCategory?: string; eventType: string; resultingStatus: string; reason: string; authority?: string; processNumber?: string; location?: string; date: string; notes?: string };
type OwnershipTransfer = { id: string; plate: string; vehicleLabel?: string; previousOwner: string; previousDocument?: string; newOwner: string; newDocument?: string; newDriver?: string; district?: string; transferDate: string; reason: string; notes?: string };
type Driver = { id: string; name: string; document: string; documentFile?: { name: string; dataUrl: string }; license: string; category: string; phone: string; district: string; status: string; issueDate?: string; expiryDate?: string; points?: number; medicalRestrictions?: string };
type DriverLicenseRecord = { id: string; driverId: string; driverName: string; license: string; recordType: string; actionDetail: string; category?: string; issueDate?: string; expiryDate?: string; pointsDelta?: number; notes?: string };
type DriverExam = { id: string; driverId: string; driverName: string; license?: string; targetCategory: string; examType: string; result: string; medicalEntity?: string; certificateNumber?: string; restrictions?: string; examDate: string; expiryDate?: string };
type Fine = { id: string; plate: string; driver: string; infraction: string; severity?: string; amount: number; date: string; status: 'Pendente' | 'Pago' | 'Anulado'; agentName?: string; agentBadge?: string; location?: string; evidenceFile?: { name: string; dataUrl: string }; evidenceDescription?: string; paymentReceipt?: string; paymentDate?: string; paymentMethod?: string; administrativeBlock?: boolean; blockReason?: string };
type FineAppeal = { id: string; fineId: string; plate: string; appellant: string; reason: string; defenseArguments: string; attachmentFile?: { name: string; dataUrl: string }; appealDate: string; status: string; decisionNotes?: string };
type InspectionAgent = { id: string; name: string; badge: string; unit: string; district: string; phone?: string; status: string };
type InfractionTypeItem = { id: string; name: string; amount: number; severity: string; description?: string };
type Inspection = { id: string; plate: string; reason: string; office: string; date: string; status: string };
type OfficialDocument = { id: string; documentType: string; issueMode: string; targetRef: string; holderName: string; holderDocument?: string; technicalDetails?: string; authenticityCode: string; qrPayload: string; issuingOffice: string; issueDate: string; expiryDate: string; status: string; administrativeBlock?: boolean; blockReason?: string; notes?: string };
type PublicVehicle = { id: string; plate: string; make: string; model: string; year: number; color?: string; category: string; institution: string; institutionAcronym?: string; department?: string; responsibleOfficer?: string; officerRole?: string; officerContact?: string; currentMileage?: number; tankCapacity?: number; fuelType?: string; status: string; chassisNumber?: string; assignmentDate?: string; notes?: string };
type FleetMission = { id: string; plate: string; institution: string; officerName: string; officerBadge?: string; missionPurpose: string; origin: string; destination: string; departureDate: string; departureTime?: string; returnDate?: string; returnTime?: string; departureKm: number; returnKm: number; totalKm: number; status: string; notes?: string };
type FleetFuelLog = { id: string; plate: string; institution: string; driverName: string; date: string; station: string; fuelType: string; liters: number; unitPrice: number; totalAmount: number; mileageAtFuel: number; voucherNumber?: string };
type FleetMaintenance = { id: string; plate: string; institution: string; maintenanceType: string; garage: string; entryDate: string; completionDate?: string; mileageAtService: number; serviceDescription: string; partsReplaced?: string; totalCost: number; status: string };
type Accident = { id: string; date: string; time: string; severity: string; type: string; region: string; road: string; latitude: number; longitude: number; landmark?: string; weather: string; roadCondition: string; vehiclesInvolved: number; victimsCount: number; fatalitiesCount: number; injuredCount: number; probableCause: string; description?: string; status: string };
type AccidentVehicleDriver = { id: string; accidentId: string; plate: string; vehicleLabel?: string; vehicleCategory: string; insuranceCompany?: string; insurancePolicy?: string; damageDescription?: string; driverName: string; driverDocument?: string; driverLicense?: string; driverCategory?: string; driverPhone?: string; alcoholTest?: string; liability?: string; notes?: string };
type AccidentVictim = { id: string; accidentId: string; name: string; document?: string; age: number; gender: string; condition: string; associatedPlate?: string; injurySeverity: string; hospital: string; emergencyContact?: string; medicalNotes?: string };
type AccidentWitness = { id: string; accidentId: string; name: string; document?: string; phone?: string; address?: string; locationAtMoment?: string; statement?: string; statementDate: string };
type AccidentPoliceReport = { id: string; accidentId: string; reportNumber: string; policeDepartment: string; officerName: string; officerBadge: string; reportDate: string; investigationSummary: string; infractionsFound?: string; legalReferral: string; procedureStatus: string; notes?: string };
type AccidentEvidence = { id: string; accidentId: string; evidenceType: string; title: string; fileUrl?: string; description?: string; registeredBy: string; registrationDate: string };

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
  {id:'D-001',name:'Mamadu Embaló',document:'000000001',license:'GB-C-10294',category:'B · Ligeiros',phone:'+245 955 100 201',district:'Bissau',status:'Ativo',issueDate:'2023-04-10',expiryDate:'2028-04-10',points:13,medicalRestrictions:'Sem restrições'},
  {id:'D-002',name:'Bacar Camará',document:'000000002',license:'GB-C-08142',category:'B, C · Ligeiros e Mercadorias',phone:'+245 966 200 142',district:'Bafatá',status:'Ativo',issueDate:'2021-08-22',expiryDate:'2026-08-22',points:20,medicalRestrictions:'Uso obrigatório de lentes corretivas'},
  {id:'D-003',name:'Ibraima Sanhá',document:'000000003',license:'GB-D-07331',category:'C, D, E · Pesados e Passageiros',phone:'+245 955 300 733',district:'Cacheu',status:'Ativo',issueDate:'2020-11-05',expiryDate:'2025-11-05',points:15,medicalRestrictions:'Avaliação psicotécnica periódica (Cat. D/E)'},
  {id:'D-004',name:'Naima Mané',document:'000000004',license:'GB-A-11620',category:'A · Motociclos',phone:'+245 966 400 620',district:'Gabú',status:'Ativo',issueDate:'2024-02-18',expiryDate:'2029-02-18',points:20,medicalRestrictions:'Sem restrições'},
];
const seedDriverLicenseRecords: DriverLicenseRecord[] = [
  {id:'RCC-2026-0001',driverId:'D-001',driverName:'Mamadu Embaló',license:'GB-C-10294',recordType:'Emissão',actionDetail:'1.ª Emissão Definitiva de Carta de Condução',category:'B · Ligeiros',issueDate:'2023-04-10',expiryDate:'2028-04-10',pointsDelta:0,notes:'Aprovação em exame teórico e prático na Delegação de Bissau'},
  {id:'RCC-2026-0002',driverId:'D-002',driverName:'Bacar Camará',license:'GB-C-08142',recordType:'Categoria',actionDetail:'Averbamento / Adição de Categoria C (Pesados de Mercadorias)',category:'B, C · Ligeiros e Mercadorias',issueDate:'2024-05-12',expiryDate:'2029-05-12',pointsDelta:0,notes:'Exame prático de pesados concluído com aproveitamento em Bafatá'},
  {id:'RCC-2026-0003',driverId:'D-003',driverName:'Ibraima Sanhá',license:'GB-D-07331',recordType:'Renovação',actionDetail:'Renovação Periódica de Carta Profissional (Cat. D/E)',category:'C, D, E · Pesados e Passageiros',issueDate:'2025-11-05',expiryDate:'2030-11-05',pointsDelta:0,notes:'Apresentado atestado médico e certificado de aptidão psicológica'},
];
const seedDriverExams: DriverExam[] = [
  {id:'EXM-2026-0001',driverId:'D-002',driverName:'Bacar Camará',license:'GB-C-08142',targetCategory:'B, C',examType:'Exame Médico de Aptidão Física',result:'Apto com restrições',medicalEntity:'Hospital Regional de Bafatá · Junta Médica',certificateNumber:'ATM-2026-0419',restrictions:'Uso obrigatório de lentes corretivas',examDate:'2026-02-14',expiryDate:'2029-02-14'},
  {id:'EXM-2026-0002',driverId:'D-003',driverName:'Ibraima Sanhá',license:'GB-D-07331',targetCategory:'C, D, E',examType:'Exame Médico e Psicológico Completo',result:'Apto',medicalEntity:'Centro Nacional de Medicina Rodoviária · Bissau',certificateNumber:'PSICO-2026-0882',restrictions:'Sem restrições · Apto para transporte coletivo de passageiros',examDate:'2026-05-20',expiryDate:'2028-05-20'},
];
const seedFines: Fine[] = [
  {id:'GB-2026-0014',plate:'GB-24-BC',driver:'Mamadu Embaló',infraction:'Documentação em falta',severity:'Grave',amount:25000,date:'2026-09-18',status:'Pendente',agentName:'Subcomissário Malam Bacai',agentBadge:'AG-GB-0104',location:'Av. Amílcar Cabral · Bissau',evidenceDescription:'Verificação presencial em posto de fiscalização; condutor sem livrete da viatura.'},
  {id:'GB-2026-0015',plate:'GB-24-BC',driver:'Mamadu Embaló',infraction:'Estacionamento irregular',severity:'Leve',amount:10000,date:'2026-09-20',status:'Pago',agentName:'Subcomissário Malam Bacai',agentBadge:'AG-GB-0104',location:'Praça dos Heróis Nacionais · Bissau',evidenceDescription:'Fotografia da viatura estacionada sobre o passeio pedonal.',paymentReceipt:'REC-DGV-2026-00918',paymentDate:'2026-09-22',paymentMethod:'Referência Bancária / Tesouraria'},
  {id:'GB-2026-0016',plate:'GB-22-CD',driver:'Ibraima Sanhá',infraction:'Excesso de velocidade',severity:'Gravíssima',amount:35000,date:'2026-09-21',status:'Pendente',agentName:'Chefe de Posto Ansumane Mané',agentBadge:'AG-GB-0315',location:'Estrada Nacional N2 · Cacheu',evidenceDescription:'Registo cinemómetro radar portátil (98 km/h em zona de 60 km/h).',administrativeBlock:true,blockReason:'Bloqueio administrativo preventivo por infração gravíssima não regularizada e reincidência (Art. 142.º do Código da Estrada).'},
];
const seedFineAppeals: FineAppeal[] = [
  {id:'REC-2026-0001',fineId:'GB-2026-0014',plate:'GB-24-BC',appellant:'Mamadu Embaló',reason:'Apresentação posterior de documento válido à data da fiscalização',defenseArguments:'O livrete encontrava-se em renovação na Delegação de Bissau, conforme protocolo anexado.',appealDate:'2026-09-25',status:'Em análise',decisionNotes:'Aguardando parecer jurídico da Comissão Técnica de Contraordenações.'},
];
const seedInspectionAgents: InspectionAgent[] = [
  {id:'AGT-001',name:'Subcomissário Malam Bacai',badge:'AG-GB-0104',unit:'Brigada Nacional de Trânsito · Setor Autónomo',district:'Bissau',phone:'+245 955 810 104',status:'Ativo'},
  {id:'AGT-002',name:'Agente Principal Fátima Djú',badge:'AG-GB-0219',unit:'Destacamento Regional de Fiscalização Rodoviária',district:'Bafatá',phone:'+245 966 820 219',status:'Ativo'},
  {id:'AGT-003',name:'Chefe de Posto Ansumane Mané',badge:'AG-GB-0315',unit:'Posto de Controlo Rodoviário de São Domingos',district:'Cacheu',phone:'+245 955 830 315',status:'Ativo'},
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
const seedOfficialDocuments: OfficialDocument[] = [
  {id:'DOC-2026-0001',documentType:'Documento de Identificação do Veículo',issueMode:'1.ª Via Original',targetRef:'GB-24-BC',holderName:'Mamadu Embaló',holderDocument:'000000001',technicalDetails:'Toyota Corolla (2018) · Cor: Prata · Cat.: Ligeiro particular',authenticityCode:'AUTH-GB-2026-1001-24BC',qrPayload:'SIGETRAN-QR|DOC-2026-0001|GB-24-BC|AUTH-GB-2026-1001-24BC',issuingOffice:'Direção-Geral de Viação · Bissau',issueDate:'2026-03-14',expiryDate:'Permanente',status:'Válido',administrativeBlock:false,blockReason:'',notes:'Livre de ónus fiscais · Emissão inicial após averbamento.'},
  {id:'DOC-2026-0002',documentType:'Certificado de Matrícula',issueMode:'1.ª Via Original',targetRef:'GB-19-AA',holderName:'Adama Baldé',holderDocument:'000492811',technicalDetails:'Suzuki Carry (2020) · Cor: Branco · Cat.: Transporte misto',authenticityCode:'AUTH-GB-2026-1002-19AA',qrPayload:'SIGETRAN-QR|DOC-2026-0002|GB-19-AA|AUTH-GB-2026-1002-19AA',issuingOffice:'Delegação Regional de Viação · Bafatá',issueDate:'2026-06-22',expiryDate:'Permanente',status:'Válido',administrativeBlock:false,blockReason:'',notes:'Certificado definitivo homologado pela DGV.'},
  {id:'DOC-2026-0003',documentType:'Carta de Condução Digital',issueMode:'Emissão Digital Certificada',targetRef:'GB-C-10294',holderName:'Mamadu Embaló',holderDocument:'000000001',technicalDetails:'Categoria: B · Ligeiros · Pontuação: 13/20 pts · Sem restrições',authenticityCode:'AUTH-GB-2026-1003-C294',qrPayload:'SIGETRAN-QR|DOC-2026-0003|GB-C-10294|AUTH-GB-2026-1003-C294',issuingOffice:'Direção-Geral de Viação · Bissau',issueDate:'2026-07-10',expiryDate:'2028-04-10',status:'Válido',administrativeBlock:false,blockReason:'',notes:'Assinatura digital ICP-GB ativa com QR Code dinâmico.'},
  {id:'DOC-2026-0004',documentType:'Certificado de Propriedade',issueMode:'1.ª Via Original',targetRef:'GB-22-CD',holderName:'Transportes Cacheu',holderDocument:'500918273',technicalDetails:'Mercedes-Benz Sprinter (2017) · Cor: Azul · Cat.: Transporte colectivo',authenticityCode:'AUTH-GB-2026-1004-22CD',qrPayload:'SIGETRAN-QR|DOC-2026-0004|GB-22-CD|AUTH-GB-2026-1004-22CD',issuingOffice:'Delegação Regional de Viação · Cacheu',issueDate:'2026-01-19',expiryDate:'Permanente',status:'Bloqueado',administrativeBlock:true,blockReason:'Despacho DGT n.º 118/2026 · Restrição administrativa por apreensão e coima gravíssima pendente (Art. 142.º CE).',notes:'Transferência de titularidade bloqueada até regularização.'},
  {id:'DOC-2026-0005',documentType:'Documento de Identificação do Veículo',issueMode:'2.ª Via (Extravio / Deterioração)',targetRef:'GB-23-FA',holderName:'Naima Mané',holderDocument:'000000004',technicalDetails:'Honda Wave (2022) · Cor: Vermelho · Cat.: Motociclo',authenticityCode:'AUTH-GB-2026-1005-23FA',qrPayload:'SIGETRAN-QR|DOC-2026-0005|GB-23-FA|AUTH-GB-2026-1005-23FA',issuingOffice:'Delegação Regional de Viação · Gabú',issueDate:'2026-08-05',expiryDate:'Permanente',status:'Válido',administrativeBlock:false,blockReason:'',notes:'2.ª Via emitida mediante declaração policial de extravio n.º 88/2026.'},
];

const seedPublicVehicles: PublicVehicle[] = [
  {id:'VP-001',plate:'GB-GOV-0101',make:'Toyota',model:'Land Cruiser Prado',year:2022,color:'Preto',category:'Veículo de Representação / Todo-o-Terreno',institution:'Ministério dos Transportes e Comunicações',institutionAcronym:'MTC',department:'Gabinete do Ministro / Direção-Geral de Viação',responsibleOfficer:'Dr. Lassana Camará',officerRole:'Diretor-Geral de Viação e Transportes',officerContact:'+245 955 400 110',currentMileage:42500,tankCapacity:87,fuelType:'Gasóleo',status:'Ativo',chassisNumber:'JT111GJ928192801',assignmentDate:'2022-06-15',notes:'Viatura de representação oficial afeta à Direção Geral.'},
  {id:'VP-002',plate:'GB-GOV-0205',make:'Toyota',model:'Hilux 4x4',year:2021,color:'Branco',category:'Pick-up Operacional',institution:'Ministério da Saúde Pública',institutionAcronym:'MINSAP',department:'Direção de Logística e Distribuição Hospitalar',responsibleOfficer:'Eng.ª Mariama Djaló',officerRole:'Chefe do Departamento de Logística Sanitária',officerContact:'+245 966 220 330',currentMileage:68200,tankCapacity:80,fuelType:'Gasóleo',status:'Ativo',chassisNumber:'MROFR22G981029381',assignmentDate:'2021-09-01',notes:'Afeta ao transporte de medicamentos e brigadas de vacinação.'},
  {id:'VP-003',plate:'GB-GOV-0312',make:'Nissan',model:'Patrol',year:2020,color:'Azul',category:'Todo-o-Terreno Fiscalização',institution:'Ministério da Economia e Finanças',institutionAcronym:'MEF',department:'Direção-Geral das Alfândegas / Brigada Fiscal',responsibleOfficer:'Inspetor Bacar Seidi',officerRole:'Inspetor-Chefe da Brigada Móvel Aduaneira',officerContact:'+245 955 880 440',currentMileage:91400,tankCapacity:95,fuelType:'Gasóleo',status:'Ativo',chassisNumber:'JN1TESY6100918273',assignmentDate:'2020-11-20',notes:'Viatura de fiscalização móvel nas fronteiras terrestres.'},
  {id:'VP-004',plate:'GB-GOV-0408',make:'Mitsubishi',model:'L200 Strakar',year:2019,color:'Cinzento',category:'Pick-up Mista',institution:'Ministério da Educação Nacional',institutionAcronym:'MEN',department:'Inspeção Escolar e Acompanhamento Pedagógico',responsibleOfficer:'Prof. Serifo Baldé',officerRole:'Delegado Regional de Inspeção de Ensino',officerContact:'+245 966 110 550',currentMileage:114800,tankCapacity:75,fuelType:'Gasóleo',status:'Em Manutenção',chassisNumber:'MMBJRKL1019283746',assignmentDate:'2019-10-10',notes:'Viatura em oficina central para substituição de embraiagem e revisão de suspensão.'},
  {id:'VP-005',plate:'GB-GOV-0515',make:'Toyota',model:'Hiace Minibus',year:2023,color:'Branco',category:'Transporte Coletivo de Serviço',institution:'Ministério da Administração Territorial',institutionAcronym:'MAT',department:'Secretaria-Geral / Serviços Administrativos',responsibleOfficer:'Sr. Malam Sanhá',officerRole:'Motorista Oficial e Coordenador de Pessoal',officerContact:'+245 955 770 990',currentMileage:28100,tankCapacity:70,fuelType:'Gasóleo',status:'Ativo',chassisNumber:'JTFSS22P990182736',assignmentDate:'2023-03-01',notes:'Transporte de equipas técnicas e funcionários ministeriais.'},
];

const seedFleetMissions: FleetMission[] = [
  {id:'MIS-2026-0001',plate:'GB-GOV-0101',institution:'Ministério dos Transportes e Comunicações',officerName:'Dr. Lassana Camará',officerBadge:'MTC-001',missionPurpose:'Vistoria e auditoria ao Porto de Bissau e terminal de cargas',origin:'Bissau (Sede DGT)',destination:'Porto Comercial de Bissau',departureDate:'2026-10-15',departureTime:'08:30',returnDate:'2026-10-15',returnTime:'16:45',departureKm:42100,returnKm:42185,totalKm:85,status:'Concluída',notes:'Missão oficial devidamente autorizada pelo Gabinete do Ministro.'},
  {id:'MIS-2026-0002',plate:'GB-GOV-0205',institution:'Ministério da Saúde Pública',officerName:'Eng.ª Mariama Djaló',officerBadge:'MSP-LOG-14',missionPurpose:'Distribuição urgente de vacinas e material sanitário',origin:'Bissau (Armazém Central)',destination:'Hospital Regional de Gabú',departureDate:'2026-10-18',departureTime:'06:00',returnDate:'2026-10-19',returnTime:'19:30',departureKm:67800,returnKm:68200,totalKm:400,status:'Concluída',notes:'Entrega de doses de vacinas realizada sem avarias na cadeia de frio.'},
  {id:'MIS-2026-0003',plate:'GB-GOV-0312',institution:'Ministério da Economia e Finanças',officerName:'Inspetor Bacar Seidi',officerBadge:'MEF-ALF-89',missionPurpose:'Ação de fiscalização aduaneira nas fronteiras terrestres',origin:'Bissau (Quartel Fiscal)',destination:'São Domingos (Fronteira Senegal)',departureDate:'2026-10-22',departureTime:'07:00',returnDate:'2026-10-24',returnTime:'18:00',departureKm:91250,returnKm:91400,totalKm:150,status:'Em Curso',notes:'Operação conjunta com a Guarda Fiscal e Polícia de Fronteiras.'},
];

const seedFleetFuelLogs: FleetFuelLog[] = [
  {id:'ABAS-2026-0001',plate:'GB-GOV-0101',institution:'Ministério dos Transportes e Comunicações',driverName:'Mamadu Embaló',date:'2026-10-10',station:'Galp Aeroporto Bissau',fuelType:'Gasóleo',liters:65,unitPrice:850,totalAmount:55250,mileageAtFuel:42000,voucherNumber:'VOUCH-MTC-0881'},
  {id:'ABAS-2026-0002',plate:'GB-GOV-0205',institution:'Ministério da Saúde Pública',driverName:'Bacar Camará',date:'2026-10-17',station:'Total Bissau Centro',fuelType:'Gasóleo',liters:70,unitPrice:850,totalAmount:59500,mileageAtFuel:67750,voucherNumber:'VOUCH-MSP-0412'},
  {id:'ABAS-2026-0003',plate:'GB-GOV-0312',institution:'Ministério da Economia e Finanças',driverName:'Ansumane Mané',date:'2026-10-21',station:'Star Oil Bafatá',fuelType:'Gasóleo',liters:80,unitPrice:850,totalAmount:68000,mileageAtFuel:91200,voucherNumber:'VOUCH-MEF-1029'},
  {id:'ABAS-2026-0408',plate:'GB-GOV-0408',institution:'Ministério da Educação Nacional',driverName:'Serifo Baldé',date:'2026-10-05',station:'Shell Bissau Porto',fuelType:'Gasóleo',liters:50,unitPrice:850,totalAmount:42500,mileageAtFuel:114600,voucherNumber:'VOUCH-MEN-0199'},
];

const seedFleetMaintenances: FleetMaintenance[] = [
  {id:'MAN-2026-0001',plate:'GB-GOV-0408',institution:'Ministério da Educação Nacional',maintenanceType:'Manutenção Corretiva',garage:'Auto Mecânica Central Bissau',entryDate:'2026-10-20',completionDate:'2026-10-26',mileageAtService:114800,serviceDescription:'Substituição de amortecedores dianteiros, pastilhas de travão e kit de embraiagem',partsReplaced:'Amortecedores KYB, Pastilhas Ferodo, Disco de embraiagem',totalCost:480000,status:'Em Andamento'},
  {id:'MAN-2026-0002',plate:'GB-GOV-0101',institution:'Ministério dos Transportes e Comunicações',maintenanceType:'Revisão Periódica',garage:'Garagem Oficial do Estado',entryDate:'2026-09-15',completionDate:'2026-09-16',mileageAtService:40000,serviceDescription:'Revisão programada dos 40.000 km: troca de óleo do motor, filtro de combustível e filtro de ar',partsReplaced:'Óleo sintético 5W30 (8L), Filtros genuínos Toyota',totalCost:165000,status:'Concluída'},
  {id:'MAN-2026-0003',plate:'GB-GOV-0205',institution:'Ministério da Saúde Pública',maintenanceType:'Manutenção Preventiva',garage:'Oficina Guineense de Motores',entryDate:'2026-10-02',completionDate:'2026-10-03',mileageAtService:65000,serviceDescription:'Substituição de correia de distribuição e bomba de água preventivas',partsReplaced:'Correia dentada Dayco, Bomba de água AISIN',totalCost:330000,status:'Concluída'},
];

const seedAccidents: Accident[] = [
  {
    id: 'ACID-2026-0001',
    date: '2026-10-18',
    time: '16:30',
    severity: 'Com Feridos Graves',
    type: 'Colisão Frontal',
    region: 'Setor Autónomo de Bissau',
    road: 'Avenida dos Combatentes da Liberdade da Pátria · Próximo ao Aeroporto Osvaldo Vieira',
    latitude: 11.8632,
    longitude: -15.5984,
    landmark: 'Rotunda de acesso ao terminal aéreo de Bissau',
    weather: 'Bom tempo / Sol',
    roadCondition: 'Seco e limpo',
    vehiclesInvolved: 2,
    victimsCount: 2,
    fatalitiesCount: 0,
    injuredCount: 2,
    probableCause: 'Excesso de velocidade e ultrapassagem irregular',
    description: 'Colisão frontal violenta entre um ligeiro de passageiros e uma carrinha de transporte misto durante ultrapassagem em traço contínuo.',
    status: 'Peritagem Concluída',
  },
  {
    id: 'ACID-2026-0002',
    date: '2026-10-22',
    time: '20:45',
    severity: 'Com Vítimas Mortais',
    type: 'Atropelamento e Fuga',
    region: 'Biombo',
    road: 'Estrada Nacional N1 · Eixo Safim - Bissau (km 12)',
    latitude: 11.9540,
    longitude: -15.6510,
    landmark: 'Cruzamento de Safim / Mercado local',
    weather: 'Noite sem iluminação',
    roadCondition: 'Seco e limpo',
    vehiclesInvolved: 1,
    victimsCount: 1,
    fatalitiesCount: 1,
    injuredCount: 0,
    probableCause: 'Excesso de velocidade e falta de iluminação na via pública',
    description: 'Atropelamento mortal de peão na berma da estrada por viatura que se colocou em fuga, posteriormente apreendida pela BNT.',
    status: 'Remetido a Tribunal',
  },
  {
    id: 'ACID-2026-0003',
    date: '2026-10-25',
    time: '09:15',
    severity: 'Danos Materiais',
    type: 'Colisão Traseira',
    region: 'Bafatá',
    road: 'Ponte sobre o Rio Geba · Entrada da Cidade de Bafatá',
    latitude: 12.1678,
    longitude: -14.6542,
    landmark: 'Início do tabuleiro da ponte metálica',
    weather: 'Bom tempo / Sol',
    roadCondition: 'Com buracos / Degradação',
    vehiclesInvolved: 2,
    victimsCount: 0,
    fatalitiesCount: 0,
    injuredCount: 0,
    probableCause: 'Falta de distância de segurança e travagem brusca',
    description: 'Colisão por alcance após travagem de emergência do veículo à frente devido a buraco pronunciado na faixa.',
    status: 'Arquivado',
  },
  {
    id: 'ACID-2026-0004',
    date: '2026-11-01',
    time: '14:20',
    severity: 'Com Feridos',
    type: 'Capotamento',
    region: 'Gabú',
    road: 'Estrada Regional Gabú - Pirada (km 18)',
    latitude: 12.2850,
    longitude: -14.2180,
    landmark: 'Curva do Rio Campossa',
    weather: 'Chuva intensa',
    roadCondition: 'Molhado / Escorregadio',
    vehiclesInvolved: 1,
    victimsCount: 4,
    fatalitiesCount: 0,
    injuredCount: 4,
    probableCause: 'Aquaplanagem e velocidade inadequada',
    description: 'Despiste seguido de capotamento para fora da berma em valeta durante forte precipitação com 4 passageiros feridos.',
    status: 'Em Investigação',
  },
];

const seedAccidentVehiclesDrivers: AccidentVehicleDriver[] = [
  {
    id: 'VCA-2026-0001',
    accidentId: 'ACID-2026-0001',
    plate: 'GB-24-BC',
    vehicleLabel: 'Toyota Corolla (2018)',
    vehicleCategory: 'Ligeiro particular',
    insuranceCompany: 'Garantia Seguros GB',
    insurancePolicy: 'APOL-GAR-2026/0912',
    damageDescription: 'Destruição do bloco dianteiro, suspensão frontal esquerda e quebra do para-brisas.',
    driverName: 'Mamadu Embaló',
    driverDocument: 'BI 000000001',
    driverLicense: 'GB-C-10294',
    driverCategory: 'B',
    driverPhone: '+245 955 100 201',
    alcoholTest: '0.00 g/l (Negativo)',
    liability: 'Lesado / Terceiro',
    notes: 'Condutor circulava na sua faixa com cinto de segurança apertado.',
  },
  {
    id: 'VCA-2026-0002',
    accidentId: 'ACID-2026-0001',
    plate: 'GB-19-AA',
    vehicleLabel: 'Suzuki Carry (2020)',
    vehicleCategory: 'Transporte misto',
    insuranceCompany: 'Sem seguro válido',
    insurancePolicy: '',
    damageDescription: 'Perda total da frente e eixo dianteiro partido.',
    driverName: 'Bacar Camará',
    driverDocument: 'BI 000000002',
    driverLicense: 'GB-C-08142',
    driverCategory: 'B, C',
    driverPhone: '+245 966 200 142',
    alcoholTest: '0.65 g/l (Positivo - Contraordenação Grave)',
    liability: 'Presumível causador',
    notes: 'Invasão da faixa de rodagem contrária sob influência de álcool.',
  },
  {
    id: 'VCA-2026-0003',
    accidentId: 'ACID-2026-0002',
    plate: 'GB-22-CD',
    vehicleLabel: 'Mercedes-Benz Sprinter (2017)',
    vehicleCategory: 'Transporte colectivo',
    insuranceCompany: 'Garantia Seguros GB',
    insurancePolicy: 'APOL-GAR-2026/1104',
    damageDescription: 'Deformação da ótica dianteira direita e espelho retrovisor partido.',
    driverName: 'Ibraima Sanhá',
    driverDocument: 'BI 000000003',
    driverLicense: 'GB-D-07331',
    driverCategory: 'C, D, E',
    driverPhone: '+245 955 300 733',
    alcoholTest: '0.00 g/l (Negativo)',
    liability: 'Arguido em inquérito',
    notes: 'Viatura retida para peritagem forense no piquete de Bissau.',
  },
];

const seedAccidentVictims: AccidentVictim[] = [
  {
    id: 'VIT-2026-0001',
    accidentId: 'ACID-2026-0001',
    name: 'Mariama Sanhá',
    document: 'BI 000492811',
    age: 34,
    gender: 'Feminino',
    condition: 'Passageiro',
    associatedPlate: 'GB-19-AA',
    injurySeverity: 'Ferimentos Graves',
    hospital: 'Hospital Nacional Simão Mendes',
    emergencyContact: '+245 966 440 220 (Irmão)',
    medicalNotes: 'Traumatismo craniano ligeiro e fratura fechada de fémur; internada no bloco de cirurgia.',
  },
  {
    id: 'VIT-2026-0002',
    accidentId: 'ACID-2026-0001',
    name: 'Mamadu Embaló',
    document: 'BI 000000001',
    age: 42,
    gender: 'Masculino',
    condition: 'Condutor',
    associatedPlate: 'GB-24-BC',
    injurySeverity: 'Ferimentos Leves',
    hospital: 'Hospital Nacional Simão Mendes',
    emergencyContact: '+245 955 100 201',
    medicalNotes: 'Escoriações múltiplas e contusão torácica; alta clínica concedida após exames.',
  },
  {
    id: 'VIT-2026-0003',
    accidentId: 'ACID-2026-0002',
    name: 'Ansumane Djaló',
    document: 'BI 000781902',
    age: 58,
    gender: 'Masculino',
    condition: 'Peão / Pedestre',
    associatedPlate: 'GB-22-CD',
    injurySeverity: 'Óbito no Local',
    hospital: 'Morgue do Hospital Nacional Simão Mendes',
    emergencyContact: '+245 955 881 002 (Esposa)',
    medicalNotes: 'Óbito declarado no local pela equipa médica de emergência e médico legista.',
  },
];

const seedAccidentWitnesses: AccidentWitness[] = [
  {
    id: 'TST-2026-0001',
    accidentId: 'ACID-2026-0001',
    name: 'Abel da Silva',
    document: 'BI 000881920',
    phone: '+245 955 770 123',
    address: 'Bairro Militar, Bissau',
    locationAtMoment: 'Condutor da viatura que seguia atrás',
    statement: 'Viu a carrinha Suzuki tentar ultrapassar um camião de mercadorias em local de linha contínua, colidindo frontalmente com o Corolla.',
    statementDate: '2026-10-18',
  },
  {
    id: 'TST-2026-0002',
    accidentId: 'ACID-2026-0002',
    name: 'Dionísio Mendes',
    document: 'BI 000918273',
    phone: '+245 966 331 445',
    address: 'Safim Centro',
    locationAtMoment: 'Comerciante do quiosque lateral',
    statement: 'Ouviu uma travagem forte e o som do impacto; observou uma carrinha de passageiros branca acelerar sem prestar assistência ao peão.',
    statementDate: '2026-10-23',
  },
];

const seedAccidentPoliceReports: AccidentPoliceReport[] = [
  {
    id: 'BO-POL-2026-0045',
    accidentId: 'ACID-2026-0001',
    reportNumber: 'BO/BNT/2026/045',
    policeDepartment: 'Brigada Nacional de Trânsito (BNT)',
    officerName: 'Subcomissário Malam Bacai',
    officerBadge: 'AG-GB-0104',
    reportDate: '2026-10-19',
    investigationSummary: 'A colisão frontal foi originada por manobra de ultrapassagem temerária e não permitida realizada pelo condutor Bacar Camará com taxa de alcoolemia positiva.',
    infractionsFound: 'Art. 38.º (Ultrapassagem proibida) e Art. 81.º (Condução sob influência do álcool) do Código da Estrada',
    legalReferral: 'Remetido ao Ministério Público / Tribunal Regional de Bissau',
    procedureStatus: 'Concluído',
    notes: 'Auto de notícia e testes toxicológicos anexos ao processo.',
  },
  {
    id: 'BO-POL-2026-0052',
    accidentId: 'ACID-2026-0002',
    reportNumber: 'BO/BNT/2026/052',
    policeDepartment: 'Brigada Nacional de Trânsito (BNT)',
    officerName: 'Agente Principal Fátima Djú',
    officerBadge: 'AG-GB-0219',
    reportDate: '2026-10-24',
    investigationSummary: 'Atropelamento mortal com fuga de condutor e omissão de auxílio; condutor identificado após investigação policial conjunta da BNT e POP.',
    infractionsFound: 'Art. 135.º (Homicídio por negligência na condução) e Art. 89.º (Omissão de auxílio)',
    legalReferral: 'Remetido ao Ministério Público com arguido sob termo de identidade e residência',
    procedureStatus: 'Concluído',
    notes: 'Veículo apreendido no parque da delegação regional.',
  },
];

const seedAccidentEvidence: AccidentEvidence[] = [
  {
    id: 'FOTO-2026-0001',
    accidentId: 'ACID-2026-0001',
    evidenceType: 'Fotografia do Local',
    title: 'Ponto de impacto frontal no eixo da via na Av. Combatentes',
    fileUrl: '/media/acidentes/impacto_av_combatentes.jpg',
    description: 'Registo fotográfico dos vestígios de travagem (18 metros) e deformação estrutural frontal dos veículos.',
    registeredBy: 'Perito Malam Bacai (BNT)',
    registrationDate: '2026-10-18',
  },
  {
    id: 'FOTO-2026-0002',
    accidentId: 'ACID-2026-0001',
    evidenceType: 'Croqui / Esquema da Via',
    title: 'Croqui pericial topográfico da colisão frontal',
    fileUrl: '/media/acidentes/croqui_safim.jpg',
    description: 'Planta do local do acidente com cotas das bermas, ponto de repouso dos veículos e trajetória percorrida.',
    registeredBy: 'Gabinete de Acidentologia Rodoviária DGT',
    registrationDate: '2026-10-19',
  },
  {
    id: 'FOTO-2026-0003',
    accidentId: 'ACID-2026-0002',
    evidenceType: 'Fotografia dos Danos Veiculares',
    title: 'Danos no para-choques e ótica direita da viatura interveniente',
    fileUrl: '/media/acidentes/danos_sprinter.jpg',
    description: 'Provas periciais de compatibilidade entre as deformações e as fibras do vestuário da vítima atropelada.',
    registeredBy: 'Laboratório de Polícia Técnica e Científica',
    registrationDate: '2026-10-23',
  },
];

function useSaved<T>(key:string, initial:T) {
  const [data,setData] = useState<T>(()=>{try {const value=localStorage.getItem(`sigetran:${key}`);return value?JSON.parse(value) as T:initial;}catch{return initial;}});
  useEffect(() => { let active = true; api.get<T>(`/state/${key}`).then(res => { if (active && res.data !== undefined) { setData(res.data); try { localStorage.setItem(`sigetran:${key}`, JSON.stringify(res.data)); } catch { /* ignore */ } } }).catch(() => { /* fallback */ }); return () => { active = false; }; }, [key]);
  return [data,(next:T|((prev:T)=>T))=>{setData(prev=>{const value=typeof next==='function'?(next as (prev:T)=>T)(prev):next;try{localStorage.setItem(`sigetran:${key}`,JSON.stringify(value));}catch{/* storage unavailable */}api.put(`/state/${key}`,value).catch(()=>{/* ignore */});return value;});}] as const;
}

const driverSubmenus:{path:string;label:string;shortLabel:string}[]=[
  {path:'/drivers',label:'Cadastro completo de condutores',shortLabel:'Cadastro completo'},
  {path:'/drivers/license-issue',label:'Emissão de carta de condução',shortLabel:'Emissão de carta'},
  {path:'/drivers/categories',label:'Categorias de habilitação (A, B, C, D, E)',shortLabel:'Categorias (A-E)'},
  {path:'/drivers/renewals',label:'Renovação e validade da carta',shortLabel:'Renovação e validade'},
  {path:'/drivers/suspensions',label:'Suspensão e cassação da habilitação',shortLabel:'Suspensão e cassação'},
  {path:'/drivers/infractions-history',label:'Histórico de infrações',shortLabel:'Histórico de infrações'},
  {path:'/drivers/points',label:'Pontuação do condutor',shortLabel:'Pontuação'},
  {path:'/drivers/exams',label:'Histórico de exames médicos e psicológicos',shortLabel:'Exames médicos/psicológicos'},
];
const fineSubmenus:{path:string;label:string;shortLabel:string}[]=[
  {path:'/infraction-types',label:'Catálogo nacional de infrações',shortLabel:'Catálogo de infrações'},
  {path:'/fines/severity',label:'Classificação por gravidade',shortLabel:'Gravidade'},
  {path:'/fines/amounts',label:'Valor da multa',shortLabel:'Valor da multa'},
  {path:'/fines',label:'Emissão de auto de infração',shortLabel:'Emissão de auto'},
  {path:'/fines/evidence',label:'Fotografias e provas',shortLabel:'Fotografias e provas'},
  {path:'/fines/agents',label:'Identificação do agente fiscalizador',shortLabel:'Agente fiscalizador'},
  {path:'/fines/payments',label:'Pagamento e comprovativos',shortLabel:'Pagamentos e comprovativos'},
  {path:'/fines/appeals',label:'Recursos e contestações',shortLabel:'Recursos e contestações'},
  {path:'/fines/recidivism',label:'Histórico de reincidência',shortLabel:'Reincidência'},
  {path:'/fines/administrative-blocks',label:'Bloqueio administrativo',shortLabel:'Bloqueio administrativo'},
];
const documentSubmenus:{path:string;label:string;shortLabel:string}[]=[
  {path:'/documents-certificates',label:'Documento de identificação do veículo',shortLabel:'Doc. Identificação Veículo'},
  {path:'/documents-certificates/registration-certificate',label:'Certificado de matrícula',shortLabel:'Certificado de Matrícula'},
  {path:'/documents-certificates/digital-license',label:'Carta de condução digital',shortLabel:'Carta Digital'},
  {path:'/documents-certificates/ownership-certificate',label:'Certificado de propriedade',shortLabel:'Certificado de Propriedade'},
  {path:'/documents-certificates/history',label:'Histórico de emissão de documentos',shortLabel:'Histórico de Emissão'},
  {path:'/documents-certificates/second-copy',label:'Segunda via',shortLabel:'Segunda Via'},
  {path:'/documents-certificates/qr-validation',label:'Validação por QR Code',shortLabel:'Validação QR Code'},
  {path:'/documents-certificates/authenticity',label:'Verificação pública de autenticidade',shortLabel:'Autenticidade Pública'},
  {path:'/documents-certificates/administrative-blocks',label:'Bloqueio administrativo',shortLabel:'Bloqueio Administrativo'},
];
const stateFleetSubmenus:{path:string;label:string;shortLabel:string}[]=[
  {path:'/state-fleet',label:'Cadastro de veículos públicos',shortLabel:'Veículos Públicos'},
  {path:'/state-fleet/institutions',label:'Ministério ou instituição responsável',shortLabel:'Instituições'},
  {path:'/state-fleet/officers',label:'Funcionário responsável pelo veículo',shortLabel:'Funcionários'},
  {path:'/state-fleet/missions',label:'Histórico de utilização',shortLabel:'Utilização / Missões'},
  {path:'/state-fleet/fuel',label:'Consumo de combustível',shortLabel:'Combustível'},
  {path:'/state-fleet/maintenance',label:'Manutenção e reparações',shortLabel:'Manutenção'},
  {path:'/state-fleet/expenses',label:'Controlo de despesas',shortLabel:'Despesas Globais'},
];
const accidentSubmenus:{path:string;label:string;shortLabel:string}[]=[
  {path:'/accidents',label:'Registo de acidentes',shortLabel:'Registo'},
  {path:'/accidents/vehicles-drivers',label:'Veículos e condutores envolvidos',shortLabel:'Veículos/Condutores'},
  {path:'/accidents/victims',label:'Identificação de vítimas',shortLabel:'Vítimas'},
  {path:'/accidents/locations',label:'Localização geográfica',shortLabel:'Localização GIS'},
  {path:'/accidents/evidence',label:'Fotografias e documentos',shortLabel:'Fotos e Provas'},
  {path:'/accidents/police-reports',label:'Relatórios policiais',shortLabel:'Relatórios Policiais'},
  {path:'/accidents/witnesses',label:'Identificação de testemunhas',shortLabel:'Testemunhas'},
  {path:'/accidents/statistics',label:'Estatísticas de acidentes por região',shortLabel:'Estatísticas Regionais'},
];
const menu:{path:string;label:string;icon:LucideIcon;children?:{path:string;label:string}[]}[]=[
  {path:'/dashboard',label:'Painel de gestão',icon:Activity},{path:'/vehicles',label:'Veículos e matrículas',icon:CarFront},{path:'/ownership-transfers',label:'Transferência e histórico',icon:ArrowRight},{path:'/vehicle-occurrences',label:'Apreensões, roubos e baixas',icon:ShieldCheck},{path:'/drivers',label:'Gestão de condutores',icon:Users,children:driverSubmenus},{path:'/plate-check',label:'Consulta de matrícula',icon:Search},{path:'/circulation-tax',label:'Imposto de Circulação',icon:Banknote},{path:'/fines',label:'Gestão de multas e infrações',icon:ClipboardList,children:fineSubmenus},{path:'/documents-certificates',label:'Documentação e certificados',icon:FilePlus2,children:documentSubmenus},{path:'/state-fleet',label:'Gestão da frota do Estado',icon:Building2,children:stateFleetSubmenus},{path:'/accidents',label:'Gestão de acidentes rodoviários',icon:ShieldAlert,children:accidentSubmenus},{path:'/inspections',label:'Inspeções veiculares',icon:ClipboardCheck},{path:'/reports',label:'Relatórios nacionais',icon:FileBarChart2},{path:'/users',label:'Utilizadores',icon:UserRoundCog},{path:'/settings',label:'Configuração',icon:Settings},
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
      <div className="px-4 pt-5 text-[10px] font-semibold uppercase tracking-[.17em] text-[#9fb7a4]">Gestão e serviços</div><nav className="grid grid-cols-2 gap-1 p-3 sm:grid-cols-3 lg:block lg:space-y-1">{menu.map((item)=>{const hasChildren=Boolean(item.children);const isActive=hasChildren?item.children!.some(c=>pathname===c.path)||pathname.startsWith(item.path):pathname===item.path;return <div key={item.path}><Link to={item.path} className={`relative flex min-w-0 items-center gap-2 px-2 py-3 text-[12px] transition lg:gap-3 lg:px-3 lg:text-[13px] ${isActive&&!hasChildren?'bg-[#f4f3ed] font-semibold text-[#173d2b]':isActive&&hasChildren?'bg-[#214c36] font-semibold text-[#FCD116]':'text-[#d8e2d9] hover:bg-white/10 hover:text-white'}`}>{isActive&&<span className="absolute bottom-0 left-0 top-0 w-[3px] bg-[#FCD116]"/>}<item.icon size={17} className="shrink-0"/><span className="leading-4">{item.label}</span>{hasChildren&&<span className="ml-auto text-[10px] text-[#FCD116]">▾</span>}</Link>{hasChildren&&<div className="col-span-2 mt-1 space-y-0.5 border-l border-[#FCD116]/40 bg-[#123122] py-1.5 pl-3 pr-2 sm:col-span-3 lg:ml-4">{item.children!.map(sub=>{const subActive=pathname===sub.path;return <Link key={sub.path} to={sub.path} className={`block rounded-sm px-2.5 py-1.5 text-[11px] leading-4 transition ${subActive?'bg-[#f4f3ed] font-bold text-[#173d2b]':'text-[#c8d8cb] hover:bg-white/10 hover:text-white'}`}>{sub.label}</Link>;})}</div>}</div>;})}</nav>
      <div className="mx-4 my-5 hidden border-t border-white/15 pt-4 text-[11px] leading-5 text-[#c4d2c6] md:block"><div className="mb-2 flex items-center gap-2 font-semibold uppercase tracking-wider text-[#FCD116]"><ShieldCheck size={14}/> Ambiente demonstrativo</div>Dados e pagamentos simulados, armazenados apenas neste navegador.</div><div className="hidden border-t border-white/15 px-5 py-4 text-[10px] text-[#9fb7a4] md:block">Bissau · Guiné-Bissau<br/>SIGETRAN · Versão de demonstração</div>
    </aside><main className="min-w-0 flex-1"><header className="flex min-h-[76px] items-center justify-between border-b border-[#dcd9cc] bg-white px-5 md:px-9"><div><div className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#52644f]">Sistema Integrado de Gestão de Trânsito</div><div className="mt-1 text-xs text-[#737a70]">Ministério dos Transportes <span className="mx-1">/</span> Administração Central</div></div><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><div className="text-xs font-semibold">Administrador do sistema</div><div className="text-[10px] text-[#737a70]">Direção Nacional · Bissau</div></div><div className="hidden h-9 w-9 place-items-center border border-[#d5d1c2] bg-[#f4f3ed] text-xs font-bold text-[#173d2b] sm:grid">AD</div><button title="Sair do sistema" onClick={()=>{logout();navigate('/');}} className="flex items-center gap-2 border border-[#d5d1c2] px-3 py-2 text-xs font-semibold hover:bg-[#f4f3ed]"><LogOut size={15}/>Sair</button></div></header><div className="mx-auto max-w-[1500px] p-5 md:p-9">{children}<p className="mt-10 border-t border-[#d8d5c9] pt-4 text-[11px] text-[#72776e]">SIGETRAN · Protótipo sem backend · Valores em Franco CFA (XOF) · Regras e tabelas legais carecem de validação oficial.</p></div></main></div>
  </div>;
}
function Title({eyebrow,title,description,icon:Icon}:{eyebrow:string;title:string;description:string;icon:LucideIcon}){return <div className="mb-7 flex items-start gap-4 border-b border-[#d8d5c9] pb-5"><div className="grid h-12 w-12 shrink-0 place-items-center border border-[#d5d1c2] bg-white text-[#009E49]"><Icon size={22}/></div><div><div className="text-[10px] font-bold uppercase tracking-[.17em] text-[#836300]">{eyebrow}</div><h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#1c3024] md:text-[30px]">{title}</h1><p className="mt-1 text-sm text-[#697168]">{description}</p></div></div>;}
function Stat({label,value,detail,icon:Icon}:{label:string;value:string;detail:string;icon:LucideIcon}){return <div className="border border-[#dcd9cc] border-t-[3px] border-t-[#009E49] bg-white p-5"><div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[.08em] text-[#697168]"><span>{label}</span><Icon size={18} className="text-[#009E49]"/></div><div className="mt-3 font-serif text-[30px] font-bold text-[#1c3024]">{value}</div><div className="mt-1 text-xs text-[#737a70]">{detail}</div></div>;}
function Status({value}:{value:string}){const positive=['Em dia','Pago','Concluída','Ativo','Regular','Recuperado','Válida','Válido','Apto','Apto com restrições','Deferido','Leve','Sem bloqueio','Autêntico'].includes(value);const cancelled=['Cancelado / Baixa Definitiva','Baixa Definitiva','Cancelamento de Matrícula','Cassado','Inapto','Anulado','Indeferido','Substituído (2.ª Via)','Revogado'].includes(value);return <span className={`inline-flex whitespace-nowrap border px-2 py-1 text-[11px] font-semibold ${positive?'border-[#009E49]/30 bg-[#009E49]/10 text-[#006B35]':cancelled?'border-[#4b5549]/40 bg-[#4b5549]/15 text-[#202820]':'border-[#CE1126]/25 bg-[#CE1126]/10 text-[#9f1a2b]'}`}>{value}</span>;}
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

function DriverSubmenuBar(){const {pathname}=useLocation();return <div className="mb-6 flex flex-wrap gap-1.5 border-b border-[#dcd9cc] pb-4">{driverSubmenus.map(sub=>{const active=pathname===sub.path;return <Link key={sub.path} to={sub.path} className={`border px-3 py-1.5 text-xs font-semibold transition ${active?'border-[#006B35] bg-[#006B35] text-white':'border-[#d5d1c2] bg-white text-[#26372b] hover:border-[#009E49] hover:bg-[#f4f3ed]'}`}>{sub.label}</Link>;})}</div>;}

export function DriverRegistry(){const [drivers,setDrivers]=useSaved('drivers',seedDrivers);const [open,setOpen]=useState(false);const [editing,setEditing]=useState<Driver|null>(null);const [documentError,setDocumentError]=useState('');const [query,setQuery]=useState('');const filteredDrivers=drivers.filter(d=>[d.id,d.name,d.document,d.license,d.category,d.district,d.status].join(' ').toLowerCase().includes(query.toLowerCase()));function openCreate(){setEditing(null);setDocumentError('');setOpen(true);}function openEdit(driver:Driver){setEditing(driver);setDocumentError('');setOpen(true);}function closeDrawer(){setOpen(false);setEditing(null);setDocumentError('');}async function handleDelete(id:string){if(!window.confirm(`Deseja realmente excluir o condutor ${id}?`))return;try{await api.delete(`/drivers/${encodeURIComponent(id)}`);}catch{/* ignore */}setDrivers(rows=>rows.filter(d=>d.id!==id));}async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget;const f=new FormData(form);const file=f.get('documentFile') as File|null;if(file&&file.size>1_000_000){setDocumentError('O ficheiro deve ter no máximo 1 MB para armazenamento local.');return;}try{let docFile=editing?.documentFile;if(file&&file.size>0){const dataUrl=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Não foi possível ler o documento.'));reader.readAsDataURL(file);});docFile={name:file.name,dataUrl};}const payload={id:editing?editing.id:`D-${String(Date.now()).slice(-5)}`,name:String(f.get('name')),document:String(f.get('document')),license:String(f.get('license')),category:String(f.get('category')),phone:String(f.get('phone')),district:String(f.get('district')),status:String(f.get('status')||editing?.status||'Ativo'),issueDate:String(f.get('issueDate')||'2024-01-15'),expiryDate:String(f.get('expiryDate')||'2029-01-15'),points:Number(f.get('points')??20),medicalRestrictions:String(f.get('medicalRestrictions')||'Sem restrições'),documentFile:docFile};if(editing){const res=await api.put<Driver>(`/drivers/${encodeURIComponent(editing.id)}`,payload);setDrivers(rows=>rows.map(d=>d.id===editing.id?res.data:d));}else{const res=await api.post<Driver>('/drivers',payload);setDrivers([res.data,...drivers]);}form.reset();setDocumentError('');window.dispatchEvent(new Event('sigetran:drawer-close'));}catch(err:any){setDocumentError(err?.response?.data?.error||'Não foi possível guardar os dados do condutor.');}}
  return <Shell><Title eyebrow="Gestão de condutores · Submenu 1" title="Cadastro completo de condutores" description="Registo nacional de condutores, documentos de identificação, cartas de condução, categorias (A, B, C, D, E), validade e pontuação." icon={Users}/><DriverSubmenuBar/><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><label className="flex max-w-md flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3"><Search size={16} className="text-[#737a70]"/><input aria-label="Pesquisar condutor" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pesquisar por nome, carta, documento ou categoria" className="w-full py-2 text-sm outline-none"/></label><button onClick={()=>open?closeDrawer():openCreate()} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Cadastrar condutor'}</button></div>{open&&<Drawer title={editing?`Editar condutor (${editing.id})`:'Cadastro completo do condutor'} onClose={closeDrawer}><form key={editing?.id||'new'} onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Field label="Nome completo" name="name" defaultValue={editing?.name}/><Field label="N.º de identificação / BI" name="document" defaultValue={editing?.document}/><Field label="N.º da carta de condução" name="license" defaultValue={editing?.license} placeholder="Ex.: GB-B-10294"/><label className="block text-xs font-semibold text-[#4b5549]">Categorias habilitadas (A, B, C, D, E)<select name="category" defaultValue={editing?.category||'B · Ligeiros'} className={`mt-1.5 ${inputClass}`}><option value="A · Motociclos">A · Motociclos</option><option value="B · Ligeiros">B · Ligeiros</option><option value="A, B · Motociclos e Ligeiros">A, B · Motociclos e Ligeiros</option><option value="B, C · Ligeiros e Mercadorias">B, C · Ligeiros e Mercadorias</option><option value="C · Pesados de Mercadorias">C · Pesados de Mercadorias</option><option value="D · Pesados de Passageiros">D · Pesados de Passageiros</option><option value="C, D, E · Pesados e Passageiros">C, D, E · Pesados e Passageiros</option><option value="A, B, C, D, E · Todas as Categorias">A, B, C, D, E · Todas as Categorias</option></select></label><Field label="Data de emissão da carta" name="issueDate" type="date" defaultValue={editing?.issueDate||new Date().toISOString().slice(0,10)}/><Field label="Data de validade da carta" name="expiryDate" type="date" defaultValue={editing?.expiryDate||'2031-01-15'}/><Field label="Pontuação atual (0 a 20)" name="points" type="number" defaultValue={String(editing?.points??20)}/><Field label="Telefone" name="phone" defaultValue={editing?.phone}/><Field label="Distrito" name="district" defaultValue={editing?.district}/><label className="block text-xs font-semibold text-[#4b5549]">Estado da habilitação<select name="status" defaultValue={editing?.status||'Ativo'} className={`mt-1.5 ${inputClass}`}><option value="Ativo">Ativo</option><option value="Suspenso">Suspenso</option><option value="Cassado">Cassado</option><option value="Inativo">Inativo</option></select></label><div className="sm:col-span-2"><Field label="Restrições médicas / averbamentos (opcional)" name="medicalRestrictions" required={false} defaultValue={editing?.medicalRestrictions||'Sem restrições'} placeholder="Ex.: Uso obrigatório de lentes corretivas"/></div><label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2 lg:col-span-3">Documento comprobatório (PDF ou imagem){editing?' (opcional)':''}<input type="file" name="documentFile" accept=".pdf,.jpg,.jpeg,.png" required={!editing} className={`mt-1.5 ${inputClass} file:mr-3 file:border-0 file:bg-[#173d2b] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white`}/></label><p className="text-[11px] leading-4 text-[#737a70] sm:col-span-2 lg:col-span-3">Ficheiro até 1 MB. {editing?'Deixe em branco para manter o documento atual.':'O campo “N.º de identificação” continua a registar o número do documento.'}</p>{documentError&&<p role="alert" className="text-sm text-[#9f1a2b] sm:col-span-2 lg:col-span-3">{documentError}</p>}<div className="flex items-end"><button className={primaryClass}>{editing?'Salvar alterações':'Guardar condutor'}</button></div></form></Drawer>}<div className="mt-5 overflow-x-auto border border-[#dcd9cc] bg-white p-4"><table className="w-full text-left text-sm"><thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]"><tr>{['Código','Condutor','Identificação / Doc.','Carta / Categorias','Emissão e Validade','Pontuação','Distrito','Estado','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr></thead><tbody>{filteredDrivers.map(d=><tr key={d.id} className="border-b border-[#f0eee7]"><td className="px-3 py-3 font-mono text-xs">{d.id}</td><td className="whitespace-nowrap px-3 py-3 font-semibold">{d.name}<span className="block text-[11px] font-normal text-[#737a70]">{d.phone}</span></td><td className="px-3 py-3">{d.document}{d.documentFile&&<span className="block text-[11px]"><a href={d.documentFile.dataUrl} download={d.documentFile.name} className="font-semibold text-[#006B35] underline">{d.documentFile.name}</a></span>}</td><td className="px-3 py-3 font-semibold">{d.license}<span className="block text-[11px] font-normal text-[#006B35]">{d.category}</span></td><td className="whitespace-nowrap px-3 py-3 text-xs"><div>Emissão: {d.issueDate||'2024-01-15'}</div><div className="font-semibold text-[#4b5549]">Validade: {d.expiryDate||'2029-01-15'}</div></td><td className="px-3 py-3"><span className={`inline-flex border px-2 py-0.5 text-xs font-bold ${(d.points??20)>=12?'border-[#009E49]/30 bg-[#009E49]/10 text-[#006B35]':'border-[#CE1126]/30 bg-[#CE1126]/10 text-[#9f1a2b]'}`}>{d.points??20} pts</span></td><td className="px-3 py-3">{d.district}</td><td className="px-3 py-3"><Status value={d.status}/></td><td className="whitespace-nowrap px-3 py-3"><div className="flex items-center gap-3"><button type="button" onClick={()=>openEdit(d)} className="text-xs font-semibold text-[#006B35] hover:underline">Editar</button><button type="button" onClick={()=>handleDelete(d.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Excluir</button></div></td></tr>)}</tbody></table></div></Shell>;
}

export function DriverLicenseIssuePage(){
  const [drivers,setDrivers]=useSaved('drivers',seedDrivers);
  const [records,setRecords]=useSaved('driver-license-records',seedDriverLicenseRecords);
  const [open,setOpen]=useState(false);
  const [selectedDriverId,setSelectedDriverId]=useState('');
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const selectedDriver=drivers.find(d=>d.id===selectedDriverId)||drivers[0];
  const issueRecords=records.filter(r=>r.recordType==='Emissão');

  async function submitIssue(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const driverId=String(f.get('driverId')||selectedDriver?.id||'');
    if(!driverId){setError('Selecione um condutor.');return;}
    try{
      setError('');setSuccessMsg('');
      const res=await api.post<{record:DriverLicenseRecord;driver:Driver}>('/driver-license-records',{
        driverId,
        recordType:'Emissão',
        actionDetail:String(f.get('actionDetail')||'1.ª Emissão Definitiva'),
        license:String(f.get('license')||'').trim(),
        category:String(f.get('category')||'B · Ligeiros'),
        issueDate:String(f.get('issueDate')||new Date().toISOString().slice(0,10)),
        expiryDate:String(f.get('expiryDate')||'2031-11-02'),
        notes:String(f.get('notes')||'').trim(),
      });
      setRecords([res.data.record,...records]);
      setDrivers(rows=>rows.map(d=>d.id===res.data.driver.id?res.data.driver:d));
      setSuccessMsg(`Carta de condução ${res.data.driver.license} emitida com sucesso para ${res.data.driver.name}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível registar a emissão da carta.');
    }
  }

  return <Shell>
    <Title eyebrow="Gestão de condutores · Submenu 2" title="Emissão de carta de condução" description="Emissão de 1.ª via definitiva, 2.ª via por extravio/dano, conversão de carta estrangeira e licença provisória." icon={Users}/>
    <DriverSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Cartas emitidas" value={String(drivers.length)} detail="Condutores habilitados na base" icon={Users}/>
      <Stat label="Registos de emissão" value={String(issueRecords.length)} detail="Processos de 1.ª e 2.ª via" icon={ClipboardCheck}/>
      <Stat label="Cartas ativas" value={String(drivers.filter(d=>d.status==='Ativo').length)} detail="Regulares para condução" icon={ShieldCheck}/>
    </div>
    <div className="mb-4 flex justify-end">
      <button type="button" onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Emitir carta de condução'}</button>
    </div>
    {open&&<Drawer title="Emissão de carta de condução" onClose={()=>setOpen(false)}>
      <form onSubmit={submitIssue} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Condutor
          <select name="driverId" value={selectedDriver?.id||''} onChange={e=>setSelectedDriverId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {drivers.map(d=><option key={d.id} value={d.id}>{d.name} · Doc.: {d.document} · Carta atual: {d.license}</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Modalidade de emissão
          <select name="actionDetail" className={`mt-1.5 ${inputClass}`}>
            <option value="1.ª Emissão Definitiva de Carta de Condução">1.ª Emissão Definitiva de Carta de Condução</option>
            <option value="2.ª Via por Extravio ou Deterioração">2.ª Via por Extravio ou Deterioração</option>
            <option value="Conversão de Carta de Condução Estrangeira">Conversão de Carta de Condução Estrangeira</option>
            <option value="Emissão de Licença Especial / Internacional">Emissão de Licença Especial / Internacional</option>
          </select>
        </label>
        <Field label="N.º da Carta a emitir" name="license" defaultValue={selectedDriver?.license||`GB-B-${String(Date.now()).slice(-5)}`}/>
        <label className="block text-xs font-semibold text-[#4b5549]">Categoria(s) habilitada(s)
          <select name="category" defaultValue={selectedDriver?.category||'B · Ligeiros'} className={`mt-1.5 ${inputClass}`}>
            <option value="A · Motociclos">A · Motociclos</option>
            <option value="B · Ligeiros">B · Ligeiros</option>
            <option value="A, B · Motociclos e Ligeiros">A, B · Motociclos e Ligeiros</option>
            <option value="B, C · Ligeiros e Mercadorias">B, C · Ligeiros e Mercadorias</option>
            <option value="C · Pesados de Mercadorias">C · Pesados de Mercadorias</option>
            <option value="D · Pesados de Passageiros">D · Pesados de Passageiros</option>
            <option value="C, D, E · Pesados e Passageiros">C, D, E · Pesados e Passageiros</option>
          </select>
        </label>
        <Field label="Data de emissão" name="issueDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Data de validade" name="expiryDate" type="date" defaultValue="2031-11-02"/>
        <div className="sm:col-span-2">
          <Field label="Observações / Pauta de exame / Delegação emissora" name="notes" required={false} placeholder="Ex.: Aprovado em exame prático na Escola de Condução de Bissau"/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Confirmar emissão da carta</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Histórico de Emissões de Cartas de Condução</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Ref.ª','Condutor','N.º da Carta','Modalidade','Categoria(s)','Emissão','Validade','Observações'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {issueRecords.map(r=><tr key={r.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs">{r.id}</td>
            <td className="px-3 py-3 font-semibold">{r.driverName}</td>
            <td className="px-3 py-3 font-semibold text-[#006B35]">{r.license}</td>
            <td className="px-3 py-3">{r.actionDetail}</td>
            <td className="px-3 py-3">{r.category}</td>
            <td className="px-3 py-3">{r.issueDate}</td>
            <td className="px-3 py-3 font-semibold">{r.expiryDate}</td>
            <td className="px-3 py-3 text-xs text-[#737a70]">{r.notes||'—'}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function DriverCategoriesPage(){
  const [drivers,setDrivers]=useSaved('drivers',seedDrivers);
  const [records,setRecords]=useSaved('driver-license-records',seedDriverLicenseRecords);
  const [open,setOpen]=useState(false);
  const [selectedDriverId,setSelectedDriverId]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [error,setError]=useState('');
  const selectedDriver=drivers.find(d=>d.id===selectedDriverId)||drivers[0];

  const categoriesSpec=[
    {code:'A',title:'Categoria A · Motociclos e Ciclomotores',vehicles:'Motociclos de cilindrada superior a 50 cm³, triciclos e ciclomotores.',minAge:'18 anos (16 anos para subcategoria A1)',validity:'5 anos',exam:'Exame médico + prova teórica e prática em motociclo'},
    {code:'B',title:'Categoria B · Automóveis Ligeiros',vehicles:'Veículos automóveis ligeiros de passageiros (até 9 lugares) e mistos/mercadorias até 3.500 kg de peso bruto.',minAge:'18 anos',validity:'5 anos',exam:'Exame médico + prova teórica e prática em veículo ligeiro'},
    {code:'C',title:'Categoria C · Pesados de Mercadorias',vehicles:'Automóveis pesados de mercadorias com peso bruto superior a 3.500 kg e tratores rodoviários.',minAge:'21 anos (habilitação prévia na Cat. B)',validity:'5 anos (3 anos após os 60 anos)',exam:'Exame médico + avaliação psicológica + prova prática de pesados'},
    {code:'D',title:'Categoria D · Pesados de Passageiros',vehicles:'Automóveis pesados utilizados no transporte coletivo de passageiros com mais de 8 lugares além do condutor.',minAge:'21 anos (habilitação prévia na Cat. B ou C)',validity:'5 anos (exige exame médico e psicológico)',exam:'Exame médico + avaliação psicotécnica obrigatória + prova prática'},
    {code:'E',title:'Categoria E · Reboques e Articulados (BE, CE, DE)',vehicles:'Conjuntos de veículos acoplados cujo veículo trator pertença às categorias B, C ou D com reboque > 750 kg.',minAge:'21 anos',validity:'Conforme a categoria do veículo trator',exam:'Exame médico + avaliação psicológica + prova de manobra de acoplados'},
  ];

  async function submitCategoryChange(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const driverId=String(f.get('driverId')||selectedDriver?.id||'');
    try{
      setError('');setSuccessMsg('');
      const res=await api.post<{record:DriverLicenseRecord;driver:Driver}>('/driver-license-records',{
        driverId,
        recordType:'Categoria',
        actionDetail:String(f.get('actionDetail')||'Averbamento de Nova Categoria'),
        category:String(f.get('category')||'B, C · Ligeiros e Mercadorias'),
        issueDate:String(f.get('issueDate')||new Date().toISOString().slice(0,10)),
        expiryDate:selectedDriver?.expiryDate||'2029-05-12',
        notes:String(f.get('notes')||'').trim(),
      });
      setRecords([res.data.record,...records]);
      setDrivers(rows=>rows.map(d=>d.id===res.data.driver.id?res.data.driver:d));
      setSuccessMsg(`Categoria atualizada para "${res.data.driver.category}" no condutor ${res.data.driver.name}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível atualizar a categoria.');
    }
  }

  return <Shell>
    <Title eyebrow="Gestão de condutores · Submenu 3" title="Categorias de habilitação (A, B, C, D, E)" description="Quadro regulamentar das categorias de condução (A, B, C, D, E), requisitos técnicos e averbamento/progressão de categoria por condutor." icon={Users}/>
    <DriverSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-4 flex justify-end">
      <button type="button" onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Averbar / alterar categoria de condutor'}</button>
    </div>
    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {categoriesSpec.map(cat=>{
        const count=drivers.filter(d=>d.category.toUpperCase().includes(cat.code)).length;
        return <div key={cat.code} className="flex flex-col justify-between border border-[#dcd9cc] border-t-4 border-t-[#009E49] bg-white p-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center bg-[#173d2b] font-serif text-lg font-bold text-[#FCD116]">{cat.code}</span>
              <span className="border border-[#009E49]/30 bg-[#009E49]/10 px-2 py-0.5 text-xs font-bold text-[#006B35]">{count} condutor(es)</span>
            </div>
            <h3 className="mt-3 font-serif text-base font-bold text-[#1c3024]">{cat.title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-[#697168]">{cat.vehicles}</p>
          </div>
          <div className="mt-4 space-y-1 border-t border-[#f0eee7] pt-3 text-[11px] text-[#4b5549]">
            <div><b>Idade mínima:</b> {cat.minAge}</div>
            <div><b>Validade padrão:</b> {cat.validity}</div>
            <div><b>Exigência:</b> {cat.exam}</div>
          </div>
        </div>;
      })}
    </div>
    {open&&<Drawer title="Averbamento / Alteração de Categoria (A, B, C, D, E)" onClose={()=>setOpen(false)}>
      <form onSubmit={submitCategoryChange} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Condutor
          <select name="driverId" value={selectedDriver?.id||''} onChange={e=>setSelectedDriverId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {drivers.map(d=><option key={d.id} value={d.id}>{d.name} · Carta: {d.license} · Atual: {d.category}</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Natureza da alteração
          <select name="actionDetail" className={`mt-1.5 ${inputClass}`}>
            <option value="Adição / Averbamento de Categoria">Adição / Averbamento de Categoria</option>
            <option value="Progressão para Categoria Pesados (C / D / E)">Progressão para Categoria Pesados (C / D / E)</option>
            <option value="Restrição / Reclassificação de Categoria">Restrição / Reclassificação de Categoria</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Nova(s) Categoria(s) Habilitada(s)
          <select name="category" defaultValue={selectedDriver?.category||'B, C · Ligeiros e Mercadorias'} className={`mt-1.5 ${inputClass}`}>
            <option value="A · Motociclos">A · Motociclos</option>
            <option value="B · Ligeiros">B · Ligeiros</option>
            <option value="A, B · Motociclos e Ligeiros">A, B · Motociclos e Ligeiros</option>
            <option value="B, C · Ligeiros e Mercadorias">B, C · Ligeiros e Mercadorias</option>
            <option value="C · Pesados de Mercadorias">C · Pesados de Mercadorias</option>
            <option value="D · Pesados de Passageiros">D · Pesados de Passageiros</option>
            <option value="C, D, E · Pesados e Passageiros">C, D, E · Pesados e Passageiros</option>
            <option value="A, B, C, D, E · Todas as Categorias">A, B, C, D, E · Todas as Categorias</option>
          </select>
        </label>
        <Field label="Data do averbamento" name="issueDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Observações / N.º da Pauta de Exame" name="notes" required={false} placeholder="Ex.: Exame prático de pesados aprovado"/>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Guardar alteração de categoria</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Condutores por Categoria de Habilitação</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Código','Condutor','N.º da Carta','Categorias Habilitadas (A, B, C, D, E)','Restrições / Averbamentos','Distrito','Estado'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {drivers.map(d=><tr key={d.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs">{d.id}</td>
            <td className="px-3 py-3 font-semibold">{d.name}</td>
            <td className="px-3 py-3 font-semibold">{d.license}</td>
            <td className="px-3 py-3"><span className="border border-[#009E49]/30 bg-[#009E49]/10 px-2.5 py-1 text-xs font-bold text-[#006B35]">{d.category}</span></td>
            <td className="px-3 py-3 text-xs text-[#697168]">{d.medicalRestrictions||'Sem restrições'}</td>
            <td className="px-3 py-3">{d.district}</td>
            <td className="px-3 py-3"><Status value={d.status}/></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function DriverRenewalPage(){
  const [drivers,setDrivers]=useSaved('drivers',seedDrivers);
  const [records,setRecords]=useSaved('driver-license-records',seedDriverLicenseRecords);
  const [open,setOpen]=useState(false);
  const [selectedDriverId,setSelectedDriverId]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [error,setError]=useState('');
  const today='2026-11-02';
  const selectedDriver=drivers.find(d=>d.id===selectedDriverId)||drivers[0];
  const renewalRecords=records.filter(r=>r.recordType==='Renovação');

  const expiredCount=drivers.filter(d=>(d.expiryDate||'2029-01-01')<today).length;
  const validCount=drivers.length-expiredCount;

  async function submitRenewal(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const driverId=String(f.get('driverId')||selectedDriver?.id||'');
    try{
      setError('');setSuccessMsg('');
      const res=await api.post<{record:DriverLicenseRecord;driver:Driver}>('/driver-license-records',{
        driverId,
        recordType:'Renovação',
        actionDetail:String(f.get('actionDetail')||'Renovação Periódica de Carta de Condução'),
        issueDate:String(f.get('issueDate')||today),
        expiryDate:String(f.get('expiryDate')||'2031-11-02'),
        notes:String(f.get('notes')||'').trim(),
      });
      setRecords([res.data.record,...records]);
      setDrivers(rows=>rows.map(d=>d.id===res.data.driver.id?res.data.driver:d));
      setSuccessMsg(`Carta ${res.data.driver.license} de ${res.data.driver.name} renovada até ${res.data.driver.expiryDate}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível renovar a carta.');
    }
  }

  return <Shell>
    <Title eyebrow="Gestão de condutores · Submenu 4" title="Renovação e validade da carta" description="Controlo de prazos de validade das cartas de condução, alerta de cartas vencidas e registo de renovações periódicas." icon={ClipboardCheck}/>
    <DriverSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Cartas dentro da validade" value={String(validCount)} detail="Vigentes na data atual" icon={Check}/>
      <Stat label="Cartas vencidas / a renovar" value={String(expiredCount)} detail="Exigem renovação imediata" icon={AlertTriangle}/>
      <Stat label="Renovações processadas" value={String(renewalRecords.length)} detail="Histórico de renovações" icon={ClipboardCheck}/>
    </div>
    <div className="mb-4 flex justify-end">
      <button type="button" onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Renovar carta de condução'}</button>
    </div>
    {open&&<Drawer title="Renovação de Carta de Condução" onClose={()=>setOpen(false)}>
      <form onSubmit={submitRenewal} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Condutor
          <select name="driverId" value={selectedDriver?.id||''} onChange={e=>setSelectedDriverId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {drivers.map(d=><option key={d.id} value={d.id}>{d.name} · Carta: {d.license} · Validade atual: {d.expiryDate||'2029-01-15'}</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Tipo de renovação
          <select name="actionDetail" className={`mt-1.5 ${inputClass}`}>
            <option value="Renovação Periódica Quinquenal (5 anos)">Renovação Periódica Quinquenal (5 anos)</option>
            <option value="Renovação de Carta Profissional (Cat. C, D, E)">Renovação de Carta Profissional (Cat. C, D, E)</option>
            <option value="Renovação com Reavaliação Médica">Renovação com Reavaliação Médica</option>
          </select>
        </label>
        <Field label="Data da renovação" name="issueDate" type="date" defaultValue={today}/>
        <Field label="Nova data de validade" name="expiryDate" type="date" defaultValue="2031-11-02"/>
        <Field label="Observações / Atestado médico apresentado" name="notes" required={false} placeholder="Ex.: Atestado médico válido e taxa de renovação liquidada"/>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Confirmar renovação e atualizar validade</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Situação de Validade por Condutor</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Condutor','N.º da Carta','Categoria','Última Emissão','Data de Validade','Situação da Validade','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {drivers.map(d=>{
            const exp=d.expiryDate||'2029-01-15';
            const isExpired=exp<today;
            return <tr key={d.id} className="border-b border-[#f0eee7]">
              <td className="px-3 py-3 font-semibold">{d.name}</td>
              <td className="px-3 py-3 font-semibold">{d.license}</td>
              <td className="px-3 py-3">{d.category}</td>
              <td className="px-3 py-3">{d.issueDate||'2024-01-15'}</td>
              <td className="px-3 py-3 font-semibold">{exp}</td>
              <td className="px-3 py-3"><Status value={isExpired?'Vencida':'Válida'}/></td>
              <td className="px-3 py-3"><button type="button" onClick={()=>{setSelectedDriverId(d.id);setOpen(true);}} className="text-xs font-semibold text-[#006B35] hover:underline">Renovar carta</button></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function DriverSuspensionPage(){
  const [drivers,setDrivers]=useSaved('drivers',seedDrivers);
  const [records,setRecords]=useSaved('driver-license-records',seedDriverLicenseRecords);
  const [open,setOpen]=useState(false);
  const [selectedDriverId,setSelectedDriverId]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [error,setError]=useState('');
  const selectedDriver=drivers.find(d=>d.id===selectedDriverId)||drivers[0];
  const suspensionRecords=records.filter(r=>r.recordType==='Suspensão / Cassação');

  async function submitSanction(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const driverId=String(f.get('driverId')||selectedDriver?.id||'');
    try{
      setError('');setSuccessMsg('');
      const res=await api.post<{record:DriverLicenseRecord;driver:Driver}>('/driver-license-records',{
        driverId,
        recordType:'Suspensão / Cassação',
        actionDetail:String(f.get('actionDetail')||'Suspensão Temporária (90 dias)'),
        issueDate:String(f.get('issueDate')||new Date().toISOString().slice(0,10)),
        expiryDate:String(f.get('expiryDate')||''),
        notes:String(f.get('notes')||'').trim(),
      });
      setRecords([res.data.record,...records]);
      setDrivers(rows=>rows.map(d=>d.id===res.data.driver.id?res.data.driver:d));
      setSuccessMsg(`Medida "${res.data.record.actionDetail}" aplicada ao condutor ${res.data.driver.name} (Estado atual: ${res.data.driver.status}).`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível registar a medida administrativa.');
    }
  }

  return <Shell>
    <Title eyebrow="Gestão de condutores · Submenu 5" title="Suspensão e cassação da habilitação" description="Registo de sanções acessórias de inibição de conduzir (suspensão temporária), cassação definitiva da carta e reabilitação legal." icon={AlertTriangle}/>
    <DriverSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Condutores ativos" value={String(drivers.filter(d=>d.status==='Ativo').length)} detail="Habilitação regular" icon={Check}/>
      <Stat label="Habilitações suspensas" value={String(drivers.filter(d=>d.status==='Suspenso').length)} detail="Inibição temporária de conduzir" icon={AlertTriangle}/>
      <Stat label="Habilitações cassadas" value={String(drivers.filter(d=>d.status==='Cassado').length)} detail="Perda definitiva do título" icon={ShieldCheck}/>
    </div>
    <div className="mb-4 flex justify-end">
      <button type="button" onClick={()=>{setOpen(!open);setError('');}} className="inline-flex items-center justify-center gap-2 bg-[#9f1a2b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7f1422]"><AlertTriangle size={16}/>{open?'Fechar formulário':'Registar suspensão / cassação / reabilitação'}</button>
    </div>
    {open&&<Drawer title="Suspensão, Cassação ou Reabilitação de Carta" onClose={()=>setOpen(false)}>
      <form onSubmit={submitSanction} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Condutor
          <select name="driverId" value={selectedDriver?.id||''} onChange={e=>setSelectedDriverId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {drivers.map(d=><option key={d.id} value={d.id}>{d.name} · Carta: {d.license} · Estado atual: {d.status}</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Tipo de medida administrativa / judicial
          <select name="actionDetail" className={`mt-1.5 ${inputClass}`}>
            <option value="Suspensão Temporária da Habilitação (30 dias)">Suspensão Temporária da Habilitação (30 dias)</option>
            <option value="Suspensão Temporária da Habilitação (90 dias)">Suspensão Temporária da Habilitação (90 dias)</option>
            <option value="Suspensão Temporária da Habilitação (180 dias)">Suspensão Temporária da Habilitação (180 dias)</option>
            <option value="Cassação Definitiva da Carta de Condução">Cassação Definitiva da Carta de Condução (Perda total de pontos / Crime rodoviário)</option>
            <option value="Reabilitação / Levantamento de Suspensão (Ativo)">Reabilitação / Levantamento de Suspensão (Restaura para Ativo)</option>
          </select>
        </label>
        <Field label="Data de início da medida" name="issueDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Termo previsto da suspensão (se aplicável)" name="expiryDate" type="date" required={false}/>
        <div className="sm:col-span-2">
          <Field label="Fundamentação legal / N.º do Processo Administrativo" name="notes" placeholder="Ex.: Processo contraordenacional n.º 412/2026 · Reincidência em infração gravíssima"/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className="inline-flex items-center justify-center gap-2 bg-[#9f1a2b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7f1422]">Aplicar medida e atualizar estado do condutor</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Estado das Habilitações e Processos de Suspensão / Cassação</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Condutor','Carta','Categoria','Pontuação','Estado da Habilitação','Última Ocorrência / Processo'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {drivers.map(d=>{
            const lastRec=suspensionRecords.find(r=>r.driverId===d.id);
            return <tr key={d.id} className="border-b border-[#f0eee7]">
              <td className="px-3 py-3 font-semibold">{d.name}</td>
              <td className="px-3 py-3 font-semibold">{d.license}</td>
              <td className="px-3 py-3">{d.category}</td>
              <td className="px-3 py-3 font-bold">{d.points??20} pts</td>
              <td className="px-3 py-3"><Status value={d.status}/></td>
              <td className="px-3 py-3 text-xs text-[#697168]">{lastRec?`${lastRec.actionDetail} (${lastRec.issueDate}) · ${lastRec.notes||''}`:'Sem processos de suspensão ou cassação'}</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function DriverInfractionsHistoryPage(){
  const [drivers]=useSaved('drivers',seedDrivers);
  const [fines]=useSaved('fines',seedFines);
  const [infractionTypes]=useSaved('infraction-types',seedInfractionTypes);
  const [driverFilter,setDriverFilter]=useState('');
  const [search,setSearch]=useState('');

  const severityPoints:Record<string,number>={Leve:2,Média:4,Grave:5,Gravíssima:7};

  const enrichedFines=useMemo(()=>{
    return fines.map(f=>{
      const it=infractionTypes.find(t=>t.name.toLowerCase()===f.infraction.toLowerCase());
      const severity=it?.severity||'Média';
      const pointsLost=severityPoints[severity]||4;
      const drv=drivers.find(d=>d.name.toLowerCase()===(f.driver||'').toLowerCase());
      return {...f,severity,pointsLost,driverLicense:drv?.license||'—',driverId:drv?.id||''};
    }).filter(f=>{
      if(driverFilter&&f.driver.toLowerCase()!==driverFilter.toLowerCase())return false;
      if(!search.trim())return true;
      const q=search.toLowerCase();
      return [f.id,f.plate,f.driver,f.infraction,f.severity].join(' ').toLowerCase().includes(q);
    });
  },[fines,infractionTypes,drivers,driverFilter,search]);

  return <Shell>
    <Title eyebrow="Gestão de condutores · Submenu 6" title="Histórico de infrações do condutor" description="Consulta consolidada de autos de infração por condutor, gravidade, perda de pontos e situação de pagamento." icon={ClipboardList}/>
    <DriverSubmenuBar/>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Filtrar por condutor" value={driverFilter} onChange={e=>setDriverFilter(e.target.value)} className="border border-[#d5d1c2] bg-white px-3 py-2.5 text-sm outline-none">
          <option value="">Todos os condutores</option>
          {drivers.map(d=><option key={d.id} value={d.name}>{d.name} · Carta: {d.license}</option>)}
        </select>
        <label className="flex items-center gap-2 border border-[#d5d1c2] bg-white px-3">
          <Search size={16} className="text-[#737a70]"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar auto, matrícula ou infração" className="w-64 py-2 text-sm outline-none"/>
        </label>
      </div>
      <Link to="/fines" className={secondaryClass}><ClipboardList size={16}/> Registar novo auto de infração</Link>
    </div>
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º do Auto','Data','Condutor / Carta','Matrícula','Infração','Gravidade',' Impacto na Pontuação','Valor (XOF)','Estado'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {enrichedFines.map(f=><tr key={f.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs">{f.id}</td>
            <td className="px-3 py-3">{f.date}</td>
            <td className="px-3 py-3 font-semibold">{f.driver}<span className="block text-[11px] font-normal text-[#737a70]">Carta: {f.driverLicense}</span></td>
            <td className="px-3 py-3 font-semibold">{f.plate}</td>
            <td className="px-3 py-3">{f.infraction}</td>
            <td className="px-3 py-3"><Status value={f.severity}/></td>
            <td className="px-3 py-3 font-bold text-[#9f1a2b]">-{f.pointsLost} pontos</td>
            <td className="px-3 py-3 font-semibold">{currency(f.amount)}</td>
            <td className="px-3 py-3"><Status value={f.status}/></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function DriverPointsPage(){
  const [drivers,setDrivers]=useSaved('drivers',seedDrivers);
  const [records,setRecords]=useSaved('driver-license-records',seedDriverLicenseRecords);
  const [open,setOpen]=useState(false);
  const [selectedDriverId,setSelectedDriverId]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [error,setError]=useState('');
  const selectedDriver=drivers.find(d=>d.id===selectedDriverId)||drivers[0];

  async function submitPoints(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const driverId=String(f.get('driverId')||selectedDriver?.id||'');
    try{
      setError('');setSuccessMsg('');
      const res=await api.post<{record:DriverLicenseRecord;driver:Driver}>('/driver-license-records',{
        driverId,
        recordType:'Pontuação',
        actionDetail:String(f.get('actionDetail')||'Dedução por Infração Rodoviária'),
        pointsDelta:Number(f.get('pointsDelta')||0),
        issueDate:String(f.get('issueDate')||new Date().toISOString().slice(0,10)),
        notes:String(f.get('notes')||'').trim(),
      });
      setRecords([res.data.record,...records]);
      setDrivers(rows=>rows.map(d=>d.id===res.data.driver.id?res.data.driver:d));
      setSuccessMsg(`Pontuação de ${res.data.driver.name} atualizada para ${res.data.driver.points} pontos.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível atualizar a pontuação.');
    }
  }

  return <Shell>
    <Title eyebrow="Gestão de condutores · Submenu 7" title="Pontuação do condutor" description="Controlo de saldo de pontos da carta por condutor (máximo 20 pontos), perda de pontos por infração e reabilitação por curso de segurança rodoviária." icon={Activity}/>
    <DriverSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-5 grid gap-3 sm:grid-cols-4">
      <div className="border border-[#dcd9cc] bg-white p-4 text-xs"><div className="font-bold uppercase text-[#006B35]">Infração Leve</div><div className="mt-1 font-serif text-xl font-bold">-2 pontos</div><div className="mt-1 text-[#737a70]">Ex.: Estacionamento irregular</div></div>
      <div className="border border-[#dcd9cc] bg-white p-4 text-xs"><div className="font-bold uppercase text-[#836300]">Infração Média</div><div className="mt-1 font-serif text-xl font-bold">-4 pontos</div><div className="mt-1 text-[#737a70]">Ex.: Falta de inspeção periódica</div></div>
      <div className="border border-[#dcd9cc] bg-white p-4 text-xs"><div className="font-bold uppercase text-[#9f1a2b]">Infração Grave</div><div className="mt-1 font-serif text-xl font-bold">-5 pontos</div><div className="mt-1 text-[#737a70]">Ex.: Documentação em falta</div></div>
      <div className="border border-[#dcd9cc] bg-white p-4 text-xs"><div className="font-bold uppercase text-[#CE1126]">Infração Gravíssima</div><div className="mt-1 font-serif text-xl font-bold">-7 pontos</div><div className="mt-1 text-[#737a70]">Ex.: Excesso de velocidade / Álcool</div></div>
    </div>
    <div className="mb-4 flex justify-end">
      <button type="button" onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Lançar dedução ou reciclagem de pontos'}</button>
    </div>
    {open&&<Drawer title="Atualização de Pontuação do Condutor" onClose={()=>setOpen(false)}>
      <form onSubmit={submitPoints} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Condutor
          <select name="driverId" value={selectedDriver?.id||''} onChange={e=>setSelectedDriverId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {drivers.map(d=><option key={d.id} value={d.id}>{d.name} · Carta: {d.license} · Saldo atual: {d.points??20} pontos</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Motivo da movimentação
          <select name="actionDetail" className={`mt-1.5 ${inputClass}`}>
            <option value="Dedução por Infração Leve (-2 pts)">Dedução por Infração Leve (-2 pts)</option>
            <option value="Dedução por Infração Média (-4 pts)">Dedução por Infração Média (-4 pts)</option>
            <option value="Dedução por Infração Grave (-5 pts)">Dedução por Infração Grave (-5 pts)</option>
            <option value="Dedução por Infração Gravíssima (-7 pts)">Dedução por Infração Gravíssima (-7 pts)</option>
            <option value="Recuperação de Pontos (Curso de Reciclagem)">Recuperação de Pontos (Curso de Reciclagem +5 pts)</option>
            <option value="Bonificação por 3 anos sem infrações (+3 pts)">Bonificação por 3 anos sem infrações (+3 pts)</option>
          </select>
        </label>
        <Field label="Variação de pontos (ex.: -5 ou +5)" name="pointsDelta" type="number" defaultValue="-4"/>
        <Field label="Data do lançamento" name="issueDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Observações / N.º do Auto ou Certificado" name="notes" required={false} placeholder="Ex.: Auto GB-2026-0014 ou Certificado de Reciclagem"/>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Confirmar atualização de pontos</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Saldo de Pontos por Condutor</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Condutor','N.º da Carta','Categoria','Saldo de Pontos (Máx. 20)','Nível / Alerta','Estado da Carta'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {drivers.map(d=>{
            const pts=d.points??20;
            const pct=Math.max(5,Math.min(100,(pts/20)*100));
            return <tr key={d.id} className="border-b border-[#f0eee7]">
              <td className="px-3 py-3 font-semibold">{d.name}</td>
              <td className="px-3 py-3 font-semibold">{d.license}</td>
              <td className="px-3 py-3">{d.category}</td>
              <td className="px-3 py-3 w-64">
                <div className="mb-1 flex justify-between text-xs font-bold"><span>{pts} / 20 pontos</span></div>
                <div className="h-2.5 bg-[#eeede5]"><div className={`h-full ${pts>=12?'bg-[#009E49]':pts>=6?'bg-[#FCD116]':'bg-[#CE1126]'}`} style={{width:`${pct}%`}}/></div>
              </td>
              <td className="px-3 py-3"><Status value={pts>=12?'Regular':pts>=6?'Atenção · Reciclagem':'Crítico · Risco de Cassação'}/></td>
              <td className="px-3 py-3"><Status value={d.status}/></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function DriverExamsPage(){
  const [drivers,setDrivers]=useSaved('drivers',seedDrivers);
  const [exams,setExams]=useSaved('driver-exams',seedDriverExams);
  const [open,setOpen]=useState(false);
  const [selectedDriverId,setSelectedDriverId]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [error,setError]=useState('');
  const selectedDriver=drivers.find(d=>d.id===selectedDriverId)||drivers[0];

  async function submitExam(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const driverId=String(f.get('driverId')||selectedDriver?.id||'');
    try{
      setError('');setSuccessMsg('');
      const res=await api.post<{exam:DriverExam;driver:Driver}>('/driver-exams',{
        driverId,
        targetCategory:String(f.get('targetCategory')||selectedDriver?.category||'B'),
        examType:String(f.get('examType')||'Exame Médico de Aptidão Física'),
        result:String(f.get('result')||'Apto'),
        medicalEntity:String(f.get('medicalEntity')||'').trim(),
        certificateNumber:String(f.get('certificateNumber')||'').trim(),
        restrictions:String(f.get('restrictions')||'Sem restrições').trim(),
        examDate:String(f.get('examDate')||new Date().toISOString().slice(0,10)),
        expiryDate:String(f.get('expiryDate')||'2029-11-02'),
      });
      setExams([res.data.exam,...exams]);
      setDrivers(rows=>rows.map(d=>d.id===res.data.driver.id?res.data.driver:d));
      setSuccessMsg(`Exame (${res.data.exam.examType}) registado com sucesso para ${res.data.driver.name}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível registar o exame.');
    }
  }

  async function handleDelete(id:string){
    if(!window.confirm(`Deseja remover o exame ${id}?`))return;
    try{await api.delete(`/driver-exams/${encodeURIComponent(id)}`);}catch{/* ignore */}
    setExams(rows=>rows.filter(r=>r.id!==id));
  }

  return <Shell>
    <Title eyebrow="Gestão de condutores · Submenu 8" title="Histórico de exames médicos e psicológicos" description="Registo de inspeções médicas de aptidão física, avaliações psicológicas (psicotécnicos para categorias C, D, E) e restrições obrigatórias na carta." icon={ClipboardCheck}/>
    <DriverSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Exames realizados" value={String(exams.length)} detail="Médicos e psicológicos" icon={ClipboardCheck}/>
      <Stat label="Condutores aptos" value={String(exams.filter(e=>e.result.startsWith('Apto')).length)} detail="Laudos favoráveis" icon={Check}/>
      <Stat label="Com restrições médicas" value={String(drivers.filter(d=>d.medicalRestrictions&&d.medicalRestrictions!=='Sem restrições').length)} detail="Lentes / avaliação periódica" icon={AlertTriangle}/>
    </div>
    <div className="mb-4 flex justify-end">
      <button type="button" onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Registar exame médico / psicológico'}</button>
    </div>
    {open&&<Drawer title="Registo de Exame Médico e Psicológico" onClose={()=>setOpen(false)}>
      <form onSubmit={submitExam} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Condutor avaliado
          <select name="driverId" value={selectedDriver?.id||''} onChange={e=>setSelectedDriverId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {drivers.map(d=><option key={d.id} value={d.id}>{d.name} · Carta: {d.license} · Cat.: {d.category}</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Tipo de avaliação
          <select name="examType" className={`mt-1.5 ${inputClass}`}>
            <option value="Exame Médico de Aptidão Física">Exame Médico de Aptidão Física</option>
            <option value="Avaliação Psicológica (Psicotécnico)">Avaliação Psicológica (Psicotécnico)</option>
            <option value="Exame Médico e Psicológico Completo">Exame Médico e Psicológico Completo</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Resultado do laudo
          <select name="result" className={`mt-1.5 ${inputClass}`}>
            <option value="Apto">Apto</option>
            <option value="Apto com restrições">Apto com restrições</option>
            <option value="Inapto temporário">Inapto temporário</option>
            <option value="Inapto">Inapto</option>
          </select>
        </label>
        <Field label="Categoria avaliada (A, B, C, D, E)" name="targetCategory" defaultValue={selectedDriver?.category||'B'}/>
        <Field label="Centro médico / Junta médica / Psicólogo" name="medicalEntity" defaultValue="Centro Nacional de Medicina Rodoviária · Bissau"/>
        <Field label="N.º do atestado / certificado médico" name="certificateNumber" placeholder="Ex.: ATM-2026-0912"/>
        <Field label="Data de realização do exame" name="examDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Validade do exame" name="expiryDate" type="date" defaultValue="2029-11-02"/>
        <div className="sm:col-span-2">
          <Field label="Restrições médicas ou psicológicas a averbar na carta" name="restrictions" defaultValue="Sem restrições" placeholder="Ex.: Uso obrigatório de lentes corretivas / Proibido conduzir à noite"/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Guardar exame no histórico do condutor</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Histórico de Exames Médicos e Psicológicos</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Código','Data','Condutor / Carta','Tipo de Exame','Cat.','Resultado','Entidade / N.º Atestado','Restrições / Validade','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {exams.map(ex=><tr key={ex.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs">{ex.id}</td>
            <td className="px-3 py-3">{ex.examDate}</td>
            <td className="px-3 py-3 font-semibold">{ex.driverName}<span className="block text-[11px] font-normal text-[#737a70]">Carta: {ex.license||'—'}</span></td>
            <td className="px-3 py-3 font-medium">{ex.examType}</td>
            <td className="px-3 py-3 font-bold text-[#006B35]">{ex.targetCategory}</td>
            <td className="px-3 py-3"><Status value={ex.result}/></td>
            <td className="px-3 py-3 text-xs">{ex.medicalEntity||'—'}{ex.certificateNumber&&<span className="block text-[11px] text-[#006B35]">Laudo: {ex.certificateNumber}</span>}</td>
            <td className="px-3 py-3 text-xs">{ex.restrictions||'Sem restrições'}{ex.expiryDate&&<span className="block text-[11px] text-[#737a70]">Válido até: {ex.expiryDate}</span>}</td>
            <td className="px-3 py-3"><button type="button" onClick={()=>handleDelete(ex.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Remover</button></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function CirculationTax(){const [vehicles,setVehicles]=useSaved('vehicles',seedVehicles);const [message,setMessage]=useState('');function pay(plate:string){setVehicles(rows=>rows.map(v=>v.plate===plate?{...v,taxDue:0}:v));setMessage(`Pagamento de demonstração registado para ${plate}.`);}return <Shell><Title eyebrow="Receita e regularização" title="Imposto de Circulação" description="Acompanhe obrigações simuladas por matrícula e registe pagamentos de demonstração." icon={Banknote}/><div className="mb-5 border-l-2 border-[#FCD116] bg-[#f5f2e7] p-4 text-sm leading-6"><b>Nomenclatura local:</b> Imposto de Circulação de Veículos, Motocicletas e Embarcações. A incidência depende da categoria; o valor anual divulgado para viaturas particulares foi 41.500 XOF. Esta tela não calcula imposto legal nem substitui uma guia da DGCI.</div>{message&&<div role="status" className="mb-4 border border-[#009E49]/30 bg-[#009E49]/10 p-3 text-sm text-[#006B35]">{message}</div>}<div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4"><table className="w-full text-left text-sm"><thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]"><tr>{['Matrícula','Titular','Categoria','Período','Valor demonstrativo','Estado','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr></thead><tbody>{vehicles.map(v=><tr key={v.plate} className="border-b border-[#f0eee7]"><td className="px-3 py-3 font-semibold">{v.plate}</td><td className="px-3 py-3">{v.owner}</td><td className="px-3 py-3">{v.category}</td><td className="px-3 py-3">2026</td><td className="px-3 py-3">{currency(v.taxDue)}</td><td className="px-3 py-3"><Status value={v.taxDue?'Pendente':'Pago'}/></td><td className="px-3 py-3"><button onClick={()=>pay(v.plate)} disabled={!v.taxDue} className={secondaryClass}><Check size={14}/> Simular pagamento</button></td></tr>)}</tbody></table></div></Shell>;}

function FineSubmenuBar(){const {pathname}=useLocation();return <div className="mb-6 flex flex-wrap gap-1.5 border-b border-[#dcd9cc] pb-4">{fineSubmenus.map(sub=>{const active=pathname===sub.path;return <Link key={sub.path} to={sub.path} className={`border px-3 py-1.5 text-xs font-semibold transition ${active?'border-[#006B35] bg-[#006B35] text-white':'border-[#d5d1c2] bg-white text-[#26372b] hover:border-[#009E49] hover:bg-[#f4f3ed]'}`}>{sub.label}</Link>;})}</div>;}

export function FineManagement(){
  const [vehicles]=useSaved('vehicles',seedVehicles);
  const [fines,setFines]=useSaved('fines',seedFines);
  const [infractionTypes]=useSaved('infraction-types',seedInfractionTypes);
  const [agents]=useSaved('inspection-agents',seedInspectionAgents);
  const [open,setOpen]=useState(false);
  const [plateQuery,setPlateQuery]=useState('');
  const [showSuggestions,setShowSuggestions]=useState(false);
  const [selectedInfraction,setSelectedInfraction]=useState('');
  const [selectedSeverity,setSelectedSeverity]=useState('Grave');
  const [fineAmount,setFineAmount]=useState('');
  const [fineError,setFineError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');

  useEffect(()=>{
    if(open&&!selectedInfraction&&infractionTypes.length>0){
      setSelectedInfraction(infractionTypes[0].name);
      setFineAmount(String(infractionTypes[0].amount));
      setSelectedSeverity(infractionTypes[0].severity||'Grave');
    }
  },[open,selectedInfraction,infractionTypes]);

  function handleInfractionChange(name:string){
    setSelectedInfraction(name);
    const found=infractionTypes.find(it=>it.name===name);
    if(found){
      setFineAmount(String(found.amount));
      setSelectedSeverity(found.severity||'Média');
    }
  }

  const matchedVehicles=useMemo(()=>{
    const q=plateQuery.trim().toLowerCase();
    return q?vehicles.filter(v=>v.plate.toLowerCase().includes(q)||v.owner.toLowerCase().includes(q)||(v.driver||'').toLowerCase().includes(q)):vehicles;
  },[vehicles,plateQuery]);

  const selectedVehicle=useMemo(()=>vehicles.find(v=>v.plate.toUpperCase()===plateQuery.trim().toUpperCase()),[vehicles,plateQuery]);

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const vehicle=selectedVehicle||vehicles.find(v=>v.plate.toUpperCase()===String(f.get('plate')||'').trim().toUpperCase());
    if(!vehicle){setFineError('Selecione um veículo válido da lista sugestiva.');return;}
    const agentBadgeVal=String(f.get('agentBadge')||'');
    const chosenAgent=agents.find(a=>a.badge===agentBadgeVal);
    try{
      setFineError('');setSuccessMsg('');
      const payload:Fine={
        id:`GB-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
        plate:vehicle.plate,
        driver:vehicle.driver||vehicle.owner,
        infraction:selectedInfraction||String(f.get('infraction')),
        severity:selectedSeverity,
        amount:Number(fineAmount||f.get('amount')),
        date:String(f.get('date')),
        status:'Pendente',
        agentName:chosenAgent?chosenAgent.name:String(f.get('agentName')||'Subcomissário Malam Bacai'),
        agentBadge:chosenAgent?chosenAgent.badge:agentBadgeVal||'AG-GB-0104',
        location:String(f.get('location')||'Av. Amílcar Cabral · Bissau').trim(),
        evidenceDescription:String(f.get('evidenceDescription')||'').trim(),
      };
      const res=await api.post<Fine>('/fines',payload);
      setFines([res.data,...fines]);
      setSuccessMsg(`Auto de infração ${res.data.id} emitido com sucesso para a matrícula ${res.data.plate}.`);
      setPlateQuery('');
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setFineError(err?.response?.data?.error||'Não foi possível emitir o auto de infração.');
    }
  }

  async function payFine(id:string){
    const receipt=`REC-DGV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const today=new Date().toISOString().slice(0,10);
    try{await api.put(`/fines/${encodeURIComponent(id)}`,{status:'Pago',paymentReceipt:receipt,paymentDate:today,paymentMethod:'Tesouraria / Guia de Pagamento'});}catch{/* ignore */}
    setFines(rows=>rows.map(row=>row.id===id?{...row,status:'Pago',paymentReceipt:receipt,paymentDate:today,paymentMethod:'Tesouraria / Guia de Pagamento'}:row));
    setSuccessMsg(`Pagamento do auto ${id} registado com comprovativo ${receipt}.`);
  }

  return <Shell>
    <Title eyebrow="Gestão de multas e infrações · Submenu 4" title="Emissão de auto de infração" description="Emita autos de infração oficiais, vincule matrícula, condutor, gravidade, valor da coima, local e agente autuante." icon={ClipboardList}/>
    <FineSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-4 flex flex-wrap justify-end gap-2">
      <Link to="/infraction-types" className={secondaryClass}><AlertTriangle size={16}/> Catálogo nacional de infrações</Link>
      <Link to="/fines/evidence" className={secondaryClass}><ClipboardCheck size={16}/> Fotografias e provas</Link>
      <button onClick={()=>{const next=!open;setOpen(next);setFineError('');if(next&&infractionTypes.length>0){setSelectedInfraction(infractionTypes[0].name);setFineAmount(String(infractionTypes[0].amount));setSelectedSeverity(infractionTypes[0].severity||'Grave');}}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Emitir novo auto de infração'}</button>
    </div>
    {open&&<Drawer title="Novo auto de infração" onClose={()=>{setOpen(false);setFineError('');}}>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <div className="relative sm:col-span-2">
          <label className="block text-xs font-semibold">Veículo (Matrícula / Proprietário)
            <input name="plate" value={plateQuery} onFocus={()=>setShowSuggestions(true)} onBlur={()=>setTimeout(()=>setShowSuggestions(false),180)} onChange={e=>{setPlateQuery(e.target.value.toUpperCase());setShowSuggestions(true);setFineError('');}} placeholder="Digite a placa (ex.: GB-24-BC)" autoComplete="off" required className={`mt-1.5 ${inputClass}`}/>
          </label>
          {selectedVehicle&&<div className="mt-1 text-[11px] font-semibold text-[#006B35]">Dono: {selectedVehicle.owner}{selectedVehicle.driver&&selectedVehicle.driver!==selectedVehicle.owner?` · Condutor: ${selectedVehicle.driver}`:''}</div>}
          {showSuggestions&&matchedVehicles.length>0&&<ul role="listbox" className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto border border-[#dcd9cc] bg-white shadow-lg">{matchedVehicles.map(v=><li key={v.plate} role="option" aria-selected={selectedVehicle?.plate===v.plate} onMouseDown={e=>{e.preventDefault();setPlateQuery(v.plate);setShowSuggestions(false);setFineError('');}} className="cursor-pointer border-b border-[#f0eee7] px-3 py-2 text-xs last:border-b-0 hover:bg-[#009E49]/10"><div className="flex items-center justify-between font-bold text-[#1c3024]"><span>{v.plate}</span><span className="text-[10px] font-normal text-[#737a70]">{v.make} {v.model}</span></div><div className="mt-0.5 text-[11px] text-[#006B35]">Dono: <b>{v.owner}</b></div></li>)}</ul>}
        </div>
        <label className="block text-xs font-semibold sm:col-span-2">Infração (Catálogo Nacional)
          <select name="infraction" value={selectedInfraction} onChange={e=>handleInfractionChange(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {infractionTypes.map(it=><option key={it.id} value={it.name}>{it.name} · [{it.severity}] ({currency(it.amount)})</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Gravidade
          <select name="severity" value={selectedSeverity} onChange={e=>setSelectedSeverity(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            <option value="Leve">Leve</option>
            <option value="Média">Média</option>
            <option value="Grave">Grave</option>
            <option value="Gravíssima">Gravíssima</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Valor da Multa (XOF)
          <input name="amount" type="number" required value={fineAmount} onChange={e=>setFineAmount(e.target.value)} className={`mt-1.5 ${inputClass}`}/>
        </label>
        <Field label="Data da infração" name="date" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Local da fiscalização / via" name="location" defaultValue="Av. Amílcar Cabral · Bissau"/>
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Agente fiscalizador autuante
          <select name="agentBadge" className={`mt-1.5 ${inputClass}`}>
            {agents.map(a=><option key={a.id} value={a.badge}>{a.name} · Matrícula: {a.badge} ({a.district})</option>)}
          </select>
        </label>
        <div className="sm:col-span-2">
          <Field label="Resumo de provas / observações do auto (opcional)" name="evidenceDescription" required={false} placeholder="Ex.: Radar cinemómetro / Falta de livrete constatada em operação stop"/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Emitir auto de infração</button>
        </div>
      </form>
      {fineError&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{fineError}</p>}
      <p className="mt-3 text-[11px] text-[#7a4c00]">O valor e a gravidade são preenchidos automaticamente de acordo com a infração selecionada no <Link to="/infraction-types" className="font-semibold underline">Catálogo nacional de infrações</Link>.</p>
    </Drawer>}
    <div className="mt-5 overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º do auto','Data / Local','Matrícula / Condutor','Infração','Gravidade','Agente Fiscalizador','Valor','Estado','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {fines.map(f=>{
            const it=infractionTypes.find(t=>t.name.toLowerCase()===f.infraction.toLowerCase());
            const sev=f.severity||it?.severity||'Média';
            return <tr key={f.id} className="border-b border-[#f0eee7]">
              <td className="px-3 py-3 font-mono text-xs">{f.id}{f.administrativeBlock&&<span className="mt-1 block text-[10px] font-bold uppercase text-[#9f1a2b]">Bloqueio Adm.</span>}</td>
              <td className="px-3 py-3">{f.date}<span className="block text-[11px] text-[#737a70]">{f.location||'Bissau'}</span></td>
              <td className="px-3 py-3 font-semibold">{f.plate}<span className="block text-[11px] font-normal text-[#737a70]">{f.driver||'—'}</span></td>
              <td className="px-3 py-3">{f.infraction}</td>
              <td className="px-3 py-3"><Status value={sev}/></td>
              <td className="px-3 py-3 text-xs">{f.agentName||'Subcomissário Malam Bacai'}<span className="block text-[11px] text-[#006B35]">{f.agentBadge||'AG-GB-0104'}</span></td>
              <td className="px-3 py-3 font-semibold">{currency(f.amount)}</td>
              <td className="px-3 py-3"><Status value={f.status}/></td>
              <td className="px-3 py-3"><button disabled={f.status==='Pago'||f.status==='Anulado'} onClick={()=>payFine(f.id)} className={secondaryClass}>Registar pagamento</button></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function InfractionCatalog(){
  const [items,setItems]=useSaved('infraction-types',seedInfractionTypes);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<InfractionTypeItem|null>(null);
  const [error,setError]=useState('');
  const [query,setQuery]=useState('');
  const filteredItems=items.filter(it=>[it.id,it.name,it.severity,it.description||''].join(' ').toLowerCase().includes(query.toLowerCase()));
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
  return <Shell>
    <Title eyebrow="Gestão de multas e infrações · Submenu 1" title="Catálogo nacional de infrações" description="Tipificação oficial das infrações rodoviárias, artigos do Código da Estrada, classificação por gravidade e coimas padrão (XOF)." icon={AlertTriangle}/>
    <FineSubmenuBar/>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <label className="flex max-w-md flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3"><Search size={16} className="text-[#737a70]"/><input aria-label="Pesquisar no catálogo" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pesquisar código, infração, artigo ou gravidade" className="w-full py-2 text-sm outline-none"/></label>
      <div className="flex flex-wrap gap-2">
        <Link to="/fines" className={secondaryClass}><ClipboardList size={16}/> Emitir auto de infração</Link>
        <button onClick={()=>open?closeDrawer():openCreate()} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Cadastrar infração no catálogo'}</button>
      </div>
    </div>
    {open&&<Drawer title={editing?`Editar infração (${editing.id})`:'Nova infração do catálogo nacional'} onClose={closeDrawer}><form key={editing?.id||'new'} onSubmit={submit} className="grid gap-3 sm:grid-cols-2"><Field label="Descrição da infração" name="name" defaultValue={editing?.name} placeholder="Ex.: Excesso de velocidade"/><Field label="Valor da multa / Coima (XOF)" name="amount" type="number" defaultValue={editing?String(editing.amount):''} placeholder="Ex.: 35000"/><label className="block text-xs font-semibold text-[#4b5549]">Classificação por gravidade<select name="severity" defaultValue={editing?.severity||'Média'} className={`mt-1.5 ${inputClass}`}><option value="Leve">Leve</option><option value="Média">Média</option><option value="Grave">Grave</option><option value="Gravíssima">Gravíssima</option></select></label><Field label="Enquadramento legal / observação (opcional)" name="description" required={false} defaultValue={editing?.description} placeholder="Ex.: Art. 84.º do Código da Estrada"/><div className="sm:col-span-2 flex items-end"><button className={primaryClass}>{editing?'Salvar alterações':'Guardar no catálogo'}</button></div></form>{error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}</Drawer>}
    <div className="mt-5 overflow-x-auto border border-[#dcd9cc] bg-white p-4"><table className="w-full text-left text-sm"><thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]"><tr>{['Código','Infração Tipificada','Gravidade','Enquadramento Legal / Descrição','Valor da Multa (XOF)','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr></thead><tbody>{filteredItems.map(it=><tr key={it.id} className="border-b border-[#f0eee7]"><td className="px-3 py-3 font-mono text-xs">{it.id}</td><td className="whitespace-nowrap px-3 py-3 font-semibold">{it.name}</td><td className="px-3 py-3"><Status value={it.severity}/></td><td className="px-3 py-3 text-xs text-[#737a70]">{it.description||'—'}</td><td className="whitespace-nowrap px-3 py-3 font-bold text-[#006B35]">{currency(it.amount)}</td><td className="whitespace-nowrap px-3 py-3"><div className="flex items-center gap-3"><button type="button" onClick={()=>openEdit(it)} className="text-xs font-semibold text-[#006B35] hover:underline">Editar</button><button type="button" onClick={()=>handleDelete(it.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Excluir</button></div></td></tr>)}</tbody></table></div>
  </Shell>;
}

export function FineSeverityPage(){
  const [items,setItems]=useSaved('infraction-types',seedInfractionTypes);
  const [fines]=useSaved('fines',seedFines);
  const [filterSeverity,setFilterSeverity]=useState('');
  const [successMsg,setSuccessMsg]=useState('');

  const severityLevels=[
    {level:'Leve',points:2,sanction:'Coima base · Advertência pedagógica',description:'Infrações de reduzido impacto na fluidez ou segurança viária, sem risco direto à integridade física.',color:'border-t-[#009E49]'},
    {level:'Média',points:4,sanction:'Coima intermédia · Dedução de 4 pontos',description:'Condutas que perturbam a circulação ou incumprem deveres administrativos e de inspeção periódica.',color:'border-t-[#FCD116]'},
    {level:'Grave',points:5,sanction:'Coima agravada · Dedução de 5 pontos · Retenção de documento',description:'Manobras perigosas, falta de documentação obrigatória ou desrespeito à sinalização prioritária.',color:'border-t-[#9f1a2b]'},
    {level:'Gravíssima',points:7,sanction:'Coima máxima · Dedução de 7 pontos · Inibição de conduzir / Bloqueio',description:'Excesso severo de velocidade, condução sem habilitação legal ou sob efeito de álcool/psicotrópicos.',color:'border-t-[#CE1126]'},
  ];

  async function changeItemSeverity(item:InfractionTypeItem,newSeverity:string){
    const updated={...item,severity:newSeverity};
    try{
      await api.put(`/infraction-types/${encodeURIComponent(item.id)}`,updated);
    }catch{/* ignore */}
    setItems(rows=>rows.map(r=>r.id===item.id?updated:r));
    setSuccessMsg(`Gravidade da infração "${item.name}" atualizada para ${newSeverity}.`);
  }

  const visibleItems=filterSeverity?items.filter(i=>i.severity===filterSeverity):items;

  return <Shell>
    <Title eyebrow="Gestão de multas e infrações · Submenu 2" title="Classificação por gravidade" description="Enquadramento das contraordenações rodoviárias por grau de gravidade (Leve, Média, Grave e Gravíssima), impacto na pontuação e sanções acessórias." icon={AlertTriangle}/>
    <FineSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {severityLevels.map(s=>{
        const catalogCount=items.filter(i=>i.severity===s.level).length;
        const finesCount=fines.filter(f=>(f.severity||'Média')===s.level).length;
        return <div key={s.level} className={`flex flex-col justify-between border border-[#dcd9cc] border-t-4 ${s.color} bg-white p-4`}>
          <div>
            <div className="flex items-center justify-between">
              <Status value={s.level}/>
              <span className="text-xs font-bold text-[#9f1a2b]">-{s.points} pontos na carta</span>
            </div>
            <h3 className="mt-3 font-serif text-lg font-bold text-[#1c3024]">Infração {s.level}</h3>
            <p className="mt-1 text-xs leading-5 text-[#697168]">{s.description}</p>
          </div>
          <div className="mt-4 border-t border-[#f0eee7] pt-3 text-[11px] text-[#4b5549]">
            <div><b>Sanção aplicável:</b> {s.sanction}</div>
            <div className="mt-1 flex justify-between font-semibold text-[#006B35]"><span>{catalogCount} no catálogo</span><span>{finesCount} auto(s) emitido(s)</span></div>
          </div>
        </div>;
      })}
    </div>
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#e9e6dc] pb-3">
        <h2 className="font-serif text-lg font-bold text-[#1c3024]">Reclassificação de Gravidade por Infração</h2>
        <select aria-label="Filtrar gravidade" value={filterSeverity} onChange={e=>setFilterSeverity(e.target.value)} className="border border-[#d5d1c2] bg-white px-3 py-1.5 text-xs font-semibold outline-none">
          <option value="">Todas as gravidades</option>
          <option value="Leve">Leve</option>
          <option value="Média">Média</option>
          <option value="Grave">Grave</option>
          <option value="Gravíssima">Gravíssima</option>
        </select>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Código','Infração','Gravidade Atual','Pontos a Deduzir','Valor Base','Alterar Classificação de Gravidade'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {visibleItems.map(it=>{
            const pts=it.severity==='Leve'?2:it.severity==='Média'?4:it.severity==='Grave'?5:7;
            return <tr key={it.id} className="border-b border-[#f0eee7]">
              <td className="px-3 py-3 font-mono text-xs">{it.id}</td>
              <td className="px-3 py-3 font-semibold">{it.name}</td>
              <td className="px-3 py-3"><Status value={it.severity}/></td>
              <td className="px-3 py-3 font-bold text-[#9f1a2b]">-{pts} pts</td>
              <td className="px-3 py-3 font-semibold">{currency(it.amount)}</td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {['Leve','Média','Grave','Gravíssima'].map(lvl=><button key={lvl} type="button" onClick={()=>changeItemSeverity(it,lvl)} className={`border px-2.5 py-1 text-xs font-semibold transition ${it.severity===lvl?'border-[#006B35] bg-[#006B35] text-white':'border-[#d5d1c2] bg-[#f8f7f2] text-[#26372b] hover:border-[#009E49]'}`}>{lvl}</button>)}
                </div>
              </td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function FineAmountsPage(){
  const [items,setItems]=useSaved('infraction-types',seedInfractionTypes);
  const [fines]=useSaved('fines',seedFines);
  const [draftAmounts,setDraftAmounts]=useState<Record<string,string>>({});
  const [successMsg,setSuccessMsg]=useState('');

  async function updateAmount(item:InfractionTypeItem){
    const raw=draftAmounts[item.id];
    const newAmount=raw!==undefined?Number(raw):item.amount;
    if(!newAmount||newAmount<=0)return;
    const updated={...item,amount:newAmount};
    try{await api.put(`/infraction-types/${encodeURIComponent(item.id)}`,updated);}catch{/* ignore */}
    setItems(rows=>rows.map(r=>r.id===item.id?updated:r));
    setSuccessMsg(`Valor da multa para "${item.name}" atualizado para ${currency(newAmount)}.`);
  }

  const totalIssued=fines.reduce((acc,f)=>acc+f.amount,0);
  const totalPaid=fines.filter(f=>f.status==='Pago').reduce((acc,f)=>acc+f.amount,0);
  const totalPending=fines.filter(f=>f.status==='Pendente').reduce((acc,f)=>acc+f.amount,0);

  return <Shell>
    <Title eyebrow="Gestão de multas e infrações · Submenu 3" title="Valor da multa" description="Tabela financeira de coimas em Franco CFA (XOF), atualização de montantes oficiais e simulação de agravamento por reincidência." icon={Banknote}/>
    <FineSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Montante total autuado" value={currency(totalIssued)} detail={`${fines.length} auto(s) registado(s)`} icon={ClipboardList}/>
      <Stat label="Valor arrecadado (Pago)" value={currency(totalPaid)} detail="Liquidado na tesouraria" icon={Check}/>
      <Stat label="Valor pendente de cobrança" value={currency(totalPending)} detail="Aguardando pagamento" icon={Banknote}/>
    </div>
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Tabela Oficial de Valores de Multa e Coimas (XOF)</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Código','Infração','Gravidade','Valor Base (XOF)','Valor c/ Agravamento Reincidência (+50%)','Novo Valor (XOF)','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {items.map(it=><tr key={it.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs">{it.id}</td>
            <td className="px-3 py-3 font-semibold">{it.name}</td>
            <td className="px-3 py-3"><Status value={it.severity}/></td>
            <td className="px-3 py-3 font-bold text-[#006B35]">{currency(it.amount)}</td>
            <td className="px-3 py-3 font-semibold text-[#9f1a2b]">{currency(Math.round(it.amount*1.5))}</td>
            <td className="px-3 py-3 w-48">
              <input type="number" aria-label={`Novo valor para ${it.name}`} value={draftAmounts[it.id]??String(it.amount)} onChange={e=>setDraftAmounts({...draftAmounts,[it.id]:e.target.value})} className="w-full border border-[#d5d1c2] px-2.5 py-1.5 text-sm outline-none focus:border-[#009E49]"/>
            </td>
            <td className="px-3 py-3">
              <button type="button" onClick={()=>updateAmount(it)} className={secondaryClass}>Atualizar valor</button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function FineEvidencePage(){
  const [fines,setFines]=useSaved('fines',seedFines);
  const [open,setOpen]=useState(false);
  const [selectedFineId,setSelectedFineId]=useState('');
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const selectedFine=fines.find(f=>f.id===selectedFineId)||fines[0];

  async function submitEvidence(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const fineId=String(f.get('fineId')||selectedFine?.id||'');
    const file=f.get('evidenceFile') as File|null;
    if(file&&file.size>1_500_000){setError('A fotografia/prova deve ter no máximo 1.5 MB.');return;}
    try{
      setError('');setSuccessMsg('');
      let evFile=selectedFine?.evidenceFile;
      if(file&&file.size>0){
        const dataUrl=await new Promise<string>((resolve,reject)=>{
          const reader=new FileReader();
          reader.onload=()=>resolve(String(reader.result));
          reader.onerror=()=>reject(new Error('Erro ao ler ficheiro'));
          reader.readAsDataURL(file);
        });
        evFile={name:file.name,dataUrl};
      }
      const desc=String(f.get('evidenceDescription')||'').trim();
      const loc=String(f.get('location')||selectedFine?.location||'').trim();
      const res=await api.put<Fine>(`/fines/${encodeURIComponent(fineId)}`,{
        evidenceFile:evFile,
        evidenceDescription:desc,
        location:loc,
      });
      setFines(rows=>rows.map(r=>r.id===fineId?res.data:r));
      setSuccessMsg(`Fotografia / prova material anexada com sucesso ao auto ${fineId}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível anexar a prova ao auto.');
    }
  }

  return <Shell>
    <Title eyebrow="Gestão de multas e infrações · Submenu 5" title="Fotografias e provas" description="Repositório probatório dos autos de infração: registo fotográfico da infração, leitura de radar/etilómetro e descrição pericial." icon={ClipboardCheck}/>
    <FineSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-4 flex justify-end">
      <button type="button" onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Anexar fotografia / prova ao auto'}</button>
    </div>
    {open&&<Drawer title="Anexar Fotografia ou Prova Material" onClose={()=>setOpen(false)}>
      <form onSubmit={submitEvidence} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Selecionar Auto de Infração
          <select name="fineId" value={selectedFine?.id||''} onChange={e=>setSelectedFineId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {fines.map(f=><option key={f.id} value={f.id}>{f.id} · {f.plate} · {f.infraction} ({f.date})</option>)}
          </select>
        </label>
        <div className="sm:col-span-2">
          <Field label="Local exato / Coordenadas ou Posto Policial" name="location" defaultValue={selectedFine?.location||'Av. Amílcar Cabral · Bissau'}/>
        </div>
        <div className="sm:col-span-2">
          <Field label="Descrição técnica da prova (Radar, Etilómetro, Testemunho, Fotografia)" name="evidenceDescription" defaultValue={selectedFine?.evidenceDescription||''} placeholder="Ex.: Registo fotográfico da matrícula em estacionamento proibido / Talão cinemómetro"/>
        </div>
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Ficheiro de Fotografia ou Comprovativo Técnico (JPG, PNG, PDF)
          <input type="file" name="evidenceFile" accept=".jpg,.jpeg,.png,.pdf" className={`mt-1.5 ${inputClass} file:mr-3 file:border-0 file:bg-[#173d2b] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white`}/>
        </label>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Guardar fotografia e prova no processo</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Autos de Infração e Provas Documentais / Fotográficas</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º do Auto','Data / Local','Matrícula','Infração','Descrição da Prova / Perícia','Fotografia / Anexo','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {fines.map(f=><tr key={f.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs">{f.id}</td>
            <td className="px-3 py-3">{f.date}<span className="block text-[11px] text-[#737a70]">{f.location||'Bissau'}</span></td>
            <td className="px-3 py-3 font-semibold">{f.plate}</td>
            <td className="px-3 py-3">{f.infraction}</td>
            <td className="px-3 py-3 text-xs text-[#4b5549]">{f.evidenceDescription||'Sem descrição pericial registada'}</td>
            <td className="px-3 py-3 text-xs">
              {f.evidenceFile?<a href={f.evidenceFile.dataUrl} download={f.evidenceFile.name} className="font-semibold text-[#006B35] underline">{f.evidenceFile.name}</a>:<span className="text-[#737a70]">Sem ficheiro anexado</span>}
            </td>
            <td className="px-3 py-3">
              <button type="button" onClick={()=>{setSelectedFineId(f.id);setOpen(true);}} className="text-xs font-semibold text-[#006B35] hover:underline">Anexar / Editar prova</button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function FineAgentsPage(){
  const [agents,setAgents]=useSaved('inspection-agents',seedInspectionAgents);
  const [fines]=useSaved('fines',seedFines);
  const [open,setOpen]=useState(false);
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');

  async function submitAgent(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    try{
      setError('');setSuccessMsg('');
      const payload={
        id:`AGT-${String(Date.now()).slice(-4)}`,
        name:String(f.get('name')||'').trim(),
        badge:String(f.get('badge')||'').trim().toUpperCase(),
        unit:String(f.get('unit')||'Brigada Nacional de Trânsito').trim(),
        district:String(f.get('district')||'Bissau').trim(),
        phone:String(f.get('phone')||'').trim(),
        status:String(f.get('status')||'Ativo'),
      };
      const res=await api.post<InspectionAgent>('/inspection-agents',payload);
      setAgents([...agents,res.data]);
      setSuccessMsg(`Agente fiscalizador ${res.data.name} (${res.data.badge}) credenciado com sucesso.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível cadastrar o agente fiscalizador.');
    }
  }

  async function handleDelete(id:string){
    if(!window.confirm(`Deseja remover o agente fiscalizador ${id}?`))return;
    try{await api.delete(`/inspection-agents/${encodeURIComponent(id)}`);}catch{/* ignore */}
    setAgents(rows=>rows.filter(a=>a.id!==id));
  }

  return <Shell>
    <Title eyebrow="Gestão de multas e infrações · Submenu 6" title="Identificação do agente fiscalizador" description="Cadastro nacional de agentes autuantes da Brigada de Trânsito, matrículas funcionais, unidades operacionais e produtividade de fiscalização." icon={ShieldCheck}/>
    <FineSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-4 flex justify-end">
      <button type="button" onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Credenciar agente fiscalizador'}</button>
    </div>
    {open&&<Drawer title="Credenciamento de Agente Fiscalizador" onClose={()=>setOpen(false)}>
      <form onSubmit={submitAgent} className="grid gap-3 sm:grid-cols-2">
        <Field label="Patente e Nome completo" name="name" placeholder="Ex.: Subcomissário Malam Bacai"/>
        <Field label="N.º de Matrícula / Crachá Funcional" name="badge" placeholder="Ex.: AG-GB-0412"/>
        <Field label="Unidade / Corporação" name="unit" defaultValue="Brigada Nacional de Trânsito"/>
        <Field label="Delegação / Região" name="district" defaultValue="Bissau"/>
        <Field label="Contacto de serviço" name="phone" required={false} placeholder="+245 955 000 000"/>
        <label className="block text-xs font-semibold text-[#4b5549]">Estado funcional
          <select name="status" className={`mt-1.5 ${inputClass}`}>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </label>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Guardar agente fiscalizador</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Corpo de Agentes Fiscalizadores Credenciados</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Código','Patente / Nome do Agente','Matrícula Funcional','Unidade / Corporação','Distrito','Autos Emitidos','Estado','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {agents.map(a=>{
            const issuedCount=fines.filter(f=>f.agentBadge===a.badge||f.agentName===a.name).length;
            return <tr key={a.id} className="border-b border-[#f0eee7]">
              <td className="px-3 py-3 font-mono text-xs">{a.id}</td>
              <td className="px-3 py-3 font-semibold">{a.name}<span className="block text-[11px] font-normal text-[#737a70]">{a.phone||'—'}</span></td>
              <td className="px-3 py-3 font-mono font-bold text-[#006B35]">{a.badge}</td>
              <td className="px-3 py-3">{a.unit}</td>
              <td className="px-3 py-3">{a.district}</td>
              <td className="px-3 py-3 font-bold">{issuedCount} auto(s)</td>
              <td className="px-3 py-3"><Status value={a.status}/></td>
              <td className="px-3 py-3"><button type="button" onClick={()=>handleDelete(a.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Remover</button></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function FinePaymentsPage(){
  const [fines,setFines]=useSaved('fines',seedFines);
  const [open,setOpen]=useState(false);
  const [selectedFineId,setSelectedFineId]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [error,setError]=useState('');
  const pendingFines=fines.filter(f=>f.status==='Pendente');
  const selectedFine=fines.find(f=>f.id===selectedFineId)||pendingFines[0]||fines[0];

  async function submitPayment(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const fineId=String(f.get('fineId')||selectedFine?.id||'');
    if(!fineId){setError('Selecione um auto de infração.');return;}
    try{
      setError('');setSuccessMsg('');
      const receipt=String(f.get('paymentReceipt')||`REC-DGV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`).trim();
      const paymentDate=String(f.get('paymentDate')||new Date().toISOString().slice(0,10));
      const paymentMethod=String(f.get('paymentMethod')||'Tesouraria / Guia DGT');
      const res=await api.put<Fine>(`/fines/${encodeURIComponent(fineId)}`,{
        status:'Pago',
        paymentReceipt:receipt,
        paymentDate,
        paymentMethod,
      });
      setFines(rows=>rows.map(r=>r.id===fineId?res.data:r));
      setSuccessMsg(`Pagamento registado com sucesso! Comprovativo n.º ${receipt} emitido para o auto ${fineId}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível registar o pagamento.');
    }
  }

  return <Shell>
    <Title eyebrow="Gestão de multas e infrações · Submenu 7" title="Pagamento e comprovativos" description="Liquidação de coimas, emissão de número de recibo/comprovativo de pagamento, método de arrecadação e conciliação com a tesouraria." icon={Banknote}/>
    <FineSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-4 flex justify-end">
      <button type="button" onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><Banknote size={16}/>{open?'Fechar formulário':'Registar pagamento e emitir comprovativo'}</button>
    </div>
    {open&&<Drawer title="Liquidação de Multa e Emissão de Comprovativo" onClose={()=>setOpen(false)}>
      <form onSubmit={submitPayment} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Auto de Infração a liquidar
          <select name="fineId" value={selectedFine?.id||''} onChange={e=>setSelectedFineId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {fines.map(f=><option key={f.id} value={f.id}>{f.id} · {f.plate} · {f.infraction} · {currency(f.amount)} [{f.status}]</option>)}
          </select>
        </label>
        <Field label="N.º do Comprovativo / Recibo da Tesouraria" name="paymentReceipt" defaultValue={`REC-DGV-2026-${String(Date.now()).slice(-4)}`}/>
        <Field label="Data do pagamento" name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Meio de pagamento utilizado
          <select name="paymentMethod" className={`mt-1.5 ${inputClass}`}>
            <option value="Referência Bancária / Tesouraria Pública">Referência Bancária / Tesouraria Pública</option>
            <option value="Pagamento Presencial no Balcão DGV">Pagamento Presencial no Balcão DGV</option>
            <option value="Mobile Money / Pagamento Digital">Mobile Money / Pagamento Digital</option>
          </select>
        </label>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Confirmar liquidação e gerar comprovativo</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Relação de Pagamentos e Comprovativos de Multas</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º do Auto','Matrícula / Condutor','Infração','Valor (XOF)','Estado','N.º do Comprovativo','Data / Meio de Pagamento','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {fines.map(f=><tr key={f.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs">{f.id}</td>
            <td className="px-3 py-3 font-semibold">{f.plate}<span className="block text-[11px] font-normal text-[#737a70]">{f.driver}</span></td>
            <td className="px-3 py-3">{f.infraction}</td>
            <td className="px-3 py-3 font-bold">{currency(f.amount)}</td>
            <td className="px-3 py-3"><Status value={f.status}/></td>
            <td className="px-3 py-3 font-mono text-xs font-bold text-[#006B35]">{f.paymentReceipt||'Aguardando liquidação'}</td>
            <td className="px-3 py-3 text-xs">{f.paymentDate?`${f.paymentDate} · ${f.paymentMethod||'Tesouraria'}`:'—'}</td>
            <td className="px-3 py-3">
              {f.status==='Pago'?<button type="button" onClick={()=>window.print()} className="text-xs font-semibold text-[#006B35] hover:underline">Imprimir comprovativo</button>:<button type="button" onClick={()=>{setSelectedFineId(f.id);setOpen(true);}} className={secondaryClass}>Liquidar</button>}
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function FineAppealsPage(){
  const [fines,setFines]=useSaved('fines',seedFines);
  const [appeals,setAppeals]=useSaved('fine-appeals',seedFineAppeals);
  const [open,setOpen]=useState(false);
  const [selectedFineId,setSelectedFineId]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [error,setError]=useState('');
  const selectedFine=fines.find(f=>f.id===selectedFineId)||fines[0];

  async function submitAppeal(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const fineId=String(f.get('fineId')||selectedFine?.id||'');
    const fineObj=fines.find(x=>x.id===fineId);
    try{
      setError('');setSuccessMsg('');
      const payload={
        id:`REC-2026-${String(Date.now()).slice(-4)}`,
        fineId,
        plate:fineObj?.plate||String(f.get('plate')||''),
        appellant:String(f.get('appellant')||fineObj?.driver||'').trim(),
        reason:String(f.get('reason')||'').trim(),
        defenseArguments:String(f.get('defenseArguments')||'').trim(),
        appealDate:String(f.get('appealDate')||new Date().toISOString().slice(0,10)),
        status:'Em análise',
      };
      const res=await api.post<FineAppeal>('/fine-appeals',payload);
      setAppeals([res.data,...appeals]);
      setSuccessMsg(`Recurso administrativo ${res.data.id} protocolado com sucesso para o auto ${fineId}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível protocolar o recurso.');
    }
  }

  async function decideAppeal(appeal:FineAppeal,newStatus:'Deferido'|'Indeferido'){
    const notes=newStatus==='Deferido'?'Recurso acolhido pela Comissão de Contraordenações; auto de infração anulado.':'Recurso indeferido por confirmação material da infração; mantida a coima.';
    try{
      const res=await api.put<{appeal:FineAppeal;fine?:Fine}>(`/fine-appeals/${encodeURIComponent(appeal.id)}`,{status:newStatus,decisionNotes:notes});
      setAppeals(rows=>rows.map(a=>a.id===appeal.id?res.data.appeal:a));
      if(res.data.fine){
        setFines(rows=>rows.map(f=>f.id===res.data.fine!.id?res.data.fine!:f));
      }
      setSuccessMsg(`Decisão "${newStatus}" averbada no recurso ${appeal.id}.`);
    }catch{/* ignore */}
  }

  return <Shell>
    <Title eyebrow="Gestão de multas e infrações · Submenu 8" title="Recursos e contestações" description="Apresentação de defesa prévia, recursos administrativos contra autos de infração e deliberação (Deferimento / Indeferimento)." icon={ClipboardList}/>
    <FineSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-4 flex justify-end">
      <button type="button" onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Protocolar recurso / contestação'}</button>
    </div>
    {open&&<Drawer title="Novo Recurso ou Contestação de Auto" onClose={()=>setOpen(false)}>
      <form onSubmit={submitAppeal} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Auto de Infração contestado
          <select name="fineId" value={selectedFine?.id||''} onChange={e=>setSelectedFineId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {fines.map(f=><option key={f.id} value={f.id}>{f.id} · {f.plate} · {f.infraction} ({currency(f.amount)})</option>)}
          </select>
        </label>
        <Field label="Nome do requerente (Condutor ou Proprietário)" name="appellant" defaultValue={selectedFine?.driver||''}/>
        <Field label="Data de entrada do recurso" name="appealDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <div className="sm:col-span-2">
          <Field label="Fundamento principal da contestação" name="reason" placeholder="Ex.: Erro material na matrícula / Sinalização encoberta / Documento válido à data"/>
        </div>
        <div className="sm:col-span-2">
          <Field label="Alegações detalhadas de defesa" name="defenseArguments" placeholder="Exponha os factos e provas que fundamentam o pedido de arquivamento do auto"/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Submeter recurso administrativo</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Processos de Recursos e Contestações</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Protocolo','Data','Auto / Matrícula','Requerente','Fundamento e Defesa','Parecer / Estado','Deliberação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {appeals.map(a=><tr key={a.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs">{a.id}</td>
            <td className="px-3 py-3">{a.appealDate}</td>
            <td className="px-3 py-3 font-semibold">{a.fineId}<span className="block text-[11px] font-normal text-[#737a70]">{a.plate}</span></td>
            <td className="px-3 py-3 font-semibold">{a.appellant}</td>
            <td className="px-3 py-3 text-xs"><div className="font-semibold text-[#1c3024]">{a.reason}</div><div className="mt-0.5 text-[#697168]">{a.defenseArguments}</div></td>
            <td className="px-3 py-3"><Status value={a.status}/><span className="mt-1 block text-[11px] text-[#737a70]">{a.decisionNotes||''}</span></td>
            <td className="px-3 py-3">
              <div className="flex items-center gap-2">
                <button type="button" disabled={a.status!=='Em análise'} onClick={()=>decideAppeal(a,'Deferido')} className="border border-[#009E49]/40 bg-[#009E49]/10 px-2.5 py-1 text-xs font-semibold text-[#006B35] disabled:opacity-40">Deferir (Anular Auto)</button>
                <button type="button" disabled={a.status!=='Em análise'} onClick={()=>decideAppeal(a,'Indeferido')} className="border border-[#CE1126]/30 bg-[#CE1126]/10 px-2.5 py-1 text-xs font-semibold text-[#9f1a2b] disabled:opacity-40">Indeferir</button>
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function FineRecidivismPage(){
  const [fines]=useSaved('fines',seedFines);

  const byDriver=useMemo(()=>{
    const map=new Map<string,{driver:string;plates:Set<string>;count:number;totalAmount:number;infractions:string[];lastDate:string}>();
    fines.forEach(f=>{
      const key=f.driver||'Não identificado';
      const cur=map.get(key)||{driver:key,plates:new Set<string>(),count:0,totalAmount:0,infractions:[],lastDate:f.date};
      cur.plates.add(f.plate);
      cur.count+=1;
      cur.totalAmount+=f.amount;
      cur.infractions.push(`${f.infraction} (${f.date})`);
      if(f.date>cur.lastDate)cur.lastDate=f.date;
      map.set(key,cur);
    });
    return Array.from(map.values()).sort((a,b)=>b.count-a.count);
  },[fines]);

  const byPlate=useMemo(()=>{
    const map=new Map<string,{plate:string;driver:string;count:number;totalAmount:number;pendingCount:number}>();
    fines.forEach(f=>{
      const cur=map.get(f.plate)||{plate:f.plate,driver:f.driver,count:0,totalAmount:0,pendingCount:0};
      cur.count+=1;
      cur.totalAmount+=f.amount;
      if(f.status==='Pendente')cur.pendingCount+=1;
      map.set(f.plate,cur);
    });
    return Array.from(map.values()).sort((a,b)=>b.count-a.count);
  },[fines]);

  return <Shell>
    <Title eyebrow="Gestão de multas e infrações · Submenu 9" title="Histórico de reincidência" description="Monitorização de condutores e veículos reincidentes, cálculo automático de agravamento legal e identificação de infratores contumazes." icon={Activity}/>
    <FineSubmenuBar/>
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Condutores reincidentes" value={String(byDriver.filter(d=>d.count>=2).length)} detail="Com 2 ou mais autos registados" icon={Users}/>
      <Stat label="Matrículas reincidentes" value={String(byPlate.filter(p=>p.count>=2).length)} detail="Viaturas com múltiplas infrações" icon={CarFront}/>
      <Stat label="Total de autos analisados" value={String(fines.length)} detail="Base histórica nacional" icon={ClipboardList}/>
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
        <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Reincidência por Condutor</h2>
        <table className="w-full text-left text-sm">
          <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
            <tr>{['Condutor','Matrículas','N.º de Infrações','Histórico Recente','Enquadramento'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
          </thead>
          <tbody>
            {byDriver.map(d=><tr key={d.driver} className="border-b border-[#f0eee7]">
              <td className="px-3 py-3 font-semibold">{d.driver}</td>
              <td className="px-3 py-3 font-mono text-xs">{Array.from(d.plates).join(', ')}</td>
              <td className="px-3 py-3 font-bold">{d.count} auto(s)</td>
              <td className="px-3 py-3 text-xs text-[#697168]">{d.infractions.join(' · ')}</td>
              <td className="px-3 py-3"><Status value={d.count>=2?'Reincidente · Agravamento':'Primário'}/></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
        <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Reincidência por Matrícula</h2>
        <table className="w-full text-left text-sm">
          <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
            <tr>{['Matrícula','Condutor Principal','Total de Autos','Pendentes','Montante Acumulado','Situação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
          </thead>
          <tbody>
            {byPlate.map(p=><tr key={p.plate} className="border-b border-[#f0eee7]">
              <td className="px-3 py-3 font-semibold">{p.plate}</td>
              <td className="px-3 py-3">{p.driver}</td>
              <td className="px-3 py-3 font-bold">{p.count}</td>
              <td className="px-3 py-3 font-semibold text-[#9f1a2b]">{p.pendingCount}</td>
              <td className="px-3 py-3 font-semibold">{currency(p.totalAmount)}</td>
              <td className="px-3 py-3"><Status value={p.count>=2?'Reincidente':'Regular'}/></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  </Shell>;
}

export function FineAdministrativeBlocksPage(){
  const [fines,setFines]=useSaved('fines',seedFines);
  const [vehicles,setVehicles]=useSaved('vehicles',seedVehicles);
  const [open,setOpen]=useState(false);
  const [selectedFineId,setSelectedFineId]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [error,setError]=useState('');
  const selectedFine=fines.find(f=>f.id===selectedFineId)||fines[0];
  const blockedFines=fines.filter(f=>f.administrativeBlock);

  async function submitBlock(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const fineId=String(f.get('fineId')||selectedFine?.id||'');
    const actionType=String(f.get('actionType')||'block');
    const blockReason=String(f.get('blockReason')||'').trim();
    const isBlock=actionType==='block';
    try{
      setError('');setSuccessMsg('');
      const res=await api.put<Fine>(`/fines/${encodeURIComponent(fineId)}`,{
        administrativeBlock:isBlock,
        blockReason:isBlock?blockReason:'',
      });
      setFines(rows=>rows.map(r=>r.id===fineId?res.data:r));
      if(res.data.plate){
        setVehicles(rows=>rows.map(v=>v.plate===res.data.plate?{...v,legalStatus:isBlock?'Apreendido':v.legalStatus==='Apreendido'?'Regular':v.legalStatus}:v));
      }
      setSuccessMsg(isBlock?`Bloqueio administrativo legalmente averbado para o auto ${fineId} (Matrícula ${res.data.plate}).`:`Bloqueio administrativo levantado para o auto ${fineId}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível atualizar o bloqueio administrativo.');
    }
  }

  return <Shell>
    <Title eyebrow="Gestão de multas e infrações · Submenu 10" title="Bloqueio administrativo quando legalmente autorizado" description="Imposição e levantamento de restrição administrativa sobre matrícula e habilitação por acumulação de coimas vencidas, infração gravíssima ou ordem legal." icon={ShieldCheck}/>
    <FineSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Autos com bloqueio ativo" value={String(blockedFines.length)} detail="Restrição administrativa averbada" icon={AlertTriangle}/>
      <Stat label="Autos sem bloqueio" value={String(fines.length-blockedFines.length)} detail="Trovão administrativo não acionado" icon={Check}/>
      <Stat label="Enquadramento legal" value="Art. 142.º" detail="Despacho fundamentado obrigatório" icon={ShieldCheck}/>
    </div>
    <div className="mb-4 flex justify-end">
      <button type="button" onClick={()=>{setOpen(!open);setError('');}} className="inline-flex items-center justify-center gap-2 bg-[#9f1a2b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7f1422]"><ShieldCheck size={16}/>{open?'Fechar formulário':'Decretar / levantar bloqueio administrativo'}</button>
    </div>
    {open&&<Drawer title="Bloqueio Administrativo Legalmente Autorizado" onClose={()=>setOpen(false)}>
      <form onSubmit={submitBlock} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Auto de Infração vinculado
          <select name="fineId" value={selectedFine?.id||''} onChange={e=>setSelectedFineId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {fines.map(f=><option key={f.id} value={f.id}>{f.id} · {f.plate} · {f.infraction} ({f.administrativeBlock?'BLOQUEADO':'Sem bloqueio'})</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Medida administrativa
          <select name="actionType" className={`mt-1.5 ${inputClass}`}>
            <option value="block">Decretar Bloqueio Administrativo (Impede transferência, renovação e circulação)</option>
            <option value="unblock">Levantar Bloqueio Administrativo (Após regularização legal)</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <Field label="Fundamentação legal e despacho autorizador" name="blockReason" defaultValue={selectedFine?.blockReason||'Despacho DGT n.º 118/2026 · Infração gravíssima não regularizada no prazo legal (Art. 142.º CE)'}/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className="inline-flex items-center justify-center gap-2 bg-[#9f1a2b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7f1422]">Confirmar despacho administrativo</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}
    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Controlo de Bloqueios Administrativos Vinculados a Autos</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º do Auto','Matrícula / Condutor','Infração / Gravidade','Valor','Restrição Administrativa','Despacho / Fundamentação Legal','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {fines.map(f=><tr key={f.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs">{f.id}</td>
            <td className="px-3 py-3 font-semibold">{f.plate}<span className="block text-[11px] font-normal text-[#737a70]">{f.driver}</span></td>
            <td className="px-3 py-3">{f.infraction}<span className="block text-[11px] text-[#737a70]">Gravidade: {f.severity||'Média'}</span></td>
            <td className="px-3 py-3 font-semibold">{currency(f.amount)}</td>
            <td className="px-3 py-3"><Status value={f.administrativeBlock?'Bloqueado':'Sem bloqueio'}/></td>
            <td className="px-3 py-3 text-xs text-[#4b5549]">{f.blockReason||'Nenhuma restrição ativa'}</td>
            <td className="px-3 py-3">
              <button type="button" onClick={()=>{setSelectedFineId(f.id);setOpen(true);}} className="text-xs font-semibold text-[#006B35] hover:underline">{f.administrativeBlock?'Gerir / Levantar':'Aplicar bloqueio'}</button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

function DocumentSubmenuBar(){
  const {pathname}=useLocation();
  return <div className="mb-6 flex flex-wrap gap-1.5 border-b border-[#dcd9cc] pb-4">
    {documentSubmenus.map(sub=>{
      const active=pathname===sub.path;
      return <Link key={sub.path} to={sub.path} className={`border px-3 py-1.5 text-xs font-semibold transition ${active?'border-[#006B35] bg-[#006B35] text-white':'border-[#d5d1c2] bg-white text-[#26372b] hover:border-[#009E49] hover:bg-[#f4f3ed]'}`}>{sub.label}</Link>;
    })}
  </div>;
}

function OfficialCertificateModal({doc,onClose}:{doc:OfficialDocument;onClose:()=>void}){
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10251a]/60">
    <div className="relative w-full max-w-2xl bg-white border-2 border-[#173d2b] shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-start border-b-2 border-[#d5d1c2] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center border border-[#FCD116] bg-[#173d2b] text-base font-black text-[#FCD116]">GB</div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#836300]">República da Guiné-Bissau</div>
            <h3 className="font-serif text-lg font-bold text-[#173d2b]">Ministério dos Transportes · Direção-Geral de Viação</h3>
            <div className="text-xs text-[#697168]">{doc.documentType}</div>
          </div>
        </div>
        <button onClick={onClose} aria-label="Fechar" className="p-1 text-[#737a70] hover:text-[#1c3024]"><X size={20}/></button>
      </div>

      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3 border border-[#dcd9cc] bg-[#f8f7f2] p-4">
          <div><span className="text-[#737a70] block">N.º do Documento:</span><b className="font-mono text-sm text-[#173d2b]">{doc.id}</b></div>
          <div><span className="text-[#737a70] block">Modalidade:</span><b>{doc.issueMode}</b></div>
          <div><span className="text-[#737a70] block">Matrícula / Referência:</span><b className="font-mono text-sm text-[#006B35]">{doc.targetRef}</b></div>
          <div><span className="text-[#737a70] block">Estado Atual:</span><Status value={doc.status}/></div>
        </div>

        <div className="grid grid-cols-2 gap-3 border border-[#dcd9cc] p-4">
          <div><span className="text-[#737a70] block">Titular / Proprietário:</span><b className="text-sm">{doc.holderName}</b></div>
          <div><span className="text-[#737a70] block">BI / NIF / Documento:</span><b>{doc.holderDocument||'—'}</b></div>
          <div className="col-span-2"><span className="text-[#737a70] block">Especificações Técnicas:</span><b>{doc.technicalDetails||'—'}</b></div>
          <div><span className="text-[#737a70] block">Data de Emissão:</span><b>{doc.issueDate}</b></div>
          <div><span className="text-[#737a70] block">Data de Validade:</span><b>{doc.expiryDate}</b></div>
          <div className="col-span-2"><span className="text-[#737a70] block">Delegação Emissora:</span><b>{doc.issuingOffice}</b></div>
          {doc.notes&&<div className="col-span-2"><span className="text-[#737a70] block">Observações Legais:</span><span className="text-[#4b5549]">{doc.notes}</span></div>}
          {doc.administrativeBlock&&<div className="col-span-2 border border-[#CE1126]/30 bg-[#CE1126]/10 p-2 text-[#9f1a2b]"><b>Aviso de Bloqueio Administrativo:</b> {doc.blockReason}</div>}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#dcd9cc] pt-4 gap-4 bg-[#f8f7f2] p-3">
          <div className="flex items-center gap-3">
            <div className="border border-[#173d2b] p-2 bg-white">
              <QrCode size={48} className="text-[#173d2b]"/>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#737a70]">Assinatura e Validação Digital</div>
              <div className="font-mono text-[11px] font-bold text-[#006B35]">{doc.authenticityCode}</div>
              <div className="text-[10px] text-[#737a70] truncate max-w-xs">{doc.qrPayload}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>window.print()} className={primaryClass}><Printer size={15}/> Imprimir Título</button>
            <button onClick={onClose} className={secondaryClass}>Fechar</button>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

export function VehicleIdentificationDocPage(){
  const [vehicles]=useSaved('vehicles',seedVehicles);
  const [docs,setDocs]=useSaved('transport-documents',seedOfficialDocuments);
  const [open,setOpen]=useState(false);
  const [selectedPlate,setSelectedPlate]=useState('');
  const [viewingDoc,setViewingDoc]=useState<OfficialDocument|null>(null);
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [search,setSearch]=useState('');

  const vehicleDocs=docs.filter(d=>d.documentType==='Documento de Identificação do Veículo');
  const filtered=vehicleDocs.filter(d=>[d.id,d.targetRef,d.holderName,d.authenticityCode].join(' ').toLowerCase().includes(search.toLowerCase()));
  const selectedVehicle=vehicles.find(v=>v.plate===selectedPlate)||vehicles[0];

  async function submitIssue(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const plate=String(f.get('targetRef')||selectedVehicle?.plate||'').toUpperCase().trim();
    const veh=vehicles.find(v=>v.plate===plate);
    try{
      setError('');setSuccessMsg('');
      const payload={
        id:`DOC-2026-${String(Date.now()).slice(-4)}`,
        documentType:'Documento de Identificação do Veículo',
        issueMode:String(f.get('issueMode')||'1.ª Via Original'),
        targetRef:plate,
        holderName:String(f.get('holderName')||veh?.owner||'').trim(),
        holderDocument:String(f.get('holderDocument')||'').trim(),
        technicalDetails:String(f.get('technicalDetails')||`${veh?.make||''} ${veh?.model||''} (${veh?.year||2024}) · Cor: ${veh?.color||'Branco'} · Cat.: ${veh?.category||''}`).trim(),
        issuingOffice:String(f.get('issuingOffice')||'Direção-Geral de Viação · Bissau'),
        issueDate:String(f.get('issueDate')||new Date().toISOString().slice(0,10)),
        expiryDate:'Permanente',
        notes:String(f.get('notes')||'Livrete oficial emitido em conformidade com o Código da Estrada.').trim(),
      };
      const res=await api.post<OfficialDocument>('/transport-documents',payload);
      setDocs([res.data,...docs]);
      setSuccessMsg(`Documento de Identificação do Veículo (${res.data.id}) emitido com sucesso para a matrícula ${plate}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível emitir o documento de identificação.');
    }
  }

  return <Shell>
    <Title eyebrow="Documentação e certificados · Submenu 1" title="Documento de identificação do veículo" description="Emissão, consulta e autenticação do Documento de Identificação do Veículo (Livrete Oficial), especificações técnicas e titularidade." icon={FileText}/>
    <DocumentSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Documentos emitidos" value={String(vehicleDocs.length)} detail="Livretes de identificação" icon={FileText}/>
      <Stat label="Documentos válidos" value={String(vehicleDocs.filter(d=>d.status==='Válido').length)} detail="Sem restrições ativas" icon={Check}/>
      <Stat label="Com bloqueio / substituído" value={String(vehicleDocs.filter(d=>d.status!=='Válido'||d.administrativeBlock).length)} detail="Restrição ou 2.ª via" icon={AlertTriangle}/>
    </div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <label className="flex max-w-md flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3">
        <Search size={16} className="text-[#737a70]"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por matrícula, titular ou autenticidade" className="w-full py-2 text-sm outline-none"/>
      </label>
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Emitir Documento de Identificação (Livrete)'}</button>
    </div>

    {open&&<Drawer title="Emissão de Documento de Identificação do Veículo" onClose={()=>setOpen(false)}>
      <form onSubmit={submitIssue} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Veículo
          <select name="targetRef" value={selectedPlate} onChange={e=>setSelectedPlate(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {vehicles.map(v=><option key={v.plate} value={v.plate}>{v.plate} · {v.make} {v.model} ({v.year}) — Proprietário: {v.owner}</option>)}
          </select>
        </label>
        <Field label="Nome do Proprietário / Titular" name="holderName" defaultValue={selectedVehicle?.owner||''}/>
        <Field label="N.º de BI / NIF do Titular" name="holderDocument" placeholder="Ex.: 000841920"/>
        <label className="block text-xs font-semibold text-[#4b5549]">Modalidade de Emissão
          <select name="issueMode" className={`mt-1.5 ${inputClass}`}>
            <option value="1.ª Via Original">1.ª Via Original</option>
            <option value="2.ª Via (Extravio / Deterioração)">2.ª Via (Extravio / Deterioração)</option>
            <option value="Atualização Cadastral / Características">Atualização Cadastral / Características</option>
          </select>
        </label>
        <Field label="Data de Emissão" name="issueDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <div className="sm:col-span-2">
          <Field label="Características Técnicas do Veículo" name="technicalDetails" defaultValue={`${selectedVehicle?.make||''} ${selectedVehicle?.model||''} (${selectedVehicle?.year||2024}) · Cor: ${selectedVehicle?.color||'Branco'} · Categoria: ${selectedVehicle?.category||''}`}/>
        </div>
        <Field label="Delegação Emissora" name="issuingOffice" defaultValue="Direção-Geral de Viação · Bissau"/>
        <Field label="Observações Legais" name="notes" defaultValue="Livrete oficial emitido em conformidade com o Código da Estrada." required={false}/>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Emitir e registar livrete de identificação</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Documentos de Identificação do Veículo Emitidos</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º Documento','Matrícula','Titular / Proprietário','Especificações Técnicas','Autenticidade / QR','Emissão','Estado','Ações'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(d=><tr key={d.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold">{d.id}</td>
            <td className="px-3 py-3 font-semibold text-[#006B35]">{d.targetRef}</td>
            <td className="px-3 py-3">{d.holderName}<span className="block text-[11px] text-[#737a70]">{d.holderDocument?`Doc: ${d.holderDocument}`:''}</span></td>
            <td className="px-3 py-3 text-xs text-[#4b5549]">{d.technicalDetails}</td>
            <td className="px-3 py-3 font-mono text-xs text-[#836300]">{d.authenticityCode}</td>
            <td className="px-3 py-3 text-xs">{d.issueDate}</td>
            <td className="px-3 py-3"><Status value={d.status}/></td>
            <td className="px-3 py-3 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <button type="button" onClick={()=>setViewingDoc(d)} className="text-xs font-semibold text-[#006B35] hover:underline flex items-center gap-1"><Printer size={13}/> Imprimir</button>
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {viewingDoc&&<OfficialCertificateModal doc={viewingDoc} onClose={()=>setViewingDoc(null)}/>}
  </Shell>;
}

export function RegistrationCertificatePage(){
  const [vehicles]=useSaved('vehicles',seedVehicles);
  const [docs,setDocs]=useSaved('transport-documents',seedOfficialDocuments);
  const [open,setOpen]=useState(false);
  const [selectedPlate,setSelectedPlate]=useState('');
  const [viewingDoc,setViewingDoc]=useState<OfficialDocument|null>(null);
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');

  const certDocs=docs.filter(d=>d.documentType==='Certificado de Matrícula');
  const selectedVehicle=vehicles.find(v=>v.plate===selectedPlate)||vehicles[0];

  async function submitCertificate(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const plate=String(f.get('targetRef')||selectedVehicle?.plate||'').toUpperCase().trim();
    const veh=vehicles.find(v=>v.plate===plate);
    try{
      setError('');setSuccessMsg('');
      const payload={
        id:`CERT-MAT-2026-${String(Date.now()).slice(-4)}`,
        documentType:'Certificado de Matrícula',
        issueMode:String(f.get('issueMode')||'1.ª Via Original'),
        targetRef:plate,
        holderName:String(f.get('holderName')||veh?.owner||'').trim(),
        holderDocument:String(f.get('holderDocument')||'').trim(),
        technicalDetails:String(f.get('technicalDetails')||`${veh?.make||''} ${veh?.model||''} (${veh?.year||2024}) · Registo Definitivo`).trim(),
        issuingOffice:String(f.get('issuingOffice')||'Direção-Geral de Viação · Bissau'),
        issueDate:String(f.get('issueDate')||new Date().toISOString().slice(0,10)),
        expiryDate:'Permanente',
        notes:String(f.get('notes')||'Certificado de matrícula expedido após inspeção inicial e homologação.').trim(),
      };
      const res=await api.post<OfficialDocument>('/transport-documents',payload);
      setDocs([res.data,...docs]);
      setSuccessMsg(`Certificado de matrícula ${res.data.id} emitido com sucesso para o veículo ${plate}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível emitir o certificado de matrícula.');
    }
  }

  return <Shell>
    <Title eyebrow="Documentação e certificados · Submenu 2" title="Certificado de matrícula" description="Certificação oficial de matrícula de veículos automóveis, reboques e motociclos com homologação da Direção-Geral de Viação." icon={CarFront}/>
    <DocumentSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Certificados emitidos" value={String(certDocs.length)} detail="Base de matrículas ativas" icon={CarFront}/>
      <Stat label="Veículos homologados" value={String(vehicles.length)} detail="Frota registada no SIGETRAN" icon={ShieldCheck}/>
      <Stat label="Certificados válidos" value={String(certDocs.filter(d=>d.status==='Válido').length)} detail="Sem pendência de bloqueio" icon={Check}/>
    </div>
    <div className="mb-4 flex justify-end">
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar formulário':'Emitir certificado de matrícula'}</button>
    </div>

    {open&&<Drawer title="Emissão de Certificado de Matrícula" onClose={()=>setOpen(false)}>
      <form onSubmit={submitCertificate} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Veículo Matriculado
          <select name="targetRef" value={selectedPlate} onChange={e=>setSelectedPlate(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {vehicles.map(v=><option key={v.plate} value={v.plate}>{v.plate} · {v.make} {v.model} — {v.owner}</option>)}
          </select>
        </label>
        <Field label="Nome do Titular da Matrícula" name="holderName" defaultValue={selectedVehicle?.owner||''}/>
        <Field label="NIF / Documento de Identificação" name="holderDocument" placeholder="Ex.: 000492811"/>
        <label className="block text-xs font-semibold text-[#4b5549]">Modalidade
          <select name="issueMode" className={`mt-1.5 ${inputClass}`}>
            <option value="1.ª Via Original">1.ª Via Original (Atribuição de Nova Matrícula)</option>
            <option value="2.ª Via">2.ª Via por Substituição</option>
            <option value="Averbamento">Averbamento por Transferência</option>
          </select>
        </label>
        <Field label="Data de Homologação" name="issueDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <div className="sm:col-span-2">
          <Field label="Dados Técnicos de Homologação" name="technicalDetails" defaultValue={`${selectedVehicle?.make||''} ${selectedVehicle?.model||''} (${selectedVehicle?.year||2024}) · Cor: ${selectedVehicle?.color||'Branco'} · Cat.: ${selectedVehicle?.category||''}`}/>
        </div>
        <Field label="Delegação Regional" name="issuingOffice" defaultValue="Direção-Geral de Viação · Bissau"/>
        <Field label="Observações de Registo" name="notes" defaultValue="Certificado de matrícula expedido após inspeção inicial." required={false}/>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Emitir certificado de matrícula</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º Certificado','Matrícula Homologada','Titular','Modalidade','Código Autenticidade','Data Emissão','Estado','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {certDocs.map(c=><tr key={c.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold">{c.id}</td>
            <td className="px-3 py-3 font-semibold text-[#006B35]">{c.targetRef}</td>
            <td className="px-3 py-3">{c.holderName}</td>
            <td className="px-3 py-3 text-xs">{c.issueMode}</td>
            <td className="px-3 py-3 font-mono text-xs text-[#836300]">{c.authenticityCode}</td>
            <td className="px-3 py-3 text-xs">{c.issueDate}</td>
            <td className="px-3 py-3"><Status value={c.status}/></td>
            <td className="px-3 py-3"><button type="button" onClick={()=>setViewingDoc(c)} className="text-xs font-semibold text-[#006B35] hover:underline flex items-center gap-1"><Printer size={13}/> Visualizar</button></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {viewingDoc&&<OfficialCertificateModal doc={viewingDoc} onClose={()=>setViewingDoc(null)}/>}
  </Shell>;
}

export function DigitalDrivingLicensePage(){
  const [drivers]=useSaved('drivers',seedDrivers);
  const [docs,setDocs]=useSaved('transport-documents',seedOfficialDocuments);
  const [open,setOpen]=useState(false);
  const [selectedDriverId,setSelectedDriverId]=useState('');
  const [viewingDoc,setViewingDoc]=useState<OfficialDocument|null>(null);
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');

  const digitalLicenses=docs.filter(d=>d.documentType==='Carta de Condução Digital');
  const selectedDriver=drivers.find(d=>d.id===selectedDriverId)||drivers[0];

  async function submitDigitalLicense(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const drv=selectedDriver;
    if(!drv){setError('Selecione um condutor.');return;}
    try{
      setError('');setSuccessMsg('');
      const payload={
        id:`CNH-DIG-2026-${String(Date.now()).slice(-4)}`,
        documentType:'Carta de Condução Digital',
        issueMode:'Emissão Digital Certificada',
        targetRef:drv.license,
        holderName:drv.name,
        holderDocument:drv.document,
        technicalDetails:`Categoria: ${drv.category} · Saldo de Pontos: ${drv.points??20}/20 pts · ${drv.medicalRestrictions||'Sem restrições'}`,
        issuingOffice:'Direção-Geral de Viação · Bissau',
        issueDate:String(f.get('issueDate')||new Date().toISOString().slice(0,10)),
        expiryDate:drv.expiryDate||'2031-01-15',
        notes:'Título digital certificado com assinatura ICP-GB e QR Code dinâmico.',
      };
      const res=await api.post<OfficialDocument>('/transport-documents',payload);
      setDocs([res.data,...docs]);
      setSuccessMsg(`Carta de condução digital ativada para ${drv.name} (${drv.license}).`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível emitir a carta digital.');
    }
  }

  return <Shell>
    <Title eyebrow="Documentação e certificados · Submenu 3" title="Carta de condução digital" description="Emissão e gestão da Carta de Condução Digital com assinatura eletrónica, categorias habilitadas (A, B, C, D, E), saldo de pontos e QR Code dinâmico." icon={Users}/>
    <DocumentSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    
    <div className="mb-6 grid gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2 border border-[#dcd9cc] bg-white p-5">
        <div className="flex justify-between items-center mb-4 border-b border-[#e9e6dc] pb-3">
          <h2 className="font-serif text-lg font-bold text-[#1c3024]">Cartas Digitais Ativas no Dispositivo Móvel</h2>
          <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Emitir / Ativar Carta Digital'}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
              <tr>{['N.º Carta','Condutor','Categorias','Validade','Código de Autenticidade','Estado','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
            </thead>
            <tbody>
              {digitalLicenses.map(dl=><tr key={dl.id} className="border-b border-[#f0eee7]">
                <td className="px-3 py-3 font-semibold text-[#006B35]">{dl.targetRef}</td>
                <td className="px-3 py-3 font-medium">{dl.holderName}</td>
                <td className="px-3 py-3 text-xs">{dl.technicalDetails?.split('·')[0]}</td>
                <td className="px-3 py-3 text-xs">{dl.expiryDate}</td>
                <td className="px-3 py-3 font-mono text-xs text-[#836300]">{dl.authenticityCode}</td>
                <td className="px-3 py-3"><Status value={dl.status}/></td>
                <td className="px-3 py-3"><button type="button" onClick={()=>setViewingDoc(dl)} className="text-xs font-semibold text-[#006B35] hover:underline flex items-center gap-1"><QrCode size={13}/> Ver Título Digital</button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border border-[#173d2b] bg-[#173d2b] text-white p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center bg-[#FCD116] font-bold text-[#173d2b] text-xs">GB</span>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#FCD116]">República da Guiné-Bissau</div>
                <div className="text-xs font-bold leading-3">Carta de Condução Digital</div>
              </div>
            </div>
            <span className="text-[10px] bg-[#009E49] px-2 py-0.5 rounded text-white font-bold">DIGITAL</span>
          </div>
          <div className="space-y-2 text-xs">
            <div><span className="text-[#9fb7a4] text-[10px] block">Condutor:</span><b className="text-sm">{selectedDriver?.name||'Mamadu Embaló'}</b></div>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-[#9fb7a4] text-[10px] block">N.º da Carta:</span><b className="font-mono text-[#FCD116]">{selectedDriver?.license||'GB-C-10294'}</b></div>
              <div><span className="text-[#9fb7a4] text-[10px] block">N.º BI:</span><b>{selectedDriver?.document||'000000001'}</b></div>
            </div>
            <div><span className="text-[#9fb7a4] text-[10px] block">Categorias Habilitadas:</span><span className="inline-block bg-[#009E49]/30 border border-[#009E49] px-2 py-0.5 rounded font-bold text-xs">{selectedDriver?.category||'B · Ligeiros'}</span></div>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-[#9fb7a4] text-[10px] block">Saldo de Pontos:</span><b className="text-sm text-[#FCD116]">{selectedDriver?.points??20} / 20 pts</b></div>
              <div><span className="text-[#9fb7a4] text-[10px] block">Validade:</span><b>{selectedDriver?.expiryDate||'2028-04-10'}</b></div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
          <div className="bg-white p-1 rounded">
            <QrCode size={44} className="text-[#173d2b]"/>
          </div>
          <div className="text-right text-[10px] text-[#bdcdbf]">
            Fiscalização SIGETRAN<br/>
            QR Code Dinâmico Ativo
          </div>
        </div>
      </div>
    </div>

    {open&&<Drawer title="Ativação de Carta de Condução Digital" onClose={()=>setOpen(false)}>
      <form onSubmit={submitDigitalLicense} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Condutor Habilitado
          <select name="driverId" value={selectedDriverId} onChange={e=>setSelectedDriverId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {drivers.map(d=><option key={d.id} value={d.id}>{d.name} · Carta: {d.license} · Cat: {d.category} · Validade: {d.expiryDate}</option>)}
          </select>
        </label>
        <Field label="Data de Emissão Digital" name="issueDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Validade da Carta" name="expiryDate" defaultValue={selectedDriver?.expiryDate||'2029-01-15'}/>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Emitir e assinar carta digital</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}
    {viewingDoc&&<OfficialCertificateModal doc={viewingDoc} onClose={()=>setViewingDoc(null)}/>}
  </Shell>;
}

export function OwnershipCertificatePage(){
  const [vehicles]=useSaved('vehicles',seedVehicles);
  const [transfers]=useSaved('ownership-transfers',seedOwnershipTransfers);
  const [docs,setDocs]=useSaved('transport-documents',seedOfficialDocuments);
  const [open,setOpen]=useState(false);
  const [selectedPlate,setSelectedPlate]=useState('');
  const [viewingDoc,setViewingDoc]=useState<OfficialDocument|null>(null);
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');

  const ownershipDocs=docs.filter(d=>d.documentType==='Certificado de Propriedade');
  const selectedVehicle=vehicles.find(v=>v.plate===selectedPlate)||vehicles[0];

  async function submitOwnershipCert(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const plate=String(f.get('targetRef')||selectedVehicle?.plate||'').toUpperCase().trim();
    const veh=vehicles.find(v=>v.plate===plate);
    try{
      setError('');setSuccessMsg('');
      const payload={
        id:`CERT-PROP-2026-${String(Date.now()).slice(-4)}`,
        documentType:'Certificado de Propriedade',
        issueMode:String(f.get('issueMode')||'1.ª Via Original'),
        targetRef:plate,
        holderName:String(f.get('holderName')||veh?.owner||'').trim(),
        holderDocument:String(f.get('holderDocument')||'').trim(),
        technicalDetails:String(f.get('technicalDetails')||`${veh?.make||''} ${veh?.model||''} (${veh?.year||2024}) · Registo Predial e Automóvel`).trim(),
        issuingOffice:String(f.get('issuingOffice')||'Conservatória do Registo Automóvel e DGV · Bissau'),
        issueDate:String(f.get('issueDate')||new Date().toISOString().slice(0,10)),
        expiryDate:'Permanente',
        notes:String(f.get('notes')||'Título de propriedade emitido com plena eficácia jurídica.').trim(),
      };
      const res=await api.post<OfficialDocument>('/transport-documents',payload);
      setDocs([res.data,...docs]);
      setSuccessMsg(`Certificado de propriedade ${res.data.id} emitido para a viatura ${plate}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível emitir o certificado de propriedade.');
    }
  }

  return <Shell>
    <Title eyebrow="Documentação e certificados · Submenu 4" title="Certificado de propriedade" description="Comprovativo jurídico e registo patrimonial do direito de propriedade de veículos, encargos, ónus e averbamentos cartorários." icon={ShieldCheck}/>
    <DocumentSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    
    <div className="mb-4 flex justify-between items-center">
      <Link to="/ownership-transfers" className={secondaryClass}><ArrowRight size={16}/> Histórico de transferências de propriedade</Link>
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Emitir Certificado de Propriedade'}</button>
    </div>

    {open&&<Drawer title="Emissão de Certificado de Propriedade Automóvel" onClose={()=>setOpen(false)}>
      <form onSubmit={submitOwnershipCert} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Veículo
          <select name="targetRef" value={selectedPlate} onChange={e=>setSelectedPlate(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {vehicles.map(v=><option key={v.plate} value={v.plate}>{v.plate} · {v.make} {v.model} — Proprietário: {v.owner}</option>)}
          </select>
        </label>
        <Field label="Nome Completo do Proprietário Legítimo" name="holderName" defaultValue={selectedVehicle?.owner||''}/>
        <Field label="NIF / Documento de Identificação" name="holderDocument" placeholder="Ex.: 000000001"/>
        <Field label="Data de Emissão do Título" name="issueDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Entidade Emissora" name="issuingOffice" defaultValue="Conservatória do Registo Automóvel e DGV · Bissau"/>
        <div className="sm:col-span-2">
          <Field label="Descrição e Especificações Registadas" name="technicalDetails" defaultValue={`${selectedVehicle?.make||''} ${selectedVehicle?.model||''} (${selectedVehicle?.year||2024}) · Registo Patrimonial Automóvel`}/>
        </div>
        <div className="sm:col-span-2">
          <Field label="Declaração de Encargos / Reserva de Propriedade" name="notes" defaultValue="Sem ónus ou reserva de propriedade registados." required={false}/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Emitir certificado de propriedade</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º do Título','Matrícula','Proprietário Registado','Ónus / Encargos','Código de Autenticidade','Data de Emissão','Estado','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {ownershipDocs.map(od=><tr key={od.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold">{od.id}</td>
            <td className="px-3 py-3 font-semibold text-[#006B35]">{od.targetRef}</td>
            <td className="px-3 py-3">{od.holderName}</td>
            <td className="px-3 py-3 text-xs text-[#4b5549]">{od.notes||'Sem ónus'}</td>
            <td className="px-3 py-3 font-mono text-xs text-[#836300]">{od.authenticityCode}</td>
            <td className="px-3 py-3 text-xs">{od.issueDate}</td>
            <td className="px-3 py-3"><Status value={od.status}/></td>
            <td className="px-3 py-3"><button type="button" onClick={()=>setViewingDoc(od)} className="text-xs font-semibold text-[#006B35] hover:underline flex items-center gap-1"><Printer size={13}/> Imprimir Título</button></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {viewingDoc&&<OfficialCertificateModal doc={viewingDoc} onClose={()=>setViewingDoc(null)}/>}
  </Shell>;
}

export function DocumentIssuanceHistoryPage(){
  const [docs]=useSaved('transport-documents',seedOfficialDocuments);
  const [typeFilter,setTypeFilter]=useState('');
  const [search,setSearch]=useState('');
  const [viewingDoc,setViewingDoc]=useState<OfficialDocument|null>(null);

  const filteredDocs=docs.filter(d=>{
    if(typeFilter&&d.documentType!==typeFilter)return false;
    if(!search.trim())return true;
    const q=search.toLowerCase();
    return [d.id,d.documentType,d.targetRef,d.holderName,d.authenticityCode,d.issuingOffice].join(' ').toLowerCase().includes(q);
  });

  return <Shell>
    <Title eyebrow="Documentação e certificados · Submenu 5" title="Histórico de emissão de documentos" description="Rastreabilidade e auditoria completa de todos os documentos e certificados oficiais emitidos na base central do Ministério dos Transportes." icon={ClipboardList}/>
    <DocumentSubmenuBar/>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Filtrar por tipo de documento" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="border border-[#d5d1c2] bg-white px-3 py-2 text-xs font-semibold outline-none">
          <option value="">Todos os tipos de documentos</option>
          <option value="Documento de Identificação do Veículo">Documento de Identificação do Veículo</option>
          <option value="Certificado de Matrícula">Certificado de Matrícula</option>
          <option value="Carta de Condução Digital">Carta de Condução Digital</option>
          <option value="Certificado de Propriedade">Certificado de Propriedade</option>
        </select>
        <label className="flex items-center gap-2 border border-[#d5d1c2] bg-white px-3">
          <Search size={16} className="text-[#737a70]"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por n.º, titular, matrícula ou código" className="w-64 py-2 text-sm outline-none"/>
        </label>
      </div>
      <span className="text-xs text-[#737a70]">{filteredDocs.length} documento(s) listado(s)</span>
    </div>

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º Documento','Tipo de Documento','Modalidade','Matrícula / Referência','Titular','Delegação Emissora','Data Emissão','Autenticidade','Estado','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filteredDocs.map(d=><tr key={d.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold">{d.id}</td>
            <td className="px-3 py-3 font-medium">{d.documentType}</td>
            <td className="px-3 py-3 text-xs">{d.issueMode}</td>
            <td className="px-3 py-3 font-semibold text-[#006B35]">{d.targetRef}</td>
            <td className="px-3 py-3">{d.holderName}</td>
            <td className="px-3 py-3 text-xs text-[#737a70]">{d.issuingOffice}</td>
            <td className="px-3 py-3 text-xs">{d.issueDate}</td>
            <td className="px-3 py-3 font-mono text-xs text-[#836300]">{d.authenticityCode}</td>
            <td className="px-3 py-3"><Status value={d.status}/></td>
            <td className="px-3 py-3"><button type="button" onClick={()=>setViewingDoc(d)} className="text-xs font-semibold text-[#006B35] hover:underline">Ver Certificado</button></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {viewingDoc&&<OfficialCertificateModal doc={viewingDoc} onClose={()=>setViewingDoc(null)}/>}
  </Shell>;
}

export function DocumentSecondCopyPage(){
  const [docs,setDocs]=useSaved('transport-documents',seedOfficialDocuments);
  const [vehicles]=useSaved('vehicles',seedVehicles);
  const [drivers]=useSaved('drivers',seedDrivers);
  const [open,setOpen]=useState(false);
  const [selectedDocId,setSelectedDocId]=useState('');
  const [reason,setReason]=useState('Extravio');
  const [successMsg,setSuccessMsg]=useState('');
  const [error,setError]=useState('');
  const [viewingDoc,setViewingDoc]=useState<OfficialDocument|null>(null);

  const selectedDoc=docs.find(d=>d.id===selectedDocId)||docs[0];
  const secondCopies=docs.filter(d=>d.issueMode.includes('2.ª Via')||d.issueMode.includes('Segunda Via'));

  async function submitSecondCopy(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const originDoc=selectedDoc;
    if(!originDoc){setError('Selecione o documento original para emitir a 2.ª via.');return;}
    try{
      setError('');setSuccessMsg('');
      const policeReport=String(f.get('policeReport')||'').trim();
      const payload={
        id:`DOC-2VIA-2026-${String(Date.now()).slice(-4)}`,
        documentType:originDoc.documentType,
        issueMode:`2.ª Via (${reason})`,
        targetRef:originDoc.targetRef,
        holderName:originDoc.holderName,
        holderDocument:originDoc.holderDocument,
        technicalDetails:originDoc.technicalDetails,
        issuingOffice:String(f.get('issuingOffice')||'Direção-Geral de Viação · Bissau'),
        issueDate:new Date().toISOString().slice(0,10),
        expiryDate:originDoc.expiryDate,
        notes:`Segunda via emitida por motivo de ${reason}. ${policeReport?`Boletim de Ocorrência Policial: ${policeReport}.`:''} Documento anterior ${originDoc.id} cancelado/substituído.`,
      };
      const res=await api.post<OfficialDocument>('/transport-documents',payload);
      // Invalida documento anterior
      setDocs(rows=>rows.map(r=>r.id===originDoc.id?{...r,status:'Substituído (2.ª Via)'}:r).concat([res.data]));
      setSuccessMsg(`2.ª Via ${res.data.id} emitida com sucesso! A 1.ª via anterior (${originDoc.id}) foi cancelada no sistema.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível emitir a segunda via.');
    }
  }

  return <Shell>
    <Title eyebrow="Documentação e certificados · Submenu 6" title="Segunda via" description="Processamento de pedidos de 2.ª via de livretes, certificados de matrícula e cartas de condução por motivo de extravio, roubo ou dano físico." icon={FilePlus2}/>
    <DocumentSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}
    
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Segundas vias emitidas" value={String(secondCopies.length)} detail="Processos de substituição" icon={FilePlus2}/>
      <Stat label="Documentos cancelados" value={String(docs.filter(d=>d.status==='Substituído (2.ª Via)').length)} detail="Vias originais invalidadas" icon={AlertTriangle}/>
      <Stat label="Taxa administrativa" value="15.000 XOF" detail="Taxa legal de reemissão" icon={Banknote}/>
    </div>

    <div className="mb-4 flex justify-end">
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Solicitar / Emitir Segunda Via'}</button>
    </div>

    {open&&<Drawer title="Emissão de Segunda Via de Documento" onClose={()=>setOpen(false)}>
      <form onSubmit={submitSecondCopy} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Documento Original a Substituir
          <select name="originDocId" value={selectedDocId} onChange={e=>setSelectedDocId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {docs.filter(d=>d.status==='Válido').map(d=><option key={d.id} value={d.id}>{d.id} · {d.documentType} ({d.targetRef}) — {d.holderName}</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Motivo da Solicitação
          <select value={reason} onChange={e=>setReason(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            <option value="Extravio">Extravio / Perda</option>
            <option value="Furto / Roubo">Furto / Roubo (com participação policial)</option>
            <option value="Deterioração">Deterioração / Inutilização física</option>
            <option value="Alteração de Características">Alteração de Características</option>
          </select>
        </label>
        <Field label="N.º do Boletim de Ocorrência Policial" name="policeReport" placeholder="Ex.: BO-POP-2026/089" required={reason==='Furto / Roubo'}/>
        <Field label="Delegação Responsável" name="issuingOffice" defaultValue="Direção-Geral de Viação · Bissau"/>
        <Field label="Taxa de Reemissão Paga (XOF)" name="fee" defaultValue="15000" type="number"/>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Confirmar anulação da via anterior e gerar 2.ª via</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Histórico de Segundas Vias Emitidas</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º 2.ª Via','Documento','Matrícula / Ref.','Titular','Motivo / Observações','Data','Código Autenticidade','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {secondCopies.map(sc=><tr key={sc.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold text-[#9f1a2b]">{sc.id}</td>
            <td className="px-3 py-3">{sc.documentType}</td>
            <td className="px-3 py-3 font-semibold text-[#006B35]">{sc.targetRef}</td>
            <td className="px-3 py-3">{sc.holderName}</td>
            <td className="px-3 py-3 text-xs text-[#4b5549]">{sc.notes}</td>
            <td className="px-3 py-3 text-xs">{sc.issueDate}</td>
            <td className="px-3 py-3 font-mono text-xs text-[#836300]">{sc.authenticityCode}</td>
            <td className="px-3 py-3"><button type="button" onClick={()=>setViewingDoc(sc)} className="text-xs font-semibold text-[#006B35] hover:underline flex items-center gap-1"><Printer size={13}/> Imprimir</button></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {viewingDoc&&<OfficialCertificateModal doc={viewingDoc} onClose={()=>setViewingDoc(null)}/>}
  </Shell>;
}

export function QRCodeValidationPage(){
  const [docs]=useSaved('transport-documents',seedOfficialDocuments);
  const [inputPayload,setInputPayload]=useState('');
  const [validatedDoc,setValidatedDoc]=useState<OfficialDocument|null>(null);
  const [checked,setChecked]=useState(false);

  function handleValidate(payloadToTest?:string){
    const str=(payloadToTest??inputPayload).trim();
    if(!str){return;}
    setChecked(true);
    const found=docs.find(d=>d.qrPayload.toUpperCase()===str.toUpperCase()||d.authenticityCode.toUpperCase()===str.toUpperCase()||d.id.toUpperCase()===str.toUpperCase()||d.targetRef.toUpperCase()===str.toUpperCase());
    setValidatedDoc(found||null);
  }

  return <Shell>
    <Title eyebrow="Documentação e certificados · Submenu 7" title="Validação por QR Code" description="Decodificação e validação de assinaturas QR Code geradas em documentos oficiais da Direção-Geral de Viação para operações de fiscalização rápida." icon={QrCode}/>
    <DocumentSubmenuBar/>

    <div className="grid gap-6 lg:grid-cols-2">
      <div className="border border-[#dcd9cc] bg-white p-5">
        <h2 className="font-serif text-lg font-bold text-[#1c3024] mb-3 flex items-center gap-2"><QrCode size={18} className="text-[#006B35]"/> Leitor / Decodificador de QR Code</h2>
        <p className="text-xs text-[#697168] mb-4">Insira o payload criptográfico do QR Code, o código de autenticidade ou a matrícula para testar a validação em tempo real.</p>
        <div className="space-y-3">
          <textarea value={inputPayload} onChange={e=>setInputPayload(e.target.value)} placeholder="Ex.: SIGETRAN-QR|DOC-2026-0001|GB-24-BC|AUTH-GB-2026-1001-24BC" className={`h-24 ${inputClass} font-mono text-xs`}/>
          <div className="flex gap-2">
            <button type="button" onClick={()=>handleValidate()} className={primaryClass}><Check size={16}/> Validar Assinatura QR Code</button>
            <button type="button" onClick={()=>{setInputPayload('');setValidatedDoc(null);setChecked(false);}} className={secondaryClass}>Limpar</button>
          </div>
        </div>

        <div className="mt-6 border-t border-[#e9e6dc] pt-4">
          <div className="text-xs font-semibold text-[#4b5549] mb-2">Exemplos rápidos de QR Codes emitidos:</div>
          <div className="space-y-1.5">
            {docs.slice(0,3).map(d=><button key={d.id} type="button" onClick={()=>{setInputPayload(d.qrPayload);handleValidate(d.qrPayload);}} className="block w-full text-left border border-[#d5d1c2] bg-[#f8f7f2] p-2 text-xs hover:border-[#009E49]">
              <span className="font-bold text-[#006B35]">{d.documentType} ({d.targetRef})</span>
              <span className="block font-mono text-[11px] text-[#737a70] truncate">{d.qrPayload}</span>
            </button>)}
          </div>
        </div>
      </div>

      <div className="border border-[#dcd9cc] bg-white p-5 flex flex-col justify-between">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#1c3024] mb-3">Resultado da Validação Criptográfica</h2>
          {!checked&&<div className="text-xs text-[#737a70] p-6 text-center border border-dashed border-[#dcd9cc]">Aguardando leitura ou inserção do código QR para validação.</div>}
          {checked&&validatedDoc&&<div className={`p-4 border ${validatedDoc.status==='Válido'&&!validatedDoc.administrativeBlock?'border-[#009E49]/40 bg-[#009E49]/10':'border-[#CE1126]/30 bg-[#CE1126]/10'}`}>
            <div className="flex items-center gap-2 mb-2 font-bold text-sm">
              {validatedDoc.status==='Válido'&&!validatedDoc.administrativeBlock?<span className="text-[#006B35] flex items-center gap-1"><Check size={18}/> QR CODE VÁLIDO E AUTÊNTICO</span>:<span className="text-[#9f1a2b] flex items-center gap-1"><AlertTriangle size={18}/> RESTRIÇÃO / DOCUMENTO INVÁLIDO</span>}
            </div>
            <div className="space-y-1.5 text-xs">
              <div><b>Documento:</b> {validatedDoc.documentType} ({validatedDoc.id})</div>
              <div><b>Matrícula / Ref.:</b> {validatedDoc.targetRef}</div>
              <div><b>Titular:</b> {validatedDoc.holderName}</div>
              <div><b>Emissão:</b> {validatedDoc.issueDate} · Validade: {validatedDoc.expiryDate}</div>
              <div><b>Código de Autenticidade:</b> <span className="font-mono text-[#836300] font-bold">{validatedDoc.authenticityCode}</span></div>
              <div><b>Estado na Base Central:</b> <Status value={validatedDoc.status}/></div>
              {validatedDoc.administrativeBlock&&<div className="text-[#9f1a2b] font-bold mt-1">Aviso: Documento com Bloqueio Administrativo Ativo ({validatedDoc.blockReason}).</div>}
            </div>
          </div>}
          {checked&&!validatedDoc&&<div className="p-4 border border-[#CE1126]/30 bg-[#CE1126]/10 text-xs text-[#9f1a2b]">
            <b className="flex items-center gap-1 text-sm mb-1"><X size={18}/> QR Code Inválido ou Não Reconhecido</b>
            O código QR informado não corresponde a nenhum documento registrado na base de dados oficial do SIGETRAN.
          </div>}
        </div>
        <div className="mt-4 pt-3 border-t border-[#e9e6dc] text-[11px] text-[#737a70] flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#006B35]"/> O validador confere a integridade criptográfica da assinatura e o estado operacional em tempo real.
        </div>
      </div>
    </div>
  </Shell>;
}

export function PublicAuthenticityVerificationPage(){
  const [docs]=useSaved('transport-documents',seedOfficialDocuments);
  const [query,setQuery]=useState('');
  const [result,setResult]=useState<OfficialDocument|null>(null);
  const [hasSearched,setHasSearched]=useState(false);

  function handleSearch(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const q=query.trim();
    if(!q)return;
    setHasSearched(true);
    const found=docs.find(d=>d.authenticityCode.toUpperCase()===q.toUpperCase()||d.id.toUpperCase()===q.toUpperCase()||d.targetRef.toUpperCase()===q.toUpperCase()||d.qrPayload.toUpperCase()===q.toUpperCase());
    setResult(found||null);
  }

  return <Shell>
    <Title eyebrow="Documentação e certificados · Submenu 8" title="Verificação pública de autenticidade" description="Serviço público de verificação da autenticidade de documentos, livretes e cartas emitidas pelo Ministério dos Transportes." icon={ShieldCheck}/>
    <DocumentSubmenuBar/>

    <div className="max-w-3xl mx-auto border border-[#dcd9cc] bg-white p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-grid h-12 w-12 place-items-center border border-[#FCD116] bg-[#173d2b] text-base font-black text-[#FCD116] mb-2">GB</div>
        <h2 className="font-serif text-xl font-bold text-[#1c3024]">Validação Pública de Títulos e Certidões</h2>
        <p className="text-xs text-[#697168] mt-1">Insira o Código de Autenticidade impresso no documento (ex.: AUTH-GB-2026-1001-24BC), o número da certidão ou a matrícula.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Código de Autenticidade (ex.: AUTH-GB-2026-1001-24BC)" className={`${inputClass} flex-1 font-mono`} required/>
        <button className={primaryClass}><Search size={16}/> Verificar Autenticidade</button>
      </form>

      {hasSearched&&result&&<div className="border border-[#009E49]/40 bg-[#f8f7f2] p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#dcd9cc] pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#006B35]">
            <Check size={18}/> DOCUMENTO AUTÊNTICO E REGISTADO NA BASE OFICIAL
          </div>
          <Status value={result.status}/>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div><span className="text-[#737a70] block">Tipo de Documento:</span><b>{result.documentType}</b></div>
          <div><span className="text-[#737a70] block">N.º de Registo:</span><b className="font-mono">{result.id}</b></div>
          <div><span className="text-[#737a70] block">Matrícula / Referência Vinculada:</span><b className="font-mono text-sm text-[#006B35]">{result.targetRef}</b></div>
          <div><span className="text-[#737a70] block">Titular Registado:</span><b>{result.holderName}</b></div>
          <div className="sm:col-span-2"><span className="text-[#737a70] block">Dados Técnicos / Categorias:</span><b>{result.technicalDetails||'—'}</b></div>
          <div><span className="text-[#737a70] block">Data de Emissão Oficial:</span><b>{result.issueDate}</b></div>
          <div><span className="text-[#737a70] block">Validade:</span><b>{result.expiryDate}</b></div>
          <div className="sm:col-span-2"><span className="text-[#737a70] block">Delegação Emissora:</span><b>{result.issuingOffice}</b></div>
        </div>
        {result.administrativeBlock&&<div className="p-2 border border-[#CE1126]/30 bg-[#CE1126]/10 text-xs text-[#9f1a2b]"><b>Atenção:</b> Este documento encontra-se temporariamente com bloqueio administrativo legalmente imposto.</div>}
      </div>}

      {hasSearched&&!result&&<div className="border border-[#CE1126]/30 bg-[#CE1126]/10 p-5 text-center text-xs text-[#9f1a2b]">
        <b className="block text-sm mb-1">Nenhum registo oficial localizado</b>
        O código informado não corresponde a nenhum documento autêntico registado na base do Ministério dos Transportes da Guiné-Bissau.
      </div>}
    </div>
  </Shell>;
}

export function DocumentAdministrativeBlockPage(){
  const [docs,setDocs]=useSaved('transport-documents',seedOfficialDocuments);
  const [open,setOpen]=useState(false);
  const [selectedDocId,setSelectedDocId]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [error,setError]=useState('');

  const selectedDoc=docs.find(d=>d.id===selectedDocId)||docs[0];
  const blockedDocs=docs.filter(d=>d.administrativeBlock||d.status==='Bloqueado');

  async function submitBlock(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const docId=String(f.get('docId')||selectedDoc?.id||'');
    const action=String(f.get('action')||'block');
    const isBlock=action==='block';
    const reason=String(f.get('blockReason')||'').trim();
    try{
      setError('');setSuccessMsg('');
      const res=await api.put<OfficialDocument>(`/transport-documents/${encodeURIComponent(docId)}`,{
        administrativeBlock:isBlock,
        status:isBlock?'Bloqueado':'Válido',
        blockReason:isBlock?reason:'',
      });
      setDocs(rows=>rows.map(r=>r.id===docId?res.data:r));
      setSuccessMsg(isBlock?`Bloqueio administrativo decretado com sucesso para o documento ${docId}.`:`Bloqueio administrativo levantado para o documento ${docId}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível atualizar o bloqueio administrativo.');
    }
  }

  return <Shell>
    <Title eyebrow="Documentação e certificados · Submenu 9" title="Bloqueio administrativo quando legalmente autorizado" description="Aplicação e levantamento de restrições administrativas sobre documentos, certificados de matrícula e títulos de propriedade por ordem judicial ou infração legal." icon={ShieldCheck}/>
    <DocumentSubmenuBar/>
    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Documentos com bloqueio" value={String(blockedDocs.length)} detail="Restrição administrativa ativa" icon={AlertTriangle}/>
      <Stat label="Documentos regulares" value={String(docs.length-blockedDocs.length)} detail="Sem impedimentos legais" icon={Check}/>
      <Stat label="Fundamentação jurídica" value="Art. 142.º" detail="Código da Estrada da Guiné-Bissau" icon={ShieldCheck}/>
    </div>

    <div className="mb-4 flex justify-end">
      <button onClick={()=>{setOpen(!open);setError('');}} className="inline-flex items-center justify-center gap-2 bg-[#9f1a2b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7f1422]"><ShieldCheck size={16}/>{open?'Fechar':'Decretar / Levantar Bloqueio Administrativo'}</button>
    </div>

    {open&&<Drawer title="Bloqueio Administrativo de Documento / Certificado" onClose={()=>setOpen(false)}>
      <form onSubmit={submitBlock} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Documento / Certificado Alvo
          <select name="docId" value={selectedDocId} onChange={e=>setSelectedDocId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {docs.map(d=><option key={d.id} value={d.id}>{d.id} · {d.documentType} ({d.targetRef}) — {d.holderName} [{d.status}]</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Ação Administrativa
          <select name="action" className={`mt-1.5 ${inputClass}`}>
            <option value="block">Decretar Bloqueio Administrativo (Impedimento legal)</option>
            <option value="unblock">Levantar Bloqueio Administrativo (Restabelecer regularidade)</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <Field label="Despacho Legal e Motivação do Bloqueio" name="blockReason" defaultValue={selectedDoc?.blockReason||'Despacho DGT n.º 118/2026 · Suspensão por processo judicial / apreensão administrativa.'}/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className="inline-flex items-center justify-center gap-2 bg-[#9f1a2b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7f1422]">Confirmar medida administrativa</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <h2 className="mb-3 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Registo de Bloqueios Administrativos sobre Documentos</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º Documento','Tipo de Documento','Matrícula / Ref.','Titular','Despacho / Motivação Legal','Situação','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {docs.map(d=><tr key={d.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold">{d.id}</td>
            <td className="px-3 py-3">{d.documentType}</td>
            <td className="px-3 py-3 font-semibold text-[#006B35]">{d.targetRef}</td>
            <td className="px-3 py-3">{d.holderName}</td>
            <td className="px-3 py-3 text-xs text-[#4b5549]">{d.blockReason||'Sem restrição'}</td>
            <td className="px-3 py-3"><Status value={d.administrativeBlock||d.status==='Bloqueado'?'Bloqueado':'Sem bloqueio'}/></td>
            <td className="px-3 py-3">
              <button type="button" onClick={()=>{setSelectedDocId(d.id);setOpen(true);}} className="text-xs font-semibold text-[#006B35] hover:underline">
                {d.administrativeBlock||d.status==='Bloqueado'?'Gerir / Levantar':'Aplicar bloqueio'}
              </button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

function StateFleetSubmenuBar(){
  const {pathname}=useLocation();
  return <div className="mb-6 flex flex-wrap gap-1.5 border-b border-[#dcd9cc] pb-4">
    {stateFleetSubmenus.map(sub=>{
      const active=pathname===sub.path;
      return <Link key={sub.path} to={sub.path} className={`border px-3 py-1.5 text-xs font-semibold transition ${active?'border-[#006B35] bg-[#006B35] text-white':'border-[#d5d1c2] bg-white text-[#26372b] hover:border-[#009E49] hover:bg-[#f4f3ed]'}`}>{sub.label}</Link>;
    })}
  </div>;
}

function FleetResponsibilityTermModal({vehicle,onClose}:{vehicle:PublicVehicle;onClose:()=>void}){
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10251a]/60">
    <div className="relative w-full max-w-2xl bg-white border-2 border-[#173d2b] shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-start border-b-2 border-[#d5d1c2] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center border border-[#FCD116] bg-[#173d2b] text-base font-black text-[#FCD116]">GB</div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#836300]">República da Guiné-Bissau</div>
            <h3 className="font-serif text-lg font-bold text-[#173d2b]">Ministério dos Transportes e Comunicações</h3>
            <div className="text-xs text-[#697168]">Direção-Geral de Viação · Direção do Património do Estado</div>
          </div>
        </div>
        <button onClick={onClose} aria-label="Fechar" className="p-1 text-[#737a70] hover:text-[#1c3024]"><X size={20}/></button>
      </div>

      <div className="mb-4 border-l-4 border-[#009E49] bg-[#f4f3ed] p-3 text-center">
        <h4 className="font-serif text-base font-bold text-[#173d2b] uppercase tracking-wide">Termo Oficial de Cedência e Responsabilidade de Viatura do Estado</h4>
        <p className="text-[11px] text-[#737a70]">Em conformidade com as normas regulamentares de gestão do património móvel do Estado</p>
      </div>

      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3 border border-[#dcd9cc] bg-[#f8f7f2] p-4">
          <div><span className="text-[#737a70] block">Matrícula Oficial:</span><b className="font-mono text-sm text-[#006B35]">{vehicle.plate}</b></div>
          <div><span className="text-[#737a70] block">Viatura:</span><b>{vehicle.make} {vehicle.model} ({vehicle.year})</b></div>
          <div><span className="text-[#737a70] block">Cor / Categoria:</span><b>{vehicle.color||'Branco'} · {vehicle.category}</b></div>
          <div><span className="text-[#737a70] block">N.º de Chassi (VIN):</span><b className="font-mono">{vehicle.chassisNumber||'JT111GJ928192801'}</b></div>
          <div><span className="text-[#737a70] block">Quilometragem Inicial:</span><b>{(vehicle.currentMileage||0).toLocaleString('pt-PT')} km</b></div>
          <div><span className="text-[#737a70] block">Tipo de Combustível:</span><b>{vehicle.fuelType||'Gasóleo'} (Capacidade: {vehicle.tankCapacity||80} L)</b></div>
        </div>

        <div className="grid grid-cols-2 gap-3 border border-[#dcd9cc] p-4">
          <div className="col-span-2"><span className="text-[#737a70] block">Ministério / Instituição Afeta:</span><b className="text-sm text-[#173d2b]">{vehicle.institution} ({vehicle.institutionAcronym||'GOV'})</b></div>
          <div><span className="text-[#737a70] block">Direção / Departamento:</span><b>{vehicle.department||'Serviços Gerais'}</b></div>
          <div><span className="text-[#737a70] block">Data de Afetação:</span><b>{vehicle.assignmentDate||'2022-06-15'}</b></div>
          <div><span className="text-[#737a70] block">Funcionário / Titular Responsável:</span><b className="text-sm">{vehicle.responsibleOfficer||'Não designado'}</b></div>
          <div><span className="text-[#737a70] block">Cargo / Função Oficial:</span><b>{vehicle.officerRole||'Titular de Cargo Público'}</b></div>
          <div className="col-span-2"><span className="text-[#737a70] block">Contacto Telefónico:</span><b>{vehicle.officerContact||'+245 955 000 000'}</b></div>
        </div>

        <div className="border border-[#dcd9cc] bg-white p-3 space-y-2 text-[11px] leading-relaxed text-[#4b5549]">
          <b className="text-[#173d2b] block">Cláusulas e Deveres do Titular:</b>
          <p>1. A viatura identificada destina-se estritamente ao cumprimento de missões oficiais e necessidades do serviço público governamental, sendo expressamente vedado o uso particular ou cedência a pessoas não autorizadas.</p>
          <p>2. O titular compromete-se a zelar pelo bom estado mecânico, conservação dos equipamentos de bordo e apresentação às vistorias e revisões periódicas da Garagem Oficial do Estado.</p>
          <p>3. Qualquer sinistro, furto, avaria grave ou deslocação para fora de Bissau carece de emissão prévia de Guia de Marcha / Ordem de Missão no SIGETRAN.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 border-t border-[#dcd9cc] pt-6 text-center text-[11px]">
          <div>
            <div className="border-b border-[#202820] pb-8"/>
            <b className="block mt-1">{vehicle.responsibleOfficer||'O Funcionário Responsável'}</b>
            <span className="text-[#737a70]">Assinatura do Titular</span>
          </div>
          <div>
            <div className="border-b border-[#202820] pb-8"/>
            <b className="block mt-1">Diretor-Geral de Viação e Transportes</b>
            <span className="text-[#737a70]">Homologação e Selo Branco</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#dcd9cc] pt-4">
          <button onClick={()=>window.print()} className={primaryClass}><Printer size={15}/> Imprimir Termo de Responsabilidade</button>
          <button onClick={onClose} className={secondaryClass}>Fechar</button>
        </div>
      </div>
    </div>
  </div>;
}

export function PublicVehicleRegistryPage(){
  const [vehicles,setVehicles]=useSaved('state-fleet',seedPublicVehicles);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<PublicVehicle|null>(null);
  const [viewingTerm,setViewingTerm]=useState<PublicVehicle|null>(null);
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [search,setSearch]=useState('');
  const [institutionFilter,setInstitutionFilter]=useState('');
  const [statusFilter,setStatusFilter]=useState('');

  const institutions=useMemo(()=>Array.from(new Set(vehicles.map(v=>v.institutionAcronym||v.institution))),[vehicles]);

  const filtered=useMemo(()=>vehicles.filter(v=>{
    const matchSearch=[v.plate,v.make,v.model,v.institution,v.institutionAcronym||'',v.responsibleOfficer||'',v.category].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchInst=!institutionFilter||(v.institutionAcronym===institutionFilter||v.institution===institutionFilter);
    const matchStatus=!statusFilter||v.status===statusFilter;
    return matchSearch&&matchInst&&matchStatus;
  }),[vehicles,search,institutionFilter,statusFilter]);

  const totalKm=vehicles.reduce((sum,v)=>sum+(v.currentMileage||0),0);

  async function submitVehicle(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const plate=String(f.get('plate')||'').toUpperCase().trim();
    const payload:PublicVehicle={
      id:editing?editing.id:`VP-${String(Date.now()).slice(-4)}`,
      plate,
      make:String(f.get('make')||'').trim(),
      model:String(f.get('model')||'').trim(),
      year:Number(f.get('year')||2023),
      color:String(f.get('color')||'Branco').trim()||'Branco',
      category:String(f.get('category')||'Veículo de Serviço').trim(),
      institution:String(f.get('institution')||'Ministério dos Transportes e Comunicações').trim(),
      institutionAcronym:String(f.get('institutionAcronym')||'MTC').trim().toUpperCase(),
      department:String(f.get('department')||'').trim(),
      responsibleOfficer:String(f.get('responsibleOfficer')||'').trim(),
      officerRole:String(f.get('officerRole')||'').trim(),
      officerContact:String(f.get('officerContact')||'').trim(),
      currentMileage:Number(f.get('currentMileage')||0),
      tankCapacity:Number(f.get('tankCapacity')||80),
      fuelType:String(f.get('fuelType')||'Gasóleo'),
      status:String(f.get('status')||'Ativo'),
      chassisNumber:String(f.get('chassisNumber')||'').trim(),
      assignmentDate:String(f.get('assignmentDate')||new Date().toISOString().slice(0,10)),
      notes:String(f.get('notes')||'').trim(),
    };

    try{
      setError('');setSuccessMsg('');
      if(editing){
        const res=await api.put<PublicVehicle>(`/public-vehicles/${encodeURIComponent(editing.id)}`,payload);
        setVehicles(rows=>rows.map(v=>v.id===editing.id?res.data:v));
        setSuccessMsg(`Viatura pública ${payload.plate} atualizada com sucesso.`);
      }else{
        const res=await api.post<PublicVehicle>('/public-vehicles',payload);
        setVehicles([res.data,...vehicles]);
        setSuccessMsg(`Viatura pública ${payload.plate} registada com sucesso.`);
      }
      formEl.reset();
      setEditing(null);
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Não foi possível salvar a viatura pública.');
    }
  }

  async function handleDelete(id:string,plate:string){
    if(!window.confirm(`Deseja realmente remover a viatura ${plate} do património do Estado?`))return;
    try{
      await api.delete(`/public-vehicles/${encodeURIComponent(id)}`);
    }catch{/* ignore */}
    setVehicles(rows=>rows.filter(v=>v.id!==id));
  }

  return <Shell>
    <Title eyebrow="Gestão da frota do Estado · Submenu 1" title="Cadastro de veículos públicos" description="Inventário centralizado das viaturas oficiais do Estado da Guiné-Bissau, afetação institucional, características técnicas e estado operacional." icon={Building2}/>
    <StateFleetSubmenuBar/>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Frota Pública Total" value={String(vehicles.length)} detail="Viaturas matriculadas" icon={CarFront}/>
      <Stat label="Em Serviço Ativo" value={String(vehicles.filter(v=>v.status==='Ativo').length)} detail="Operacionais" icon={ShieldCheck}/>
      <Stat label="Em Manutenção" value={String(vehicles.filter(v=>v.status==='Em Manutenção').length)} detail="Oficina oficial" icon={Wrench}/>
      <Stat label="Quilometragem Global" value={`${totalKm.toLocaleString('pt-PT')} km`} detail="Distância acumulada" icon={Gauge}/>
    </div>

    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <label className="flex min-w-[240px] flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3">
          <Search size={16} className="text-[#737a70]"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por matrícula, ministério, oficial ou modelo" className="w-full py-2 text-sm outline-none"/>
        </label>
        <select value={institutionFilter} onChange={e=>setInstitutionFilter(e.target.value)} className={`w-auto ${inputClass}`}>
          <option value="">Todas as Instituições</option>
          {institutions.map(inst=><option key={inst} value={inst}>{inst}</option>)}
        </select>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className={`w-auto ${inputClass}`}>
          <option value="">Todos os Estados</option>
          <option value="Ativo">Ativo</option>
          <option value="Em Manutenção">Em Manutenção</option>
          <option value="Inativo">Inativo</option>
          <option value="Abatido">Abatido</option>
        </select>
      </div>
      <button onClick={()=>{setEditing(null);setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Novo Registo de Veículo Público'}</button>
    </div>

    {open&&<Drawer title={editing?`Editar Viatura Pública · ${editing.plate}`:'Registar Veículo do Estado'} onClose={()=>{setOpen(false);setEditing(null);}}>
      <form key={editing?.id||'new'} onSubmit={submitVehicle} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549]">Matrícula Oficial
          <input className={`mt-1.5 ${inputClass}`} type="text" name="plate" required defaultValue={editing?.plate||'GB-GOV-'} placeholder="GB-GOV-0123"/>
        </label>
        <Field label="Marca" name="make" defaultValue={editing?.make||'Toyota'}/>
        <Field label="Modelo" name="model" defaultValue={editing?.model||'Land Cruiser'}/>
        <Field label="Ano de Fabrico" name="year" type="number" defaultValue={String(editing?.year||2023)}/>
        <Field label="Cor" name="color" defaultValue={editing?.color||'Branco'}/>
        <Field label="Categoria da Viatura" name="category" defaultValue={editing?.category||'Veículo de Representação / Todo-o-Terreno'}/>
        <Field label="Ministério / Instituição Titular" name="institution" defaultValue={editing?.institution||'Ministério dos Transportes e Comunicações'}/>
        <Field label="Sigla Institucional" name="institutionAcronym" defaultValue={editing?.institutionAcronym||'MTC'} placeholder="Ex.: MTC, MINSAP, MEF"/>
        <Field label="Direção / Gabinete / Serviço" name="department" defaultValue={editing?.department||'Gabinete do Ministro'}/>
        <Field label="Funcionário / Titular Responsável" name="responsibleOfficer" defaultValue={editing?.responsibleOfficer||''}/>
        <Field label="Cargo / Função Oficial" name="officerRole" defaultValue={editing?.officerRole||''}/>
        <Field label="Contacto Telefónico" name="officerContact" defaultValue={editing?.officerContact||'+245 955 '}/>
        <Field label="Quilometragem Atual (km)" name="currentMileage" type="number" defaultValue={String(editing?.currentMileage||0)}/>
        <Field label="Capacidade do Depósito (Litros)" name="tankCapacity" type="number" defaultValue={String(editing?.tankCapacity||80)}/>
        <label className="block text-xs font-semibold text-[#4b5549]">Tipo de Combustível
          <select name="fuelType" defaultValue={editing?.fuelType||'Gasóleo'} className={`mt-1.5 ${inputClass}`}>
            <option value="Gasóleo">Gasóleo (Diesel)</option>
            <option value="Gasolina">Gasolina Super</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Estado Operacional
          <select name="status" defaultValue={editing?.status||'Ativo'} className={`mt-1.5 ${inputClass}`}>
            <option value="Ativo">Ativo (Em Circulação)</option>
            <option value="Em Manutenção">Em Manutenção (Oficina)</option>
            <option value="Inativo">Inativo (Reserva de Frota)</option>
            <option value="Abatido">Abatido (Fim de Vida Útil)</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <Field label="Número de Chassi / VIN" name="chassisNumber" defaultValue={editing?.chassisNumber||''}/>
        </div>
        <Field label="Data de Afetação ao Estado" name="assignmentDate" type="date" defaultValue={editing?.assignmentDate||new Date().toISOString().slice(0,10)}/>
        <div className="sm:col-span-2">
          <Field label="Observações e Histórico de Cedência" name="notes" defaultValue={editing?.notes||''}/>
        </div>
        <div className="sm:col-span-2 flex items-end gap-2 pt-2">
          <button className={primaryClass}>{editing?'Guardar Alterações':'Cadastrar Viatura Pública'}</button>
          {editing&&<button type="button" onClick={()=>{setEditing(null);window.dispatchEvent(new Event('sigetran:drawer-close'));}} className={secondaryClass}>Cancelar</button>}
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    {viewingTerm&&<FleetResponsibilityTermModal vehicle={viewingTerm} onClose={()=>setViewingTerm(null)}/>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Matrícula','Veículo & Cor','Ministério / Sigla','Direção / Gabinete','Responsável & Cargo','Quilometragem','Combustível','Estado','Ações'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(v=><tr key={v.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono font-bold text-[#006B35] whitespace-nowrap">{v.plate}</td>
            <td className="px-3 py-3 whitespace-nowrap">
              <span className="font-semibold">{v.make} {v.model}</span>
              <span className="block text-[11px] text-[#737a70]">{v.year} · {v.color||'Branco'} · {v.category}</span>
            </td>
            <td className="px-3 py-3">
              <span className="font-semibold">{v.institutionAcronym||'GOV'}</span>
              <span className="block text-[11px] text-[#737a70] truncate max-w-xs">{v.institution}</span>
            </td>
            <td className="px-3 py-3 text-xs">{v.department||'Serviços Gerais'}</td>
            <td className="px-3 py-3 whitespace-nowrap">
              <span className="font-semibold">{v.responsibleOfficer||'Não designado'}</span>
              <span className="block text-[11px] text-[#737a70]">{v.officerRole||'—'}</span>
            </td>
            <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{(v.currentMileage||0).toLocaleString('pt-PT')} km</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{v.fuelType||'Gasóleo'} <span className="text-[#737a70]">({v.tankCapacity||80}L)</span></td>
            <td className="px-3 py-3 whitespace-nowrap"><Status value={v.status}/></td>
            <td className="px-3 py-3 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <button type="button" onClick={()=>setViewingTerm(v)} title="Ver Termo de Responsabilidade" className="text-xs font-semibold text-[#006B35] hover:underline">Termo</button>
                <span className="text-[#d5d1c2]">|</span>
                <button type="button" onClick={()=>{setEditing(v);setOpen(true);}} className="text-xs font-semibold text-[#006B35] hover:underline">Editar</button>
                <span className="text-[#d5d1c2]">|</span>
                <button type="button" onClick={()=>handleDelete(v.id,v.plate)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Remover</button>
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>
      {filtered.length===0&&<div className="py-8 text-center text-sm text-[#737a70]">Nenhuma viatura pública encontrada para os critérios selecionados.</div>}
    </div>
  </Shell>;
}

export function FleetInstitutionsPage(){
  const [vehicles,setVehicles]=useSaved('state-fleet',seedPublicVehicles);
  const [selectedAcronym,setSelectedAcronym]=useState<string>('');
  const [openTransfer,setOpenTransfer]=useState(false);
  const [transferVehicleId,setTransferVehicleId]=useState('');
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');

  const institutionGroups=useMemo(()=>{
    const map = new Map<string,{acronym:string;name:string;count:number;active:number;inRepair:number;totalKm:number;vehicles:PublicVehicle[]}>();
    for(const v of vehicles){
      const acr = v.institutionAcronym||'GOV';
      if(!map.has(acr)){
        map.set(acr,{acronym:acr,name:v.institution,count:0,active:0,inRepair:0,totalKm:0,vehicles:[]});
      }
      const entry = map.get(acr)!;
      entry.count+=1;
      if(v.status==='Ativo') entry.active+=1;
      if(v.status==='Em Manutenção') entry.inRepair+=1;
      entry.totalKm+=(v.currentMileage||0);
      entry.vehicles.push(v);
    }
    return Array.from(map.values()).sort((a,b)=>b.count-a.count);
  },[vehicles]);

  const displayedVehicles=useMemo(()=>{
    if(!selectedAcronym) return vehicles;
    return vehicles.filter(v=>(v.institutionAcronym||'GOV')===selectedAcronym);
  },[vehicles,selectedAcronym]);

  async function handleTransfer(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    const target=vehicles.find(v=>v.id===transferVehicleId);
    if(!target)return;

    const payload:PublicVehicle={
      ...target,
      institution:String(f.get('institution')).trim(),
      institutionAcronym:String(f.get('institutionAcronym')).trim().toUpperCase(),
      department:String(f.get('department')).trim(),
      responsibleOfficer:String(f.get('responsibleOfficer')).trim(),
      officerRole:String(f.get('officerRole')).trim(),
      officerContact:String(f.get('officerContact')).trim(),
      assignmentDate:new Date().toISOString().slice(0,10),
      notes:`Reafetado ao abrigo do despacho ministerial: ${String(f.get('dispatchReason')).trim()}`,
    };

    try{
      setError('');setSuccessMsg('');
      const res=await api.put<PublicVehicle>(`/public-vehicles/${encodeURIComponent(target.id)}`,payload);
      setVehicles(rows=>rows.map(v=>v.id===target.id?res.data:v));
      setSuccessMsg(`Viatura ${target.plate} reafetada com sucesso para ${payload.institutionAcronym}.`);
      setOpenTransfer(false);
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao reafetar a viatura institucional.');
    }
  }

  return <Shell>
    <Title eyebrow="Gestão da frota do Estado · Submenu 2" title="Ministério ou instituição responsável" description="Mapeamento e distribuição da frota móvel por ministérios, órgãos de soberania e serviços públicos governamentais." icon={Building2}/>
    <StateFleetSubmenuBar/>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Instituições Titulares" value={String(institutionGroups.length)} detail="Ministérios e secretarias" icon={Building2}/>
      <Stat label="Maior Alocação" value={institutionGroups[0]?.acronym||'—'} detail={`${institutionGroups[0]?.count||0} viaturas afetas`} icon={CarFront}/>
      <Stat label="Viaturas em Serviço" value={String(vehicles.filter(v=>v.status==='Ativo').length)} detail="Total operacional" icon={ShieldCheck}/>
      <Stat label="Quilometragem Total" value={`${vehicles.reduce((s,v)=>s+(v.currentMileage||0),0).toLocaleString('pt-PT')} km`} detail="Toda a administração" icon={Gauge}/>
    </div>

    <div className="mb-4 flex justify-between items-center">
      <h2 className="font-serif text-lg font-bold text-[#1c3024]">Distribuição Ministerial da Frota</h2>
      <button onClick={()=>{setTransferVehicleId(vehicles[0]?.id||'');setOpenTransfer(true);setError('');}} className={primaryClass}>
        <ArrowRight size={16}/> Reafetar Viatura a Outro Ministério
      </button>
    </div>

    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {institutionGroups.map(grp=>{
        const isSelected=selectedAcronym===grp.acronym;
        return <div key={grp.acronym} onClick={()=>setSelectedAcronym(isSelected?'':grp.acronym)} className={`cursor-pointer border p-5 transition bg-white ${isSelected?'border-2 border-[#009E49] shadow-md':'border-[#dcd9cc] hover:border-[#009E49]/60'}`}>
          <div className="flex items-start justify-between">
            <span className="inline-block border border-[#173d2b] bg-[#173d2b] px-2 py-0.5 font-mono text-xs font-bold text-[#FCD116]">{grp.acronym}</span>
            <span className="font-serif text-xl font-bold text-[#173d2b]">{grp.count} {grp.count===1?'viatura':'viaturas'}</span>
          </div>
          <h3 className="mt-3 font-serif font-bold text-sm text-[#1c3024]">{grp.name}</h3>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#f0eee7] pt-3 text-xs text-[#737a70]">
            <div>Em Serviço: <b className="text-[#006B35]">{grp.active}</b></div>
            <div>Oficina: <b className="text-[#CE1126]">{grp.inRepair}</b></div>
            <div className="col-span-2">Distância acumulada: <b>{grp.totalKm.toLocaleString('pt-PT')} km</b></div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {grp.vehicles.map(v=><span key={v.plate} className="border border-[#d5d1c2] bg-[#f8f7f2] px-1.5 py-0.5 text-[10px] font-mono font-semibold">{v.plate}</span>)}
          </div>
          <div className="mt-3 text-right">
            <span className="text-[11px] font-bold text-[#006B35]">{isSelected?'Exibindo viaturas deste ministério ▾':'Clique para filtrar este ministério →'}</span>
          </div>
        </div>;
      })}
    </div>

    {openTransfer&&<Drawer title="Reafetação Institucional de Viatura do Estado" onClose={()=>setOpenTransfer(false)}>
      <form onSubmit={handleTransfer} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Viatura a Reafetar
          <select value={transferVehicleId} onChange={e=>setTransferVehicleId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {vehicles.map(v=><option key={v.id} value={v.id}>{v.plate} · {v.make} {v.model} ({v.institutionAcronym||v.institution})</option>)}
          </select>
        </label>
        <div className="sm:col-span-2">
          <Field label="Novo Ministério ou Instituição Titular" name="institution" defaultValue="Ministério da Saúde Pública"/>
        </div>
        <Field label="Nova Sigla Institucional" name="institutionAcronym" defaultValue="MINSAP"/>
        <Field label="Nova Direção / Departamento" name="department" defaultValue="Direção Geral"/>
        <Field label="Novo Funcionário / Oficial Responsável" name="responsibleOfficer" defaultValue="Dr. Malam Embaló"/>
        <Field label="Cargo / Função do Novo Titular" name="officerRole" defaultValue="Diretor de Gabinete"/>
        <Field label="Contacto do Novo Titular" name="officerContact" defaultValue="+245 955 330 110"/>
        <div className="sm:col-span-2">
          <Field label="Fundamento Legal e N.º do Despacho de Transferência" name="dispatchReason" defaultValue="Despacho n.º 44/GPM/2026 · Transferência por necessidade imperiosa de serviço"/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Efetivar Reafetação e Emitir Novo Termo</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <div className="flex justify-between items-center mb-3 border-b border-[#e9e6dc] pb-2">
        <h3 className="font-serif text-base font-bold text-[#1c3024]">
          {selectedAcronym?`Viaturas Afetas ao ${selectedAcronym} (${displayedVehicles.length})`:`Todas as Viaturas por Ministério (${displayedVehicles.length})`}
        </h3>
        {selectedAcronym&&<button onClick={()=>setSelectedAcronym('')} className="text-xs font-semibold text-[#006B35] underline">Ver todos os ministérios</button>}
      </div>
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Matrícula','Veículo','Ministério Titular','Departamento / Serviço','Oficial Responsável','Quilometragem','Estado'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {displayedVehicles.map(v=><tr key={v.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono font-bold text-[#006B35] whitespace-nowrap">{v.plate}</td>
            <td className="px-3 py-3 whitespace-nowrap">{v.make} {v.model} ({v.year})</td>
            <td className="px-3 py-3 font-semibold">{v.institution} ({v.institutionAcronym||'GOV'})</td>
            <td className="px-3 py-3 text-xs">{v.department||'Serviços Gerais'}</td>
            <td className="px-3 py-3 text-xs">{v.responsibleOfficer||'Não designado'}</td>
            <td className="px-3 py-3 font-mono text-xs">{(v.currentMileage||0).toLocaleString('pt-PT')} km</td>
            <td className="px-3 py-3"><Status value={v.status}/></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function FleetOfficersPage(){
  const [vehicles,setVehicles]=useSaved('state-fleet',seedPublicVehicles);
  const [viewingTerm,setViewingTerm]=useState<PublicVehicle|null>(null);
  const [editingVehicle,setEditingVehicle]=useState<PublicVehicle|null>(null);
  const [open,setOpen]=useState(false);
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [search,setSearch]=useState('');

  const officersList=useMemo(()=>vehicles.filter(v=>Boolean(v.responsibleOfficer)),[vehicles]);

  const filtered=useMemo(()=>officersList.filter(v=>{
    return [v.responsibleOfficer,v.officerRole,v.officerContact,v.institution,v.plate].join(' ').toLowerCase().includes(search.toLowerCase());
  }),[officersList,search]);

  async function handleUpdateOfficer(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!editingVehicle)return;
    const f=new FormData(e.currentTarget);
    const payload:PublicVehicle={
      ...editingVehicle,
      responsibleOfficer:String(f.get('responsibleOfficer')).trim(),
      officerRole:String(f.get('officerRole')).trim(),
      officerContact:String(f.get('officerContact')).trim(),
      department:String(f.get('department')).trim(),
      assignmentDate:String(f.get('assignmentDate')||new Date().toISOString().slice(0,10)),
    };
    try{
      setError('');setSuccessMsg('');
      const res=await api.put<PublicVehicle>(`/public-vehicles/${encodeURIComponent(editingVehicle.id)}`,payload);
      setVehicles(rows=>rows.map(v=>v.id===editingVehicle.id?res.data:v));
      setSuccessMsg(`Titular responsável da viatura ${editingVehicle.plate} atualizado com sucesso.`);
      setEditingVehicle(null);
      setOpen(false);
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao atualizar responsável da viatura.');
    }
  }

  return <Shell>
    <Title eyebrow="Gestão da frota do Estado · Submenu 3" title="Funcionário responsável pelo veículo" description="Registo individual dos agentes públicos, diretores, motoristas oficiais e termos de responsabilidade e guarda da viatura." icon={Users}/>
    <StateFleetSubmenuBar/>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <Stat label="Oficiais Responsáveis" value={String(officersList.length)} detail="Servidores com viatura" icon={Users}/>
      <Stat label="Termos Ativos e Válidos" value={String(officersList.length)} detail="Conformidade patrimonial" icon={ShieldCheck}/>
      <Stat label="Ministérios Vinculados" value={String(new Set(vehicles.map(v=>v.institutionAcronym)).size)} detail="Cobertura governamental" icon={Building2}/>
    </div>

    <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
      <label className="flex max-w-md flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3">
        <Search size={16} className="text-[#737a70]"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por oficial, cargo, contacto ou matrícula" className="w-full py-2 text-sm outline-none"/>
      </label>
    </div>

    {viewingTerm&&<FleetResponsibilityTermModal vehicle={viewingTerm} onClose={()=>setViewingTerm(null)}/>}

    {open&&editingVehicle&&<Drawer title={`Atualizar Titular da Viatura · ${editingVehicle.plate}`} onClose={()=>{setOpen(false);setEditingVehicle(null);}}>
      <form onSubmit={handleUpdateOfficer} className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome do Funcionário Responsável" name="responsibleOfficer" defaultValue={editingVehicle.responsibleOfficer||''}/>
        <Field label="Cargo / Função Oficial" name="officerRole" defaultValue={editingVehicle.officerRole||''}/>
        <Field label="Contacto Telefónico" name="officerContact" defaultValue={editingVehicle.officerContact||''}/>
        <Field label="Direção / Gabinete" name="department" defaultValue={editingVehicle.department||''}/>
        <Field label="Data do Termo de Afetação" name="assignmentDate" type="date" defaultValue={editingVehicle.assignmentDate||new Date().toISOString().slice(0,10)}/>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Guardar e Renovar Termo de Responsabilidade</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['Funcionário Responsável','Cargo / Função','Contacto','Ministério & Direção','Viatura Afeta','Data de Afetação','Termo Oficial','Ações'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(v=><tr key={v.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-semibold text-[#1c3024] whitespace-nowrap">{v.responsibleOfficer}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{v.officerRole||'Titular de Cargo Público'}</td>
            <td className="px-3 py-3 text-xs font-mono whitespace-nowrap">{v.officerContact||'—'}</td>
            <td className="px-3 py-3 whitespace-nowrap">
              <span className="font-semibold">{v.institutionAcronym||'GOV'}</span>
              <span className="block text-[11px] text-[#737a70]">{v.department||'Serviços Gerais'}</span>
            </td>
            <td className="px-3 py-3 whitespace-nowrap">
              <span className="font-mono font-bold text-[#006B35]">{v.plate}</span>
              <span className="block text-[11px] text-[#737a70]">{v.make} {v.model} ({v.year})</span>
            </td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{v.assignmentDate||'—'}</td>
            <td className="px-3 py-3 whitespace-nowrap"><Status value="Assinado / Válido"/></td>
            <td className="px-3 py-3 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <button type="button" onClick={()=>setViewingTerm(v)} className="text-xs font-semibold text-[#006B35] hover:underline">Ver Termo</button>
                <span className="text-[#d5d1c2]">|</span>
                <button type="button" onClick={()=>{setEditingVehicle(v);setOpen(true);}} className="text-xs font-semibold text-[#737a70] hover:underline">Atualizar</button>
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function FleetMissionsHistoryPage(){
  const [vehicles]=useSaved('state-fleet',seedPublicVehicles);
  const [missions,setMissions]=useSaved('fleet-missions',seedFleetMissions);
  const [open,setOpen]=useState(false);
  const [selectedPlate,setSelectedPlate]=useState(vehicles[0]?.plate||'GB-GOV-0101');
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [search,setSearch]=useState('');
  const [statusFilter,setStatusFilter]=useState('');

  const filtered=useMemo(()=>missions.filter(m=>{
    const matchSearch=[m.id,m.plate,m.officerName,m.missionPurpose,m.origin,m.destination,m.institution].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus=!statusFilter||m.status===statusFilter;
    return matchSearch&&matchStatus;
  }),[missions,search,statusFilter]);

  const totalKm=missions.reduce((s,m)=>s+(m.totalKm||0),0);
  const ongoing=missions.filter(m=>m.status==='Em Curso').length;

  async function submitMission(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const plate=String(f.get('plate')||selectedPlate).toUpperCase().trim();
    const veh=vehicles.find(v=>v.plate===plate);
    const depKm=Number(f.get('departureKm')||veh?.currentMileage||0);
    const retKm=Number(f.get('returnKm')||depKm);
    const diffKm=Math.max(0,retKm-depKm);

    const payload:FleetMission={
      id:`MIS-2026-${String(Date.now()).slice(-4)}`,
      plate,
      institution:String(f.get('institution')||veh?.institution||'Ministério dos Transportes').trim(),
      officerName:String(f.get('officerName')||veh?.responsibleOfficer||'').trim(),
      officerBadge:String(f.get('officerBadge')||'').trim(),
      missionPurpose:String(f.get('missionPurpose')||'Deslocação em serviço oficial').trim(),
      origin:String(f.get('origin')||'Bissau').trim(),
      destination:String(f.get('destination')||'').trim(),
      departureDate:String(f.get('departureDate')||new Date().toISOString().slice(0,10)),
      departureTime:String(f.get('departureTime')||'08:00'),
      returnDate:String(f.get('returnDate')||''),
      returnTime:String(f.get('returnTime')||''),
      departureKm:depKm,
      returnKm:retKm,
      totalKm:diffKm,
      status:String(f.get('status')||'Em Curso'),
      notes:String(f.get('notes')||'Ordem de missão autorizada superiormente.').trim(),
    };

    try{
      setError('');setSuccessMsg('');
      const res=await api.post<FleetMission>('/fleet-missions',payload);
      setMissions([res.data,...missions]);
      setSuccessMsg(`Ordem de missão (${res.data.id}) expedida com sucesso para ${plate}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao registar a ordem de missão.');
    }
  }

  async function handleConclude(mission:FleetMission){
    const retKmStr=window.prompt(`Indique o odómetro de chegada (Km) para concluir a missão ${mission.id}:`,String(mission.departureKm+50));
    if(!retKmStr)return;
    const retKm=Number(retKmStr);
    const totalKm=Math.max(0,retKm-mission.departureKm);
    const payload={
      ...mission,
      returnKm:retKm,
      totalKm:totalKm,
      returnDate:new Date().toISOString().slice(0,10),
      returnTime:'18:00',
      status:'Concluída',
    };
    try{
      const res=await api.put<FleetMission>(`/fleet-missions/${encodeURIComponent(mission.id)}`,payload);
      setMissions(rows=>rows.map(m=>m.id===mission.id?res.data:m));
      setSuccessMsg(`Missão ${mission.id} concluída. Distância percorrida: ${totalKm} km.`);
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao concluir a missão.');
    }
  }

  return <Shell>
    <Title eyebrow="Gestão da frota do Estado · Submenu 4" title="Histórico de utilização" description="Registo e controlo de ordens de saída, guias de marcha oficiais, itinerários, condutores e quilómetros percorridos." icon={Gauge}/>
    <StateFleetSubmenuBar/>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Total de Missões" value={String(missions.length)} detail="Serviços expedidos" icon={ClipboardList}/>
      <Stat label="Missões em Curso" value={String(ongoing)} detail="Viaturas em trânsito" icon={Activity}/>
      <Stat label="Missões Concluídas" value={String(missions.filter(m=>m.status==='Concluída').length)} detail="Regressos registados" icon={Check}/>
      <Stat label="Distância em Serviço" value={`${totalKm.toLocaleString('pt-PT')} km`} detail="Total percorrido" icon={Gauge}/>
    </div>

    <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <label className="flex min-w-[240px] flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3">
          <Search size={16} className="text-[#737a70]"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por missão, matrícula, condutor ou destino" className="w-full py-2 text-sm outline-none"/>
        </label>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className={`w-auto ${inputClass}`}>
          <option value="">Todos os Estados</option>
          <option value="Em Curso">Em Curso</option>
          <option value="Concluída">Concluída</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Registar Ordem de Saída / Missão'}</button>
    </div>

    {open&&<Drawer title="Emissão de Ordem de Saída / Guia de Marcha" onClose={()=>setOpen(false)}>
      <form onSubmit={submitMission} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Viatura Oficial
          <select name="plate" value={selectedPlate} onChange={e=>setSelectedPlate(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {vehicles.map(v=><option key={v.id} value={v.plate}>{v.plate} · {v.make} {v.model} ({v.institutionAcronym||'GOV'}) — {v.responsibleOfficer}</option>)}
          </select>
        </label>
        <Field label="Ministério Responsável" name="institution" defaultValue={vehicles.find(v=>v.plate===selectedPlate)?.institution||'Ministério dos Transportes'}/>
        <Field label="Funcionário / Condutor da Missão" name="officerName" defaultValue={vehicles.find(v=>v.plate===selectedPlate)?.responsibleOfficer||''}/>
        <Field label="Credencial / N.º de Matrícula do Condutor" name="officerBadge" defaultValue="MTC-COND-01"/>
        <div className="sm:col-span-2">
          <Field label="Finalidade / Objetivo da Missão Oficial" name="missionPurpose" defaultValue="Vistoria técnica às infraestruturas de transportes"/>
        </div>
        <Field label="Local de Partida (Origem)" name="origin" defaultValue="Bissau (Sede)"/>
        <Field label="Local de Destino" name="destination" defaultValue="Bafatá / Gabú"/>
        <Field label="Data de Saída" name="departureDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Hora de Saída" name="departureTime" defaultValue="08:30"/>
        <Field label="Data Prevista de Retorno" name="returnDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Hora Prevista de Retorno" name="returnTime" defaultValue="18:00"/>
        <Field label="Odómetro de Partida (Km)" name="departureKm" type="number" defaultValue={String(vehicles.find(v=>v.plate===selectedPlate)?.currentMileage||0)}/>
        <Field label="Odómetro de Retorno (se concluída)" name="returnKm" type="number" defaultValue={String((vehicles.find(v=>v.plate===selectedPlate)?.currentMileage||0)+80)}/>
        <label className="block text-xs font-semibold text-[#4b5549]">Estado da Ordem
          <select name="status" className={`mt-1.5 ${inputClass}`}>
            <option value="Em Curso">Em Curso (Em Trânsito)</option>
            <option value="Concluída">Concluída</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <Field label="Observações e Despacho de Autorização" name="notes" defaultValue="Autorizado pelo Gabinete do Secretário-Geral."/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Emitir Guia de Marcha Oficial</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º Missão','Viatura','Ministério / Condutor','Finalidade do Serviço','Itinerário','Partida / Chegada','Km Partida / Fim','Distância','Estado','Ações'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(m=><tr key={m.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold whitespace-nowrap">{m.id}</td>
            <td className="px-3 py-3 font-mono font-bold text-[#006B35] whitespace-nowrap">{m.plate}</td>
            <td className="px-3 py-3 whitespace-nowrap">
              <span className="font-semibold">{m.officerName}</span>
              <span className="block text-[11px] text-[#737a70] truncate max-w-xs">{m.institution}</span>
            </td>
            <td className="px-3 py-3 text-xs max-w-xs">{m.missionPurpose}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap"><span className="text-[#173d2b] font-semibold">{m.origin}</span> → <b>{m.destination}</b></td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">
              <div>{m.departureDate} <span className="text-[#737a70]">{m.departureTime}</span></div>
              {m.returnDate&&<div className="text-[#737a70]">{m.returnDate} {m.returnTime}</div>}
            </td>
            <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{m.departureKm.toLocaleString('pt-PT')} / {m.returnKm?m.returnKm.toLocaleString('pt-PT'):'—'} km</td>
            <td className="px-3 py-3 font-mono font-bold text-xs whitespace-nowrap">{m.totalKm>0?`${m.totalKm.toLocaleString('pt-PT')} km`:'—'}</td>
            <td className="px-3 py-3 whitespace-nowrap"><Status value={m.status}/></td>
            <td className="px-3 py-3 whitespace-nowrap">
              {m.status==='Em Curso'?<button type="button" onClick={()=>handleConclude(m)} className="text-xs font-semibold text-[#006B35] hover:underline">Concluir Missão</button>:<span className="text-xs text-[#737a70]">Arquivado</span>}
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function FleetFuelPage(){
  const [vehicles]=useSaved('state-fleet',seedPublicVehicles);
  const [fuelLogs,setFuelLogs]=useSaved('fleet-fuel',seedFleetFuelLogs);
  const [open,setOpen]=useState(false);
  const [selectedPlate,setSelectedPlate]=useState(vehicles[0]?.plate||'GB-GOV-0101');
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [search,setSearch]=useState('');

  const filtered=useMemo(()=>fuelLogs.filter(f=>{
    return [f.id,f.plate,f.driverName,f.station,f.institution,f.voucherNumber||''].join(' ').toLowerCase().includes(search.toLowerCase());
  }),[fuelLogs,search]);

  const totalLiters=fuelLogs.reduce((s,f)=>s+f.liters,0);
  const totalAmount=fuelLogs.reduce((s,f)=>s+f.totalAmount,0);
  const avgPrice=totalLiters>0?Math.round(totalAmount/totalLiters):850;

  async function submitFuelLog(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const plate=String(f.get('plate')||selectedPlate).toUpperCase().trim();
    const veh=vehicles.find(v=>v.plate===plate);
    const liters=Number(f.get('liters')||50);
    const unitPrice=Number(f.get('unitPrice')||850);
    const totalAmount=liters*unitPrice;

    const payload:FleetFuelLog={
      id:`ABAS-2026-${String(Date.now()).slice(-4)}`,
      plate,
      institution:String(f.get('institution')||veh?.institution||'Ministério dos Transportes').trim(),
      driverName:String(f.get('driverName')||veh?.responsibleOfficer||'').trim(),
      date:String(f.get('date')||new Date().toISOString().slice(0,10)),
      station:String(f.get('station')||'Galp Aeroporto Bissau').trim(),
      fuelType:String(f.get('fuelType')||'Gasóleo'),
      liters,
      unitPrice,
      totalAmount,
      mileageAtFuel:Number(f.get('mileageAtFuel')||veh?.currentMileage||0),
      voucherNumber:String(f.get('voucherNumber')||`VOUCH-${String(Date.now()).slice(-6)}`).trim(),
    };

    try{
      setError('');setSuccessMsg('');
      const res=await api.post<FleetFuelLog>('/fleet-fuel',payload);
      setFuelLogs([res.data,...fuelLogs]);
      setSuccessMsg(`Abastecimento de ${liters}L (${currency(totalAmount)}) registado para ${plate}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao registar o abastecimento.');
    }
  }

  async function handleDelete(id:string){
    if(!window.confirm('Deseja realmente remover este registo de abastecimento?'))return;
    try{
      await api.delete(`/fleet-fuel/${encodeURIComponent(id)}`);
    }catch{/* ignore */}
    setFuelLogs(rows=>rows.filter(f=>f.id!==id));
  }

  return <Shell>
    <Title eyebrow="Gestão da frota do Estado · Submenu 5" title="Consumo de combustível" description="Controlo de requisições de abastecimento, postos credenciados, consumo médio por viatura pública e conferência de vales." icon={Fuel}/>
    <StateFleetSubmenuBar/>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Total Combustível" value={`${totalLiters.toLocaleString('pt-PT')} L`} detail="Litros abastecidos" icon={Fuel}/>
      <Stat label="Despesa em Combustível" value={currency(totalAmount)} detail="Valor global faturado" icon={Coins}/>
      <Stat label="Preço Médio / Litro" value={`${avgPrice} XOF`} detail="Tarifa de referência" icon={Banknote}/>
      <Stat label="Vales / Requisitórios" value={String(fuelLogs.length)} detail="Lançamentos registados" icon={FileText}/>
    </div>

    <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
      <label className="flex max-w-md flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3">
        <Search size={16} className="text-[#737a70]"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por vale, matrícula, motorista, posto ou ministério" className="w-full py-2 text-sm outline-none"/>
      </label>
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Lançar Requisitório de Combustível'}</button>
    </div>

    {open&&<Drawer title="Lançamento de Requisitório / Abastecimento" onClose={()=>setOpen(false)}>
      <form onSubmit={submitFuelLog} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Viatura Pública
          <select name="plate" value={selectedPlate} onChange={e=>setSelectedPlate(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {vehicles.map(v=><option key={v.id} value={v.plate}>{v.plate} · {v.make} {v.model} ({v.institutionAcronym||'GOV'})</option>)}
          </select>
        </label>
        <Field label="Ministério" name="institution" defaultValue={vehicles.find(v=>v.plate===selectedPlate)?.institution||'Ministério dos Transportes'}/>
        <Field label="Motorista / Funcionário Requisitante" name="driverName" defaultValue={vehicles.find(v=>v.plate===selectedPlate)?.responsibleOfficer||''}/>
        <Field label="Data do Abastecimento" name="date" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <label className="block text-xs font-semibold text-[#4b5549]">Posto Credenciado
          <select name="station" className={`mt-1.5 ${inputClass}`}>
            <option value="Galp Aeroporto Bissau">Galp Aeroporto Bissau</option>
            <option value="Total Bissau Centro">Total Bissau Centro</option>
            <option value="Star Oil Bafatá">Star Oil Bafatá</option>
            <option value="Shell Bissau Porto">Shell Bissau Porto</option>
            <option value="Petrobrás São Domingos">Petrobrás São Domingos</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Tipo de Combustível
          <select name="fuelType" defaultValue="Gasóleo" className={`mt-1.5 ${inputClass}`}>
            <option value="Gasóleo">Gasóleo (Diesel)</option>
            <option value="Gasolina">Gasolina Super</option>
          </select>
        </label>
        <Field label="Litros Abastecidos" name="liters" type="number" defaultValue="65"/>
        <Field label="Preço por Litro (XOF)" name="unitPrice" type="number" defaultValue="850"/>
        <Field label="Odómetro no Abastecimento (Km)" name="mileageAtFuel" type="number" defaultValue={String(vehicles.find(v=>v.plate===selectedPlate)?.currentMileage||0)}/>
        <Field label="N.º do Vale / Fatura" name="voucherNumber" defaultValue={`VOUCH-${vehicles.find(v=>v.plate===selectedPlate)?.institutionAcronym||'GOV'}-0${Math.floor(Math.random()*900+100)}`}/>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Confirmar e Registar Abastecimento</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º Vale','Data','Matrícula','Ministério & Condutor','Posto de Abastecimento','Combustível','Litros','Preço / L','Valor Total','Km no Abastecimento','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(f=><tr key={f.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold whitespace-nowrap">{f.voucherNumber||f.id}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{f.date}</td>
            <td className="px-3 py-3 font-mono font-bold text-[#006B35] whitespace-nowrap">{f.plate}</td>
            <td className="px-3 py-3 whitespace-nowrap">
              <span className="font-semibold">{f.driverName}</span>
              <span className="block text-[11px] text-[#737a70] truncate max-w-xs">{f.institution}</span>
            </td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{f.station}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{f.fuelType}</td>
            <td className="px-3 py-3 font-mono font-bold text-xs whitespace-nowrap">{f.liters} L</td>
            <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{f.unitPrice} XOF</td>
            <td className="px-3 py-3 font-mono font-bold text-sm text-[#173d2b] whitespace-nowrap">{currency(f.totalAmount)}</td>
            <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{(f.mileageAtFuel||0).toLocaleString('pt-PT')} km</td>
            <td className="px-3 py-3 whitespace-nowrap">
              <button type="button" onClick={()=>handleDelete(f.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Remover</button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function FleetMaintenancePage(){
  const [vehicles]=useSaved('state-fleet',seedPublicVehicles);
  const [maintenances,setMaintenances]=useSaved('fleet-maintenance',seedFleetMaintenances);
  const [open,setOpen]=useState(false);
  const [selectedPlate,setSelectedPlate]=useState(vehicles[0]?.plate||'GB-GOV-0101');
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [search,setSearch]=useState('');
  const [statusFilter,setStatusFilter]=useState('');

  const filtered=useMemo(()=>maintenances.filter(m=>{
    const matchSearch=[m.id,m.plate,m.maintenanceType,m.garage,m.serviceDescription,m.institution].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus=!statusFilter||m.status===statusFilter;
    return matchSearch&&matchStatus;
  }),[maintenances,search,statusFilter]);

  const totalCost=maintenances.reduce((s,m)=>s+m.totalCost,0);
  const inWorkshop=maintenances.filter(m=>m.status==='Em Andamento').length;

  async function submitMaintenance(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const plate=String(f.get('plate')||selectedPlate).toUpperCase().trim();
    const veh=vehicles.find(v=>v.plate===plate);
    const totalCost=Number(f.get('totalCost')||0);

    const payload:FleetMaintenance={
      id:`MAN-2026-${String(Date.now()).slice(-4)}`,
      plate,
      institution:String(f.get('institution')||veh?.institution||'Ministério dos Transportes').trim(),
      maintenanceType:String(f.get('maintenanceType')||'Revisão Periódica'),
      garage:String(f.get('garage')||'Garagem Oficial do Estado').trim(),
      entryDate:String(f.get('entryDate')||new Date().toISOString().slice(0,10)),
      completionDate:String(f.get('completionDate')||''),
      mileageAtService:Number(f.get('mileageAtService')||veh?.currentMileage||0),
      serviceDescription:String(f.get('serviceDescription')||'Revisão geral preventiva').trim(),
      partsReplaced:String(f.get('partsReplaced')||'').trim(),
      totalCost,
      status:String(f.get('status')||'Em Andamento'),
    };

    try{
      setError('');setSuccessMsg('');
      const res=await api.post<FleetMaintenance>('/fleet-maintenance',payload);
      setMaintenances([res.data,...maintenances]);
      setSuccessMsg(`Ordem de reparação (${res.data.id}) aberta com sucesso para ${plate}.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao registar ordem de manutenção.');
    }
  }

  async function handleCompleteOrder(m:FleetMaintenance){
    const payload={
      ...m,
      completionDate:new Date().toISOString().slice(0,10),
      status:'Concluída',
    };
    try{
      const res=await api.put<FleetMaintenance>(`/fleet-maintenance/${encodeURIComponent(m.id)}`,payload);
      setMaintenances(rows=>rows.map(item=>item.id===m.id?res.data:item));
      setSuccessMsg(`Ordem de reparação ${m.id} marcada como Concluída.`);
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao concluir ordem.');
    }
  }

  return <Shell>
    <Title eyebrow="Gestão da frota do Estado · Submenu 6" title="Manutenção e reparações" description="Acompanhamento de ordens de reparação, revisões programadas, oficinas credenciadas, peças aplicadas e custos mecânicos." icon={Wrench}/>
    <StateFleetSubmenuBar/>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <Stat label="Viaturas em Oficina" value={String(inWorkshop)} detail="Manutenção em andamento" icon={Wrench}/>
      <Stat label="Intervenções Concluídas" value={String(maintenances.filter(m=>m.status==='Concluída').length)} detail="Reparações finalizadas" icon={Check}/>
      <Stat label="Custo Global de Reparações" value={currency(totalCost)} detail="Orçamento de oficinas" icon={Coins}/>
    </div>

    <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <label className="flex min-w-[240px] flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3">
          <Search size={16} className="text-[#737a70]"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por ordem, matrícula, oficina ou peças" className="w-full py-2 text-sm outline-none"/>
        </label>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className={`w-auto ${inputClass}`}>
          <option value="">Todos os Estados</option>
          <option value="Em Andamento">Em Andamento</option>
          <option value="Concluída">Concluída</option>
          <option value="Agendada">Agendada</option>
        </select>
      </div>
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Abrir Ordem de Manutenção'}</button>
    </div>

    {open&&<Drawer title="Abertura de Ordem de Manutenção / Reparação" onClose={()=>setOpen(false)}>
      <form onSubmit={submitMaintenance} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Viatura Pública
          <select name="plate" value={selectedPlate} onChange={e=>setSelectedPlate(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {vehicles.map(v=><option key={v.id} value={v.plate}>{v.plate} · {v.make} {v.model} ({v.institutionAcronym||'GOV'})</option>)}
          </select>
        </label>
        <Field label="Ministério" name="institution" defaultValue={vehicles.find(v=>v.plate===selectedPlate)?.institution||'Ministério dos Transportes'}/>
        <label className="block text-xs font-semibold text-[#4b5549]">Tipo de Manutenção
          <select name="maintenanceType" className={`mt-1.5 ${inputClass}`}>
            <option value="Revisão Periódica">Revisão Periódica Programada</option>
            <option value="Manutenção Preventiva">Manutenção Preventiva</option>
            <option value="Manutenção Corretiva">Manutenção Corretiva</option>
            <option value="Reparação de Sinistro">Reparação de Sinistro</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Oficina / Garagem
          <select name="garage" className={`mt-1.5 ${inputClass}`}>
            <option value="Garagem Oficial do Estado">Garagem Oficial do Estado (Bissau)</option>
            <option value="Auto Mecânica Central Bissau">Auto Mecânica Central Bissau</option>
            <option value="Oficina Guineense de Motores">Oficina Guineense de Motores</option>
            <option value="Garagem Regional de Bafatá">Garagem Regional de Bafatá</option>
          </select>
        </label>
        <Field label="Data de Entrada na Oficina" name="entryDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Data Prevista de Conclusão" name="completionDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Quilometragem no Serviço (Km)" name="mileageAtService" type="number" defaultValue={String(vehicles.find(v=>v.plate===selectedPlate)?.currentMileage||0)}/>
        <Field label="Custo Estimado / Total (XOF)" name="totalCost" type="number" defaultValue="150000"/>
        <div className="sm:col-span-2">
          <Field label="Descrição dos Trabalhos Mecânicos Realizados" name="serviceDescription" defaultValue="Mudança de óleo 5W30, filtros de combustível/óleo e pastilhas de travão."/>
        </div>
        <div className="sm:col-span-2">
          <Field label="Peças e Materiais Aplicados" name="partsReplaced" defaultValue="Óleo de motor sintético (8L), Filtro de óleo genuíno, Pastilhas dianteiras"/>
        </div>
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Estado da Ordem
          <select name="status" className={`mt-1.5 ${inputClass}`}>
            <option value="Em Andamento">Em Andamento (Na Oficina)</option>
            <option value="Concluída">Concluída (Pronta para Levantamento)</option>
            <option value="Agendada">Agendada</option>
          </select>
        </label>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Registar Ordem de Serviço Mecânico</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º Ordem','Viatura','Ministério','Tipo de Manutenção','Garagem / Oficina','Entrada / Saída','Km Serviço','Serviço Mecânico & Peças','Custo Total','Estado','Ações'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(m=><tr key={m.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold whitespace-nowrap">{m.id}</td>
            <td className="px-3 py-3 font-mono font-bold text-[#006B35] whitespace-nowrap">{m.plate}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{m.institution}</td>
            <td className="px-3 py-3 whitespace-nowrap"><span className="border border-[#d5d1c2] bg-[#f8f7f2] px-2 py-0.5 text-xs font-medium">{m.maintenanceType}</span></td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{m.garage}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">
              <div>Entrada: {m.entryDate}</div>
              {m.completionDate&&<div className="text-[#737a70]">Conclusão: {m.completionDate}</div>}
            </td>
            <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{m.mileageAtService.toLocaleString('pt-PT')} km</td>
            <td className="px-3 py-3 text-xs max-w-xs">
              <div className="font-medium text-[#1c3024]">{m.serviceDescription}</div>
              {m.partsReplaced&&<div className="text-[#737a70] truncate text-[11px]">Peças: {m.partsReplaced}</div>}
            </td>
            <td className="px-3 py-3 font-mono font-bold text-sm text-[#173d2b] whitespace-nowrap">{currency(m.totalCost)}</td>
            <td className="px-3 py-3 whitespace-nowrap"><Status value={m.status}/></td>
            <td className="px-3 py-3 whitespace-nowrap">
              {m.status==='Em Andamento'?<button type="button" onClick={()=>handleCompleteOrder(m)} className="text-xs font-semibold text-[#006B35] hover:underline">Concluir</button>:<span className="text-xs text-[#737a70]">Finalizada</span>}
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function FleetExpensesControlPage(){
  const [vehicles]=useSaved('state-fleet',seedPublicVehicles);
  const [fuelLogs]=useSaved('fleet-fuel',seedFleetFuelLogs);
  const [maintenances]=useSaved('fleet-maintenance',seedFleetMaintenances);

  const fuelTotal=useMemo(()=>fuelLogs.reduce((s,f)=>s+f.totalAmount,0),[fuelLogs]);
  const maintenanceTotal=useMemo(()=>maintenances.reduce((s,m)=>s+m.totalCost,0),[maintenances]);
  const grandTotal=fuelTotal+maintenanceTotal;
  const avgCostPerVehicle=vehicles.length>0?Math.round(grandTotal/vehicles.length):0;

  const expensesByMinistry=useMemo(()=>{
    const map=new Map<string,{name:string;acronym:string;vehicleCount:number;fuelCost:number;fuelLiters:number;maintCost:number;totalCost:number}>();
    for(const v of vehicles){
      const acr=v.institutionAcronym||'GOV';
      if(!map.has(acr)){
        map.set(acr,{name:v.institution,acronym:acr,vehicleCount:0,fuelCost:0,fuelLiters:0,maintCost:0,totalCost:0});
      }
      map.get(acr)!.vehicleCount+=1;
    }
    for(const f of fuelLogs){
      const v=vehicles.find(item=>item.plate===f.plate);
      const acr=v?.institutionAcronym||'GOV';
      if(!map.has(acr)){
        map.set(acr,{name:f.institution,acronym:acr,vehicleCount:1,fuelCost:0,fuelLiters:0,maintCost:0,totalCost:0});
      }
      const entry=map.get(acr)!;
      entry.fuelCost+=f.totalAmount;
      entry.fuelLiters+=f.liters;
      entry.totalCost+=f.totalAmount;
    }
    for(const m of maintenances){
      const v=vehicles.find(item=>item.plate===m.plate);
      const acr=v?.institutionAcronym||'GOV';
      if(!map.has(acr)){
        map.set(acr,{name:m.institution,acronym:acr,vehicleCount:1,fuelCost:0,fuelLiters:0,maintCost:0,totalCost:0});
      }
      const entry=map.get(acr)!;
      entry.maintCost+=m.totalCost;
      entry.totalCost+=m.totalCost;
    }
    return Array.from(map.values()).sort((a,b)=>b.totalCost-a.totalCost);
  },[vehicles,fuelLogs,maintenances]);

  const expensesByVehicle=useMemo(()=>{
    return vehicles.map(v=>{
      const vFuel=fuelLogs.filter(f=>f.plate===v.plate);
      const vMaint=maintenances.filter(m=>m.plate===v.plate);
      const fCost=vFuel.reduce((s,f)=>s+f.totalAmount,0);
      const fLiters=vFuel.reduce((s,f)=>s+f.liters,0);
      const mCost=vMaint.reduce((s,m)=>s+m.totalCost,0);
      const total=fCost+mCost;
      const km=v.currentMileage||1;
      const costPerKm=total>0?Math.round(total/km):0;
      return {
        ...v,
        fuelCost:fCost,
        fuelLiters:fLiters,
        maintCost:mCost,
        totalCost:total,
        costPerKm,
      };
    }).sort((a,b)=>b.totalCost-a.totalCost);
  },[vehicles,fuelLogs,maintenances]);

  return <Shell>
    <Title eyebrow="Gestão da frota do Estado · Submenu 7" title="Controlo de despesas" description="Painel consolidado de gastos operacionais, despesas com combustíveis, manutenção mecânica e eficiência de custos por ministério." icon={Coins}/>
    <StateFleetSubmenuBar/>

    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Despesas Gerais da Frota" value={currency(grandTotal)} detail="Combustível + Manutenção" icon={Coins}/>
      <Stat label="Despesas de Combustível" value={currency(fuelTotal)} detail={`${fuelLogs.reduce((s,f)=>s+f.liters,0).toLocaleString('pt-PT')} L consumidos`} icon={Fuel}/>
      <Stat label="Despesas de Manutenção" value={currency(maintenanceTotal)} detail={`${maintenances.length} ordens de reparação`} icon={Wrench}/>
      <Stat label="Custo Médio / Viatura" value={currency(avgCostPerVehicle)} detail="Custo operacional unitário" icon={Banknote}/>
    </div>

    <div className="mb-6 flex justify-end">
      <button onClick={()=>window.print()} className={primaryClass}><Printer size={15}/> Imprimir Relatório Consolidado de Despesas</button>
    </div>

    <div className="mb-6 border border-[#dcd9cc] bg-white p-5">
      <h2 className="mb-4 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Consolidação de Despesas por Ministério / Instituição</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
            <tr>{['Ministério / Instituição','Sigla','Viaturas','Combustível (L)','Gasto Combustível','Gasto Manutenção','Despesa Total','% do Orçamento'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
          </thead>
          <tbody>
            {expensesByMinistry.map(row=>{
              const pct=grandTotal>0?Math.round((row.totalCost/grandTotal)*100):0;
              return <tr key={row.acronym} className="border-b border-[#f0eee7]">
                <td className="px-3 py-3 font-semibold text-[#1c3024]">{row.name}</td>
                <td className="px-3 py-3 font-mono font-bold text-[#006B35]">{row.acronym}</td>
                <td className="px-3 py-3 font-mono">{row.vehicleCount}</td>
                <td className="px-3 py-3 font-mono">{row.fuelLiters.toLocaleString('pt-PT')} L</td>
                <td className="px-3 py-3 font-mono text-[#006B35]">{currency(row.fuelCost)}</td>
                <td className="px-3 py-3 font-mono text-[#9f1a2b]">{currency(row.maintCost)}</td>
                <td className="px-3 py-3 font-mono font-bold text-base text-[#173d2b]">{currency(row.totalCost)}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-[#eeede5] h-2">
                      <div className="bg-[#009E49] h-full" style={{width:`${Math.max(5,pct)}%`}}/>
                    </div>
                    <span className="text-xs font-semibold">{pct}%</span>
                  </div>
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>

    <div className="border border-[#dcd9cc] bg-white p-5">
      <h2 className="mb-4 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Despesa Operacional Detalhada por Viatura Pública</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
            <tr>{['Matrícula','Veículo','Ministério','Combustível (Litros / XOF)','Manutenção (XOF)','Custo Total da Viatura','Quilometragem','Custo Médio / Km'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
          </thead>
          <tbody>
            {expensesByVehicle.map(v=><tr key={v.id} className="border-b border-[#f0eee7]">
              <td className="px-3 py-3 font-mono font-bold text-[#006B35] whitespace-nowrap">{v.plate}</td>
              <td className="px-3 py-3 whitespace-nowrap">{v.make} {v.model} ({v.year})</td>
              <td className="px-3 py-3 font-semibold">{v.institutionAcronym||'GOV'}</td>
              <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{v.fuelLiters} L · {currency(v.fuelCost)}</td>
              <td className="px-3 py-3 font-mono text-xs text-[#9f1a2b] whitespace-nowrap">{currency(v.maintCost)}</td>
              <td className="px-3 py-3 font-mono font-bold text-sm text-[#173d2b] whitespace-nowrap">{currency(v.totalCost)}</td>
              <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{(v.currentMileage||0).toLocaleString('pt-PT')} km</td>
              <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{v.costPerKm} XOF/km</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  </Shell>;
}

function AccidentSubmenuBar(){
  const {pathname}=useLocation();
  return <div className="mb-6 flex flex-wrap gap-1.5 border-b border-[#dcd9cc] pb-4">
    {accidentSubmenus.map(sub=>{
      const active=pathname===sub.path;
      return <Link key={sub.path} to={sub.path} className={`border px-3 py-1.5 text-xs font-semibold transition ${active?'border-[#CE1126] bg-[#CE1126] text-white':'border-[#d5d1c2] bg-white text-[#26372b] hover:border-[#CE1126] hover:bg-[#f4f3ed]'}`}>{sub.label}</Link>;
    })}
  </div>;
}

function PoliceReportPrintModal({report,accident,onClose}:{report:AccidentPoliceReport;accident?:Accident;onClose:()=>void}){
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10251a]/65">
    <div className="relative w-full max-w-2xl bg-white border-2 border-[#CE1126] shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-start border-b-2 border-[#d5d1c2] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center border border-[#CE1126] bg-[#173d2b] text-base font-black text-[#FCD116]">GB</div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#836300]">República da Guiné-Bissau</div>
            <h3 className="font-serif text-lg font-bold text-[#173d2b]">Ministério do Interior · Comissariado-Geral da POP</h3>
            <div className="text-xs text-[#697168]">{report.policeDepartment} · Departamento de Trânsito</div>
          </div>
        </div>
        <button onClick={onClose} aria-label="Fechar" className="p-1 text-[#737a70] hover:text-[#1c3024]"><X size={20}/></button>
      </div>

      <div className="mb-4 border-l-4 border-[#CE1126] bg-[#f8f7f2] p-3 text-center">
        <h4 className="font-serif text-base font-bold text-[#1c3024] uppercase tracking-wide">Boletim Oficial de Participação de Acidente Rodoviário</h4>
        <div className="font-mono text-xs font-bold text-[#CE1126] mt-0.5">{report.reportNumber}</div>
      </div>

      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3 border border-[#dcd9cc] bg-[#f8f7f2] p-4">
          <div><span className="text-[#737a70] block">Registo de Acidente:</span><b className="font-mono text-sm text-[#006B35]">{report.accidentId}</b></div>
          <div><span className="text-[#737a70] block">Data do Relatório:</span><b>{report.reportDate}</b></div>
          <div><span className="text-[#737a70] block">Local da Ocorrência:</span><b>{accident?.road||'Via Pública'}</b></div>
          <div><span className="text-[#737a70] block">Região / Distrito:</span><b>{accident?.region||'Setor Autónomo de Bissau'}</b></div>
          <div><span className="text-[#737a70] block">Gravidade Global:</span><Status value={accident?.severity||'Com Danos'}/></div>
          <div><span className="text-[#737a70] block">Estado do Processo:</span><Status value={report.procedureStatus}/></div>
        </div>

        <div className="border border-[#dcd9cc] p-4 space-y-3">
          <div>
            <span className="text-[#737a70] block font-semibold mb-1">Conclusão Pericial e Dinâmica do Acidente:</span>
            <p className="text-[#202820] leading-relaxed bg-[#f8f7f2] p-3 border border-[#e9e6dc]">{report.investigationSummary}</p>
          </div>
          {report.infractionsFound&&<div>
            <span className="text-[#737a70] block font-semibold mb-1">Infrações ao Código da Estrada Constatadas:</span>
            <p className="font-semibold text-[#9f1a2b] bg-[#CE1126]/10 p-2 border border-[#CE1126]/30">{report.infractionsFound}</p>
          </div>}
          <div>
            <span className="text-[#737a70] block font-semibold mb-1">Encaminhamento Legal:</span>
            <p className="font-medium text-[#173d2b]">{report.legalReferral}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 border-t border-[#dcd9cc] pt-6 text-center text-[11px]">
          <div>
            <div className="border-b border-[#202820] pb-8"/>
            <b className="block mt-1">{report.officerName}</b>
            <span className="text-[#737a70]">Agente / Perito Autuante · {report.officerBadge}</span>
          </div>
          <div>
            <div className="border-b border-[#202820] pb-8"/>
            <b className="block mt-1">O Comandante da Brigada de Trânsito</b>
            <span className="text-[#737a70]">Visto e Homologação Oficial</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#dcd9cc] pt-4">
          <button onClick={()=>window.print()} className={primaryClass}><Printer size={15}/> Imprimir Boletim de Acidente</button>
          <button onClick={onClose} className={secondaryClass}>Fechar</button>
        </div>
      </div>
    </div>
  </div>;
}

export function AccidentRegistryPage(){
  const [accidents,setAccidents]=useSaved('accidents',seedAccidents);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<Accident|null>(null);
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [search,setSearch]=useState('');
  const [regionFilter,setRegionFilter]=useState('');
  const [severityFilter,setSeverityFilter]=useState('');

  const regions=useMemo(()=>Array.from(new Set(accidents.map(a=>a.region))),[accidents]);

  const filtered=useMemo(()=>accidents.filter(a=>{
    const matchSearch=[a.id,a.road,a.region,a.type,a.probableCause,a.landmark||''].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchRegion=!regionFilter||a.region===regionFilter;
    const matchSeverity=!severityFilter||a.severity===severityFilter;
    return matchSearch&&matchRegion&&matchSeverity;
  }),[accidents,search,regionFilter,severityFilter]);

  const totalFatalities=accidents.reduce((s,a)=>s+(a.fatalitiesCount||0),0);
  const totalInjured=accidents.reduce((s,a)=>s+(a.injuredCount||0),0);
  const totalVehicles=accidents.reduce((s,a)=>s+(a.vehiclesInvolved||0),0);

  async function submitAccident(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const road=String(f.get('road')||'').trim();
    if(!road){setError('A via/estrada é obrigatória.');return;}

    const payload:Accident={
      id:editing?editing.id:`ACID-2026-${String(Date.now()).slice(-4)}`,
      date:String(f.get('date')||new Date().toISOString().slice(0,10)),
      time:String(f.get('time')||'12:00'),
      severity:String(f.get('severity')||'Com Feridos'),
      type:String(f.get('type')||'Colisão'),
      region:String(f.get('region')||'Setor Autónomo de Bissau'),
      road,
      latitude:Number(f.get('latitude')||11.8632),
      longitude:Number(f.get('longitude')||-15.5984),
      landmark:String(f.get('landmark')||'').trim(),
      weather:String(f.get('weather')||'Bom tempo / Sol'),
      roadCondition:String(f.get('roadCondition')||'Seco e limpo'),
      vehiclesInvolved:Number(f.get('vehiclesInvolved')||2),
      victimsCount:Number(f.get('victimsCount')||0),
      fatalitiesCount:Number(f.get('fatalitiesCount')||0),
      injuredCount:Number(f.get('injuredCount')||0),
      probableCause:String(f.get('probableCause')||'Excesso de velocidade').trim(),
      description:String(f.get('description')||'').trim(),
      status:String(f.get('status')||'Em Investigação'),
    };

    try{
      setError('');setSuccessMsg('');
      if(editing){
        const res=await api.put<Accident>(`/accidents/${encodeURIComponent(editing.id)}`,payload);
        setAccidents(rows=>rows.map(a=>a.id===editing.id?res.data:a));
        setSuccessMsg(`Acidente ${editing.id} atualizado com sucesso.`);
      }else{
        const res=await api.post<Accident>('/accidents',payload);
        setAccidents([res.data,...accidents]);
        setSuccessMsg(`Acidente ${res.data.id} registado com sucesso.`);
      }
      formEl.reset();
      setEditing(null);
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao registar o acidente.');
    }
  }

  async function handleDelete(id:string){
    if(!window.confirm(`Deseja realmente remover o registo de acidente ${id}?`))return;
    try{
      await api.delete(`/accidents/${encodeURIComponent(id)}`);
    }catch{/* ignore */}
    setAccidents(rows=>rows.filter(a=>a.id!==id));
  }

  return <Shell>
    <Title eyebrow="Gestão de acidentes rodoviários · Submenu 1" title="Registo de acidentes" description="Sistema nacional de registo de acidentes de viação, tipologia, gravidade, intervenientes e controlo investigativo da sinistralidade." icon={ShieldAlert}/>
    <AccidentSubmenuBar/>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Total de Acidentes" value={String(accidents.length)} detail="Ocorrências registadas" icon={ShieldAlert}/>
      <Stat label="Vítimas Mortais" value={String(totalFatalities)} detail="Taxa de letalidade" icon={UserX}/>
      <Stat label="Feridos Registados" value={String(totalInjured)} detail="Assistidos / internados" icon={AlertTriangle}/>
      <Stat label="Veículos Danificados" value={String(totalVehicles)} detail="Danos materiais apurados" icon={CarFront}/>
    </div>

    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <label className="flex min-w-[240px] flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3">
          <Search size={16} className="text-[#737a70]"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por n.º, via, região, tipo ou causa" className="w-full py-2 text-sm outline-none"/>
        </label>
        <select value={regionFilter} onChange={e=>setRegionFilter(e.target.value)} className={`w-auto ${inputClass}`}>
          <option value="">Todas as Regiões</option>
          {regions.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
        <select value={severityFilter} onChange={e=>setSeverityFilter(e.target.value)} className={`w-auto ${inputClass}`}>
          <option value="">Todas as Gravidades</option>
          <option value="Danos Materiais">Danos Materiais</option>
          <option value="Com Feridos">Com Feridos</option>
          <option value="Com Feridos Graves">Com Feridos Graves</option>
          <option value="Com Vítimas Mortais">Com Vítimas Mortais</option>
        </select>
      </div>
      <button onClick={()=>{setEditing(null);setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Registar Novo Acidente'}</button>
    </div>

    {open&&<Drawer title={editing?`Editar Acidente · ${editing.id}`:'Registar Acidente de Trânsito'} onClose={()=>{setOpen(false);setEditing(null);}}>
      <form key={editing?.id||'new'} onSubmit={submitAccident} className="grid gap-3 sm:grid-cols-2">
        <Field label="Data do Acidente" name="date" type="date" defaultValue={editing?.date||new Date().toISOString().slice(0,10)}/>
        <Field label="Hora" name="time" defaultValue={editing?.time||'14:30'} placeholder="14:30"/>
        <label className="block text-xs font-semibold text-[#4b5549]">Gravidade
          <select name="severity" defaultValue={editing?.severity||'Com Feridos'} className={`mt-1.5 ${inputClass}`}>
            <option value="Danos Materiais">Danos Materiais (Sem Vítimas)</option>
            <option value="Com Feridos">Com Feridos Leves</option>
            <option value="Com Feridos Graves">Com Feridos Graves</option>
            <option value="Com Vítimas Mortais">Com Vítimas Mortais</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Tipo de Acidente
          <select name="type" defaultValue={editing?.type||'Colisão Frontal'} className={`mt-1.5 ${inputClass}`}>
            <option value="Colisão Frontal">Colisão Frontal</option>
            <option value="Colisão Traseira">Colisão Traseira</option>
            <option value="Colisão Lateral">Colisão Lateral</option>
            <option value="Atropelamento">Atropelamento</option>
            <option value="Atropelamento e Fuga">Atropelamento e Fuga</option>
            <option value="Capotamento">Capotamento</option>
            <option value="Despiste">Despiste</option>
            <option value="Choque com Obstáculo Fixo">Choque com Obstáculo Fixo</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Região / Distrito
          <select name="region" defaultValue={editing?.region||'Setor Autónomo de Bissau'} className={`mt-1.5 ${inputClass}`}>
            <option value="Setor Autónomo de Bissau">Setor Autónomo de Bissau</option>
            <option value="Biombo">Biombo</option>
            <option value="Bafatá">Bafatá</option>
            <option value="Gabú">Gabú</option>
            <option value="Cacheu">Cacheu</option>
            <option value="Oio">Oio</option>
            <option value="Quinara">Quinara</option>
            <option value="Tombali">Tombali</option>
            <option value="Bolama/Bijagós">Bolama / Bijagós</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <Field label="Local / Via / Estrada" name="road" defaultValue={editing?.road||''} placeholder="Ex.: Estrada Nacional N1 · Eixo Safim - Bissau"/>
        </div>
        <Field label="Ponto de Referência" name="landmark" defaultValue={editing?.landmark||''} placeholder="Próximo à rotunda..."/>
        <Field label="Causa Provável" name="probableCause" defaultValue={editing?.probableCause||'Excesso de velocidade'}/>
        <Field label="Latitude GPS" name="latitude" type="number" defaultValue={String(editing?.latitude||11.8632)}/>
        <Field label="Longitude GPS" name="longitude" type="number" defaultValue={String(editing?.longitude||-15.5984)}/>
        <Field label="Veículos Envolvidos" name="vehiclesInvolved" type="number" defaultValue={String(editing?.vehiclesInvolved||2)}/>
        <Field label="Total de Vítimas" name="victimsCount" type="number" defaultValue={String(editing?.victimsCount||0)}/>
        <Field label="Vítimas Mortais" name="fatalitiesCount" type="number" defaultValue={String(editing?.fatalitiesCount||0)}/>
        <Field label="Feridos" name="injuredCount" type="number" defaultValue={String(editing?.injuredCount||0)}/>
        <label className="block text-xs font-semibold text-[#4b5549]">Condições Meteorológicas
          <select name="weather" defaultValue={editing?.weather||'Bom tempo / Sol'} className={`mt-1.5 ${inputClass}`}>
            <option value="Bom tempo / Sol">Bom tempo / Sol</option>
            <option value="Chuva intensa">Chuva intensa</option>
            <option value="Neblina / Harmatão">Neblina / Harmatão</option>
            <option value="Noite com iluminação">Noite com iluminação</option>
            <option value="Noite sem iluminação">Noite sem iluminação</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Estado do Piso
          <select name="roadCondition" defaultValue={editing?.roadCondition||'Seco e limpo'} className={`mt-1.5 ${inputClass}`}>
            <option value="Seco e limpo">Seco e limpo</option>
            <option value="Molhado / Escorregadio">Molhado / Escorregadio</option>
            <option value="Com buracos / Degradação">Com buracos / Degradação</option>
            <option value="Terra batida / Pó">Terra batida / Pó</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Estado da Investigação
          <select name="status" defaultValue={editing?.status||'Em Investigação'} className={`mt-1.5 ${inputClass}`}>
            <option value="Em Investigação">Em Investigação</option>
            <option value="Peritagem Concluída">Peritagem Concluída</option>
            <option value="Remetido a Tribunal">Remetido a Tribunal</option>
            <option value="Arquivado">Arquivado</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <Field label="Descrição Sumária das Circunstâncias" name="description" defaultValue={editing?.description||''}/>
        </div>
        <div className="sm:col-span-2 flex items-end gap-2 pt-2">
          <button className={primaryClass}>{editing?'Guardar Alterações':'Registar Acidente'}</button>
          {editing&&<button type="button" onClick={()=>{setEditing(null);window.dispatchEvent(new Event('sigetran:drawer-close'));}} className={secondaryClass}>Cancelar</button>}
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º Acidente','Data & Hora','Gravidade','Tipo','Região & Local da Via','Veículos','Vítimas (Mortos/Feridos)','Causa Provável','Estado','Ações'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(a=><tr key={a.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono font-bold text-[#CE1126] whitespace-nowrap">{a.id}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">
              <div>{a.date}</div>
              <span className="text-[#737a70]">{a.time}</span>
            </td>
            <td className="px-3 py-3 whitespace-nowrap"><Status value={a.severity}/></td>
            <td className="px-3 py-3 whitespace-nowrap font-medium">{a.type}</td>
            <td className="px-3 py-3 text-xs max-w-xs">
              <span className="font-semibold text-[#1c3024] block">{a.road}</span>
              <span className="text-[#737a70]">{a.region}{a.landmark?` · ${a.landmark}`:''}</span>
            </td>
            <td className="px-3 py-3 font-mono text-center">{a.vehiclesInvolved}</td>
            <td className="px-3 py-3 whitespace-nowrap text-xs font-mono">
              <span className="text-[#CE1126] font-bold">{a.fatalitiesCount} mortos</span> / <span className="text-[#836300] font-semibold">{a.injuredCount} feridos</span>
            </td>
            <td className="px-3 py-3 text-xs text-[#4b5549] max-w-xs truncate">{a.probableCause}</td>
            <td className="px-3 py-3 whitespace-nowrap"><Status value={a.status}/></td>
            <td className="px-3 py-3 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <button type="button" onClick={()=>{setEditing(a);setOpen(true);}} className="text-xs font-semibold text-[#006B35] hover:underline">Editar</button>
                <span className="text-[#d5d1c2]">|</span>
                <button type="button" onClick={()=>handleDelete(a.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Remover</button>
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function AccidentVehiclesDriversPage(){
  const [accidents]=useSaved('accidents',seedAccidents);
  const [vehiclesDrivers,setVehiclesDrivers]=useSaved('accident-vehicles-drivers',seedAccidentVehiclesDrivers);
  const [open,setOpen]=useState(false);
  const [selectedAccident,setSelectedAccident]=useState(accidents[0]?.id||'ACID-2026-0001');
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [search,setSearch]=useState('');

  const filtered=useMemo(()=>vehiclesDrivers.filter(v=>{
    return [v.id,v.accidentId,v.plate,v.vehicleLabel||'',v.driverName,v.driverLicense||'',v.liability||''].join(' ').toLowerCase().includes(search.toLowerCase());
  }),[vehiclesDrivers,search]);

  async function submitVehicleDriver(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const plate=String(f.get('plate')||'').toUpperCase().trim();
    const driverName=String(f.get('driverName')||'').trim();
    if(!plate||!driverName){setError('Matrícula e nome do condutor são obrigatórios.');return;}

    const payload:AccidentVehicleDriver={
      id:`VCA-2026-${String(Date.now()).slice(-4)}`,
      accidentId:String(f.get('accidentId')||selectedAccident),
      plate,
      vehicleLabel:String(f.get('vehicleLabel')||'').trim(),
      vehicleCategory:String(f.get('vehicleCategory')||'Ligeiro particular'),
      insuranceCompany:String(f.get('insuranceCompany')||'Garantia Seguros GB').trim(),
      insurancePolicy:String(f.get('insurancePolicy')||'').trim(),
      damageDescription:String(f.get('damageDescription')||'').trim(),
      driverName,
      driverDocument:String(f.get('driverDocument')||'').trim(),
      driverLicense:String(f.get('driverLicense')||'').trim(),
      driverCategory:String(f.get('driverCategory')||'B').trim(),
      driverPhone:String(f.get('driverPhone')||'').trim(),
      alcoholTest:String(f.get('alcoholTest')||'0.00 g/l (Negativo)'),
      liability:String(f.get('liability')||'Sob Peritagem'),
      notes:String(f.get('notes')||'').trim(),
    };

    try{
      setError('');setSuccessMsg('');
      const res=await api.post<AccidentVehicleDriver>('/accident-vehicles-drivers',payload);
      setVehiclesDrivers([res.data,...vehiclesDrivers]);
      setSuccessMsg(`Veículo ${plate} e condutor ${driverName} vinculados ao acidente.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao vincular veículo e condutor.');
    }
  }

  async function handleDelete(id:string){
    if(!window.confirm('Deseja realmente remover este interveniente do acidente?'))return;
    try{
      await api.delete(`/accident-vehicles-drivers/${encodeURIComponent(id)}`);
    }catch{/* ignore */}
    setVehiclesDrivers(rows=>rows.filter(v=>v.id!==id));
  }

  return <Shell>
    <Title eyebrow="Gestão de acidentes rodoviários · Submenu 2" title="Veículos e condutores envolvidos" description="Identificação dos veículos intervenientes, seguros, apólices, danos materiais, condutores e testes de alcoolemia." icon={CarFront}/>
    <AccidentSubmenuBar/>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <Stat label="Veículos Intervenientes" value={String(vehiclesDrivers.length)} detail="Registados nas ocorrências" icon={CarFront}/>
      <Stat label="Com Seguro Válido" value={String(vehiclesDrivers.filter(v=>v.insuranceCompany&&v.insuranceCompany!=='Sem seguro válido').length)} detail="Apólices ativas" icon={ShieldCheck}/>
      <Stat label="Alcoolemia Positiva" value={String(vehiclesDrivers.filter(v=>v.alcoholTest?.includes('Positivo')).length)} detail="Sob efeito de álcool" icon={AlertTriangle}/>
    </div>

    <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
      <label className="flex max-w-md flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3">
        <Search size={16} className="text-[#737a70]"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por matrícula, condutor, acidente ou responsabilidade" className="w-full py-2 text-sm outline-none"/>
      </label>
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Adicionar Veículo / Condutor Envolvido'}</button>
    </div>

    {open&&<Drawer title="Vincular Veículo e Condutor a Acidente" onClose={()=>setOpen(false)}>
      <form onSubmit={submitVehicleDriver} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Acidente Associado
          <select name="accidentId" value={selectedAccident} onChange={e=>setSelectedAccident(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {accidents.map(a=><option key={a.id} value={a.id}>{a.id} · {a.date} ({a.road})</option>)}
          </select>
        </label>
        <Field label="Matrícula do Veículo" name="plate" placeholder="GB-24-BC"/>
        <Field label="Marca e Modelo" name="vehicleLabel" placeholder="Toyota Hilux (2021)"/>
        <Field label="Categoria do Veículo" name="vehicleCategory" defaultValue="Ligeiro particular"/>
        <Field label="Companhia de Seguros" name="insuranceCompany" defaultValue="Garantia Seguros GB"/>
        <Field label="N.º de Apólice de Seguro" name="insurancePolicy" placeholder="APOL-9812-2026"/>
        <div className="sm:col-span-2">
          <Field label="Descrição dos Danos Materiais no Veículo" name="damageDescription" placeholder="Danos na frente, quebra de para-brisas..."/>
        </div>
        <Field label="Nome do Condutor" name="driverName" placeholder="Nome completo"/>
        <Field label="BI / Passaporte do Condutor" name="driverDocument" placeholder="BI 000192837"/>
        <Field label="N.º da Carta de Condução" name="driverLicense" placeholder="GB-C-10294"/>
        <Field label="Categoria da Carta" name="driverCategory" defaultValue="B"/>
        <Field label="Contacto Telefónico" name="driverPhone" placeholder="+245 955 "/>
        <label className="block text-xs font-semibold text-[#4b5549]">Teste de Alcoolemia (TAS)
          <select name="alcoholTest" className={`mt-1.5 ${inputClass}`}>
            <option value="0.00 g/l (Negativo)">0.00 g/l (Negativo)</option>
            <option value="0.65 g/l (Positivo - Contraordenação Grave)">0.65 g/l (Positivo - Grave)</option>
            <option value="1.20 g/l (Positivo - Crime)">1.20 g/l (Positivo - Crime)</option>
            <option value="Recusou o teste">Recusou o teste</option>
            <option value="Não realizado">Não realizado</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Responsabilidade Apurada
          <select name="liability" className={`mt-1.5 ${inputClass}`}>
            <option value="Sob Peritagem">Sob Peritagem / Investigação</option>
            <option value="Lesado / Terceiro">Lesado / Terceiro</option>
            <option value="Presumível causador">Presumível causador</option>
            <option value="Culpa concorrente">Culpa concorrente</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <Field label="Observações e Declarações" name="notes"/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Registar Interveniente no Acidente</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º Registo','Acidente','Veículo & Matrícula','Seguro / Apólice','Danos Materiais','Condutor','Carta de Condução','Alcoolemia','Responsabilidade','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(v=><tr key={v.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold whitespace-nowrap">{v.id}</td>
            <td className="px-3 py-3 font-mono font-semibold text-[#006B35] whitespace-nowrap">{v.accidentId}</td>
            <td className="px-3 py-3 whitespace-nowrap">
              <span className="font-mono font-bold text-[#1c3024]">{v.plate}</span>
              <span className="block text-[11px] text-[#737a70]">{v.vehicleLabel||v.vehicleCategory}</span>
            </td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">
              <span className="font-semibold">{v.insuranceCompany||'Sem seguro'}</span>
              {v.insurancePolicy&&<span className="block text-[10px] text-[#737a70] font-mono">{v.insurancePolicy}</span>}
            </td>
            <td className="px-3 py-3 text-xs max-w-xs">{v.damageDescription||'Sem danos registados'}</td>
            <td className="px-3 py-3 whitespace-nowrap">
              <span className="font-semibold">{v.driverName}</span>
              <span className="block text-[11px] text-[#737a70]">{v.driverPhone||v.driverDocument}</span>
            </td>
            <td className="px-3 py-3 text-xs font-mono whitespace-nowrap">{v.driverLicense||'Não habilitado'} <span className="text-[#737a70]">({v.driverCategory})</span></td>
            <td className="px-3 py-3 whitespace-nowrap">
              <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold border ${v.alcoholTest?.includes('Negativo')?'border-[#009E49]/30 bg-[#009E49]/10 text-[#006B35]':'border-[#CE1126]/30 bg-[#CE1126]/10 text-[#9f1a2b]'}`}>
                {v.alcoholTest||'0.00 g/l'}
              </span>
            </td>
            <td className="px-3 py-3 whitespace-nowrap"><Status value={v.liability||'Sob Peritagem'}/></td>
            <td className="px-3 py-3 whitespace-nowrap">
              <button type="button" onClick={()=>handleDelete(v.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Remover</button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function AccidentVictimsPage(){
  const [accidents]=useSaved('accidents',seedAccidents);
  const [victims,setVictims]=useSaved('accident-victims',seedAccidentVictims);
  const [open,setOpen]=useState(false);
  const [selectedAccident,setSelectedAccident]=useState(accidents[0]?.id||'ACID-2026-0001');
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [search,setSearch]=useState('');

  const filtered=useMemo(()=>victims.filter(v=>{
    return [v.id,v.accidentId,v.name,v.hospital,v.injurySeverity,v.condition].join(' ').toLowerCase().includes(search.toLowerCase());
  }),[victims,search]);

  const fatalities=victims.filter(v=>v.injurySeverity==='Óbito no Local'||v.injurySeverity.includes('Óbito')).length;
  const severe=victims.filter(v=>v.injurySeverity.includes('Graves')).length;
  const minor=victims.filter(v=>v.injurySeverity.includes('Leves')).length;

  async function submitVictim(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const name=String(f.get('name')||'').trim();
    if(!name){setError('O nome da vítima é obrigatório.');return;}

    const payload:AccidentVictim={
      id:`VIT-2026-${String(Date.now()).slice(-4)}`,
      accidentId:String(f.get('accidentId')||selectedAccident),
      name,
      document:String(f.get('document')||'').trim(),
      age:Number(f.get('age')||30),
      gender:String(f.get('gender')||'Masculino'),
      condition:String(f.get('condition')||'Passageiro'),
      associatedPlate:String(f.get('associatedPlate')||'').toUpperCase().trim(),
      injurySeverity:String(f.get('injurySeverity')||'Ferimentos Leves'),
      hospital:String(f.get('hospital')||'Hospital Nacional Simão Mendes').trim(),
      emergencyContact:String(f.get('emergencyContact')||'').trim(),
      medicalNotes:String(f.get('medicalNotes')||'').trim(),
    };

    try{
      setError('');setSuccessMsg('');
      const res=await api.post<AccidentVictim>('/accident-victims',payload);
      setVictims([res.data,...victims]);
      setSuccessMsg(`Vítima ${name} registada com sucesso.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao registar a vítima.');
    }
  }

  async function handleDelete(id:string){
    if(!window.confirm('Deseja realmente remover o registo desta vítima?'))return;
    try{
      await api.delete(`/accident-victims/${encodeURIComponent(id)}`);
    }catch{/* ignore */}
    setVictims(rows=>rows.filter(v=>v.id!==id));
  }

  return <Shell>
    <Title eyebrow="Gestão de acidentes rodoviários · Submenu 3" title="Identificação de vítimas" description="Registo e acompanhamento das vítimas de sinistros, gravidade das lesões corporais, internamentos hospitalares e óbitos." icon={UserX}/>
    <AccidentSubmenuBar/>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Total de Vítimas" value={String(victims.length)} detail="Pessoas envolvidas" icon={Users}/>
      <Stat label="Vítimas Mortais" value={String(fatalities)} detail="Óbitos declarados" icon={UserX}/>
      <Stat label="Ferimentos Graves" value={String(severe)} detail="Internamentos com risco" icon={AlertTriangle}/>
      <Stat label="Ferimentos Leves" value={String(minor)} detail="Altas concedidas" icon={Check}/>
    </div>

    <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
      <label className="flex max-w-md flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3">
        <Search size={16} className="text-[#737a70]"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por nome, hospital, gravidade ou acidente" className="w-full py-2 text-sm outline-none"/>
      </label>
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Identificar Nova Vítima'}</button>
    </div>

    {open&&<Drawer title="Identificação e Ficha Clínica da Vítima" onClose={()=>setOpen(false)}>
      <form onSubmit={submitVictim} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Acidente Associado
          <select name="accidentId" value={selectedAccident} onChange={e=>setSelectedAccident(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {accidents.map(a=><option key={a.id} value={a.id}>{a.id} · {a.date} ({a.road})</option>)}
          </select>
        </label>
        <Field label="Nome Completo da Vítima" name="name" placeholder="Nome da vítima"/>
        <Field label="BI / N.º de Identificação" name="document" placeholder="BI 000492811"/>
        <Field label="Idade" name="age" type="number" defaultValue="30"/>
        <label className="block text-xs font-semibold text-[#4b5549]">Género / Sexo
          <select name="gender" className={`mt-1.5 ${inputClass}`}>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Condição no Acidente
          <select name="condition" className={`mt-1.5 ${inputClass}`}>
            <option value="Passageiro">Passageiro</option>
            <option value="Condutor">Condutor</option>
            <option value="Peão / Pedestre">Peão / Pedestre</option>
            <option value="Ciclista">Ciclista</option>
          </select>
        </label>
        <Field label="Matrícula do Veículo Vinculado (se aplicável)" name="associatedPlate" placeholder="GB-24-BC"/>
        <label className="block text-xs font-semibold text-[#4b5549]">Gravidade da Lesão
          <select name="injurySeverity" className={`mt-1.5 ${inputClass}`}>
            <option value="Ferimentos Leves">Ferimentos Leves</option>
            <option value="Ferimentos Graves">Ferimentos Graves</option>
            <option value="Ferimentos Graves com Risco de Vida">Ferimentos Graves com Risco de Vida</option>
            <option value="Óbito no Local">Óbito no Local</option>
            <option value="Óbito a Caminho do Hospital">Óbito a Caminho do Hospital</option>
          </select>
        </label>
        <Field label="Hospital ou Destino de Socorro" name="hospital" defaultValue="Hospital Nacional Simão Mendes"/>
        <div className="sm:col-span-2">
          <Field label="Contacto de Familiar / Emergência" name="emergencyContact" placeholder="+245 966 000 000 (Grau de parentesco)"/>
        </div>
        <div className="sm:col-span-2">
          <Field label="Observações Médicas e Diagnóstico Sumário" name="medicalNotes" placeholder="Traumatismos, fraturas ou alta clínica..."/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Guardar Ficha da Vítima</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º Vítima','Acidente','Nome da Vítima','Idade / Sexo','Condição','Veículo','Gravidade','Unidade de Socorro','Contacto de Emergência','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(v=><tr key={v.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold whitespace-nowrap">{v.id}</td>
            <td className="px-3 py-3 font-mono font-semibold text-[#006B35] whitespace-nowrap">{v.accidentId}</td>
            <td className="px-3 py-3 whitespace-nowrap">
              <span className="font-semibold text-[#1c3024]">{v.name}</span>
              {v.document&&<span className="block text-[11px] text-[#737a70]">{v.document}</span>}
            </td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{v.age} anos · {v.gender}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap font-medium">{v.condition}</td>
            <td className="px-3 py-3 font-mono text-xs whitespace-nowrap text-[#006B35]">{v.associatedPlate||'—'}</td>
            <td className="px-3 py-3 whitespace-nowrap"><Status value={v.injurySeverity}/></td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{v.hospital}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap font-mono">{v.emergencyContact||'—'}</td>
            <td className="px-3 py-3 whitespace-nowrap">
              <button type="button" onClick={()=>handleDelete(v.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Remover</button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function AccidentLocationsPage(){
  const [accidents]=useSaved('accidents',seedAccidents);
  const [selectedAccident,setSelectedAccident]=useState<Accident|null>(accidents[0]||null);
  const [regionFilter,setRegionFilter]=useState('');

  const regions=useMemo(()=>Array.from(new Set(accidents.map(a=>a.region))),[accidents]);

  const filtered=useMemo(()=>accidents.filter(a=>{
    return !regionFilter||a.region===regionFilter;
  }),[accidents,regionFilter]);

  return <Shell>
    <Title eyebrow="Gestão de acidentes rodoviários · Submenu 4" title="Localização geográfica" description="Mapeamento georreferenciado (GIS), coordenadas GPS dos sinistros, pontos críticos e trechos de elevada perigosidade." icon={MapPin}/>
    <AccidentSubmenuBar/>

    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Locais Georreferenciados" value={String(accidents.length)} detail="Coordenadas GPS validadas" icon={MapPin}/>
      <Stat label="Regiões Monitorizadas" value={String(regions.length)} detail="Cobertura territorial" icon={Building2}/>
      <Stat label="Pontos Negros Críticos" value="4" detail="Trechos prioritários de intervenção" icon={AlertOctagon}/>
      <Stat label="Acidentes Noturnos" value={String(accidents.filter(a=>a.weather.includes('Noite')).length)} detail="Vias sem iluminação" icon={AlertTriangle}/>
    </div>

    <div className="mb-6 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 border border-[#dcd9cc] bg-white p-5">
        <div className="flex justify-between items-center mb-4 border-b border-[#e9e6dc] pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1c3024]">Visualizador de Coordenadas Geográficas (GIS)</h2>
            <p className="text-xs text-[#737a70]">Cartografia e posicionamento dos pontos de sinistralidade viária na Guiné-Bissau</p>
          </div>
          <select value={regionFilter} onChange={e=>setRegionFilter(e.target.value)} className={`w-auto text-xs ${inputClass}`}>
            <option value="">Todas as Regiões</option>
            {regions.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Visual Map Simulation Container */}
        <div className="relative h-80 w-full overflow-hidden border-2 border-[#173d2b] bg-[#12281d] rounded p-4 text-white">
          <div className="absolute inset-0 opacity-15" style={{backgroundImage:'radial-gradient(#009E49 1px, transparent 1px)',backgroundSize:'24px 24px'}}/>
          <div className="absolute top-3 left-3 bg-[#173d2b]/80 border border-[#FCD116]/40 px-2.5 py-1 text-[11px] font-mono text-[#FCD116]">
            GPS WGS84 · Guiné-Bissau (11.8°N, 15.6°W)
          </div>
          <div className="relative h-full w-full flex items-center justify-center">
            {filtered.map((acc,idx)=>{
              const isSelected=selectedAccident?.id===acc.id;
              // Map approximate visual offsets for display
              const leftPercent = 30 + ((acc.longitude + 15.65) * 180) + (idx * 12);
              const topPercent = 35 + ((12.3 - acc.latitude) * 70) + (idx * 8);
              return <button
                key={acc.id}
                onClick={()=>setSelectedAccident(acc)}
                title={`${acc.id} - ${acc.road}`}
                style={{left:`${Math.min(85,Math.max(15,leftPercent))}%`,top:`${Math.min(80,Math.max(20,topPercent))}%`}}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-2 rounded-full transition shadow-lg ${isSelected?'bg-[#CE1126] scale-125 ring-4 ring-[#FCD116]':'bg-[#009E49] hover:bg-[#CE1126]'}`}
              >
                <MapPin size={18} className="text-white"/>
                <span className="absolute -bottom-5 whitespace-nowrap bg-black/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-white rounded">
                  {acc.id}
                </span>
              </button>;
            })}
          </div>
        </div>

        {selectedAccident&&<div className="mt-4 border border-[#e9e6dc] bg-[#f8f7f2] p-4 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-mono text-xs font-bold text-[#CE1126]">{selectedAccident.id}</span>
              <h3 className="font-bold text-sm text-[#1c3024] mt-0.5">{selectedAccident.road}</h3>
              <p className="text-[#737a70]">{selectedAccident.region}{selectedAccident.landmark?` · ${selectedAccident.landmark}`:''}</p>
            </div>
            <Status value={selectedAccident.severity}/>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-[#dcd9cc] pt-2 font-mono">
            <div>Latitude: <b>{selectedAccident.latitude.toFixed(4)}°N</b></div>
            <div>Longitude: <b>{selectedAccident.longitude.toFixed(4)}°W</b></div>
            <div>Piso: <b>{selectedAccident.roadCondition}</b></div>
            <div>Clima: <b>{selectedAccident.weather}</b></div>
          </div>
        </div>}
      </div>

      <div className="space-y-4">
        <div className="border border-[#dcd9cc] bg-white p-5">
          <h3 className="font-serif text-base font-bold text-[#1c3024] mb-3 border-b border-[#e9e6dc] pb-2">Pontos Negros Rodoviários Críticos</h3>
          <div className="space-y-3 text-xs">
            <div className="border-l-4 border-[#CE1126] bg-[#f8f7f2] p-3">
              <b className="text-[#1c3024] block">Safim · Estrada Nacional N1 (km 12-15)</b>
              <span className="text-[#737a70]">Região de Biombo · Elevado índice de atropelamentos noturnos por ausência de iluminação.</span>
            </div>
            <div className="border-l-4 border-[#CE1126] bg-[#f8f7f2] p-3">
              <b className="text-[#1c3024] block">Av. Combatentes · Eixo Aeroporto Osvaldo Vieira</b>
              <span className="text-[#737a70]">Setor Autónomo de Bissau · Colisões frontais por excesso de velocidade na reta principal.</span>
            </div>
            <div className="border-l-4 border-[#FCD116] bg-[#f8f7f2] p-3">
              <b className="text-[#1c3024] block">Ponte sobre o Rio Geba · Entrada de Bafatá</b>
              <span className="text-[#737a70]">Região de Bafatá · Colisões por alcance causadas pela degradação do pavimento.</span>
            </div>
            <div className="border-l-4 border-[#FCD116] bg-[#f8f7f2] p-3">
              <b className="text-[#1c3024] block">Curva do Rio Campossa · Estrada Gabú - Pirada</b>
              <span className="text-[#737a70]">Região de Gabú · Despistes e capotamentos com piso escorregadio na época das chuvas.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Shell>;
}

export function AccidentEvidencePage(){
  const [accidents]=useSaved('accidents',seedAccidents);
  const [evidenceList,setEvidenceList]=useSaved('accident-evidence',seedAccidentEvidence);
  const [open,setOpen]=useState(false);
  const [selectedAccident,setSelectedAccident]=useState(accidents[0]?.id||'ACID-2026-0001');
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [search,setSearch]=useState('');

  const filtered=useMemo(()=>evidenceList.filter(e=>{
    return [e.id,e.accidentId,e.title,e.evidenceType,e.description||''].join(' ').toLowerCase().includes(search.toLowerCase());
  }),[evidenceList,search]);

  async function submitEvidence(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const title=String(f.get('title')||'').trim();
    if(!title){setError('O título da fotografia/documento é obrigatório.');return;}

    const payload:AccidentEvidence={
      id:`FOTO-2026-${String(Date.now()).slice(-4)}`,
      accidentId:String(f.get('accidentId')||selectedAccident),
      evidenceType:String(f.get('evidenceType')||'Fotografia do Local'),
      title,
      fileUrl:String(f.get('fileUrl')||'/media/acidentes/evidencia.jpg').trim(),
      description:String(f.get('description')||'').trim(),
      registeredBy:String(f.get('registeredBy')||'Perito da Brigada BNT').trim(),
      registrationDate:String(f.get('registrationDate')||new Date().toISOString().slice(0,10)),
    };

    try{
      setError('');setSuccessMsg('');
      const res=await api.post<AccidentEvidence>('/accident-evidence',payload);
      setEvidenceList([res.data,...evidenceList]);
      setSuccessMsg(`Prova/Fotografia "${title}" anexada ao acidente com sucesso.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao anexar a prova fotográfica.');
    }
  }

  async function handleDelete(id:string){
    if(!window.confirm('Deseja realmente remover esta evidência/fotografia?'))return;
    try{
      await api.delete(`/accident-evidence/${encodeURIComponent(id)}`);
    }catch{/* ignore */}
    setEvidenceList(rows=>rows.filter(e=>e.id!==id));
  }

  return <Shell>
    <Title eyebrow="Gestão de acidentes rodoviários · Submenu 5" title="Fotografias e documentos" description="Repositório pericial de provas fotográficas, croquis da via, esquemas topográficos e documentos probatórios de sinistros." icon={Camera}/>
    <AccidentSubmenuBar/>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <Stat label="Total de Provas Fotográficas" value={String(evidenceList.length)} detail="Anexos arquivados" icon={Camera}/>
      <Stat label="Croquis e Plantas Periciais" value={String(evidenceList.filter(e=>e.evidenceType.includes('Croqui')).length)} detail="Esquemas topográficos" icon={FileText}/>
      <Stat label="Acidentes com Registo Técnico" value={String(new Set(evidenceList.map(e=>e.accidentId)).size)} detail="Cobertura pericial" icon={ShieldCheck}/>
    </div>

    <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
      <label className="flex max-w-md flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3">
        <Search size={16} className="text-[#737a70]"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por título, tipo, acidente ou descrição" className="w-full py-2 text-sm outline-none"/>
      </label>
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Anexar Fotografia ou Croqui'}</button>
    </div>

    {open&&<Drawer title="Anexar Prova Fotográfica ou Documento" onClose={()=>setOpen(false)}>
      <form onSubmit={submitEvidence} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Acidente Vinculado
          <select name="accidentId" value={selectedAccident} onChange={e=>setSelectedAccident(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {accidents.map(a=><option key={a.id} value={a.id}>{a.id} · {a.date} ({a.road})</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-[#4b5549]">Tipo de Anexo / Prova
          <select name="evidenceType" className={`mt-1.5 ${inputClass}`}>
            <option value="Fotografia do Local">Fotografia do Local</option>
            <option value="Fotografia do Ponto de Impacto">Fotografia do Ponto de Impacto</option>
            <option value="Fotografia dos Danos Veiculares">Fotografia dos Danos Veiculares</option>
            <option value="Croqui / Esquema da Via">Croqui / Esquema da Via</option>
            <option value="Ficha Médica / Boletim de Socorro">Ficha Médica / Boletim de Socorro</option>
            <option value="Certidão de Óbito">Certidão de Óbito</option>
          </select>
        </label>
        <Field label="Data do Registo" name="registrationDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <div className="sm:col-span-2">
          <Field label="Título / Identificação do Ficheiro" name="title" placeholder="Ex.: Vista panorâmica da colisão frontal"/>
        </div>
        <Field label="Caminho / URL da Imagem" name="fileUrl" defaultValue="/media/acidentes/foto_evidencia.jpg"/>
        <Field label="Perito / Autor do Registo" name="registeredBy" defaultValue="Perito da Brigada BNT"/>
        <div className="sm:col-span-2">
          <Field label="Descrição e Detalhes Periciais Observados" name="description" placeholder="Marcas de travagem, deformação dos eixos..."/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Guardar e Anexar Prova</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map(ev=><div key={ev.id} className="border border-[#dcd9cc] bg-white p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="border border-[#CE1126]/30 bg-[#CE1126]/10 px-2 py-0.5 text-[10px] font-bold text-[#9f1a2b]">{ev.evidenceType}</span>
            <span className="font-mono text-xs font-bold text-[#006B35]">{ev.accidentId}</span>
          </div>
          <div className="h-32 w-full bg-[#f4f3ed] border border-[#e9e6dc] grid place-items-center mb-3">
            <Camera size={36} className="text-[#9fb7a4]"/>
          </div>
          <h3 className="font-bold text-sm text-[#1c3024] leading-snug">{ev.title}</h3>
          <p className="mt-2 text-xs text-[#697168] line-clamp-2">{ev.description||'Sem descrição complementar.'}</p>
        </div>
        <div className="mt-4 pt-3 border-t border-[#f0eee7] flex justify-between items-center text-xs">
          <span className="text-[#737a70]">{ev.registrationDate}</span>
          <button type="button" onClick={()=>handleDelete(ev.id)} className="text-[#9f1a2b] font-semibold hover:underline">Remover</button>
        </div>
      </div>)}
    </div>
  </Shell>;
}

export function AccidentPoliceReportsPage(){
  const [accidents]=useSaved('accidents',seedAccidents);
  const [reports,setReports]=useSaved('accident-police-reports',seedAccidentPoliceReports);
  const [open,setOpen]=useState(false);
  const [selectedAccident,setSelectedAccident]=useState(accidents[0]?.id||'ACID-2026-0001');
  const [viewingReport,setViewingReport]=useState<AccidentPoliceReport|null>(null);
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [search,setSearch]=useState('');

  const filtered=useMemo(()=>reports.filter(r=>{
    return [r.id,r.reportNumber,r.accidentId,r.officerName,r.investigationSummary].join(' ').toLowerCase().includes(search.toLowerCase());
  }),[reports,search]);

  async function submitReport(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const summary=String(f.get('investigationSummary')||'').trim();
    if(!summary){setError('A conclusão pericial é obrigatória.');return;}

    const payload:AccidentPoliceReport={
      id:`BO-POL-2026-${String(Date.now()).slice(-4)}`,
      accidentId:String(f.get('accidentId')||selectedAccident),
      reportNumber:String(f.get('reportNumber')||`BO/BNT/2026/${String(Date.now()).slice(-4)}`).trim(),
      policeDepartment:String(f.get('policeDepartment')||'Brigada Nacional de Trânsito (BNT)').trim(),
      officerName:String(f.get('officerName')||'Subcomissário Malam Bacai').trim(),
      officerBadge:String(f.get('officerBadge')||'AG-GB-0104').trim(),
      reportDate:String(f.get('reportDate')||new Date().toISOString().slice(0,10)),
      investigationSummary:summary,
      infractionsFound:String(f.get('infractionsFound')||'').trim(),
      legalReferral:String(f.get('legalReferral')||'Remetido ao Ministério Público').trim(),
      procedureStatus:String(f.get('procedureStatus')||'Concluído'),
      notes:String(f.get('notes')||'').trim(),
    };

    try{
      setError('');setSuccessMsg('');
      const res=await api.post<AccidentPoliceReport>('/accident-police-reports',payload);
      setReports([res.data,...reports]);
      setSuccessMsg(`Boletim de ocorrência policial ${res.data.reportNumber} lavrado com sucesso.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao emitir o relatório policial.');
    }
  }

  async function handleDelete(id:string){
    if(!window.confirm('Deseja realmente remover este relatório policial?'))return;
    try{
      await api.delete(`/accident-police-reports/${encodeURIComponent(id)}`);
    }catch{/* ignore */}
    setReports(rows=>rows.filter(r=>r.id!==id));
  }

  return <Shell>
    <Title eyebrow="Gestão de acidentes rodoviários · Submenu 6" title="Relatórios policiais" description="Emissão de boletins de ocorrência (BO), pareceres periciais de acidentologia rodoviária e encaminhamento judicial ao Ministério Público." icon={FileText}/>
    <AccidentSubmenuBar/>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <Stat label="Boletins de Ocorrência" value={String(reports.length)} detail="Participações policiais" icon={FileText}/>
      <Stat label="Remetidos a Tribunal" value={String(reports.filter(r=>r.legalReferral.includes('Ministério Público')||r.legalReferral.includes('Tribunal')).length)} detail="Processos judiciais" icon={ShieldCheck}/>
      <Stat label="Peritagens Concluídas" value={String(reports.filter(r=>r.procedureStatus==='Concluído').length)} detail="Autos homologados" icon={Check}/>
    </div>

    <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
      <label className="flex max-w-md flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3">
        <Search size={16} className="text-[#737a70]"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por n.º de boletim, agente, acidente ou conclusão" className="w-full py-2 text-sm outline-none"/>
      </label>
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Lavrar Boletim de Ocorrência'}</button>
    </div>

    {viewingReport&&<PoliceReportPrintModal report={viewingReport} accident={accidents.find(a=>a.id===viewingReport.accidentId)} onClose={()=>setViewingReport(null)}/>}

    {open&&<Drawer title="Lavrar Boletim Oficial de Ocorrência de Acidente" onClose={()=>setOpen(false)}>
      <form onSubmit={submitReport} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Acidente Objeto da Peritagem
          <select name="accidentId" value={selectedAccident} onChange={e=>setSelectedAccident(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {accidents.map(a=><option key={a.id} value={a.id}>{a.id} · {a.date} ({a.road})</option>)}
          </select>
        </label>
        <Field label="N.º do Boletim de Ocorrência (BO)" name="reportNumber" defaultValue={`BO/BNT/2026/0${Math.floor(Math.random()*900+100)}`}/>
        <Field label="Órgão Policial / Unidade" name="policeDepartment" defaultValue="Brigada Nacional de Trânsito (BNT)"/>
        <Field label="Agente / Perito Autuante" name="officerName" defaultValue="Subcomissário Malam Bacai"/>
        <Field label="N.º de Crachá / Matrícula Policial" name="officerBadge" defaultValue="AG-GB-0104"/>
        <Field label="Data da Conclusão do Relatório" name="reportDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <label className="block text-xs font-semibold text-[#4b5549]">Estado do Procedimento
          <select name="procedureStatus" className={`mt-1.5 ${inputClass}`}>
            <option value="Concluído">Concluído</option>
            <option value="Em Tramitação">Em Tramitação</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <Field label="Conclusão Pericial e Dinâmica do Acidente" name="investigationSummary" placeholder="Descrição técnica das trajetórias, infrações e causas diretas..."/>
        </div>
        <div className="sm:col-span-2">
          <Field label="Infrações Constatadas ao Código da Estrada" name="infractionsFound" defaultValue="Art. 38.º (Ultrapassagem indevida) e Art. 24.º (Excesso de velocidade)"/>
        </div>
        <div className="sm:col-span-2">
          <Field label="Encaminhamento Legal / Destino dos Autos" name="legalReferral" defaultValue="Remetido ao Ministério Público / Tribunal Regional de Bissau"/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Emitir e Homologar Boletim</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º Boletim (BO)','Acidente','Corporação Policial','Agente / Perito','Data','Conclusão Pericial','Infrações Constatadas','Encaminhamento','Estado','Ações'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(r=><tr key={r.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold text-[#CE1126] whitespace-nowrap">{r.reportNumber}</td>
            <td className="px-3 py-3 font-mono font-semibold text-[#006B35] whitespace-nowrap">{r.accidentId}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{r.policeDepartment}</td>
            <td className="px-3 py-3 whitespace-nowrap">
              <span className="font-semibold text-[#1c3024]">{r.officerName}</span>
              <span className="block text-[11px] text-[#737a70]">{r.officerBadge}</span>
            </td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{r.reportDate}</td>
            <td className="px-3 py-3 text-xs max-w-xs">{r.investigationSummary}</td>
            <td className="px-3 py-3 text-xs text-[#9f1a2b] max-w-xs">{r.infractionsFound||'—'}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap font-medium text-[#173d2b]">{r.legalReferral}</td>
            <td className="px-3 py-3 whitespace-nowrap"><Status value={r.procedureStatus}/></td>
            <td className="px-3 py-3 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <button type="button" onClick={()=>setViewingReport(r)} className="text-xs font-semibold text-[#006B35] hover:underline">Ver / Imprimir</button>
                <span className="text-[#d5d1c2]">|</span>
                <button type="button" onClick={()=>handleDelete(r.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Remover</button>
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function AccidentWitnessesPage(){
  const [accidents]=useSaved('accidents',seedAccidents);
  const [witnesses,setWitnesses]=useSaved('accident-witnesses',seedAccidentWitnesses);
  const [open,setOpen]=useState(false);
  const [selectedAccident,setSelectedAccident]=useState(accidents[0]?.id||'ACID-2026-0001');
  const [error,setError]=useState('');
  const [successMsg,setSuccessMsg]=useState('');
  const [search,setSearch]=useState('');

  const filtered=useMemo(()=>witnesses.filter(w=>{
    return [w.id,w.accidentId,w.name,w.statement||'',w.phone||''].join(' ').toLowerCase().includes(search.toLowerCase());
  }),[witnesses,search]);

  async function submitWitness(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget;
    const f=new FormData(formEl);
    const name=String(f.get('name')||'').trim();
    if(!name){setError('O nome da testemunha é obrigatório.');return;}

    const payload:AccidentWitness={
      id:`TST-2026-${String(Date.now()).slice(-4)}`,
      accidentId:String(f.get('accidentId')||selectedAccident),
      name,
      document:String(f.get('document')||'').trim(),
      phone:String(f.get('phone')||'').trim(),
      address:String(f.get('address')||'').trim(),
      locationAtMoment:String(f.get('locationAtMoment')||'Peão no local').trim(),
      statement:String(f.get('statement')||'').trim(),
      statementDate:String(f.get('statementDate')||new Date().toISOString().slice(0,10)),
    };

    try{
      setError('');setSuccessMsg('');
      const res=await api.post<AccidentWitness>('/accident-witnesses',payload);
      setWitnesses([res.data,...witnesses]);
      setSuccessMsg(`Depoimento da testemunha ${name} registado com sucesso.`);
      formEl.reset();
      window.dispatchEvent(new Event('sigetran:drawer-close'));
    }catch(err:any){
      setError(err?.response?.data?.error||'Falha ao registar testemunha.');
    }
  }

  async function handleDelete(id:string){
    if(!window.confirm('Deseja realmente remover esta testemunha?'))return;
    try{
      await api.delete(`/accident-witnesses/${encodeURIComponent(id)}`);
    }catch{/* ignore */}
    setWitnesses(rows=>rows.filter(w=>w.id!==id));
  }

  return <Shell>
    <Title eyebrow="Gestão de acidentes rodoviários · Submenu 7" title="Identificação de testemunhas" description="Depoimentos colhidos de transeuntes, condutores e testemunhas oculares para reconstituição pericial e instrução de processos." icon={Users}/>
    <AccidentSubmenuBar/>

    {successMsg&&<div className="mb-4 flex items-center justify-between border border-[#009E49]/40 bg-[#009E49]/10 px-4 py-3 text-sm font-medium text-[#006B35]"><span><Check size={16} className="mr-2 inline"/>{successMsg}</span><button type="button" onClick={()=>setSuccessMsg('')} className="text-xs underline">Fechar</button></div>}

    <div className="mb-6 grid gap-3 sm:grid-cols-2">
      <Stat label="Testemunhas Arroladas" value={String(witnesses.length)} detail="Depoimentos recolhidos" icon={Users}/>
      <Stat label="Acidentes com Testemunho" value={String(new Set(witnesses.map(w=>w.accidentId)).size)} detail="Processos instruídos" icon={ShieldCheck}/>
    </div>

    <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
      <label className="flex max-w-md flex-1 items-center gap-2 border border-[#d5d1c2] bg-white px-3">
        <Search size={16} className="text-[#737a70]"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por nome, contacto, acidente ou depoimento" className="w-full py-2 text-sm outline-none"/>
      </label>
      <button onClick={()=>{setOpen(!open);setError('');}} className={primaryClass}><FilePlus2 size={16}/>{open?'Fechar':'Tomar Depoimento de Testemunha'}</button>
    </div>

    {open&&<Drawer title="Tomada de Declarações de Testemunha Ocular" onClose={()=>setOpen(false)}>
      <form onSubmit={submitWitness} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#4b5549] sm:col-span-2">Acidente Objeto do Depoimento
          <select name="accidentId" value={selectedAccident} onChange={e=>setSelectedAccident(e.target.value)} className={`mt-1.5 ${inputClass}`}>
            {accidents.map(a=><option key={a.id} value={a.id}>{a.id} · {a.date} ({a.road})</option>)}
          </select>
        </label>
        <Field label="Nome da Testemunha" name="name" placeholder="Nome completo"/>
        <Field label="BI / Identificação" name="document" placeholder="BI 000881920"/>
        <Field label="Contacto Telefónico" name="phone" placeholder="+245 955 "/>
        <Field label="Morada / Residência" name="address" placeholder="Bairro / Cidade"/>
        <Field label="Data da Declaração" name="statementDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
        <Field label="Posição no Momento do Acidente" name="locationAtMoment" defaultValue="Peão no passeio"/>
        <div className="sm:col-span-2">
          <Field label="Depoimento / Relato dos Factos Observados" name="statement" placeholder="Descreva pormenorizadamente a dinâmica presenciada..."/>
        </div>
        <div className="sm:col-span-2 flex items-end pt-2">
          <button className={primaryClass}>Assentar Declaração Testemunhal</button>
        </div>
      </form>
      {error&&<p role="alert" className="mt-3 text-sm text-[#9f1a2b]">{error}</p>}
    </Drawer>}

    <div className="overflow-x-auto border border-[#dcd9cc] bg-white p-4">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
          <tr>{['N.º Testemunha','Acidente','Nome da Testemunha','Contacto / BI','Morada','Posição no Momento','Declaração / Depoimento','Data','Ação'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(w=><tr key={w.id} className="border-b border-[#f0eee7]">
            <td className="px-3 py-3 font-mono text-xs font-bold whitespace-nowrap">{w.id}</td>
            <td className="px-3 py-3 font-mono font-semibold text-[#006B35] whitespace-nowrap">{w.accidentId}</td>
            <td className="px-3 py-3 whitespace-nowrap font-semibold text-[#1c3024]">{w.name}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">
              <div>{w.phone||'Sem telefone'}</div>
              <span className="text-[#737a70]">{w.document}</span>
            </td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{w.address||'—'}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap font-medium text-[#173d2b]">{w.locationAtMoment}</td>
            <td className="px-3 py-3 text-xs max-w-xs">{w.statement}</td>
            <td className="px-3 py-3 text-xs whitespace-nowrap">{w.statementDate}</td>
            <td className="px-3 py-3 whitespace-nowrap">
              <button type="button" onClick={()=>handleDelete(w.id)} className="text-xs font-semibold text-[#9f1a2b] hover:underline">Remover</button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>;
}

export function AccidentStatisticsPage(){
  const [accidents]=useSaved('accidents',seedAccidents);

  const totalAccidents=accidents.length;
  const totalFatalities=useMemo(()=>accidents.reduce((s,a)=>s+(a.fatalitiesCount||0),0),[accidents]);
  const totalInjured=useMemo(()=>accidents.reduce((s,a)=>s+(a.injuredCount||0),0),[accidents]);
  const totalVehicles=useMemo(()=>accidents.reduce((s,a)=>s+(a.vehiclesInvolved||0),0),[accidents]);

  const regionalStats=useMemo(()=>{
    const map=new Map<string,{region:string;count:number;fatalities:number;injured:number;vehicles:number}>();
    for(const a of accidents){
      const reg=a.region||'Setor Autónomo de Bissau';
      if(!map.has(reg)){
        map.set(reg,{region:reg,count:0,fatalities:0,injured:0,vehicles:0});
      }
      const entry=map.get(reg)!;
      entry.count+=1;
      entry.fatalities+=(a.fatalitiesCount||0);
      entry.injured+=(a.injuredCount||0);
      entry.vehicles+=(a.vehiclesInvolved||0);
    }
    return Array.from(map.values()).sort((a,b)=>b.count-a.count);
  },[accidents]);

  const severityStats=useMemo(()=>{
    const map=new Map<string,number>();
    for(const a of accidents){
      map.set(a.severity,(map.get(a.severity)||0)+1);
    }
    return Array.from(map.entries()).map(([label,count])=>({label,count}));
  },[accidents]);

  const causeStats=useMemo(()=>{
    const map=new Map<string,number>();
    for(const a of accidents){
      map.set(a.probableCause,(map.get(a.probableCause)||0)+1);
    }
    return Array.from(map.entries()).map(([cause,count])=>({cause,count})).sort((a,b)=>b.count-a.count);
  },[accidents]);

  return <Shell>
    <Title eyebrow="Gestão de acidentes rodoviários · Submenu 8" title="Estatísticas de acidentes por região" description="Sala de situação nacional de acidentologia rodoviária, indicadores de mortalidade, sinistralidade regional e causas determinantes." icon={FileBarChart2}/>
    <AccidentSubmenuBar/>

    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Total de Sinistros" value={String(totalAccidents)} detail="Ocorrências nacionais" icon={ShieldAlert}/>
      <Stat label="Vítimas Mortais" value={String(totalFatalities)} detail="Taxa de fatalidade" icon={UserX}/>
      <Stat label="Total de Feridos" value={String(totalInjured)} detail="Feridos graves e ligeiros" icon={AlertTriangle}/>
      <Stat label="Veículos Sinistrados" value={String(totalVehicles)} detail="Danos materiais reportados" icon={CarFront}/>
    </div>

    <div className="mb-6 flex justify-end">
      <button onClick={()=>window.print()} className={primaryClass}><Printer size={15}/> Imprimir Relatório Estatístico Nacional</button>
    </div>

    <div className="mb-6 border border-[#dcd9cc] bg-white p-5">
      <h2 className="mb-4 border-b border-[#e9e6dc] pb-3 font-serif text-lg font-bold text-[#1c3024]">Distribuição e Gravidade dos Acidentes por Região da Guiné-Bissau</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-[10px] uppercase tracking-wider text-[#737a70]">
            <tr>{['Região / Distrito','Total Sinistros','Vítimas Mortais','Feridos','Veículos Envolvidos','% Sinistralidade'].map(x=><th key={x} className="whitespace-nowrap px-3 py-3">{x}</th>)}</tr>
          </thead>
          <tbody>
            {regionalStats.map(r=>{
              const pct=totalAccidents>0?Math.round((r.count/totalAccidents)*100):0;
              return <tr key={r.region} className="border-b border-[#f0eee7]">
                <td className="px-3 py-3 font-semibold text-[#1c3024]">{r.region}</td>
                <td className="px-3 py-3 font-mono font-bold text-sm text-[#006B35]">{r.count}</td>
                <td className="px-3 py-3 font-mono text-xs text-[#CE1126] font-bold">{r.fatalities}</td>
                <td className="px-3 py-3 font-mono text-xs text-[#836300] font-semibold">{r.injured}</td>
                <td className="px-3 py-3 font-mono text-xs">{r.vehicles}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-[#eeede5] h-2">
                      <div className="bg-[#CE1126] h-full" style={{width:`${Math.max(8,pct)}%`}}/>
                    </div>
                    <span className="text-xs font-semibold">{pct}%</span>
                  </div>
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <div className="border border-[#dcd9cc] bg-white p-5">
        <h3 className="font-serif text-base font-bold text-[#1c3024] mb-3 border-b border-[#e9e6dc] pb-2">Distribuição por Gravidade do Sinistro</h3>
        <div className="space-y-3">
          {severityStats.map(s=><div key={s.label} className="flex justify-between items-center text-xs border-b border-[#f4f3ed] pb-2">
            <Status value={s.label}/>
            <span className="font-mono font-bold text-sm text-[#1c3024]">{s.count} ({totalAccidents>0?Math.round((s.count/totalAccidents)*100):0}%)</span>
          </div>)}
        </div>
      </div>

      <div className="border border-[#dcd9cc] bg-white p-5">
        <h3 className="font-serif text-base font-bold text-[#1c3024] mb-3 border-b border-[#e9e6dc] pb-2">Principais Causas Prováveis Identificadas</h3>
        <div className="space-y-3">
          {causeStats.map(c=><div key={c.cause} className="text-xs">
            <div className="flex justify-between mb-1">
              <span className="font-medium text-[#1c3024]">{c.cause}</span>
              <b className="font-mono">{c.count}</b>
            </div>
            <div className="w-full bg-[#eeede5] h-1.5">
              <div className="bg-[#009E49] h-full" style={{width:`${Math.max(10,Math.round((c.count/totalAccidents)*100))}%`}}/>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  </Shell>;
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

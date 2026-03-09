import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import api from './api';

// Create a mock adapter instance on the axios instance
const mock = new MockAdapter(api, { delayResponse: 500 });

export const setupMocks = () => {
  // Auth
  mock.onPost('/auth/login').reply((config) => {
    const { email, password, type } = JSON.parse(config.data);
    
    if (type === 'server') {
      if (email === 'servidor@procon.pb.gov.br' && password === 'procon2026') {
        return [200, {
          token: 'fake-jwt-token-server',
          user: {
            id: 101,
            name: 'Carlos Servidor',
            email: 'servidor@procon.pb.gov.br',
            role: 'admin',
          },
        }];
      }
    } else if (type === 'citizen') {
      if (email === 'cidadao@email.com' && password === 'cidadao2026') {
        return [200, {
          token: 'fake-jwt-token-citizen',
          user: {
            id: 202,
            name: 'João Cidadão',
            email: 'cidadao@email.com',
            role: 'citizen',
          },
        }];
      }
    }

    // Default legacy support for admin
    if (email === 'admin@procon.pb.gov.br' && password === 'admin123') {
      return [200, {
        token: 'fake-jwt-token',
        user: {
          id: 1,
          name: 'Administrador',
          email: 'admin@procon.pb.gov.br',
          role: 'admin',
        },
      }];
    }

    return [401, { message: 'Credenciais inválidas' }];
  });

  // Dashboard Stats
  mock.onGet('/dashboard/stats').reply(200, {
    totalCases: 1250,
    openCases: 45,
    consumers: 3200,
    suppliers: 150,
    documents: 5600,
  });

  // Consumers
  const realConsumers = [
    { name: 'Ana Maria Silva', cpf: '123.456.789-00', email: 'ana.silva@email.com', phone: '(83) 99999-1234' },
    { name: 'João Pedro Santos', cpf: '234.567.890-11', email: 'joao.santos@email.com', phone: '(83) 98888-5678' },
    { name: 'Maria José Oliveira', cpf: '345.678.901-22', email: 'maria.oliveira@email.com', phone: '(83) 97777-9012' },
    { name: 'Carlos Eduardo Souza', cpf: '456.789.012-33', email: 'carlos.souza@email.com', phone: '(83) 96666-3456' },
    { name: 'Fernanda Lima', cpf: '567.890.123-44', email: 'fernanda.lima@email.com', phone: '(83) 95555-7890' },
    { name: 'Paulo Roberto Alves', cpf: '678.901.234-55', email: 'paulo.alves@email.com', phone: '(83) 94444-1234' },
    { name: 'Juliana Costa', cpf: '789.012.345-66', email: 'juliana.costa@email.com', phone: '(83) 93333-5678' },
    { name: 'Ricardo Pereira', cpf: '890.123.456-77', email: 'ricardo.pereira@email.com', phone: '(83) 92222-9012' },
    { name: 'Camila Rodrigues', cpf: '901.234.567-88', email: 'camila.rodrigues@email.com', phone: '(83) 91111-3456' },
    { name: 'Lucas Ferreira', cpf: '012.345.678-99', email: 'lucas.ferreira@email.com', phone: '(83) 99999-7890' },
    { name: 'Beatriz Almeida', cpf: '123.456.789-10', email: 'beatriz.almeida@email.com', phone: '(83) 98888-1234' },
    { name: 'Gustavo Barbosa', cpf: '234.567.890-21', email: 'gustavo.barbosa@email.com', phone: '(83) 97777-5678' },
    { name: 'Patrícia Gomes', cpf: '345.678.901-32', email: 'patricia.gomes@email.com', phone: '(83) 96666-9012' },
    { name: 'Rodrigo Martins', cpf: '456.789.012-43', email: 'rodrigo.martins@email.com', phone: '(83) 95555-3456' },
    { name: 'Larissa Rocha', cpf: '567.890.123-54', email: 'larissa.rocha@email.com', phone: '(83) 94444-7890' },
    { name: 'Marcelo Ribeiro', cpf: '678.901.234-65', email: 'marcelo.ribeiro@email.com', phone: '(83) 93333-1234' },
    { name: 'Daniela Carvalho', cpf: '789.012.345-76', email: 'daniela.carvalho@email.com', phone: '(83) 92222-5678' },
    { name: 'Felipe Mendes', cpf: '890.123.456-87', email: 'felipe.mendes@email.com', phone: '(83) 91111-9012' },
    { name: 'Tatiana Nunes', cpf: '901.234.567-98', email: 'tatiana.nunes@email.com', phone: '(83) 99999-3456' },
    { name: 'André Cardoso', cpf: '012.345.678-09', email: 'andre.cardoso@email.com', phone: '(83) 98888-7890' },
  ];

  mock.onGet(/\/consumers\/?(\?.*)?$/).reply(200, {
    data: realConsumers.map((c, i) => ({
      id: i + 1,
      ...c,
      status: i % 10 === 0 ? 'Inativo' : 'Ativo',
      createdAt: new Date().toISOString(),
      city: 'João Pessoa',
      state: 'PB',
    })),
    total: 20,
  });

  mock.onGet(/\/consumers\/\d+$/).reply(200, {
    id: 1,
    name: 'Ana Maria Silva',
    cpf: '123.456.789-00',
    email: 'ana.silva@email.com',
    phone: '(83) 99999-1234',
    status: 'Ativo',
    address: 'Av. Epitácio Pessoa, 1000',
    city: 'João Pessoa',
    state: 'PB',
    createdAt: new Date().toISOString(),
  });

  mock.onPost('/consumers').reply(201, { id: 99 });
  mock.onPut(/\/consumers\/\d+$/).reply(200, {});
  mock.onDelete(/\/consumers\/\d+$/).reply(204);

  // Suppliers
  const realSuppliers = [
    { name: 'Magazine Luiza S/A', cnpj: '47.960.950/0001-21', category: 'Varejo' },
    { name: 'Casas Bahia Ltda', cnpj: '33.041.260/0652-90', category: 'Varejo' },
    { name: 'Carrefour Comércio e Indústria', cnpj: '45.543.915/0001-81', category: 'Supermercado' },
    { name: 'Supermercado Preço Bom', cnpj: '12.345.678/0001-99', category: 'Supermercado' },
    { name: 'Oi Móvel S.A.', cnpj: '05.423.963/0001-11', category: 'Telefonia' },
    { name: 'Claro S.A.', cnpj: '40.432.544/0001-47', category: 'Telefonia' },
    { name: 'Vivo S.A.', cnpj: '02.558.157/0001-62', category: 'Telefonia' },
    { name: 'Cagepa', cnpj: '09.123.456/0001-00', category: 'Serviços Públicos' },
    { name: 'Energisa Paraíba', cnpj: '08.876.543/0001-22', category: 'Serviços Públicos' },
    { name: 'Banco do Brasil S.A.', cnpj: '00.000.000/0001-91', category: 'Bancário' },
    { name: 'Caixa Econômica Federal', cnpj: '00.360.305/0001-04', category: 'Bancário' },
    { name: 'Bradesco S.A.', cnpj: '60.746.948/0001-12', category: 'Bancário' },
    { name: 'Samsung Eletrônica da Amazônia', cnpj: '00.280.273/0001-37', category: 'Eletrônicos' },
    { name: 'Apple Computer Brasil', cnpj: '00.623.904/0003-35', category: 'Eletrônicos' },
    { name: 'Gol Linhas Aéreas', cnpj: '07.575.651/0001-59', category: 'Transporte' },
  ];

  mock.onGet(/\/suppliers\/?(\?.*)?$/).reply(200, {
    data: realSuppliers.map((s, i) => ({
      id: i + 1,
      name: s.name,
      cnpj: s.cnpj,
      email: `contato@${s.name.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '')}.com.br`,
      phone: '(83) 3222-0000',
      status: 'Ativo',
      category: s.category,
    })),
    total: 15,
  });

  mock.onGet(/\/suppliers\/\d+$/).reply(200, {
    id: 1,
    name: 'Magazine Luiza S/A',
    cnpj: '47.960.950/0001-21',
    email: 'contato@magazineluiza.com.br',
    phone: '(83) 3222-0000',
    status: 'Ativo',
    category: 'Varejo',
    address: 'Rua Duque de Caxias, 500 - Centro',
    city: 'João Pessoa',
    state: 'PB',
  });

  mock.onPost('/suppliers').reply(201, { id: 99 });
  mock.onPut(/\/suppliers\/\d+$/).reply(200, {});
  mock.onDelete(/\/suppliers\/\d+$/).reply(204);

  // Cases (Atendimentos)
  const caseSubjects = [
    'Cobrança indevida',
    'Produto com defeito',
    'Atraso na entrega',
    'Serviço não prestado',
    'Publicidade enganosa',
    'Cancelamento de contrato',
    'Venda casada',
    'Reajuste abusivo',
    'Negativação indevida',
    'Danos materiais'
  ];

  const caseDescriptions = [
    'Consumidor relata que recebeu uma fatura com valor acima do contratado e não conseguiu contato com a empresa.',
    'Produto apresentou defeito após 1 semana de uso e a loja se recusa a trocar.',
    'Compra realizada pela internet não foi entregue no prazo estipulado.',
    'Contratou serviço de internet que não está funcionando conforme velocidade prometida.',
    'Oferta anunciada não foi cumprida no momento do pagamento.',
    'Solicitou cancelamento do serviço mas continua recebendo cobranças.',
    'Foi obrigado a contratar seguro para obter o cartão de crédito.',
    'Mensalidade escolar teve aumento acima da inflação sem justificativa.',
    'Nome incluído no SPC/Serasa por dívida já paga.',
    'Teve prejuízo financeiro devido a falha na prestação do serviço bancário.'
  ];

  mock.onGet(/\/cases\/?(\?.*)?$/).reply(200, {
    data: Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      protocol: `2024${String(i + 1).padStart(6, '0')}`,
      consumerId: i + 1,
      consumerName: realConsumers[i % realConsumers.length].name,
      supplierId: i + 1,
      supplierName: realSuppliers[i % realSuppliers.length].name,
      status: ['Aberto', 'Em Andamento', 'Concluído'][i % 3],
      priority: ['Baixa', 'Média', 'Alta', 'Urgente'][i % 4],
      date: new Date().toISOString(),
      subject: caseSubjects[i % caseSubjects.length],
      description: caseDescriptions[i % caseDescriptions.length],
      createdAt: new Date().toISOString(),
    })),
    total: 10,
  });

  mock.onGet(/\/cases\/\d+$/).reply(200, {
    id: 1,
    protocol: '2024000001',
    consumerId: 1,
    consumerName: 'Ana Maria Silva',
    supplierId: 1,
    supplierName: 'Magazine Luiza S/A',
    status: 'Aberto',
    priority: 'Alta',
    subject: 'Cobrança Indevida',
    description: 'A consumidora relata que recebeu uma cobrança indevida referente ao mês de Janeiro no valor de R$ 150,00, sendo que o plano contratado é de R$ 99,00. Solicita correção da fatura e devolução em dobro do valor pago a maior.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  mock.onPost('/cases').reply(201, { id: 99 });
  
  // Case Messages
  mock.onGet(/\/cases\/\d+\/messages$/).reply(200, [
    {
      id: 1,
      caseId: 1,
      senderId: 1, // Admin
      senderName: 'Administrador',
      content: 'Processo aberto. Aguardando manifestação do fornecedor no prazo legal de 10 dias.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isInternal: true,
    },
    {
      id: 2,
      caseId: 1,
      senderId: 2, // Supplier (mock)
      senderName: 'Magazine Luiza S/A',
      content: 'Recebemos a reclamação e estamos analisando o caso internamente. Retornaremos em breve.',
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      isInternal: false,
    },
  ]);

  mock.onPost(/\/cases\/\d+\/messages$/).reply(201, {
    id: 3,
    content: 'Nova mensagem enviada',
    createdAt: new Date().toISOString(),
  });

  // Documents
  mock.onGet(/\/documents\/?(\?.*)?$/).reply(200, {
    data: Array.from({ length: 15 }).map((_, i) => ({
      id: i + 1,
      title: `Documento_Processo_${2024000 + i}.pdf`,
      type: 'PDF',
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      category: ['Contrato', 'Fatura', 'Identidade', 'Procuração', 'Comprovante'][i % 5],
      uploadedBy: 'Administrador',
      createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      url: '#',
    })),
    total: 15,
  });

  mock.onPost('/documents').reply(201, { id: 99 });
  mock.onDelete(/\/documents\/\d+$/).reply(204);

  // Inspections (Fiscalizações)
  mock.onGet(/\/inspections\/?(\?.*)?$/).reply(200, {
    data: Array.from({ length: 8 }).map((_, i) => ({
      id: i + 1,
      supplierName: realSuppliers[i % realSuppliers.length].name,
      address: `Av. Epitácio Pessoa, ${1000 + (i * 50)}`,
      date: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      status: ['Agendada', 'Realizada', 'Cancelada'][i % 3],
      result: ['Regular', 'Irregular', 'Pendente'][i % 3],
      inspector: 'Fiscal João',
    })),
    total: 8,
  });

  // Overindebtedness (Superendividamento)
  mock.onGet(/\/overindebtedness\/?(\?.*)?$/).reply(200, {
    data: Array.from({ length: 5 }).map((_, i) => ({
      id: i + 1,
      consumerName: realConsumers[i % realConsumers.length].name,
      totalDebt: (Math.random() * 50000 + 10000).toFixed(2),
      creditorsCount: Math.floor(Math.random() * 5) + 2,
      status: ['Em Análise', 'Audiência Agendada', 'Acordo Realizado'][i % 3],
      requestDate: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    })),
    total: 5,
  });

  // Hearings (Audiências)
  mock.onGet(/\/hearings\/?(\?.*)?$/).reply(200, {
    data: Array.from({ length: 12 }).map((_, i) => ({
      id: i + 1,
      caseProtocol: `2024${String(i + 1).padStart(6, '0')}`,
      date: new Date(Date.now() + Math.random() * 1000000000).toISOString(), // Future dates
      room: `Sala ${Math.floor(Math.random() * 5) + 1}`,
      mediator: 'Conciliadora Maria',
      status: 'Agendada',
    })),
    total: 12,
  });

  // Pass through any unhandled requests
  mock.onAny().passThrough();
};

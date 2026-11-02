from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import (
    Vehicle, Driver, Fine, InfractionType, VehicleInspection, SystemUser, SystemConfig,
    Consumer, Supplier, Case, CaseMessage, Document,
    ProconInspection, Overindebtedness, Hearing
)


def ensure_seed_data():
    """Popula o banco de dados PostgreSQL 'procon' com os dados iniciais se estiver vazio."""
    # 1. Utilizador Django padrão
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@procon.pb.gov.br', '123456')

    # 2. SIGETRAN: Veículos
    if not Vehicle.objects.exists():
        seed_vehicles = [
            {
                'plate': 'GB-24-BC', 'make': 'Toyota', 'model': 'Corolla', 'year': 2018,
                'owner': 'Mamadu Embaló', 'driver': 'Mamadu Embaló', 'tax_due': 41500,
                'district': 'Bissau', 'category': 'Ligeiro particular'
            },
            {
                'plate': 'GB-19-AA', 'make': 'Suzuki', 'model': 'Carry', 'year': 2020,
                'owner': 'Adama Baldé', 'driver': 'Bacar Camará', 'tax_due': 0,
                'district': 'Bafatá', 'category': 'Transporte misto'
            },
            {
                'plate': 'GB-22-CD', 'make': 'Mercedes-Benz', 'model': 'Sprinter', 'year': 2017,
                'owner': 'Transportes Cacheu', 'driver': 'Ibraima Sanhá', 'tax_due': 83000,
                'district': 'Cacheu', 'category': 'Transporte colectivo'
            },
            {
                'plate': 'GB-23-FA', 'make': 'Honda', 'model': 'Wave', 'year': 2022,
                'owner': 'Naima Mané', 'driver': 'Naima Mané', 'tax_due': 0,
                'district': 'Gabú', 'category': 'Motociclo'
            },
        ]
        for v in seed_vehicles:
            Vehicle.objects.create(**v)

    # 3. SIGETRAN: Condutores
    if not Driver.objects.exists():
        seed_drivers = [
            {
                'code': 'D-001', 'name': 'Mamadu Embaló', 'document': '000000001',
                'license': 'GB-C-10294', 'category': 'Ligeiros',
                'phone': '+245 955 100 201', 'district': 'Bissau', 'status': 'Ativo'
            },
            {
                'code': 'D-002', 'name': 'Bacar Camará', 'document': '000000002',
                'license': 'GB-C-08142', 'category': 'Ligeiros e mercadorias',
                'phone': '+245 966 200 142', 'district': 'Bafatá', 'status': 'Ativo'
            },
            {
                'code': 'D-003', 'name': 'Ibraima Sanhá', 'document': '000000003',
                'license': 'GB-D-07331', 'category': 'Pesados',
                'phone': '+245 955 300 733', 'district': 'Cacheu', 'status': 'Ativo'
            },
            {
                'code': 'D-004', 'name': 'Naima Mané', 'document': '000000004',
                'license': 'GB-A-11620', 'category': 'Motociclos',
                'phone': '+245 966 400 620', 'district': 'Gabú', 'status': 'Ativo'
            },
        ]
        for d in seed_drivers:
            Driver.objects.create(**d)

    # 4. SIGETRAN: Multas
    if not Fine.objects.exists():
        seed_fines = [
            {
                'code': 'GB-2026-0014', 'plate': 'GB-24-BC', 'driver': 'Mamadu Embaló',
                'infraction': 'Documentação em falta', 'amount': 25000,
                'date': '2026-09-18', 'status': 'Pendente'
            },
            {
                'code': 'GB-2026-0015', 'plate': 'GB-24-BC', 'driver': 'Mamadu Embaló',
                'infraction': 'Estacionamento irregular', 'amount': 10000,
                'date': '2026-09-20', 'status': 'Pendente'
            },
            {
                'code': 'GB-2026-0016', 'plate': 'GB-22-CD', 'driver': 'Ibraima Sanhá',
                'infraction': 'Documentação em falta', 'amount': 35000,
                'date': '2026-09-21', 'status': 'Pendente'
            },
        ]
        for f in seed_fines:
            Fine.objects.create(**f)

    # 4b. SIGETRAN: Tabela de Infrações e Preços
    if not InfractionType.objects.exists():
        seed_infraction_types = [
            {'code': 'INF-001', 'name': 'Documentação em falta', 'amount': 25000, 'severity': 'Grave', 'description': 'Condução sem documentos obrigatórios do veículo ou condutor'},
            {'code': 'INF-002', 'name': 'Estacionamento irregular', 'amount': 10000, 'severity': 'Leve', 'description': 'Estacionamento em local proibido ou passeio público'},
            {'code': 'INF-003', 'name': 'Excesso de velocidade', 'amount': 35000, 'severity': 'Gravíssima', 'description': 'Velocidade superior ao limite regulamentar da via'},
            {'code': 'INF-004', 'name': 'Condução sem carta de condução', 'amount': 50000, 'severity': 'Gravíssima', 'description': 'Condutor não habilitado para a categoria do veículo'},
            {'code': 'INF-005', 'name': 'Falta de inspeção periódica', 'amount': 20000, 'severity': 'Média', 'description': 'Inspeção técnica veicular vencida ou inexistente'},
        ]
        for it in seed_infraction_types:
            InfractionType.objects.create(**it)

    # 5. SIGETRAN: Inspeções Veiculares
    if not VehicleInspection.objects.exists():
        seed_inspections = [
            {
                'code': 'ITV-0061', 'plate': 'GB-24-BC', 'reason': 'Inspeção periódica',
                'office': 'Bissau', 'date': '2026-10-28', 'status': 'Agendada'
            },
            {
                'code': 'ITV-0062', 'plate': 'GB-22-CD', 'reason': 'Verificação de segurança',
                'office': 'Cacheu', 'date': '2026-10-30', 'status': 'Agendada'
            },
        ]
        for i in seed_inspections:
            VehicleInspection.objects.create(**i)

    # 6. SIGETRAN: Utilizadores e Configuração
    if not SystemUser.objects.exists():
        SystemUser.objects.create(
            name='Administrador do sistema',
            email='admin@sigetran.gov.gw',
            password=make_password('123456'),
            role='Administrador',
            office='Direção Nacional',
            status='Ativo'
        )
        SystemUser.objects.create(
            name='Agente de trânsito',
            email='agente@sigetran.gov.gw',
            password=make_password('123456'),
            role='Fiscalização',
            office='Bissau',
            status='Ativo'
        )
        SystemUser.objects.create(
            name='Administrador PROCON',
            email='admin@example.com',
            password=make_password('123456'),
            role='Administrador',
            office='Sede Central',
            status='Ativo'
        )

    if not SystemConfig.objects.exists():
        SystemConfig.objects.create(
            institution='Ministério dos Transportes · Guiné-Bissau',
            system='SIGETRAN',
            currency='Franco CFA (XOF)',
            office='Bissau'
        )

    # 7. PROCON: Consumidores, Fornecedores, Processos, Documentos, Fiscalizações, Audiências
    if not Consumer.objects.exists():
        real_consumers = [
            ('Ana Maria Silva', '123.456.789-00', 'ana.silva@email.com', '(83) 99999-1234'),
            ('João Pedro Santos', '234.567.890-11', 'joao.santos@email.com', '(83) 98888-5678'),
            ('Maria José Oliveira', '345.678.901-22', 'maria.oliveira@email.com', '(83) 97777-9012'),
            ('Carlos Eduardo Souza', '456.789.012-33', 'carlos.souza@email.com', '(83) 96666-3456'),
            ('Fernanda Lima', '567.890.123-44', 'fernanda.lima@email.com', '(83) 95555-7890'),
            ('Paulo Roberto Alves', '678.901.234-55', 'paulo.alves@email.com', '(83) 94444-1234'),
            ('Juliana Costa', '789.012.345-66', 'juliana.costa@email.com', '(83) 93333-5678'),
            ('Ricardo Pereira', '890.123.456-77', 'ricardo.pereira@email.com', '(83) 92222-9012'),
            ('Camila Rodrigues', '901.234.567-88', 'camila.rodrigues@email.com', '(83) 91111-3456'),
            ('Lucas Ferreira', '012.345.678-99', 'lucas.ferreira@email.com', '(83) 99999-7890'),
        ]
        for idx, (name, cpf, email, phone) in enumerate(real_consumers):
            Consumer.objects.create(
                name=name,
                cpf=cpf,
                email=email,
                phone=phone,
                address=f'Av. Epitácio Pessoa, {1000 + idx * 50}',
                city='João Pessoa',
                state='PB',
                status='Ativo'
            )

    if not Supplier.objects.exists():
        real_suppliers = [
            ('Magazine Luiza S/A', '47.960.950/0001-21', 'Varejo'),
            ('Casas Bahia Ltda', '33.041.260/0652-90', 'Varejo'),
            ('Carrefour Comércio e Indústria', '45.543.915/0001-81', 'Supermercado'),
            ('Supermercado Preço Bom', '12.345.678/0001-99', 'Supermercado'),
            ('Oi Móvel S.A.', '05.423.963/0001-11', 'Telefonia'),
            ('Claro S.A.', '40.432.544/0001-47', 'Telefonia'),
            ('Vivo S.A.', '02.558.157/0001-62', 'Telefonia'),
            ('Cagepa', '09.123.456/0001-00', 'Serviços Públicos'),
            ('Energisa Paraíba', '08.876.543/0001-22', 'Serviços Públicos'),
            ('Banco do Brasil S.A.', '00.000.000/0001-91', 'Bancário'),
        ]
        for name, cnpj, category in real_suppliers:
            slug = ''.join(ch for ch in name.lower() if ch.isalnum())
            Supplier.objects.create(
                name=name,
                cnpj=cnpj,
                email=f'contato@{slug}.com.br',
                phone='(83) 3222-0000',
                address='Rua Duque de Caxias, 500 - Centro',
                city='João Pessoa',
                state='PB',
                status='Ativo',
                category=category
            )

    if not Case.objects.exists():
        consumers = list(Consumer.objects.all())
        suppliers = list(Supplier.objects.all())
        subjects = [
            ('Cobrança indevida', 'Consumidor relata que recebeu uma fatura com valor acima do contratado.'),
            ('Produto com defeito', 'Produto apresentou defeito após 1 semana de uso e a loja se recusa a trocar.'),
            ('Atraso na entrega', 'Compra realizada pela internet não foi entregue no prazo estipulado.'),
            ('Serviço não prestado', 'Contratou serviço de internet que não está funcionando conforme contratado.'),
            ('Cancelamento de contrato', 'Solicitou cancelamento do serviço mas continua recebendo cobranças.'),
        ]
        statuses = ['Aberto', 'Em Andamento', 'Concluído']
        priorities = ['Baixa', 'Média', 'Alta', 'Urgente']
        for i, (subj, desc) in enumerate(subjects):
            c = consumers[i % len(consumers)]
            s = suppliers[i % len(suppliers)]
            case_obj = Case.objects.create(
                protocol=f'2026{str(i + 1).zfill(6)}',
                consumer=c,
                consumer_name=c.name,
                supplier=s,
                supplier_name=s.name,
                status=statuses[i % len(statuses)],
                priority=priorities[i % len(priorities)],
                subject=subj,
                description=desc
            )
            if i == 0:
                CaseMessage.objects.create(
                    case=case_obj,
                    sender_id=1,
                    sender_name='Administrador',
                    content='Processo aberto. Aguardando manifestação do fornecedor no prazo legal de 10 dias.',
                    is_internal=True
                )
                CaseMessage.objects.create(
                    case=case_obj,
                    sender_id=2,
                    sender_name=s.name,
                    content='Recebemos a reclamação e estamos analisando o caso internamente.',
                    is_internal=False
                )

    if not Document.objects.exists():
        categories = ['Contrato', 'Fatura', 'Identidade', 'Procuração', 'Comprovante']
        for i in range(5):
            Document.objects.create(
                title=f'Documento_Processo_{2026001 + i}.pdf',
                doc_type='PDF',
                size=f'{1.2 + i * 0.5:.1f} MB',
                category=categories[i % len(categories)],
                uploaded_by='Administrador',
                url='#'
            )

    if not ProconInspection.objects.exists():
        suppliers = list(Supplier.objects.all())
        for i in range(5):
            ProconInspection.objects.create(
                supplier_name=suppliers[i % len(suppliers)].name,
                address=f'Av. Epitácio Pessoa, {1000 + i * 50}',
                date=timezone.now() - timedelta(days=i * 3),
                status=['Agendada', 'Realizada', 'Cancelada'][i % 3],
                result=['Regular', 'Irregular', 'Pendente'][i % 3],
                inspector='Fiscal João'
            )

    if not Overindebtedness.objects.exists():
        consumers = list(Consumer.objects.all())
        for i in range(5):
            Overindebtedness.objects.create(
                consumer_name=consumers[i % len(consumers)].name,
                total_debt=f'{15000 + i * 4500:.2f}',
                creditors_count=2 + (i % 4),
                status=['Em Análise', 'Audiência Agendada', 'Acordo Realizado'][i % 3],
                request_date=timezone.now() - timedelta(days=i * 5)
            )

    if not Hearing.objects.exists():
        for i in range(5):
            Hearing.objects.create(
                case_protocol=f'2026{str(i + 1).zfill(6)}',
                date=timezone.now() + timedelta(days=i + 2),
                room=f'Sala {(i % 3) + 1}',
                mediator='Conciliadora Maria',
                status='Agendada'
            )


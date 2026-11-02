from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import (
    Veiculo, OcorrenciaVeicular, HistoricoProprietario, Condutor, Multa, TipoInfracao, InspecaoVeicular, UsuarioSistema, ConfiguracaoSistema,
    Consumidor, Fornecedor, Processo, MensagemProcesso, Documento,
    Fiscalizacao, Superendividamento, Audiencia
)


def ensure_seed_data():
    """Popula o banco de dados PostgreSQL 'procon' com os dados iniciais nas tabelas em português."""
    # 1. Utilizador Django padrão
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@procon.pb.gov.br', '123456')

    # 2. SIGETRAN: Veículos (tabela 'veiculos')
    if not Veiculo.objects.exists():
        seed_veiculos = [
            {
                'placa': 'GB-24-BC', 'marca': 'Toyota', 'modelo': 'Corolla', 'ano': 2018, 'cor': 'Prata',
                'proprietario': 'Mamadu Embaló', 'condutor': 'Mamadu Embaló', 'imposto_devido': 41500,
                'distrito': 'Bissau', 'categoria': 'Ligeiro particular'
            },
            {
                'placa': 'GB-19-AA', 'marca': 'Suzuki', 'modelo': 'Carry', 'ano': 2020, 'cor': 'Branco',
                'proprietario': 'Adama Baldé', 'condutor': 'Bacar Camará', 'imposto_devido': 0,
                'distrito': 'Bafatá', 'categoria': 'Transporte misto'
            },
            {
                'placa': 'GB-22-CD', 'marca': 'Mercedes-Benz', 'modelo': 'Sprinter', 'ano': 2017, 'cor': 'Azul',
                'proprietario': 'Transportes Cacheu', 'condutor': 'Ibraima Sanhá', 'imposto_devido': 83000,
                'distrito': 'Cacheu', 'categoria': 'Transporte colectivo'
            },
            {
                'placa': 'GB-23-FA', 'marca': 'Honda', 'modelo': 'Wave', 'ano': 2022, 'cor': 'Vermelho',
                'proprietario': 'Naima Mané', 'condutor': 'Naima Mané', 'imposto_devido': 0,
                'distrito': 'Gabú', 'categoria': 'Motociclo'
            },
        ]
        for v in seed_veiculos:
            Veiculo.objects.create(**v)

    # 2b. SIGETRAN: Histórico de Proprietários (tabela 'historico_proprietarios')
    if not HistoricoProprietario.objects.exists():
        seed_historico = [
            {
                'codigo': 'TRF-2026-0001',
                'placa': 'GB-24-BC',
                'veiculo_descricao': 'Toyota Corolla (2018)',
                'proprietario_anterior': 'Suleimane Djassi',
                'documento_anterior': '000841920',
                'novo_proprietario': 'Mamadu Embaló',
                'documento_novo': '000000001',
                'novo_condutor': 'Mamadu Embaló',
                'distrito': 'Bissau',
                'data_transferencia': '2026-03-14',
                'motivo': 'Compra e venda',
                'observacoes': 'Contrato de compra e venda reconhecido em cartório · Processo n.º 104/2026'
            },
            {
                'codigo': 'TRF-2026-0002',
                'placa': 'GB-19-AA',
                'veiculo_descricao': 'Suzuki Carry (2020)',
                'proprietario_anterior': 'Comercial Bafatá Lda',
                'documento_anterior': '500192837',
                'novo_proprietario': 'Adama Baldé',
                'documento_novo': '000492811',
                'novo_condutor': 'Bacar Camará',
                'distrito': 'Bafatá',
                'data_transferencia': '2026-06-22',
                'motivo': 'Compra e venda',
                'observacoes': 'Transferência de titularidade na delegação regional de Bafatá'
            },
        ]
        for h in seed_historico:
            HistoricoProprietario.objects.create(**h)

    # 2c. SIGETRAN: Ocorrências, Apreensões, Roubos e Baixa Definitiva (tabela 'ocorrencias_veiculares')
    if not OcorrenciaVeicular.objects.exists():
        seed_ocorrencias = [
            {
                'codigo': 'OCO-2026-0001',
                'placa': 'GB-22-CD',
                'veiculo_descricao': 'Mercedes-Benz Sprinter (2017) · Azul',
                'proprietario': 'Transportes Cacheu',
                'categoria_registo': 'Ocorrência Policial / Fiscalização',
                'tipo_evento': 'Apreensão de Veículo',
                'situacao_resultante': 'Apreendido',
                'motivo': 'Circulação com imposto em dívida e falta de inspeção técnica obrigatória',
                'autoridade_orgao': 'Brigada de Trânsito · Cacheu',
                'numero_processo': 'AUTO-APR-2026/089',
                'local_deposito': 'Parque de Apreensões da Delegação Regional de Cacheu',
                'data_evento': '2026-09-25',
                'observacoes': 'Viatura retida até regularização fiscal e vistoria técnica.'
            },
            {
                'codigo': 'OCO-2026-0002',
                'placa': 'GB-19-AA',
                'veiculo_descricao': 'Suzuki Carry (2020) · Branco',
                'proprietario': 'Adama Baldé',
                'categoria_registo': 'Ocorrência Policial / Fiscalização',
                'tipo_evento': 'Recuperação / Restituição',
                'situacao_resultante': 'Recuperado',
                'motivo': 'Veículo localizado após participação de furto e restituído ao legítimo proprietário',
                'autoridade_orgao': 'Polícia de Ordem Pública · Bafatá',
                'numero_processo': 'BO-REC-2026/142',
                'local_deposito': 'Comissariado Regional de Bafatá',
                'data_evento': '2026-10-04',
                'observacoes': 'Auto de entrega e termo de restituição assinados pelo proprietário.'
            },
        ]
        for oc in seed_ocorrencias:
            OcorrenciaVeicular.objects.create(**oc)

    # 3. SIGETRAN: Condutores (tabela 'condutores')
    if not Condutor.objects.exists():
        seed_condutores = [
            {
                'codigo': 'D-001', 'nome': 'Mamadu Embaló', 'documento': '000000001',
                'carta': 'GB-C-10294', 'categoria': 'Ligeiros',
                'telefone': '+245 955 100 201', 'distrito': 'Bissau', 'status': 'Ativo'
            },
            {
                'codigo': 'D-002', 'nome': 'Bacar Camará', 'documento': '000000002',
                'carta': 'GB-C-08142', 'categoria': 'Ligeiros e mercadorias',
                'telefone': '+245 966 200 142', 'distrito': 'Bafatá', 'status': 'Ativo'
            },
            {
                'codigo': 'D-003', 'nome': 'Ibraima Sanhá', 'documento': '000000003',
                'carta': 'GB-D-07331', 'categoria': 'Pesados',
                'telefone': '+245 955 300 733', 'distrito': 'Cacheu', 'status': 'Ativo'
            },
            {
                'codigo': 'D-004', 'nome': 'Naima Mané', 'documento': '000000004',
                'carta': 'GB-A-11620', 'categoria': 'Motociclos',
                'telefone': '+245 966 400 620', 'distrito': 'Gabú', 'status': 'Ativo'
            },
        ]
        for d in seed_condutores:
            Condutor.objects.create(**d)

    # 4. SIGETRAN: Multas (tabela 'multas')
    if not Multa.objects.exists():
        seed_multas = [
            {
                'codigo': 'GB-2026-0014', 'placa': 'GB-24-BC', 'condutor': 'Mamadu Embaló',
                'infracao': 'Documentação em falta', 'valor': 25000,
                'data': '2026-09-18', 'status': 'Pendente'
            },
            {
                'codigo': 'GB-2026-0015', 'placa': 'GB-24-BC', 'condutor': 'Mamadu Embaló',
                'infracao': 'Estacionamento irregular', 'valor': 10000,
                'data': '2026-09-20', 'status': 'Pendente'
            },
            {
                'codigo': 'GB-2026-0016', 'placa': 'GB-22-CD', 'condutor': 'Ibraima Sanhá',
                'infracao': 'Documentação em falta', 'valor': 35000,
                'data': '2026-09-21', 'status': 'Pendente'
            },
        ]
        for m in seed_multas:
            Multa.objects.create(**m)

    # 5. SIGETRAN: Tipos de Infração e Preços (tabela 'tipos_infracao')
    if not TipoInfracao.objects.exists():
        seed_tipos_infracao = [
            {'codigo': 'INF-001', 'nome': 'Documentação em falta', 'valor': 25000, 'gravidade': 'Grave', 'descricao': 'Condução sem documentos obrigatórios do veículo ou condutor'},
            {'codigo': 'INF-002', 'nome': 'Estacionamento irregular', 'valor': 10000, 'gravidade': 'Leve', 'descricao': 'Estacionamento em local proibido ou passeio público'},
            {'codigo': 'INF-003', 'nome': 'Excesso de velocidade', 'valor': 35000, 'gravidade': 'Gravíssima', 'descricao': 'Velocidade superior ao limite regulamentar da via'},
            {'codigo': 'INF-004', 'nome': 'Condução sem carta de condução', 'valor': 50000, 'gravidade': 'Gravíssima', 'descricao': 'Condutor não habilitado para a categoria do veículo'},
            {'codigo': 'INF-005', 'nome': 'Falta de inspeção periódica', 'valor': 20000, 'gravidade': 'Média', 'descricao': 'Inspeção técnica veicular vencida ou inexistente'},
        ]
        for ti in seed_tipos_infracao:
            TipoInfracao.objects.create(**ti)

    # 6. SIGETRAN: Inspeções Veiculares (tabela 'inspecoes_veiculares')
    if not InspecaoVeicular.objects.exists():
        seed_inspecoes = [
            {
                'codigo': 'ITV-0061', 'placa': 'GB-24-BC', 'motivo': 'Inspeção periódica',
                'delegacao': 'Bissau', 'data': '2026-10-28', 'status': 'Agendada'
            },
            {
                'codigo': 'ITV-0062', 'placa': 'GB-22-CD', 'motivo': 'Verificação de segurança',
                'delegacao': 'Cacheu', 'data': '2026-10-30', 'status': 'Agendada'
            },
        ]
        for i in seed_inspecoes:
            InspecaoVeicular.objects.create(**i)

    # 7. SIGETRAN: Usuários e Configuração (tabelas 'usuarios_sistema' e 'configuracoes_sistema')
    if not UsuarioSistema.objects.exists():
        UsuarioSistema.objects.create(
            nome='Administrador do sistema',
            email='admin@sigetran.gov.gw',
            senha=make_password('123456'),
            perfil='Administrador',
            delegacao='Direção Nacional',
            status='Ativo'
        )
        UsuarioSistema.objects.create(
            nome='Agente de trânsito',
            email='agente@sigetran.gov.gw',
            senha=make_password('123456'),
            perfil='Fiscalização',
            delegacao='Bissau',
            status='Ativo'
        )
        UsuarioSistema.objects.create(
            nome='Administrador PROCON',
            email='admin@example.com',
            senha=make_password('123456'),
            perfil='Administrador',
            delegacao='Sede Central',
            status='Ativo'
        )

    if not ConfiguracaoSistema.objects.exists():
        ConfiguracaoSistema.objects.create(
            instituicao='Ministério dos Transportes · Guiné-Bissau',
            sistema='SIGETRAN',
            moeda='Franco CFA (XOF)',
            delegacao='Bissau'
        )

    # 8. PROCON: Consumidores, Fornecedores, Processos, Documentos, Fiscalizações, Audiências
    if not Consumidor.objects.exists():
        consumidores_reais = [
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
        for idx, (nome, cpf, email, telefone) in enumerate(consumidores_reais):
            Consumidor.objects.create(
                nome=nome,
                cpf=cpf,
                email=email,
                telefone=telefone,
                endereco=f'Av. Epitácio Pessoa, {1000 + idx * 50}',
                cidade='João Pessoa',
                estado='PB',
                status='Ativo'
            )

    if not Fornecedor.objects.exists():
        fornecedores_reais = [
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
        for nome, cnpj, categoria in fornecedores_reais:
            slug = ''.join(ch for ch in nome.lower() if ch.isalnum())
            Fornecedor.objects.create(
                nome=nome,
                cnpj=cnpj,
                email=f'contato@{slug}.com.br',
                telefone='(83) 3222-0000',
                endereco='Rua Duque de Caxias, 500 - Centro',
                cidade='João Pessoa',
                estado='PB',
                status='Ativo',
                categoria=categoria
            )

    if not Processo.objects.exists():
        consumidores = list(Consumidor.objects.all())
        fornecedores = list(Fornecedor.objects.all())
        assuntos = [
            ('Cobrança indevida', 'Consumidor relata que recebeu uma fatura com valor acima do contratado.'),
            ('Produto com defeito', 'Produto apresentou defeito após 1 semana de uso e a loja se recusa a trocar.'),
            ('Atraso na entrega', 'Compra realizada pela internet não foi entregue no prazo estipulado.'),
            ('Serviço não prestado', 'Contratou serviço de internet que não está funcionando conforme contratado.'),
            ('Cancelamento de contrato', 'Solicitou cancelamento do serviço mas continua recebendo cobranças.'),
        ]
        statuses = ['Aberto', 'Em Andamento', 'Concluído']
        prioridades = ['Baixa', 'Média', 'Alta', 'Urgente']
        for i, (assunto, desc) in enumerate(assuntos):
            c = consumidores[i % len(consumidores)]
            f = fornecedores[i % len(fornecedores)]
            proc = Processo.objects.create(
                protocolo=f'2026{str(i + 1).zfill(6)}',
                consumidor=c,
                nome_consumidor=c.nome,
                fornecedor=f,
                nome_fornecedor=f.nome,
                status=statuses[i % len(statuses)],
                prioridade=prioridades[i % len(prioridades)],
                assunto=assunto,
                descricao=desc
            )
            if i == 0:
                MensagemProcesso.objects.create(
                    processo=proc,
                    remetente_id=1,
                    nome_remetente='Administrador',
                    conteudo='Processo aberto. Aguardando manifestação do fornecedor no prazo legal de 10 dias.',
                    interna=True
                )
                MensagemProcesso.objects.create(
                    processo=proc,
                    remetente_id=2,
                    nome_remetente=f.nome,
                    conteudo='Recebemos a reclamação e estamos analisando o caso internamente.',
                    interna=False
                )

    if not Documento.objects.exists():
        categorias = ['Contrato', 'Fatura', 'Identidade', 'Procuração', 'Comprovante']
        for i in range(5):
            Documento.objects.create(
                titulo=f'Documento_Processo_{2026001 + i}.pdf',
                tipo_documento='PDF',
                tamanho=f'{1.2 + i * 0.5:.1f} MB',
                categoria=categorias[i % len(categorias)],
                enviado_por='Administrador',
                url='#'
            )

    if not Fiscalizacao.objects.exists():
        fornecedores = list(Fornecedor.objects.all())
        for i in range(5):
            Fiscalizacao.objects.create(
                nome_fornecedor=fornecedores[i % len(fornecedores)].nome,
                endereco=f'Av. Epitácio Pessoa, {1000 + i * 50}',
                data=timezone.now() - timedelta(days=i * 3),
                status=['Agendada', 'Realizada', 'Cancelada'][i % 3],
                resultado=['Regular', 'Irregular', 'Pendente'][i % 3],
                fiscal='Fiscal João'
            )

    if not Superendividamento.objects.exists():
        consumidores = list(Consumidor.objects.all())
        for i in range(5):
            Superendividamento.objects.create(
                nome_consumidor=consumidores[i % len(consumidores)].nome,
                divida_total=f'{15000 + i * 4500:.2f}',
                quantidade_credores=2 + (i % 4),
                status=['Em Análise', 'Audiência Agendada', 'Acordo Realizado'][i % 3],
                data_solicitacao=timezone.now() - timedelta(days=i * 5)
            )

    if not Audiencia.objects.exists():
        for i in range(5):
            Audiencia.objects.create(
                protocolo_processo=f'2026{str(i + 1).zfill(6)}',
                data=timezone.now() + timedelta(days=i + 2),
                sala=f'Sala {(i % 3) + 1}',
                conciliador='Conciliadora Maria',
                status='Agendada'
            )

from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import (
    Veiculo, OcorrenciaVeicular, HistoricoProprietario, Condutor, RegistoCartaConducao, ExameCondutor, Multa, RecursoMulta, AgenteFiscalizador, TipoInfracao, InspecaoVeicular, DocumentoCertificado,
    VeiculoPublico, UtilizacaoVeiculoPublico, AbastecimentoFrota, ManutencaoFrota,
    AcidenteTransito, VeiculoCondutorAcidente, VitimaAcidente, TestemunhaAcidente, RelatorioPolicialAcidente, DocumentoFotografiaAcidente,
    ConsultaMatriculaFiscalizacao, LeituraAutomaticaPlaca, ConsultaDocumentoQRCode, DispositivoMovelPolicial, RegistoInfracaoCampo, AlertaVeiculoRoubado,
    UsuarioSistema, ConfiguracaoSistema,
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
                'carta': 'GB-C-10294', 'categoria': 'B · Ligeiros',
                'telefone': '+245 955 100 201', 'distrito': 'Bissau', 'status': 'Ativo',
                'data_emissao': '2023-04-10', 'data_validade': '2028-04-10',
                'pontuacao': 13, 'restricoes_medicas': 'Sem restrições'
            },
            {
                'codigo': 'D-002', 'nome': 'Bacar Camará', 'documento': '000000002',
                'carta': 'GB-C-08142', 'categoria': 'B, C · Ligeiros e Mercadorias',
                'telefone': '+245 966 200 142', 'distrito': 'Bafatá', 'status': 'Ativo',
                'data_emissao': '2021-08-22', 'data_validade': '2026-08-22',
                'pontuacao': 20, 'restricoes_medicas': 'Uso obrigatório de lentes corretivas'
            },
            {
                'codigo': 'D-003', 'nome': 'Ibraima Sanhá', 'documento': '000000003',
                'carta': 'GB-D-07331', 'categoria': 'C, D, E · Pesados e Passageiros',
                'telefone': '+245 955 300 733', 'distrito': 'Cacheu', 'status': 'Ativo',
                'data_emissao': '2020-11-05', 'data_validade': '2025-11-05',
                'pontuacao': 15, 'restricoes_medicas': 'Avaliação psicotécnica periódica (Cat. D/E)'
            },
            {
                'codigo': 'D-004', 'nome': 'Naima Mané', 'documento': '000000004',
                'carta': 'GB-A-11620', 'categoria': 'A · Motociclos',
                'telefone': '+245 966 400 620', 'distrito': 'Gabú', 'status': 'Ativo',
                'data_emissao': '2024-02-18', 'data_validade': '2029-02-18',
                'pontuacao': 20, 'restricoes_medicas': 'Sem restrições'
            },
        ]
        for d in seed_condutores:
            Condutor.objects.create(**d)

    # 3b. SIGETRAN: Registos de Carta de Condução (tabela 'registos_carta_conducao')
    if not RegistoCartaConducao.objects.exists():
        seed_registos_carta = [
            {
                'codigo': 'RCC-2026-0001',
                'condutor_codigo': 'D-001',
                'condutor_nome': 'Mamadu Embaló',
                'carta': 'GB-C-10294',
                'tipo_registo': 'Emissão',
                'detalhe_acao': '1.ª Emissão Definitiva de Carta de Condução',
                'categoria': 'B',
                'data_emissao': '2023-04-10',
                'data_validade': '2028-04-10',
                'pontos_delta': 0,
                'motivo_observacoes': 'Aprovação em exame teórico e prático na Delegação de Bissau'
            },
            {
                'codigo': 'RCC-2026-0002',
                'condutor_codigo': 'D-002',
                'condutor_nome': 'Bacar Camará',
                'carta': 'GB-C-08142',
                'tipo_registo': 'Categoria',
                'detalhe_acao': 'Averbamento / Adição de Categoria C (Pesados de Mercadorias)',
                'categoria': 'B, C',
                'data_emissao': '2024-05-12',
                'data_validade': '2029-05-12',
                'pontos_delta': 0,
                'motivo_observacoes': 'Exame prático de pesados concluído com aproveitamento em Bafatá'
            },
            {
                'codigo': 'RCC-2026-0003',
                'condutor_codigo': 'D-003',
                'condutor_nome': 'Ibraima Sanhá',
                'carta': 'GB-D-07331',
                'tipo_registo': 'Renovação',
                'detalhe_acao': 'Renovação Periódica de Carta Profissional (Cat. D/E)',
                'categoria': 'C, D, E',
                'data_emissao': '2025-11-05',
                'data_validade': '2030-11-05',
                'pontos_delta': 0,
                'motivo_observacoes': 'Apresentado atestado médico e certificado de aptidão psicológica'
            },
        ]
        for rc in seed_registos_carta:
            RegistoCartaConducao.objects.create(**rc)

    # 3c. SIGETRAN: Exames Médicos e Psicológicos (tabela 'exames_condutores')
    if not ExameCondutor.objects.exists():
        seed_exames = [
            {
                'codigo': 'EXM-2026-0001',
                'condutor_codigo': 'D-002',
                'condutor_nome': 'Bacar Camará',
                'carta': 'GB-C-08142',
                'categoria_pretendida': 'B, C',
                'tipo_exame': 'Exame Médico de Aptidão Física',
                'resultado': 'Apto com restrições',
                'entidade_medica': 'Hospital Regional de Bafatá · Junta Médica',
                'numero_atestado': 'ATM-2026-0419',
                'restricoes': 'Uso obrigatório de lentes corretivas',
                'data_exame': '2026-02-14',
                'validade_exame': '2029-02-14',
            },
            {
                'codigo': 'EXM-2026-0002',
                'condutor_codigo': 'D-003',
                'condutor_nome': 'Ibraima Sanhá',
                'carta': 'GB-D-07331',
                'categoria_pretendida': 'C, D, E',
                'tipo_exame': 'Exame Médico e Psicológico Completo',
                'resultado': 'Apto',
                'entidade_medica': 'Centro Nacional de Medicina Rodoviária · Bissau',
                'numero_atestado': 'PSICO-2026-0882',
                'restricoes': 'Sem restrições · Apto para transporte coletivo de passageiros',
                'data_exame': '2026-05-20',
                'validade_exame': '2028-05-20',
            },
        ]
        for ex in seed_exames:
            ExameCondutor.objects.create(**ex)

    # 4. SIGETRAN: Multas (tabela 'multas')
    if not Multa.objects.exists():
        seed_multas = [
            {
                'codigo': 'GB-2026-0014', 'placa': 'GB-24-BC', 'condutor': 'Mamadu Embaló',
                'infracao': 'Documentação em falta', 'gravidade': 'Grave', 'valor': 25000,
                'data': '2026-09-18', 'status': 'Pendente',
                'agente_nome': 'Subinspetor Braima Baldé', 'agente_matricula': 'AG-BT-104',
                'local_infracao': 'Avenida Amílcar Cabral · Bissau',
                'descricao_prova': 'Auto lavrado presencialmente em operação stop; ausência de título de registo',
                'bloqueio_administrativo': True,
                'motivo_bloqueio': 'Reincidência em infração rodoviária sem regularização no prazo legal (Art.º 142.º)'
            },
            {
                'codigo': 'GB-2026-0015', 'placa': 'GB-24-BC', 'condutor': 'Mamadu Embaló',
                'infracao': 'Estacionamento irregular', 'gravidade': 'Leve', 'valor': 10000,
                'data': '2026-09-20', 'status': 'Pendente',
                'agente_nome': 'Agente Fatu Djassi', 'agente_matricula': 'AG-BT-219',
                'local_infracao': 'Praça dos Heróis Nacionais · Bissau',
                'descricao_prova': 'Registo fotográfico da viatura estacionada sobre passeio pedonal',
            },
            {
                'codigo': 'GB-2026-0016', 'placa': 'GB-22-CD', 'condutor': 'Ibraima Sanhá',
                'infracao': 'Documentação em falta', 'gravidade': 'Grave', 'valor': 35000,
                'data': '2026-09-21', 'status': 'Pendente',
                'agente_nome': 'Comissário Malam Sanhá', 'agente_matricula': 'AG-BT-052',
                'local_infracao': 'Posto de Controlo de Safim',
                'descricao_prova': 'Falta de certificado de inspeção periódica obrigatória para transporte coletivo',
                'bloqueio_administrativo': True,
                'motivo_bloqueio': 'Bloqueio administrativo cautelar de transporte coletivo sem inspeção válida'
            },
        ]
        for m in seed_multas:
            Multa.objects.create(**m)

    # 4b. SIGETRAN: Agentes Fiscalizadores (tabela 'agentes_fiscalizadores')
    if not AgenteFiscalizador.objects.exists():
        seed_agentes = [
            {
                'codigo': 'AG-BT-104', 'nome': 'Subinspetor Braima Baldé',
                'corporacao': 'Brigada Nacional de Trânsito', 'posto_patente': 'Subinspetor de Trânsito',
                'delegacao': 'Bissau', 'telefone': '+245 955 810 104', 'status': 'Ativo'
            },
            {
                'codigo': 'AG-BT-219', 'nome': 'Agente Principal Fatu Djassi',
                'corporacao': 'Polícia de Ordem Pública · Divisão de Trânsito', 'posto_patente': 'Agente Principal',
                'delegacao': 'Bissau', 'telefone': '+245 966 820 219', 'status': 'Ativo'
            },
            {
                'codigo': 'AG-BT-052', 'nome': 'Comissário Malam Sanhá',
                'corporacao': 'Brigada Regional Rodoviária', 'posto_patente': 'Comissário Regional',
                'delegacao': 'Cacheu', 'telefone': '+245 955 830 052', 'status': 'Ativo'
            },
        ]
        for ag in seed_agentes:
            AgenteFiscalizador.objects.create(**ag)

    # 4c. SIGETRAN: Recursos e Contestações de Multas (tabela 'recursos_multas')
    if not RecursoMulta.objects.exists():
        seed_recursos = [
            {
                'codigo': 'REC-ADM-2026-0001',
                'auto_codigo': 'GB-2026-0015',
                'placa': 'GB-24-BC',
                'recorrente': 'Mamadu Embaló',
                'fundamentacao': 'Paragem momentânea de emergência por avaria elétrica devidamente sinalizada com triângulo.',
                'data_submissao': '2026-09-25',
                'decisao': 'Em análise',
                'parecer_autoridade': 'Aguarda junção do comprovativo da oficina mecânica pela Comissão de Instrução.'
            },
        ]
        for rec in seed_recursos:
            RecursoMulta.objects.create(**rec)

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

    # 6b. SIGETRAN: Documentos e Certificados Oficiais (tabela 'documentos_certificados')
    if not DocumentoCertificado.objects.exists():
        seed_documentos = [
            {
                'codigo': 'DOC-2026-0001',
                'tipo_documento': 'Documento de Identificação do Veículo',
                'modalidade_emissao': '1.ª Via Original',
                'referencia_vinculada': 'GB-24-BC',
                'titular_nome': 'Mamadu Embaló',
                'titular_documento': '000000001',
                'detalhes_tecnicos': 'Toyota Corolla (2018) · Cor: Prata · Cat.: Ligeiro particular',
                'codigo_autenticidade': 'AUTH-GB-2026-1001-24BC',
                'assinatura_qr': 'SIGETRAN-QR|DOC-2026-0001|GB-24-BC|AUTH-GB-2026-1001-24BC',
                'delegacao_emissora': 'Direção-Geral de Viação · Bissau',
                'data_emissao': '2026-03-14',
                'data_validade': 'Permanente',
                'status': 'Válido',
                'bloqueio_administrativo': False,
                'motivo_bloqueio': '',
                'observacoes': 'Livre de ónus fiscais · Emissão inicial após averbamento.',
            },
            {
                'codigo': 'DOC-2026-0002',
                'tipo_documento': 'Certificado de Matrícula',
                'modalidade_emissao': '1.ª Via Original',
                'referencia_vinculada': 'GB-19-AA',
                'titular_nome': 'Adama Baldé',
                'titular_documento': '000492811',
                'detalhes_tecnicos': 'Suzuki Carry (2020) · Cor: Branco · Cat.: Transporte misto',
                'codigo_autenticidade': 'AUTH-GB-2026-1002-19AA',
                'assinatura_qr': 'SIGETRAN-QR|DOC-2026-0002|GB-19-AA|AUTH-GB-2026-1002-19AA',
                'delegacao_emissora': 'Delegação Regional de Viação · Bafatá',
                'data_emissao': '2026-06-22',
                'data_validade': 'Permanente',
                'status': 'Válido',
                'bloqueio_administrativo': False,
                'motivo_bloqueio': '',
                'observacoes': 'Certificado definitivo homologado pela DGV.',
            },
            {
                'codigo': 'DOC-2026-0003',
                'tipo_documento': 'Carta de Condução Digital',
                'modalidade_emissao': 'Emissão Digital Certificada',
                'referencia_vinculada': 'GB-C-10294',
                'titular_nome': 'Mamadu Embaló',
                'titular_documento': '000000001',
                'detalhes_tecnicos': 'Categoria: B · Ligeiros · Pontuação: 13/20 pts · Sem restrições',
                'codigo_autenticidade': 'AUTH-GB-2026-1003-C294',
                'assinatura_qr': 'SIGETRAN-QR|DOC-2026-0003|GB-C-10294|AUTH-GB-2026-1003-C294',
                'delegacao_emissora': 'Direção-Geral de Viação · Bissau',
                'data_emissao': '2026-07-10',
                'data_validade': '2028-04-10',
                'status': 'Válido',
                'bloqueio_administrativo': False,
                'motivo_bloqueio': '',
                'observacoes': 'Assinatura digital ICP-GB ativa com QR Code dinâmico.',
            },
            {
                'codigo': 'DOC-2026-0004',
                'tipo_documento': 'Certificado de Propriedade',
                'modalidade_emissao': '1.ª Via Original',
                'referencia_vinculada': 'GB-22-CD',
                'titular_nome': 'Transportes Cacheu',
                'titular_documento': '500918273',
                'detalhes_tecnicos': 'Mercedes-Benz Sprinter (2017) · Cor: Azul · Cat.: Transporte colectivo',
                'codigo_autenticidade': 'AUTH-GB-2026-1004-22CD',
                'assinatura_qr': 'SIGETRAN-QR|DOC-2026-0004|GB-22-CD|AUTH-GB-2026-1004-22CD',
                'delegacao_emissora': 'Delegação Regional de Viação · Cacheu',
                'data_emissao': '2026-01-19',
                'data_validade': 'Permanente',
                'status': 'Bloqueado',
                'bloqueio_administrativo': True,
                'motivo_bloqueio': 'Despacho DGT n.º 118/2026 · Restrição administrativa por apreensão e coima gravíssima pendente (Art. 142.º CE).',
                'observacoes': 'Transferência de titularidade bloqueada até regularização.',
            },
            {
                'codigo': 'DOC-2026-0005',
                'tipo_documento': 'Documento de Identificação do Veículo',
                'modalidade_emissao': '2.ª Via (Extravio / Deterioração)',
                'referencia_vinculada': 'GB-23-FA',
                'titular_nome': 'Naima Mané',
                'titular_documento': '000000004',
                'detalhes_tecnicos': 'Honda Wave (2022) · Cor: Vermelho · Cat.: Motociclo',
                'codigo_autenticidade': 'AUTH-GB-2026-1005-23FA',
                'assinatura_qr': 'SIGETRAN-QR|DOC-2026-0005|GB-23-FA|AUTH-GB-2026-1005-23FA',
                'delegacao_emissora': 'Delegação Regional de Viação · Gabú',
                'data_emissao': '2026-08-05',
                'data_validade': 'Permanente',
                'status': 'Válido',
                'bloqueio_administrativo': False,
                'motivo_bloqueio': '',
                'observacoes': '2.ª Via emitida mediante declaração policial de extravio n.º 88/2026.',
            },
        ]
        for doc_item in seed_documentos:
            DocumentoCertificado.objects.create(**doc_item)

    # 6c. SIGETRAN: Frota do Estado (tabelas 'veiculos_publicos', 'utilizacoes_frota_publica', 'abastecimentos_frota_publica', 'manutencoes_frota_publica')
    if not VeiculoPublico.objects.exists():
        seed_frota = [
            {
                'codigo': 'FROTA-GOV-001',
                'placa': 'GB-GOV-014',
                'marca': 'Toyota',
                'modelo': 'Land Cruiser Prado V6',
                'ano': 2023,
                'cor': 'Preto',
                'categoria': 'Gabinete Ministerial / Representação',
                'ministerio_instituicao': 'Ministério dos Transportes e Comunicações',
                'sigla_instituicao': 'MTC',
                'departamento_direcao': 'Gabinete do Ministro',
                'funcionario_responsavel': 'Dr. Braima Seidi',
                'funcionario_cargo': 'Chefe de Gabinete e Assessor de Transportes',
                'funcionario_contacto': '+245 955 401 014',
                'quilometragem_atual': 34200,
                'capacidade_tanque': 87,
                'tipo_combustivel': 'Gasóleo (Diesel)',
                'status': 'Em Serviço',
                'numero_chassi': 'JTEBU29J40K091823',
                'data_afetacao': '2023-04-15',
                'observacoes': 'Viatura protocolar afeta à representação institucional do MTC.',
            },
            {
                'codigo': 'FROTA-GOV-002',
                'placa': 'GB-GOV-022',
                'marca': 'Toyota',
                'modelo': 'Hilux 4x4 Double Cabine',
                'ano': 2022,
                'cor': 'Branco',
                'categoria': 'Serviço Operacional / Brigada de Fiscalização',
                'ministerio_instituicao': 'Ministério dos Transportes e Comunicações',
                'sigla_instituicao': 'MTC',
                'departamento_direcao': 'Direção-Geral de Viação e Transportes Terrestres',
                'funcionario_responsavel': 'Inspetor Malam Bacai',
                'funcionario_cargo': 'Coordenador Operacional da Brigada de Trânsito',
                'funcionario_contacto': '+245 966 502 022',
                'quilometragem_atual': 68450,
                'capacidade_tanque': 80,
                'tipo_combustivel': 'Gasóleo (Diesel)',
                'status': 'Em Serviço',
                'numero_chassi': 'MR0HA3CD800192841',
                'data_afetacao': '2022-06-20',
                'observacoes': 'Equipada com rádio de telecomunicações e suporte de fiscalização móvel.',
            },
            {
                'codigo': 'FROTA-GOV-003',
                'placa': 'GB-MIN-005',
                'marca': 'Nissan',
                'modelo': 'Patrol Hardtop 4x4',
                'ano': 2021,
                'cor': 'Branco',
                'categoria': 'Emergência Médica / Saúde Pública',
                'ministerio_instituicao': 'Ministério da Saúde Pública',
                'sigla_instituicao': 'MINSAP',
                'departamento_direcao': 'Direção-Geral de Prevenção e Promoção da Saúde',
                'funcionario_responsavel': 'Dra. Fátima Baldé',
                'funcionario_cargo': 'Diretora Regional de Saúde Pública',
                'funcionario_contacto': '+245 955 603 005',
                'quilometragem_atual': 89200,
                'capacidade_tanque': 95,
                'tipo_combustivel': 'Gasóleo (Diesel)',
                'status': 'Em Missão',
                'numero_chassi': 'JN1UESY61Z0039182',
                'data_afetacao': '2021-08-10',
                'observacoes': 'Afeta ao programa de vacinação e vigilância epidemiológica nas regiões.',
            },
            {
                'codigo': 'FROTA-GOV-004',
                'placa': 'GB-MEF-010',
                'marca': 'Mitsubishi',
                'modelo': 'L200 Sportero 4x4',
                'ano': 2023,
                'cor': 'Cinza',
                'categoria': 'Fiscalização Aduaneira e Tributária',
                'ministerio_instituicao': 'Ministério da Economia e Finanças',
                'sigla_instituicao': 'MEF',
                'departamento_direcao': 'Direção-Geral das Alfândegas (DGA)',
                'funcionario_responsavel': 'Carlos Alberto Gomes',
                'funcionario_cargo': 'Inspetor-Chefe de Brigada Aduaneira',
                'funcionario_contacto': '+245 966 704 010',
                'quilometragem_atual': 28600,
                'capacidade_tanque': 75,
                'tipo_combustivel': 'Gasóleo (Diesel)',
                'status': 'Em Serviço',
                'numero_chassi': 'MMBJRKB40E0041289',
                'data_afetacao': '2023-09-01',
                'observacoes': 'Viatura de patrulha e fiscalização dos corredores fronteiriços de São Domingos.',
            },
            {
                'codigo': 'FROTA-GOV-005',
                'placa': 'GB-MEN-018',
                'marca': 'Toyota',
                'modelo': 'Coaster 30 Lugares',
                'ano': 2020,
                'cor': 'Branco e Azul',
                'categoria': 'Transporte Coletivo Institucional',
                'ministerio_instituicao': 'Ministério da Educação Nacional',
                'sigla_instituicao': 'MEN',
                'departamento_direcao': 'Direção de Recursos e Logística',
                'funcionario_responsavel': 'Aladje Bacar Camará',
                'funcionario_cargo': 'Motorista Oficial de Serviços Gerais',
                'funcionario_contacto': '+245 955 805 018',
                'quilometragem_atual': 112500,
                'capacidade_tanque': 95,
                'tipo_combustivel': 'Gasóleo (Diesel)',
                'status': 'Em Manutenção',
                'numero_chassi': 'JTEXZ50J80K018274',
                'data_afetacao': '2020-11-15',
                'observacoes': 'Em reparação mecânica programada na Garagem Central do Estado.',
            },
        ]
        for vpub in seed_frota:
            VeiculoPublico.objects.create(**vpub)

    if not UtilizacaoVeiculoPublico.objects.exists():
        seed_missoes = [
            {
                'codigo': 'MIS-2026-0001',
                'veiculo_placa': 'GB-GOV-022',
                'ministerio_instituicao': 'Ministério dos Transportes e Comunicações',
                'funcionario_nome': 'Inspetor Malam Bacai',
                'funcionario_matricula': 'FUNC-MTC-089',
                'motivo_missao': 'Fiscalização da circulação rodoviária e controlo de pesagem no eixo Bissau-Bafatá',
                'origem': 'Bissau (Sede DGV)',
                'destino': 'Bafatá - Gabú (Eixo Leste)',
                'data_saida': '2026-10-12',
                'hora_saida': '07:30',
                'data_retorno': '2026-10-15',
                'hora_retorno': '18:45',
                'km_saida': 66800,
                'km_retorno': 67750,
                'km_percorridos': 950,
                'status': 'Concluída',
                'observacoes': 'Operação conjunta com a Polícia de Ordem Pública. Missão cumprida sem incidentes.',
            },
            {
                'codigo': 'MIS-2026-0002',
                'veiculo_placa': 'GB-MIN-005',
                'ministerio_instituicao': 'Ministério da Saúde Pública',
                'funcionario_nome': 'Dra. Fátima Baldé',
                'funcionario_matricula': 'MED-MINSAP-214',
                'motivo_missao': 'Distribuição de vacinas e supervisão hospitalar nos centros de saúde de Cacheu',
                'origem': 'Bissau (Armazém Central MINSAP)',
                'destino': 'Cacheu - São Domingos',
                'data_saida': '2026-11-01',
                'hora_saida': '08:00',
                'data_retorno': '2026-11-08',
                'hora_retorno': '17:00',
                'km_saida': 88400,
                'km_retorno': 89200,
                'km_percorridos': 800,
                'status': 'Em Curso',
                'observacoes': 'Missão oficial de saúde comunitária autorizada por despacho ministerial n.º 94/2026.',
            },
            {
                'codigo': 'MIS-2026-0003',
                'veiculo_placa': 'GB-MEF-010',
                'ministerio_instituicao': 'Ministério da Economia e Finanças',
                'funcionario_nome': 'Carlos Alberto Gomes',
                'funcionario_matricula': 'DGA-MEF-052',
                'motivo_missao': 'Inspeção fiscal e auditoria de postos aduaneiros do norte',
                'origem': 'Bissau',
                'destino': 'Ingoré - São Domingos',
                'data_saida': '2026-10-25',
                'hora_saida': '06:45',
                'data_retorno': '2026-10-27',
                'hora_retorno': '19:15',
                'km_saida': 27850,
                'km_retorno': 28600,
                'km_percorridos': 750,
                'status': 'Concluída',
                'observacoes': 'Relatório de auditoria aduaneira submetido à Direção-Geral das Alfândegas.',
            },
        ]
        for mis in seed_missoes:
            UtilizacaoVeiculoPublico.objects.create(**mis)

    if not AbastecimentoFrota.objects.exists():
        seed_abastecimentos = [
            {
                'codigo': 'ABS-2026-0001',
                'veiculo_placa': 'GB-GOV-014',
                'ministerio_instituicao': 'Ministério dos Transportes e Comunicações',
                'funcionario_condutor': 'Mamadu Alfa Djaló',
                'data_abastecimento': '2026-10-05',
                'posto_combustivel': 'Petroguin - Luanda',
                'tipo_combustivel': 'Gasóleo',
                'quantidade_litros': 75.0,
                'preco_por_litro': 950,
                'valor_total': 71250,
                'km_momento': 33600,
                'numero_talao': 'CUP-MTC-2026/102',
            },
            {
                'codigo': 'ABS-2026-0002',
                'veiculo_placa': 'GB-GOV-022',
                'ministerio_instituicao': 'Ministério dos Transportes e Comunicações',
                'funcionario_condutor': 'Inspetor Malam Bacai',
                'data_abastecimento': '2026-10-12',
                'posto_combustivel': 'TotalEnergies - Bandim',
                'tipo_combustivel': 'Gasóleo',
                'quantidade_litros': 70.0,
                'preco_por_litro': 950,
                'valor_total': 66500,
                'km_momento': 66800,
                'numero_talao': 'CUP-MTC-2026/145',
            },
            {
                'codigo': 'ABS-2026-0003',
                'veiculo_placa': 'GB-MIN-005',
                'ministerio_instituicao': 'Ministério da Saúde Pública',
                'funcionario_condutor': 'Suleimane Embaló',
                'data_abastecimento': '2026-10-20',
                'posto_combustivel': 'Petroguin - Bafatá',
                'tipo_combustivel': 'Gasóleo',
                'quantidade_litros': 85.0,
                'preco_por_litro': 950,
                'valor_total': 80750,
                'km_momento': 87800,
                'numero_talao': 'CUP-MSP-2026/088',
            },
            {
                'codigo': 'ABS-2026-0004',
                'veiculo_placa': 'GB-MEF-010',
                'ministerio_instituicao': 'Ministério da Economia e Finanças',
                'funcionario_condutor': 'Carlos Alberto Gomes',
                'data_abastecimento': '2026-10-25',
                'posto_combustivel': 'Galp - Avenida dos Combatentes',
                'tipo_combustivel': 'Gasóleo',
                'quantidade_litros': 65.0,
                'preco_por_litro': 950,
                'valor_total': 61750,
                'km_momento': 27850,
                'numero_talao': 'CUP-MEF-2026/304',
            },
        ]
        for ab in seed_abastecimentos:
            AbastecimentoFrota.objects.create(**ab)

    if not ManutencaoFrota.objects.exists():
        seed_manutencoes = [
            {
                'codigo': 'MAN-2026-0001',
                'veiculo_placa': 'GB-GOV-014',
                'ministerio_instituicao': 'Ministério dos Transportes e Comunicações',
                'tipo_manutencao': 'Preventiva / Revisão Periódica',
                'oficina_prestador': 'Garagem Central do Estado',
                'data_entrada': '2026-09-18',
                'data_conclusao': '2026-09-20',
                'km_manutencao': 32500,
                'descricao_servico': 'Mudança de óleo de motor 5W30, substituição de filtros de óleo, ar e combustível, e teste de travões',
                'pecas_substituidas': 'Filtro de óleo original Toyota, Filtro de gasóleo, Filtro de habitáculo, 8L Óleo sintético',
                'custo_total': 185000,
                'status': 'Concluída',
            },
            {
                'codigo': 'MAN-2026-0002',
                'veiculo_placa': 'GB-GOV-022',
                'ministerio_instituicao': 'Ministério dos Transportes e Comunicações',
                'tipo_manutencao': 'Pneus e Alinhamento',
                'oficina_prestador': 'Auto Mecânica Bissau',
                'data_entrada': '2026-10-02',
                'data_conclusao': '2026-10-03',
                'km_manutencao': 65900,
                'descricao_servico': 'Substituição dos 4 pneus todo-terreno para missões de fiscalização e calibração de direção',
                'pecas_substituidas': '4 Pneus Bridgestone Dueler A/T 265/65 R17',
                'custo_total': 420000,
                'status': 'Concluída',
            },
            {
                'codigo': 'MAN-2026-0003',
                'veiculo_placa': 'GB-MEN-018',
                'ministerio_instituicao': 'Ministério da Educação Nacional',
                'tipo_manutencao': 'Corretiva / Reparação Mecânica',
                'oficina_prestador': 'Garagem Central do Estado',
                'data_entrada': '2026-10-28',
                'data_conclusao': '',
                'km_manutencao': 112500,
                'descricao_servico': 'Reparação de embraiagem, retificação de discos de travão e substituição de correia do alternador',
                'pecas_substituidas': 'Kit embraiagem Coaster, Bomba principal de embraiagem, Correia dentada',
                'custo_total': 315000,
                'status': 'Em Execução',
            },
        ]
        for mn in seed_manutencoes:
            ManutencaoFrota.objects.create(**mn)

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

    # 6d. SIGETRAN: Gestão de Acidentes Rodoviários
    if not AcidenteTransito.objects.exists():
        seed_acidentes = [
            {
                'codigo': 'ACID-2026-0001',
                'data_acidente': '2026-10-18',
                'hora_acidente': '16:30',
                'gravidade': 'Com Feridos Graves',
                'tipo_acidente': 'Colisão Frontal',
                'regiao': 'Setor Autónomo de Bissau',
                'local_via': 'Avenida dos Combatentes da Liberdade da Pátria · Próximo ao Aeroporto Osvaldo Vieira',
                'latitude': 11.8632,
                'longitude': -15.5984,
                'ponto_referencia': 'Rotunda de acesso ao terminal aéreo de Bissau',
                'condicoes_meteorologicas': 'Bom tempo / Sol',
                'estado_piso': 'Seco e limpo',
                'quantidade_veiculos': 2,
                'quantidade_vitimas': 2,
                'quantidade_mortos': 0,
                'quantidade_feridos': 2,
                'causa_provavel': 'Excesso de velocidade e ultrapassagem irregular',
                'descricao_circunstancias': 'Colisão frontal violenta entre um ligeiro de passageiros e uma carrinha de transporte misto durante ultrapassagem em traço contínuo.',
                'status': 'Peritagem Concluída',
            },
            {
                'codigo': 'ACID-2026-0002',
                'data_acidente': '2026-10-22',
                'hora_acidente': '20:45',
                'gravidade': 'Com Vítimas Mortais',
                'tipo_acidente': 'Atropelamento e Fuga',
                'regiao': 'Biombo',
                'local_via': 'Estrada Nacional N1 · Eixo Safim - Bissau (km 12)',
                'latitude': 11.9540,
                'longitude': -15.6510,
                'ponto_referencia': 'Cruzamento de Safim / Mercado local',
                'condicoes_meteorologicas': 'Noite sem iluminação',
                'estado_piso': 'Seco e limpo',
                'quantidade_veiculos': 1,
                'quantidade_vitimas': 1,
                'quantidade_mortos': 1,
                'quantidade_feridos': 0,
                'causa_provavel': 'Excesso de velocidade e falta de iluminação na via pública',
                'descricao_circunstancias': 'Atropelamento mortal de peão na berma da estrada por viatura que se colocou em fuga, posteriormente apreendida pela BNT.',
                'status': 'Remetido a Tribunal',
            },
            {
                'codigo': 'ACID-2026-0003',
                'data_acidente': '2026-10-25',
                'hora_acidente': '09:15',
                'gravidade': 'Danos Materiais',
                'tipo_acidente': 'Colisão Traseira',
                'regiao': 'Bafatá',
                'local_via': 'Ponte sobre o Rio Geba · Entrada da Cidade de Bafatá',
                'latitude': 12.1678,
                'longitude': -14.6542,
                'ponto_referencia': 'Início do tabuleiro da ponte metálica',
                'condicoes_meteorologicas': 'Bom tempo / Sol',
                'estado_piso': 'Com buracos / Degradação',
                'quantidade_veiculos': 2,
                'quantidade_vitimas': 0,
                'quantidade_mortos': 0,
                'quantidade_feridos': 0,
                'causa_provavel': 'Falta de distância de segurança e travagem brusca',
                'descricao_circunstancias': 'Colisão por alcance após travagem de emergência do veículo à frente devido a buraco pronunciado na faixa.',
                'status': 'Arquivado',
            },
            {
                'codigo': 'ACID-2026-0004',
                'data_acidente': '2026-11-01',
                'hora_acidente': '14:20',
                'gravidade': 'Com Feridos',
                'tipo_acidente': 'Capotamento',
                'regiao': 'Gabú',
                'local_via': 'Estrada Regional Gabú - Pirada (km 18)',
                'latitude': 12.2850,
                'longitude': -14.2180,
                'ponto_referencia': 'Curva do Rio Campossa',
                'condicoes_meteorologicas': 'Chuva intensa',
                'estado_piso': 'Molhado / Escorregadio',
                'quantidade_veiculos': 1,
                'quantidade_vitimas': 4,
                'quantidade_mortos': 0,
                'quantidade_feridos': 4,
                'causa_provavel': 'Aquaplanagem e velocidade inadequada',
                'descricao_circunstancias': 'Despiste seguido de capotamento para fora da berma em valeta durante forte precipitação com 4 passageiros feridos.',
                'status': 'Em Investigação',
            },
        ]
        for acid in seed_acidentes:
            AcidenteTransito.objects.create(**acid)

    if not VeiculoCondutorAcidente.objects.exists():
        seed_veiculos_condutores = [
            {
                'codigo': 'VCA-2026-0001',
                'acidente_codigo': 'ACID-2026-0001',
                'veiculo_placa': 'GB-24-BC',
                'veiculo_marca_modelo': 'Toyota Corolla (2018)',
                'veiculo_categoria': 'Ligeiro particular',
                'veiculo_seguradora': 'Garantia Seguros GB',
                'veiculo_apolice': 'APOL-GAR-2026/0912',
                'danos_materiais': 'Destruição do bloco dianteiro, suspensão frontal esquerda e quebra do para-brisas.',
                'condutor_nome': 'Mamadu Embaló',
                'condutor_documento': 'BI 000000001',
                'condutor_carta': 'GB-C-10294',
                'condutor_categoria_carta': 'B',
                'condutor_telefone': '+245 955 100 201',
                'teste_alcoolemia': '0.00 g/l (Negativo)',
                'responsabilidade_apurada': 'Lesado / Terceiro',
                'observacoes': 'Condutor circulava na sua faixa com cinto de segurança apertado.',
            },
            {
                'codigo': 'VCA-2026-0002',
                'acidente_codigo': 'ACID-2026-0001',
                'veiculo_placa': 'GB-19-AA',
                'veiculo_marca_modelo': 'Suzuki Carry (2020)',
                'veiculo_categoria': 'Transporte misto',
                'veiculo_seguradora': 'Sem seguro válido',
                'veiculo_apolice': '',
                'danos_materiais': 'Perda total da frente e eixo dianteiro partido.',
                'condutor_nome': 'Bacar Camará',
                'condutor_documento': 'BI 000000002',
                'condutor_carta': 'GB-C-08142',
                'condutor_categoria_carta': 'B, C',
                'condutor_telefone': '+245 966 200 142',
                'teste_alcoolemia': '0.65 g/l (Positivo - Contraordenação Grave)',
                'responsabilidade_apurada': 'Presumível causador',
                'observacoes': 'Invasão da faixa de rodagem contrária sob influência de álcool.',
            },
            {
                'codigo': 'VCA-2026-0003',
                'acidente_codigo': 'ACID-2026-0002',
                'veiculo_placa': 'GB-22-CD',
                'veiculo_marca_modelo': 'Mercedes-Benz Sprinter (2017)',
                'veiculo_categoria': 'Transporte colectivo',
                'veiculo_seguradora': 'Garantia Seguros GB',
                'veiculo_apolice': 'APOL-GAR-2026/1104',
                'danos_materiais': 'Deformação da ótica dianteira direita e espelho retrovisor partido.',
                'condutor_nome': 'Ibraima Sanhá',
                'condutor_documento': 'BI 000000003',
                'condutor_carta': 'GB-D-07331',
                'condutor_categoria_carta': 'C, D, E',
                'condutor_telefone': '+245 955 300 733',
                'teste_alcoolemia': '0.00 g/l (Negativo)',
                'responsabilidade_apurada': 'Arguido em inquérito',
                'observacoes': 'Viatura retida para peritagem forense no piquete de Bissau.',
            },
        ]
        for vca in seed_veiculos_condutores:
            VeiculoCondutorAcidente.objects.create(**vca)

    if not VitimaAcidente.objects.exists():
        seed_vitimas = [
            {
                'codigo': 'VIT-2026-0001',
                'acidente_codigo': 'ACID-2026-0001',
                'nome': 'Mariama Sanhá',
                'documento_identificacao': 'BI 000492811',
                'idade': 34,
                'sexo': 'Feminino',
                'condicao_vitima': 'Passageiro',
                'veiculo_placa': 'GB-19-AA',
                'gravidade_lesao': 'Ferimentos Graves',
                'hospital_destino': 'Hospital Nacional Simão Mendes',
                'contacto_emergencia': '+245 966 440 220 (Irmão)',
                'observacoes_medicas': 'Traumatismo craniano ligeiro e fratura fechada de fémur; internada no bloco de cirurgia.',
            },
            {
                'codigo': 'VIT-2026-0002',
                'acidente_codigo': 'ACID-2026-0001',
                'nome': 'Mamadu Embaló',
                'documento_identificacao': 'BI 000000001',
                'idade': 42,
                'sexo': 'Masculino',
                'condicao_vitima': 'Condutor',
                'veiculo_placa': 'GB-24-BC',
                'gravidade_lesao': 'Ferimentos Leves',
                'hospital_destino': 'Hospital Nacional Simão Mendes',
                'contacto_emergencia': '+245 955 100 201',
                'observacoes_medicas': 'Escoriações múltiplas e contusão torácica; alta clínica concedida após exames.',
            },
            {
                'codigo': 'VIT-2026-0003',
                'acidente_codigo': 'ACID-2026-0002',
                'nome': 'Ansumane Djaló',
                'documento_identificacao': 'BI 000781902',
                'idade': 58,
                'sexo': 'Masculino',
                'condicao_vitima': 'Peão / Pedestre',
                'veiculo_placa': 'GB-22-CD',
                'gravidade_lesao': 'Óbito no Local',
                'hospital_destino': 'Morgue do Hospital Nacional Simão Mendes',
                'contacto_emergencia': '+245 955 881 002 (Esposa)',
                'observacoes_medicas': 'Óbito declarado no local pela equipa médica de emergência e médico legista.',
            },
        ]
        for vit in seed_vitimas:
            VitimaAcidente.objects.create(**vit)

    if not TestemunhaAcidente.objects.exists():
        seed_testemunhas = [
            {
                'codigo': 'TST-2026-0001',
                'acidente_codigo': 'ACID-2026-0001',
                'nome': 'Abel da Silva',
                'documento_identificacao': 'BI 000881920',
                'telefone': '+245 955 770 123',
                'endereco': 'Bairro Militar, Bissau',
                'posicao_momento': 'Condutor da viatura que seguia atrás',
                'depoimento': 'Viu a carrinha Suzuki tentar ultrapassar um camião de mercadorias em local de linha contínua, colidindo frontalmente com o Corolla.',
                'data_depoimento': '2026-10-18',
            },
            {
                'codigo': 'TST-2026-0002',
                'acidente_codigo': 'ACID-2026-0002',
                'nome': 'Dionísio Mendes',
                'documento_identificacao': 'BI 000918273',
                'telefone': '+245 966 331 445',
                'endereco': 'Safim Centro',
                'posicao_momento': 'Comerciante do quiosque lateral',
                'depoimento': 'Ouviu uma travagem forte e o som do impacto; observou uma carrinha de passageiros branca acelerar sem prestar assistência ao peão.',
                'data_depoimento': '2026-10-23',
            },
        ]
        for tst in seed_testemunhas:
            TestemunhaAcidente.objects.create(**tst)

    if not RelatorioPolicialAcidente.objects.exists():
        seed_relatorios = [
            {
                'codigo': 'BO-POL-2026-0045',
                'acidente_codigo': 'ACID-2026-0001',
                'numero_boletim': 'BO/BNT/2026/045',
                'orgao_policial': 'Brigada Nacional de Trânsito (BNT)',
                'agente_responsavel': 'Subcomissário Malam Bacai',
                'agente_matricula': 'AG-GB-0104',
                'data_relatorio': '2026-10-19',
                'conclusao_pericial': 'A colisão frontal foi originada por manobra de ultrapassagem temerária e não permitida realizada pelo condutor Bacar Camará com taxa de alcoolemia positiva.',
                'infracoes_constatadas': 'Art. 38.º (Ultrapassagem proibida) e Art. 81.º (Condução sob influência do álcool) do Código da Estrada',
                'encaminhamento': 'Remetido ao Ministério Público / Tribunal Regional de Bissau',
                'status_processo': 'Concluído',
                'observacoes': 'Auto de notícia e testes toxicológicos anexos ao processo.',
            },
            {
                'codigo': 'BO-POL-2026-0052',
                'acidente_codigo': 'ACID-2026-0002',
                'numero_boletim': 'BO/BNT/2026/052',
                'orgao_policial': 'Brigada Nacional de Trânsito (BNT)',
                'agente_responsavel': 'Agente Principal Fátima Djú',
                'agente_matricula': 'AG-GB-0219',
                'data_relatorio': '2026-10-24',
                'conclusao_pericial': 'Atropelamento mortal com fuga de condutor e omissão de auxílio; condutor identificado após investigação policial conjunta da BNT e POP.',
                'infracoes_constatadas': 'Art. 135.º (Homicídio por negligência na condução) e Art. 89.º (Omissão de auxílio)',
                'encaminhamento': 'Remetido ao Ministério Público com arguido sob termo de identidade e residência',
                'status_processo': 'Concluído',
                'observacoes': 'Veículo apreendido no parque da delegação regional.',
            },
        ]
        for rel in seed_relatorios:
            RelatorioPolicialAcidente.objects.create(**rel)

    if not DocumentoFotografiaAcidente.objects.exists():
        seed_fotos = [
            {
                'codigo': 'FOTO-2026-0001',
                'acidente_codigo': 'ACID-2026-0001',
                'tipo_anexo': 'Fotografia do Local',
                'titulo': 'Ponto de impacto frontal no eixo da via na Av. Combatentes',
                'arquivo_url': '/media/acidentes/impacto_av_combatentes.jpg',
                'descricao': 'Registo fotográfico dos vestígios de travagem (18 metros) e deformação estrutural frontal dos veículos.',
                'autor_anexo': 'Perito Malam Bacai (BNT)',
                'data_registo': '2026-10-18',
            },
            {
                'codigo': 'FOTO-2026-0002',
                'acidente_codigo': 'ACID-2026-0001',
                'tipo_anexo': 'Croqui / Esquema da Via',
                'titulo': 'Croqui pericial topográfico da colisão frontal',
                'arquivo_url': '/media/acidentes/croqui_safim.jpg',
                'descricao': 'Planta do local do acidente com cotas das bermas, ponto de repouso dos veículos e trajetória percorrida.',
                'autor_anexo': 'Gabinete de Acidentologia Rodoviária DGT',
                'data_registo': '2026-10-19',
            },
            {
                'codigo': 'FOTO-2026-0003',
                'acidente_codigo': 'ACID-2026-0002',
                'tipo_anexo': 'Fotografia dos Danos Veiculares',
                'titulo': 'Danos no para-choques e ótica direita da viatura interveniente',
                'arquivo_url': '/media/acidentes/danos_sprinter.jpg',
                'descricao': 'Provas periciais de compatibilidade entre as deformações e as fibras do vestuário da vítima atropelada.',
                'autor_anexo': 'Laboratório de Polícia Técnica e Científica',
                'data_registo': '2026-10-23',
            },
        ]
        for f in seed_fotos:
            DocumentoFotografiaAcidente.objects.create(**f)

    # 10. SIGETRAN: Fiscalização Inteligente (Smart Enforcement)
    if not AlertaVeiculoRoubado.objects.exists():
        seed_alertas_roubo = [
            {
                'codigo_alerta': 'ALR-2026-0001',
                'matricula': 'GB-21-XX',
                'marca_modelo': 'Toyota Hilux D-4D 2.8',
                'cor': 'Branco',
                'numero_chassis': 'MR0HA3CD8K1094821',
                'numero_boletim_furto': 'BO-FURTO-2026-081',
                'data_roubo': '2026-10-22 21:30',
                'local_roubo': 'Bairro de Belém, próximo ao Hospital Simão Mendes, Bissau',
                'regiao': 'Bissau',
                'proprietario_vitima': 'Dr. Augusto Sambú',
                'contacto_vitima': '+245 955 120 441',
                'nivel_prioridade': 'Crítica / Vermelho',
                'status_alerta': 'Ativo - Veículo Procurado',
                'observacoes_policiais': 'Viatura subtraída com recurso a arma de fogo; suspeita de tentativa de fuga para a fronteira norte.',
            },
            {
                'codigo_alerta': 'ALR-2026-0002',
                'matricula': 'GB-15-KL',
                'marca_modelo': 'Mercedes-Benz 190D',
                'cor': 'Azul Escuro',
                'numero_chassis': 'WDB2011221F983412',
                'numero_boletim_furto': 'BO-FURTO-2026-064',
                'data_roubo': '2026-10-18 14:15',
                'local_roubo': 'Parqueamento do Mercado de Bandim, Bissau',
                'regiao': 'Bissau',
                'proprietario_vitima': 'Aminata Seidi',
                'contacto_vitima': '+245 966 331 890',
                'nivel_prioridade': 'Alta',
                'status_alerta': 'Ativo - Veículo Procurado',
                'observacoes_policiais': 'Furtado sem chaves de ignição; provável ligação direta efetuada.',
            },
            {
                'codigo_alerta': 'ALR-2026-0003',
                'matricula': 'GB-18-MN',
                'marca_modelo': 'Nissan Patrol GR 3.0',
                'cor': 'Preto',
                'numero_chassis': 'JN1TESY61U0048192',
                'numero_boletim_furto': 'BO-FURTO-2026-042',
                'data_roubo': '2026-10-05 02:40',
                'local_roubo': 'Centro da Cidade de Bafatá',
                'regiao': 'Bafatá',
                'proprietario_vitima': 'Malam Djassi',
                'contacto_vitima': '+245 955 771 202',
                'nivel_prioridade': 'Alta',
                'status_alerta': 'Intercetado / Recuperado',
                'data_recuperacao': '2026-10-12 16:20',
                'local_recuperacao': 'Posto de Fiscalização BNT Safim',
                'agente_recuperador': 'Sargento Domingos Sanhá (BNT)',
                'observacoes_policiais': 'Intercetado pela patrulha móvel após leitura por câmara LPR na N1; condutor detido em flagrante delito.',
            },
        ]
        for a in seed_alertas_roubo:
            AlertaVeiculoRoubado.objects.create(**a)

    if not LeituraAutomaticaPlaca.objects.exists():
        seed_lpr = [
            {
                'codigo': 'LPR-2026-0001',
                'matricula_detectada': 'GB-24-BC',
                'camera_id': 'CAM-BISSAU-AEROPORTO-01',
                'localizacao_camera': 'Av. dos Combatentes da Liberdade da Pátria (Sentido Aeroporto)',
                'coordenadas_gps': '11.8841, -15.6321',
                'velocidade_kmh': 54,
                'precisao_leitura': 99.20,
                'imagem_captura_url': '/media/lpr/lpr_gb_24_bc.jpg',
                'alerta_disparado': True,
                'tipo_alerta': 'Taxa de Circulação Vencida',
                'status_intercecao': 'Sinalizado para Posto Fixo Titina Silá',
                'data_hora': '2026-11-02 08:42:15',
            },
            {
                'codigo': 'LPR-2026-0002',
                'matricula_detectada': 'GB-21-XX',
                'camera_id': 'CAM-SAFIM-NORTE-02',
                'localizacao_camera': 'Rotunda de Safim - Estrada Nacional N1',
                'coordenadas_gps': '11.9542, -15.6511',
                'velocidade_kmh': 82,
                'precisao_leitura': 98.70,
                'imagem_captura_url': '/media/lpr/lpr_gb_21_xx_roubado.jpg',
                'alerta_disparado': True,
                'tipo_alerta': 'Veículo Roubado',
                'status_intercecao': 'ALERTA VERMELHO - Notificar Patrulha Imediatamente',
                'data_hora': '2026-11-02 09:14:30',
            },
            {
                'codigo': 'LPR-2026-0003',
                'matricula_detectada': 'GB-19-AA',
                'camera_id': 'CAM-PONTE-JOAOLANDIM-01',
                'localizacao_camera': 'Ponte Amílcar Cabral (João Landim)',
                'coordenadas_gps': '11.9810, -15.6792',
                'velocidade_kmh': 48,
                'precisao_leitura': 99.80,
                'imagem_captura_url': '/media/lpr/lpr_gb_19_aa.jpg',
                'alerta_disparado': False,
                'tipo_alerta': 'Nenhum',
                'status_intercecao': 'Livre / Sem Restrições',
                'data_hora': '2026-11-02 10:05:12',
            },
            {
                'codigo': 'LPR-2026-0004',
                'matricula_detectada': 'GB-30-ZZ',
                'camera_id': 'CAM-PORTO-BISSAU-03',
                'localizacao_camera': 'Acesso ao Porto de Bissau (Pidjiguiti)',
                'coordenadas_gps': '11.8542, -15.5781',
                'velocidade_kmh': 35,
                'precisao_leitura': 97.90,
                'imagem_captura_url': '/media/lpr/lpr_gb_30_zz.jpg',
                'alerta_disparado': False,
                'tipo_alerta': 'Nenhum',
                'status_intercecao': 'Livre / Sem Restrições',
                'data_hora': '2026-11-02 11:22:04',
            },
            {
                'codigo': 'LPR-2026-0005',
                'matricula_detectada': 'GB-08-TT',
                'camera_id': 'CAM-BAFATA-ENTRADA-01',
                'localizacao_camera': 'Entrada Poente de Bafatá - EN2',
                'coordenadas_gps': '12.1690, -14.6582',
                'velocidade_kmh': 104,
                'precisao_leitura': 98.40,
                'imagem_captura_url': '/media/lpr/lpr_gb_08_tt.jpg',
                'alerta_disparado': True,
                'tipo_alerta': 'Excesso de Velocidade',
                'status_intercecao': 'Auto de Notícia Automático Emitido',
                'data_hora': '2026-11-02 12:45:51',
            },
        ]
        for l in seed_lpr:
            LeituraAutomaticaPlaca.objects.create(**l)

    if not ConsultaMatriculaFiscalizacao.objects.exists():
        seed_consultas = [
            {
                'codigo': 'CMP-2026-0001',
                'matricula': 'GB-24-BC',
                'data_hora': '2026-11-02 08:50:00',
                'agente_responsavel': 'Agente Malam Pereira',
                'orgao_policial': 'Brigada Nacional de Trânsito (BNT)',
                'localizacao': 'Posto Fixo Titina Silá, Bissau',
                'coordenadas_gps': '11.8682, -15.5921',
                'status_veiculo': 'Irregular',
                'motivo_irregularidade': 'Imposto de Circulação / Vinheta em atraso (41.500 XOF)',
                'detalhes_veiculo': 'Toyota Corolla (2018) - Prata',
                'proprietario_nome': 'Mamadu Embaló',
                'seguro_valido': True,
                'inspecao_valida': True,
                'taxa_circulacao_paga': False,
                'bloqueio_administrativo': False,
            },
            {
                'codigo': 'CMP-2026-0002',
                'matricula': 'GB-19-AA',
                'data_hora': '2026-11-02 09:30:15',
                'agente_responsavel': 'Agente Principal Fátima Djú',
                'orgao_policial': 'Brigada Nacional de Trânsito (BNT)',
                'localizacao': 'Rotunda de Safim',
                'coordenadas_gps': '11.9542, -15.6511',
                'status_veiculo': 'Regular',
                'motivo_irregularidade': '',
                'detalhes_veiculo': 'Suzuki Carry (2020) - Branco',
                'proprietario_nome': 'Adama Baldé',
                'seguro_valido': True,
                'inspecao_valida': True,
                'taxa_circulacao_paga': True,
                'bloqueio_administrativo': False,
            },
            {
                'codigo': 'CMP-2026-0003',
                'matricula': 'GB-21-XX',
                'data_hora': '2026-11-02 10:12:00',
                'agente_responsavel': 'Sargento Braima Mané',
                'orgao_policial': 'Brigada Nacional de Trânsito (BNT)',
                'localizacao': 'Aeroporto Internacional Osvaldo Vieira',
                'coordenadas_gps': '11.8841, -15.6321',
                'status_veiculo': 'Alerta de Roubo',
                'motivo_irregularidade': 'Veículo com Mandado de Apreensão por Roubo (BO: BO-FURTO-2026-081)',
                'detalhes_veiculo': 'Toyota Hilux D-4D 2.8 (2021) - Branco',
                'proprietario_nome': 'Dr. Augusto Sambú',
                'seguro_valido': True,
                'inspecao_valida': True,
                'taxa_circulacao_paga': True,
                'bloqueio_administrativo': True,
            },
        ]
        for c in seed_consultas:
            ConsultaMatriculaFiscalizacao.objects.create(**c)

    if not ConsultaDocumentoQRCode.objects.exists():
        seed_qr = [
            {
                'codigo': 'QR-2026-0001',
                'tipo_documento': 'Certificado de Matrícula (DUA)',
                'numero_documento': 'DUA-GB-2024-009841',
                'titular_nome': 'Mamadu Embaló',
                'matricula_associada': 'GB-24-BC',
                'hash_criptografico': 'a7b9c1d3e5f7028149adbcde82410948',
                'status_validade': 'Autêntico e Válido',
                'data_emissao': '2024-01-15',
                'data_validade': '2029-01-15',
                'agente_verificador': 'Agente Malam Pereira',
                'dispositivo_utilizado': 'Terminal Zebra TC26 (BNT-01)',
                'data_verificacao': '2026-11-02 08:52:10',
            },
            {
                'codigo': 'QR-2026-0002',
                'tipo_documento': 'Carta de Condução Digital',
                'numero_documento': 'CND-GB-B-849201',
                'titular_nome': 'Bacar Camará',
                'matricula_associada': 'GB-19-AA',
                'hash_criptografico': '3f8e9102ab44cd55910385ffae029312',
                'status_validade': 'Autêntico e Válido',
                'data_emissao': '2023-05-10',
                'data_validade': '2028-05-10',
                'agente_verificador': 'Agente Principal Fátima Djú',
                'dispositivo_utilizado': 'Terminal Zebra TC26 (BNT-02)',
                'data_verificacao': '2026-11-02 09:32:44',
            },
            {
                'codigo': 'QR-2026-0003',
                'tipo_documento': 'Certificado de Inspeção Periódica',
                'numero_documento': 'IPO-GB-2024-44102',
                'titular_nome': 'Mariama Djabi',
                'matricula_associada': 'GB-22-CD',
                'hash_criptografico': 'cc894101eecb44019283f109248abce1',
                'status_validade': 'Documento Expirado',
                'data_emissao': '2024-02-01',
                'data_validade': '2025-02-01',
                'agente_verificador': 'Sargento Domingos Sanhá',
                'dispositivo_utilizado': 'Terminal Honeywell ScanPal',
                'data_verificacao': '2026-11-02 10:15:30',
            },
        ]
        for q in seed_qr:
            ConsultaDocumentoQRCode.objects.create(**q)

    if not DispositivoMovelPolicial.objects.exists():
        seed_dispositivos = [
            {
                'identificador': 'MOB-BNT-01',
                'agente_designado': 'Agente Malam Pereira',
                'nip_agente': 'BNT-1044',
                'unidade_policial': 'Brigada Nacional de Trânsito - Posto Titina Silá',
                'marca_modelo_aparelho': 'Zebra TC26 Android Rugged',
                'nivel_bateria': 92,
                'status_rede': 'Online (4G LTE)',
                'modo_offline': False,
                'registos_pendentes_sincronizacao': 0,
                'infracoes_lavradas_turno': 6,
                'consultas_efetuadas_turno': 48,
                'ultima_localizacao_gps': '11.8682, -15.5921',
                'versao_aplicativo': 'v2.4.1',
                'bloqueado_remotamente': False,
            },
            {
                'identificador': 'MOB-BNT-02',
                'agente_designado': 'Agente Principal Fátima Djú',
                'nip_agente': 'AG-GB-0219',
                'unidade_policial': 'Brigada Nacional de Trânsito - Destacamento de Safim',
                'marca_modelo_aparelho': 'Zebra TC26 Android Rugged',
                'nivel_bateria': 78,
                'status_rede': 'Online (4G LTE)',
                'modo_offline': False,
                'registos_pendentes_sincronizacao': 0,
                'infracoes_lavradas_turno': 4,
                'consultas_efetuadas_turno': 35,
                'ultima_localizacao_gps': '11.9542, -15.6511',
                'versao_aplicativo': 'v2.4.1',
                'bloqueado_remotamente': False,
            },
            {
                'identificador': 'MOB-POP-03',
                'agente_designado': 'Sargento Domingos Sanhá',
                'nip_agente': 'POP-3301',
                'unidade_policial': 'Polícia de Ordem Pública - Comando Regional de Bafatá',
                'marca_modelo_aparelho': 'Honeywell ScanPal EDA52',
                'nivel_bateria': 64,
                'status_rede': 'Offline (Armazenamento Local)',
                'modo_offline': True,
                'registos_pendentes_sincronizacao': 3,
                'infracoes_lavradas_turno': 2,
                'consultas_efetuadas_turno': 19,
                'ultima_localizacao_gps': '12.1690, -14.6582',
                'versao_aplicativo': 'v2.4.1',
                'bloqueado_remotamente': False,
            },
        ]
        for d in seed_dispositivos:
            DispositivoMovelPolicial.objects.create(**d)

    if not RegistoInfracaoCampo.objects.exists():
        seed_infracoes_campo = [
            {
                'numero_auto': 'AIF-2026-0142',
                'matricula': 'GB-22-CD',
                'marca_modelo': 'Mercedes-Benz Sprinter 313 CDI',
                'cor': 'Azul',
                'condutor_nome': 'Sene Camará',
                'condutor_documento': 'BI N.º 481920/2021',
                'condutor_carta': 'CND-GB-D-19042',
                'codigo_infracao': 'INF-008 - Lotação Excedida',
                'artigo_legal': 'Artigo 45.º do Código da Estrada (Lotação em transporte público)',
                'descricao_factos': 'Transporte coletivo de passageiros circulando com 23 ocupantes em veículo homologado para 15 lugares.',
                'valor_multa': 35000.00,
                'coordenadas_gps': '11.8610, -15.5890',
                'endereco_completo': 'Avenida Amílcar Cabral, junto à Praça dos Heróis Nacionais',
                'regiao': 'Bissau',
                'fotografia_evidencia_url': '/media/infracoes/lotacao_excedida_sprinter.jpg',
                'agente_autuante': 'Agente Malam Pereira',
                'agente_matricula': 'BNT-1044',
                'orgao_autuante': 'Brigada Nacional de Trânsito (BNT)',
                'status_pagamento': 'Pendente',
                'veiculo_apreendido': False,
                'data_hora_infracao': '2026-11-02 08:35:00',
            },
            {
                'numero_auto': 'AIF-2026-0143',
                'matricula': 'GB-08-TT',
                'marca_modelo': 'Toyota Land Cruiser Prado',
                'cor': 'Cinza',
                'condutor_nome': 'João Pedro Da Silva',
                'condutor_documento': 'BI N.º 390144/2020',
                'condutor_carta': 'CND-GB-B-99120',
                'codigo_infracao': 'INF-001 - Excesso de Velocidade Gravíssimo',
                'artigo_legal': 'Artigo 24.º do Código da Estrada (Velocidade excessiva em perímetro urbano)',
                'descricao_factos': 'Circulação a 104 km/h em via com limite regulamentar sinalizado de 60 km/h captado por cinemómetro / radar.',
                'valor_multa': 50000.00,
                'coordenadas_gps': '11.8920, -15.6140',
                'endereco_completo': 'Estrada de Bor, Bissau',
                'regiao': 'Bissau',
                'fotografia_evidencia_url': '/media/infracoes/radar_excesso_bor.jpg',
                'agente_autuante': 'Agente Principal Fátima Djú',
                'agente_matricula': 'AG-GB-0219',
                'orgao_autuante': 'Brigada Nacional de Trânsito (BNT)',
                'status_pagamento': 'Pendente',
                'veiculo_apreendido': False,
                'data_hora_infracao': '2026-11-02 10:14:00',
            },
            {
                'numero_auto': 'AIF-2026-0144',
                'matricula': 'GB-17-PL',
                'marca_modelo': 'Nissan Almera 1.6',
                'cor': 'Vermelho',
                'condutor_nome': 'Aliu Baldé',
                'condutor_documento': 'BI N.º 550182/2022',
                'condutor_carta': 'CND-GB-B-66103',
                'codigo_infracao': 'INF-003 - Condução sob Influência do Álcool',
                'artigo_legal': 'Artigo 81.º do Código da Estrada (Taxa de álcool no sangue)',
                'descricao_factos': 'Condutor submetido ao teste de ar expirado com resultado positivo de 0.72 g/l de álcool no sangue.',
                'valor_multa': 75000.00,
                'coordenadas_gps': '11.9542, -15.6511',
                'endereco_completo': 'Posto de Controlo Rodoviário de Safim',
                'regiao': 'Biombo',
                'fotografia_evidencia_url': '/media/infracoes/etilometro_teste_safim.jpg',
                'agente_autuante': 'Sargento Domingos Sanhá',
                'agente_matricula': 'POP-3301',
                'orgao_autuante': 'Guarda Nacional / BNT',
                'status_pagamento': 'Notificado',
                'veiculo_apreendido': True,
                'data_hora_infracao': '2026-11-02 11:30:00',
            },
        ]
        for inf in seed_infracoes_campo:
            RegistoInfracaoCampo.objects.create(**inf)

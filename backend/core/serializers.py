from rest_framework import serializers
from .models import (
    Veiculo, OcorrenciaVeicular, HistoricoProprietario, Condutor, RegistoCartaConducao, ExameCondutor, Multa, RecursoMulta, AgenteFiscalizador, TipoInfracao, InspecaoVeicular, DocumentoCertificado,
    VeiculoPublico, UtilizacaoVeiculoPublico, AbastecimentoFrota, ManutencaoFrota,
    AcidenteTransito, VeiculoCondutorAcidente, VitimaAcidente, TestemunhaAcidente, RelatorioPolicialAcidente, DocumentoFotografiaAcidente,
    ConsultaMatriculaFiscalizacao, LeituraAutomaticaPlaca, ConsultaDocumentoQRCode, DispositivoMovelPolicial, RegistoInfracaoCampo, AlertaVeiculoRoubado,
    UsuarioSistema, ConfiguracaoSistema,
    Consumidor, Fornecedor, Processo, MensagemProcesso, Documento,
    Fiscalizacao, Superendividamento, Audiencia
)


class VeiculoSerializer(serializers.ModelSerializer):
    plate = serializers.CharField(source='placa')
    make = serializers.CharField(source='marca')
    model = serializers.CharField(source='modelo')
    year = serializers.IntegerField(source='ano')
    color = serializers.CharField(source='cor', required=False, default='Branco')
    owner = serializers.CharField(source='proprietario')
    driver = serializers.CharField(source='condutor', required=False, allow_blank=True, default='')
    taxDue = serializers.IntegerField(source='imposto_devido', required=False, default=0)
    district = serializers.CharField(source='distrito')
    category = serializers.CharField(source='categoria')
    legalStatus = serializers.CharField(source='situacao_legal', required=False, default='Regular')

    class Meta:
        model = Veiculo
        fields = ['plate', 'make', 'model', 'year', 'color', 'owner', 'driver', 'taxDue', 'district', 'category', 'legalStatus']


class OcorrenciaVeicularSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    plate = serializers.CharField(source='placa')
    vehicleLabel = serializers.CharField(source='veiculo_descricao', required=False, allow_blank=True, default='')
    owner = serializers.CharField(source='proprietario', required=False, allow_blank=True, default='')
    recordCategory = serializers.CharField(source='categoria_registo', required=False, default='Ocorrência Policial / Fiscalização')
    eventType = serializers.CharField(source='tipo_evento')
    resultingStatus = serializers.CharField(source='situacao_resultante')
    reason = serializers.CharField(source='motivo')
    authority = serializers.CharField(source='autoridade_orgao', required=False, allow_blank=True, default='')
    processNumber = serializers.CharField(source='numero_processo', required=False, allow_blank=True, default='')
    location = serializers.CharField(source='local_deposito', required=False, allow_blank=True, default='')
    date = serializers.CharField(source='data_evento')
    notes = serializers.CharField(source='observacoes', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = OcorrenciaVeicular
        fields = [
            'id', 'plate', 'vehicleLabel', 'owner', 'recordCategory',
            'eventType', 'resultingStatus', 'reason', 'authority',
            'processNumber', 'location', 'date', 'notes', 'createdAt'
        ]


class HistoricoProprietarioSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    plate = serializers.CharField(source='placa')
    vehicleLabel = serializers.CharField(source='veiculo_descricao', required=False, allow_blank=True, default='')
    previousOwner = serializers.CharField(source='proprietario_anterior')
    previousDocument = serializers.CharField(source='documento_anterior', required=False, allow_blank=True, default='')
    newOwner = serializers.CharField(source='novo_proprietario')
    newDocument = serializers.CharField(source='documento_novo', required=False, allow_blank=True, default='')
    newDriver = serializers.CharField(source='novo_condutor', required=False, allow_blank=True, default='')
    district = serializers.CharField(source='distrito', required=False, allow_blank=True, default='')
    transferDate = serializers.CharField(source='data_transferencia')
    reason = serializers.CharField(source='motivo', required=False, default='Compra e venda')
    notes = serializers.CharField(source='observacoes', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = HistoricoProprietario
        fields = [
            'id', 'plate', 'vehicleLabel', 'previousOwner', 'previousDocument',
            'newOwner', 'newDocument', 'newDriver', 'district',
            'transferDate', 'reason', 'notes', 'createdAt'
        ]


class CondutorSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    name = serializers.CharField(source='nome')
    document = serializers.CharField(source='documento')
    documentFile = serializers.JSONField(source='arquivo_documento', required=False, allow_null=True)
    license = serializers.CharField(source='carta')
    category = serializers.CharField(source='categoria')
    phone = serializers.CharField(source='telefone')
    district = serializers.CharField(source='distrito')
    issueDate = serializers.CharField(source='data_emissao', required=False, allow_blank=True, default='2024-01-15')
    expiryDate = serializers.CharField(source='data_validade', required=False, allow_blank=True, default='2029-01-15')
    points = serializers.IntegerField(source='pontuacao', required=False, default=20)
    medicalRestrictions = serializers.CharField(source='restricoes_medicas', required=False, allow_blank=True, default='Sem restrições')

    class Meta:
        model = Condutor
        fields = [
            'id', 'name', 'document', 'documentFile', 'license', 'category',
            'phone', 'district', 'status', 'issueDate', 'expiryDate', 'points', 'medicalRestrictions'
        ]


class RegistoCartaConducaoSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    driverId = serializers.CharField(source='condutor_codigo')
    driverName = serializers.CharField(source='condutor_nome')
    license = serializers.CharField(source='carta')
    recordType = serializers.CharField(source='tipo_registo')
    actionDetail = serializers.CharField(source='detalhe_acao')
    category = serializers.CharField(source='categoria', required=False, allow_blank=True, default='')
    issueDate = serializers.CharField(source='data_emissao', required=False, allow_blank=True, default='')
    expiryDate = serializers.CharField(source='data_validade', required=False, allow_blank=True, default='')
    pointsDelta = serializers.IntegerField(source='pontos_delta', required=False, default=0)
    notes = serializers.CharField(source='motivo_observacoes', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = RegistoCartaConducao
        fields = [
            'id', 'driverId', 'driverName', 'license', 'recordType',
            'actionDetail', 'category', 'issueDate', 'expiryDate',
            'pointsDelta', 'notes', 'createdAt'
        ]


class ExameCondutorSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    driverId = serializers.CharField(source='condutor_codigo')
    driverName = serializers.CharField(source='condutor_nome')
    license = serializers.CharField(source='carta', required=False, allow_blank=True, default='')
    targetCategory = serializers.CharField(source='categoria_pretendida', required=False, default='B')
    examType = serializers.CharField(source='tipo_exame')
    result = serializers.CharField(source='resultado', required=False, default='Apto')
    medicalEntity = serializers.CharField(source='entidade_medica', required=False, allow_blank=True, default='')
    certificateNumber = serializers.CharField(source='numero_atestado', required=False, allow_blank=True, default='')
    restrictions = serializers.CharField(source='restricoes', required=False, allow_blank=True, default='Sem restrições')
    examDate = serializers.CharField(source='data_exame')
    expiryDate = serializers.CharField(source='validade_exame', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = ExameCondutor
        fields = [
            'id', 'driverId', 'driverName', 'license', 'targetCategory',
            'examType', 'result', 'medicalEntity', 'certificateNumber',
            'restrictions', 'examDate', 'expiryDate', 'createdAt'
        ]


class MultaSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    plate = serializers.CharField(source='placa')
    driver = serializers.CharField(source='condutor', required=False, allow_blank=True, default='')
    infraction = serializers.CharField(source='infracao')
    severity = serializers.CharField(source='gravidade', required=False, allow_blank=True, default='Média')
    amount = serializers.IntegerField(source='valor')
    date = serializers.CharField(source='data')
    agentName = serializers.CharField(source='agente_nome', required=False, allow_blank=True, default='Agente N.º 104 · Brigada de Trânsito')
    agentBadge = serializers.CharField(source='agente_matricula', required=False, allow_blank=True, default='AG-BT-104')
    location = serializers.CharField(source='local_infracao', required=False, allow_blank=True, default='Bissau')
    evidenceFile = serializers.JSONField(source='arquivo_prova', required=False, allow_null=True)
    evidenceDescription = serializers.CharField(source='descricao_prova', required=False, allow_blank=True, default='')
    paymentReceipt = serializers.CharField(source='comprovativo_pagamento', required=False, allow_blank=True, default='')
    paymentDate = serializers.CharField(source='data_pagamento', required=False, allow_blank=True, default='')
    paymentMethod = serializers.CharField(source='metodo_pagamento', required=False, allow_blank=True, default='')
    administrativeBlock = serializers.BooleanField(source='bloqueio_administrativo', required=False, default=False)
    blockReason = serializers.CharField(source='motivo_bloqueio', required=False, allow_blank=True, default='')

    class Meta:
        model = Multa
        fields = [
            'id', 'plate', 'driver', 'infraction', 'severity', 'amount', 'date', 'status',
            'agentName', 'agentBadge', 'location', 'evidenceFile', 'evidenceDescription',
            'paymentReceipt', 'paymentDate', 'paymentMethod', 'administrativeBlock', 'blockReason'
        ]


class RecursoMultaSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    fineId = serializers.CharField(source='auto_codigo')
    plate = serializers.CharField(source='placa')
    appellant = serializers.CharField(source='recorrente')
    grounds = serializers.CharField(source='fundamentacao')
    submissionDate = serializers.CharField(source='data_submissao')
    decision = serializers.CharField(source='decisao', required=False, default='Em análise')
    authorityNotes = serializers.CharField(source='parecer_autoridade', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = RecursoMulta
        fields = [
            'id', 'fineId', 'plate', 'appellant', 'grounds',
            'submissionDate', 'decision', 'authorityNotes', 'createdAt'
        ]


class AgenteFiscalizadorSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    name = serializers.CharField(source='nome')
    corps = serializers.CharField(source='corporacao', required=False, default='Brigada Nacional de Trânsito')
    rank = serializers.CharField(source='posto_patente', required=False, default='Subinspetor de Trânsito')
    office = serializers.CharField(source='delegacao', required=False, default='Bissau')
    phone = serializers.CharField(source='telefone', required=False, allow_blank=True, default='')

    class Meta:
        model = AgenteFiscalizador
        fields = ['id', 'name', 'corps', 'rank', 'office', 'phone', 'status']


class TipoInfracaoSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    name = serializers.CharField(source='nome')
    amount = serializers.IntegerField(source='valor')
    severity = serializers.CharField(source='gravidade', required=False, default='Média')
    description = serializers.CharField(source='descricao', required=False, allow_blank=True, default='')

    class Meta:
        model = TipoInfracao
        fields = ['id', 'name', 'amount', 'severity', 'description']


class InspecaoVeicularSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    plate = serializers.CharField(source='placa')
    reason = serializers.CharField(source='motivo')
    office = serializers.CharField(source='delegacao')
    date = serializers.CharField(source='data')

    class Meta:
        model = InspecaoVeicular
        fields = ['id', 'plate', 'reason', 'office', 'date', 'status']


class DocumentoCertificadoSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    documentType = serializers.CharField(source='tipo_documento')
    issueMode = serializers.CharField(source='modalidade_emissao', required=False, default='1.ª Via Original')
    targetRef = serializers.CharField(source='referencia_vinculada')
    holderName = serializers.CharField(source='titular_nome')
    holderDocument = serializers.CharField(source='titular_documento', required=False, allow_blank=True, default='')
    technicalDetails = serializers.CharField(source='detalhes_tecnicos', required=False, allow_blank=True, default='')
    authenticityCode = serializers.CharField(source='codigo_autenticidade')
    qrPayload = serializers.CharField(source='assinatura_qr')
    issuingOffice = serializers.CharField(source='delegacao_emissora', required=False, default='Direção-Geral de Viação · Bissau')
    issueDate = serializers.CharField(source='data_emissao')
    expiryDate = serializers.CharField(source='data_validade', required=False, allow_blank=True, default='Permanente')
    administrativeBlock = serializers.BooleanField(source='bloqueio_administrativo', required=False, default=False)
    blockReason = serializers.CharField(source='motivo_bloqueio', required=False, allow_blank=True, default='')
    notes = serializers.CharField(source='observacoes', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = DocumentoCertificado
        fields = [
            'id', 'documentType', 'issueMode', 'targetRef', 'holderName', 'holderDocument',
            'technicalDetails', 'authenticityCode', 'qrPayload', 'issuingOffice',
            'issueDate', 'expiryDate', 'status', 'administrativeBlock', 'blockReason', 'notes', 'createdAt'
        ]


class VeiculoPublicoSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    plate = serializers.CharField(source='placa')
    make = serializers.CharField(source='marca')
    model = serializers.CharField(source='modelo')
    year = serializers.IntegerField(source='ano')
    color = serializers.CharField(source='cor', required=False, default='Branco')
    category = serializers.CharField(source='categoria', required=False, default='Serviço Operacional')
    institution = serializers.CharField(source='ministerio_instituicao')
    institutionAcronym = serializers.CharField(source='sigla_instituicao', required=False, allow_blank=True, default='')
    department = serializers.CharField(source='departamento_direcao', required=False, allow_blank=True, default='')
    responsibleOfficer = serializers.CharField(source='funcionario_responsavel', required=False, allow_blank=True, default='')
    officerRole = serializers.CharField(source='funcionario_cargo', required=False, allow_blank=True, default='')
    officerContact = serializers.CharField(source='funcionario_contacto', required=False, allow_blank=True, default='')
    currentMileage = serializers.IntegerField(source='quilometragem_atual', required=False, default=0)
    tankCapacity = serializers.IntegerField(source='capacidade_tanque', required=False, default=65)
    fuelType = serializers.CharField(source='tipo_combustivel', required=False, default='Gasóleo (Diesel)')
    status = serializers.CharField(required=False, default='Em Serviço')
    chassisNumber = serializers.CharField(source='numero_chassi', required=False, allow_blank=True, default='')
    assignmentDate = serializers.CharField(source='data_afetacao', required=False, allow_blank=True, default='')
    notes = serializers.CharField(source='observacoes', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = VeiculoPublico
        fields = [
            'id', 'plate', 'make', 'model', 'year', 'color', 'category',
            'institution', 'institutionAcronym', 'department',
            'responsibleOfficer', 'officerRole', 'officerContact',
            'currentMileage', 'tankCapacity', 'fuelType', 'status',
            'chassisNumber', 'assignmentDate', 'notes', 'createdAt'
        ]


class UtilizacaoVeiculoPublicoSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    plate = serializers.CharField(source='veiculo_placa')
    institution = serializers.CharField(source='ministerio_instituicao')
    officerName = serializers.CharField(source='funcionario_nome')
    officerBadge = serializers.CharField(source='funcionario_matricula', required=False, allow_blank=True, default='')
    missionPurpose = serializers.CharField(source='motivo_missao')
    origin = serializers.CharField(source='origem', required=False, default='Bissau')
    destination = serializers.CharField(source='destino')
    departureDate = serializers.CharField(source='data_saida')
    departureTime = serializers.CharField(source='hora_saida', required=False, default='08:00')
    returnDate = serializers.CharField(source='data_retorno', required=False, allow_blank=True, default='')
    returnTime = serializers.CharField(source='hora_retorno', required=False, default='18:00')
    departureKm = serializers.IntegerField(source='km_saida', required=False, default=0)
    returnKm = serializers.IntegerField(source='km_retorno', required=False, default=0)
    totalKm = serializers.IntegerField(source='km_percorridos', required=False, default=0)
    status = serializers.CharField(required=False, default='Concluída')
    notes = serializers.CharField(source='observacoes', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = UtilizacaoVeiculoPublico
        fields = [
            'id', 'plate', 'institution', 'officerName', 'officerBadge',
            'missionPurpose', 'origin', 'destination',
            'departureDate', 'departureTime', 'returnDate', 'returnTime',
            'departureKm', 'returnKm', 'totalKm', 'status', 'notes', 'createdAt'
        ]


class AbastecimentoFrotaSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    plate = serializers.CharField(source='veiculo_placa')
    institution = serializers.CharField(source='ministerio_instituicao')
    driverName = serializers.CharField(source='funcionario_condutor')
    date = serializers.CharField(source='data_abastecimento')
    station = serializers.CharField(source='posto_combustivel', required=False, default='Petroguin - Luanda')
    fuelType = serializers.CharField(source='tipo_combustivel', required=False, default='Gasóleo')
    liters = serializers.FloatField(source='quantidade_litros')
    unitPrice = serializers.IntegerField(source='preco_por_litro', required=False, default=950)
    totalAmount = serializers.IntegerField(source='valor_total')
    mileageAtFuel = serializers.IntegerField(source='km_momento', required=False, default=0)
    voucherNumber = serializers.CharField(source='numero_talao', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = AbastecimentoFrota
        fields = [
            'id', 'plate', 'institution', 'driverName', 'date', 'station',
            'fuelType', 'liters', 'unitPrice', 'totalAmount', 'mileageAtFuel',
            'voucherNumber', 'createdAt'
        ]


class ManutencaoFrotaSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    plate = serializers.CharField(source='veiculo_placa')
    institution = serializers.CharField(source='ministerio_instituicao')
    maintenanceType = serializers.CharField(source='tipo_manutencao', required=False, default='Preventiva / Revisão Periódica')
    garage = serializers.CharField(source='oficina_prestador', required=False, default='Garagem Central do Estado')
    entryDate = serializers.CharField(source='data_entrada')
    completionDate = serializers.CharField(source='data_conclusao', required=False, allow_blank=True, default='')
    mileageAtService = serializers.IntegerField(source='km_manutencao', required=False, default=0)
    serviceDescription = serializers.CharField(source='descricao_servico')
    partsReplaced = serializers.CharField(source='pecas_substituidas', required=False, allow_blank=True, default='')
    totalCost = serializers.IntegerField(source='custo_total')
    status = serializers.CharField(required=False, default='Concluída')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = ManutencaoFrota
        fields = [
            'id', 'plate', 'institution', 'maintenanceType', 'garage',
            'entryDate', 'completionDate', 'mileageAtService',
            'serviceDescription', 'partsReplaced', 'totalCost', 'status', 'createdAt'
        ]


class UsuarioSistemaSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    role = serializers.CharField(source='perfil')
    office = serializers.CharField(source='delegacao')

    class Meta:
        model = UsuarioSistema
        fields = ['name', 'email', 'role', 'office', 'status']


class ConfiguracaoSistemaSerializer(serializers.ModelSerializer):
    institution = serializers.CharField(source='instituicao')
    system = serializers.CharField(source='sistema')
    currency = serializers.CharField(source='moeda')
    office = serializers.CharField(source='delegacao')

    class Meta:
        model = ConfiguracaoSistema
        fields = ['institution', 'system', 'currency', 'office']


class ConsumidorSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    phone = serializers.CharField(source='telefone')
    address = serializers.CharField(source='endereco', required=False, allow_blank=True)
    city = serializers.CharField(source='cidade', required=False, allow_blank=True)
    state = serializers.CharField(source='estado', required=False, allow_blank=True)
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = Consumidor
        fields = ['id', 'name', 'cpf', 'email', 'phone', 'address', 'city', 'state', 'status', 'createdAt']


class FornecedorSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    phone = serializers.CharField(source='telefone')
    address = serializers.CharField(source='endereco', required=False, allow_blank=True)
    city = serializers.CharField(source='cidade', required=False, allow_blank=True)
    state = serializers.CharField(source='estado', required=False, allow_blank=True)
    category = serializers.CharField(source='categoria', required=False, default='Geral')

    class Meta:
        model = Fornecedor
        fields = ['id', 'name', 'cnpj', 'email', 'phone', 'address', 'city', 'state', 'status', 'category']


class ProcessoSerializer(serializers.ModelSerializer):
    protocol = serializers.CharField(source='protocolo', read_only=True)
    consumerId = serializers.IntegerField(source='consumidor_id', required=False, allow_null=True)
    consumerName = serializers.CharField(source='nome_consumidor', required=False, allow_blank=True)
    supplierId = serializers.IntegerField(source='fornecedor_id', required=False, allow_null=True)
    supplierName = serializers.CharField(source='nome_fornecedor', required=False, allow_blank=True)
    priority = serializers.CharField(source='prioridade', required=False, default='Média')
    subject = serializers.CharField(source='assunto')
    description = serializers.CharField(source='descricao')
    date = serializers.DateTimeField(source='criado_em', read_only=True)
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)
    updatedAt = serializers.DateTimeField(source='atualizado_em', read_only=True)
    assignedTo = serializers.IntegerField(source='responsavel_id', required=False, allow_null=True)

    class Meta:
        model = Processo
        fields = [
            'id', 'protocol', 'consumerId', 'consumerName', 'supplierId', 'supplierName',
            'status', 'priority', 'subject', 'description', 'date', 'createdAt', 'updatedAt', 'assignedTo'
        ]


class MensagemProcessoSerializer(serializers.ModelSerializer):
    caseId = serializers.IntegerField(source='processo_id', read_only=True)
    senderId = serializers.IntegerField(source='remetente_id', required=False, default=1)
    senderName = serializers.CharField(source='nome_remetente', required=False, default='Administrador')
    content = serializers.CharField(source='conteudo')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)
    isInternal = serializers.BooleanField(source='interna', required=False, default=False)

    class Meta:
        model = MensagemProcesso
        fields = ['id', 'caseId', 'senderId', 'senderName', 'content', 'createdAt', 'isInternal']


class DocumentoSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='titulo')
    type = serializers.CharField(source='tipo_documento', required=False, default='PDF')
    size = serializers.CharField(source='tamanho', required=False, default='1.0 MB')
    category = serializers.CharField(source='categoria', required=False, default='Comprovante')
    uploadedBy = serializers.CharField(source='enviado_por', required=False, default='Administrador')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = Documento
        fields = ['id', 'title', 'type', 'size', 'category', 'uploadedBy', 'createdAt', 'url']


class FiscalizacaoSerializer(serializers.ModelSerializer):
    supplierName = serializers.CharField(source='nome_fornecedor')
    address = serializers.CharField(source='endereco')
    result = serializers.CharField(source='resultado')
    inspector = serializers.CharField(source='fiscal')

    class Meta:
        model = Fiscalizacao
        fields = ['id', 'supplierName', 'address', 'date', 'status', 'result', 'inspector']


class SuperendividamentoSerializer(serializers.ModelSerializer):
    consumerName = serializers.CharField(source='nome_consumidor')
    totalDebt = serializers.CharField(source='divida_total')
    creditorsCount = serializers.IntegerField(source='quantidade_credores')
    requestDate = serializers.DateTimeField(source='data_solicitacao')

    class Meta:
        model = Superendividamento
        fields = ['id', 'consumerName', 'totalDebt', 'creditorsCount', 'status', 'requestDate']


class AudienciaSerializer(serializers.ModelSerializer):
    caseProtocol = serializers.CharField(source='protocolo_processo')
    room = serializers.CharField(source='sala')
    mediator = serializers.CharField(source='conciliador')

    class Meta:
        model = Audiencia
        fields = ['id', 'caseProtocol', 'date', 'room', 'mediator', 'status']


# ==============================================================================
# Serializers de Gestão de Acidentes Rodoviários (SIGETRAN)
# ==============================================================================

class AcidenteTransitoSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    date = serializers.CharField(source='data_acidente')
    time = serializers.CharField(source='hora_acidente', required=False, default='12:00')
    severity = serializers.CharField(source='gravidade', required=False, default='Com Feridos')
    type = serializers.CharField(source='tipo_acidente', required=False, default='Colisão')
    region = serializers.CharField(source='regiao', required=False, default='Setor Autónomo de Bissau')
    road = serializers.CharField(source='local_via')
    latitude = serializers.FloatField(required=False, default=11.8632)
    longitude = serializers.FloatField(required=False, default=-15.5984)
    landmark = serializers.CharField(source='ponto_referencia', required=False, allow_blank=True, default='')
    weather = serializers.CharField(source='condicoes_meteorologicas', required=False, default='Bom tempo / Sol')
    roadCondition = serializers.CharField(source='estado_piso', required=False, default='Seco e limpo')
    vehiclesInvolved = serializers.IntegerField(source='quantidade_veiculos', required=False, default=2)
    victimsCount = serializers.IntegerField(source='quantidade_vitimas', required=False, default=0)
    fatalitiesCount = serializers.IntegerField(source='quantidade_mortos', required=False, default=0)
    injuredCount = serializers.IntegerField(source='quantidade_feridos', required=False, default=0)
    probableCause = serializers.CharField(source='causa_provavel', required=False, default='Excesso de velocidade')
    description = serializers.CharField(source='descricao_circunstancias', required=False, allow_blank=True, default='')
    status = serializers.CharField(required=False, default='Em Investigação')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = AcidenteTransito
        fields = [
            'id', 'date', 'time', 'severity', 'type', 'region', 'road',
            'latitude', 'longitude', 'landmark', 'weather', 'roadCondition',
            'vehiclesInvolved', 'victimsCount', 'fatalitiesCount', 'injuredCount',
            'probableCause', 'description', 'status', 'createdAt'
        ]


class VeiculoCondutorAcidenteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    accidentId = serializers.CharField(source='acidente_codigo')
    plate = serializers.CharField(source='veiculo_placa')
    vehicleLabel = serializers.CharField(source='veiculo_marca_modelo', required=False, allow_blank=True, default='')
    vehicleCategory = serializers.CharField(source='veiculo_categoria', required=False, default='Ligeiro particular')
    insuranceCompany = serializers.CharField(source='veiculo_seguradora', required=False, allow_blank=True, default='Garantia Seguros GB')
    insurancePolicy = serializers.CharField(source='veiculo_apolice', required=False, allow_blank=True, default='')
    damageDescription = serializers.CharField(source='danos_materiais', required=False, allow_blank=True, default='')
    driverName = serializers.CharField(source='condutor_nome')
    driverDocument = serializers.CharField(source='condutor_documento', required=False, allow_blank=True, default='')
    driverLicense = serializers.CharField(source='condutor_carta', required=False, allow_blank=True, default='')
    driverCategory = serializers.CharField(source='condutor_categoria_carta', required=False, allow_blank=True, default='B')
    driverPhone = serializers.CharField(source='condutor_telefone', required=False, allow_blank=True, default='')
    alcoholTest = serializers.CharField(source='teste_alcoolemia', required=False, default='0.00 g/l (Negativo)')
    liability = serializers.CharField(source='responsabilidade_apurada', required=False, default='Sob Peritagem')
    notes = serializers.CharField(source='observacoes', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = VeiculoCondutorAcidente
        fields = [
            'id', 'accidentId', 'plate', 'vehicleLabel', 'vehicleCategory',
            'insuranceCompany', 'insurancePolicy', 'damageDescription',
            'driverName', 'driverDocument', 'driverLicense', 'driverCategory',
            'driverPhone', 'alcoholTest', 'liability', 'notes', 'createdAt'
        ]


class VitimaAcidenteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    accidentId = serializers.CharField(source='acidente_codigo')
    name = serializers.CharField(source='nome')
    document = serializers.CharField(source='documento_identificacao', required=False, allow_blank=True, default='')
    age = serializers.IntegerField(source='idade', required=False, default=30)
    gender = serializers.CharField(source='sexo', required=False, default='Masculino')
    condition = serializers.CharField(source='condicao_vitima', required=False, default='Passageiro')
    associatedPlate = serializers.CharField(source='veiculo_placa', required=False, allow_blank=True, default='')
    injurySeverity = serializers.CharField(source='gravidade_lesao', required=False, default='Ferimentos Leves')
    hospital = serializers.CharField(source='hospital_destino', required=False, default='Hospital Nacional Simão Mendes')
    emergencyContact = serializers.CharField(source='contacto_emergencia', required=False, allow_blank=True, default='')
    medicalNotes = serializers.CharField(source='observacoes_medicas', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = VitimaAcidente
        fields = [
            'id', 'accidentId', 'name', 'document', 'age', 'gender', 'condition',
            'associatedPlate', 'injurySeverity', 'hospital', 'emergencyContact',
            'medicalNotes', 'createdAt'
        ]


class TestemunhaAcidenteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    accidentId = serializers.CharField(source='acidente_codigo')
    name = serializers.CharField(source='nome')
    document = serializers.CharField(source='documento_identificacao', required=False, allow_blank=True, default='')
    phone = serializers.CharField(source='telefone', required=False, allow_blank=True, default='')
    address = serializers.CharField(source='endereco', required=False, allow_blank=True, default='')
    locationAtMoment = serializers.CharField(source='posicao_momento', required=False, default='Peão no local')
    statement = serializers.CharField(source='depoimento', required=False, allow_blank=True, default='')
    statementDate = serializers.CharField(source='data_depoimento')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = TestemunhaAcidente
        fields = [
            'id', 'accidentId', 'name', 'document', 'phone', 'address',
            'locationAtMoment', 'statement', 'statementDate', 'createdAt'
        ]


class RelatorioPolicialAcidenteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    accidentId = serializers.CharField(source='acidente_codigo')
    reportNumber = serializers.CharField(source='numero_boletim')
    policeDepartment = serializers.CharField(source='orgao_policial', required=False, default='Brigada Nacional de Trânsito (BNT)')
    officerName = serializers.CharField(source='agente_responsavel')
    officerBadge = serializers.CharField(source='agente_matricula')
    reportDate = serializers.CharField(source='data_relatorio')
    investigationSummary = serializers.CharField(source='conclusao_pericial')
    infractionsFound = serializers.CharField(source='infracoes_constatadas', required=False, allow_blank=True, default='')
    legalReferral = serializers.CharField(source='encaminhamento', required=False, default='Remetido ao Ministério Público')
    procedureStatus = serializers.CharField(source='status_processo', required=False, default='Concluído')
    notes = serializers.CharField(source='observacoes', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = RelatorioPolicialAcidente
        fields = [
            'id', 'accidentId', 'reportNumber', 'policeDepartment', 'officerName',
            'officerBadge', 'reportDate', 'investigationSummary', 'infractionsFound',
            'legalReferral', 'procedureStatus', 'notes', 'createdAt'
        ]


class DocumentoFotografiaAcidenteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    accidentId = serializers.CharField(source='acidente_codigo')
    evidenceType = serializers.CharField(source='tipo_anexo', required=False, default='Fotografia do Local')
    title = serializers.CharField(source='titulo')
    fileUrl = serializers.CharField(source='arquivo_url', required=False, allow_blank=True, default='')
    description = serializers.CharField(source='descricao', required=False, allow_blank=True, default='')
    registeredBy = serializers.CharField(source='autor_anexo', required=False, default='Brigada de Peritagem BNT')
    registrationDate = serializers.CharField(source='data_registo')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = DocumentoFotografiaAcidente
        fields = [
            'id', 'accidentId', 'evidenceType', 'title', 'fileUrl',
            'description', 'registeredBy', 'registrationDate', 'createdAt'
        ]


# ==============================================================================
# Serializadores para Fiscalização Inteligente (Smart Road Enforcement)
# ==============================================================================

class ConsultaMatriculaFiscalizacaoSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    plate = serializers.CharField(source='matricula')
    queryDateTime = serializers.CharField(source='data_hora')
    officerName = serializers.CharField(source='agente_responsavel')
    policeDepartment = serializers.CharField(source='orgao_policial', required=False, default='Brigada Nacional de Trânsito (BNT)')
    location = serializers.CharField(source='localizacao', required=False, default='Bissau')
    gpsCoordinates = serializers.CharField(source='coordenadas_gps', required=False, allow_blank=True, default='')
    status = serializers.CharField(source='status_veiculo', required=False, default='Regular')
    irregularityReason = serializers.CharField(source='motivo_irregularidade', required=False, allow_blank=True, default='')
    vehicleDetails = serializers.CharField(source='detalhes_veiculo', required=False, allow_blank=True, default='')
    ownerName = serializers.CharField(source='proprietario_nome', required=False, allow_blank=True, default='')
    insuranceValid = serializers.BooleanField(source='seguro_valido', required=False, default=True)
    inspectionValid = serializers.BooleanField(source='inspecao_valida', required=False, default=True)
    circulationTaxPaid = serializers.BooleanField(source='taxa_circulacao_paga', required=False, default=True)
    administrativeBlock = serializers.BooleanField(source='bloqueio_administrativo', required=False, default=False)
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = ConsultaMatriculaFiscalizacao
        fields = [
            'id', 'plate', 'queryDateTime', 'officerName', 'policeDepartment',
            'location', 'gpsCoordinates', 'status', 'irregularityReason',
            'vehicleDetails', 'ownerName', 'insuranceValid', 'inspectionValid',
            'circulationTaxPaid', 'administrativeBlock', 'createdAt'
        ]


class LeituraAutomaticaPlacaSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    detectedPlate = serializers.CharField(source='matricula_detectada')
    cameraId = serializers.CharField(source='camera_id')
    cameraLocation = serializers.CharField(source='localizacao_camera')
    gpsCoordinates = serializers.CharField(source='coordenadas_gps', required=False, allow_blank=True, default='')
    speedKmh = serializers.IntegerField(source='velocidade_kmh', required=False, default=50)
    confidence = serializers.DecimalField(source='precisao_leitura', max_digits=5, decimal_places=2, required=False, default=98.50)
    captureImageUrl = serializers.CharField(source='imagem_captura_url', required=False, allow_blank=True, default='')
    alertTriggered = serializers.BooleanField(source='alerta_disparado', required=False, default=False)
    alertType = serializers.CharField(source='tipo_alerta', required=False, default='Nenhum')
    interceptionStatus = serializers.CharField(source='status_intercecao', required=False, default='Livre / Sem Restrições')
    timestamp = serializers.CharField(source='data_hora')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = LeituraAutomaticaPlaca
        fields = [
            'id', 'detectedPlate', 'cameraId', 'cameraLocation', 'gpsCoordinates',
            'speedKmh', 'confidence', 'captureImageUrl', 'alertTriggered',
            'alertType', 'interceptionStatus', 'timestamp', 'createdAt'
        ]


class ConsultaDocumentoQRCodeSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo')
    documentType = serializers.CharField(source='tipo_documento')
    documentNumber = serializers.CharField(source='numero_documento')
    holderName = serializers.CharField(source='titular_nome')
    associatedPlate = serializers.CharField(source='matricula_associada', required=False, allow_blank=True, default='')
    cryptographicHash = serializers.CharField(source='hash_criptografico')
    validityStatus = serializers.CharField(source='status_validade', required=False, default='Autêntico e Válido')
    issueDate = serializers.CharField(source='data_emissao')
    expiryDate = serializers.CharField(source='data_validade')
    verifiedBy = serializers.CharField(source='agente_verificador')
    deviceUsed = serializers.CharField(source='dispositivo_utilizado', required=False, default='Terminal Móvel Zebra TC26')
    verificationDate = serializers.CharField(source='data_verificacao')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = ConsultaDocumentoQRCode
        fields = [
            'id', 'documentType', 'documentNumber', 'holderName', 'associatedPlate',
            'cryptographicHash', 'validityStatus', 'issueDate', 'expiryDate',
            'verifiedBy', 'deviceUsed', 'verificationDate', 'createdAt'
        ]


class DispositivoMovelPolicialSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='identificador')
    assignedOfficer = serializers.CharField(source='agente_designado')
    officerBadge = serializers.CharField(source='nip_agente')
    policeUnit = serializers.CharField(source='unidade_policial', required=False, default='Brigada Nacional de Trânsito (BNT)')
    deviceModel = serializers.CharField(source='marca_modelo_aparelho', required=False, default='Zebra TC26 Android Rugged')
    batteryLevel = serializers.IntegerField(source='nivel_bateria', required=False, default=88)
    networkStatus = serializers.CharField(source='status_rede', required=False, default='Online (4G LTE)')
    isOffline = serializers.BooleanField(source='modo_offline', required=False, default=False)
    pendingSyncCount = serializers.IntegerField(source='registos_pendentes_sincronizacao', required=False, default=0)
    ticketsIssuedShift = serializers.IntegerField(source='infracoes_lavradas_turno', required=False, default=0)
    queriesDoneShift = serializers.IntegerField(source='consultas_efetuadas_turno', required=False, default=0)
    lastGps = serializers.CharField(source='ultima_localizacao_gps', required=False, default='11.8632, -15.5843')
    appVersion = serializers.CharField(source='versao_aplicativo', required=False, default='v2.4.1')
    isRemoteLocked = serializers.BooleanField(source='bloqueado_remotamente', required=False, default=False)
    lastSync = serializers.DateTimeField(source='atualizado_em', read_only=True)
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = DispositivoMovelPolicial
        fields = [
            'id', 'assignedOfficer', 'officerBadge', 'policeUnit', 'deviceModel',
            'batteryLevel', 'networkStatus', 'isOffline', 'pendingSyncCount',
            'ticketsIssuedShift', 'queriesDoneShift', 'lastGps', 'appVersion',
            'isRemoteLocked', 'lastSync', 'createdAt'
        ]


class RegistoInfracaoCampoSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='numero_auto')
    plate = serializers.CharField(source='matricula')
    vehicleLabel = serializers.CharField(source='marca_modelo', required=False, allow_blank=True, default='')
    color = serializers.CharField(source='cor', required=False, allow_blank=True, default='Branco')
    driverName = serializers.CharField(source='condutor_nome')
    driverDocument = serializers.CharField(source='condutor_documento')
    driverLicense = serializers.CharField(source='condutor_carta', required=False, allow_blank=True, default='')
    infractionCode = serializers.CharField(source='codigo_infracao')
    legalArticle = serializers.CharField(source='artigo_legal', required=False, default='Artigo 24.º do Código da Estrada')
    description = serializers.CharField(source='descricao_factos')
    fineAmount = serializers.DecimalField(source='valor_multa', max_digits=12, decimal_places=2, required=False, default=25000.00)
    gpsCoordinates = serializers.CharField(source='coordenadas_gps')
    locationAddress = serializers.CharField(source='endereco_completo')
    region = serializers.CharField(source='regiao', required=False, default='Bissau')
    evidencePhotoUrl = serializers.CharField(source='fotografia_evidencia_url', required=False, allow_blank=True, default='')
    officerName = serializers.CharField(source='agente_autuante')
    officerBadge = serializers.CharField(source='agente_matricula')
    policeDepartment = serializers.CharField(source='orgao_autuante', required=False, default='Brigada Nacional de Trânsito (BNT)')
    paymentStatus = serializers.CharField(source='status_pagamento', required=False, default='Pendente')
    vehicleImpounded = serializers.BooleanField(source='veiculo_apreendido', required=False, default=False)
    timestamp = serializers.CharField(source='data_hora_infracao')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = RegistoInfracaoCampo
        fields = [
            'id', 'plate', 'vehicleLabel', 'color', 'driverName', 'driverDocument',
            'driverLicense', 'infractionCode', 'legalArticle', 'description',
            'fineAmount', 'gpsCoordinates', 'locationAddress', 'region',
            'evidencePhotoUrl', 'officerName', 'officerBadge', 'policeDepartment',
            'paymentStatus', 'vehicleImpounded', 'timestamp', 'createdAt'
        ]


class AlertaVeiculoRoubadoSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='codigo_alerta')
    plate = serializers.CharField(source='matricula')
    vehicleLabel = serializers.CharField(source='marca_modelo')
    color = serializers.CharField(source='cor')
    vin = serializers.CharField(source='numero_chassis')
    theftReportNumber = serializers.CharField(source='numero_boletim_furto')
    theftDateTime = serializers.CharField(source='data_roubo')
    theftLocation = serializers.CharField(source='local_roubo')
    region = serializers.CharField(source='regiao', required=False, default='Bissau')
    victimName = serializers.CharField(source='proprietario_vitima')
    victimContact = serializers.CharField(source='contacto_vitima')
    priorityLevel = serializers.CharField(source='nivel_prioridade', required=False, default='Crítica / Vermelho')
    status = serializers.CharField(source='status_alerta', required=False, default='Ativo - Veículo Procurado')
    recoveryDate = serializers.CharField(source='data_recuperacao', required=False, allow_blank=True, default='')
    recoveryLocation = serializers.CharField(source='local_recuperacao', required=False, allow_blank=True, default='')
    recoveringOfficer = serializers.CharField(source='agente_recuperador', required=False, allow_blank=True, default='')
    policeNotes = serializers.CharField(source='observacoes_policiais', required=False, allow_blank=True, default='')
    createdAt = serializers.DateTimeField(source='criado_em', read_only=True)

    class Meta:
        model = AlertaVeiculoRoubado
        fields = [
            'id', 'plate', 'vehicleLabel', 'color', 'vin', 'theftReportNumber',
            'theftDateTime', 'theftLocation', 'region', 'victimName', 'victimContact',
            'priorityLevel', 'status', 'recoveryDate', 'recoveryLocation',
            'recoveringOfficer', 'policeNotes', 'createdAt'
        ]

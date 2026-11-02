from rest_framework import serializers
from .models import (
    Veiculo, OcorrenciaVeicular, HistoricoProprietario, Condutor, RegistoCartaConducao, ExameCondutor, Multa, RecursoMulta, AgenteFiscalizador, TipoInfracao, InspecaoVeicular, UsuarioSistema, ConfiguracaoSistema,
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

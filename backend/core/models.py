from django.db import models


# ==============================================================================
# Modelos SIGETRAN (Portal de Transportes e Trânsito) — Nomes em Português
# ==============================================================================

class Veiculo(models.Model):
    placa = models.CharField('Matrícula / Placa', max_length=32, unique=True)
    marca = models.CharField('Marca', max_length=100)
    modelo = models.CharField('Modelo', max_length=100)
    ano = models.IntegerField('Ano', default=2024)
    cor = models.CharField('Cor', max_length=50, default='Branco')
    proprietario = models.CharField('Proprietário', max_length=200)
    condutor = models.CharField('Condutor', max_length=200, blank=True, default='')
    imposto_devido = models.BigIntegerField('Imposto Devido', default=0)
    distrito = models.CharField('Distrito', max_length=100)
    categoria = models.CharField('Categoria', max_length=100)
    situacao_legal = models.CharField('Situação Legal', max_length=60, default='Regular')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'veiculos'
        verbose_name = 'Veículo'
        verbose_name_plural = 'Veículos'
        ordering = ['id']

    def __str__(self):
        return f"{self.placa} - {self.marca} {self.modelo}"


class OcorrenciaVeicular(models.Model):
    codigo = models.CharField('Código do Registo', max_length=50, unique=True)
    placa = models.CharField('Matrícula / Placa', max_length=32)
    veiculo_descricao = models.CharField('Descrição do Veículo', max_length=200, blank=True, default='')
    proprietario = models.CharField('Proprietário', max_length=200, blank=True, default='')
    categoria_registo = models.CharField('Categoria do Registo', max_length=60, default='Ocorrência Policial / Fiscalização')
    tipo_evento = models.CharField('Tipo de Evento', max_length=80)
    situacao_resultante = models.CharField('Situação Resultante do Veículo', max_length=60, default='Apreendido')
    motivo = models.CharField('Motivo / Enquadramento', max_length=200)
    autoridade_orgao = models.CharField('Autoridade / Órgão Responsável', max_length=150, blank=True, default='')
    numero_processo = models.CharField('N.º do Auto / Boletim / Processo', max_length=100, blank=True, default='')
    local_deposito = models.CharField('Local / Parque de Apreensão / Delegação', max_length=150, blank=True, default='')
    data_evento = models.CharField('Data do Evento', max_length=20)
    observacoes = models.CharField('Observações', max_length=255, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'ocorrencias_veiculares'
        verbose_name = 'Ocorrência / Baixa Veicular'
        verbose_name_plural = 'Ocorrências e Baixas Veiculares'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.placa} ({self.tipo_evento})"


class HistoricoProprietario(models.Model):
    codigo = models.CharField('Código da Transferência', max_length=50, unique=True)
    placa = models.CharField('Matrícula / Placa', max_length=32)
    veiculo_descricao = models.CharField('Veículo', max_length=200, blank=True, default='')
    proprietario_anterior = models.CharField('Proprietário Anterior', max_length=200)
    documento_anterior = models.CharField('Documento do Proprietário Anterior', max_length=100, blank=True, default='')
    novo_proprietario = models.CharField('Novo Proprietário', max_length=200)
    documento_novo = models.CharField('Documento do Novo Proprietário', max_length=100, blank=True, default='')
    novo_condutor = models.CharField('Novo Condutor Associado', max_length=200, blank=True, default='')
    distrito = models.CharField('Distrito', max_length=100, blank=True, default='')
    data_transferencia = models.CharField('Data da Transferência', max_length=20)
    motivo = models.CharField('Natureza / Motivo', max_length=100, default='Compra e venda')
    observacoes = models.CharField('Observações / Processo', max_length=255, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'historico_proprietarios'
        verbose_name = 'Histórico de Proprietário'
        verbose_name_plural = 'Histórico de Proprietários'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.placa}: {self.proprietario_anterior} -> {self.novo_proprietario}"


class Condutor(models.Model):
    codigo = models.CharField('Código', max_length=32, unique=True)
    nome = models.CharField('Nome Completo', max_length=200)
    documento = models.CharField('N.º de Identificação', max_length=100)
    arquivo_documento = models.JSONField('Arquivo do Documento', null=True, blank=True)
    carta = models.CharField('N.º da Carta', max_length=100)
    categoria = models.CharField('Categorias Habilitadas', max_length=150)
    telefone = models.CharField('Telefone', max_length=50)
    distrito = models.CharField('Distrito', max_length=100)
    status = models.CharField('Estado', max_length=50, default='Ativo')
    data_emissao = models.CharField('Data de Emissão da Carta', max_length=20, blank=True, default='2024-01-15')
    data_validade = models.CharField('Validade da Carta', max_length=20, blank=True, default='2029-01-15')
    pontuacao = models.IntegerField('Pontuação do Condutor', default=20)
    restricoes_medicas = models.CharField('Restrições / Observações da Carta', max_length=200, blank=True, default='Sem restrições')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'condutores'
        verbose_name = 'Condutor'
        verbose_name_plural = 'Condutores'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.nome}"


class RegistoCartaConducao(models.Model):
    codigo = models.CharField('Código do Registo', max_length=50, unique=True)
    condutor_codigo = models.CharField('Código do Condutor', max_length=32)
    condutor_nome = models.CharField('Nome do Condutor', max_length=200)
    carta = models.CharField('N.º da Carta', max_length=100)
    tipo_registo = models.CharField('Tipo de Operação', max_length=60)
    detalhe_acao = models.CharField('Ação / Natureza', max_length=150)
    categoria = models.CharField('Categoria(s) (A, B, C, D, E)', max_length=100, blank=True, default='')
    data_emissao = models.CharField('Data de Emissão / Registo', max_length=20, blank=True, default='')
    data_validade = models.CharField('Nova Validade / Prazo', max_length=20, blank=True, default='')
    pontos_delta = models.IntegerField('Variação de Pontos', default=0)
    motivo_observacoes = models.CharField('Motivo / Processo / Observações', max_length=255, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'registos_carta_conducao'
        verbose_name = 'Registo de Carta de Condução'
        verbose_name_plural = 'Registos de Carta de Condução'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.condutor_nome} ({self.tipo_registo})"


class ExameCondutor(models.Model):
    codigo = models.CharField('Código do Exame', max_length=50, unique=True)
    condutor_codigo = models.CharField('Código do Condutor', max_length=32)
    condutor_nome = models.CharField('Nome do Condutor', max_length=200)
    carta = models.CharField('N.º da Carta', max_length=100, blank=True, default='')
    categoria_pretendida = models.CharField('Categoria Avaliada', max_length=50, default='B')
    tipo_exame = models.CharField('Tipo de Exame', max_length=80)
    resultado = models.CharField('Resultado', max_length=50, default='Apto')
    entidade_medica = models.CharField('Centro Médico / Especialista', max_length=150, blank=True, default='')
    numero_atestado = models.CharField('N.º do Atestado / Laudo', max_length=100, blank=True, default='')
    restricoes = models.CharField('Restrições / Recomendações', max_length=200, blank=True, default='Sem restrições')
    data_exame = models.CharField('Data do Exame', max_length=20)
    validade_exame = models.CharField('Validade do Exame', max_length=20, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'exames_condutores'
        verbose_name = 'Exame Médico / Psicológico de Condutor'
        verbose_name_plural = 'Exames Médicos e Psicológicos de Condutores'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.condutor_nome} ({self.tipo_exame})"


class Multa(models.Model):
    codigo = models.CharField('N.º do Auto', max_length=50, unique=True)
    placa = models.CharField('Matrícula / Placa', max_length=32)
    condutor = models.CharField('Condutor / Proprietário', max_length=200, blank=True, default='')
    infracao = models.CharField('Infração', max_length=255)
    gravidade = models.CharField('Gravidade', max_length=50, blank=True, default='Média')
    valor = models.BigIntegerField('Valor (XOF)', default=0)
    data = models.CharField('Data', max_length=20)
    status = models.CharField('Estado', max_length=30, default='Pendente')
    agente_nome = models.CharField('Agente Fiscalizador', max_length=150, blank=True, default='Agente N.º 104 · Brigada de Trânsito')
    agente_matricula = models.CharField('Matrícula / Crachá do Agente', max_length=60, blank=True, default='AG-BT-104')
    local_infracao = models.CharField('Local da Infração', max_length=200, blank=True, default='Bissau')
    arquivo_prova = models.JSONField('Fotografia / Prova Anexa', null=True, blank=True)
    descricao_prova = models.CharField('Descrição da Prova / Equipamento', max_length=255, blank=True, default='')
    comprovativo_pagamento = models.CharField('N.º do Comprovativo / Recibo', max_length=100, blank=True, default='')
    data_pagamento = models.CharField('Data do Pagamento', max_length=20, blank=True, default='')
    metodo_pagamento = models.CharField('Meio de Pagamento', max_length=80, blank=True, default='')
    bloqueio_administrativo = models.BooleanField('Bloqueio Administrativo Ativo', default=False)
    motivo_bloqueio = models.CharField('Motivo / Despacho do Bloqueio Administrativo', max_length=255, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'multas'
        verbose_name = 'Multa'
        verbose_name_plural = 'Multas'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.placa}"


class RecursoMulta(models.Model):
    codigo = models.CharField('N.º do Processo de Recurso', max_length=50, unique=True)
    auto_codigo = models.CharField('N.º do Auto de Infração', max_length=50)
    placa = models.CharField('Matrícula / Placa', max_length=32)
    recorrente = models.CharField('Condutor / Proprietário Recorrente', max_length=200)
    fundamentacao = models.CharField('Fundamentação / Alegações da Contestação', max_length=255)
    data_submissao = models.CharField('Data de Submissão', max_length=20)
    decisao = models.CharField('Estado / Decisão', max_length=50, default='Em análise')
    parecer_autoridade = models.CharField('Parecer da Comissão / Autoridade', max_length=255, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'recursos_multas'
        verbose_name = 'Recurso / Contestação de Multa'
        verbose_name_plural = 'Recursos e Contestações de Multas'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - Auto {self.auto_codigo}"


class AgenteFiscalizador(models.Model):
    codigo = models.CharField('Matrícula / Crachá', max_length=50, unique=True)
    nome = models.CharField('Nome Completo do Agente', max_length=200)
    corporacao = models.CharField('Corporação / Unidade', max_length=150, default='Brigada Nacional de Trânsito')
    posto_patente = models.CharField('Posto / Função', max_length=100, default='Subinspetor de Trânsito')
    delegacao = models.CharField('Delegação / Zona de Atuação', max_length=100, default='Bissau')
    telefone = models.CharField('Contacto de Serviço', max_length=50, blank=True, default='')
    status = models.CharField('Estado', max_length=40, default='Ativo')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'agentes_fiscalizadores'
        verbose_name = 'Agente Fiscalizador'
        verbose_name_plural = 'Agentes Fiscalizadores'
        ordering = ['id']

    def __str__(self):
        return f"{self.codigo} - {self.nome}"


class TipoInfracao(models.Model):
    codigo = models.CharField('Código', max_length=50, unique=True)
    nome = models.CharField('Descrição da Infração', max_length=255, unique=True)
    valor = models.BigIntegerField('Preço / Valor (XOF)', default=0)
    gravidade = models.CharField('Gravidade', max_length=50, default='Média')
    descricao = models.CharField('Observação', max_length=255, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'tipos_infracao'
        verbose_name = 'Tipo de Infração'
        verbose_name_plural = 'Tipos de Infração'
        ordering = ['id']

    def __str__(self):
        return f"{self.nome} ({self.valor} XOF)"


class InspecaoVeicular(models.Model):
    codigo = models.CharField('Referência', max_length=50, unique=True)
    placa = models.CharField('Matrícula / Placa', max_length=32)
    motivo = models.CharField('Tipo de Inspeção', max_length=200)
    delegacao = models.CharField('Delegação', max_length=100)
    data = models.CharField('Data', max_length=20)
    status = models.CharField('Estado', max_length=50, default='Agendada')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'inspecoes_veiculares'
        verbose_name = 'Inspeção Veicular'
        verbose_name_plural = 'Inspeções Veiculares'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.placa}"


class DocumentoCertificado(models.Model):
    codigo = models.CharField('N.º do Documento / Certificado', max_length=50, unique=True)
    tipo_documento = models.CharField('Tipo de Documento', max_length=120)
    modalidade_emissao = models.CharField('Modalidade de Emissão', max_length=100, default='1.ª Via Original')
    referencia_vinculada = models.CharField('Matrícula ou N.º da Carta', max_length=60)
    titular_nome = models.CharField('Nome do Titular / Proprietário / Condutor', max_length=200)
    titular_documento = models.CharField('BI / NIF do Titular', max_length=60, blank=True, default='')
    detalhes_tecnicos = models.CharField('Dados Técnicos (Veículo ou Categorias)', max_length=255, blank=True, default='')
    codigo_autenticidade = models.CharField('Código Público de Autenticidade', max_length=80, unique=True)
    assinatura_qr = models.CharField('Payload de Validação QR Code', max_length=255)
    delegacao_emissora = models.CharField('Delegação Emissora', max_length=120, default='Direção-Geral de Viação · Bissau')
    data_emissao = models.CharField('Data de Emissão', max_length=20)
    data_validade = models.CharField('Validade', max_length=40, blank=True, default='Permanente')
    status = models.CharField('Estado do Documento', max_length=50, default='Válido')
    bloqueio_administrativo = models.BooleanField('Bloqueio Administrativo Ativo', default=False)
    motivo_bloqueio = models.CharField('Fundamentação / Despacho de Bloqueio', max_length=255, blank=True, default='')
    observacoes = models.CharField('Observações / Motivo de 2.ª Via', max_length=255, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'documentos_certificados'
        verbose_name = 'Documento / Certificado Oficial'
        verbose_name_plural = 'Documentos e Certificados Oficiais'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.tipo_documento} ({self.referencia_vinculada})"


# ==============================================================================
# Modelos de Gestão da Frota do Estado (SIGETRAN / Setor Público)
# ==============================================================================

class VeiculoPublico(models.Model):
    codigo = models.CharField('N.º de Frota', max_length=50, unique=True)
    placa = models.CharField('Matrícula Oficial', max_length=32, unique=True)
    marca = models.CharField('Marca', max_length=100)
    modelo = models.CharField('Modelo', max_length=100)
    ano = models.IntegerField('Ano de Fabrico', default=2024)
    cor = models.CharField('Cor', max_length=50, default='Branco')
    categoria = models.CharField('Categoria de Serviço', max_length=100, default='Serviço Operacional')
    ministerio_instituicao = models.CharField('Ministério / Instituição Responsável', max_length=200)
    sigla_instituicao = models.CharField('Sigla', max_length=40, blank=True, default='')
    departamento_direcao = models.CharField('Departamento / Direção Afeta', max_length=200, blank=True, default='')
    funcionario_responsavel = models.CharField('Funcionário Responsável', max_length=200, blank=True, default='')
    funcionario_cargo = models.CharField('Cargo do Responsável', max_length=150, blank=True, default='')
    funcionario_contacto = models.CharField('Contacto do Funcionário', max_length=60, blank=True, default='')
    quilometragem_atual = models.IntegerField('Quilometragem Atual (km)', default=0)
    capacidade_tanque = models.IntegerField('Capacidade do Depósito (L)', default=65)
    tipo_combustivel = models.CharField('Tipo de Combustível', max_length=50, default='Gasóleo (Diesel)')
    status = models.CharField('Estado Operacional', max_length=50, default='Em Serviço')
    numero_chassi = models.CharField('N.º de Chassi / Quadro', max_length=100, blank=True, default='')
    data_afetacao = models.CharField('Data de Afetação', max_length=20, blank=True, default='')
    observacoes = models.CharField('Observações', max_length=255, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'veiculos_publicos'
        verbose_name = 'Veículo Público'
        verbose_name_plural = 'Veículos Públicos'
        ordering = ['id']

    def __str__(self):
        return f"{self.codigo} - {self.placa} ({self.ministerio_instituicao})"


class UtilizacaoVeiculoPublico(models.Model):
    codigo = models.CharField('N.º da Missão / Requisição', max_length=50, unique=True)
    veiculo_placa = models.CharField('Matrícula do Veículo', max_length=32)
    ministerio_instituicao = models.CharField('Ministério / Instituição', max_length=200)
    funcionario_nome = models.CharField('Condutor / Funcionário Requisitante', max_length=200)
    funcionario_matricula = models.CharField('N.º de BI / Matrícula do Funcionário', max_length=60, blank=True, default='')
    motivo_missao = models.CharField('Finalidade / Motivo da Missão', max_length=255)
    origem = models.CharField('Local de Origem', max_length=100, default='Bissau')
    destino = models.CharField('Destino / Rota', max_length=150)
    data_saida = models.CharField('Data de Saída', max_length=20)
    hora_saida = models.CharField('Hora de Saída', max_length=10, blank=True, default='08:00')
    data_retorno = models.CharField('Data Prevista de Retorno', max_length=20, blank=True, default='')
    hora_retorno = models.CharField('Hora de Retorno', max_length=10, blank=True, default='18:00')
    km_saida = models.IntegerField('Quilometragem de Saída', default=0)
    km_retorno = models.IntegerField('Quilometragem de Chegada', default=0)
    km_percorridos = models.IntegerField('Quilómetros Percorridos', default=0)
    status = models.CharField('Estado da Missão', max_length=40, default='Concluída')
    observacoes = models.CharField('Observações da Utilização', max_length=255, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'utilizacoes_frota_publica'
        verbose_name = 'Utilização de Veículo Público'
        verbose_name_plural = 'Utilizações de Frota Pública'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.veiculo_placa} ({self.destino})"


class AbastecimentoFrota(models.Model):
    codigo = models.CharField('N.º do Abastecimento / Talão', max_length=50, unique=True)
    veiculo_placa = models.CharField('Matrícula do Veículo', max_length=32)
    ministerio_instituicao = models.CharField('Ministério / Instituição', max_length=200)
    funcionario_condutor = models.CharField('Funcionário / Condutor', max_length=200)
    data_abastecimento = models.CharField('Data do Abastecimento', max_length=20)
    posto_combustivel = models.CharField('Posto / Fornecedor', max_length=150, default='Petroguin - Luanda')
    tipo_combustivel = models.CharField('Tipo de Combustível', max_length=50, default='Gasóleo')
    quantidade_litros = models.FloatField('Quantidade (Litros)', default=0.0)
    preco_por_litro = models.IntegerField('Preço por Litro (XOF)', default=950)
    valor_total = models.BigIntegerField('Valor Total (XOF)', default=0)
    km_momento = models.IntegerField('Quilometragem no Abastecimento', default=0)
    numero_talao = models.CharField('N.º da Requisição / Cupão', max_length=80, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'abastecimentos_frota_publica'
        verbose_name = 'Abastecimento da Frota Pública'
        verbose_name_plural = 'Abastecimentos da Frota Pública'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.veiculo_placa} ({self.quantidade_litros} L)"


class ManutencaoFrota(models.Model):
    codigo = models.CharField('N.º da Ordem de Reparação', max_length=50, unique=True)
    veiculo_placa = models.CharField('Matrícula do Veículo', max_length=32)
    ministerio_instituicao = models.CharField('Ministério / Instituição', max_length=200)
    tipo_manutencao = models.CharField('Tipo de Manutenção', max_length=100, default='Preventiva / Revisão Periódica')
    oficina_prestador = models.CharField('Oficina / Prestador de Serviço', max_length=150, default='Garagem Central do Estado')
    data_entrada = models.CharField('Data de Entrada', max_length=20)
    data_conclusao = models.CharField('Data de Conclusão', max_length=20, blank=True, default='')
    km_manutencao = models.IntegerField('Quilometragem na Manutenção', default=0)
    descricao_servico = models.CharField('Descrição da Intervenção', max_length=255)
    pecas_substituidas = models.CharField('Peças Substituídas / Materiais', max_length=255, blank=True, default='')
    custo_total = models.BigIntegerField('Custo Total (XOF)', default=0)
    status = models.CharField('Estado da Manutenção', max_length=40, default='Concluída')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'manutencoes_frota_publica'
        verbose_name = 'Manutenção de Frota Pública'
        verbose_name_plural = 'Manutenções da Frota Pública'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.veiculo_placa} ({self.tipo_manutencao})"


class UsuarioSistema(models.Model):
    nome = models.CharField('Nome', max_length=200)
    email = models.EmailField('Email', unique=True)
    senha = models.CharField('Senha (Hash)', max_length=255, blank=True, default='')
    perfil = models.CharField('Perfil', max_length=100, default='Atendimento')
    delegacao = models.CharField('Delegação', max_length=100, default='Direção Nacional')
    status = models.CharField('Estado', max_length=50, default='Ativo')
    ultimo_acesso = models.DateTimeField('Último Acesso', null=True, blank=True)
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'usuarios_sistema'
        verbose_name = 'Usuário do Sistema'
        verbose_name_plural = 'Usuários do Sistema'
        ordering = ['-id']

    def __str__(self):
        return f"{self.nome} ({self.email})"


class ConfiguracaoSistema(models.Model):
    instituicao = models.CharField('Instituição', max_length=255, default='Ministério dos Transportes · Guiné-Bissau')
    sistema = models.CharField('Sistema', max_length=100, default='SIGETRAN')
    moeda = models.CharField('Moeda', max_length=100, default='Franco CFA (XOF)')
    delegacao = models.CharField('Delegação Padrão', max_length=100, default='Bissau')
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)

    class Meta:
        db_table = 'configuracoes_sistema'
        verbose_name = 'Configuração do Sistema'
        verbose_name_plural = 'Configurações do Sistema'

    def __str__(self):
        return f"{self.sistema} - {self.instituicao}"


# ==============================================================================
# Modelos PROCON — Nomes em Português
# ==============================================================================

class Consumidor(models.Model):
    nome = models.CharField('Nome', max_length=200)
    cpf = models.CharField('CPF', max_length=30)
    email = models.EmailField('Email')
    telefone = models.CharField('Telefone', max_length=50)
    endereco = models.CharField('Endereço', max_length=255, blank=True, default='')
    cidade = models.CharField('Cidade', max_length=100, blank=True, default='João Pessoa')
    estado = models.CharField('Estado', max_length=10, blank=True, default='PB')
    status = models.CharField('Status', max_length=30, default='Ativo')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'consumidores'
        verbose_name = 'Consumidor'
        verbose_name_plural = 'Consumidores'
        ordering = ['id']

    def __str__(self):
        return f"{self.nome} ({self.cpf})"


class Fornecedor(models.Model):
    nome = models.CharField('Nome / Razão Social', max_length=200)
    cnpj = models.CharField('CNPJ', max_length=30)
    email = models.EmailField('Email')
    telefone = models.CharField('Telefone', max_length=50)
    endereco = models.CharField('Endereço', max_length=255, blank=True, default='')
    cidade = models.CharField('Cidade', max_length=100, blank=True, default='João Pessoa')
    estado = models.CharField('Estado', max_length=10, blank=True, default='PB')
    status = models.CharField('Status', max_length=30, default='Ativo')
    categoria = models.CharField('Categoria', max_length=100, default='Geral')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'fornecedores'
        verbose_name = 'Fornecedor'
        verbose_name_plural = 'Fornecedores'
        ordering = ['id']

    def __str__(self):
        return f"{self.nome} ({self.cnpj})"


class Processo(models.Model):
    protocolo = models.CharField('Protocolo', max_length=30, unique=True)
    consumidor = models.ForeignKey(Consumidor, on_delete=models.SET_NULL, null=True, blank=True, related_name='processos')
    nome_consumidor = models.CharField('Nome do Consumidor', max_length=200)
    fornecedor = models.ForeignKey(Fornecedor, on_delete=models.SET_NULL, null=True, blank=True, related_name='processos')
    nome_fornecedor = models.CharField('Nome do Fornecedor', max_length=200)
    status = models.CharField('Status', max_length=50, default='Aberto')
    prioridade = models.CharField('Prioridade', max_length=30, default='Média')
    assunto = models.CharField('Assunto', max_length=255)
    descricao = models.TextField('Descrição')
    responsavel_id = models.IntegerField('Responsável ID', null=True, blank=True)
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)

    class Meta:
        db_table = 'processos'
        verbose_name = 'Processo'
        verbose_name_plural = 'Processos'
        ordering = ['-id']

    def __str__(self):
        return f"{self.protocolo} - {self.assunto}"


class MensagemProcesso(models.Model):
    processo = models.ForeignKey(Processo, on_delete=models.CASCADE, related_name='mensagens')
    remetente_id = models.IntegerField('Remetente ID', default=1)
    nome_remetente = models.CharField('Nome do Remetente', max_length=200, default='Administrador')
    conteudo = models.TextField('Conteúdo')
    interna = models.BooleanField('Mensagem Interna', default=False)
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'mensagens_processo'
        verbose_name = 'Mensagem do Processo'
        verbose_name_plural = 'Mensagens do Processo'
        ordering = ['criado_em']

    def __str__(self):
        return f"Mensagem #{self.id} ({self.processo.protocolo})"


class Documento(models.Model):
    titulo = models.CharField('Título', max_length=255)
    tipo_documento = models.CharField('Tipo', max_length=50, default='PDF')
    tamanho = models.CharField('Tamanho', max_length=50, default='1.0 MB')
    categoria = models.CharField('Categoria', max_length=100, default='Comprovante')
    enviado_por = models.CharField('Enviado por', max_length=150, default='Administrador')
    url = models.CharField('URL', max_length=500, default='#')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'documentos'
        verbose_name = 'Documento'
        verbose_name_plural = 'Documentos'
        ordering = ['-id']

    def __str__(self):
        return self.titulo


class Fiscalizacao(models.Model):
    nome_fornecedor = models.CharField('Nome do Fornecedor', max_length=200)
    endereco = models.CharField('Endereço', max_length=255)
    data = models.DateTimeField('Data')
    status = models.CharField('Status', max_length=50, default='Agendada')
    resultado = models.CharField('Resultado', max_length=50, default='Pendente')
    fiscal = models.CharField('Fiscal', max_length=150, default='Fiscal João')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'fiscalizacoes'
        verbose_name = 'Fiscalização'
        verbose_name_plural = 'Fiscalizações'
        ordering = ['-id']

    def __str__(self):
        return f"{self.nome_fornecedor} ({self.status})"


class Superendividamento(models.Model):
    nome_consumidor = models.CharField('Nome do Consumidor', max_length=200)
    divida_total = models.CharField('Dívida Total', max_length=50)
    quantidade_credores = models.IntegerField('Quantidade de Credores', default=1)
    status = models.CharField('Status', max_length=50, default='Em Análise')
    data_solicitacao = models.DateTimeField('Data da Solicitação')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'superendividamentos'
        verbose_name = 'Superendividamento'
        verbose_name_plural = 'Superendividamentos'
        ordering = ['-id']

    def __str__(self):
        return f"{self.nome_consumidor} - R$ {self.divida_total}"


class Audiencia(models.Model):
    protocolo_processo = models.CharField('Protocolo do Processo', max_length=50)
    data = models.DateTimeField('Data e Hora')
    sala = models.CharField('Sala', max_length=100)
    conciliador = models.CharField('Conciliador', max_length=150)
    status = models.CharField('Status', max_length=50, default='Agendada')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'audiencias'
        verbose_name = 'Audiência'
        verbose_name_plural = 'Audiências'
        ordering = ['data']

    def __str__(self):
        return f"{self.protocolo_processo} - {self.sala}"


# ==============================================================================
# Modelos de Gestão de Acidentes Rodoviários (SIGETRAN / Trânsito e Segurança)
# ==============================================================================

class AcidenteTransito(models.Model):
    codigo = models.CharField('N.º do Registo de Acidente', max_length=50, unique=True)
    data_acidente = models.CharField('Data do Acidente', max_length=20)
    hora_acidente = models.CharField('Hora do Acidente', max_length=10, blank=True, default='12:00')
    gravidade = models.CharField('Gravidade do Acidente', max_length=60, default='Com Feridos')
    tipo_acidente = models.CharField('Tipo de Acidente', max_length=80, default='Colisão')
    regiao = models.CharField('Região / Distrito', max_length=100, default='Setor Autónomo de Bissau')
    local_via = models.CharField('Local / Via / Estrada', max_length=200)
    latitude = models.FloatField('Latitude (GPS)', default=11.8632)
    longitude = models.FloatField('Longitude (GPS)', default=-15.5984)
    ponto_referencia = models.CharField('Ponto de Referência', max_length=200, blank=True, default='')
    condicoes_meteorologicas = models.CharField('Condições Meteorológicas', max_length=80, default='Bom tempo / Sol')
    estado_piso = models.CharField('Estado da Via / Piso', max_length=80, default='Seco e limpo')
    quantidade_veiculos = models.IntegerField('Veículos Envolvidos', default=2)
    quantidade_vitimas = models.IntegerField('Total de Vítimas', default=0)
    quantidade_mortos = models.IntegerField('Vítimas Mortais (Óbitos)', default=0)
    quantidade_feridos = models.IntegerField('Feridos', default=0)
    causa_provavel = models.CharField('Causa Provável', max_length=150, default='Excesso de velocidade')
    descricao_circunstancias = models.TextField('Descrição Sumária das Circunstâncias', blank=True, default='')
    status = models.CharField('Estado da Investigação', max_length=50, default='Em Investigação')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'acidentes_transito'
        verbose_name = 'Acidente de Trânsito'
        verbose_name_plural = 'Acidentes de Trânsito'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.regiao} ({self.tipo_acidente})"


class VeiculoCondutorAcidente(models.Model):
    codigo = models.CharField('N.º do Registo', max_length=50, unique=True)
    acidente_codigo = models.CharField('Código do Acidente', max_length=50)
    veiculo_placa = models.CharField('Matrícula do Veículo', max_length=32)
    veiculo_marca_modelo = models.CharField('Marca e Modelo', max_length=150, blank=True, default='')
    veiculo_categoria = models.CharField('Categoria do Veículo', max_length=80, default='Ligeiro particular')
    veiculo_seguradora = models.CharField('Seguradora', max_length=120, blank=True, default='Garantia Seguros GB')
    veiculo_apolice = models.CharField('N.º de Apólice', max_length=80, blank=True, default='')
    danos_materiais = models.CharField('Danos Materiais no Veículo', max_length=255, blank=True, default='')
    condutor_nome = models.CharField('Nome do Condutor', max_length=200)
    condutor_documento = models.CharField('BI / Passaporte do Condutor', max_length=60, blank=True, default='')
    condutor_carta = models.CharField('N.º da Carta de Condução', max_length=60, blank=True, default='')
    condutor_categoria_carta = models.CharField('Categoria da Carta', max_length=40, blank=True, default='B')
    condutor_telefone = models.CharField('Contacto Telefónico', max_length=60, blank=True, default='')
    teste_alcoolemia = models.CharField('Teste de Alcoolemia (TAS)', max_length=80, default='0.00 g/l (Negativo)')
    responsabilidade_apurada = models.CharField('Responsabilidade Apurada', max_length=80, default='Sob Peritagem')
    observacoes = models.CharField('Observações do Interveniente', max_length=255, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'veiculos_condutores_acidente'
        verbose_name = 'Veículo e Condutor Envolvido'
        verbose_name_plural = 'Veículos e Condutores Envolvidos'
        ordering = ['-id']

    def __str__(self):
        return f"{self.acidente_codigo} - {self.veiculo_placa} ({self.condutor_nome})"


class VitimaAcidente(models.Model):
    codigo = models.CharField('N.º da Vítima', max_length=50, unique=True)
    acidente_codigo = models.CharField('Código do Acidente', max_length=50)
    nome = models.CharField('Nome da Vítima', max_length=200)
    documento_identificacao = models.CharField('N.º de Identificação / BI', max_length=60, blank=True, default='')
    idade = models.IntegerField('Idade', default=30)
    sexo = models.CharField('Género / Sexo', max_length=20, default='Masculino')
    condicao_vitima = models.CharField('Condição da Vítima', max_length=60, default='Passageiro')
    veiculo_placa = models.CharField('Matrícula do Veículo Associado', max_length=32, blank=True, default='')
    gravidade_lesao = models.CharField('Gravidade da Lesão', max_length=80, default='Ferimentos Leves')
    hospital_destino = models.CharField('Unidade Hospitalar / Socorro', max_length=150, default='Hospital Nacional Simão Mendes')
    contacto_emergencia = models.CharField('Contacto de Familiar / Emergência', max_length=100, blank=True, default='')
    observacoes_medicas = models.TextField('Boletim / Observações Clínicas', blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'vitimas_acidente'
        verbose_name = 'Vítima de Acidente'
        verbose_name_plural = 'Vítimas de Acidentes'
        ordering = ['-id']

    def __str__(self):
        return f"{self.acidente_codigo} - {self.nome} ({self.gravidade_lesao})"


class TestemunhaAcidente(models.Model):
    codigo = models.CharField('N.º da Testemunha', max_length=50, unique=True)
    acidente_codigo = models.CharField('Código do Acidente', max_length=50)
    nome = models.CharField('Nome da Testemunha', max_length=200)
    documento_identificacao = models.CharField('BI / Identificação', max_length=60, blank=True, default='')
    telefone = models.CharField('Contacto Telefónico', max_length=60, blank=True, default='')
    endereco = models.CharField('Morada / Residência', max_length=200, blank=True, default='')
    posicao_momento = models.CharField('Posição no Momento do Acidente', max_length=150, default='Peão no local')
    depoimento = models.TextField('Declaração / Depoimento Testemunhal', blank=True, default='')
    data_depoimento = models.CharField('Data da Declaração', max_length=20)
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'testemunhas_acidente'
        verbose_name = 'Testemunha de Acidente'
        verbose_name_plural = 'Testemunhas de Acidentes'
        ordering = ['-id']

    def __str__(self):
        return f"{self.acidente_codigo} - {self.nome}"


class RelatorioPolicialAcidente(models.Model):
    codigo = models.CharField('N.º do Relatório', max_length=50, unique=True)
    acidente_codigo = models.CharField('Código do Acidente', max_length=50)
    numero_boletim = models.CharField('N.º do Boletim de Ocorrência (BO)', max_length=80, unique=True)
    orgao_policial = models.CharField('Órgão Fiscalizador / Polícia', max_length=150, default='Brigada Nacional de Trânsito (BNT)')
    agente_responsavel = models.CharField('Agente / Perito Autuante', max_length=200)
    agente_matricula = models.CharField('N.º de Crachá / Matrícula Policial', max_length=50)
    data_relatorio = models.CharField('Data do Relatório', max_length=20)
    conclusao_pericial = models.TextField('Conclusão Pericial e Dinâmica do Acidente')
    infracoes_constatadas = models.CharField('Infrações ao Código da Estrada Constatadas', max_length=255, blank=True, default='')
    encaminhamento = models.CharField('Encaminhamento Processual / Judicial', max_length=150, default='Remetido ao Ministério Público')
    status_processo = models.CharField('Estado do Procedimento Policial', max_length=50, default='Concluído')
    observacoes = models.CharField('Observações', max_length=255, blank=True, default='')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'relatorios_policiais_acidente'
        verbose_name = 'Relatório Policial de Acidente'
        verbose_name_plural = 'Relatórios Policiais de Acidentes'
        ordering = ['-id']

    def __str__(self):
        return f"{self.numero_boletim} - {self.acidente_codigo} ({self.orgao_policial})"


class DocumentoFotografiaAcidente(models.Model):
    codigo = models.CharField('Código do Anexo', max_length=50, unique=True)
    acidente_codigo = models.CharField('Código do Acidente', max_length=50)
    tipo_anexo = models.CharField('Tipo de Anexo / Prova', max_length=100, default='Fotografia do Local')
    titulo = models.CharField('Título / Identificação do Ficheiro', max_length=200)
    arquivo_url = models.CharField('Ficheiro / Imagem', max_length=255, blank=True, default='')
    descricao = models.CharField('Descrição / Pormenores Periciais', max_length=255, blank=True, default='')
    autor_anexo = models.CharField('Autor do Registo / Perito', max_length=150, default='Brigada de Peritagem BNT')
    data_registo = models.CharField('Data do Registo', max_length=20)
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'documentos_fotos_acidente'
        verbose_name = 'Documento / Fotografia de Acidente'
        verbose_name_plural = 'Documentos e Fotografias de Acidentes'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.acidente_codigo} ({self.titulo})"

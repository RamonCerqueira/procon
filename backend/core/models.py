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
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'condutores'
        verbose_name = 'Condutor'
        verbose_name_plural = 'Condutores'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.nome}"


class Multa(models.Model):
    codigo = models.CharField('N.º do Auto', max_length=50, unique=True)
    placa = models.CharField('Matrícula / Placa', max_length=32)
    condutor = models.CharField('Condutor / Proprietário', max_length=200, blank=True, default='')
    infracao = models.CharField('Infração', max_length=255)
    valor = models.BigIntegerField('Valor (XOF)', default=0)
    data = models.CharField('Data', max_length=20)
    status = models.CharField('Estado', max_length=30, default='Pendente')
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        db_table = 'multas'
        verbose_name = 'Multa'
        verbose_name_plural = 'Multas'
        ordering = ['-id']

    def __str__(self):
        return f"{self.codigo} - {self.placa}"


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

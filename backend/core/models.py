from django.db import models


# ==============================================================================
# Modelos SIGETRAN (Portal de Transportes / Trânsito)
# ==============================================================================

class Vehicle(models.Model):
    plate = models.CharField(max_length=32, unique=True)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField(default=2024)
    owner = models.CharField(max_length=200)
    driver = models.CharField(max_length=200, blank=True, default='')
    tax_due = models.BigIntegerField(default=0)
    district = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicles'
        ordering = ['id']

    def __str__(self):
        return f"{self.plate} - {self.make} {self.model}"


class Driver(models.Model):
    code = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=200)
    document = models.CharField(max_length=100)
    document_file = models.JSONField(null=True, blank=True)
    license = models.CharField(max_length=100)
    category = models.CharField(max_length=150)
    phone = models.CharField(max_length=50)
    district = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default='Ativo')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'drivers'
        ordering = ['-id']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Fine(models.Model):
    code = models.CharField(max_length=50, unique=True)
    plate = models.CharField(max_length=32)
    driver = models.CharField(max_length=200, blank=True, default='')
    infraction = models.CharField(max_length=255)
    amount = models.BigIntegerField(default=0)
    date = models.CharField(max_length=20)
    status = models.CharField(max_length=30, default='Pendente')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fines'
        ordering = ['-id']

    def __str__(self):
        return f"{self.code} - {self.plate}"


class InfractionType(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255, unique=True)
    amount = models.BigIntegerField(default=0)
    severity = models.CharField(max_length=50, default='Média')
    description = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'infraction_types'
        ordering = ['id']

    def __str__(self):
        return f"{self.name} ({self.amount} XOF)"


class VehicleInspection(models.Model):
    code = models.CharField(max_length=50, unique=True)
    plate = models.CharField(max_length=32)
    reason = models.CharField(max_length=200)
    office = models.CharField(max_length=100)
    date = models.CharField(max_length=20)
    status = models.CharField(max_length=50, default='Agendada')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicle_inspections'
        ordering = ['-id']

    def __str__(self):
        return f"{self.code} - {self.plate}"


class SystemUser(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255, blank=True, default='')
    role = models.CharField(max_length=100, default='Atendimento')
    office = models.CharField(max_length=100, default='Direção Nacional')
    status = models.CharField(max_length=50, default='Ativo')
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'system_users'
        ordering = ['-id']

    def __str__(self):
        return f"{self.name} ({self.email})"


class SystemConfig(models.Model):
    institution = models.CharField(max_length=255, default='Ministério dos Transportes · Guiné-Bissau')
    system = models.CharField(max_length=100, default='SIGETRAN')
    currency = models.CharField(max_length=100, default='Franco CFA (XOF)')
    office = models.CharField(max_length=100, default='Bissau')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_config'

    def __str__(self):
        return f"{self.system} - {self.institution}"


# ==============================================================================
# Modelos PROCON (Consumidores, Fornecedores, Processos, Documentos, Audiências)
# ==============================================================================

class Consumer(models.Model):
    name = models.CharField(max_length=200)
    cpf = models.CharField(max_length=30)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    address = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='João Pessoa')
    state = models.CharField(max_length=10, blank=True, default='PB')
    status = models.CharField(max_length=30, default='Ativo')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'consumers'
        ordering = ['id']

    def __str__(self):
        return f"{self.name} ({self.cpf})"


class Supplier(models.Model):
    name = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=30)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    address = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='João Pessoa')
    state = models.CharField(max_length=10, blank=True, default='PB')
    status = models.CharField(max_length=30, default='Ativo')
    category = models.CharField(max_length=100, default='Geral')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'suppliers'
        ordering = ['id']

    def __str__(self):
        return f"{self.name} ({self.cnpj})"


class Case(models.Model):
    protocol = models.CharField(max_length=30, unique=True)
    consumer = models.ForeignKey(Consumer, on_delete=models.SET_NULL, null=True, blank=True, related_name='cases')
    consumer_name = models.CharField(max_length=200)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='cases')
    supplier_name = models.CharField(max_length=200)
    status = models.CharField(max_length=50, default='Aberto')
    priority = models.CharField(max_length=30, default='Média')
    subject = models.CharField(max_length=255)
    description = models.TextField()
    assigned_to = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cases'
        ordering = ['-id']

    def __str__(self):
        return f"{self.protocol} - {self.subject}"


class CaseMessage(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='messages')
    sender_id = models.IntegerField(default=1)
    sender_name = models.CharField(max_length=200, default='Administrador')
    content = models.TextField()
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'case_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"Msg #{self.id} ({self.case.protocol})"


class Document(models.Model):
    title = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=50, default='PDF')
    size = models.CharField(max_length=50, default='1.0 MB')
    category = models.CharField(max_length=100, default='Comprovante')
    uploaded_by = models.CharField(max_length=150, default='Administrador')
    url = models.CharField(max_length=500, default='#')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'documents'
        ordering = ['-id']

    def __str__(self):
        return self.title


class ProconInspection(models.Model):
    supplier_name = models.CharField(max_length=200)
    address = models.CharField(max_length=255)
    date = models.DateTimeField()
    status = models.CharField(max_length=50, default='Agendada')
    result = models.CharField(max_length=50, default='Pendente')
    inspector = models.CharField(max_length=150, default='Fiscal João')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'procon_inspections'
        ordering = ['-id']

    def __str__(self):
        return f"{self.supplier_name} ({self.status})"


class Overindebtedness(models.Model):
    consumer_name = models.CharField(max_length=200)
    total_debt = models.CharField(max_length=50)
    creditors_count = models.IntegerField(default=1)
    status = models.CharField(max_length=50, default='Em Análise')
    request_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'overindebtedness'
        ordering = ['-id']

    def __str__(self):
        return f"{self.consumer_name} - R$ {self.total_debt}"


class Hearing(models.Model):
    case_protocol = models.CharField(max_length=50)
    date = models.DateTimeField()
    room = models.CharField(max_length=100)
    mediator = models.CharField(max_length=150)
    status = models.CharField(max_length=50, default='Agendada')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hearings'
        ordering = ['date']

    def __str__(self):
        return f"{self.case_protocol} - {self.room}"


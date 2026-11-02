from rest_framework import serializers
from .models import (
    Vehicle, Driver, Fine, InfractionType, VehicleInspection, SystemUser, SystemConfig,
    Consumer, Supplier, Case, CaseMessage, Document,
    ProconInspection, Overindebtedness, Hearing
)


class VehicleSerializer(serializers.ModelSerializer):
    taxDue = serializers.IntegerField(source='tax_due', required=False, default=0)

    class Meta:
        model = Vehicle
        fields = ['plate', 'make', 'model', 'year', 'owner', 'driver', 'taxDue', 'district', 'category']


class DriverSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='code')
    documentFile = serializers.JSONField(source='document_file', required=False, allow_null=True)

    class Meta:
        model = Driver
        fields = ['id', 'name', 'document', 'documentFile', 'license', 'category', 'phone', 'district', 'status']


class FineSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='code')

    class Meta:
        model = Fine
        fields = ['id', 'plate', 'driver', 'infraction', 'amount', 'date', 'status']


class InfractionTypeSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='code')

    class Meta:
        model = InfractionType
        fields = ['id', 'name', 'amount', 'severity', 'description']


class VehicleInspectionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='code')

    class Meta:
        model = VehicleInspection
        fields = ['id', 'plate', 'reason', 'office', 'date', 'status']


class SystemUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemUser
        fields = ['name', 'email', 'role', 'office', 'status']


class SystemConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfig
        fields = ['institution', 'system', 'currency', 'office']


class ConsumerSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Consumer
        fields = ['id', 'name', 'cpf', 'email', 'phone', 'address', 'city', 'state', 'status', 'createdAt']


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'cnpj', 'email', 'phone', 'address', 'city', 'state', 'status', 'category']


class CaseSerializer(serializers.ModelSerializer):
    consumerId = serializers.IntegerField(source='consumer_id', required=False, allow_null=True)
    consumerName = serializers.CharField(source='consumer_name', required=False, allow_blank=True)
    supplierId = serializers.IntegerField(source='supplier_id', required=False, allow_null=True)
    supplierName = serializers.CharField(source='supplier_name', required=False, allow_blank=True)
    date = serializers.DateTimeField(source='created_at', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    assignedTo = serializers.IntegerField(source='assigned_to', required=False, allow_null=True)

    class Meta:
        model = Case
        fields = [
            'id', 'protocol', 'consumerId', 'consumerName', 'supplierId', 'supplierName',
            'status', 'priority', 'subject', 'description', 'date', 'createdAt', 'updatedAt', 'assignedTo'
        ]
        read_only_fields = ['protocol', 'date', 'createdAt', 'updatedAt']


class CaseMessageSerializer(serializers.ModelSerializer):
    caseId = serializers.IntegerField(source='case_id', read_only=True)
    senderId = serializers.IntegerField(source='sender_id', required=False, default=1)
    senderName = serializers.CharField(source='sender_name', required=False, default='Administrador')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    isInternal = serializers.BooleanField(source='is_internal', required=False, default=False)

    class Meta:
        model = CaseMessage
        fields = ['id', 'caseId', 'senderId', 'senderName', 'content', 'createdAt', 'isInternal']


class DocumentSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='doc_type', required=False, default='PDF')
    uploadedBy = serializers.CharField(source='uploaded_by', required=False, default='Administrador')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'title', 'type', 'size', 'category', 'uploadedBy', 'createdAt', 'url']


class ProconInspectionSerializer(serializers.ModelSerializer):
    supplierName = serializers.CharField(source='supplier_name')

    class Meta:
        model = ProconInspection
        fields = ['id', 'supplierName', 'address', 'date', 'status', 'result', 'inspector']


class OverindebtednessSerializer(serializers.ModelSerializer):
    consumerName = serializers.CharField(source='consumer_name')
    totalDebt = serializers.CharField(source='total_debt')
    creditorsCount = serializers.IntegerField(source='creditors_count')
    requestDate = serializers.DateTimeField(source='request_date')

    class Meta:
        model = Overindebtedness
        fields = ['id', 'consumerName', 'totalDebt', 'creditorsCount', 'status', 'requestDate']


class HearingSerializer(serializers.ModelSerializer):
    caseProtocol = serializers.CharField(source='case_protocol')

    class Meta:
        model = Hearing
        fields = ['id', 'caseProtocol', 'date', 'room', 'mediator', 'status']


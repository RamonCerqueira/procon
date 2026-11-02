from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .controllers import AuthController, VehicleController, DriverController, FineController, InfractionController
from .models import (
    Vehicle, Driver, Fine, InfractionType, VehicleInspection, SystemUser, SystemConfig,
    Consumer, Supplier, Case, CaseMessage, Document,
    ProconInspection, Overindebtedness, Hearing
)
from .serializers import (
    VehicleSerializer, DriverSerializer, FineSerializer, InfractionTypeSerializer,
    VehicleInspectionSerializer, SystemUserSerializer, SystemConfigSerializer,
    ConsumerSerializer, SupplierSerializer, CaseSerializer,
    CaseMessageSerializer, DocumentSerializer, ProconInspectionSerializer,
    OverindebtednessSerializer, HearingSerializer
)
from .seed import ensure_seed_data


# ==============================================================================
# Views de Autenticação (Camada View na Arquitetura MVC -> chama AuthController)
# ==============================================================================

@api_view(['POST'])
def auth_login(request):
    """
    Endpoint POST /api/auth/login
    Recebe email e password do frontend (Login.tsx), aciona o AuthController
    e devolve a resposta HTTP formatada com o token JWT e os dados do utilizador.
    """
    result = AuthController.login(
        email=request.data.get('email', ''),
        password=request.data.get('password', ''),
        user_type=request.data.get('type', 'server'),
    )
    return Response(result['data'], status=result['status_code'])


@api_view(['POST'])
def auth_register(request):
    """
    Endpoint POST /api/auth/register
    Regista um novo utilizador no banco PostgreSQL 'procon' via AuthController.
    """
    result = AuthController.register(
        name=request.data.get('name', ''),
        email=request.data.get('email', ''),
        password=request.data.get('password', ''),
        role=request.data.get('role', 'Atendimento'),
        office=request.data.get('office', 'Bissau'),
    )
    return Response(result['data'], status=result['status_code'])


@api_view(['GET'])
def auth_me(request):
    """
    Endpoint GET /api/auth/me
    Devolve os dados do utilizador autenticado pelo token Bearer JWT.
    """
    result = AuthController.get_profile(request.user)
    return Response(result['data'], status=result['status_code'])


# ==============================================================================
# Sincronização de Estado SIGETRAN (/api/state/<key>) + Endpoints dedicados
# ==============================================================================

@api_view(['GET', 'PUT'])
def sigetran_state(request, key):
    ensure_seed_data()

    if key == 'vehicles':
        if request.method == 'GET':
            items = Vehicle.objects.all()
            return Response(VehicleSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                plates = []
                for item in data:
                    plate = str(item.get('plate', '')).upper().strip()
                    if not plate:
                        continue
                    plates.append(plate)
                    Vehicle.objects.update_or_create(
                        plate=plate,
                        defaults={
                            'make': item.get('make', ''),
                            'model': item.get('model', ''),
                            'year': int(item.get('year') or 2024),
                            'owner': item.get('owner', ''),
                            'driver': item.get('driver', '') or '',
                            'tax_due': int(item.get('taxDue') or 0),
                            'district': item.get('district', ''),
                            'category': item.get('category', ''),
                        }
                    )
                Vehicle.objects.exclude(plate__in=plates).delete()
            return Response(VehicleSerializer(Vehicle.objects.all(), many=True).data)

    elif key == 'drivers':
        if request.method == 'GET':
            items = Driver.objects.all()
            return Response(DriverSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                codes = []
                for item in data:
                    code = str(item.get('id', '')).strip()
                    if not code:
                        continue
                    codes.append(code)
                    Driver.objects.update_or_create(
                        code=code,
                        defaults={
                            'name': item.get('name', ''),
                            'document': item.get('document', ''),
                            'document_file': item.get('documentFile'),
                            'license': item.get('license', ''),
                            'category': item.get('category', ''),
                            'phone': item.get('phone', ''),
                            'district': item.get('district', ''),
                            'status': item.get('status', 'Ativo'),
                        }
                    )
                Driver.objects.exclude(code__in=codes).delete()
            return Response(DriverSerializer(Driver.objects.all(), many=True).data)

    elif key == 'fines':
        if request.method == 'GET':
            items = Fine.objects.all()
            return Response(FineSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                codes = []
                for item in data:
                    code = str(item.get('id', '')).strip()
                    if not code:
                        continue
                    codes.append(code)
                    Fine.objects.update_or_create(
                        code=code,
                        defaults={
                            'plate': item.get('plate', ''),
                            'driver': item.get('driver', '') or '',
                            'infraction': item.get('infraction', ''),
                            'amount': int(item.get('amount') or 0),
                            'date': item.get('date', ''),
                            'status': item.get('status', 'Pendente'),
                        }
                    )
                Fine.objects.exclude(code__in=codes).delete()
            return Response(FineSerializer(Fine.objects.all(), many=True).data)

    elif key == 'infraction-types':
        if request.method == 'GET':
            items = InfractionType.objects.all()
            return Response(InfractionTypeSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                codes = []
                for item in data:
                    code = str(item.get('id', '')).strip()
                    if not code:
                        continue
                    codes.append(code)
                    InfractionType.objects.update_or_create(
                        code=code,
                        defaults={
                            'name': item.get('name', ''),
                            'amount': int(item.get('amount') or 0),
                            'severity': item.get('severity', 'Média'),
                            'description': item.get('description', '') or '',
                        }
                    )
                InfractionType.objects.exclude(code__in=codes).delete()
            return Response(InfractionTypeSerializer(InfractionType.objects.all(), many=True).data)

    elif key == 'inspections':
        if request.method == 'GET':
            items = VehicleInspection.objects.all()
            return Response(VehicleInspectionSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                codes = []
                for item in data:
                    code = str(item.get('id', '')).strip()
                    if not code:
                        continue
                    codes.append(code)
                    VehicleInspection.objects.update_or_create(
                        code=code,
                        defaults={
                            'plate': item.get('plate', ''),
                            'reason': item.get('reason', ''),
                            'office': item.get('office', ''),
                            'date': item.get('date', ''),
                            'status': item.get('status', 'Agendada'),
                        }
                    )
                VehicleInspection.objects.exclude(code__in=codes).delete()
            return Response(VehicleInspectionSerializer(VehicleInspection.objects.all(), many=True).data)

    elif key == 'users':
        if request.method == 'GET':
            items = SystemUser.objects.all()
            return Response(SystemUserSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                emails = []
                for item in data:
                    email = str(item.get('email', '')).strip()
                    if not email:
                        continue
                    emails.append(email)
                    SystemUser.objects.update_or_create(
                        email=email,
                        defaults={
                            'name': item.get('name', ''),
                            'role': item.get('role', 'Atendimento'),
                            'office': item.get('office', 'Bissau'),
                            'status': item.get('status', 'Ativo'),
                        }
                    )
                SystemUser.objects.exclude(email__in=emails).delete()
            return Response(SystemUserSerializer(SystemUser.objects.all(), many=True).data)

    elif key == 'config':
        cfg = SystemConfig.objects.first()
        if request.method == 'GET':
            return Response(SystemConfigSerializer(cfg).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, dict) else {}
            cfg.institution = data.get('institution', cfg.institution)
            cfg.system = data.get('system', cfg.system)
            cfg.currency = data.get('currency', cfg.currency)
            cfg.office = data.get('office', cfg.office)
            cfg.save()
            return Response(SystemConfigSerializer(cfg).data)

    return Response({'error': f'Chave desconhecida: {key}'}, status=status.HTTP_404_NOT_FOUND)


# ==============================================================================
# Endpoints REST dedicados SIGETRAN
# ==============================================================================

@api_view(['GET', 'POST'])
def vehicles_list(request):
    """
    Endpoint GET/POST /api/vehicles (Camada View na Arquitetura MVC -> chama VehicleController)
    - GET: Lista todos os veículos do banco PostgreSQL 'procon'
    - POST: Cadastra um novo veículo no banco PostgreSQL 'procon'
    """
    if request.method == 'GET':
        result = VehicleController.list_vehicles(search=request.GET.get('search', ''))
        return Response(result['data'], status=result['status_code'])

    result = VehicleController.create_vehicle(request.data)
    return Response(result['data'], status=result['status_code'])


@api_view(['GET', 'PUT', 'DELETE'])
def vehicle_detail(request, plate):
    """
    Endpoint GET/PUT/DELETE /api/vehicles/<plate> (Camada View -> chama VehicleController)
    """
    if request.method == 'GET':
        result = VehicleController.get_vehicle(plate)
        return Response(result['data'], status=result['status_code'])
    elif request.method == 'PUT':
        result = VehicleController.update_vehicle(plate, request.data)
        return Response(result['data'], status=result['status_code'])
    elif request.method == 'DELETE':
        result = VehicleController.delete_vehicle(plate)
        return Response(status=result['status_code'])


@api_view(['GET', 'POST'])
def drivers_list(request):
    """
    Endpoint GET/POST /api/drivers (Camada View na Arquitetura MVC -> chama DriverController)
    """
    if request.method == 'GET':
        result = DriverController.list_drivers(search=request.GET.get('search', ''))
        return Response(result['data'], status=result['status_code'])

    result = DriverController.create_driver(request.data)
    return Response(result['data'], status=result['status_code'])


@api_view(['GET', 'PUT', 'DELETE'])
def driver_detail(request, code):
    """
    Endpoint GET/PUT/DELETE /api/drivers/<code> (Camada View -> chama DriverController)
    """
    if request.method == 'GET':
        result = DriverController.get_driver(code)
        return Response(result['data'], status=result['status_code'])
    elif request.method == 'PUT':
        result = DriverController.update_driver(code, request.data)
        return Response(result['data'], status=result['status_code'])
    elif request.method == 'DELETE':
        result = DriverController.delete_driver(code)
        return Response(status=result['status_code'])


@api_view(['GET', 'POST'])
def fines_list(request):
    """
    Endpoint GET/POST /api/fines (Camada View na Arquitetura MVC -> chama FineController)
    """
    if request.method == 'GET':
        result = FineController.list_fines()
        return Response(result['data'], status=result['status_code'])
    result = FineController.create_fine(request.data)
    return Response(result['data'], status=result['status_code'])


@api_view(['PUT', 'PATCH'])
def fine_detail(request, code):
    """
    Endpoint PUT/PATCH /api/fines/<code> (Camada View -> chama FineController)
    """
    result = FineController.update_fine(code, request.data)
    return Response(result['data'], status=result['status_code'])


@api_view(['GET', 'POST'])
def infraction_types_list(request):
    """
    Endpoint GET/POST /api/infraction-types (Camada View -> chama InfractionController)
    """
    if request.method == 'GET':
        result = InfractionController.list_infractions()
        return Response(result['data'], status=result['status_code'])
    result = InfractionController.create_infraction(request.data)
    return Response(result['data'], status=result['status_code'])


@api_view(['PUT', 'DELETE'])
def infraction_type_detail(request, code):
    """
    Endpoint PUT/DELETE /api/infraction-types/<code> (Camada View -> chama InfractionController)
    """
    if request.method == 'PUT':
        result = InfractionController.update_infraction(code, request.data)
        return Response(result['data'], status=result['status_code'])
    result = InfractionController.delete_infraction(code)
    return Response(status=result['status_code'])


# ==============================================================================
# Endpoints PROCON (/dashboard/stats, /consumers, /suppliers, /cases, etc.)
# ==============================================================================

@api_view(['GET'])
def dashboard_stats(request):
    ensure_seed_data()
    return Response({
        'totalCases': Case.objects.count(),
        'openCases': Case.objects.filter(status__in=['Aberto', 'open']).count(),
        'consumers': Consumer.objects.count(),
        'suppliers': Supplier.objects.count(),
        'documents': Document.objects.count(),
        'vehicles': Vehicle.objects.count(),
        'drivers': Driver.objects.count(),
        'pendingFines': Fine.objects.filter(status='Pendente').count(),
    })


@api_view(['GET', 'POST'])
def consumers_list(request):
    ensure_seed_data()
    if request.method == 'GET':
        qs = Consumer.objects.all()
        name = request.GET.get('name')
        cpf = request.GET.get('cpf')
        if name:
            qs = qs.filter(name__icontains=name)
        if cpf:
            qs = qs.filter(cpf__icontains=cpf)
        return Response({
            'data': ConsumerSerializer(qs, many=True).data,
            'total': qs.count(),
        })
    serializer = ConsumerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def consumer_detail(request, pk):
    ensure_seed_data()
    obj = Consumer.objects.filter(pk=pk).first()
    if not obj:
        return Response({'error': 'Consumidor não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(ConsumerSerializer(obj).data)
    elif request.method == 'PUT':
        serializer = ConsumerSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def suppliers_list(request):
    ensure_seed_data()
    if request.method == 'GET':
        qs = Supplier.objects.all()
        name = request.GET.get('name')
        cnpj = request.GET.get('cnpj')
        if name:
            qs = qs.filter(name__icontains=name)
        if cnpj:
            qs = qs.filter(cnpj__icontains=cnpj)
        return Response({
            'data': SupplierSerializer(qs, many=True).data,
            'total': qs.count(),
        })
    serializer = SupplierSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def supplier_detail(request, pk):
    ensure_seed_data()
    obj = Supplier.objects.filter(pk=pk).first()
    if not obj:
        return Response({'error': 'Fornecedor não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(SupplierSerializer(obj).data)
    elif request.method == 'PUT':
        serializer = SupplierSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def cases_list(request):
    ensure_seed_data()
    if request.method == 'GET':
        qs = Case.objects.all()
        protocol = request.GET.get('protocol')
        status_param = request.GET.get('status')
        if protocol:
            qs = qs.filter(protocol__icontains=protocol)
        if status_param:
            qs = qs.filter(status__iexact=status_param)
        return Response({
            'data': CaseSerializer(qs, many=True).data,
            'total': qs.count(),
        })

    data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
    consumer_id = data.get('consumerId')
    supplier_id = data.get('supplierId')
    consumer = Consumer.objects.filter(pk=consumer_id).first() if consumer_id else Consumer.objects.first()
    supplier = Supplier.objects.filter(pk=supplier_id).first() if supplier_id else Supplier.objects.first()

    next_num = Case.objects.count() + 1
    protocol = f"2026{str(next_num).zfill(6)}"
    while Case.objects.filter(protocol=protocol).exists():
        next_num += 1
        protocol = f"2026{str(next_num).zfill(6)}"

    case_obj = Case.objects.create(
        protocol=protocol,
        consumer=consumer,
        consumer_name=data.get('consumerName') or (consumer.name if consumer else 'Consumidor'),
        supplier=supplier,
        supplier_name=data.get('supplierName') or (supplier.name if supplier else 'Fornecedor'),
        status=data.get('status', 'Aberto'),
        priority=data.get('priority', 'Média'),
        subject=data.get('subject', 'Nova Reclamação'),
        description=data.get('description', ''),
        assigned_to=data.get('assignedTo'),
    )
    return Response(CaseSerializer(case_obj).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT'])
def case_detail(request, pk):
    ensure_seed_data()
    obj = Case.objects.filter(pk=pk).first()
    if not obj:
        return Response({'error': 'Processo não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(CaseSerializer(obj).data)
    serializer = CaseSerializer(obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def case_messages(request, pk):
    ensure_seed_data()
    obj = Case.objects.filter(pk=pk).first()
    if not obj:
        return Response({'error': 'Processo não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        msgs = obj.messages.all()
        return Response(CaseMessageSerializer(msgs, many=True).data)
    msg = CaseMessage.objects.create(
        case=obj,
        sender_id=request.data.get('senderId', 1),
        sender_name=request.data.get('senderName', 'Administrador'),
        content=request.data.get('content', ''),
        is_internal=bool(request.data.get('isInternal', False)),
    )
    return Response(CaseMessageSerializer(msg).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
def documents_list(request):
    ensure_seed_data()
    if request.method == 'GET':
        qs = Document.objects.all()
        title = request.GET.get('title')
        category = request.GET.get('category')
        if title:
            qs = qs.filter(title__icontains=title)
        if category:
            qs = qs.filter(category__iexact=category)
        return Response({
            'data': DocumentSerializer(qs, many=True).data,
            'total': qs.count(),
        })
    uploaded_file = request.FILES.get('file')
    title = request.data.get('title') or (uploaded_file.name if uploaded_file else 'Novo_Documento.pdf')
    doc = Document.objects.create(
        title=title,
        doc_type=request.data.get('type', 'PDF'),
        size=f"{(uploaded_file.size / (1024 * 1024)):.1f} MB" if uploaded_file else '1.0 MB',
        category=request.data.get('category', 'Comprovante'),
        uploaded_by='Administrador',
        url='#'
    )
    return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def document_detail(request, pk):
    doc = Document.objects.filter(pk=pk).first()
    if not doc:
        return Response(status=status.HTTP_404_NOT_FOUND)
    doc.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def procon_inspections_list(request):
    ensure_seed_data()
    qs = ProconInspection.objects.all()
    return Response({
        'data': ProconInspectionSerializer(qs, many=True).data,
        'total': qs.count(),
    })


@api_view(['GET'])
def overindebtedness_list(request):
    ensure_seed_data()
    qs = Overindebtedness.objects.all()
    return Response({
        'data': OverindebtednessSerializer(qs, many=True).data,
        'total': qs.count(),
    })


@api_view(['GET'])
def hearings_list(request):
    ensure_seed_data()
    qs = Hearing.objects.all()
    return Response({
        'data': HearingSerializer(qs, many=True).data,
        'total': qs.count(),
    })


from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .controllers import AuthController, VehicleController, DriverController, FineController, InfractionController, OwnershipController, VehicleStatusController
from .models import (
    Veiculo, OcorrenciaVeicular, HistoricoProprietario, Condutor, Multa, TipoInfracao, InspecaoVeicular, UsuarioSistema, ConfiguracaoSistema,
    Consumidor, Fornecedor, Processo, MensagemProcesso, Documento,
    Fiscalizacao, Superendividamento, Audiencia
)
from .serializers import (
    VeiculoSerializer, OcorrenciaVeicularSerializer, HistoricoProprietarioSerializer, CondutorSerializer, MultaSerializer, TipoInfracaoSerializer,
    InspecaoVeicularSerializer, UsuarioSistemaSerializer, ConfiguracaoSistemaSerializer,
    ConsumidorSerializer, FornecedorSerializer, ProcessoSerializer,
    MensagemProcessoSerializer, DocumentoSerializer, FiscalizacaoSerializer,
    SuperendividamentoSerializer, AudienciaSerializer
)
from .seed import ensure_seed_data


# ==============================================================================
# Views de Autenticação (Camada View na Arquitetura MVC -> chama AuthController)
# ==============================================================================

@api_view(['POST'])
def auth_login(request):
    result = AuthController.login(
        email=request.data.get('email', ''),
        password=request.data.get('password', ''),
        user_type=request.data.get('type', 'server'),
    )
    return Response(result['data'], status=result['status_code'])


@api_view(['POST'])
def auth_register(request):
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
    result = AuthController.get_profile(request.user)
    return Response(result['data'], status=result['status_code'])


# ==============================================================================
# Sincronização de Estado SIGETRAN (/api/state/<key>)
# ==============================================================================

@api_view(['GET', 'PUT'])
def sigetran_state(request, key):
    ensure_seed_data()

    if key == 'vehicles':
        if request.method == 'GET':
            items = Veiculo.objects.all()
            return Response(VeiculoSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                placas = []
                for item in data:
                    placa = str(item.get('plate', '')).upper().strip()
                    if not placa:
                        continue
                    placas.append(placa)
                    Veiculo.objects.update_or_create(
                        placa=placa,
                        defaults={
                            'marca': item.get('make', ''),
                            'modelo': item.get('model', ''),
                            'ano': int(item.get('year') or 2024),
                            'cor': item.get('color', 'Branco') or 'Branco',
                            'proprietario': item.get('owner', ''),
                            'condutor': item.get('driver', '') or '',
                            'imposto_devido': int(item.get('taxDue') or 0),
                            'distrito': item.get('district', ''),
                            'categoria': item.get('category', ''),
                            'situacao_legal': item.get('legalStatus', 'Regular') or 'Regular',
                        }
                    )
                Veiculo.objects.exclude(placa__in=placas).delete()
            return Response(VeiculoSerializer(Veiculo.objects.all(), many=True).data)

    elif key == 'vehicle-occurrences':
        if request.method == 'GET':
            items = OcorrenciaVeicular.objects.all()
            return Response(OcorrenciaVeicularSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                codigos = []
                for item in data:
                    codigo = str(item.get('id', '')).strip()
                    if not codigo:
                        continue
                    codigos.append(codigo)
                    OcorrenciaVeicular.objects.update_or_create(
                        codigo=codigo,
                        defaults={
                            'placa': item.get('plate', ''),
                            'veiculo_descricao': item.get('vehicleLabel', '') or '',
                            'proprietario': item.get('owner', '') or '',
                            'categoria_registo': item.get('recordCategory', 'Ocorrência Policial / Fiscalização') or 'Ocorrência Policial / Fiscalização',
                            'tipo_evento': item.get('eventType', ''),
                            'situacao_resultante': item.get('resultingStatus', 'Apreendido'),
                            'motivo': item.get('reason', ''),
                            'autoridade_orgao': item.get('authority', '') or '',
                            'numero_processo': item.get('processNumber', '') or '',
                            'local_deposito': item.get('location', '') or '',
                            'data_evento': item.get('date', ''),
                            'observacoes': item.get('notes', '') or '',
                        }
                    )
                OcorrenciaVeicular.objects.exclude(codigo__in=codigos).delete()
            return Response(OcorrenciaVeicularSerializer(OcorrenciaVeicular.objects.all(), many=True).data)

    elif key == 'ownership-transfers':
        if request.method == 'GET':
            items = HistoricoProprietario.objects.all()
            return Response(HistoricoProprietarioSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                codigos = []
                for item in data:
                    codigo = str(item.get('id', '')).strip()
                    if not codigo:
                        continue
                    codigos.append(codigo)
                    HistoricoProprietario.objects.update_or_create(
                        codigo=codigo,
                        defaults={
                            'placa': item.get('plate', ''),
                            'veiculo_descricao': item.get('vehicleLabel', '') or '',
                            'proprietario_anterior': item.get('previousOwner', ''),
                            'documento_anterior': item.get('previousDocument', '') or '',
                            'novo_proprietario': item.get('newOwner', ''),
                            'documento_novo': item.get('newDocument', '') or '',
                            'novo_condutor': item.get('newDriver', '') or '',
                            'distrito': item.get('district', '') or '',
                            'data_transferencia': item.get('transferDate', ''),
                            'motivo': item.get('reason', 'Compra e venda'),
                            'observacoes': item.get('notes', '') or '',
                        }
                    )
                HistoricoProprietario.objects.exclude(codigo__in=codigos).delete()
            return Response(HistoricoProprietarioSerializer(HistoricoProprietario.objects.all(), many=True).data)

    elif key == 'drivers':
        if request.method == 'GET':
            items = Condutor.objects.all()
            return Response(CondutorSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                codigos = []
                for item in data:
                    codigo = str(item.get('id', '')).strip()
                    if not codigo:
                        continue
                    codigos.append(codigo)
                    Condutor.objects.update_or_create(
                        codigo=codigo,
                        defaults={
                            'nome': item.get('name', ''),
                            'documento': item.get('document', ''),
                            'arquivo_documento': item.get('documentFile'),
                            'carta': item.get('license', ''),
                            'categoria': item.get('category', ''),
                            'telefone': item.get('phone', ''),
                            'distrito': item.get('district', ''),
                            'status': item.get('status', 'Ativo'),
                        }
                    )
                Condutor.objects.exclude(codigo__in=codigos).delete()
            return Response(CondutorSerializer(Condutor.objects.all(), many=True).data)

    elif key == 'fines':
        if request.method == 'GET':
            items = Multa.objects.all()
            return Response(MultaSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                codigos = []
                for item in data:
                    codigo = str(item.get('id', '')).strip()
                    if not codigo:
                        continue
                    codigos.append(codigo)
                    Multa.objects.update_or_create(
                        codigo=codigo,
                        defaults={
                            'placa': item.get('plate', ''),
                            'condutor': item.get('driver', '') or '',
                            'infracao': item.get('infraction', ''),
                            'valor': int(item.get('amount') or 0),
                            'data': item.get('date', ''),
                            'status': item.get('status', 'Pendente'),
                        }
                    )
                Multa.objects.exclude(codigo__in=codigos).delete()
            return Response(MultaSerializer(Multa.objects.all(), many=True).data)

    elif key == 'infraction-types':
        if request.method == 'GET':
            items = TipoInfracao.objects.all()
            return Response(TipoInfracaoSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                codigos = []
                for item in data:
                    codigo = str(item.get('id', '')).strip()
                    if not codigo:
                        continue
                    codigos.append(codigo)
                    TipoInfracao.objects.update_or_create(
                        codigo=codigo,
                        defaults={
                            'nome': item.get('name', ''),
                            'valor': int(item.get('amount') or 0),
                            'gravidade': item.get('severity', 'Média'),
                            'descricao': item.get('description', '') or '',
                        }
                    )
                TipoInfracao.objects.exclude(codigo__in=codigos).delete()
            return Response(TipoInfracaoSerializer(TipoInfracao.objects.all(), many=True).data)

    elif key == 'inspections':
        if request.method == 'GET':
            items = InspecaoVeicular.objects.all()
            return Response(InspecaoVeicularSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                codigos = []
                for item in data:
                    codigo = str(item.get('id', '')).strip()
                    if not codigo:
                        continue
                    codigos.append(codigo)
                    InspecaoVeicular.objects.update_or_create(
                        codigo=codigo,
                        defaults={
                            'placa': item.get('plate', ''),
                            'motivo': item.get('reason', ''),
                            'delegacao': item.get('office', ''),
                            'data': item.get('date', ''),
                            'status': item.get('status', 'Agendada'),
                        }
                    )
                InspecaoVeicular.objects.exclude(codigo__in=codigos).delete()
            return Response(InspecaoVeicularSerializer(InspecaoVeicular.objects.all(), many=True).data)

    elif key == 'users':
        if request.method == 'GET':
            items = UsuarioSistema.objects.all()
            return Response(UsuarioSistemaSerializer(items, many=True).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, list) else []
            with transaction.atomic():
                emails = []
                for item in data:
                    email = str(item.get('email', '')).strip()
                    if not email:
                        continue
                    emails.append(email)
                    UsuarioSistema.objects.update_or_create(
                        email=email,
                        defaults={
                            'nome': item.get('name', ''),
                            'perfil': item.get('role', 'Atendimento'),
                            'delegacao': item.get('office', 'Bissau'),
                            'status': item.get('status', 'Ativo'),
                        }
                    )
                UsuarioSistema.objects.exclude(email__in=emails).delete()
            return Response(UsuarioSistemaSerializer(UsuarioSistema.objects.all(), many=True).data)

    elif key == 'config':
        cfg = ConfiguracaoSistema.objects.first()
        if request.method == 'GET':
            return Response(ConfiguracaoSistemaSerializer(cfg).data)
        elif request.method == 'PUT':
            data = request.data if isinstance(request.data, dict) else {}
            cfg.instituicao = data.get('institution', cfg.instituicao)
            cfg.sistema = data.get('system', cfg.sistema)
            cfg.moeda = data.get('currency', cfg.moeda)
            cfg.delegacao = data.get('office', cfg.delegacao)
            cfg.save()
            return Response(ConfiguracaoSistemaSerializer(cfg).data)

    return Response({'error': f'Chave desconhecida: {key}'}, status=status.HTTP_404_NOT_FOUND)


# ==============================================================================
# Endpoints REST dedicados SIGETRAN (MVC: View -> Controller)
# ==============================================================================

@api_view(['GET', 'POST'])
def vehicles_list(request):
    if request.method == 'GET':
        result = VehicleController.list_vehicles(search=request.GET.get('search', ''))
        return Response(result['data'], status=result['status_code'])
    result = VehicleController.create_vehicle(request.data)
    return Response(result['data'], status=result['status_code'])


@api_view(['GET', 'PUT', 'DELETE'])
def vehicle_detail(request, plate):
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
    if request.method == 'GET':
        result = DriverController.list_drivers(search=request.GET.get('search', ''))
        return Response(result['data'], status=result['status_code'])
    result = DriverController.create_driver(request.data)
    return Response(result['data'], status=result['status_code'])


@api_view(['GET', 'PUT', 'DELETE'])
def driver_detail(request, code):
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
    if request.method == 'GET':
        result = FineController.list_fines()
        return Response(result['data'], status=result['status_code'])
    result = FineController.create_fine(request.data)
    return Response(result['data'], status=result['status_code'])


@api_view(['PUT', 'PATCH'])
def fine_detail(request, code):
    result = FineController.update_fine(code, request.data)
    return Response(result['data'], status=result['status_code'])


@api_view(['GET', 'POST'])
def infraction_types_list(request):
    if request.method == 'GET':
        result = InfractionController.list_infractions()
        return Response(result['data'], status=result['status_code'])
    result = InfractionController.create_infraction(request.data)
    return Response(result['data'], status=result['status_code'])


@api_view(['PUT', 'DELETE'])
def infraction_type_detail(request, code):
    if request.method == 'PUT':
        result = InfractionController.update_infraction(code, request.data)
        return Response(result['data'], status=result['status_code'])
    result = InfractionController.delete_infraction(code)
    return Response(status=result['status_code'])


@api_view(['GET', 'POST'])
def ownership_transfers_list(request):
    """
    Endpoint GET/POST /api/ownership-transfers (Camada View -> chama OwnershipController)
    - GET: Lista o histórico de proprietários (com filtro opcional por matrícula ou busca)
    - POST: Realiza a transferência de propriedade do veículo e regista no histórico
    """
    if request.method == 'GET':
        result = OwnershipController.list_history(
            plate=request.GET.get('plate', ''),
            search=request.GET.get('search', '')
        )
        return Response(result['data'], status=result['status_code'])
    result = OwnershipController.transfer_ownership(request.data)
    return Response(result['data'], status=result['status_code'])


@api_view(['GET', 'POST'])
def vehicle_occurrences_list(request):
    """
    Endpoint GET/POST /api/vehicle-occurrences (Camada View -> chama VehicleStatusController)
    - GET: Lista ocorrências (apreensões, roubos, recuperações) e baixas definitivas / cancelamentos
    - POST: Regista ocorrência ou baixa definitiva e atualiza a situação legal do veículo
    """
    if request.method == 'GET':
        result = VehicleStatusController.list_occurrences(
            plate=request.GET.get('plate', ''),
            search=request.GET.get('search', ''),
            category=request.GET.get('category', '')
        )
        return Response(result['data'], status=result['status_code'])
    result = VehicleStatusController.register_occurrence(request.data)
    return Response(result['data'], status=result['status_code'])


@api_view(['DELETE'])
def vehicle_occurrence_detail(request, code):
    result = VehicleStatusController.delete_occurrence(code)
    return Response(status=result['status_code'])


# ==============================================================================
# Endpoints PROCON (/dashboard/stats, /consumers, /suppliers, /cases, etc.)
# ==============================================================================

@api_view(['GET'])
def dashboard_stats(request):
    ensure_seed_data()
    return Response({
        'totalCases': Processo.objects.count(),
        'openCases': Processo.objects.filter(status__in=['Aberto', 'open']).count(),
        'consumers': Consumidor.objects.count(),
        'suppliers': Fornecedor.objects.count(),
        'documents': Documento.objects.count(),
        'vehicles': Veiculo.objects.count(),
        'drivers': Condutor.objects.count(),
        'pendingFines': Multa.objects.filter(status='Pendente').count(),
    })


@api_view(['GET', 'POST'])
def consumers_list(request):
    ensure_seed_data()
    if request.method == 'GET':
        qs = Consumidor.objects.all()
        name = request.GET.get('name')
        cpf = request.GET.get('cpf')
        if name:
            qs = qs.filter(nome__icontains=name)
        if cpf:
            qs = qs.filter(cpf__icontains=cpf)
        return Response({
            'data': ConsumidorSerializer(qs, many=True).data,
            'total': qs.count(),
        })
    serializer = ConsumidorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def consumer_detail(request, pk):
    ensure_seed_data()
    obj = Consumidor.objects.filter(pk=pk).first()
    if not obj:
        return Response({'error': 'Consumidor não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(ConsumidorSerializer(obj).data)
    elif request.method == 'PUT':
        serializer = ConsumidorSerializer(obj, data=request.data, partial=True)
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
        qs = Fornecedor.objects.all()
        name = request.GET.get('name')
        cnpj = request.GET.get('cnpj')
        if name:
            qs = qs.filter(nome__icontains=name)
        if cnpj:
            qs = qs.filter(cnpj__icontains=cnpj)
        return Response({
            'data': FornecedorSerializer(qs, many=True).data,
            'total': qs.count(),
        })
    serializer = FornecedorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def supplier_detail(request, pk):
    ensure_seed_data()
    obj = Fornecedor.objects.filter(pk=pk).first()
    if not obj:
        return Response({'error': 'Fornecedor não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(FornecedorSerializer(obj).data)
    elif request.method == 'PUT':
        serializer = FornecedorSerializer(obj, data=request.data, partial=True)
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
        qs = Processo.objects.all()
        protocol = request.GET.get('protocol')
        status_param = request.GET.get('status')
        if protocol:
            qs = qs.filter(protocolo__icontains=protocol)
        if status_param:
            qs = qs.filter(status__iexact=status_param)
        return Response({
            'data': ProcessoSerializer(qs, many=True).data,
            'total': qs.count(),
        })

    data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
    consumer_id = data.get('consumerId')
    supplier_id = data.get('supplierId')
    consumidor = Consumidor.objects.filter(pk=consumer_id).first() if consumer_id else Consumidor.objects.first()
    fornecedor = Fornecedor.objects.filter(pk=supplier_id).first() if supplier_id else Fornecedor.objects.first()

    next_num = Processo.objects.count() + 1
    protocolo = f"2026{str(next_num).zfill(6)}"
    while Processo.objects.filter(protocolo=protocolo).exists():
        next_num += 1
        protocolo = f"2026{str(next_num).zfill(6)}"

    proc_obj = Processo.objects.create(
        protocolo=protocolo,
        consumidor=consumidor,
        nome_consumidor=data.get('consumerName') or (consumidor.nome if consumidor else 'Consumidor'),
        fornecedor=fornecedor,
        nome_fornecedor=data.get('supplierName') or (fornecedor.nome if fornecedor else 'Fornecedor'),
        status=data.get('status', 'Aberto'),
        prioridade=data.get('priority', 'Média'),
        assunto=data.get('subject', 'Nova Reclamação'),
        descricao=data.get('description', ''),
        responsavel_id=data.get('assignedTo'),
    )
    return Response(ProcessoSerializer(proc_obj).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT'])
def case_detail(request, pk):
    ensure_seed_data()
    obj = Processo.objects.filter(pk=pk).first()
    if not obj:
        return Response({'error': 'Processo não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(ProcessoSerializer(obj).data)
    serializer = ProcessoSerializer(obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def case_messages(request, pk):
    ensure_seed_data()
    obj = Processo.objects.filter(pk=pk).first()
    if not obj:
        return Response({'error': 'Processo não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        msgs = obj.mensagens.all()
        return Response(MensagemProcessoSerializer(msgs, many=True).data)
    msg = MensagemProcesso.objects.create(
        processo=obj,
        remetente_id=request.data.get('senderId', 1),
        nome_remetente=request.data.get('senderName', 'Administrador'),
        conteudo=request.data.get('content', ''),
        interna=bool(request.data.get('isInternal', False)),
    )
    return Response(MensagemProcessoSerializer(msg).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
def documents_list(request):
    ensure_seed_data()
    if request.method == 'GET':
        qs = Documento.objects.all()
        title = request.GET.get('title')
        category = request.GET.get('category')
        if title:
            qs = qs.filter(titulo__icontains=title)
        if category:
            qs = qs.filter(categoria__iexact=category)
        return Response({
            'data': DocumentoSerializer(qs, many=True).data,
            'total': qs.count(),
        })
    uploaded_file = request.FILES.get('file')
    titulo = request.data.get('title') or (uploaded_file.name if uploaded_file else 'Novo_Documento.pdf')
    doc = Documento.objects.create(
        titulo=titulo,
        tipo_documento=request.data.get('type', 'PDF'),
        tamanho=f"{(uploaded_file.size / (1024 * 1024)):.1f} MB" if uploaded_file else '1.0 MB',
        categoria=request.data.get('category', 'Comprovante'),
        enviado_por='Administrador',
        url='#'
    )
    return Response(DocumentoSerializer(doc).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def document_detail(request, pk):
    doc = Documento.objects.filter(pk=pk).first()
    if not doc:
        return Response(status=status.HTTP_404_NOT_FOUND)
    doc.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def procon_inspections_list(request):
    ensure_seed_data()
    qs = Fiscalizacao.objects.all()
    return Response({
        'data': FiscalizacaoSerializer(qs, many=True).data,
        'total': qs.count(),
    })


@api_view(['GET'])
def overindebtedness_list(request):
    ensure_seed_data()
    qs = Superendividamento.objects.all()
    return Response({
        'data': SuperendividamentoSerializer(qs, many=True).data,
        'total': qs.count(),
    })


@api_view(['GET'])
def hearings_list(request):
    ensure_seed_data()
    qs = Audiencia.objects.all()
    return Response({
        'data': AudienciaSerializer(qs, many=True).data,
        'total': qs.count(),
    })

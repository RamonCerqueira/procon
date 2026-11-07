import uuid
from datetime import datetime
from rest_framework import status
from ..models import (
    Veiculo, InspecaoVeicular, Multa, OcorrenciaVeicular, DocumentoCertificado, Condutor,
    ConsultaMatriculaFiscalizacao, LeituraAutomaticaPlaca, ConsultaDocumentoQRCode,
    DispositivoMovelPolicial, RegistoInfracaoCampo, AlertaVeiculoRoubado
)
from ..serializers import (
    ConsultaMatriculaFiscalizacaoSerializer,
    LeituraAutomaticaPlacaSerializer,
    ConsultaDocumentoQRCodeSerializer,
    DispositivoMovelPolicialSerializer,
    RegistoInfracaoCampoSerializer,
    AlertaVeiculoRoubadoSerializer
)


class SmartInspectionController:
    """
    Controlador para a Fiscalização Inteligente do SIGETRAN:
    - Consulta de matrícula em tempo real
    - Leitura automática de placas (LPR / ANPR)
    - Verificação de autenticidade por QR Code
    - Terminais e aplicação móvel de agentes policiais
    - Registo de infrações em campo com fotografia e GPS
    - Deteção de veículos com documentos vencidos
    - Alertas e interceção de veículos roubados
    """

    @classmethod
    def query_plate_realtime(cls, data):
        """
        Efetua consulta detalhada e em tempo real de uma matrícula,
        cruzando com veículos, inspeções, multas ativas e alertas de furto.
        Regista a consulta no histórico de fiscalização.
        """
        raw_plate = str(data.get('plate', '')).upper().strip()
        officer_name = data.get('officerName', 'Agente Fiscalizador BNT')
        police_dept = data.get('policeDepartment', 'Brigada Nacional de Trânsito (BNT)')
        location = data.get('location', 'Posto de Controlo de Bissau')
        gps = data.get('gpsCoordinates', '11.8632, -15.5843')

        if not raw_plate:
            return {'data': {'error': 'A matrícula é obrigatória para a consulta.'}, 'status_code': status.HTTP_400_BAD_REQUEST}

        # 1. Procurar veículo na base do SIGETRAN
        vehicle = Veiculo.objects.filter(placa__iexact=raw_plate).first()

        # 2. Verificar alerta de veículo roubado
        stolen_alert = AlertaVeiculoRoubado.objects.filter(
            matricula__iexact=raw_plate,
            status_alerta__icontains='Ativo'
        ).first()

        # 3. Verificar ocorrência / mandado de apreensão
        occurrence = OcorrenciaVeicular.objects.filter(
            placa__iexact=raw_plate,
            tipo_evento__in=['Apreensão de Veículo', 'Furto / Roubo de Veículo', 'Ordem Judicial']
        ).first()

        # 4. Verificar multas pendentes
        fines = Multa.objects.filter(placa__iexact=raw_plate, status__in=['Pendente', 'Em cobrança'])
        fines_count = fines.count()
        total_fines_amount = sum(float(f.valor) for f in fines)

        # 5. Determinar situação geral
        status_veiculo = 'Regular'
        motivo = ''
        seguro_valido = True
        inspecao_valida = True
        taxa_paga = True
        bloqueio_admin = False

        if stolen_alert:
            status_veiculo = 'Alerta de Roubo'
            motivo = f"Veículo com Mandado de Apreensão por Roubo (BO: {stolen_alert.numero_boletim_furto})"
            bloqueio_admin = True
        elif occurrence and occurrence.tipo_evento == 'Apreensão de Veículo':
            status_veiculo = 'Apreensão Pendente'
            motivo = f"Veículo com Ordem de Apreensão Ativa ({occurrence.motivo})"
            bloqueio_admin = True
        elif vehicle:
            if vehicle.imposto_devido and vehicle.imposto_devido > 0:
                taxa_paga = False
                status_veiculo = 'Irregular'
                motivo = 'Imposto de Circulação / Vinheta em atraso'
            if vehicle.situacao_legal in ['Bloqueado', 'Cancelado', 'Apreendido']:
                status_veiculo = 'Bloqueado'
                motivo = f"Situação legal: {vehicle.situacao_legal}"
                bloqueio_admin = True
        else:
            status_veiculo = 'Não Registado'
            motivo = 'Matrícula não consta na base de dados nacional de registo automóvel'

        now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        code = f"CMP-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"

        details = f"{vehicle.marca} {vehicle.modelo} ({vehicle.ano}) - {vehicle.cor}" if vehicle else "Veículo desconhecido"
        owner = vehicle.proprietario if vehicle else "Não identificado"

        record = ConsultaMatriculaFiscalizacao.objects.create(
            codigo=code,
            matricula=raw_plate,
            data_hora=now_str,
            agente_responsavel=officer_name,
            orgao_policial=police_dept,
            localizacao=location,
            coordenadas_gps=gps,
            status_veiculo=status_veiculo,
            motivo_irregularidade=motivo,
            detalhes_veiculo=details,
            proprietario_nome=owner,
            seguro_valido=seguro_valido,
            inspecao_valida=inspecao_valida,
            taxa_circulacao_paga=taxa_paga,
            bloqueio_administrativo=bloqueio_admin
        )

        serialized = ConsultaMatriculaFiscalizacaoSerializer(record).data
        response_data = {
            'query': serialized,
            'vehicle': {
                'plate': raw_plate,
                'found': bool(vehicle),
                'make': vehicle.marca if vehicle else '---',
                'model': vehicle.modelo if vehicle else '---',
                'year': vehicle.ano if vehicle else None,
                'color': vehicle.cor if vehicle else '---',
                'category': vehicle.categoria if vehicle else '---',
                'district': vehicle.distrito if vehicle else '---',
                'owner': vehicle.proprietario if vehicle else 'Desconhecido',
                'driver': vehicle.condutor if vehicle else 'Não registado',
                'legalStatus': vehicle.situacao_legal if vehicle else 'Desconhecido',
                'taxDue': vehicle.imposto_devido if vehicle else 0,
            },
            'stolenAlert': {
                'isStolen': bool(stolen_alert),
                'reportNumber': stolen_alert.numero_boletim_furto if stolen_alert else None,
                'priority': stolen_alert.nivel_prioridade if stolen_alert else None,
                'victim': stolen_alert.proprietario_vitima if stolen_alert else None,
                'victimContact': stolen_alert.contacto_vitima if stolen_alert else None
            },
            'pendingFines': {
                'count': fines_count,
                'totalAmount': total_fines_amount,
                'items': [{'code': f.codigo, 'description': f.infracao, 'amount': float(f.valor), 'date': f.data} for f in fines[:5]]
            }
        }
        return {'data': response_data, 'status_code': status.HTTP_201_CREATED}

    @classmethod
    def list_queries(cls, search=''):
        qs = ConsultaMatriculaFiscalizacao.objects.all().order_by('-id')
        if search:
            qs = qs.filter(matricula__icontains=search) | qs.filter(proprietario_nome__icontains=search) | qs.filter(agente_responsavel__icontains=search)
        return {'data': ConsultaMatriculaFiscalizacaoSerializer(qs, many=True).data, 'status_code': status.HTTP_200_OK}

    # ==========================================================================
    # LPR / ANPR (Reconhecimento Automático de Placas)
    # ==========================================================================
    @classmethod
    def list_lpr_readings(cls, camera_id='', search='', alert_only=False):
        qs = LeituraAutomaticaPlaca.objects.all().order_by('-id')
        if camera_id:
            qs = qs.filter(camera_id__icontains=camera_id)
        if search:
            qs = qs.filter(matricula_detectada__icontains=search) | qs.filter(localizacao_camera__icontains=search)
        if alert_only:
            qs = qs.filter(alerta_disparado=True)
        return {'data': LeituraAutomaticaPlacaSerializer(qs, many=True).data, 'status_code': status.HTTP_200_OK}

    @classmethod
    def create_lpr_reading(cls, data):
        plate = str(data.get('detectedPlate', '')).upper().strip()
        camera_id = data.get('cameraId', 'CAM-SAFIM-NORTE-01')
        location = data.get('cameraLocation', 'Rotunda de Safim - Estrada Nacional N1')
        gps = data.get('gpsCoordinates', '11.9542, -15.6511')
        speed = int(data.get('speedKmh', 58))
        confidence = float(data.get('confidence', 98.7))
        img_url = data.get('captureImageUrl', '')

        # Verificar se a placa tem alerta de furto ou restrição
        stolen = AlertaVeiculoRoubado.objects.filter(matricula__iexact=plate, status_alerta__icontains='Ativo').first()
        vehicle = Veiculo.objects.filter(placa__iexact=plate).first()

        alert_triggered = False
        alert_type = 'Nenhum'
        interception_status = 'Livre / Sem Restrições'

        if stolen:
            alert_triggered = True
            alert_type = 'Veículo Roubado'
            interception_status = 'ALERTA VERMELHO - Notificar Patrulha Imediatamente'
        elif speed > 90:
            alert_triggered = True
            alert_type = 'Excesso de Velocidade'
            interception_status = 'Auto de Notícia Automático Emitido'
        elif vehicle and vehicle.imposto_devido and vehicle.imposto_devido > 0:
            alert_triggered = True
            alert_type = 'Taxa de Circulação Vencida'
            interception_status = 'Sinalizado para Posto Fixo'

        code = data.get('id') or f"LPR-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
        now_str = data.get('timestamp') or datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        record = LeituraAutomaticaPlaca.objects.create(
            codigo=code,
            matricula_detectada=plate,
            camera_id=camera_id,
            localizacao_camera=location,
            coordenadas_gps=gps,
            velocidade_kmh=speed,
            precisao_leitura=confidence,
            imagem_captura_url=img_url,
            alerta_disparado=alert_triggered,
            tipo_alerta=alert_type,
            status_intercecao=interception_status,
            data_hora=now_str
        )
        return {'data': LeituraAutomaticaPlacaSerializer(record).data, 'status_code': status.HTTP_201_CREATED}

    # ==========================================================================
    # QR Code Document Verification
    # ==========================================================================
    @classmethod
    def list_qr_checks(cls, search=''):
        qs = ConsultaDocumentoQRCode.objects.all().order_by('-id')
        if search:
            qs = qs.filter(numero_documento__icontains=search) | qs.filter(titular_nome__icontains=search) | qs.filter(matricula_associada__icontains=search)
        return {'data': ConsultaDocumentoQRCodeSerializer(qs, many=True).data, 'status_code': status.HTTP_200_OK}

    @classmethod
    def verify_qr_code(cls, data):
        doc_type = data.get('documentType', 'Certificado de Matrícula (DUA)')
        doc_number = data.get('documentNumber', '').strip()
        holder = data.get('holderName', '').strip()
        plate = str(data.get('associatedPlate', '')).upper().strip()
        hash_code = data.get('cryptographicHash', uuid.uuid4().hex).strip()
        officer = data.get('verifiedBy', 'Agente Fiscalizador BNT')
        device = data.get('deviceUsed', 'Terminal Móvel Zebra TC26')

        # Buscar correspondência oficial
        cert = DocumentoCertificado.objects.filter(numero_documento__iexact=doc_number).first()
        validity = 'Autêntico e Válido'
        issue_date = '2024-01-15'
        expiry_date = '2027-01-15'

        if cert:
            holder = cert.titular
            plate = cert.matricula
            issue_date = cert.data_emissao
            expiry_date = cert.data_validade
            if cert.bloqueio_administrativo:
                validity = 'Suspenso / Revogado'
            elif cert.status != 'Ativo':
                validity = 'Documento Expirado'
        elif not doc_number:
            validity = 'Falsificação / Inválido'

        code = f"QR-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
        now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        record = ConsultaDocumentoQRCode.objects.create(
            codigo=code,
            tipo_documento=doc_type,
            numero_documento=doc_number,
            titular_nome=holder or 'Titular Não Declarado',
            matricula_associada=plate,
            hash_criptografico=hash_code,
            status_validade=validity,
            data_emissao=issue_date,
            data_validade=expiry_date,
            agente_verificador=officer,
            dispositivo_utilizado=device,
            data_verificacao=now_str
        )
        return {'data': ConsultaDocumentoQRCodeSerializer(record).data, 'status_code': status.HTTP_201_CREATED}

    # ==========================================================================
    # Dispositivos Móveis Policiais
    # ==========================================================================
    @classmethod
    def list_mobile_devices(cls, search=''):
        qs = DispositivoMovelPolicial.objects.all().order_by('-id')
        if search:
            qs = qs.filter(identificador__icontains=search) | qs.filter(agente_designado__icontains=search) | qs.filter(nip_agente__icontains=search)
        return {'data': DispositivoMovelPolicialSerializer(qs, many=True).data, 'status_code': status.HTTP_200_OK}

    @classmethod
    def register_mobile_device(cls, data):
        device_id = data.get('id', f"MOB-BNT-{uuid.uuid4().hex[:3].upper()}")
        officer = data.get('assignedOfficer', 'Agente BNT')
        nip = data.get('officerBadge', 'BNT-0000')
        unit = data.get('policeUnit', 'Brigada Nacional de Trânsito (BNT)')

        device, created = DispositivoMovelPolicial.objects.update_or_create(
            identificador=device_id,
            defaults={
                'agente_designado': officer,
                'nip_agente': nip,
                'unidade_policial': unit,
                'marca_modelo_aparelho': data.get('deviceModel', 'Zebra TC26 Android Rugged'),
                'nivel_bateria': int(data.get('batteryLevel', 88)),
                'status_rede': data.get('networkStatus', 'Online (4G LTE)'),
                'modo_offline': bool(data.get('isOffline', False)),
                'registos_pendentes_sincronizacao': int(data.get('pendingSyncCount', 0)),
                'infracoes_lavradas_turno': int(data.get('ticketsIssuedShift', 0)),
                'consultas_efetuadas_turno': int(data.get('queriesDoneShift', 0)),
                'ultima_localizacao_gps': data.get('lastGps', '11.8632, -15.5843'),
                'versao_aplicativo': data.get('appVersion', 'v2.4.1'),
                'bloqueado_remotamente': bool(data.get('isRemoteLocked', False))
            }
        )
        return {'data': DispositivoMovelPolicialSerializer(device).data, 'status_code': status.HTTP_201_CREATED if created else status.HTTP_200_OK}

    # ==========================================================================
    # Registos de Infrações com Fotos e GPS
    # ==========================================================================
    @classmethod
    def list_field_infractions(cls, search='', plate=''):
        qs = RegistoInfracaoCampo.objects.all().order_by('-id')
        if plate:
            qs = qs.filter(matricula__iexact=plate.strip())
        if search:
            qs = qs.filter(numero_auto__icontains=search) | qs.filter(matricula__icontains=search) | qs.filter(condutor_nome__icontains=search)
        return {'data': RegistoInfracaoCampoSerializer(qs, many=True).data, 'status_code': status.HTTP_200_OK}

    @classmethod
    def create_field_infraction(cls, data):
        auto_id = data.get('id') or f"AIF-{datetime.now().strftime('%Y')}-{uuid.uuid4().hex[:5].upper()}"
        plate = str(data.get('plate', '')).upper().strip()
        vehicle_label = data.get('vehicleLabel', '')
        color = data.get('color', 'Branco')
        driver_name = data.get('driverName', '')
        driver_doc = data.get('driverDocument', '')
        driver_lic = data.get('driverLicense', '')
        inf_code = data.get('infractionCode', 'INF-VELOCIDADE')
        legal_art = data.get('legalArticle', 'Artigo 24.º do Código da Estrada da Guiné-Bissau')
        desc = data.get('description', 'Infração detetada em fiscalização de trânsito móvel.')
        amount = float(data.get('fineAmount', 25000.00))
        gps = data.get('gpsCoordinates', '11.8632, -15.5843')
        address = data.get('locationAddress', 'Avenida dos Combatentes da Liberdade da Pátria, Bissau')
        region = data.get('region', 'Bissau')
        photo_url = data.get('evidencePhotoUrl', '')
        officer = data.get('officerName', 'Agente Fiscalizador BNT')
        nip = data.get('officerBadge', 'BNT-1044')
        police_dept = data.get('policeDepartment', 'Brigada Nacional de Trânsito (BNT)')
        payment_status = data.get('paymentStatus', 'Pendente')
        impounded = bool(data.get('vehicleImpounded', False))
        timestamp = data.get('timestamp') or datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        record = RegistoInfracaoCampo.objects.create(
            numero_auto=auto_id,
            matricula=plate,
            marca_modelo=vehicle_label,
            cor=color,
            condutor_nome=driver_name,
            condutor_documento=driver_doc,
            condutor_carta=driver_lic,
            codigo_infracao=inf_code,
            artigo_legal=legal_art,
            descricao_factos=desc,
            valor_multa=amount,
            coordenadas_gps=gps,
            endereco_completo=address,
            regiao=region,
            fotografia_evidencia_url=photo_url,
            agente_autuante=officer,
            agente_matricula=nip,
            orgao_autuante=police_dept,
            status_pagamento=payment_status,
            veiculo_apreendido=impounded,
            data_hora_infracao=timestamp
        )

        # Sincronizar com tabela de Multas do sistema para coerência
        Multa.objects.get_or_create(
            codigo=auto_id,
            defaults={
                'placa': plate,
                'condutor': driver_name,
                'data': timestamp[:10],
                'infracao': f"{inf_code} - {legal_art}",
                'valor': int(amount),
                'status': payment_status,
                'agente_nome': officer,
                'agente_matricula': nip,
                'local_infracao': address
            }
        )

        return {'data': RegistoInfracaoCampoSerializer(record).data, 'status_code': status.HTTP_201_CREATED}

    @classmethod
    def delete_field_infraction(cls, auto_id):
        item = RegistoInfracaoCampo.objects.filter(numero_auto=auto_id).first()
        if not item:
            return {'data': {'error': 'Auto de infração não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}
        item.delete()
        Multa.objects.filter(codigo=auto_id).delete()
        return {'data': {'message': 'Auto de infração eliminado com sucesso.'}, 'status_code': status.HTTP_200_OK}

    # ==========================================================================
    # Veículos com Documentos Vencidos
    # ==========================================================================
    @classmethod
    def get_expired_documents(cls, search=''):
        """
        Gera relatório em tempo real de veículos com inspeção vencida,
        imposto de circulação não pago ou apólice expirada.
        """
        vehicles = Veiculo.objects.all()
        results = []

        for v in vehicles:
            reasons = []
            if v.imposto_devido and v.imposto_devido > 0:
                reasons.append(f"Taxa de circulação em dívida ({v.imposto_devido:,} XOF)")

            # Verificar última inspeção
            insp = InspecaoVeicular.objects.filter(placa__iexact=v.placa).order_by('-id').first()
            if not insp or insp.status != 'Concluída':
                reasons.append("Inspeção periódica obrigatória pendente ou vencida")

            if reasons:
                results.append({
                    'plate': v.placa,
                    'make': v.marca,
                    'model': v.modelo,
                    'year': v.ano,
                    'color': v.cor,
                    'owner': v.proprietario,
                    'district': v.distrito,
                    'category': v.categoria,
                    'taxDue': v.imposto_devido or 0,
                    'reasons': reasons,
                    'riskLevel': 'Alto' if len(reasons) > 1 else 'Médio',
                    'actionRecommended': 'Apreensão cautelar no próximo posto' if len(reasons) > 1 else 'Notificação para regularização'
                })

        if search:
            results = [r for r in results if search.lower() in r['plate'].lower() or search.lower() in r['owner'].lower() or search.lower() in r['district'].lower()]

        return {'data': results, 'status_code': status.HTTP_200_OK}

    # ==========================================================================
    # Alertas de Veículos Roubados
    # ==========================================================================
    @classmethod
    def list_stolen_alerts(cls, status_filter='', search=''):
        qs = AlertaVeiculoRoubado.objects.all().order_by('-id')
        if status_filter:
            qs = qs.filter(status_alerta__icontains=status_filter)
        if search:
            qs = qs.filter(matricula__icontains=search) | qs.filter(numero_boletim_furto__icontains=search) | qs.filter(marca_modelo__icontains=search) | qs.filter(proprietario_vitima__icontains=search)
        return {'data': AlertaVeiculoRoubadoSerializer(qs, many=True).data, 'status_code': status.HTTP_200_OK}

    @classmethod
    def create_stolen_alert(cls, data):
        code = data.get('id') or f"ALR-{datetime.now().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
        plate = str(data.get('plate', '')).upper().strip()

        record = AlertaVeiculoRoubado.objects.create(
            codigo_alerta=code,
            matricula=plate,
            marca_modelo=data.get('vehicleLabel', ''),
            cor=data.get('color', 'Branco'),
            numero_chassis=data.get('vin', 'VIN-DESCONHECIDO'),
            numero_boletim_furto=data.get('theftReportNumber', f"BO-FURTO-{datetime.now().strftime('%Y')}-001"),
            data_roubo=data.get('theftDateTime', datetime.now().strftime('%Y-%m-%d %H:%M')),
            local_roubo=data.get('theftLocation', 'Bissau'),
            regiao=data.get('region', 'Bissau'),
            proprietario_vitima=data.get('victimName', 'Proprietário'),
            contacto_vitima=data.get('victimContact', '+245 '),
            nivel_prioridade=data.get('priorityLevel', 'Crítica / Vermelho'),
            status_alerta=data.get('status', 'Ativo - Veículo Procurado'),
            observacoes_policiais=data.get('policeNotes', '')
        )

        # Regista ocorrência veicular no registo central
        OcorrenciaVeicular.objects.get_or_create(
            codigo=code,
            defaults={
                'placa': plate,
                'veiculo_descricao': f"{record.marca_modelo} ({record.cor})",
                'proprietario': record.proprietario_vitima,
                'categoria_registo': 'Ocorrência Policial / Fiscalização',
                'tipo_evento': 'Furto / Roubo de Veículo',
                'situacao_resultante': 'Procurado',
                'data_evento': record.data_roubo[:10],
                'motivo': f"Alerta Nacional de Furto/Roubo - BO: {record.numero_boletim_furto}",
                'autoridade_orgao': 'Polícia de Ordem Pública / BNT',
                'local_deposito': record.local_roubo,
                'observacoes': record.observacoes_policiais
            }
        )

        return {'data': AlertaVeiculoRoubadoSerializer(record).data, 'status_code': status.HTTP_201_CREATED}

    @classmethod
    def resolve_stolen_alert(cls, alert_id, data):
        alert = AlertaVeiculoRoubado.objects.filter(codigo_alerta=alert_id).first()
        if not alert:
            return {'data': {'error': 'Alerta de roubo não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}

        alert.status_alerta = 'Intercetado / Recuperado'
        alert.data_recuperacao = data.get('recoveryDate', datetime.now().strftime('%Y-%m-%d %H:%M'))
        alert.local_recuperacao = data.get('recoveryLocation', 'Posto de Fiscalização BNT Safim')
        alert.agente_recuperador = data.get('recoveringOfficer', 'Brigada Nacional de Trânsito')
        notes = data.get('policeNotes', '')
        if notes:
            alert.observacoes_policiais = f"{alert.observacoes_policiais}\n[RECUPERADO]: {notes}".strip()
        alert.save()

        # Atualizar ocorrência veicular
        OcorrenciaVeicular.objects.filter(codigo=alert_id).update(situacao_resultante='Recuperado')

        return {'data': AlertaVeiculoRoubadoSerializer(alert).data, 'status_code': status.HTTP_200_OK}

    # ==========================================================================
    # Estatísticas Globais de Fiscalização Inteligente
    # ==========================================================================
    @classmethod
    def get_smart_inspection_stats(cls):
        total_queries = ConsultaMatriculaFiscalizacao.objects.count()
        total_lpr = LeituraAutomaticaPlaca.objects.count()
        lpr_alerts = LeituraAutomaticaPlaca.objects.filter(alerta_disparado=True).count()
        active_stolen = AlertaVeiculoRoubado.objects.filter(status_alerta__icontains='Ativo').count()
        recovered_stolen = AlertaVeiculoRoubado.objects.filter(status_alerta__icontains='Recuperado').count()
        field_infractions = RegistoInfracaoCampo.objects.count()
        active_devices = DispositivoMovelPolicial.objects.filter(bloqueado_remotamente=False).count()

        return {
            'data': {
                'totalPlateQueries': total_queries,
                'totalLprReadings': total_lpr,
                'lprAlertsTriggered': lpr_alerts,
                'activeStolenAlerts': active_stolen,
                'recoveredVehicles': recovered_stolen,
                'fieldInfractionsCount': field_infractions,
                'activeMobileDevices': active_devices
            },
            'status_code': status.HTTP_200_OK
        }

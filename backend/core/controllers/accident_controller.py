import time
from django.db.models import Q, Count, Sum
from rest_framework import status

from ..models import (
    AcidenteTransito,
    VeiculoCondutorAcidente,
    VitimaAcidente,
    TestemunhaAcidente,
    RelatorioPolicialAcidente,
    DocumentoFotografiaAcidente,
)
from ..serializers import (
    AcidenteTransitoSerializer,
    VeiculoCondutorAcidenteSerializer,
    VitimaAcidenteSerializer,
    TestemunhaAcidenteSerializer,
    RelatorioPolicialAcidenteSerializer,
    DocumentoFotografiaAcidenteSerializer,
)
from ..seed import ensure_seed_data


class AccidentController:
    """
    Controller (Arquitetura MVC) responsável pela lógica de negócio
    da Gestão de Acidentes Rodoviários (Registo, Intervenientes, Vítimas,
    Localização GIS, Fotografias e Provas, Relatórios Policiais, Testemunhas e Estatísticas).
    """

    # --------------------------------------------------------------------------
    # 1. Registo de Acidentes
    # --------------------------------------------------------------------------
    @staticmethod
    def list_accidents(region: str = '', severity: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = AcidenteTransito.objects.all()
        if region:
            qs = qs.filter(regiao__iexact=region.strip())
        if severity:
            qs = qs.filter(gravidade__iexact=severity.strip())
        if search:
            q = search.strip()
            qs = qs.filter(
                Q(codigo__icontains=q)
                | Q(local_via__icontains=q)
                | Q(regiao__icontains=q)
                | Q(tipo_acidente__icontains=q)
                | Q(causa_provavel__icontains=q)
            )
        return {
            'data': AcidenteTransitoSerializer(qs, many=True).data,
            'status_code': status.HTTP_200_OK,
        }

    @staticmethod
    def create_accident(payload: dict) -> dict:
        ensure_seed_data()
        codigo = str(payload.get('id', '')).strip() or f"ACID-2026-{str(int(time.time() * 1000))[-4:]}"
        if AcidenteTransito.objects.filter(codigo__iexact=codigo).exists():
            return {'data': {'error': f'Já existe um registo de acidente com o código {codigo}.'}, 'status_code': status.HTTP_400_BAD_REQUEST}

        road = str(payload.get('road', '')).strip()
        if not road:
            return {'data': {'error': 'A via / estrada do acidente é obrigatória.'}, 'status_code': status.HTTP_400_BAD_REQUEST}

        accident = AcidenteTransito.objects.create(
            codigo=codigo,
            data_acidente=str(payload.get('date', '')).strip(),
            hora_acidente=str(payload.get('time', '12:00')).strip() or '12:00',
            gravidade=str(payload.get('severity', 'Com Feridos')).strip() or 'Com Feridos',
            tipo_acidente=str(payload.get('type', 'Colisão')).strip() or 'Colisão',
            regiao=str(payload.get('region', 'Setor Autónomo de Bissau')).strip() or 'Setor Autónomo de Bissau',
            local_via=road,
            latitude=float(payload.get('latitude') or 11.8632),
            longitude=float(payload.get('longitude') or -15.5984),
            ponto_referencia=str(payload.get('landmark', '')).strip(),
            condicoes_meteorologicas=str(payload.get('weather', 'Bom tempo / Sol')).strip() or 'Bom tempo / Sol',
            estado_piso=str(payload.get('roadCondition', 'Seco e limpo')).strip() or 'Seco e limpo',
            quantidade_veiculos=int(payload.get('vehiclesInvolved') or 2),
            quantidade_vitimas=int(payload.get('victimsCount') or 0),
            quantidade_mortos=int(payload.get('fatalitiesCount') or 0),
            quantidade_feridos=int(payload.get('injuredCount') or 0),
            causa_provavel=str(payload.get('probableCause', 'Excesso de velocidade')).strip() or 'Excesso de velocidade',
            descricao_circunstancias=str(payload.get('description', '')).strip(),
            status=str(payload.get('status', 'Em Investigação')).strip() or 'Em Investigação',
        )
        return {'data': AcidenteTransitoSerializer(accident).data, 'status_code': status.HTTP_201_CREATED}

    @staticmethod
    def update_accident(code: str, payload: dict) -> dict:
        ensure_seed_data()
        try:
            accident = AcidenteTransito.objects.get(codigo__iexact=code.strip())
        except AcidenteTransito.DoesNotExist:
            return {'data': {'error': 'Registo de acidente não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}

        for k, field in [
            ('date', 'data_acidente'),
            ('time', 'hora_acidente'),
            ('severity', 'gravidade'),
            ('type', 'tipo_acidente'),
            ('region', 'regiao'),
            ('road', 'local_via'),
            ('landmark', 'ponto_referencia'),
            ('weather', 'condicoes_meteorologicas'),
            ('roadCondition', 'estado_piso'),
            ('probableCause', 'causa_provavel'),
            ('description', 'descricao_circunstancias'),
            ('status', 'status'),
        ]:
            if k in payload:
                setattr(accident, field, str(payload[k]).strip())

        if 'latitude' in payload:
            accident.latitude = float(payload['latitude'])
        if 'longitude' in payload:
            accident.longitude = float(payload['longitude'])
        if 'vehiclesInvolved' in payload:
            accident.quantidade_veiculos = int(payload['vehiclesInvolved'])
        if 'victimsCount' in payload:
            accident.quantidade_vitimas = int(payload['victimsCount'])
        if 'fatalitiesCount' in payload:
            accident.quantidade_mortos = int(payload['fatalitiesCount'])
        if 'injuredCount' in payload:
            accident.quantidade_feridos = int(payload['injuredCount'])

        accident.save()
        return {'data': AcidenteTransitoSerializer(accident).data, 'status_code': status.HTTP_200_OK}

    @staticmethod
    def delete_accident(code: str) -> dict:
        ensure_seed_data()
        try:
            accident = AcidenteTransito.objects.get(codigo__iexact=code.strip())
            accident.delete()
            return {'data': {'success': True, 'message': 'Acidente removido com sucesso.'}, 'status_code': status.HTTP_200_OK}
        except AcidenteTransito.DoesNotExist:
            return {'data': {'error': 'Registo de acidente não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}

    # --------------------------------------------------------------------------
    # 2. Veículos e Condutores Envolvidos
    # --------------------------------------------------------------------------
    @staticmethod
    def list_vehicles_drivers(accident_id: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = VeiculoCondutorAcidente.objects.all()
        if accident_id:
            qs = qs.filter(acidente_codigo__iexact=accident_id.strip())
        if search:
            q = search.strip()
            qs = qs.filter(
                Q(codigo__icontains=q)
                | Q(acidente_codigo__icontains=q)
                | Q(veiculo_placa__icontains=q)
                | Q(condutor_nome__icontains=q)
                | Q(condutor_documento__icontains=q)
            )
        return {
            'data': VeiculoCondutorAcidenteSerializer(qs, many=True).data,
            'status_code': status.HTTP_200_OK,
        }

    @staticmethod
    def create_vehicle_driver(payload: dict) -> dict:
        ensure_seed_data()
        codigo = str(payload.get('id', '')).strip() or f"VCA-2026-{str(int(time.time() * 1000))[-4:]}"
        item = VeiculoCondutorAcidente.objects.create(
            codigo=codigo,
            acidente_codigo=str(payload.get('accidentId', '')).strip(),
            veiculo_placa=str(payload.get('plate', '')).strip().upper(),
            veiculo_marca_modelo=str(payload.get('vehicleLabel', '')).strip(),
            veiculo_categoria=str(payload.get('vehicleCategory', 'Ligeiro particular')).strip() or 'Ligeiro particular',
            veiculo_seguradora=str(payload.get('insuranceCompany', 'Garantia Seguros GB')).strip(),
            veiculo_apolice=str(payload.get('insurancePolicy', '')).strip(),
            danos_materiais=str(payload.get('damageDescription', '')).strip(),
            condutor_nome=str(payload.get('driverName', '')).strip(),
            condutor_documento=str(payload.get('driverDocument', '')).strip(),
            condutor_carta=str(payload.get('driverLicense', '')).strip(),
            condutor_categoria_carta=str(payload.get('driverCategory', 'B')).strip(),
            condutor_telefone=str(payload.get('driverPhone', '')).strip(),
            teste_alcoolemia=str(payload.get('alcoholTest', '0.00 g/l (Negativo)')).strip() or '0.00 g/l (Negativo)',
            responsabilidade_apurada=str(payload.get('liability', 'Sob Peritagem')).strip() or 'Sob Peritagem',
            observacoes=str(payload.get('notes', '')).strip(),
        )
        return {'data': VeiculoCondutorAcidenteSerializer(item).data, 'status_code': status.HTTP_201_CREATED}

    @staticmethod
    def delete_vehicle_driver(code: str) -> dict:
        ensure_seed_data()
        try:
            item = VeiculoCondutorAcidente.objects.get(codigo__iexact=code.strip())
            item.delete()
            return {'data': {'success': True}, 'status_code': status.HTTP_200_OK}
        except VeiculoCondutorAcidente.DoesNotExist:
            return {'data': {'error': 'Interveniente não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}

    # --------------------------------------------------------------------------
    # 3. Identificação de Vítimas
    # --------------------------------------------------------------------------
    @staticmethod
    def list_victims(accident_id: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = VitimaAcidente.objects.all()
        if accident_id:
            qs = qs.filter(acidente_codigo__iexact=accident_id.strip())
        if search:
            q = search.strip()
            qs = qs.filter(
                Q(codigo__icontains=q)
                | Q(acidente_codigo__icontains=q)
                | Q(nome__icontains=q)
                | Q(hospital_destino__icontains=q)
                | Q(gravidade_lesao__icontains=q)
            )
        return {
            'data': VitimaAcidenteSerializer(qs, many=True).data,
            'status_code': status.HTTP_200_OK,
        }

    @staticmethod
    def create_victim(payload: dict) -> dict:
        ensure_seed_data()
        codigo = str(payload.get('id', '')).strip() or f"VIT-2026-{str(int(time.time() * 1000))[-4:]}"
        victim = VitimaAcidente.objects.create(
            codigo=codigo,
            acidente_codigo=str(payload.get('accidentId', '')).strip(),
            nome=str(payload.get('name', '')).strip(),
            documento_identificacao=str(payload.get('document', '')).strip(),
            idade=int(payload.get('age') or 30),
            sexo=str(payload.get('gender', 'Masculino')).strip(),
            condicao_vitima=str(payload.get('condition', 'Passageiro')).strip(),
            veiculo_placa=str(payload.get('associatedPlate', '')).strip().upper(),
            gravidade_lesao=str(payload.get('injurySeverity', 'Ferimentos Leves')).strip(),
            hospital_destino=str(payload.get('hospital', 'Hospital Nacional Simão Mendes')).strip(),
            contacto_emergencia=str(payload.get('emergencyContact', '')).strip(),
            observacoes_medicas=str(payload.get('medicalNotes', '')).strip(),
        )
        return {'data': VitimaAcidenteSerializer(victim).data, 'status_code': status.HTTP_201_CREATED}

    @staticmethod
    def delete_victim(code: str) -> dict:
        ensure_seed_data()
        try:
            victim = VitimaAcidente.objects.get(codigo__iexact=code.strip())
            victim.delete()
            return {'data': {'success': True}, 'status_code': status.HTTP_200_OK}
        except VitimaAcidente.DoesNotExist:
            return {'data': {'error': 'Registo de vítima não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}

    # --------------------------------------------------------------------------
    # 4. Identificação de Testemunhas
    # --------------------------------------------------------------------------
    @staticmethod
    def list_witnesses(accident_id: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = TestemunhaAcidente.objects.all()
        if accident_id:
            qs = qs.filter(acidente_codigo__iexact=accident_id.strip())
        if search:
            q = search.strip()
            qs = qs.filter(
                Q(codigo__icontains=q)
                | Q(acidente_codigo__icontains=q)
                | Q(nome__icontains=q)
                | Q(depoimento__icontains=q)
            )
        return {
            'data': TestemunhaAcidenteSerializer(qs, many=True).data,
            'status_code': status.HTTP_200_OK,
        }

    @staticmethod
    def create_witness(payload: dict) -> dict:
        ensure_seed_data()
        codigo = str(payload.get('id', '')).strip() or f"TST-2026-{str(int(time.time() * 1000))[-4:]}"
        witness = TestemunhaAcidente.objects.create(
            codigo=codigo,
            acidente_codigo=str(payload.get('accidentId', '')).strip(),
            nome=str(payload.get('name', '')).strip(),
            documento_identificacao=str(payload.get('document', '')).strip(),
            telefone=str(payload.get('phone', '')).strip(),
            endereco=str(payload.get('address', '')).strip(),
            posicao_momento=str(payload.get('locationAtMoment', 'Peão no local')).strip(),
            depoimento=str(payload.get('statement', '')).strip(),
            data_depoimento=str(payload.get('statementDate', '')).strip(),
        )
        return {'data': TestemunhaAcidenteSerializer(witness).data, 'status_code': status.HTTP_201_CREATED}

    @staticmethod
    def delete_witness(code: str) -> dict:
        ensure_seed_data()
        try:
            witness = TestemunhaAcidente.objects.get(codigo__iexact=code.strip())
            witness.delete()
            return {'data': {'success': True}, 'status_code': status.HTTP_200_OK}
        except TestemunhaAcidente.DoesNotExist:
            return {'data': {'error': 'Testemunha não encontrada.'}, 'status_code': status.HTTP_404_NOT_FOUND}

    # --------------------------------------------------------------------------
    # 5. Relatórios Policiais
    # --------------------------------------------------------------------------
    @staticmethod
    def list_police_reports(accident_id: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = RelatorioPolicialAcidente.objects.all()
        if accident_id:
            qs = qs.filter(acidente_codigo__iexact=accident_id.strip())
        if search:
            q = search.strip()
            qs = qs.filter(
                Q(codigo__icontains=q)
                | Q(acidente_codigo__icontains=q)
                | Q(numero_boletim__icontains=q)
                | Q(agente_responsavel__icontains=q)
                | Q(conclusao_pericial__icontains=q)
            )
        return {
            'data': RelatorioPolicialAcidenteSerializer(qs, many=True).data,
            'status_code': status.HTTP_200_OK,
        }

    @staticmethod
    def create_police_report(payload: dict) -> dict:
        ensure_seed_data()
        codigo = str(payload.get('id', '')).strip() or f"BO-POL-2026-{str(int(time.time() * 1000))[-4:]}"
        report = RelatorioPolicialAcidente.objects.create(
            codigo=codigo,
            acidente_codigo=str(payload.get('accidentId', '')).strip(),
            numero_boletim=str(payload.get('reportNumber', '')).strip() or f"BO/BNT/2026/{str(int(time.time() * 1000))[-4:]}",
            orgao_policial=str(payload.get('policeDepartment', 'Brigada Nacional de Trânsito (BNT)')).strip(),
            agente_responsavel=str(payload.get('officerName', '')).strip(),
            agente_matricula=str(payload.get('officerBadge', '')).strip(),
            data_relatorio=str(payload.get('reportDate', '')).strip(),
            conclusao_pericial=str(payload.get('investigationSummary', '')).strip(),
            infracoes_constatadas=str(payload.get('infractionsFound', '')).strip(),
            encaminhamento=str(payload.get('legalReferral', 'Remetido ao Ministério Público')).strip(),
            status_processo=str(payload.get('procedureStatus', 'Concluído')).strip(),
            observacoes=str(payload.get('notes', '')).strip(),
        )
        return {'data': RelatorioPolicialAcidenteSerializer(report).data, 'status_code': status.HTTP_201_CREATED}

    @staticmethod
    def delete_police_report(code: str) -> dict:
        ensure_seed_data()
        try:
            report = RelatorioPolicialAcidente.objects.get(codigo__iexact=code.strip())
            report.delete()
            return {'data': {'success': True}, 'status_code': status.HTTP_200_OK}
        except RelatorioPolicialAcidente.DoesNotExist:
            return {'data': {'error': 'Relatório policial não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}

    # --------------------------------------------------------------------------
    # 6. Fotografias e Documentos
    # --------------------------------------------------------------------------
    @staticmethod
    def list_evidence(accident_id: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = DocumentoFotografiaAcidente.objects.all()
        if accident_id:
            qs = qs.filter(acidente_codigo__iexact=accident_id.strip())
        if search:
            q = search.strip()
            qs = qs.filter(
                Q(codigo__icontains=q)
                | Q(acidente_codigo__icontains=q)
                | Q(titulo__icontains=q)
                | Q(descricao__icontains=q)
            )
        return {
            'data': DocumentoFotografiaAcidenteSerializer(qs, many=True).data,
            'status_code': status.HTTP_200_OK,
        }

    @staticmethod
    def create_evidence(payload: dict) -> dict:
        ensure_seed_data()
        codigo = str(payload.get('id', '')).strip() or f"FOTO-2026-{str(int(time.time() * 1000))[-4:]}"
        evidence = DocumentoFotografiaAcidente.objects.create(
            codigo=codigo,
            acidente_codigo=str(payload.get('accidentId', '')).strip(),
            tipo_anexo=str(payload.get('evidenceType', 'Fotografia do Local')).strip(),
            titulo=str(payload.get('title', '')).strip(),
            arquivo_url=str(payload.get('fileUrl', '')).strip(),
            descricao=str(payload.get('description', '')).strip(),
            autor_anexo=str(payload.get('registeredBy', 'Brigada de Peritagem BNT')).strip(),
            data_registo=str(payload.get('registrationDate', '')).strip(),
        )
        return {'data': DocumentoFotografiaAcidenteSerializer(evidence).data, 'status_code': status.HTTP_201_CREATED}

    @staticmethod
    def delete_evidence(code: str) -> dict:
        ensure_seed_data()
        try:
            evidence = DocumentoFotografiaAcidente.objects.get(codigo__iexact=code.strip())
            evidence.delete()
            return {'data': {'success': True}, 'status_code': status.HTTP_200_OK}
        except DocumentoFotografiaAcidente.DoesNotExist:
            return {'data': {'error': 'Registo de fotografia/documento não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}

    # --------------------------------------------------------------------------
    # 7. Estatísticas de Acidentes por Região
    # --------------------------------------------------------------------------
    @staticmethod
    def get_accident_statistics() -> dict:
        ensure_seed_data()
        accidents = AcidenteTransito.objects.all()
        total_accidents = accidents.count()
        total_fatalities = accidents.aggregate(m=Sum('quantidade_mortos'))['m'] or 0
        total_injured = accidents.aggregate(f=Sum('quantidade_feridos'))['f'] or 0
        total_vehicles = accidents.aggregate(v=Sum('quantidade_veiculos'))['v'] or 0

        # Estatísticas por Região
        by_region = []
        regions = accidents.values('regiao').annotate(
            count=Count('id'),
            fatalities=Sum('quantidade_mortos'),
            injured=Sum('quantidade_feridos'),
        ).order_by('-count')

        for r in regions:
            by_region.append({
                'region': r['regiao'],
                'accidentsCount': r['count'],
                'fatalities': r['fatalities'] or 0,
                'injured': r['injured'] or 0,
            })

        # Distribuição por Gravidade
        by_severity = list(accidents.values('gravidade').annotate(count=Count('id')).order_by('-count'))
        # Distribuição por Causa Provável
        by_cause = list(accidents.values('causa_provavel').annotate(count=Count('id')).order_by('-count'))

        return {
            'data': {
                'totalAccidents': total_accidents,
                'totalFatalities': total_fatalities,
                'totalInjured': total_injured,
                'totalVehiclesInvolved': total_vehicles,
                'byRegion': by_region,
                'bySeverity': by_severity,
                'byCause': by_cause,
            },
            'status_code': status.HTTP_200_OK,
        }


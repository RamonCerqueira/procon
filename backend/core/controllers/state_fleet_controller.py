import time
from datetime import date
from django.db.models import Q, Sum
from rest_framework import status

from ..models import VeiculoPublico, UtilizacaoVeiculoPublico, AbastecimentoFrota, ManutencaoFrota
from ..serializers import (
    VeiculoPublicoSerializer,
    UtilizacaoVeiculoPublicoSerializer,
    AbastecimentoFrotaSerializer,
    ManutencaoFrotaSerializer,
)
from ..seed import ensure_seed_data


class StateFleetController:
    """
    Controller (Arquitetura MVC) responsável pela lógica de negócio
    da Gestão da Frota do Estado (Veículos Públicos, Ministérios, Utilização,
    Combustível, Manutenção e Despesas).
    """

    # --------------------------------------------------------------------------
    # 1. Veículos Públicos e Afetação a Ministérios / Funcionários
    # --------------------------------------------------------------------------
    @staticmethod
    def list_public_vehicles(institution: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = VeiculoPublico.objects.all()
        if institution:
            qs = qs.filter(
                Q(ministerio_instituicao__icontains=institution.strip())
                | Q(sigla_instituicao__iexact=institution.strip())
            )
        if search:
            q = search.strip()
            qs = qs.filter(
                Q(codigo__icontains=q)
                | Q(placa__icontains=q)
                | Q(marca__icontains=q)
                | Q(modelo__icontains=q)
                | Q(ministerio_instituicao__icontains=q)
                | Q(funcionario_responsavel__icontains=q)
            )
        return {
            'data': VeiculoPublicoSerializer(qs, many=True).data,
            'status_code': status.HTTP_200_OK,
        }

    @staticmethod
    def create_public_vehicle(payload: dict) -> dict:
        ensure_seed_data()
        placa = str(payload.get('plate', '')).strip().upper()
        if not placa:
            return {'data': {'error': 'A matrícula oficial do veículo é obrigatória.'}, 'status_code': status.HTTP_400_BAD_REQUEST}

        if VeiculoPublico.objects.filter(placa__iexact=placa).exists():
            return {'data': {'error': f'Já existe um veículo público com a matrícula {placa}.'}, 'status_code': status.HTTP_400_BAD_REQUEST}

        codigo = str(payload.get('id', '')).strip() or f"FROTA-GOV-{str(int(time.time() * 1000))[-4:]}"
        inst = str(payload.get('institution', 'Ministério dos Transportes e Comunicações')).strip()
        acronym = str(payload.get('institutionAcronym', '')).strip()
        if not acronym:
            acronym = 'MTC' if 'Transportes' in inst else 'MINSAP' if 'Saúde' in inst else 'MEF' if 'Finanças' in inst else 'GOV'

        veiculo = VeiculoPublico.objects.create(
            codigo=codigo,
            placa=placa,
            marca=str(payload.get('make', 'Toyota')).strip(),
            modelo=str(payload.get('model', 'Land Cruiser')).strip(),
            ano=int(payload.get('year') or 2024),
            cor=str(payload.get('color', 'Branco')).strip() or 'Branco',
            categoria=str(payload.get('category', 'Serviço Operacional')).strip() or 'Serviço Operacional',
            ministerio_instituicao=inst,
            sigla_instituicao=acronym,
            departamento_direcao=str(payload.get('department', '')).strip(),
            funcionario_responsavel=str(payload.get('responsibleOfficer', '')).strip(),
            funcionario_cargo=str(payload.get('officerRole', '')).strip(),
            funcionario_contacto=str(payload.get('officerContact', '')).strip(),
            quilometragem_atual=int(payload.get('currentMileage') or 0),
            capacidade_tanque=int(payload.get('tankCapacity') or 70),
            tipo_combustivel=str(payload.get('fuelType', 'Gasóleo (Diesel)')).strip(),
            status=str(payload.get('status', 'Em Serviço')).strip(),
            numero_chassi=str(payload.get('chassisNumber', '')).strip(),
            data_afetacao=str(payload.get('assignmentDate') or date.today().isoformat()),
            observacoes=str(payload.get('notes', '')).strip(),
        )
        return {
            'data': VeiculoPublicoSerializer(veiculo).data,
            'status_code': status.HTTP_201_CREATED,
        }

    @staticmethod
    def update_public_vehicle(code: str, payload: dict) -> dict:
        ensure_seed_data()
        veiculo = VeiculoPublico.objects.filter(
            Q(codigo__iexact=code.strip()) | Q(placa__iexact=code.strip())
        ).first()
        if not veiculo:
            return {'data': {'error': 'Veículo público não localizado.'}, 'status_code': status.HTTP_404_NOT_FOUND}

        for field, model_attr in [
            ('make', 'marca'),
            ('model', 'modelo'),
            ('color', 'cor'),
            ('category', 'categoria'),
            ('institution', 'ministerio_instituicao'),
            ('institutionAcronym', 'sigla_instituicao'),
            ('department', 'departamento_direcao'),
            ('responsibleOfficer', 'funcionario_responsavel'),
            ('officerRole', 'funcionario_cargo'),
            ('officerContact', 'funcionario_contacto'),
            ('fuelType', 'tipo_combustivel'),
            ('status', 'status'),
            ('chassisNumber', 'numero_chassi'),
            ('assignmentDate', 'data_afetacao'),
            ('notes', 'observacoes'),
        ]:
            if field in payload:
                setattr(veiculo, model_attr, str(payload[field]).strip())

        if 'year' in payload and payload['year'] is not None:
            veiculo.ano = int(payload['year'])
        if 'currentMileage' in payload and payload['currentMileage'] is not None:
            veiculo.quilometragem_atual = int(payload['currentMileage'])
        if 'tankCapacity' in payload and payload['tankCapacity'] is not None:
            veiculo.capacidade_tanque = int(payload['tankCapacity'])

        veiculo.save()
        return {'data': VeiculoPublicoSerializer(veiculo).data, 'status_code': status.HTTP_200_OK}

    @staticmethod
    def delete_public_vehicle(code: str) -> dict:
        ensure_seed_data()
        deleted, _ = VeiculoPublico.objects.filter(
            Q(codigo__iexact=code.strip()) | Q(placa__iexact=code.strip())
        ).delete()
        if not deleted:
            return {'data': {'error': 'Veículo não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}
        return {'data': None, 'status_code': status.HTTP_204_NO_CONTENT}

    # --------------------------------------------------------------------------
    # 2. Histórico de Utilização / Missões
    # --------------------------------------------------------------------------
    @staticmethod
    def list_missions(plate: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = UtilizacaoVeiculoPublico.objects.all()
        if plate:
            qs = qs.filter(veiculo_placa__iexact=plate.strip())
        if search:
            q = search.strip()
            qs = qs.filter(
                Q(codigo__icontains=q)
                | Q(veiculo_placa__icontains=q)
                | Q(funcionario_nome__icontains=q)
                | Q(motivo_missao__icontains=q)
                | Q(destino__icontains=q)
            )
        return {
            'data': UtilizacaoVeiculoPublicoSerializer(qs, many=True).data,
            'status_code': status.HTTP_200_OK,
        }

    @staticmethod
    def create_mission(payload: dict) -> dict:
        ensure_seed_data()
        codigo = str(payload.get('id', '')).strip() or f"MIS-2026-{str(int(time.time() * 1000))[-4:]}"
        placa = str(payload.get('plate', '')).strip().upper()
        km_saida = int(payload.get('departureKm') or 0)
        km_retorno = int(payload.get('returnKm') or 0)
        km_total = int(payload.get('totalKm') or (km_retorno - km_saida if km_retorno > km_saida else 0))

        mission = UtilizacaoVeiculoPublico.objects.create(
            codigo=codigo,
            veiculo_placa=placa,
            ministerio_instituicao=str(payload.get('institution', 'Ministério dos Transportes')).strip(),
            funcionario_nome=str(payload.get('officerName', 'Condutor de Serviço')).strip(),
            funcionario_matricula=str(payload.get('officerBadge', '')).strip(),
            motivo_missao=str(payload.get('missionPurpose', 'Serviço Oficial')).strip(),
            origem=str(payload.get('origin', 'Bissau')).strip(),
            destino=str(payload.get('destination', 'Bissau e Arredores')).strip(),
            data_saida=str(payload.get('departureDate') or date.today().isoformat()),
            hora_saida=str(payload.get('departureTime', '08:00')).strip(),
            data_retorno=str(payload.get('returnDate', '')).strip(),
            hora_retorno=str(payload.get('returnTime', '18:00')).strip(),
            km_saida=km_saida,
            km_retorno=km_retorno,
            km_percorridos=km_total,
            status=str(payload.get('status', 'Concluída')).strip(),
            observacoes=str(payload.get('notes', '')).strip(),
        )

        # Atualiza a quilometragem atual do veículo se for superior
        if km_retorno > 0 and placa:
            VeiculoPublico.objects.filter(placa__iexact=placa, quilometragem_atual__lt=km_retorno).update(quilometragem_atual=km_retorno)

        return {
            'data': UtilizacaoVeiculoPublicoSerializer(mission).data,
            'status_code': status.HTTP_201_CREATED,
        }

    @staticmethod
    def update_mission(code: str, payload: dict) -> dict:
        ensure_seed_data()
        mission = UtilizacaoVeiculoPublico.objects.filter(codigo__iexact=code.strip()).first()
        if not mission:
            return {'data': {'error': 'Missão não encontrada.'}, 'status_code': status.HTTP_404_NOT_FOUND}

        if 'status' in payload:
            mission.status = str(payload['status']).strip()
        if 'returnKm' in payload and payload['returnKm'] is not None:
            mission.km_retorno = int(payload['returnKm'])
            if mission.km_retorno > mission.km_saida:
                mission.km_percorridos = mission.km_retorno - mission.km_saida
                VeiculoPublico.objects.filter(placa__iexact=mission.veiculo_placa, quilometragem_atual__lt=mission.km_retorno).update(quilometragem_atual=mission.km_retorno)
        if 'returnDate' in payload:
            mission.data_retorno = str(payload['returnDate']).strip()
        if 'notes' in payload:
            mission.observacoes = str(payload['notes']).strip()

        mission.save()
        return {'data': UtilizacaoVeiculoPublicoSerializer(mission).data, 'status_code': status.HTTP_200_OK}

    @staticmethod
    def delete_mission(code: str) -> dict:
        ensure_seed_data()
        deleted, _ = UtilizacaoVeiculoPublico.objects.filter(codigo__iexact=code.strip()).delete()
        if not deleted:
            return {'data': {'error': 'Missão não encontrada.'}, 'status_code': status.HTTP_404_NOT_FOUND}
        return {'data': None, 'status_code': status.HTTP_204_NO_CONTENT}

    # --------------------------------------------------------------------------
    # 3. Consumo de Combustível
    # --------------------------------------------------------------------------
    @staticmethod
    def list_fuel_logs(plate: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = AbastecimentoFrota.objects.all()
        if plate:
            qs = qs.filter(veiculo_placa__iexact=plate.strip())
        if search:
            q = search.strip()
            qs = qs.filter(
                Q(codigo__icontains=q)
                | Q(veiculo_placa__icontains=q)
                | Q(funcionario_condutor__icontains=q)
                | Q(posto_combustivel__icontains=q)
                | Q(numero_talao__icontains=q)
            )
        return {
            'data': AbastecimentoFrotaSerializer(qs, many=True).data,
            'status_code': status.HTTP_200_OK,
        }

    @staticmethod
    def create_fuel_log(payload: dict) -> dict:
        ensure_seed_data()
        codigo = str(payload.get('id', '')).strip() or f"ABS-2026-{str(int(time.time() * 1000))[-4:]}"
        placa = str(payload.get('plate', '')).strip().upper()
        litros = float(payload.get('liters') or 0.0)
        preco = int(payload.get('unitPrice') or 950)
        total = int(payload.get('totalAmount') or round(litros * preco))

        abast = AbastecimentoFrota.objects.create(
            codigo=codigo,
            veiculo_placa=placa,
            ministerio_instituicao=str(payload.get('institution', 'Ministério dos Transportes')).strip(),
            funcionario_condutor=str(payload.get('driverName', 'Condutor')).strip(),
            data_abastecimento=str(payload.get('date') or date.today().isoformat()),
            posto_combustivel=str(payload.get('station', 'Petroguin - Luanda')).strip(),
            tipo_combustivel=str(payload.get('fuelType', 'Gasóleo')).strip(),
            quantidade_litros=litros,
            preco_por_litro=preco,
            valor_total=total,
            km_momento=int(payload.get('mileageAtFuel') or 0),
            numero_talao=str(payload.get('voucherNumber', '')).strip(),
        )
        return {
            'data': AbastecimentoFrotaSerializer(abast).data,
            'status_code': status.HTTP_201_CREATED,
        }

    @staticmethod
    def delete_fuel_log(code: str) -> dict:
        ensure_seed_data()
        deleted, _ = AbastecimentoFrota.objects.filter(codigo__iexact=code.strip()).delete()
        if not deleted:
            return {'data': {'error': 'Registo não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}
        return {'data': None, 'status_code': status.HTTP_204_NO_CONTENT}

    # --------------------------------------------------------------------------
    # 4. Manutenção e Reparações
    # --------------------------------------------------------------------------
    @staticmethod
    def list_maintenances(plate: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = ManutencaoFrota.objects.all()
        if plate:
            qs = qs.filter(veiculo_placa__iexact=plate.strip())
        if search:
            q = search.strip()
            qs = qs.filter(
                Q(codigo__icontains=q)
                | Q(veiculo_placa__icontains=q)
                | Q(tipo_manutencao__icontains=q)
                | Q(oficina_prestador__icontains=q)
                | Q(descricao_servico__icontains=q)
            )
        return {
            'data': ManutencaoFrotaSerializer(qs, many=True).data,
            'status_code': status.HTTP_200_OK,
        }

    @staticmethod
    def create_maintenance(payload: dict) -> dict:
        ensure_seed_data()
        codigo = str(payload.get('id', '')).strip() or f"MAN-2026-{str(int(time.time() * 1000))[-4:]}"
        placa = str(payload.get('plate', '')).strip().upper()
        custo = int(payload.get('totalCost') or 0)

        manut = ManutencaoFrota.objects.create(
            codigo=codigo,
            veiculo_placa=placa,
            ministerio_instituicao=str(payload.get('institution', 'Ministério dos Transportes')).strip(),
            tipo_manutencao=str(payload.get('maintenanceType', 'Preventiva / Revisão Periódica')).strip(),
            oficina_prestador=str(payload.get('garage', 'Garagem Central do Estado')).strip(),
            data_entrada=str(payload.get('entryDate') or date.today().isoformat()),
            data_conclusao=str(payload.get('completionDate', '')).strip(),
            km_manutencao=int(payload.get('mileageAtService') or 0),
            descricao_servico=str(payload.get('serviceDescription', '')).strip(),
            pecas_substituidas=str(payload.get('partsReplaced', '')).strip(),
            custo_total=custo,
            status=str(payload.get('status', 'Concluída')).strip(),
        )
        return {
            'data': ManutencaoFrotaSerializer(manut).data,
            'status_code': status.HTTP_201_CREATED,
        }

    @staticmethod
    def update_maintenance(code: str, payload: dict) -> dict:
        ensure_seed_data()
        manut = ManutencaoFrota.objects.filter(codigo__iexact=code.strip()).first()
        if not manut:
            return {'data': {'error': 'Registo de manutenção não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}

        if 'status' in payload:
            manut.status = str(payload['status']).strip()
        if 'completionDate' in payload:
            manut.data_conclusao = str(payload['completionDate']).strip()
        if 'totalCost' in payload and payload['totalCost'] is not None:
            manut.custo_total = int(payload['totalCost'])
        if 'serviceDescription' in payload:
            manut.descricao_servico = str(payload['serviceDescription']).strip()
        if 'partsReplaced' in payload:
            manut.pecas_substituidas = str(payload['partsReplaced']).strip()

        manut.save()
        return {'data': ManutencaoFrotaSerializer(manut).data, 'status_code': status.HTTP_200_OK}

    @staticmethod
    def delete_maintenance(code: str) -> dict:
        ensure_seed_data()
        deleted, _ = ManutencaoFrota.objects.filter(codigo__iexact=code.strip()).delete()
        if not deleted:
            return {'data': {'error': 'Registo não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}
        return {'data': None, 'status_code': status.HTTP_204_NO_CONTENT}

    # --------------------------------------------------------------------------
    # 5. Controlo de Despesas Globais e Agregação
    # --------------------------------------------------------------------------
    @staticmethod
    def get_fleet_expenses() -> dict:
        ensure_seed_data()
        total_fuel = AbastecimentoFrota.objects.aggregate(total=Sum('valor_total'))['total'] or 0
        total_maintenance = ManutencaoFrota.objects.aggregate(total=Sum('custo_total'))['total'] or 0
        total_overall = total_fuel + total_maintenance

        # Agrupamento de despesas por ministério
        by_ministry = {}
        for ab in AbastecimentoFrota.objects.all():
            m = ab.ministerio_instituicao or 'Outros Organismos'
            if m not in by_ministry:
                by_ministry[m] = {'institution': m, 'fuelCost': 0, 'maintenanceCost': 0, 'total': 0, 'vehiclesCount': 0}
            by_ministry[m]['fuelCost'] += ab.valor_total
            by_ministry[m]['total'] += ab.valor_total

        for mn in ManutencaoFrota.objects.all():
            m = mn.ministerio_instituicao or 'Outros Organismos'
            if m not in by_ministry:
                by_ministry[m] = {'institution': m, 'fuelCost': 0, 'maintenanceCost': 0, 'total': 0, 'vehiclesCount': 0}
            by_ministry[m]['maintenanceCost'] += mn.custo_total
            by_ministry[m]['total'] += mn.custo_total

        for v in VeiculoPublico.objects.all():
            m = v.ministerio_instituicao or 'Outros Organismos'
            if m in by_ministry:
                by_ministry[m]['vehiclesCount'] += 1

        return {
            'data': {
                'totalExpenses': total_overall,
                'totalFuel': total_fuel,
                'totalMaintenance': total_maintenance,
                'byMinistry': sorted(list(by_ministry.values()), key=lambda x: x['total'], reverse=True),
            },
            'status_code': status.HTTP_200_OK,
        }


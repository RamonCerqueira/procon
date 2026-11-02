import time
from django.db import transaction
from django.db.models import Q
from rest_framework import status

from ..models import Veiculo, OcorrenciaVeicular
from ..serializers import VeiculoSerializer, OcorrenciaVeicularSerializer
from ..seed import ensure_seed_data


class VehicleStatusController:
    """
    Controller responsável por:
    1. Veículos apreendidos, roubados ou recuperados
    2. Cancelamento de matrícula e baixa definitiva
    (Arquitetura MVC - Tabelas 'ocorrencias_veiculares' e 'veiculos')
    """

    EVENT_TO_STATUS = {
        'Apreensão de Veículo': 'Apreendido',
        'Roubo / Furto': 'Roubado / Furtado',
        'Recuperação / Restituição': 'Recuperado',
        'Liberação / Regularização': 'Regular',
        'Cancelamento de Matrícula': 'Cancelado / Baixa Definitiva',
        'Baixa Definitiva': 'Cancelado / Baixa Definitiva',
    }

    @staticmethod
    def list_occurrences(plate: str = '', search: str = '', category: str = '') -> dict:
        ensure_seed_data()
        qs = OcorrenciaVeicular.objects.all()

        clean_plate = (plate or '').strip().upper()
        if clean_plate:
            qs = qs.filter(placa__iexact=clean_plate)

        clean_category = (category or '').strip()
        if clean_category:
            qs = qs.filter(categoria_registo__iexact=clean_category)

        search = (search or '').strip()
        if search:
            qs = qs.filter(
                Q(codigo__icontains=search) |
                Q(placa__icontains=search) |
                Q(veiculo_descricao__icontains=search) |
                Q(proprietario__icontains=search) |
                Q(tipo_evento__icontains=search) |
                Q(situacao_resultante__icontains=search) |
                Q(motivo__icontains=search) |
                Q(autoridade_orgao__icontains=search) |
                Q(numero_processo__icontains=search) |
                Q(local_deposito__icontains=search)
            )

        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': OcorrenciaVeicularSerializer(qs, many=True).data
        }

    @staticmethod
    def register_occurrence(data: dict) -> dict:
        ensure_seed_data()
        placa = str(data.get('plate') or data.get('placa') or '').strip().upper()
        tipo_evento = str(data.get('eventType') or data.get('tipo_evento') or '').strip()
        motivo = str(data.get('reason') or data.get('motivo') or '').strip()
        autoridade_orgao = str(data.get('authority') or data.get('autoridade_orgao') or '').strip()
        numero_processo = str(data.get('processNumber') or data.get('numero_processo') or '').strip()
        local_deposito = str(data.get('location') or data.get('local_deposito') or '').strip()
        data_evento = str(data.get('date') or data.get('data_evento') or '').strip()
        observacoes = str(data.get('notes') or data.get('observacoes') or '').strip()

        if not placa:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Informe a matrícula do veículo.'}
            }

        if not tipo_evento or not motivo:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Informe o tipo de evento e o motivo / enquadramento.'}
            }

        veiculo = Veiculo.objects.filter(placa__iexact=placa).first()
        if not veiculo:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': f'Veículo com matrícula "{placa}" não encontrado.'}
            }

        is_writeoff = tipo_evento in ('Cancelamento de Matrícula', 'Baixa Definitiva') or (
            str(data.get('recordCategory') or data.get('categoria_registo') or '') == 'Cancelamento e Baixa Definitiva'
        )
        categoria_registo = (
            'Cancelamento e Baixa Definitiva'
            if is_writeoff
            else 'Ocorrência Policial / Fiscalização'
        )

        situacao_resultante = (
            str(data.get('resultingStatus') or data.get('situacao_resultante') or '').strip()
            or VehicleStatusController.EVENT_TO_STATUS.get(tipo_evento, 'Apreendido')
        )

        prefix = 'BXA' if is_writeoff else 'OCO'
        codigo = str(data.get('id') or data.get('codigo') or '').strip()
        if not codigo:
            codigo = f"{prefix}-2026-{str(int(time.time() * 1000))[-4:]}"

        if not data_evento:
            from django.utils import timezone
            data_evento = timezone.now().strftime('%Y-%m-%d')

        with transaction.atomic():
            registo = OcorrenciaVeicular.objects.create(
                codigo=codigo,
                placa=veiculo.placa,
                veiculo_descricao=f"{veiculo.marca} {veiculo.modelo} ({veiculo.ano}) · {veiculo.cor}",
                proprietario=veiculo.proprietario,
                categoria_registo=categoria_registo,
                tipo_evento=tipo_evento,
                situacao_resultante=situacao_resultante,
                motivo=motivo,
                autoridade_orgao=autoridade_orgao,
                numero_processo=numero_processo,
                local_deposito=local_deposito,
                data_evento=data_evento,
                observacoes=observacoes,
            )

            veiculo.situacao_legal = situacao_resultante
            veiculo.save()

        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': {
                'occurrence': OcorrenciaVeicularSerializer(registo).data,
                'vehicle': VeiculoSerializer(veiculo).data,
            }
        }

    @staticmethod
    def delete_occurrence(code: str) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        obj = OcorrenciaVeicular.objects.filter(codigo__iexact=clean_code).first()
        if not obj:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Registo de ocorrência/baixa não encontrado.'}
            }
        obj.delete()
        return {
            'success': True,
            'status_code': status.HTTP_204_NO_CONTENT,
            'data': None
        }


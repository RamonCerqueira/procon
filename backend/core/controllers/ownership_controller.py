import time
from datetime import datetime
from django.db import transaction
from django.db.models import Q
from rest_framework import status

from ..models import Veiculo, HistoricoProprietario
from ..serializers import VeiculoSerializer, HistoricoProprietarioSerializer
from ..seed import ensure_seed_data


class OwnershipController:
    """
    Controller responsável pela Transferência de Propriedade de Veículos e Consulta do
    Histórico de Proprietários (Arquitetura MVC).
    Grava o histórico na tabela 'historico_proprietarios' e atualiza o titular na tabela 'veiculos'.
    """

    @staticmethod
    def list_history(plate: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = HistoricoProprietario.objects.all()
        plate = (plate or '').strip()
        search = (search or '').strip()

        if plate:
            qs = qs.filter(placa__iexact=plate)
        if search:
            qs = qs.filter(
                Q(placa__icontains=search) |
                Q(proprietario_anterior__icontains=search) |
                Q(novo_proprietario__icontains=search) |
                Q(documento_novo__icontains=search) |
                Q(documento_anterior__icontains=search) |
                Q(codigo__icontains=search)
            )

        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': HistoricoProprietarioSerializer(qs, many=True).data
        }

    @staticmethod
    def transfer_ownership(data: dict) -> dict:
        ensure_seed_data()
        placa = str(data.get('plate') or data.get('placa') or '').strip().upper()
        novo_proprietario = str(data.get('newOwner') or data.get('novo_proprietario') or '').strip()
        documento_novo = str(data.get('newDocument') or data.get('documento_novo') or '').strip()
        documento_anterior = str(data.get('previousDocument') or data.get('documento_anterior') or '').strip()
        novo_condutor = str(data.get('newDriver') or data.get('novo_condutor') or '').strip()
        distrito = str(data.get('district') or data.get('distrito') or '').strip()
        data_transferencia = str(data.get('transferDate') or data.get('data_transferencia') or datetime.now().strftime('%Y-%m-%d')).strip()
        motivo = str(data.get('reason') or data.get('motivo') or 'Compra e venda').strip()
        observacoes = str(data.get('notes') or data.get('observacoes') or '').strip()

        if not placa or not novo_proprietario:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Informe a matrícula do veículo e o nome do novo proprietário.'}
            }

        veiculo = Veiculo.objects.filter(placa__iexact=placa).first()
        if not veiculo:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Veículo não encontrado para a matrícula informada.'}
            }

        proprietario_anterior = veiculo.proprietario
        if proprietario_anterior.strip().lower() == novo_proprietario.lower():
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'O novo proprietário deve ser diferente do proprietário atual.'}
            }

        codigo = str(data.get('id') or f"TRF-{datetime.now().year}-{str(int(time.time() * 1000))[-4:]}").strip()
        while HistoricoProprietario.objects.filter(codigo__iexact=codigo).exists():
            codigo = f"TRF-{datetime.now().year}-{str(int(time.time() * 1000))[-4:]}"

        veiculo_descricao = f"{veiculo.marca} {veiculo.modelo} ({veiculo.ano})"
        distrito_final = distrito or veiculo.distrito
        condutor_final = novo_condutor if 'newDriver' in data else novo_proprietario

        with transaction.atomic():
            historico = HistoricoProprietario.objects.create(
                codigo=codigo,
                placa=veiculo.placa,
                veiculo_descricao=veiculo_descricao,
                proprietario_anterior=proprietario_anterior,
                documento_anterior=documento_anterior,
                novo_proprietario=novo_proprietario,
                documento_novo=documento_novo,
                novo_condutor=condutor_final,
                distrito=distrito_final,
                data_transferencia=data_transferencia,
                motivo=motivo,
                observacoes=observacoes,
            )

            veiculo.proprietario = novo_proprietario
            if condutor_final:
                veiculo.condutor = condutor_final
            if distrito_final:
                veiculo.distrito = distrito_final
            veiculo.save()

        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': {
                'transfer': HistoricoProprietarioSerializer(historico).data,
                'vehicle': VeiculoSerializer(veiculo).data,
            }
        }


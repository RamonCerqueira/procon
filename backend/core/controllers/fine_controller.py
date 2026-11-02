import time
from datetime import datetime
from rest_framework import status

from ..models import Multa, Veiculo
from ..serializers import MultaSerializer
from ..seed import ensure_seed_data


class FineController:
    """
    Controller responsável pelas regras de negócio de Multas e Infrações (Arquitetura MVC).
    Persiste e atualiza autos de infração na tabela 'multas' do banco PostgreSQL 'procon'.
    """

    @staticmethod
    def list_fines() -> dict:
        ensure_seed_data()
        qs = Multa.objects.all()
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': MultaSerializer(qs, many=True).data
        }

    @staticmethod
    def create_fine(data: dict) -> dict:
        ensure_seed_data()
        placa = str(data.get('plate') or data.get('placa') or '').strip().upper()
        infracao = str(data.get('infraction') or data.get('infracao') or '').strip()
        data_str = str(data.get('date') or data.get('data') or datetime.now().strftime('%Y-%m-%d')).strip()
        status_multa = str(data.get('status') or 'Pendente').strip()

        veiculo = Veiculo.objects.filter(placa__iexact=placa).first()
        if not veiculo:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Veículo não encontrado para a matrícula informada.'}
            }

        try:
            valor = int(data.get('amount') or data.get('valor') or 0)
        except (ValueError, TypeError):
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Informe um valor válido para a multa.'}
            }

        condutor_ou_dono = str(data.get('driver') or veiculo.condutor or veiculo.proprietario or '').strip()
        codigo = str(data.get('id') or f"GB-{datetime.now().year}-{str(int(time.time() * 1000))[-5:]}").strip()
        while Multa.objects.filter(codigo__iexact=codigo).exists():
            codigo = f"GB-{datetime.now().year}-{str(int(time.time() * 1000))[-5:]}"

        multa = Multa.objects.create(
            codigo=codigo,
            placa=veiculo.placa,
            condutor=condutor_ou_dono,
            infracao=infracao,
            valor=valor,
            data=data_str,
            status=status_multa,
        )

        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': MultaSerializer(multa).data
        }

    @staticmethod
    def update_fine(code: str, data: dict) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        multa = Multa.objects.filter(codigo__iexact=clean_code).first()
        if not multa:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Auto de infração não encontrado.'}
            }
        if 'status' in data:
            multa.status = str(data.get('status') or multa.status).strip()
        if 'amount' in data or 'valor' in data:
            multa.valor = int(data.get('amount') or data.get('valor') or multa.valor)
        if 'infraction' in data or 'infracao' in data:
            multa.infracao = str(data.get('infraction') or data.get('infracao') or multa.infracao).strip()
        multa.save()
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': MultaSerializer(multa).data
        }

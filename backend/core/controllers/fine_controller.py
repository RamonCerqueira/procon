import time
from datetime import datetime
from rest_framework import status

from ..models import Fine, Vehicle
from ..serializers import FineSerializer
from ..seed import ensure_seed_data


class FineController:
    """
    Controller responsável pelas regras de negócio de Multas e Infrações (Arquitetura MVC).
    Persiste e atualiza autos de infração na tabela 'fines' do banco PostgreSQL 'procon'.
    """

    @staticmethod
    def list_fines() -> dict:
        ensure_seed_data()
        qs = Fine.objects.all()
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': FineSerializer(qs, many=True).data
        }

    @staticmethod
    def create_fine(data: dict) -> dict:
        ensure_seed_data()
        plate = str(data.get('plate') or '').strip().upper()
        infraction = str(data.get('infraction') or '').strip()
        date_str = str(data.get('date') or datetime.now().strftime('%Y-%m-%d')).strip()
        fine_status = str(data.get('status') or 'Pendente').strip()

        vehicle = Vehicle.objects.filter(plate__iexact=plate).first()
        if not vehicle:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Veículo não encontrado para a matrícula informada.'}
            }

        try:
            amount = int(data.get('amount') or 0)
        except (ValueError, TypeError):
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Informe um valor válido para a multa.'}
            }

        driver_or_owner = str(data.get('driver') or vehicle.driver or vehicle.owner or '').strip()
        code = str(data.get('id') or f"GB-{datetime.now().year}-{str(int(time.time() * 1000))[-5:]}").strip()
        while Fine.objects.filter(code__iexact=code).exists():
            code = f"GB-{datetime.now().year}-{str(int(time.time() * 1000))[-5:]}"

        fine = Fine.objects.create(
            code=code,
            plate=vehicle.plate,
            driver=driver_or_owner,
            infraction=infraction,
            amount=amount,
            date=date_str,
            status=fine_status,
        )

        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': FineSerializer(fine).data
        }

    @staticmethod
    def update_fine(code: str, data: dict) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        fine = Fine.objects.filter(code__iexact=clean_code).first()
        if not fine:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Auto de infração não encontrado.'}
            }
        if 'status' in data:
            fine.status = str(data.get('status') or fine.status).strip()
        if 'amount' in data:
            fine.amount = int(data.get('amount') or fine.amount)
        if 'infraction' in data:
            fine.infraction = str(data.get('infraction') or fine.infraction).strip()
        fine.save()
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': FineSerializer(fine).data
        }


import time
from rest_framework import status

from ..models import InfractionType
from ..serializers import InfractionTypeSerializer
from ..seed import ensure_seed_data


class InfractionController:
    """
    Controller responsável pelas regras de negócio da Tabela de Infrações e Preços (Arquitetura MVC).
    Persiste, edita e remove tipos de infração na tabela 'infraction_types' do banco PostgreSQL 'procon'.
    """

    @staticmethod
    def list_infractions() -> dict:
        ensure_seed_data()
        qs = InfractionType.objects.all()
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': InfractionTypeSerializer(qs, many=True).data
        }

    @staticmethod
    def create_infraction(data: dict) -> dict:
        ensure_seed_data()
        name = str(data.get('name') or '').strip()
        severity = str(data.get('severity') or 'Média').strip()
        description = str(data.get('description') or '').strip()

        try:
            amount = int(data.get('amount') or 0)
        except (ValueError, TypeError):
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Informe um preço (valor em XOF) válido.'}
            }

        if not name or amount <= 0:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Informe a descrição da infração e um valor maior que zero.'}
            }

        if InfractionType.objects.filter(name__iexact=name).exists():
            return {
                'success': False,
                'status_code': status.HTTP_409_CONFLICT,
                'data': {'error': 'Já existe uma infração cadastrada com este nome.'}
            }

        code = str(data.get('id') or f"INF-{str(int(time.time() * 1000))[-4:]}").strip()
        while InfractionType.objects.filter(code__iexact=code).exists():
            code = f"INF-{str(int(time.time() * 1000))[-4:]}"

        obj = InfractionType.objects.create(
            code=code,
            name=name,
            amount=amount,
            severity=severity,
            description=description,
        )

        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': InfractionTypeSerializer(obj).data
        }

    @staticmethod
    def update_infraction(code: str, data: dict) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        obj = InfractionType.objects.filter(code__iexact=clean_code).first()
        if not obj:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Infração não encontrada.'}
            }

        if 'name' in data:
            obj.name = str(data.get('name') or obj.name).strip()
        if 'amount' in data:
            obj.amount = int(data.get('amount') or obj.amount)
        if 'severity' in data:
            obj.severity = str(data.get('severity') or obj.severity).strip()
        if 'description' in data:
            obj.description = str(data.get('description') or '').strip()
        obj.save()

        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': InfractionTypeSerializer(obj).data
        }

    @staticmethod
    def delete_infraction(code: str) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        obj = InfractionType.objects.filter(code__iexact=clean_code).first()
        if not obj:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Infração não encontrada.'}
            }
        obj.delete()
        return {
            'success': True,
            'status_code': status.HTTP_204_NO_CONTENT,
            'data': None
        }


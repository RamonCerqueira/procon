import time
from rest_framework import status

from ..models import TipoInfracao
from ..serializers import TipoInfracaoSerializer
from ..seed import ensure_seed_data


class InfractionController:
    """
    Controller responsável pelas regras de negócio da Tabela de Infrações e Preços (Arquitetura MVC).
    Persiste, edita e remove tipos de infração na tabela 'tipos_infracao' do banco PostgreSQL 'procon'.
    """

    @staticmethod
    def list_infractions() -> dict:
        ensure_seed_data()
        qs = TipoInfracao.objects.all()
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': TipoInfracaoSerializer(qs, many=True).data
        }

    @staticmethod
    def create_infraction(data: dict) -> dict:
        ensure_seed_data()
        nome = str(data.get('name') or data.get('nome') or '').strip()
        gravidade = str(data.get('severity') or data.get('gravidade') or 'Média').strip()
        descricao = str(data.get('description') or data.get('descricao') or '').strip()

        try:
            valor = int(data.get('amount') or data.get('valor') or 0)
        except (ValueError, TypeError):
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Informe um preço (valor em XOF) válido.'}
            }

        if not nome or valor <= 0:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Informe a descrição da infração e um valor maior que zero.'}
            }

        if TipoInfracao.objects.filter(nome__iexact=nome).exists():
            return {
                'success': False,
                'status_code': status.HTTP_409_CONFLICT,
                'data': {'error': 'Já existe uma infração cadastrada com este nome.'}
            }

        codigo = str(data.get('id') or data.get('codigo') or f"INF-{str(int(time.time() * 1000))[-4:]}").strip()
        while TipoInfracao.objects.filter(codigo__iexact=codigo).exists():
            codigo = f"INF-{str(int(time.time() * 1000))[-4:]}"

        obj = TipoInfracao.objects.create(
            codigo=codigo,
            nome=nome,
            valor=valor,
            gravidade=gravidade,
            descricao=descricao,
        )

        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': TipoInfracaoSerializer(obj).data
        }

    @staticmethod
    def update_infraction(code: str, data: dict) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        obj = TipoInfracao.objects.filter(codigo__iexact=clean_code).first()
        if not obj:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Infração não encontrada.'}
            }

        if 'name' in data or 'nome' in data:
            obj.nome = str(data.get('name') or data.get('nome') or obj.nome).strip()
        if 'amount' in data or 'valor' in data:
            obj.valor = int(data.get('amount') or data.get('valor') or obj.valor)
        if 'severity' in data or 'gravidade' in data:
            obj.gravidade = str(data.get('severity') or data.get('gravidade') or obj.gravidade).strip()
        if 'description' in data or 'descricao' in data:
            obj.descricao = str(data.get('description') or data.get('descricao') or '').strip()
        obj.save()

        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': TipoInfracaoSerializer(obj).data
        }

    @staticmethod
    def delete_infraction(code: str) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        obj = TipoInfracao.objects.filter(codigo__iexact=clean_code).first()
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

import time
from datetime import datetime
from django.db import transaction
from rest_framework import status

from ..models import Multa, RecursoMulta, AgenteFiscalizador, TipoInfracao, Veiculo
from ..serializers import MultaSerializer, RecursoMultaSerializer, AgenteFiscalizadorSerializer
from ..seed import ensure_seed_data


class FineController:
    """
    Controller responsável pela Gestão de Multas e Infrações (Arquitetura MVC):
    - Emissão de auto de infração ('multas')
    - Fotografias e provas
    - Identificação do agente fiscalizador ('agentes_fiscalizadores')
    - Pagamento e comprovativos
    - Recursos e contestações ('recursos_multas')
    - Histórico de reincidência
    - Bloqueio administrativo quando legalmente autorizado
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

        tipo_inf = TipoInfracao.objects.filter(nome__iexact=infracao).first()
        gravidade = str(data.get('severity') or data.get('gravidade') or (tipo_inf.gravidade if tipo_inf else 'Média')).strip()
        agente_nome = str(data.get('agentName') or data.get('agente_nome') or 'Sargento Braima Baldé · Brigada de Trânsito').strip()
        agente_matricula = str(data.get('agentBadge') or data.get('agente_matricula') or 'AG-BT-104').strip()
        local_infracao = str(data.get('location') or data.get('local_infracao') or veiculo.distrito or 'Bissau').strip()
        arquivo_prova = data.get('evidenceFile', data.get('arquivo_prova'))
        descricao_prova = str(data.get('evidenceDescription') or data.get('descricao_prova') or '').strip()
        bloqueio_administrativo = bool(data.get('administrativeBlock', data.get('bloqueio_administrativo', False)))
        motivo_bloqueio = str(data.get('blockReason') or data.get('motivo_bloqueio') or '').strip()

        condutor_ou_dono = str(data.get('driver') or veiculo.condutor or veiculo.proprietario or '').strip()
        codigo = str(data.get('id') or f"GB-{datetime.now().year}-{str(int(time.time() * 1000))[-5:]}").strip()
        while Multa.objects.filter(codigo__iexact=codigo).exists():
            codigo = f"GB-{datetime.now().year}-{str(int(time.time() * 1000))[-5:]}"

        multa = Multa.objects.create(
            codigo=codigo,
            placa=veiculo.placa,
            condutor=condutor_ou_dono,
            infracao=infracao,
            gravidade=gravidade,
            valor=valor,
            data=data_str,
            status=status_multa,
            agente_nome=agente_nome,
            agente_matricula=agente_matricula,
            local_infracao=local_infracao,
            arquivo_prova=arquivo_prova,
            descricao_prova=descricao_prova,
            bloqueio_administrativo=bloqueio_administrativo,
            motivo_bloqueio=motivo_bloqueio,
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
            if multa.status == 'Pago' and not multa.comprovativo_pagamento:
                multa.comprovativo_pagamento = str(data.get('paymentReceipt') or f"REC-{datetime.now().year}-{str(int(time.time() * 1000))[-5:]}")
                multa.data_pagamento = str(data.get('paymentDate') or datetime.now().strftime('%Y-%m-%d'))
                multa.metodo_pagamento = str(data.get('paymentMethod') or 'Pagamento na Tesouraria / Multibanco')
                multa.bloqueio_administrativo = False
        if 'amount' in data or 'valor' in data:
            multa.valor = int(data.get('amount') or data.get('valor') or multa.valor)
        if 'infraction' in data or 'infracao' in data:
            multa.infracao = str(data.get('infraction') or data.get('infracao') or multa.infracao).strip()
        if 'severity' in data or 'gravidade' in data:
            multa.gravidade = str(data.get('severity') or data.get('gravidade') or multa.gravidade).strip()
        if 'agentName' in data or 'agente_nome' in data:
            multa.agente_nome = str(data.get('agentName') or data.get('agente_nome') or multa.agente_nome).strip()
        if 'agentBadge' in data or 'agente_matricula' in data:
            multa.agente_matricula = str(data.get('agentBadge') or data.get('agente_matricula') or multa.agente_matricula).strip()
        if 'location' in data or 'local_infracao' in data:
            multa.local_infracao = str(data.get('location') or data.get('local_infracao') or multa.local_infracao).strip()
        if 'evidenceFile' in data and data.get('evidenceFile') is not None:
            multa.arquivo_prova = data.get('evidenceFile')
        if 'evidenceDescription' in data or 'descricao_prova' in data:
            multa.descricao_prova = str(data.get('evidenceDescription') or data.get('descricao_prova') or multa.descricao_prova).strip()
        if 'paymentReceipt' in data or 'comprovativo_pagamento' in data:
            multa.comprovativo_pagamento = str(data.get('paymentReceipt') or data.get('comprovativo_pagamento') or multa.comprovativo_pagamento).strip()
        if 'paymentDate' in data or 'data_pagamento' in data:
            multa.data_pagamento = str(data.get('paymentDate') or data.get('data_pagamento') or multa.data_pagamento).strip()
        if 'paymentMethod' in data or 'metodo_pagamento' in data:
            multa.metodo_pagamento = str(data.get('paymentMethod') or data.get('metodo_pagamento') or multa.metodo_pagamento).strip()
        if 'administrativeBlock' in data or 'bloqueio_administrativo' in data:
            val = data.get('administrativeBlock') if 'administrativeBlock' in data else data.get('bloqueio_administrativo')
            multa.bloqueio_administrativo = bool(val)
        if 'blockReason' in data or 'motivo_bloqueio' in data:
            multa.motivo_bloqueio = str(data.get('blockReason') if 'blockReason' in data else data.get('motivo_bloqueio') or '').strip()

        multa.save()
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': MultaSerializer(multa).data
        }

    # ==========================================================================
    # Recursos e Contestações ('recursos_multas')
    # ==========================================================================

    @staticmethod
    def list_appeals() -> dict:
        ensure_seed_data()
        qs = RecursoMulta.objects.all()
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': RecursoMultaSerializer(qs, many=True).data
        }

    @staticmethod
    def create_appeal(data: dict) -> dict:
        ensure_seed_data()
        auto_codigo = str(data.get('fineId') or data.get('auto_codigo') or '').strip()
        multa = Multa.objects.filter(codigo__iexact=auto_codigo).first()
        if not multa:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Auto de infração não encontrado para vincular o recurso.'}
            }
        codigo = str(data.get('id') or data.get('codigo') or f"REC-ADM-{datetime.now().year}-{str(int(time.time() * 1000))[-4:]}").strip()
        recorrente = str(data.get('appellant') or data.get('recorrente') or multa.condutor or '').strip()
        fundamentacao = str(data.get('grounds') or data.get('fundamentacao') or '').strip()
        data_submissao = str(data.get('submissionDate') or data.get('data_submissao') or datetime.now().strftime('%Y-%m-%d')).strip()
        decisao = str(data.get('decision') or data.get('decisao') or 'Em análise').strip()
        parecer_autoridade = str(data.get('authorityNotes') or data.get('parecer_autoridade') or '').strip()

        if not fundamentacao:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Informe a fundamentação / alegações da contestação.'}
            }

        recurso = RecursoMulta.objects.create(
            codigo=codigo,
            auto_codigo=multa.codigo,
            placa=multa.placa,
            recorrente=recorrente,
            fundamentacao=fundamentacao,
            data_submissao=data_submissao,
            decisao=decisao,
            parecer_autoridade=parecer_autoridade,
        )
        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': RecursoMultaSerializer(recurso).data
        }

    @staticmethod
    def update_appeal(code: str, data: dict) -> dict:
        ensure_seed_data()
        recurso = RecursoMulta.objects.filter(codigo__iexact=(code or '').strip()).first()
        if not recurso:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Recurso não encontrado.'}
            }
        with transaction.atomic():
            if 'decision' in data or 'decisao' in data:
                recurso.decisao = str(data.get('decision') or data.get('decisao') or recurso.decisao).strip()
            if 'authorityNotes' in data or 'parecer_autoridade' in data:
                recurso.parecer_autoridade = str(data.get('authorityNotes') or data.get('parecer_autoridade') or recurso.parecer_autoridade).strip()
            recurso.save()

            if 'Deferido' in recurso.decisao:
                multa = Multa.objects.filter(codigo__iexact=recurso.auto_codigo).first()
                if multa:
                    multa.status = 'Anulado'
                    multa.bloqueio_administrativo = False
                    multa.save()

        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': RecursoMultaSerializer(recurso).data
        }

    # ==========================================================================
    # Agentes Fiscalizadores ('agentes_fiscalizadores')
    # ==========================================================================

    @staticmethod
    def list_agents() -> dict:
        ensure_seed_data()
        qs = AgenteFiscalizador.objects.all()
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': AgenteFiscalizadorSerializer(qs, many=True).data
        }

    @staticmethod
    def create_agent(data: dict) -> dict:
        ensure_seed_data()
        codigo = str(data.get('id') or data.get('codigo') or f"AG-BT-{str(int(time.time() * 1000))[-3:]}").strip().upper()
        nome = str(data.get('name') or data.get('nome') or '').strip()
        corporacao = str(data.get('corps') or data.get('corporacao') or 'Brigada Nacional de Trânsito').strip()
        posto_patente = str(data.get('rank') or data.get('posto_patente') or 'Subinspetor de Trânsito').strip()
        delegacao = str(data.get('office') or data.get('delegacao') or 'Bissau').strip()
        telefone = str(data.get('phone') or data.get('telefone') or '').strip()
        agent_status = str(data.get('status') or 'Ativo').strip()

        if not nome:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Informe o nome completo do agente fiscalizador.'}
            }

        agente = AgenteFiscalizador.objects.create(
            codigo=codigo,
            nome=nome,
            corporacao=corporacao,
            posto_patente=posto_patente,
            delegacao=delegacao,
            telefone=telefone,
            status=agent_status,
        )
        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': AgenteFiscalizadorSerializer(agente).data
        }

    @staticmethod
    def delete_agent(code: str) -> dict:
        ensure_seed_data()
        obj = AgenteFiscalizador.objects.filter(codigo__iexact=(code or '').strip()).first()
        if not obj:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Agente não encontrado.'}
            }
        obj.delete()
        return {
            'success': True,
            'status_code': status.HTTP_204_NO_CONTENT,
            'data': None
        }

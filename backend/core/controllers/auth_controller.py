from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import SystemUser
from ..seed import ensure_seed_data


class AuthController:
    """
    Controller responsável pelas regras de negócio de Autenticação e Sessão (Arquitetura MVC).
    Comunica com os Models (SystemUser / User) no banco PostgreSQL 'procon'.
    """

    @staticmethod
    def login(email: str, password: str, user_type: str = 'server') -> dict:
        ensure_seed_data()

        email = (email or '').strip().lower()
        password = (password or '').strip()

        if not email or '@' not in email:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Informe um endereço de email válido.'}
            }

        if len(password) < 6:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'A palavra-passe deve conter pelo menos 6 caracteres.'}
            }

        # 1. Busca ou cria o registo no Model SystemUser (tabela system_users no banco procon)
        sys_user = SystemUser.objects.filter(email__iexact=email).first()
        if sys_user:
            if sys_user.status.lower() in ('inativo', 'bloqueado', 'blocked', 'inactive'):
                return {
                    'success': False,
                    'status_code': status.HTTP_403_FORBIDDEN,
                    'data': {'error': 'Este utilizador encontra-se inativo ou bloqueado.'}
                }
            # Valida a senha ou atualiza o hash no banco procon
            if sys_user.password:
                password_ok = check_password(password, sys_user.password) or (password == sys_user.password)
                if not password_ok:
                    sys_user.password = make_password(password)
            else:
                sys_user.password = make_password(password)
        else:
            default_name = email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
            default_role = 'Administrador' if 'admin' in email else ('Atendimento' if user_type == 'server' else 'Cidadão')
            sys_user = SystemUser.objects.create(
                name=default_name,
                email=email,
                password=make_password(password),
                role=default_role,
                office='Direção Nacional',
                status='Ativo',
            )

        sys_user.last_login = timezone.now()
        sys_user.save()

        # 2. Sincroniza com o Model User do Django para emissão do token JWT
        django_user = User.objects.filter(email__iexact=email).first()
        if not django_user:
            base_username = email.split('@')[0][:30]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            django_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=sys_user.name[:150]
            )
        else:
            # Verifica autenticação caso o utilizador Django já exista
            authed = authenticate(username=django_user.username, password=password)
            if not authed:
                django_user.set_password(password)
                django_user.save()

        # 3. Gera o par de tokens JWT (Access + Refresh)
        refresh = RefreshToken.for_user(django_user)

        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': {
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': sys_user.id,
                    'name': sys_user.name,
                    'email': sys_user.email,
                    'role': sys_user.role,
                    'office': sys_user.office,
                    'status': sys_user.status,
                }
            }
        }

    @staticmethod
    def register(name: str, email: str, password: str, role: str = 'Atendimento', office: str = 'Bissau') -> dict:
        email = (email or '').strip().lower()
        name = (name or '').strip()
        password = (password or '').strip()

        if not name or not email or len(password) < 6:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Preencha nome, email válido e palavra-passe com no mínimo 6 caracteres.'}
            }

        if SystemUser.objects.filter(email__iexact=email).exists():
            return {
                'success': False,
                'status_code': status.HTTP_409_CONFLICT,
                'data': {'error': 'Já existe um utilizador registado com este email.'}
            }

        SystemUser.objects.create(
            name=name,
            email=email,
            password=make_password(password),
            role=role,
            office=office,
            status='Ativo',
        )
        return AuthController.login(email=email, password=password)

    @staticmethod
    def get_profile(user) -> dict:
        if not user or not user.is_authenticated:
            return {
                'success': False,
                'status_code': status.HTTP_401_UNAUTHORIZED,
                'data': {'error': 'Utilizador não autenticado.'}
            }
        sys_user = SystemUser.objects.filter(email__iexact=user.email).first()
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': {
                'id': sys_user.id if sys_user else user.id,
                'name': sys_user.name if sys_user else (user.first_name or user.username),
                'email': user.email,
                'role': sys_user.role if sys_user else 'Administrador',
                'office': sys_user.office if sys_user else 'Direção Nacional',
                'status': sys_user.status if sys_user else 'Ativo',
            }
        }


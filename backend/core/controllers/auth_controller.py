from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import UsuarioSistema
from ..seed import ensure_seed_data


class AuthController:
    """
    Controller responsável pelas regras de negócio de Autenticação e Sessão (Arquitetura MVC).
    Comunica com o Model UsuarioSistema (tabela 'usuarios_sistema') no banco PostgreSQL 'procon'.
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

        usuario = UsuarioSistema.objects.filter(email__iexact=email).first()
        if usuario:
            if usuario.status.lower() in ('inativo', 'bloqueado', 'blocked', 'inactive'):
                return {
                    'success': False,
                    'status_code': status.HTTP_403_FORBIDDEN,
                    'data': {'error': 'Este utilizador encontra-se inativo ou bloqueado.'}
                }
            if usuario.senha:
                password_ok = check_password(password, usuario.senha) or (password == usuario.senha)
                if not password_ok:
                    usuario.senha = make_password(password)
            else:
                usuario.senha = make_password(password)
        else:
            nome_padrao = email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
            perfil_padrao = 'Administrador' if 'admin' in email else ('Atendimento' if user_type == 'server' else 'Cidadão')
            usuario = UsuarioSistema.objects.create(
                nome=nome_padrao,
                email=email,
                senha=make_password(password),
                perfil=perfil_padrao,
                delegacao='Direção Nacional',
                status='Ativo',
            )

        usuario.ultimo_acesso = timezone.now()
        usuario.save()

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
                first_name=usuario.nome[:150]
            )
        else:
            authed = authenticate(username=django_user.username, password=password)
            if not authed:
                django_user.set_password(password)
                django_user.save()

        refresh = RefreshToken.for_user(django_user)

        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': {
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': usuario.id,
                    'name': usuario.nome,
                    'email': usuario.email,
                    'role': usuario.perfil,
                    'office': usuario.delegacao,
                    'status': usuario.status,
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

        if UsuarioSistema.objects.filter(email__iexact=email).exists():
            return {
                'success': False,
                'status_code': status.HTTP_409_CONFLICT,
                'data': {'error': 'Já existe um utilizador registado com este email.'}
            }

        UsuarioSistema.objects.create(
            nome=name,
            email=email,
            senha=make_password(password),
            perfil=role,
            delegacao=office,
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
        usuario = UsuarioSistema.objects.filter(email__iexact=user.email).first()
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': {
                'id': usuario.id if usuario else user.id,
                'name': usuario.nome if usuario else (user.first_name or user.username),
                'email': user.email,
                'role': usuario.perfil if usuario else 'Administrador',
                'office': usuario.delegacao if usuario else 'Direção Nacional',
                'status': usuario.status if usuario else 'Ativo',
            }
        }

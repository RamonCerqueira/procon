from django.core.management.base import BaseCommand
from core.seed import ensure_seed_data


class Command(BaseCommand):
    help = 'Popula o banco de dados PostgreSQL procon com os dados iniciais do sistema.'

    def handle(self, *args, **options):
        ensure_seed_data()
        self.stdout.write(self.style.SUCCESS('Dados iniciais inseridos com sucesso no banco procon!'))


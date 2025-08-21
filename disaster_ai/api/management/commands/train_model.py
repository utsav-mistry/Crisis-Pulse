from __future__ import annotations

from django.core.management.base import BaseCommand

from ...pipeline.trainer import train_and_save


class Command(BaseCommand):
    help = "Train and save the disaster risk model (prefers CSV datasets if available)."

    def add_arguments(self, parser):
        parser.add_argument("--no-csv", action="store_true", help="Do not use CSVs; force synthetic.")
        parser.add_argument("--n-per-class", type=int, default=1500, help="Synthetic rows per class if falling back.")

    def handle(self, *args, **options):
        prefer_csv = not options["no_csv"]
        n_per_class = int(options["n_per_class"])
        meta = train_and_save(n_per_class=n_per_class, prefer_csv=prefer_csv)
        self.stdout.write(self.style.SUCCESS(f"Model trained: {meta.get('model')} | accuracy={meta.get('accuracy')} | features={len(meta.get('features', []))}"))

#!/bin/bash
# migrate.sh — Executa todas as migrations no banco D1
# Uso:
#   ./migrate.sh             → aplica no ambiente remoto (produção)
#   ./migrate.sh --local     → aplica no banco local (desenvolvimento)

DB_NAME="petshop-db"
MIGRATIONS_DIR="./migrations"
FLAG=${1:-""}

if [ "$FLAG" = "--local" ]; then
  ENV_FLAG="--local"
  echo "🛠  Aplicando migrations LOCALMENTE..."
else
  ENV_FLAG=""
  echo "🚀 Aplicando migrations em PRODUÇÃO..."
fi

# Executa cada migration em ordem
for file in "$MIGRATIONS_DIR"/*.sql; do
  echo "▶ Executando: $file"
  wrangler d1 execute "$DB_NAME" $ENV_FLAG --file="$file"
  if [ $? -ne 0 ]; then
    echo "❌ Erro ao executar $file. Abortando."
    exit 1
  fi
  echo "✅ $file aplicado com sucesso."
done

echo ""
echo "✅ Todas as migrations aplicadas com sucesso!"
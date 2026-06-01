#!/usr/bin/env bash
set -euo pipefail

frontend_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
backend_dir="$(cd "$frontend_dir/../barber-backend" && pwd)"
commit_message="${*:-}"

if [[ -z "$commit_message" ]]; then
  echo 'Uso: npm run release -- "mensaje del cambio"'
  exit 1
fi

commit_changes() {
  local repository_dir="$1"
  local repository_name="$2"

  if [[ -z "$(git -C "$repository_dir" status --porcelain)" ]]; then
    echo "Sin cambios nuevos en $repository_name."
    return
  fi

  echo "Creando commit en $repository_name..."
  git -C "$repository_dir" add --all
  git -C "$repository_dir" commit -m "$commit_message"
}

commit_changes "$backend_dir" "barber-backend"
commit_changes "$frontend_dir" "barber-frontend"

echo "Publicando backend..."
git -C "$backend_dir" push origin main

echo "Publicando frontend..."
git -C "$frontend_dir" push origin master

echo "Publicacion enviada. GitHub desplegara backend y frontend automaticamente."

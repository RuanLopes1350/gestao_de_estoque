#!/bin/bash

# Caminho da pasta onde os arquivos estão localizados
FOLDER_PATH="./"

# Verifica se a pasta existe
if [ ! -d "$FOLDER_PATH" ]; then
  echo "A pasta especificada não existe."
  exit 1
fi

# Itera sobre todos os arquivos .jpg na pasta
for file in "$FOLDER_PATH"/*.jpg; do
  # Gera um UUID aleatório
  UUID=$(uuidgen)
  
  # Cria o novo nome do arquivo com o UUID
  NEW_NAME="$FOLDER_PATH/$UUID.jpg"
  
  # Renomeia o arquivo
  mv "$file" "$NEW_NAME"
  echo "Renomeado: $file -> $NEW_NAME"
done

echo "Processo concluído."

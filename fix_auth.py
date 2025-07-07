#!/usr/bin/env python3
import json
import re

# Lê o arquivo JSON
with open('Gestao_Estoque_API.postman_collection.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Configuração de auth Bearer Token
bearer_auth = {
    "type": "bearer",
    "bearer": [
        {
            "key": "token",
            "value": "{{accessToken}}",
            "type": "string"
        }
    ]
}

def add_auth_to_request(request_item):
    """Adiciona auth Bearer Token ao request se necessário"""
    if 'request' in request_item:
        request = request_item['request']
        
        # Verifica se é um request que precisa de auth
        if 'url' in request:
            url_raw = request['url'].get('raw', '')
            # Pula requests de login e refresh token
            if '/auth/login' in url_raw or '/auth/refresh' in url_raw:
                return
            
            # Adiciona auth se for um request para API protegida
            if '/api/' in url_raw or '/auth/logout' in url_raw or '/auth/revoke' in url_raw:
                # Só adiciona se não tem auth já configurado
                if 'auth' not in request:
                    request['auth'] = bearer_auth

def process_items(items):
    """Processa recursivamente os itens da collection"""
    for item in items:
        if 'item' in item:
            # É uma pasta, processa recursivamente
            process_items(item['item'])
        else:
            # É um request, adiciona auth se necessário
            add_auth_to_request(item)

# Processa todos os itens
process_items(data['item'])

# Salva o arquivo modificado
with open('Gestao_Estoque_API.postman_collection.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Auth Bearer Token adicionado a todos os requests necessários!")

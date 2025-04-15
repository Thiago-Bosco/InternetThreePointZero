import flask
from flask import Flask, request, Response
import requests
import re
from urllib.parse import urlparse, urljoin

app = Flask(__name__)

@app.route('/proxy', methods=['GET'])
def proxy():
    url = request.args.get('url')
    
    if not url:
        return "URL não fornecida", 400
    
    try:
        # Fazer a requisição para o site original
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://www.google.com/',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        content = response.content
        
        # Processar HTML para reescrever links e recursos
        if 'text/html' in response.headers.get('Content-Type', ''):
            content = content.decode('utf-8', errors='ignore')
            
            # Reescrever URLs absolutas para relativas
            base_url = urlparse(url)
            base_domain = f"{base_url.scheme}://{base_url.netloc}"
            
            # Reescrever links para passarem pelo proxy
            content = re.sub(r'href=[\'"]https?://([^\'"]+)[\'"]', 
                          lambda m: f'href="/proxy?url=https://{m.group(1)}"', content)
            content = re.sub(r'href=[\'"]//([^\'"]+)[\'"]', 
                          lambda m: f'href="/proxy?url=https://{m.group(1)}"', content)
            
            # Reescrever links de imagens
            content = re.sub(r'src=[\'"]https?://([^\'"]+)[\'"]', 
                          lambda m: f'src="/proxy?url=https://{m.group(1)}"', content)
            content = re.sub(r'src=[\'"]//([^\'"]+)[\'"]', 
                          lambda m: f'src="/proxy?url=https://{m.group(1)}"', content)
            
            # Reescrever URLs relativas para absolutas e então para proxy
            content = re.sub(r'href=[\'"](?!/proxy)(?!https?://)(?!#)([^\'"]+)[\'"]', 
                          lambda m: f'href="/proxy?url={urljoin(base_domain, m.group(1))}"', content)
            
            # Adicionar banner do Internet 3.0
            banner = '''
            <div id="internet3-banner" style="position: fixed; top: 0; left: 0; right: 0; 
                                          background-color: rgba(0,0,0,0.8); color: white; 
                                          padding: 10px; font-family: Arial; z-index: 9999; 
                                          display: flex; justify-content: space-between;">
                <span>Internet 3.0 - Navegando em: <strong>{}</strong></span>
                <a href="/" style="color: white; text-decoration: underline;">Voltar ao Internet 3.0</a>
            </div>
            <style>
                body {{ padding-top: 40px; }}
            </style>
            '''.format(url)
            
            # Inserir o banner logo após a tag <body>
            if '<body' in content:
                body_pos = content.find('<body')
                insert_pos = content.find('>', body_pos) + 1
                content = content[:insert_pos] + banner + content[insert_pos:]
            else:
                content = banner + content
                
            content = content.encode('utf-8')
        
        # Criar resposta com os mesmos cabeçalhos (exceto os que causariam problema)
        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection',
                           'keep-alive', 'proxy-authenticate', 'proxy-authorization',
                           'set-cookie', 'www-authenticate', 'x-frame-options', 'content-security-policy']
        
        headers = {k: v for k, v in response.headers.items() 
                  if k.lower() not in excluded_headers}
        
        return Response(content, response.status_code, headers.items())
    
    except Exception as e:
        return f"Erro ao acessar a URL: {str(e)}", 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
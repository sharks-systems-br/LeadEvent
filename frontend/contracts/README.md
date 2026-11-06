# Contrato da API

`openapi.json` é a fonte única do contrato do painel. O backend implementa a partir dele e o frontend usa os mesmos `examples` como dados de demonstração.

O arquivo fica em `frontend/contracts` para ser incluído no deploy do frontend.

## Convenções

- `x-status: implemented` — rota já existe no backend.
- `x-status: planned` — intenção registrada, ainda não implementada.
- `examples` dos schemas `Company` e `Influencer` alimentam o modo demonstração do frontend.
- `x-pending` lista as decisões em aberto: autenticação, paginação e persistência de status.

## Abrir

- Swagger Editor: importe o arquivo em <https://editor.swagger.io>.
- Postman ou Insomnia: importe como OpenAPI 3.1.
- Backend local: <http://localhost:5050/api-docs>.

## Validar

```bash
cd frontend
bun run check:contract
```

O comando confere campos obrigatórios, tipos, enums e padrões dos exemplos. Falha se um exemplo divergir do schema.

# plaquinhanfc-gestaodevendas

.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d1c7de45-bdbf-4fea-a939-be9bdc7fca3d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Variáveis de ambiente

Copie o arquivo de exemplo e preencha com os valores reais:

```sh
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | Chave da API do Google Maps |

### APIs do Google Cloud Console necessárias

Acesse [console.cloud.google.com/apis/library](https://console.cloud.google.com/apis/library) e habilite as seguintes APIs para a chave acima:

- **Maps JavaScript API** — renderização do mapa no navegador
- **Places API (New)** — busca e autocomplete de endereços
- **Geocoding API** — conversão de endereços em coordenadas geográficas

> ⚠️ O arquivo `.env` está listado no `.gitignore` e **nunca** deve ser commitado. Use `.env.example` para documentar as variáveis sem expor os valores reais.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

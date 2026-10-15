# AMEA VectorCraft API

A headless HTTP service that accepts JSON row arrays and their referenced design files, processes jobs through the VectorCraft CLI, and returns generated PDF or SVG files. It does not require Illustrator or a graphical interface.

## Run with Docker Compose

Install Docker with Compose, set an API token, and start the service:

```bash
export API_TOKEN='replace-with-a-long-random-token'
docker compose up --build -d
```

The image includes the API and VectorCraft CLI. Compose publishes the API on port `8787`, requires bearer-token authentication, and stores job records, uploads, and outputs in the `api-data` volume. Set `API_PORT` to change the host port, `API_MAX_UPLOAD_BYTES` to change the upload limit, or `VECTORCRAFT_VERSION` to select a VectorCraft release. The image defaults to VectorCraft `0.10.0` and supports `amd64` and `arm64`.

GitHub Actions builds `linux/amd64` and `linux/arm64` images and publishes them to [GitHub Container Registry](https://github.com/AMEA-AB/amea-cep-plugin/pkgs/container/amea-vectorcraft-api) only when a GitHub release is published. The image is tagged with the release's tag name and `latest`. If the package is private, grant the deployment environment access or change its visibility in GitHub Packages settings.

Job records and completed outputs survive container restarts. Jobs that were queued or running when the API stopped are restored as failed with an interruption message; submit them again after restart. To remove stored jobs and files, remove the volume with `docker compose down --volumes`.

## Run locally

Install Node.js 24 and VectorCraft with its CLI, then run:

```bash
API_TOKEN='replace-with-a-long-random-token' npm start
```

The API binds to `127.0.0.1:8787` by default. Configure `API_HOST`, `API_PORT`, `API_DATA_DIR`, `API_MAX_UPLOAD_BYTES`, and `VECTORCRAFT_CLI` as needed. Binding to a non-local host requires `API_TOKEN`; send it as a bearer token. `GET /health` does not require authentication.

## Submit a job

Send a non-empty JSON array in the multipart `data` field and upload every referenced template, jig, and asset in the same request. Multipart file field names do not matter; the original filenames are matched against values in the rows. Excel workbooks and Illustrator `.ai`/`.ait` files are not accepted. Templates and jigs must be SVG or PDF.

```bash
curl -X POST http://localhost:8787/jobs \
  -H 'Authorization: Bearer YOUR_API_TOKEN' \
  -F 'data=[{"Name":"Poster","Quantity":1,"Template":"template.svg","Output type":"pdf","Headline":"Summer sale","Photo":"photo.png"}]' \
  -F 'template=@template.svg' \
  -F 'asset=@photo.png'
```

Each JSON object represents one output configuration. `Name` or `Output name` sets the output name; `Output type` accepts `pdf` or `svg` and defaults to `pdf`. `Quantity` must be a positive integer. `Template` is required; `Jig` is optional. `Flags`, if present, must be an array containing supported flags: `mirror-horizontally`, `mirror-vertically`, `rotate-clockwise`, or `rotate-counter-clockwise`. Other fields are matched to named template objects. Asset values must match uploaded filenames. Spot colors named `AMEA-COLOR={column_name}` require a six-digit hex value in the corresponding row property.

The response contains a job ID. Poll `GET /jobs/{id}` until its status is `complete` or `failed`, then download outputs using the returned URLs. Jobs run one at a time.

## API reference

See the [API usage guide](docs/api.md) for full request and response examples. The [OpenAPI 3.1 specification](docs/openapi.yaml) can be imported into [Swagger Editor](https://editor.swagger.io/) for an interactive endpoint reference.

## Supported inputs and limitations

The API accepts uploaded SVG/PDF templates and jigs, plus raster and SVG assets. It does not provide Illustrator `.ai` fidelity. The processor depends on VectorCraft's evolving CLI/MCP interface; validate representative designs before production use.

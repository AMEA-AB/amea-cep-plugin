# Headless VectorCraft API

The HTTP API accepts an array of data rows and the design files they reference, processes them through the VectorCraft CLI, and returns generated PDF or SVG files.

## Interactive API reference

The machine-readable [OpenAPI definition](openapi.yaml) describes the endpoints, authentication, request fields, and response schemas. To browse it interactively, open [Swagger Editor](https://editor.swagger.io/) and use **File → Import file** to load `docs/openapi.yaml`.

## Authentication

When `API_TOKEN` is configured, send it on every request except `GET /health`:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Docker Compose requires `API_TOKEN`. A local run bound to `127.0.0.1` does not require it by default.

## Submit a job

Send a `data` multipart field containing a JSON array, plus every template, jig, and asset referenced by its rows. Multipart file field names are ignored; the original filenames are matched against each row's `Template`, `Jig`, and artwork values. Excel workbook uploads are not supported. Templates and jigs must be `.svg` or `.pdf`; Illustrator `.ai` and `.ait` files are unsupported. The default upload limit is 100 MiB and can be changed with `API_MAX_UPLOAD_BYTES`.

Each JSON object represents one output configuration. Use `Name` or `Output name`, a positive integer `Quantity`, a `Template` filename, and optional `Output type`, `Jig`, `Flags`, and template-field values. For example:

```json
[
  {
    "Name": "Poster",
    "Quantity": 2,
    "Template": "template.svg",
    "Output type": "pdf",
    "Jig": "jig.pdf",
    "Headline": "Summer sale",
    "Photo": "photo.png",
    "Flags": ["rotate-clockwise"]
  }
]
```

Submit the JSON in the `data` form field. The file references in the rows must match the names of files included in the same multipart request:

```bash
curl -X POST http://localhost:8787/jobs \
  -H 'Authorization: Bearer YOUR_API_TOKEN' \
  -F 'data=[{"Name":"Poster","Quantity":2,"Template":"template.svg","Output type":"pdf","Jig":"jig.pdf","Headline":"Summer sale","Photo":"photo.png","Flags":["rotate-clockwise"]}]' \
  -F 'template=@template.svg' \
  -F 'jig=@jig.pdf' \
  -F 'asset=@photo.png'
```

The API responds with `202 Accepted` and a job object containing an `id` and `status`. Processing runs asynchronously, one job at a time. Row validation and VectorCraft failures appear as `status: "failed"` and an `error` in the job object.

## Poll and download

Poll the returned job ID until its status is `complete` or `failed`:

```bash
curl http://localhost:8787/jobs/JOB_ID \
  -H 'Authorization: Bearer YOUR_API_TOKEN'
```

A successful job includes output names and relative download URLs. Download each output with:

```bash
curl -L 'http://localhost:8787/jobs/JOB_ID/outputs/Output%20name.pdf' \
  -H 'Authorization: Bearer YOUR_API_TOKEN' \
  -o 'Output name.pdf'
```

`GET /jobs/{id}/outputs` is an alias for the job status endpoint; the filename route downloads the actual output. Unknown jobs and outputs that are not available return `404`.

## Row conventions

- Each JSON array item is one row. `Name` or `Output name` supplies the output name.
- `Output type` or the legacy spelling `Ouput type` accepts `pdf` or `svg`.
- `Quantity` must be a positive integer, and `Template` must name an uploaded SVG or PDF. Output type defaults to `pdf` if omitted.
- `Jig` is optional and must name an uploaded SVG or PDF.
- `Flags`, when set, must be a JSON array of supported flags: `mirror-horizontally`, `mirror-vertically`, `rotate-clockwise`, or `rotate-counter-clockwise`.
- Other row properties are matched to named template objects. An empty value hides matching objects; an asset value is matched to an uploaded filename.
- Spot colors named `AMEA-COLOR={column_name}` require a six-digit hex value in the corresponding row property.

## Responses and job status

Job status is one of `queued`, `running`, `complete`, or `failed`. The response contains `progress.completed` and `progress.total`; total may remain zero until the input rows have been read. Completed output entries contain `name` and `url`. A failure includes a human-readable `error`.

With Docker Compose, job records, inputs, and outputs persist in the `api-data` volume. If the service stops while a job is queued or running, that job is restored as failed with an interruption message and must be submitted again.

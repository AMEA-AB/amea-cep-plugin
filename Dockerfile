FROM node:24-bookworm-slim

ARG VECTORCRAFT_VERSION=0.10.0
ARG TARGETARCH

ENV API_HOST=0.0.0.0 \
    API_PORT=8787 \
    API_DATA_DIR=/data \
    NODE_ENV=production

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

RUN set -eux; \
    case "${TARGETARCH}" in \
      amd64) vectorcraft_arch=x86_64 ;; \
      arm64) vectorcraft_arch=aarch64 ;; \
      *) echo "Unsupported target architecture: ${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    asset="vectorcraft-${VECTORCRAFT_VERSION}-linux-${vectorcraft_arch}.deb"; \
    base_url="https://github.com/storytold/vectorcraft/releases/download/v${VECTORCRAFT_VERSION}"; \
    curl -fsSL "${base_url}/${asset}" -o "/tmp/${asset}"; \
    curl -fsSL "${base_url}/SHA256SUMS.txt" -o /tmp/SHA256SUMS.txt; \
    grep "  ${asset}$" /tmp/SHA256SUMS.txt | sha256sum --check -; \
    apt-get update; \
    apt-get install -y --no-install-recommends "/tmp/${asset}"; \
    rm -f "/tmp/${asset}" /tmp/SHA256SUMS.txt; \
    rm -rf /var/lib/apt/lists/*

COPY api ./api
RUN mkdir -p /data && chown node:node /data

USER node
VOLUME ["/data"]
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:8787/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "api/server.js"]

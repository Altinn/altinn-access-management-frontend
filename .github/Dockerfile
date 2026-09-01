FROM ghcr.io/altinn/altinn-platform-gh-runner-base:1.0.0

USER root

RUN apt-get update && \
    apt-get install -y curl jq

RUN npx playwright install --with-deps

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*

USER runner
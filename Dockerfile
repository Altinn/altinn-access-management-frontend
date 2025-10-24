# Building accessmanagement frontend
FROM node:22-slim@sha256:f9f7f95dcf1f007b007c4dcd44ea8f7773f931b71dc79d57c216e731c87a090b AS generate-accessmanagement-frontend

WORKDIR /build
COPY . .
RUN corepack enable && \
    yarn --immutable && \
    yarn build

# Building the backend
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine@sha256:f271ed7d0fd9c5a7ed0acafed8a2bc978bb65c19dcd2eeea0415adef142ffc87 AS generate-accessmanagement-backend

WORKDIR /build
COPY backend .
RUN dotnet publish src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.csproj -c Release -o /app_output

# Building the final image
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine@sha256:5e8dca92553951e42caed00f2568771b0620679f419a28b1335da366477d7f98 AS final

WORKDIR /app
EXPOSE 80

# Installing package for time zone functionality
RUN apk add --no-cache tzdata

ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_HTTP_PORTS=80

COPY --from=generate-accessmanagement-backend /app_output .
COPY --from=generate-accessmanagement-frontend /build/dist/assets ./wwwroot/accessmanagement/assets
COPY --from=generate-accessmanagement-frontend /build/src/localizations ./wwwroot/accessmanagement/localizations
COPY --from=generate-accessmanagement-frontend /build/dist/.vite/manifest.json ./wwwroot/accessmanagement

RUN mkdir /tmp/logtelemetry

ENTRYPOINT ["dotnet", "Altinn.AccessManagement.UI.dll"]
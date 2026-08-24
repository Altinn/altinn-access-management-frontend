# Building accessmanagement frontend
FROM node:22-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436 AS generate-accessmanagement-frontend

WORKDIR /build
COPY . .
RUN corepack enable && \
    yarn --immutable && \
    yarn build

# Building the backend
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine@sha256:d8ee39817ca03a3757288e83c37ed73cc969a286c603b827c7cbe33add1c2d1c AS generate-accessmanagement-backend

WORKDIR /build
COPY backend .
RUN dotnet publish src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.csproj -c Release -o /app_output

# Building the final image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine@sha256:27b6b84beeede74fd16886177d360799c8e4299ceadfbd64eef57bafead7878a AS final

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
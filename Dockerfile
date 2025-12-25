# Building accessmanagement frontend
FROM node:22-slim@sha256:330fc735268c38d88788c3469a8dff2d0ad834af58569a42c61c47e4578d953b AS generate-accessmanagement-frontend

WORKDIR /build
COPY . .
RUN corepack enable && \
    yarn --immutable && \
    yarn build

# Building the backend
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine@sha256:e0f7abfb9c18aa419198b2c4e05dc2f7fd864a6098f09bddb1ceb2b0bce67685 AS generate-accessmanagement-backend

WORKDIR /build
COPY backend .
RUN dotnet publish src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.csproj -c Release -o /app_output

# Building the final image
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine@sha256:edd99f4ec197080689efe958666d44c169ddaf7cc6348d235ca2c5133cdd4e15 AS final

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
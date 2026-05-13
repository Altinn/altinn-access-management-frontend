# Building accessmanagement frontend
FROM node:22-slim@sha256:d415caac2f1f77b98caaf9415c5f807e14bc8d7bdea62561ea2fef4fbd08a73c AS generate-accessmanagement-frontend

WORKDIR /build
COPY . .
RUN corepack enable && \
    yarn --immutable && \
    yarn build

# Building the backend
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine@sha256:23dc03ba28a2036ef15c35d0e958a560a43e8551e1ee5de404a93c24d3e330ea AS generate-accessmanagement-backend

WORKDIR /build
COPY backend .
RUN dotnet publish src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.csproj -c Release -o /app_output

# Building the final image
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine@sha256:3af07ffc67cf14710da8a6d15f8ce963e0eb7f2e73a57445edd964a505a2557c AS final

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
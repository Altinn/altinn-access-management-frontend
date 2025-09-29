# Building accessmanagement frontend
FROM node:22-slim@sha256:c407baf6e71f4127777b0b660b162e3c88c1974067b1be9f1f962709ea817d59 AS generate-accessmanagement-frontend

WORKDIR /build
COPY . .
RUN corepack enable && \
    yarn --immutable && \
    yarn build

# Building the backend
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine@sha256:f47429a125e38d83f5231a78dde18106cb447d541f7ffdc5b8af4d227a323d95 AS generate-accessmanagement-backend

WORKDIR /build
COPY backend .
RUN dotnet publish src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.csproj -c Release -o /app_output

# Building the final image
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine@sha256:56cbdd25b168276871f8f4916efebde4d10e69250bb6b3e8a4f6f95db8d65ac2 AS final

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
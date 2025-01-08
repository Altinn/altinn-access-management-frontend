# Building accessmanagement frontend
FROM node:22-slim AS generate-accessmanagement-frontend
# FROM node:lts as generate-accessmanagement-frontend

WORKDIR /build
COPY . .
RUN corepack enable
RUN yarn --immutable
RUN yarn build

# Building the backend
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS generate-accessmanagement-backend
WORKDIR /build
COPY backend .
RUN dotnet build src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.csproj -c Release -o /app_output
RUN dotnet publish src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.csproj -c Release -o /app_output

# Building the final image
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS final
EXPOSE 80
#EXPOSE 443
WORKDIR /app
# ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
#     DOTNET_RUNNING_IN_CONTAINER=true
ENV ASPNETCORE_ENVIRONMENT = Development
ENV ASPNETCORE_HTTP_PORTS = 80

COPY --from=generate-accessmanagement-backend /app_output .
COPY --from=generate-accessmanagement-frontend /build/dist/assets ./wwwroot/accessmanagement/assets
COPY --from=generate-accessmanagement-frontend /build/src/localizations ./wwwroot/accessmanagement/localizations
COPY --from=generate-accessmanagement-frontend /build/dist/manifest.json ./wwwroot/accessmanagement

RUN mkdir /tmp/logtelemetry
ENTRYPOINT ["dotnet", "Altinn.AccessManagement.UI.dll"]

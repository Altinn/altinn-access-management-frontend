#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:9.0@sha256:1af4114db9ba87542a3f23dbb5cd9072cad7fcc8505f6e9131d1feb580286a6f AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0@sha256:123b43e4d9775451d8ed63af324a42132707b4edb14770bcdf5c85cf55bc45f1 AS build
WORKDIR /src
COPY ["Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.csproj", "Altinn.AccessManagement.UI/"]
RUN dotnet restore "Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.csproj"
COPY . .
WORKDIR "/src/Altinn.AccessManagement.UI"
RUN dotnet build "Altinn.AccessManagement.UI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Altinn.AccessManagement.UI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Altinn.AccessManagement.UI.dll"]
#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:9.0@sha256:cd8732b16dbb84d3eae80753a892f9f7cf4aafe922bf466d2f62f036be558699 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0@sha256:c336232f89997e8b03d104edb89253d0e7d7db20779005c0b66da41c0043a9c2 AS build
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
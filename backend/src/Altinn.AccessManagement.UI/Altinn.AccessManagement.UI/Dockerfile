#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:9.0@sha256:8bbb7b9045f04a32d2eaad43b351e67f07c1f9604811dd505fc3654b4bec2176 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0@sha256:a574e6212c98ccf9cf2c6588201b1c71d93094f6f26c21375f75aa909a9e88f0 AS build
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
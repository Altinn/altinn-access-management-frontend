#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:9.0@sha256:d02562e8e42f3ddfec764b05447dfe56eff84df95fbfd8b4f884054b21760df6 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0@sha256:670ef9e8eca44c8baa0bd1c229ccde9537064260ef14d54738b7a87916609312 AS build
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
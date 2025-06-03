#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:9.0@sha256:96db63a87bb638bf3189a1763f0361f52a7793bca2a8056d2f4f2ac91915bccf AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0@sha256:c5b188baf837b0180a14f988815b9cc7a55b836dd6cbe1b6e6523cf3098faaa8 AS build
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
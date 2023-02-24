using Altinn.AccessManagement.Core.Constants;
using Altinn.AccessManagement.Core.Helpers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Services;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Clients;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Common.AccessToken;
using Altinn.Common.AccessToken.Services;
using Altinn.Common.AccessTokenClient.Services;
using Altinn.Common.PEP.Authorization;
using AltinnCore.Authentication.JwtCookie;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;

var builder = WebApplication.CreateBuilder(args);

// setup frontend configuration
string frontendProdFolder = AppEnvironment.GetVariable("FRONTEND_PROD_FOLDER", "wwwroot/AccessManagement/");

builder.Configuration.AddJsonFile(frontendProdFolder + "manifest.json", optional: true, reloadOnChange: true);

ConfigureServices(builder.Services, builder.Configuration);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddMemoryCache();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.UseCors();

app.UseStaticFiles();

app.MapControllers();

app.Run();

void ConfigureServices(IServiceCollection services, IConfiguration config)
{
    services.AddControllersWithViews();
    services.AddMvc();

    services.Configure<PlatformSettings>(config.GetSection("PlatformSettings"));
    services.Configure<CacheConfig>(config.GetSection("CacheConfig"));
    services.Configure<ResourceRegistrySettings>(config.GetSection("ResourceRegistrySettings"));
    services.Configure<GeneralSettings>(config.GetSection("GeneralSettings"));
    services.AddSingleton(config);
    services.AddHttpClient<IDelegationsClient, DelegationsClient>();
    services.AddHttpClient<IProfileClient, ProfileClient>();
    services.AddHttpClient<IAuthenticationClient, AuthenticationClient>();
    services.AddSingleton<IResourceRegistryClient, ResourceRegistryClient>();
    services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
    services.AddSingleton<IDelegationsService, DelegationsService>();
    services.AddSingleton<IResourceAdministrationPoint, ResourceAdministrationPoint>();
    services.AddSingleton<IAuthorizationHandler, AccessTokenHandler>();
    services.AddTransient<ISigningKeysResolver, SigningKeysResolver>();
    services.AddSingleton<IAccessTokenGenerator, AccessTokenGenerator>();
    services.AddTransient<ISigningCredentialsResolver, SigningCredentialsResolver>();

    PlatformSettings platformSettings = config.GetSection("PlatformSettings").Get<PlatformSettings>();
    services.AddAuthentication(JwtCookieDefaults.AuthenticationScheme)
    .AddJwtCookie(JwtCookieDefaults.AuthenticationScheme, options =>
    {
        options.JwtCookieName = platformSettings.JwtCookieName;
        options.MetadataAddress = platformSettings.OpenIdWellKnownEndpoint;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = false,
            ValidateAudience = false,
            RequireExpirationTime = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        if (builder.Environment.IsDevelopment())
        {
            options.RequireHttpsMetadata = false;
        }
    });

    services.AddAuthorization(options =>
    {
        options.AddPolicy(AuthzConstants.POLICY_STUDIO_DESIGNER, policy => policy.Requirements.Add(new ClaimAccessRequirement("urn:altinn:app", "studio.designer")));
        options.AddPolicy(AuthzConstants.ALTINNII_AUTHORIZATION, policy => policy.Requirements.Add(new ClaimAccessRequirement("urn:altinn:app", "sbl.authorization")));
        options.AddPolicy("PlatformAccess", policy => policy.Requirements.Add(new AccessTokenRequirement()));
    });

    services.AddTransient<IAuthorizationHandler, ClaimAccessHandler>();
    services.AddTransient<IAuthorizationHandler, ScopeAccessHandler>();
    services.AddSwaggerGen(options =>
    {
        options.AddSecurityDefinition("oauth2", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Description = "Standard Authorization header using the Bearer scheme. Example: \"bearer {token}\"",
            In = ParameterLocation.Header,
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey
        });
        options.OperationFilter<SecurityRequirementsOperationFilter>();
    });
}

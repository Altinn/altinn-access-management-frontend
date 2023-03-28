using Altinn.AccessManagement.Configuration;
using Altinn.AccessManagement.Core.Constants;
using Altinn.AccessManagement.Core.Helpers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Services;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Altinn.AccessManagement.UI.Health;
using Altinn.AccessManagement.UI.Integration.Clients;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Common.AccessToken;
using Altinn.Common.AccessToken.Services;
using Altinn.Common.AccessTokenClient.Services;
using Altinn.Common.PEP.Authorization;
using AltinnCore.Authentication.JwtCookie;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Microsoft.ApplicationInsights.AspNetCore.Extensions;
using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.ApplicationInsights.WindowsServer.TelemetryChannel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;
using KeyVaultSettings = AltinnCore.Authentication.Constants.KeyVaultSettings;

ILogger logger;

var builder = WebApplication.CreateBuilder(args);

string applicationInsightsKeySecretName = "ApplicationInsights--InstrumentationKey";

string applicationInsightsConnectionString = string.Empty;

ConfigureSetupLogging();

await SetConfigurationProviders(builder.Configuration);

ConfigureLogging(builder.Logging);

// setup frontend configuration
string frontendProdFolder = AppEnvironment.GetVariable("FRONTEND_PROD_FOLDER", "wwwroot/AccessManagement/");

builder.Configuration.AddJsonFile(frontendProdFolder + "manifest.json", optional: true, reloadOnChange: true);

ConfigureServices(builder.Services, builder.Configuration);

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

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseAuthentication();

app.UseAuthorization();

app.UseCors();

app.UseStaticFiles();

app.MapControllers();

app.Run();

void ConfigureSetupLogging()
{
    // Setup logging for the web host creation
    var logFactory = LoggerFactory.Create(builder =>
    {
        builder
            .AddFilter("Microsoft", LogLevel.Warning)
            .AddFilter("System", LogLevel.Warning)
            .AddFilter("Altinn.AccessManagement.UI.Program", LogLevel.Debug)
            .AddConsole();
    });

    logger = logFactory.CreateLogger<Program>();
}

void ConfigureLogging(ILoggingBuilder logging)
{
    // Clear log providers
    logging.ClearProviders();

    // Setup up application insight if ApplicationInsightsConnectionString is available
    if (!string.IsNullOrEmpty(applicationInsightsConnectionString))
    {
        // Add application insights https://docs.microsoft.com/en-us/azure/azure-monitor/app/ilogger
        logging.AddApplicationInsights(
             configureTelemetryConfiguration: (config) => config.ConnectionString = applicationInsightsConnectionString,
             configureApplicationInsightsLoggerOptions: (options) => { });

        // Optional: Apply filters to control what logs are sent to Application Insights.
        // The following configures LogLevel Information or above to be sent to
        // Application Insights for all categories.
        logging.AddFilter<Microsoft.Extensions.Logging.ApplicationInsights.ApplicationInsightsLoggerProvider>(string.Empty, LogLevel.Warning);

        // Adding the filter below to ensure logs of all severity from Program.cs
        // is sent to ApplicationInsights.
        logging.AddFilter<Microsoft.Extensions.Logging.ApplicationInsights.ApplicationInsightsLoggerProvider>(typeof(Program).FullName, LogLevel.Trace);
    }
    else
    {
        // If not application insight is available log to console
        logging.AddFilter("Microsoft", LogLevel.Warning);
        logging.AddFilter("System", LogLevel.Warning);
        logging.AddConsole();
    }
}

async Task SetConfigurationProviders(ConfigurationManager config)
{
    string basePath = Directory.GetParent(Directory.GetCurrentDirectory()).FullName;

    logger.LogInformation($"Program // Loading Configuration from basePath={basePath}");

    config.SetBasePath(basePath);

    string configJsonFile1 = $"{basePath}/altinn-appsettings/altinn-dbsettings-secret.json";

    logger.LogInformation($"Loading configuration file: '{configJsonFile1}'");

    config.AddJsonFile(configJsonFile1, optional: true, reloadOnChange: true);

    config.AddEnvironmentVariables();

    config.AddCommandLine(args);

    await ConnectToKeyVaultAndSetApplicationInsights(config);
}

async Task ConnectToKeyVaultAndSetApplicationInsights(ConfigurationManager config)
{
    logger.LogInformation("Program // Connect to key vault and set up application insights");

    KeyVaultSettings keyVaultSettings = new();

    config.GetSection("kvSetting").Bind(keyVaultSettings);

    if (!string.IsNullOrEmpty(keyVaultSettings.ClientId) &&
        !string.IsNullOrEmpty(keyVaultSettings.TenantId) &&
        !string.IsNullOrEmpty(keyVaultSettings.ClientSecret) &&
        !string.IsNullOrEmpty(keyVaultSettings.SecretUri))
    {
        Environment.SetEnvironmentVariable("AZURE_CLIENT_ID", keyVaultSettings.ClientId);
        Environment.SetEnvironmentVariable("AZURE_CLIENT_SECRET", keyVaultSettings.ClientSecret);
        Environment.SetEnvironmentVariable("AZURE_TENANT_ID", keyVaultSettings.TenantId);

        try
        {
            SecretClient client = new SecretClient(new Uri(keyVaultSettings.SecretUri), new EnvironmentCredential());
            KeyVaultSecret secret = await client.GetSecretAsync(applicationInsightsKeySecretName);
            applicationInsightsConnectionString = string.Format("InstrumentationKey={0}", secret.Value);
        }
        catch (Exception vaultException)
        {
            logger.LogError(vaultException, $"Unable to read application insights key.");
        }

        try
        {
            config.AddAzureKeyVault(new Uri(keyVaultSettings.SecretUri), new EnvironmentCredential());
        }
        catch (Exception vaultException)
        {
            logger.LogError(vaultException, $"Unable to add key vault secrets to config.");
        }
    }
}

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
    services.AddHttpClient<ILookupClient, LookupClient>();
    services.AddHttpClient<IAuthenticationClient, AuthenticationClient>();
    services.AddSingleton<IResourceRegistryClient, ResourceRegistryClient>();
    services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
    services.AddSingleton<IDelegationsService, DelegationsService>();
    services.AddSingleton<ILookupService, LookupService>();
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

    services.AddAntiforgery(options =>
    {
        // asp .net core expects two types of tokens: One that is attached to the request as header, and the other one as cookie.
        // The values of the tokens are not the same and both need to be present and valid in a "unsafe" request.

        // We use this for OIDC state validation. See authentication controller. 
        // https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-6.0
        // https://github.com/axios/axios/blob/master/lib/defaults.js
        options.Cookie.Name = "AS-XSRF-TOKEN";
        options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
        options.HeaderName = "X-XSRF-TOKEN";
    });
    services.TryAddSingleton<ValidateAntiforgeryTokenIfAuthCookieAuthorizationFilter>();

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

    if (!string.IsNullOrEmpty(applicationInsightsConnectionString))
    {
        services.AddSingleton(typeof(ITelemetryChannel), new ServerTelemetryChannel() { StorageFolder = "/tmp/logtelemetry" });
        services.AddApplicationInsightsTelemetry(new ApplicationInsightsServiceOptions
        {
            ConnectionString = applicationInsightsConnectionString
        });

        services.AddApplicationInsightsTelemetryProcessor<HealthTelemetryFilter>();
        services.AddApplicationInsightsTelemetryProcessor<IdentityTelemetryFilter>();
        services.AddSingleton<ITelemetryInitializer, CustomTelemetryInitializer>();

        logger.LogInformation("Startup // ApplicationInsightsConnectionString = {applicationInsightsConnectionString}", applicationInsightsConnectionString);
    }
}

using Altinn.AccessManagement.Configuration;
using Altinn.AccessManagement.Core.Constants;
using Altinn.AccessManagement.Core.Helpers;
using Altinn.AccessManagement.UI.Authorization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Services;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Extensions;
using Altinn.AccessManagement.UI.Filters;
using Altinn.AccessManagement.UI.Health;
using Altinn.AccessManagement.UI.Integration.Clients;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.Common.AccessTokenClient.Services;
using Altinn.Common.PEP.Clients;
using Altinn.Common.PEP.Implementation;
using Altinn.Common.PEP.Interfaces;
using AltinnCore.Authentication.JwtCookie;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Microsoft.ApplicationInsights.AspNetCore.Extensions;
using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.ApplicationInsights.WindowsServer.TelemetryChannel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging.ApplicationInsights;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;

ILogger logger;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

string applicationInsightsKeySecretName = "ApplicationInsights--InstrumentationKey";

string applicationInsightsConnectionString = string.Empty;

ConfigureSetupLogging();

await SetConfigurationProviders(builder.Configuration);

ConfigureLogging(builder.Logging);

// setup frontend configuration
string frontendProdFolder = AppEnvironment.GetVariable("FRONTEND_PROD_FOLDER", "wwwroot/AccessManagement/");

builder.Configuration.AddJsonFile(frontendProdFolder + "manifest.json", true, true);

ConfigureServices(builder.Services, builder.Configuration);

builder.Services.AddControllers();

builder.Services.AddMemoryCache();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(AuthzConstants.POLICY_ACCESS_MANAGEMENT_ENDUSER_READ_WITH_PASS_THROUGH, policy => policy.Requirements.Add(new EndUserResourceAccessRequirement("read", "altinn_enduser_access_management", true)));

builder.Services.AddAuthorizationBuilder()
    .AddPolicy(AuthzConstants.POLICY_ACCESS_MANAGEMENT_CLIENT_ADMINISTRATION_READ_WITH_PASS_THROUGH, policy => policy.Requirements.Add(new EndUserResourceAccessRequirement("read", "altinn_client_administration", true)));

builder.Services.AddScoped<IAuthorizationHandler, EndUserResourceAccessHandler>();

WebApplication app = builder.Build();

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

app.UseDefaultSecurityHeaders();

app.UseAuthentication();

app.UseAuthorization();

app.UseCors();

app.UseStaticFiles();

app.MapControllers();

app.MapHealthChecks("/health");

if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.UseDeveloperExceptionPage();

    // Enable higher level of detail in exceptions related to JWT validation
    IdentityModelEventSource.ShowPII = true;
}
else
{
    app.UseExceptionHandler("/accessmanagement/api/v1/error");
}

app.Run();

void ConfigureSetupLogging()
{
    // Setup logging for the web host creation
    ILoggerFactory logFactory = LoggerFactory.Create(builder =>
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
            configureTelemetryConfiguration: config => config.ConnectionString = applicationInsightsConnectionString,
            configureApplicationInsightsLoggerOptions: options => { });

        // Optional: Apply filters to control what logs are sent to Application Insights.
        // The following configures LogLevel Information or above to be sent to
        // Application Insights for all categories.
        logging.AddFilter<ApplicationInsightsLoggerProvider>(string.Empty, LogLevel.Warning);

        // Adding the filter below to ensure logs of all severity from Program.cs
        // is sent to ApplicationInsights.
        logging.AddFilter<ApplicationInsightsLoggerProvider>(typeof(Program).FullName, LogLevel.Trace);
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
    config.AddEnvironmentVariables();

    config.AddCommandLine(args);

    await ConnectToKeyVaultAndSetApplicationInsights(config);
}

async Task ConnectToKeyVaultAndSetApplicationInsights(ConfigurationManager config)
{
    logger.LogInformation("Program // Connect to key vault and set up application insights");

    KeyVaultSettings keyVaultSettings = new KeyVaultSettings();

    config.GetSection("KeyVaultSettings").Bind(keyVaultSettings);
    try
    {
        SecretClient client = new SecretClient(new Uri(keyVaultSettings.SecretUri), new DefaultAzureCredential());
        KeyVaultSecret secret = await client.GetSecretAsync(applicationInsightsKeySecretName);
        applicationInsightsConnectionString = string.Format("InstrumentationKey={0}", secret.Value);
    }
    catch (Exception vaultException)
    {
        logger.LogError(vaultException, "Unable to read application insights key.");
    }

    try
    {
        config.AddAzureKeyVault(new Uri(keyVaultSettings.SecretUri), new DefaultAzureCredential());
    }
    catch (Exception vaultException)
    {
        logger.LogError(vaultException, "Unable to add key vault secrets to config.");
    }
}

void ConfigureServices(IServiceCollection services, IConfiguration config)
{
    services.AddControllersWithViews();
    services.ConfigureDataProtection();
    services.AddMvc();
    services.AddHealthChecks().AddCheck<HealthCheck>("accessmanagement_ui_health_check");
    services.Configure<PlatformSettings>(config.GetSection("PlatformSettings"));
    services.Configure<Altinn.Common.PEP.Configuration.PlatformSettings>(config.GetSection("PlatformSettings"));

    services.Configure<CacheConfig>(config.GetSection("CacheConfig"));
    services.Configure<GeneralSettings>(config.GetSection("GeneralSettings"));
    services.Configure<FeatureFlags>(config.GetSection("FeatureFlags"));
    services.Configure<KeyVaultSettings>(config.GetSection("KeyVaultSettings"));
    services.Configure<ClientSettings>(config.GetSection("ClientSettings"));
    services.AddSingleton(config);

    services.AddHttpClient<IAuthenticationClient, AuthenticationClient>();
    services.AddHttpClient<AuthorizationApiClient>();
    ConfigureMockableClients(services, config);

    services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
    services.AddSingleton<IAPIDelegationService, APIDelegationService>();
    services.AddSingleton<ILookupService, LookupService>();
    services.AddSingleton<IResourceService, ResourceService>();
    services.AddSingleton<IUserService, UserService>();
    services.AddSingleton<IAccessTokenGenerator, AccessTokenGenerator>();
    services.AddSingleton<IAccessTokenProvider, AccessTokenProvider>();
    services.AddSingleton<ISingleRightService, SingleRightService>();
    services.AddSingleton<IAccessPackageService, AccessPackageService>();
    services.AddSingleton<ISystemRegisterService, SystemRegisterService>();
    services.AddSingleton<ISystemUserService, SystemUserService>();
    services.AddSingleton<ISystemUserRequestService, SystemUserRequestService>();
    services.AddSingleton<ISystemUserChangeRequestService, SystemUserChangeRequestService>();
    services.AddSingleton<ISystemUserAgentRequestService, SystemUserAgentRequestService>();
    services.AddSingleton<ISystemUserAgentDelegationService, SystemUserAgentDelegationService>();
    services.AddSingleton<IConsentService, ConsentService>();
    services.AddSingleton<IEncryptionService, EncryptionService>();
    services.AddSingleton<IRoleService, RoleService>();
    services.AddTransient<ISigningCredentialsResolver, SigningCredentialsResolver>();
    services.AddTransient<ResourceHelper, ResourceHelper>();

    PlatformSettings platformSettings = config.GetSection("PlatformSettings").Get<PlatformSettings>();
    services.AddAuthentication(JwtCookieDefaults.AuthenticationScheme)
        .AddJwtCookie(JwtCookieDefaults.AuthenticationScheme, configureOptions: options =>
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
                ClockSkew = TimeSpan.Zero,
            };

            if (builder.Environment.IsDevelopment())
            {
                options.RequireHttpsMetadata = false;
            }
        });

    services.AddAntiforgery(options =>
    {
        // asp .net core expects two types of tokens: One that is attached to the request as header, and the other one as cookie.
        // The values of the tokens are not the same and both need to be present and valid in a "unsafe" request.

        // We use this for OIDC state validation. See authentication controller. 
        // https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-6.0
        // https://github.com/axios/axios/blob/master/lib/defaults.js
        options.Cookie.Name = "AS-XSRF-TOKEN";
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.HeaderName = "X-XSRF-TOKEN";
    });
    services.TryAddSingleton<ValidateAntiforgeryTokenIfAuthCookieAuthorizationFilter>();

    services.AddSwaggerGen(options =>
    {
        options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
        {
            Description = "Standard Authorization header using the Bearer scheme. Example: \"bearer {token}\"",
            In = ParameterLocation.Header,
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey,
        });
        options.OperationFilter<SecurityRequirementsOperationFilter>();
    });

    if (!string.IsNullOrEmpty(applicationInsightsConnectionString))
    {
        services.AddSingleton(typeof(ITelemetryChannel), new ServerTelemetryChannel
        { StorageFolder = "/tmp/logtelemetry" });
        services.AddApplicationInsightsTelemetry(new ApplicationInsightsServiceOptions
        {
            ConnectionString = applicationInsightsConnectionString,
        });

        services.AddApplicationInsightsTelemetryProcessor<HealthTelemetryFilter>();
        services.AddApplicationInsightsTelemetryProcessor<IdentityTelemetryFilter>();
        services.AddSingleton<ITelemetryInitializer, CustomTelemetryInitializer>();

        logger.LogInformation("Startup // ApplicationInsightsConnectionString = {applicationInsightsConnectionString}", applicationInsightsConnectionString);
    }
}

void ConfigureMockableClients(IServiceCollection services, IConfiguration config)
{
    MockSettings mockSettings = config.GetSection("MockSettings").Get<MockSettings>() ?? new MockSettings(false);

    if (mockSettings.PDP)
    {
        services.AddTransient<IPDP, MockPDP>();
    }
    else 
    {
        services.AddTransient<IPDP, PDPAppSI>();
    }

    if (mockSettings.AccessManagement)
    {
        services.AddHttpClient<IAccessManagementClient, AccessManagementClientMock>();
    }
    else
    {
        services.AddHttpClient<IAccessManagementClient, AccessManagementClient>();
    }

    if (mockSettings.AccessManagement_V0)
    {
        services.AddHttpClient<IAccessManagementClientV0, AccessManagementClientV0Mock>();
    }
    else
    {
        services.AddHttpClient<IAccessManagementClientV0, AccessManagementClientV0>();
    }

    if (mockSettings.Profile)
    {
        services.AddHttpClient<IProfileClient, ProfileClientMock>();
    }
    else
    {
        services.AddHttpClient<IProfileClient, ProfileClient>();
    }

    if (mockSettings.AccessPackage)
    {
        services.AddHttpClient<IAccessPackageClient, AccessPackageClientMock>();
    }
    else
    {
        services.AddHttpClient<IAccessPackageClient, AccessPackageClient>();
    }

    if (mockSettings.RightHolder)
    {
        services.AddHttpClient<IRightHolderClient, RightHolderClientMock>();
    }
    else
    {
        services.AddHttpClient<IRightHolderClient, RightHolderClient>();
    }

    if (mockSettings.Register)
    {
        services.AddHttpClient<IRegisterClient, RegisterClientMock>();
    }
    else
    {
        services.AddHttpClient<IRegisterClient, RegisterClient>();
    }

    if (mockSettings.ResourceRegistry)
    {
        services.AddSingleton<IResourceRegistryClient, ResourceRegistryClientMock>();
    }
    else
    {
        services.AddSingleton<IResourceRegistryClient, ResourceRegistryClient>();
    }

    if (mockSettings.KeyVault)
    {
        services.AddSingleton<IKeyVaultService, LocalKeyVaultService>();
    }
    else
    {
        services.AddSingleton<IKeyVaultService, KeyVaultService>();
    }

    if (mockSettings.SystemRegister)
    {
        services.AddSingleton<ISystemRegisterClient, SystemRegisterClientMock>();
    }
    else
    {
        services.AddSingleton<ISystemRegisterClient, SystemRegisterClient>();
    }

    if (mockSettings.SystemUser)
    {
        services.AddSingleton<ISystemUserClient, SystemUserClientMock>();
        services.AddSingleton<ISystemUserRequestClient, SystemUserRequestClientMock>();
        services.AddSingleton<ISystemUserChangeRequestClient, SystemUserChangeRequestClientMock>();
    }
    else
    {
        services.AddSingleton<ISystemUserClient, SystemUserClient>();
        services.AddSingleton<ISystemUserRequestClient, SystemUserRequestClient>();
        services.AddSingleton<ISystemUserChangeRequestClient, SystemUserChangeRequestClient>();
    }

    if (mockSettings.SystemUserAgentDelegation)
    {
        services.AddSingleton<ISystemUserAgentRequestClient, SystemUserAgentRequestClientMock>();
        services.AddSingleton<ISystemUserAgentDelegationClient, SystemUserAgentDelegationClientMock>();
    }
    else
    {
        services.AddSingleton<ISystemUserAgentRequestClient, SystemUserAgentRequestClient>();
        services.AddSingleton<ISystemUserAgentDelegationClient, SystemUserAgentDelegationClient>();
    }

    if (mockSettings.Consent)
    {
        services.AddSingleton<IConsentClient, ConsentClientMock>();
    }
    else
    {
        services.AddSingleton<IConsentClient, ConsentClient>();
    }
}
using Altinn.AccessManagement.UI.Configuration;
using Altinn.AccessManagement.UI.Extensions;
using Altinn.AccessManagement.UI.Filters;
using Altinn.AccessManagement.UI.Integrations;
using Altinn.AccessManagement.UI.Integrations.Client;
using Altinn.AccessManagement.UI.Integrations.Profile.Models;
using Altinn.AccessManagement.UI.Mappers;
using Altinn.AccessManagement.UI.Models;
using Altinn.AccessManagement.UI.Services;
using AltinnCore.Authentication.JwtCookie;
using Azure.Identity;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;


namespace Altinn.AccessManagement.UI;

public static class Startup
{
    public static WebApplicationBuilder ConfigureServices(this WebApplicationBuilder builder)
    {
        builder.AddAppsettings();
        builder.AddDefaults();
        builder.AddServices();
        builder.AddIntegrations();
        builder.AddMappers();
        builder.AddAuthentication();
        builder.AddAntiforgery();
        builder.AddSwagger();
        return builder;
    }

    private static void AddAppsettings(this WebApplicationBuilder builder)
    {
        if (!builder.Environment.IsDevelopment())
        {
            builder.Configuration.AddAzureKeyVault(new Appsettings(builder.Configuration).KeyvaultSettings.SecretUri, new DefaultAzureCredential());
        }

        builder.Services.Configure<Appsettings>(builder.Configuration.Bind);
    }

    private static void AddServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddSingleton<IActorsService, ActorsService>();
    }

    private static void AddIntegrations(this WebApplicationBuilder builder)
    {
        builder.Services.AddSingleton<RequestComposer>();
        builder.Services.AddSingleton<IIntegrations, IntegrationsContainer>();
        builder.Services.AddSingleton<IProfileIntegration, ProfileIntegration>();
        builder.Services.AddSingleton<IRegisterIntegration, RegisterIntegration>();
    }

    private static void AddMappers(this WebApplicationBuilder builder)
    {
        builder.Services.AddSingleton<IMapper<ProfileUserModel, UserModel>, ActorsMapper>();
    }

    private static void AddDefaults(this WebApplicationBuilder builder)
    {
        builder.Services.AddControllersWithViews();
        builder.Services.AddMemoryCache();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddApplicationInsightsTelemetry();
        builder.Services.ConfigureDataProtection();
    }

    private static void AddSwagger(this WebApplicationBuilder builder)
    {
        builder.Services.AddSwaggerGen(options =>
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
    }

    private static void AddAntiforgery(this WebApplicationBuilder builder)
    {
        builder.Services.AddAntiforgery(options =>
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

        builder.Services.TryAddSingleton<ValidateAntiforgeryTokenIfAuthCookieAuthorizationFilter>();
    }

    private static void AddAuthentication(this WebApplicationBuilder builder)
    {
        builder.Services.AddAuthentication(JwtCookieDefaults.AuthenticationScheme)
            .AddJwtCookie(JwtCookieDefaults.AuthenticationScheme, options =>
            {
                var appsettings = new Appsettings(builder.Configuration);
                options.JwtCookieName = appsettings.PlatformSettings.JwtCookieName;
                options.MetadataAddress = appsettings.PlatformSettings.OpenIdWellKnownEndpoint;
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
    }

    public static WebApplication ConfigureMiddlewares(WebApplication app)
    {
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

        return app;
    }
}
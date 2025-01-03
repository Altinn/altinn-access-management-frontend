﻿using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;

namespace Altinn.AccessManagement.UI.Tests
{
    /// <summary>
    /// CustomWebApplicationFactory for integration tests
    /// </summary>
    /// <typeparam name="TStartup">Entrypoint</typeparam>
    public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup>
       where TStartup : class
    {
        /// <summary>
        /// ConfigureWebHost for setup of configuration and test services
        /// </summary>
        /// <param name="builder">IWebHostBuilder</param>
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Test");
            builder.ConfigureAppConfiguration(config =>
            {
                config.AddConfiguration(new ConfigurationBuilder()
                    .AddJsonFile("appsettings.test.json")
                    .Build());
            });

            builder.UseEnvironment("Test");
        }
    }
}

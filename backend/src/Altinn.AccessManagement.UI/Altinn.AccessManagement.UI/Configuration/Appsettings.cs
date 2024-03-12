namespace Altinn.AccessManagement.UI.Configuration;

public class Appsettings
{
    public Appsettings()
    {
    }

    public Appsettings(IConfiguration configuration)
        => configuration.Bind(this);

    public PlatformOptions PlatformSettings { get; set; }

    public GeneralOptions GeneralSettings { get; set; }

    public KeyVaultOptions KeyvaultSettings { get; set; }
}
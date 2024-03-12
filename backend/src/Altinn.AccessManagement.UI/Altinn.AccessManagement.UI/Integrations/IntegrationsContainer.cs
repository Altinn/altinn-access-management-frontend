namespace Altinn.AccessManagement.UI.Integrations;

public interface IIntegrations
{
    IProfileIntegration Profile { get; }

    IRegisterIntegration Register { get; }
}

public class IntegrationsContainer(
    IProfileIntegration profile,
    IRegisterIntegration register) : IIntegrations
{
    public IProfileIntegration Profile { get; } = profile;

    public IRegisterIntegration Register { get; } = register;
}
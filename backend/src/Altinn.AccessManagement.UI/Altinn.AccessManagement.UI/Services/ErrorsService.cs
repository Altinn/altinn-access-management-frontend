using Altinn.AccessManagement.UI.Integrations.Client;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Services;

public interface IErrorsService
{
    ProblemDetailsContext Handle(Func<ProblemDetails> fallback);
}

public class ErrorsService(IHttpContextAccessor accessor)
{
    private IHttpContextAccessor Accessor { get; } = accessor;

    private List<Func<IExceptionHandlerFeature, ProblemDetails>> Handlers => [
        HandleIntegrationException,
    ];

    public ProblemDetails Handle(Func<ProblemDetails> fallback)
    {
        var exception = Accessor.HttpContext.Features.Get<IExceptionHandlerFeature>()!;

        foreach (var handler in Handlers)
        {
            if (handler(exception) is var result && result != null)
            {
                return result;
            }
        }

        return fallback();
    }

    public ProblemDetails HandleIntegrationException(IExceptionHandlerFeature feature)
    {
        if (feature.Error is IntegrationException ex)
        {
            return new();
        }

        return null;
    }
}
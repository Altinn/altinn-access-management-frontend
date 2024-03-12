namespace Altinn.AccessManagement.UI.Mappers;

public interface IMapper<TFrom, TTo>
    where TTo : new()
{
    TTo Map(TFrom from);
}

﻿namespace Altinn.AccessManagement.UI.Core.Models.Common;

/// <summary>
/// EntityVariant
/// </summary>
public class EntityVariant
{
    /// <summary>
    /// Id
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// TypeId
    /// </summary>
    public Guid TypeId { get; set; }

    /// <summary>
    /// Name
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Description
    /// </summary>
    public string Description { get; set; }
}

/// <summary>
/// Extended EntityVariant
/// </summary>
public class ExtEntityVariant : EntityVariant
{
    /// <summary>
    /// Type
    /// </summary>
    public EntityType Type { get; set; }
}
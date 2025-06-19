﻿using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage;

/// <summary>
/// Permission
/// </summary>
public class Permission
{
    /// <summary>
    /// From party
    /// </summary>
    public CompactEntity From { get; set; }

    /// <summary>
    /// To party
    /// </summary>
    public CompactEntity To { get; set; }

    /// <summary>
    /// Via party
    /// </summary>
    public CompactEntity Via { get; set; }

    /// <summary>
    /// Role
    /// </summary>
    public CompactRole Role { get; set; }

    /// <summary>
    /// Via role
    /// </summary>
    public CompactRole ViaRole { get; set; }
}

/// <summary>
/// Permission
/// </summary>
public class CompactPermission
{
    /// <summary>
    /// From party
    /// </summary>
    public CompactEntity From { get; set; }

    /// <summary>
    /// To party
    /// </summary>
    public CompactEntity To { get; set; }
}
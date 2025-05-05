﻿using Altinn.AccessManagement.UI.Core.Models.Role;

namespace Altinn.AccessMgmt.Core.Models;

/// <summary>
/// Generated view for assignments and delegations
/// </summary>
public class Connection
{
    /// <summary>
    /// Identity, either assignment og delegation
    /// </summary>
    public Guid Id { get; set; } // AssignmentId or DelegationId

    /// <summary>
    /// The entity identity the connection is from (origin, client, source etc) 
    /// </summary>
    public Guid? FromId { get; set; }

    /// <summary>
    /// The role To identifies as
    /// </summary>
    public Guid RoleId { get; set; }

    /// <summary>
    /// The entity identity the connection is to (destination, agent, etc)
    /// </summary>
    public Guid? ToId { get; set; }

    /// <summary>
    /// The entity betweeen from and to. When connection is delegated.
    /// </summary>
    public Guid? FacilitatorId { get; set; }

    /// <summary>
    /// The role the facilitator has to the client
    /// </summary>
    public Guid? FacilitatorRoleId { get; set; }

    /// <summary>
    /// Text hint for reason
    /// </summary>
    public string Source { get; set; }

    /// <summary>
    /// Indicate that connection is a direct assignment
    /// </summary>
    public bool IsDirect { get; set; }

    /// <summary>
    /// Indicate that connection is from a parent/child relation
    /// </summary>
    public bool IsParent { get; set; }

    /// <summary>
    /// Indicate that connection is a result of a role to role mapping
    /// </summary>
    public bool IsRoleMap { get; set; }

    /// <summary>
    /// Indicate that connection is a inheirited with a keyrole
    /// </summary>
    public bool IsKeyRole { get; set; }
}

/// <summary>
/// Extended Connection
/// </summary>
public class ExtConnection : Connection
{
    /// <summary>
    /// The delegation connecting the assignments
    /// </summary>
    public Delegation Delegation { get; set; }

    /// <summary>
    /// The entity the connection is from (origin, client, source etc)
    /// For Assignments this is From for Delegations this is From.From
    /// </summary>
    public Entity From { get; set; }

    /// <summary>
    /// The role To identifies as either to From or to Facilitator
    /// </summary>
    public Role Role { get; set; }

    /// <summary>
    /// The entity the connection is to (destination, agent, etc)
    /// For Assignments this is To for Delegations this is To.To
    /// </summary>
    public Entity To { get; set; }

    /// <summary>
    /// The entity betweeen from and to. When connection is delegated.
    /// </summary>
    public Entity Facilitator { get; set; }

    /// <summary>
    /// The role the facilitator has to the client 
    /// </summary>
    public Role FacilitatorRole { get; set; }
}

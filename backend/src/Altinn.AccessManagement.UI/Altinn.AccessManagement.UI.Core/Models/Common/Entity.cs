﻿using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Models.User;

namespace Altinn.AccessManagement.UI.Core.Models.Common
{
    /// <summary>
    /// Entity
    /// </summary>
    public class Entity
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
        /// VariantId
        /// </summary>
        public Guid VariantId { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// RefId
        /// </summary>
        public string RefId { get; set; }

        /// <summary>
        /// Parent identifier
        /// </summary>
        public Guid? ParentId { get; set; }
    }

    /// <summary>
    /// Extended Entity
    /// </summary>
    public class ExtEntity : Entity
    {
        /// <summary>
        /// Type
        /// </summary>
        public EntityType Type { get; set; }

        /// <summary>
        /// Variant
        /// </summary>
        public EntityVariant Variant { get; set; }

        /// <summary>
        /// Parent
        /// </summary>
        public Entity Parent { get; set; }
    }

    /// <summary>
    /// Compact Entity Model
    /// </summary>
    public class CompactEntity
    {
        /// <summary>
        /// Id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Type
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Variant
        /// </summary>
        public string Variant { get; set; }

        /// <summary>
        /// Parent
        /// </summary>
        public CompactEntity Parent { get; set; }

        /// <summary>
        /// Children
        /// </summary>
        public List<CompactEntity> Children { get; set; }

        /// <summary>
        /// Values from entityLookup. Allowed keys:
        /// - OrganizationIdentifier
        /// - PartyId
        /// - DateOfBirth
        /// </summary>
        [JsonConverter(typeof(AllowedKeysDictionaryConverter))]
        public Dictionary<string, string> KeyValues { get; set; }
    }
}
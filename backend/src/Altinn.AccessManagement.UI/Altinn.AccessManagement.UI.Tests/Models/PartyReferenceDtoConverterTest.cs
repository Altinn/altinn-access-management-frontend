using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Models.Request;

namespace Altinn.AccessManagement.UI.Tests.Models
{
    /// <summary>
    ///     Tests that requests from the access management API deserialize whether LastUpdatedBy comes as an
    ///     object (current shape) or as a bare uuid string (legacy shape).
    /// </summary>
    public class PartyReferenceDtoConverterTest
    {
        private static readonly JsonSerializerOptions Options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        [Fact]
        public void Read_ObjectShape_ReadsIdAndName()
        {
            string json = """{ "lastUpdatedBy": { "id": "05bbad70-90db-4900-8f29-0a09cf6db1af", "name": "Sein Dyktig Mår" } }""";

            RequestDto request = JsonSerializer.Deserialize<RequestDto>(json, Options);

            Assert.Equal(Guid.Parse("05bbad70-90db-4900-8f29-0a09cf6db1af"), request.LastUpdatedBy.Id);
            Assert.Equal("Sein Dyktig Mår", request.LastUpdatedBy.Name);
        }

        [Fact]
        public void Read_LegacyUuidShape_ReadsIdWithoutName()
        {
            string json = """{ "lastUpdatedBy": "05bbad70-90db-4900-8f29-0a09cf6db1af" }""";

            RequestDto request = JsonSerializer.Deserialize<RequestDto>(json, Options);

            Assert.Equal(Guid.Parse("05bbad70-90db-4900-8f29-0a09cf6db1af"), request.LastUpdatedBy.Id);
            Assert.Null(request.LastUpdatedBy.Name);
        }

        [Fact]
        public void Read_ObjectShape_NullName_ReadsIdWithoutName()
        {
            string json = """{ "lastUpdatedBy": { "id": "05bbad70-90db-4900-8f29-0a09cf6db1af", "name": null } }""";

            RequestDto request = JsonSerializer.Deserialize<RequestDto>(json, Options);

            Assert.Equal(Guid.Parse("05bbad70-90db-4900-8f29-0a09cf6db1af"), request.LastUpdatedBy.Id);
            Assert.Null(request.LastUpdatedBy.Name);
        }

        [Fact]
        public void Read_ObjectShape_MissingName_ReadsIdWithoutName()
        {
            string json = """{ "lastUpdatedBy": { "id": "05bbad70-90db-4900-8f29-0a09cf6db1af" } }""";

            RequestDto request = JsonSerializer.Deserialize<RequestDto>(json, Options);

            Assert.Equal(Guid.Parse("05bbad70-90db-4900-8f29-0a09cf6db1af"), request.LastUpdatedBy.Id);
            Assert.Null(request.LastUpdatedBy.Name);
        }

        [Fact]
        public void Read_NullObject_GivesNull()
        {
            string json = """{ "lastUpdatedBy": null }""";

            RequestDto request = JsonSerializer.Deserialize<RequestDto>(json, Options);

            Assert.Null(request.LastUpdatedBy);
        }

        [Fact]
        public void Read_AbsentProperty_GivesNull()
        {
            RequestDto request = JsonSerializer.Deserialize<RequestDto>("{ }", Options);

            Assert.Null(request.LastUpdatedBy);
        }

        [Fact]
        public void Read_EmptyObject_GivesEmptyId()
        {
            string json = """{ "lastUpdatedBy": { } }""";

            RequestDto request = JsonSerializer.Deserialize<RequestDto>(json, Options);

            Assert.Equal(Guid.Empty, request.LastUpdatedBy.Id);
            Assert.Null(request.LastUpdatedBy.Name);
        }

        [Fact]
        public void Read_ObjectShape_NullId_GivesEmptyId()
        {
            string json = """{ "lastUpdatedBy": { "id": null, "name": "Sein Dyktig Mår" } }""";

            RequestDto request = JsonSerializer.Deserialize<RequestDto>(json, Options);

            Assert.Equal(Guid.Empty, request.LastUpdatedBy.Id);
            Assert.Equal("Sein Dyktig Mår", request.LastUpdatedBy.Name);
        }

        [Fact]
        public void Read_UnknownProperties_AreSkipped()
        {
            string json = """{ "lastUpdatedBy": { "id": "05bbad70-90db-4900-8f29-0a09cf6db1af", "variant": { "nested": [1, 2] }, "name": "Sein Dyktig Mår" } }""";

            RequestDto request = JsonSerializer.Deserialize<RequestDto>(json, Options);

            Assert.Equal(Guid.Parse("05bbad70-90db-4900-8f29-0a09cf6db1af"), request.LastUpdatedBy.Id);
            Assert.Equal("Sein Dyktig Mår", request.LastUpdatedBy.Name);
        }

        [Fact]
        public void Read_UnexpectedToken_Throws()
        {
            string json = """{ "lastUpdatedBy": 42 }""";

            Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<RequestDto>(json, Options));
        }

        [Fact]
        public void Write_WritesObjectShape()
        {
            PartyReferenceDto party = new PartyReferenceDto
            {
                Id = Guid.Parse("05bbad70-90db-4900-8f29-0a09cf6db1af"),
                Name = "Sein Dyktig Maar"
            };

            string json = JsonSerializer.Serialize(party, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

            Assert.Equal("""{"id":"05bbad70-90db-4900-8f29-0a09cf6db1af","name":"Sein Dyktig Maar"}""", json);
        }
    }
}

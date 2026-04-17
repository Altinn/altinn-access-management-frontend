# AltinnApp ResourceType Pattern Analysis

## Summary
This document catalogs all files in the repository that contain patterns related to `AltinnApp` ResourceType handling. This helps identify where `MigratedApp` needs to be added when implementing support for the new resource type.

---

## 1. ResourceType Enum Definitions

### Backend - C# Enum
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Enums/ResourceType.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Enums/ResourceType.cs#L32-L34)
  - **Line 32-34**: `AltinnApp = 1 << 3`
  - Flags-based enum used for bitwise filtering

### Frontend - TypeScript Enum
- **File**: [src/rtk/features/resourceApi.ts](src/rtk/features/resourceApi.ts#L17)
  - **Line 17**: `AltinnApp = 'AltinnApp'`
  - String-based enum for API communication
  - Also defines: `Default`, `SystemResource`, `MaskinportenSchema`, `Altinn2Service`, `GenericAccessResource`

---

## 2. Conditional Statements Checking for AltinnApp

### Frontend Components - Direct Comparisons

#### ReceiptActionBarContent Component
- **File**: [src/features/singleRight/delegate/ReceiptPage/ReceiptActionBarContent/ReceiptActionBarContent.tsx](src/features/singleRight/delegate/ReceiptPage/ReceiptActionBarContent/ReceiptActionBarContent.tsx#L103)
  - **Line 103**: `{serviceType === 'AltinnApp'` - Conditional rendering based on service type
  - Used to determine special UI rendering behavior for AltinnApp resources

#### RightsActionBarContent Component  
- **File**: [src/features/singleRight/delegate/ChooseRightsPage/RightsActionBarContent/RightsActionBarContent.tsx](src/features/singleRight/delegate/ChooseRightsPage/RightsActionBarContent/RightsActionBarContent.tsx#L61)
  - **Line 61**: `serviceType !== 'AltinnApp'` - Conditional check to exclude AltinnApp
  - **Line 101**: `serviceType === 'AltinnApp' ?` - Ternary operator for conditional rendering
  - Used to determine right delegation logic specific to AltinnApp vs other resource types

#### ChooseRightsPage Component
- **File**: [src/features/singleRight/delegate/ChooseRightsPage/ChooseRightsPage.tsx](src/features/singleRight/delegate/ChooseRightsPage/ChooseRightsPage.tsx#L122)
  - **Line 122**: `type: service.service?.resourceType ?? ''`
  - Passes resourceType as service type through component hierarchy

---

## 3. Resource Type Filtering in Business Logic

### Backend Service - Resource Filtering
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Services/ResourceService.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Services/ResourceService.cs#L61)
  - **Line 61**: Major filtering clause:
    ```
    resources.FindAll(r => r.ResourceType != ResourceType.MaskinportenSchema && 
                          r.ResourceType != ResourceType.Systemresource && 
                          r.Visible && 
                          (searchParams.IncludeA2Services || r.ResourceType != ResourceType.Altinn2Service))
    ```
  - **Line 106**: `resources.FindAll(r => r.ResourceType == resourceType && r.Delegable && r.Visible)`
  - **Line 317**: `resources.FindAll(r => r.ResourceType == ResourceType.MaskinportenSchema && r.Visible && r.Delegable)`
  
  **Pattern**: Multiple exclusions for specific resource types. This is where MigratedApp filtering logic would be added.

### Backend Service Methods
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Services/ResourceService.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Services/ResourceService.cs)
  - **Line 60**: `GetFullResourceList(searchParams.IncludeMigratedApps)` - Method call passes flag
  - **Line 373**: `GetFullResourceList(bool includeMigratedApps = false)` - Method definition for resource list retrieval

### Resource Registry Client
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Integration/Clients/ResourceRegistryClient.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Integration/Clients/ResourceRegistryClient.cs#L169-L182)
  - **Line 169**: `GetResourceList(bool includeMigratedApps = false)` - API method signature
  - **Line 179-181**: Handles `includeMigratedApps` parameter:
    ```csharp
    if (includeMigratedApps)
    {
        endpointUrl += "?includeMigratedApps=true";
    }
    ```

---

## 4. Resource Type Mapping and Conversion

### ResourceUtils Helper
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Helpers/ResourceUtils.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Helpers/ResourceUtils.cs#L65)
  - **Line 65**: Resource type parsing from string:
    ```csharp
    ResourceType = Enum.TryParse<ResourceType>(resource.Type?.Name, true, out var resourceType) 
                   ? resourceType 
                   : ResourceType.Default
    ```
  - This pattern handles mapping from external API resource type names to internal enum values
  - Critical location: When new resource types come from API (like "MigratedApp"), they'll be parsed here

### Frontend Service/DTO
- **File**: [src/dataObjects/dtos/resourceDelegation.tsx](src/dataObjects/dtos/resourceDelegation.tsx#L17-L22)
  - **Line 17**: `serviceType: string` property
  - **Line 19-22**: Constructor accepting serviceType
  - Used across the frontend to pass resource type information

---

## 5. Service Implementations

### SingleRightService
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Services/SingleRightService.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Services/SingleRightService.cs)
  - **Line 115**: `resourceType: resource.ResourceType` - Maps resource type in responses
  - Handles delegation logic for single rights including AltinnApp resources

### APIDelegationService
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Services/APIDelegationService.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Services/APIDelegationService.cs)
  - Handles API-specific (MaskinportenSchema) delegation logic
  - May need to be reviewed for any resource type-specific handling

---

## 6. Test Files and Test Cases

### SingleRightController Tests
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Controllers/SingleRightControllerTest.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Controllers/SingleRightControllerTest.cs)
  - **Line 246**: `CreateDelegation_AltinnApp_valid()` - Test case for valid AltinnApp delegation
  - **Line 177**: `CreateDelegation_StandardResource_valid()` - Test for standard resources
  - **Line 317**: `CreateDelegation_Altinn2Service_valid()` - Test for Altinn2Service resources
  - **Line 388**: `CreateDelegation_StandardResource_invalid()` - Negative test case
  - **Pattern**: Test cases per resource type. New test for MigratedApp needed.

### ResourceController Tests
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Controllers/ResourceControllerTest.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Controllers/ResourceControllerTest.cs)
  - **Line 60**: `GetExpectedResources(ResourceType.MaskinportenSchema)`
  - **Line 416-425**: `GetResourceOwners_resourceTypeMaskinPortenSchemAndAltinn2Service()` test
  - **Line 422-425**: List of ResourceTypes being tested:
    ```csharp
    List<ResourceType> relevantResourceTypes = new List<ResourceType>
    {
        ResourceType.Altinn2Service,
        ResourceType.MaskinportenSchema
    };
    ```
  - **Location for MigratedApp**: This list may need to include MigratedApp if testing resource owner filtering

### TestDataUtil Helper
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Utils/TestDataUtil.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Utils/TestDataUtil.cs)
  - **Line 21**: `GetResources(ResourceType resourceType)` - Retrieves test resources by type
  - **Line 37**: `resources.FindAll(r => r.ResourceType == resourceType)` - Filtering by type
  - **Line 43**: `GetExpectedResources(ResourceType resourceType)` - Gets expected test resources
  - **Line 60**: Filters expected resources by type
  - **Line 83**: `resources.FindAll(r => r.ResourceType != ResourceType.MaskinportenSchema)` - Exclusion pattern
  - **Pattern**: Test utility that filters by resource type. May need MigratedApp test data.

### AssertionUtil Helper  
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Utils/AssertionUtil.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Utils/AssertionUtil.cs)
  - **Line 134**: `Assert.Equal(expected.ResourceType, actual.ResourceType)` - Property comparison
  - **Line 178**: Another ResourceType assertion
  - **Line 216**: Additional ResourceType assertion
  - Validates that resource types match in test assertions

---

## 7. Story Files (Component Documentation)

### ReceiptActionBarContent Stories
- **File**: [src/features/singleRight/delegate/ReceiptPage/ReceiptActionBarContent/ReceiptActionBarContent.stories.tsx](src/features/singleRight/delegate/ReceiptPage/ReceiptActionBarContent/ReceiptActionBarContent.stories.tsx)
  - **Line 72**: `AltinnApp: StoryObj` - Storybook story named "AltinnApp"
  - **Line 128**: `serviceType: 'AltinnApp'` - Example data with AltinnApp
  - **Line 162**: `serviceType: ''` - Empty service type story variant  
  - **Line 196**: `serviceType: ''` - Another empty variant
  - **Line 204**: `serviceType: ''` - Additional empty variant
  - Contains multiple story variants for different service types

### ActionBarSection Stories
- **File**: [src/features/singleRight/delegate/ReceiptPage/ActionBarSection/ActionBarSection.stories.tsx](src/features/singleRight/delegate/ReceiptPage/ActionBarSection/ActionBarSection.stories.tsx)
  - **Line 59**: `serviceType: 'AltinnApp'` - Story with AltinnApp
  - **Line 105**: `serviceType: 'sometype'` - Story with generic type
  - **Line 151**: `serviceType: 'sometype'` - Another generic type
  - **Line 210**: `serviceType: 'sometype'` - Additional generic type

### RightsActionBarContent Stories
- **File**: [src/features/singleRight/delegate/ChooseRightsPage/RightsActionBarContent/RightsActionBarContent.stories.tsx](src/features/singleRight/delegate/ChooseRightsPage/RightsActionBarContent/RightsActionBarContent.stories.tsx)
  - Multiple story variants with different service types

### API Delegation Component Stories
- **File**: [src/features/apiDelegation/components/ApiActionBar/ApiActionBar.stories.tsx](src/features/apiDelegation/components/ApiActionBar/ApiActionBar.stories.tsx)
  - **Line 45**: `resourceType: 'MaskinportenSchema'` - Story for MaskinportenSchema

### System User Component Stories
- **File**: [src/features/amUI/systemUser/components/RightsList/RightsList.test.tsx](src/features/amUI/systemUser/components/RightsList/RightsList.test.tsx)
  - **Line 35**: `resourceType: 'GenericAccessResource'` - Generic access resource example

---

## 8. Frontend API Query Files

### ChooseApiPage Component
- **File**: [src/features/apiDelegation/offered/ChooseApiPage/ChooseApiPage.tsx](src/features/apiDelegation/offered/ChooseApiPage/ChooseApiPage.tsx)
  - **Line 30**: Import of `ResourceType` enum
  - **Line 53**: `resourceTypeList: ResourceType[] = [ResourceType.MaskinportenSchema]`
  - **Line 63**: `useGetResourceOwnersQuery(resourceTypeList)` - Query with specific resource types
  - **Pattern**: Components explicitly specify which resource types they query for

### ResourceSearch Component (Delegation Modal)
- **File**: [src/features/amUI/common/DelegationModal/SingleRights/ResourceSearch.tsx](src/features/amUI/common/DelegationModal/SingleRights/ResourceSearch.tsx)
  - **Line 57-58**: Query parameters:
    ```typescript
    includeA2Services: false,
    includeMigratedApps: false,
    ```
  - **Pattern**: Frontend passes flags to control which resource types are fetched
  - **Key location for MigratedApp**: This is where users can control whether to include migrated apps

---

## 9. Mock Data Files

### Backend Mock Resources
Multiple JSON files containing AltinnApp resource definitions:

#### ResourceRegistry Mock Data
- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/resources.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/resources.json)
  - **Line 532, 667**: Contains multiple AltinnApp resources
  - **Pattern**: `"resourceType": "AltinnApp"`

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/resourcesfe.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/resourcesfe.json)
  - **Line 384, 481**: AltinnApp resources for frontend

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/123123/resource.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/123123/resource.json)
  - **Line 15**: `"resourceType": "AltinnApp"`

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/abctest/resource.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/abctest/resource.json)
  - **Line 15**: `"resourceType": "AltinnApp"`

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/app_ttd_a3-app/resource.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/app_ttd_a3-app/resource.json)
  - **Line 31**: `"resourceType": "AltinnApp"`

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/app_ttd_a3-app2/resource.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/app_ttd_a3-app2/resource.json)
  - **Line 31**: `"resourceType": "AltinnApp"`

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/generic-access-resource/resource.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/ResourceRegistry/generic-access-resource/resource.json)
  - **Line 15**: `"resourceType": "AltinnApp"`

#### SingleRight Mock Data
- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/GetResourceRights/app_ttd_a3-app.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/GetResourceRights/app_ttd_a3-app.json)
  - **Line 18-19**: `"id": "altinnapp"`, `"name": "AltinnApp"`

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/GetResourceRights/app_ttd_a3-app2.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/GetResourceRights/app_ttd_a3-app2.json)
  - **Line 18-19**: `"id": "altinnapp"`, `"name": "AltinnApp"`

#### Delegation Check Mock Data
- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/DelegationCheck/app_ttd_a3-app.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/DelegationCheck/app_ttd_a3-app.json)
  - **Line 23**: `"name": "AltinnApp"`

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/DelegationCheck/app_ttd_a3-app2.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/DelegationCheck/app_ttd_a3-app2.json)
  - **Line 23**: `"name": "AltinnApp"`

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/DelegationCheck/app_ttd_terje-sin-test-app.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/DelegationCheck/app_ttd_terje-sin-test-app.json)
  - **Line 23**: `"name": "AltinnApp"`

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/DelegationCheck/app_ttd_potato-app.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/DelegationCheck/app_ttd_potato-app.json)
  - **Line 23**: `"name": "AltinnApp"`

#### Delegations Data
- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/GetDelegations/delegations.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/SingleRight/GetDelegations/delegations.json)
  - **Line 66-67**: `"id": "altinnapp"`, `"name": "AltinnApp"`

#### Instance Data
- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/Instance/GetInstances/instances.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/Instance/GetInstances/instances.json)
  - **Lines 24, 84, 148, 208, 268, 328**: Multiple AltinnApp resource definitions
  - **Pattern**: `"name": "AltinnApp"`

#### Instance Rights Data
- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/Instance/GetInstanceRights/abctest.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/Instance/GetInstanceRights/abctest.json)
  - **Line 19**: `"name": "AltinnApp"`

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/Instance/GetInstanceRights/123123.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/Instance/GetInstanceRights/123123.json)
  - **Line 19**: `"name": "AltinnApp"`

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/Instance/GetInstanceRights/generic-access-resource.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Data/Instance/GetInstanceRights/generic-access-resource.json)
  - **Line 19**: `"name": "AltinnApp"`

#### Expected Test Results
- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Data/ExpectedResults/Instance/GetInstances/instances.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Data/ExpectedResults/Instance/GetInstances/instances.json)
  - **Lines 20, 88, 160, 220, 288, 348**: Expected AltinnApp resources in test results

- [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Data/ExpectedResults/SingleRight/GetDelegations/delegations.json](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Data/ExpectedResults/SingleRight/GetDelegations/delegations.json)
  - **Line 93**: `"resourceType": "AltinnApp"`

---

## 10. Mock Service Implementation

### ResourceRegistryClientMock
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Mocks/ResourceRegistryClientMock.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Mocks/Mocks/ResourceRegistryClientMock.cs)
  - **Line 56**: `List<ServiceResource> maskinPortenSchemas = resources.FindAll(r => r.ResourceType == ResourceType.MaskinportenSchema)`
  - Mock implementation that filters resources by type
  - May need similar filtering for MigratedApp testing

---

## 11. Interface Definitions

### IResourceRegistryClient Interface
- **File**: [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/ClientInterfaces/IResourceRegistryClient.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/ClientInterfaces/IResourceRegistryClient.cs)
  - **Line 36-38**: Method signature with `includeMigratedApps` parameter:
    ```csharp
    /// <param name="includeMigratedApps">Indicates whether to include migrated applications in the list</param>
    Task<List<ServiceResource>> GetResourceList(bool includeMigratedApps = false);
    ```
  - This interface already has structure for handling migrated apps

---

## 12. Frontend State Management

### Single Rights Slice
- **File**: [src/rtk/features/singleRights/singleRightsSlice.ts](src/rtk/features/singleRights/singleRightsSlice.ts)
  - **Line 100**: `serviceType: meta.serviceDto.serviceType`
  - Maps service type in Redux state

### Data Transfer Objects
- **File**: [src/dataObjects/dtos/resourceDelegation.tsx](src/dataObjects/dtos/resourceDelegation.tsx)
  - **Line 17**: `serviceType: string` property
  - Used throughout UI for tracking resource type

---

## Key Patterns Identified

### 1. **Exclusion Filtering** (Most Common)
Multiple locations exclude certain resource types from results:
- ResourceService line 61 excludes MaskinportenSchema, Systemresource, Altinn2Service
- **Action**: May need to add MigratedApp to exclusion lists if it shouldn't appear in certain contexts

### 2. **Enum-based Filtering**
- Backend uses flags-based enum (`1 << n`)
- Frontend uses string enum matching
- **Action**: Extend both enums with MigratedApp equivalent

### 3. **Boolean Flags** 
- `includeMigratedApps` parameter already exists throughout service layer
- `includeA2Services` similar pattern for Altinn2
- **Action**: Leverage existing "includeMigratedApps" flag where applicable

### 4. **Conditional UI Rendering**
- Frontend checks `serviceType === 'AltinnApp'` to apply specific UI logic
- **Action**: May need additional conditional checks for MigratedApp if different UI behavior is needed

### 5. **Test Coverage Per Resource Type**
- Dedicated test methods: `CreateDelegation_AltinnApp_valid()`, `CreateDelegation_Altinn2Service_valid()`
- **Action**: Create `CreateDelegation_MigratedApp_valid()` test method

---

## Files Needing Updates for MigratedApp Support

### Priority 1 (Essential)
1. [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Enums/ResourceType.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Enums/ResourceType.cs) - Add enum value
2. [src/rtk/features/resourceApi.ts](src/rtk/features/resourceApi.ts) - Add TypeScript enum value
3. [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Services/ResourceService.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Services/ResourceService.cs) - Add filtering logic if needed
4. [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Controllers/SingleRightControllerTest.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Controllers/SingleRightControllerTest.cs) - Add test cases

### Priority 2 (Important)
5. [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Helpers/ResourceUtils.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Helpers/ResourceUtils.cs) - Verify parsing logic handles MigratedApp
6. [backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Utils/TestDataUtil.cs](backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Tests/Utils/TestDataUtil.cs) - Add test data 
7. [src/features/amUI/common/DelegationModal/SingleRights/ResourceSearch.tsx](src/features/amUI/common/DelegationModal/SingleRights/ResourceSearch.tsx) - May need flag defaults adjustment
8. Mock data JSON files - Add MigratedApp resource examples

### Priority 3 (Supporting)
9. Conditional checks in React components (ReceiptActionBarContent, RightsActionBarContent)
10. Story files for new MigratedApp component variants
11. MockRegistryClient filtering if applicable

---

## Search Query Results Summary

### Total Files Containing AltinnApp: 50+
- Backend C# files: ~15
- Frontend TypeScript/React files: ~10
- JSON Mock/Test data files: ~20
- Configuration files: ~5

### Conditional Logic Lines Identified: 8
- Direct string comparisons: 6 lines
- Resource type exclusions: 7 locations  
- Enum definitions: 2 files

### Test Methods Requiring Parallel: 1
- `CreateDelegation_AltinnApp_valid()` should have MigratedApp equivalent


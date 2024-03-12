.PHONY: generate_profile

GEN_CSHARP=./generate_csharp.sh

all: csharp_profile csharp_register csharp_resource_registry csharp_access_management

csharp_profile:
	$(GEN_CSHARP) --file=altinn-profile.json --api=Profile

csharp_register:
	$(GEN_CSHARP) --file=altinn-register.json --api=Register

csharp_resource_registry:
	$(GEN_CSHARP) --file=altinn-resource-registry.json --api=ResourceRegistry

csharp_access_management:
	$(GEN_CSHARP) --file=altinn-access-management.json --api=AccessManagement

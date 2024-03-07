.PHONY: generate_profile

GEN_CSHARP=./generate_csharp.sh

csharp_profile:
	$(GEN_CSHARP) --file=altinn-platform-profile.openapi.yaml --api=Profile

csharp_register:
	$(GEN_CSHARP) --file=altinn-platform-register.openapi.yaml --api=Register

csharp_resource_registry:
	$(GEN_CSHARP) --file=altinn-platform-resourceregistry.openapi.yaml --api=ResourceRegistry


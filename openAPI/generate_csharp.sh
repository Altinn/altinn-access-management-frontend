#!/bin/bash

function usage()
{
    echo "Defaults for generating C# Models"
    echo ""
    echo "./generate_csharp.sh"
    echo "  -h --help"
    echo "  --file=openapi specification file"
    echo "  --api=name of the API"
    echo ""
}

FILE=""
API=""
BACKEND="../backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI"
SCHEMA_DIR="integrations"

while [ "$1" != "" ]; do
    PARAM=`echo $1 | awk -F= '{print $1}'`
    VALUE=`echo $1 | awk -F= '{print $2}'`
    case $PARAM in
        -h | --help)
            usage
            exit
            ;;
        --file)
            FILE=$VALUE
            ;;
        --api)
            API=$VALUE
            ;;
        *)
            echo "ERROR: unknown parameter \"$PARAM\""
            usage
            exit 1
            ;;
    esac
    shift
done

openapi-generator-cli generate --global-property models,modelDocs=false,modelTests=false \
-i $SCHEMA_DIR/$FILE \
-o $BACKEND \
-g csharp \
--skip-validate-spec \
--additional-properties=sourceFolder="Integrations",packageName=Models, \
--model-name-suffix=Model --model-name-prefix=$API --model-package $API \

for filename in $BACKEND/Integrations/Models/$API/*.cs; do
    [ -e "$filename" ] || continue
    echo "stripping faulty namespaces $filename"
    sed -i "/using OpenAPIDateConverter*/d" $filename
    sed -i "s/namespace Models.$API/namespace Altinn.AccessManagement.UI.Integrations.$API.Models/g" $filename
done
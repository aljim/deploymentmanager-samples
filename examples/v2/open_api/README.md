# Example of API with Swagger V2 API

## API

This API was generated using swagger-node
https://github.com/swagger-api/swagger-node

It exposes three type of resources to ilustrate different types of CRUD
variations collections that can be integrated with Deployment Manager.

### Body named resource

The resource has a property called name, inside the body

```yaml
paths:
/body_named_resource:
  post: ...
/body_named_resource/{resourceName}:
  get: ...
  put: ...
  delete: ...
```

### Server named resource

The resource has a property called name, but user does not specify this,
it gets generated on the server

```yaml
paths:
/server_named_resource:
  post: ...
/server_named_resource/{resourceName}:
  get: ...
  put: ...
  delete: ...
```

### Path named resource

```yaml
paths:
/named_resource/{resourceName}:
  post: ...
  get: ...
  put: ...
  delete: ...
```

### Running this sample

```shell
npm install -g swagger
npm install
swagger project test # To run the tests of this sample
swagger project start # To run this service
```

### Testing this service on Google Cloud, and using Deployment Manager

```shell
# Push service to AppEngine
gcloud app deploy

# Deploy typeProvider that points to this service
cd python
gcloud deployment-manager deployments create --config type_provider.py \
--properties=username:perrito,password:bonito custom-type

# Make a deployment that uses resources defined in the typeProvider
gcloud deployment-manager deployments update --config resources.py \
--properties=customTypeProvider:custom-type-type custom-resources

```

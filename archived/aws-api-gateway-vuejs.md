# AWS API-Gateway → VueJS

Serve a Vue SPA through API-Gateway.

```sh
aws cloudformation deploy \
  --stack-name vue-frontend-prod \
  --template-file ./cloudformation.yml
```

```yml
Description: Vue HTTP API-Gateway
Resources:
  FrontendApi:
    Type: AWS::ApiGatewayV2::Api
    Properties:
      Name: vue-prod-frontend
      ProtocolType: HTTP
      DisableExecuteApiEndpoint: true
      Tags:
        Environment: production
  FrontendIntegration:
    Type: AWS::ApiGatewayV2::Integration
    Properties:
      ApiId:
        Ref: FrontendApi
      IntegrationType: HTTP_PROXY
      IntegrationMethod: GET
      IntegrationUri: https://vue-prod-frontend.s3.amazonaws.com/index.html
      PayloadFormatVersion: 1.0
  FrontendStage:
    Type: AWS::ApiGatewayV2::Stage
    Properties:
      ApiId:
        Ref: FrontendApi
      StageName: $default
      AutoDeploy: true
  FrontendRootRoute:
    Type: AWS::ApiGatewayV2::Route
    Properties:
      ApiId:
        Ref: FrontendApi
      RouteKey: GET /
      Target:
        Fn::Join: ['/', ['integrations', { Ref: FrontendIntegration }]]
  FrontendAnyRoute:
    Type: AWS::ApiGatewayV2::Route
    Properties:
      ApiId:
        Ref: FrontendApi
      RouteKey: GET /{any+}
      Target:
        Fn::Join: ['/', ['integrations', { Ref: FrontendIntegration }]]
```

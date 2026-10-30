---
description: NestJS API conventions — envelope, errors by code, Swagger, DTO, thin controllers, tests, API collection
paths:
  - "server/**"
---

# Server API

Conventions for the NestJS API: response envelope, errors by code, Swagger, DTOs, thin controllers, tested services,
the API collection.

## Response envelope

- Global prefix: `api/1.0`.
- Every response leaves in `CommonResponse` `{ data, messages, fieldsErrors, resultCode }`: `ResponseInterceptor`
  and `HttpExceptionFilter` are bound globally in `server/src/bootstrap/configure-app.ts`, never per controller.
  Only the health check answers its own body (`@SkipEnvelope()`).
- Document success in Swagger with `@ApiResult` (`server/src/common/decorators/api-result.decorator.ts`) —
  `CommonResponse` schema + typed `data`.
- Document each error status with `@ApiErrorResult` (`server/src/common/decorators/api-error-result.decorator.ts`):
  text from `Docs.*` and the named cases the endpoint really answers, each a list of codes (with params and field) —
  the example is built from the catalogue. `ApiErrorCases` holds the shared ones (401 of the guards, 404).

## Errors by code

The client shows an error in the user's language by its code, so every error carries one.

- The code is a key of `ErrorMessages` (`server/src/common/constants/error-messages.ts`), its value the English
  text with named `{param}` placeholders. A new error is a new key there.
- Throw `AppException.of(status, code, params)` (`server/src/common/exceptions/app.exception.ts`); an internal
  failure behind it goes as `cause` — logged, never sent. A bare Nest exception gets the code of its status.
- Validation: every class-validator decorator takes `validationError(code, params)` from `@common/utils`;
  `ValidationPipe` turns each failed constraint into an item whose `field` is the dotted path (`exercises.0.name`).
- `fieldsErrors` holds the items `{ code, params, field?, message }`, `messages` their texts ("field - text").
- A route filter extends `HttpExceptionFilter` (`CaptchaCountExceptionFilter` on `/login` counts the failed
  sign-ins).

## Swagger per endpoint

Reference: `server/src/workout-lists/workout-lists.controller.ts`.

1. `@ApiTags(Docs.<CONTROLLER>)` on the class
2. `@ApiOperation({ summary: Docs.<ENDPOINT> })`
3. `@ApiBody({ type: X.Swagger.XDto })` for request body
4. `@ApiResult({ status, type: X.Swagger.XDto, description: Docs.<SUCCESS> })` for each success status (200 and 201
   when both apply)
5. `@ApiResult({ nullable: true })` when `data` can be `null`
6. `@ApiErrorResult` per error status with `Docs.<ERROR>` — every status the endpoint answers (guards, validation,
   service), not only success
7. Copy only from `server/src/common/constants/docs.ts`, no inline strings

## DTO naming and structure

| File suffix / namespace | Purpose | Example |
|-------------------------|---------|---------|
| `.request.ts` / `*Request` | POST/PUT/PATCH body | `CreateWorkoutListRequest` |
| `.response.ts` / `*Response` | Payload in `data` | `WorkoutListResponse` |
| `.query.ts` / `*Query` | Query params (`@Query()`) | `GetWorkoutHistoryQuery` |

When export response and import body share one JSON schema: canonical fields in `*.response.ts`; import
`*.request.ts` extends it (`ImportWorkoutListsRequest extends WorkoutListsExportFileResponse`).

Required namespace pattern:

```typescript
export namespace FooRequest {
  export class Dto { /* class-validator + @ApiProperty */ }
  export namespace Swagger {
    export class FooRequestDto extends Dto {}
  }
}
```

- Files: kebab-case (`create-workout-list.request.ts`).
- `dto/` folder + `index.ts` barrel re-exporting all module DTOs.
- Every field: `@ApiProperty` / `@ApiPropertyOptional` with `example` (and `enum`, `nullable` where needed).
- Request/Query DTO: `class-validator` + `validationError(code, params)` (§ Errors by code).
- Response DTO: constructor for mapping; nested DTOs as inner classes.

## DTO tests

- `<dto-name>.spec.ts` next to the DTO — required for all Request, Response, and Query DTOs.
- Request/Query: `validateDto` from `@test/unit/helpers` — happy path + key validation errors.
- Response: `checkForApiProperties(dto, Class)` — see `server/src/auth/dto/authentication.response.spec.ts`.

## Controller — thin

- Only: guards/filters/interceptors, `request.user.id`, service call, status code mapping when needed
  (`response.status(created ? 201 : 200)`).
- Business logic lives in the service only.
- Register static routes (`export`, `import`, `active`) before `/:id`.
- Every controller: `*.controller.spec.ts` — mock service, assert delegation and `userId` scoping.

## Service + tests

- `*.service.ts` — business logic, ownership checks, transactions.
- `*.service.spec.ts` — mock `@InjectModel` / `@InjectConnection`, cover happy path and exceptions.
- E2E for cross-cutting flows: `server/test/e2e/`.

## Sequelize models

- `@ApiProperty({ example, description })` on every column (see `workout-list.model.ts`).
- `synchronize: false`; schema via migrations.

## API collection

`server/test/api/set-forge.postman_collection.json` — the requests a tester would send, run by newman:
`npm run server:test:api -- --env-var baseUrl=<API origin>/api/1.0`. When adding or changing an endpoint, update it.

- Folder `api` runs in CI in order against an empty database, so it creates everything it needs: the user comes
  from `{{email}}` (generated per run) and `{{password}}`. Its subfolders mirror the controller modules.
- Folder `manual` holds what needs a person (the captcha); its description is the walk.
- One request per endpoint variant (happy path, key error cases); kebab-case names, the error case in parentheses.
- URL: `{{baseUrl}}/<module>/...`; protected routes `Bearer {{access_token}}`; chain ids via
  `pm.collectionVariables.set` in test scripts.
- Tests: the status and the essential fields of `data`; an error request asserts the `code`, `params` and `field`
  of every item. The collection-level test checks the envelope of every response.

## New endpoint checklist

1. DTO (namespace + Swagger + spec)
2. Service method + spec
3. Controller method + Swagger (success + all errors) + controller spec
4. Strings in `docs.ts` and `routes.ts`
5. Changed a business rule or flow? Update `docs/domains/<domain>.md` (invariant + its test) — the HTTP contract
   itself lives in the controller and Swagger
6. Error codes in `ErrorMessages`, decorators with `validationError` (§ Errors by code)
7. Update the API collection (`server/test/api/set-forge.postman_collection.json`)
8. E2E when needed

## Enforcement

| Rule | Checked by |
|---|---|
| DTO, controller and service specs pass | `npm run server:test:unit` |
| Imports order, curly braces | `npm run server:lint` · ESLint `curly` · ESLint `import/order` |
| Every response in the envelope, every error with its code | `npm run server:test:e2e` · `server/test/e2e/error-envelope.e2e-spec.ts` |
| The API collection passes against an empty database | `npm run server:test:api` · CI job `server-api` (`.github/workflows/e2e-tests.yml`) |
| Swagger decorators per endpoint, strings from `docs.ts`, spec for every DTO / controller / service, API collection updated, a code on every thrown error and decorator | ❌ review |

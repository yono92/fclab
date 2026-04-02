# Feature Specification: Core Schemas (API Types & DB Schema)

**Feature Branch**: `001-core-schemas`
**Created**: 2026-04-02
**Status**: Draft

## User Scenarios & Testing

### User Story 1 - Nexon API 데이터 안전한 수신 (Priority: P1)

서버가 Nexon OpenAPI를 호출할 때, 응답 데이터가 런타임에 Zod 스키마로 검증되어 예상치 못한 필드 변경이나 타입 불일치를 즉시 감지한다.

**Why this priority**: 모든 기능의 기반. 타입이 틀리면 분석 결과가 틀린다.

**Independent Test**: Zod 스키마로 실제 API 응답 예시를 파싱하여 성공/실패를 확인할 수 있다.

**Acceptance Scenarios**:

1. **Given** Nexon API가 정상 응답을 반환, **When** Zod 스키마로 파싱, **Then** 타입 안전한 객체가 반환된다
2. **Given** Nexon API가 예상과 다른 필드를 포함한 응답 반환, **When** Zod 스키마로 파싱, **Then** ZodError가 발생하고 어떤 필드가 문제인지 명시된다
3. **Given** Nexon API가 빈 배열을 반환, **When** 파싱, **Then** 빈 배열로 정상 처리된다

---

### User Story 2 - DB에 매치 데이터 캐싱 (Priority: P1)

검색된 유저의 매치 데이터가 Supabase PostgreSQL에 저장되어, 동일 요청 시 API를 재호출하지 않고 캐시에서 제공한다.

**Why this priority**: Rate Limit 관리 + 시계열 분석의 기반.

**Independent Test**: 매치 데이터를 DB에 삽입하고 조회하여 원본과 일치하는지 확인할 수 있다.

**Acceptance Scenarios**:

1. **Given** 매치 상세 데이터가 조회됨, **When** DB에 저장, **Then** matchId로 재조회 시 동일 데이터 반환
2. **Given** 이미 캐시된 매치, **When** 동일 matchId 요청, **Then** Nexon API를 호출하지 않고 DB에서 반환
3. **Given** 30일 이상 지난 캐시 데이터, **When** 조회, **Then** 갱신 필요 플래그가 설정된다

---

### User Story 3 - 메타데이터 동기화 (Priority: P2)

선수, 시즌, 포지션, 등급 등 메타데이터가 Supabase에 저장되어 API 호출 없이 즉시 참조 가능하다.

**Why this priority**: 선수 이름, 포지션명 등 UI 표시에 필수.

**Independent Test**: 메타데이터 동기화 함수 실행 후 DB에서 선수명을 spId로 조회할 수 있다.

**Acceptance Scenarios**:

1. **Given** 메타데이터가 없는 초기 상태, **When** 동기화 실행, **Then** 모든 메타 테이블에 데이터가 적재
2. **Given** 이미 메타데이터가 있는 상태, **When** 재동기화, **Then** upsert로 업데이트 (중복 없음)

---

### Edge Cases

- Nexon API가 429 (Rate Limit) 응답을 반환하면?
- spId 형식이 변경되면? (seasonId 자릿수 변경 등)
- 매치 상세에서 상대방 정보가 누락된 경우?
- 메타데이터 JSON이 비정상적으로 큰 경우? (spid.json ~수만 건)

## Requirements

### Functional Requirements

- **FR-001**: Nexon API의 모든 응답 타입에 대한 Zod 스키마가 정의되어야 한다
- **FR-002**: Zod 스키마에서 TypeScript 타입이 자동 추론되어야 한다 (`z.infer<typeof schema>`)
- **FR-003**: DB 테이블 스키마가 Supabase Migration으로 관리되어야 한다
- **FR-004**: 메타데이터 테이블은 Nexon static JSON과 동기화 가능해야 한다
- **FR-005**: 매치 데이터 캐시는 30일 갱신 의무를 추적할 수 있어야 한다
- **FR-006**: API 호출 시 Rate Limit 초과를 감지하고 재시도/큐잉이 가능해야 한다

### Key Entities

- **User**: ouid(PK), nickname, level. Nexon 유저 기본 정보
- **Match**: matchId(PK), matchDate, matchType. 매치 메타 정보
- **MatchDetail**: matchId(FK) + ouid(FK). 각 유저의 매치 상세 스탯
- **MatchPlayer**: matchId(FK) + ouid(FK) + spId. 매치 내 선수별 스탯
- **MatchShootDetail**: matchId(FK) + ouid(FK) + goalTime. 슈팅 상세
- **MetaPlayer**: spId(PK), name. 선수 메타
- **MetaSeason**: seasonId(PK), className, seasonImg. 시즌 메타
- **MetaMatchType**: matchtype(PK), desc. 매치 종류 메타
- **MetaPosition**: spposition(PK), desc. 포지션 메타
- **MetaDivision**: divisionId(PK), divisionName. 등급 메타
- **RankerStat**: matchType + spId + spPosition + createDate. 랭커 선수 스탯

## Success Criteria

- **SC-001**: 모든 Nexon API 엔드포인트에 대한 Zod 스키마가 존재하고, 실제 응답 예시로 테스트 통과
- **SC-002**: DB 스키마가 Supabase Migration으로 재현 가능
- **SC-003**: TypeScript에서 `any` 타입 없이 전체 데이터 흐름이 타입 안전

## Assumptions

- Nexon API 응답 구조는 공식 문서 기준 안정적이다 (breaking change 시 Zod 파싱 에러로 즉시 감지)
- spid.json 메타데이터는 수만 건이지만 전체 로드 가능한 크기이다
- Supabase Free Tier로 시작 (500MB DB, 50K MAU)

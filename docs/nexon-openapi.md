# Nexon FC Online OpenAPI 명세

> 공식 문서: https://openapi.nexon.com/ko/game/fconline/
> 스크래핑 일자: 2026-04-02 (Playwright 기반)

## 공통 사항

- **API Server**: `https://open.api.nexon.com`
- **이미지 Server**: `https://fco.dn.nexoncdn.co.kr`
- **인증**: HTTP Header `x-nxopen-api-key: {API_KEY}`
- **응답 형식**: `application/json`
- **데이터 갱신 주기**: 매시 정각, 2시간 전 게임 데이터 업데이트
  - 예: 오후 3시 5분 호출 → 오후 1시까지의 정보 조회 가능
- **주의**: 게임 콘텐츠 변경으로 ouid가 변경될 수 있음
- **크롤링 의무**: 크롤링 데이터는 30일 이내 갱신 필수

### Rate Limit

| 단계 | 초당 요청 | 일일 요청 |
|------|----------|----------|
| 개발 | 5건 | 1,000건 |
| 서비스 | 500건 | 20,000,000건 |

### 공통 에러 응답

```json
{
  "error": {
    "name": "string",
    "message": "string"
  }
}
```

| HTTP 상태 | 설명 |
|----------|------|
| 400 | Bad Request |
| 403 | Forbidden |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 1. 계정 정보 조회 (User)

### 1-1. 계정 식별자(ouid) 조회

```
GET /fconline/v1/id
```

닉네임으로 계정 식별자(ouid)를 조회합니다.

**Parameters**

| Name | Type | In | 필수 | Description |
|------|------|----|------|-------------|
| x-nxopen-api-key | string | header | Y | API KEY |
| nickname | string | query | Y | 닉네임 |

**Response 200**
```json
{
  "ouid": "string"
}
```

### 1-2. 기본 정보 조회

```
GET /fconline/v1/user/basic
```

**Parameters**

| Name | Type | In | 필수 | Description |
|------|------|----|------|-------------|
| x-nxopen-api-key | string | header | Y | API KEY |
| ouid | string | query | Y | 유저 고유 식별자 |

**Response 200**
```json
{
  "ouid": "string",
  "nickname": "닉네임",
  "level": 1
}
```

### 1-3. 역대 최고 등급 조회

```
GET /fconline/v1/user/maxdivision
```

**Parameters**

| Name | Type | In | 필수 | Description |
|------|------|----|------|-------------|
| x-nxopen-api-key | string | header | Y | API KEY |
| ouid | string | query | Y | 유저 고유 식별자 |

**Response 200**
```json
[
  {
    "matchType": 50,
    "division": 800,
    "achievementDate": "2024-01-01T00:00:00"
  }
]
```

### 1-4. 유저의 매치 기록 조회

```
GET /fconline/v1/user/match
```

유저의 매치 종류별 기록을 조회합니다. 가장 최근 플레이한 매치부터 내림차순. `offset`과 `limit`으로 pagination 가능.

**Parameters**

| Name | Type | In | 필수 | Description |
|------|------|----|------|-------------|
| x-nxopen-api-key | string | header | Y | API KEY |
| ouid | string | query | Y | 계정 식별자 |
| matchtype | integer | query | Y | 매치 종류 (/metadata/matchtype API 참고) |
| offset | integer | query | N | 리스트에서 가져올 시작 위치 |
| limit | integer | query | N | 리스트에서 가져올 갯수 (최대 100개) |

**Response 200**
```json
["64f0a0000a000c2518b00016"]
```

### 1-5. 유저의 거래 기록 조회

```
GET /fconline/v1/user/trade
```

거래 종류(`tradetype`)로 유저의 이적시장 거래 종류별 기록을 조회합니다. **(본인 거래 기록만 조회 가능)**

**Parameters**

| Name | Type | In | 필수 | Description |
|------|------|----|------|-------------|
| x-nxopen-api-key | string | header | Y | API KEY |
| tradetype | string | query | Y | 거래 종류 (`buy` 구입, `sell` 판매) |
| offset | integer | query | N | 리스트에서 가져올 시작 위치 |
| limit | integer | query | N | 리스트에서 가져올 갯수 (최대 100개) |

**Response 200**
```json
[
  {
    "tradeDate": "2023-12-14T09:55:45",
    "saleSn": "5dfecf50eff20f2468e00000",
    "spid": 298199236,
    "grade": 1,
    "value": 10000
  }
]
```

---

## 2. 매치 정보 조회 (Match)

### 2-1. 모든 매치 기록 조회

```
GET /fconline/v1/match
```

모든 매치의 종류별 기록을 조회합니다. 가장 최근 플레이한 매치부터 내림차순. `offset`과 `limit`으로 pagination 가능.

**Parameters**

| Name | Type | In | 필수 | Description |
|------|------|----|------|-------------|
| x-nxopen-api-key | string | header | Y | API KEY |
| matchtype | string | query | Y | 매치 종류 (/metadata/matchtype API 참고) |
| offset | integer | query | N | 리스트에서 가져올 시작 위치 |
| limit | integer | query | N | 리스트에서 가져올 갯수 (최대 100개) |
| orderby | string | query | N | 매치 기록의 정렬 순서 (`desc` 가장 최근 매치부터) |

**Response 200**
```json
["64f0a0000a000c2518b00016"]
```

### 2-2. 매치 상세 기록 조회

```
GET /fconline/v1/match-detail
```

매치 고유 식별자(`matchid`)로 매치의 상세 정보를 조회합니다.

> 매치 통계가 생성되기 전에 상대방이 매치를 종료할 경우, 상대방의 매치 정보가 보이지 않을 수도 있습니다.

**Parameters**

| Name | Type | In | 필수 | Description |
|------|------|----|------|-------------|
| x-nxopen-api-key | string | header | Y | API KEY |
| matchid | string | query | Y | 매치 고유 식별자 |

**Response 200**
```json
{
  "matchId": "64f0000c00007210005f0000",
  "matchDate": "2023-10-29T12:22:48",
  "matchType": 52,
  "matchInfo": [
    {
      "ouid": "string",
      "nickname": "닉네임",
      "matchDetail": {
        "seasonId": 202311,
        "matchResult": "승",
        "matchEndType": 0,
        "systemPause": 0,
        "foul": 0,
        "injury": 1,
        "redCards": 0,
        "yellowCards": 0,
        "dribble": 78,
        "cornerKick": 0,
        "possession": 46,
        "OffsideCount": 1,
        "averageRating": 1.18889,
        "controller": "keyboard"
      },
      "shoot": {
        "shootTotal": 3,
        "effectiveShootTotal": 3,
        "shootOutScore": 0,
        "goalTotal": 2,
        "goalTotalDisplay": 2,
        "ownGoal": 0,
        "shootHeading": 2,
        "goalHeading": 1,
        "shootFreekick": 0,
        "goalFreekick": 0,
        "shootInPenalty": 3,
        "goalInPenalty": 2,
        "shootOutPenalty": 0,
        "goalOutPenalty": 0,
        "shootPenaltyKick": 0,
        "goalPenaltyKick": 0
      },
      "shootDetail": [
        {
          "goalTime": 786,
          "x": 0.9499898435243544,
          "y": 0.4995435465846854,
          "type": 2,
          "result": 1,
          "spId": 272167135,
          "spGrade": 5,
          "spLevel": 5,
          "spIdType": true,
          "assist": false,
          "assistSpI": -1,
          "assistX": 0.5,
          "assistY": 0.5,
          "hitPost": false,
          "inPenalty": true
        }
      ],
      "pass": {
        "passTry": 92,
        "passSuccess": 83,
        "shortPassTry": 55,
        "shortPassSuccess": 55,
        "longPassTry": 3,
        "longPassSuccess": 3,
        "bouncingLobPassTry": 1,
        "bouncingLobPassSuccess": 0,
        "drivenGroundPassTry": 10,
        "drivenGroundPassSuccess": 10,
        "throughPassTry": 19,
        "throughPassSuccess": 14,
        "lobbedThroughPassTry": 4,
        "lobbedThroughPassSuccess": 1
      },
      "defence": {
        "blockTry": 3,
        "blockSuccess": 0,
        "tackleTry": 11,
        "tackleSuccess": 9
      },
      "player": [
        {
          "spId": 277205401,
          "spPosition": 28,
          "spGrade": 3,
          "status": {
            "shoot": 0,
            "effectiveShoot": 0,
            "assist": 0,
            "goal": 0,
            "dribble": 256,
            "intercept": 1,
            "defending": 0,
            "passTry": 12,
            "passSuccess": 11,
            "dribbleTry": 12,
            "dribbleSuccess": 11,
            "ballPossesionTry": 4,
            "ballPossesionSuc": 2,
            "aerialTry": 3,
            "aerialSuccess": 0,
            "blockTry": 0,
            "block": 0,
            "tackleTry": 1,
            "tackle": 1,
            "yellowCards": 0,
            "redCards": 0,
            "spRating": 6.4
          }
        }
      ]
    }
  ]
}
```

---

## 3. 랭커 정보 조회 (Ranker)

### 3-1. TOP 10,000 랭커 선수 스탯 조회

```
GET /fconline/v1/ranker-stats
```

TOP 10,000 랭커 유저가 사용한 선수의 20경기 평균 스탯을 조회합니다.

**Parameters**

| Name | Type | In | 필수 | Description |
|------|------|----|------|-------------|
| x-nxopen-api-key | string | header | Y | API KEY |
| matchtype | integer | query | Y | 매치 종류 |
| players | integer | query | Y | 선수 고유 식별자 (spid) |

**Response 200** *(스크래핑 시 상세 확장 안 됨 - 학습 데이터 기반 보완)*
```json
[
  {
    "matchType": 50,
    "players": [
      {
        "spId": 0,
        "spPosition": 0,
        "status": {
          "shoot": 0.0,
          "effectiveShoot": 0.0,
          "assist": 0.0,
          "goal": 0.0,
          "dribble": 0.0,
          "intercept": 0.0,
          "defending": 0.0,
          "passTry": 0.0,
          "passSuccess": 0.0,
          "dribbleTry": 0.0,
          "dribbleSuccess": 0.0,
          "ballPossesionTry": 0.0,
          "ballPossesionSuccess": 0.0,
          "aerialTry": 0.0,
          "aerialSuccess": 0.0,
          "blockTry": 0.0,
          "block": 0.0,
          "tackleTry": 0.0,
          "tackle": 0.0,
          "spRating": 0.0
        }
      }
    ],
    "createDate": "2024-01-01T00:00:00"
  }
]
```

---

## 4. 메타데이터 조회 (MetaData)

> 메타데이터는 static JSON으로 제공. 파라미터 없이 조회 가능.
> Base URL: `https://open.api.nexon.com`

### 4-1. 매치 종류 (matchtype)

```
GET /static/fconline/meta/matchtype.json
```

```json
[{ "matchtype": 30, "desc": "리그 친선" }]
```

### 4-2. 선수 고유 식별자 (spid)

```
GET /static/fconline/meta/spid.json
```

선수 고유 식별자는 **시즌 아이디(seasonid) 3자리 + 선수 아이디(pid) 6자리**로 구성.
시즌 아이디는 `/metadata/seasonid` API로 조회 가능.

```json
[{ "id": 100000051, "name": "앨런 시어러" }]
```

### 4-3. 시즌 아이디 (seasonId)

```
GET /static/fconline/meta/seasonid.json
```

시즌 아이디는 선수가 속한 클래스를 나타냅니다.

```json
[
  {
    "seasonId": 100,
    "className": "ICONTM (ICON The Moment)",
    "seasonImg": "https://ssl.nexon.com/s2/game/fc/online/obt/externalAssets/season/icontm.png"
  }
]
```

### 4-4. 선수 포지션 (spposition)

```
GET /static/fconline/meta/spposition.json
```

```json
[{ "spposition": 0, "desc": "GK" }]
```

### 4-5. 등급 식별자 (division)

```
GET /static/fconline/meta/division.json
```

```json
[{ "divisionId": 800, "divisionName": "슈퍼챔피언스" }]
```

### 4-6. 볼타 등급 식별자 (division-volta)

```
GET /static/fconline/meta/division-volta.json
```

```json
[{ "divisionId": 1100, "divisionName": "월드 스타" }]
```

---

## 5. 이미지 리소스 (Image)

> Server: `https://fco.dn.nexoncdn.co.kr`
> API Key 불필요. 특정 선수들은 이미지가 존재하지 않을 수 있음.

### 5-1. 선수 액션샷 이미지 (spid)

```
GET /live/externalAssets/common/playersAction/p{spid}.png
```

| Parameter | Type | In | Description |
|-----------|------|----|-------------|
| spid | integer | path | 선수 고유 식별자 |

### 5-2. 선수 액션샷 이미지 (pid)

```
GET /live/externalAssets/common/playersAction/p{pid}.png
```

| Parameter | Type | In | Description |
|-----------|------|----|-------------|
| pid | integer | path | 선수 식별자 (spid 뒤 6자리) |

### 5-3. 선수 이미지 (spid)

```
GET /live/externalAssets/common/players/p{spid}.png
```

| Parameter | Type | In | Description |
|-----------|------|----|-------------|
| spid | integer | path | 선수 고유 식별자 |

### 5-4. 선수 이미지 (pid)

```
GET /live/externalAssets/common/players/p{pid}.png
```

> pid가 "0"으로 시작하는 경우, 시작 부분의 0을 모두 제외해야 정상 조회 가능 (ex. "000401" → "401")

| Parameter | Type | In | Description |
|-----------|------|----|-------------|
| pid | integer | path | 선수 식별자 (spid 뒤 6자리) |

---

## API 엔드포인트 요약

| Category | Method | Path | Description |
|----------|--------|------|-------------|
| User | GET | `/fconline/v1/id` | 계정 식별자(ouid) 조회 |
| User | GET | `/fconline/v1/user/basic` | 기본 정보 조회 |
| User | GET | `/fconline/v1/user/maxdivision` | 역대 최고 등급 조회 |
| User | GET | `/fconline/v1/user/match` | 유저 매치 기록 조회 |
| User | GET | `/fconline/v1/user/trade` | 유저 거래 기록 조회 |
| Match | GET | `/fconline/v1/match` | 모든 매치 기록 조회 |
| Match | GET | `/fconline/v1/match-detail` | 매치 상세 기록 조회 |
| Ranker | GET | `/fconline/v1/ranker-stats` | TOP 10,000 랭커 선수 스탯 |
| MetaData | GET | `/static/fconline/meta/matchtype.json` | 매치 종류 |
| MetaData | GET | `/static/fconline/meta/spid.json` | 선수 고유 식별자 |
| MetaData | GET | `/static/fconline/meta/seasonid.json` | 시즌 아이디 |
| MetaData | GET | `/static/fconline/meta/spposition.json` | 선수 포지션 |
| MetaData | GET | `/static/fconline/meta/division.json` | 등급 식별자 |
| MetaData | GET | `/static/fconline/meta/division-volta.json` | 볼타 등급 식별자 |
| Image | GET | `/live/externalAssets/common/playersAction/p{spid}.png` | 액션샷 (spid) |
| Image | GET | `/live/externalAssets/common/playersAction/p{pid}.png` | 액션샷 (pid) |
| Image | GET | `/live/externalAssets/common/players/p{spid}.png` | 선수 이미지 (spid) |
| Image | GET | `/live/externalAssets/common/players/p{pid}.png` | 선수 이미지 (pid) |

# pos-api-app

POS 連携 API のインフラです。デモでは **synth（ルール検査）のみ** で、デプロイはしません。
ダッシュボードと同じ部品（`ApiService`）を、画面なし・専用 DB を新規作成する設定で使う例です。画面がないので、入口（CloudFront）はすべてを API へ流します。

```bash
aws codeartifact login --tool npm --domain acme --repository platform --namespace acme
cd infra && npm install          # 初回は package-lock.json がここで作られるのでコミットする
npx cdk synth '**' --quiet
npx acme-checksheet
npm ls @acme/platform            # デモ3：このチームは前の版（1.0.0）のまま
```

アプリ本体はまだないため、コンテナイメージは仮に nginx を指定しています。

検証・本番は synth だけで AWS に VPC を作っていないため、`infra/cdk.context.json` の `acme-stg`・`acme-prod` の VPC は lookup の結果を固定した仮の値です（開発環境の値を写して ID と CIDR を変えたもの）。

## 部品の版を上げる

```bash
cd infra
scripts/upgrade-platform.sh 1.1.0
```

ブランチを切って版を固定で入れ、synth とチェックシートで確かめてから PR を作ります。取り込む時期はこのチームが決めます。

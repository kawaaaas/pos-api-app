#!/usr/bin/env node
// =====================================================================================
// 【デモ1／基準1 期限】見ていただく点③ 別のチームも、同じ部品を使う（ダッシュボードの app.ts と2分割で並べる）
//   ・POS 連携のチームも、同じ ApiService を使う。違うのは「画面がない（site なし）」「専用のDBを作る（db: 'new'）」だけ。
//   ・専用のDBは、部品が暗号化（INF-12）して作る。アプリ側は暗号化を書いていない。
//   ・スペック（CPU・メモリ・タスク数）は環境ごとの既定値が入る。サービスの事情に合わせて、必要な項目だけ上書きできる。
//     POS は全店の締めの時間に負荷が集中するので、本番だけ大きくしている（下の「本番環境」）。
//     上書きしても、検査のルール（検証・本番は2タスク以上など）はそのままかかる。
//   ・サービスが増えても、インフラ側の作業は増えない（新サービス 15人日 → 約2人日）。
//
// 【デモ3／基準3 今後の拡大】見ていただく点③ 取り込む時期は、各チームが選べる
//   ・package.json の @acme/platform は 1.0.0 のまま。ダッシュボードが 1.1.0 を取り込んでも、このチームは前の版で動き続ける。
//   ・部品の更新に合わせて全チームが一斉に止まる、ということがない。
// =====================================================================================
import { ApiService, PlatformStage } from '@acme/platform';
import { App, aws_ecs as ecs } from 'aws-cdk-lib';

/**
 * POS 連携 API（デモでは synth のみ。デプロイしない）
 * 店舗の POS からは本来 VPN 経由で接続する想定（デモの範囲外）。
 */
const app = new App();
const image = ecs.ContainerImage.fromRegistry('public.ecr.aws/nginx/nginx:stable'); // アプリ本体は仮

// 開発環境 ─ 【デモ1 ③】ダッシュボードの開発環境と並べて、違いを指す
const dev = new PlatformStage(app, 'Dev', { envType: 'dev' });
new ApiService(dev, 'PosApi', {
  service: 'pos',
  image,
  db: 'new', //   ダッシュボードとの違い①：このサービス専用のDBを作る
}); //            ダッシュボードとの違い②：site がない ＝ 画面なし。入口はすべてを API へ流す

// 検証環境 ─ 何も書かなければ、検証環境の既定値（0.25 vCPU・512MiB・2タスク・Multi-AZ）
const stg = new PlatformStage(app, 'Stg', { envType: 'stg' });
new ApiService(stg, 'PosApi', {
  service: 'pos',
  image,
  db: 'new',
});

// 本番環境 ─ 【デモ1 ③】既定値（0.5 vCPU・1GiB・2〜4タスク）から、必要な項目だけ上書きする
const prod = new PlatformStage(app, 'Prod', { envType: 'prod' });
new ApiService(prod, 'PosApi', {
  service: 'pos',
  image,
  db: 'new',
  cpu: 1024, //      1 vCPU（締めの時間の集計に合わせて）
  memoryMiB: 2048, // 2 GiB
  minTasks: 3, //    いつも3タスク。1つ落ちても余裕を残す
  maxTasks: 12, //   締めの時間は12タスクまで増やす
});

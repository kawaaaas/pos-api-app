#!/usr/bin/env node
// =====================================================================================
// 【デモ1／基準1 期限】見ていただく点③ 別のチームも、同じ部品を使う（ダッシュボードの app.ts と2分割で並べる）
//   ・POS 連携のチームも、同じ ApiService を使う。違うのは「画面がない（site なし）」「専用のDBを作る（db: 'new'）」だけ。
//   ・専用のDBは、部品が暗号化（INF-12）して作る。アプリ側は暗号化を書いていない。
//   ・サービスが増えても、インフラ側の作業は増えない（新サービス 15人日 → 約2人日）。
//
// 【デモ3／基準3 今後の拡大】見ていただく点③ 取り込む時期は、各チームが選べる
//   ・npm ls @acme/platform → 1.0.0 のまま。ダッシュボードが 1.1.0 を取り込んでも、このチームは前の版で動き続ける。
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

// 検証環境
const stg = new PlatformStage(app, 'Stg', { envType: 'stg' });
new ApiService(stg, 'PosApi', {
  service: 'pos',
  image,
  db: 'new',
});

// 本番環境
const prod = new PlatformStage(app, 'Prod', { envType: 'prod' });
new ApiService(prod, 'PosApi', {
  service: 'pos',
  image,
  db: 'new',
});

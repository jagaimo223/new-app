■サービス概要

プラモデルの画像を使って部分的なカラー変更を行って塗装後の完成イメージをシミュレートする。そして完成イメージに近い色の塗料を検索する機能をつける。

■このサービスへの思い・作りたい理由

プラモデル制作が好きなのですが、オリジナルのカラーリングをした際、とくに色の塗分けの部分でどんなイメージになるのか大体でしか把握できないので、こういったアプリがあると便利かなと思いました。

■ユーザー層について

対象: 仕事や趣味などでプラモデルやミニチュアを作る人など。

理由: 自分自身が好きなものなのでユーザーとしての意見も持てるし、アプリを制作する上で熱量を持って取り組めるため。

■サービスの利用イメージ

ユーザーがプラモデルの画像の色を好きなように変更して完成後の具体的なイメージを持つことができる。

選択した色に対応する塗料を検索できる。

塗料のマスターデータ:

自身で用意する形。

リリース段階ではMrカラーの公式サイトの基本色（C1～C189）を使用予定。

■ユーザーの獲得について

SNSでのデモや使用法の動画。

■サービスの差別化ポイント・推しポイント

色を変更するようなアプリは現状あるが、塗料を検索するようなものは自分が調べた限りではない。

追加機能案: クリア塗装の仕上がり方も実装を目指す。

■機能候補

MVPリリース段階

アップロードされた画像の色の変更。

塗料の検索機能。

本リリース

領域マスキング機能。

データ保存機能（カラー履歴など）。

塗料DB（残りのC189まで対応）。

■機能の実装方針予定

1. 画像変更

MiniMagick

メソッド:

colorize: カラー変更。

2. 近い塗料の検索

Pickrとfuzzy_match

Pickr メソッド:

create: カラーピッカーを作成。

on: HEX値を取得。

fuzzy_match メソッド:

find: 配列から近い値を検索。

read: HEX値を指定。

3. 領域のマスキング

OpenCV

メソッド:

inRange: マスクを作成。

findContours: 輪郭を検出。

bitwise_and: 画像を切り出す。

MVPリリース段階での実装機能

ユーザー認証。

カラーピッカー。

塗料DB（C1～C30まで）。

色の検索機能。

画像全体のカラー変更。

色選択後の結果（プレビュー）。

本リリースでの追加機能

領域マスキング。

データ保存機能（カラー履歴など）。

塗料DBの拡張（C1～C189まで対応）。


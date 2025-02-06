FROM ruby:3.2.2

# 必要なパッケージをインストール
RUN apt-get update -qq && apt-get install -y nodejs yarn mariadb-client imagemagick

# 作業ディレクトリの設定
WORKDIR /app

# Gemfile をコピー
COPY Gemfile Gemfile.lock /app/

# Bundler のアップデートとインストール
RUN gem install bundler && bundle install

# Rails をインストール
RUN gem install rails

# アプリのソースコードをコピー
COPY . /app

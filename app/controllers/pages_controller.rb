class PagesController < ApplicationController
  def home
    @ogp_title = "ホームページのOGPタイトル"
    @ogp_description = "ホームページのOGP説明文"
    @ogp_image = "#{request.base_url}/ogp/123.png"
  end
end

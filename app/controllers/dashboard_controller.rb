class DashboardController < ApplicationController
  before_action :require_login
  require "open-uri"
  require "mini_magick"

  def index
    @user = current_user
  end

  def upload_images
    @user = current_user
  
    if params[:canvas_image].present?
      image_data = params[:canvas_image]
      image_data = image_data.sub(/^data:image\/png;base64,/, "")
      file_path = "#{Rails.root}/tmp/uploaded_#{SecureRandom.hex}.png"
  
      File.open(file_path, 'wb') do |file|
        file.write(Base64.decode64(image_data))
      end
  
      @user.images.attach(io: File.open(file_path), filename: "processed_image.png", content_type: "image/png")
  
      flash[:notice] = "画像をアップロードしました"
    elsif params[:images].present?
      @user.images.attach(params[:images])
      flash[:notice] = "画像をアップロードしました"
    else
      flash[:alert] = "画像を選択してください"
    end
  
    redirect_to dashboard_path
  end
end